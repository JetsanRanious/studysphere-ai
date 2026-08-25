import math
import re
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

class VectorService:
    @staticmethod
    async def get_embedding(text: str) -> Optional[List[float]]:
        """
        Attempts to generate embedding via Ollama embedding API.
        If Ollama is unavailable, returns a normalized TF-IDF term vector representation.
        """
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                    json={"model": settings.OLLAMA_EMBED_MODEL, "prompt": text[:1000]}
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("embedding")
        except Exception:
            pass
        
        # Fallback: Generate lightweight hash-based term frequency embedding (dimension: 64)
        return VectorService._generate_fallback_vector(text)

    @staticmethod
    def _generate_fallback_vector(text: str, dim: int = 64) -> List[float]:
        """Generates deterministic pseudo-semantic vector representation for fallback."""
        words = re.findall(r'\w+', text.lower())
        vec = [0.0] * dim
        if not words:
            return vec
        for w in words:
            h = hash(w) % dim
            vec[h] += 1.0
        
        # Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [round(x / norm, 5) for x in vec]
        return vec

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calculates cosine similarity between two vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm_a = math.sqrt(sum(a * a for a in v1))
        norm_b = math.sqrt(sum(b * b for b in v2))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    @staticmethod
    def search_similar_chunks(query: str, query_vec: Optional[List[float]], chunks: List[Any], top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Ranks chunks using hybrid score (vector cosine similarity + keyword matching).
        """
        query_words = set(re.findall(r'\w{3,}', query.lower()))
        results = []

        for chunk in chunks:
            content = chunk.content if hasattr(chunk, 'content') else chunk.get('content', '')
            embedding = chunk.embedding_json if hasattr(chunk, 'embedding_json') else chunk.get('embedding_json')
            page_num = chunk.page_number if hasattr(chunk, 'page_number') else chunk.get('page_number')
            doc_id = chunk.document_id if hasattr(chunk, 'document_id') else chunk.get('document_id')
            
            # Keyword score
            chunk_words = set(re.findall(r'\w{3,}', content.lower()))
            overlap = len(query_words.intersection(chunk_words))
            kw_score = overlap / max(len(query_words), 1)

            # Vector score
            sim_score = 0.0
            if query_vec and embedding and len(query_vec) == len(embedding):
                sim_score = VectorService.cosine_similarity(query_vec, embedding)
                
            combined_score = 0.6 * sim_score + 0.4 * kw_score

            results.append({
                "chunk_id": chunk.id if hasattr(chunk, 'id') else None,
                "document_id": doc_id,
                "page_number": page_num,
                "content": content,
                "score": combined_score
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
