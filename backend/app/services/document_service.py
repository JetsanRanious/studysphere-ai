import os
import re
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
import docx

class DocumentService:
    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """
        Extracts text from PDF, DOCX, or TXT file.
        Returns a list of pages/sections with page_number and text.
        """
        file_type = file_type.lower().strip(".")
        pages = []
        
        if file_type == "pdf":
            try:
                reader = PdfReader(file_path)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    clean = DocumentService.clean_text(text)
                    if clean:
                        pages.append({"page_number": idx + 1, "text": clean})
            except Exception as e:
                # If binary corrupted or parsing error, fallback to text read
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = DocumentService.clean_text(f.read())
                    pages.append({"page_number": 1, "text": text})
                    
        elif file_type in ["docx", "doc"]:
            try:
                doc = docx.Document(file_path)
                full_text = []
                for p in doc.paragraphs:
                    if p.text.strip():
                        full_text.append(p.text.strip())
                clean = DocumentService.clean_text("\n".join(full_text))
                pages.append({"page_number": 1, "text": clean})
            except Exception as e:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = DocumentService.clean_text(f.read())
                    pages.append({"page_number": 1, "text": text})
                    
        else:  # txt or default
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = DocumentService.clean_text(f.read())
                pages.append({"page_number": 1, "text": text})
                
        return pages

    @staticmethod
    def clean_text(text: str) -> str:
        """Cleans and standardizes raw text."""
        if not text:
            return ""
        # Normalize whitespace
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n\s*\n+', '\n\n', text)
        return text.strip()

    @staticmethod
    def chunk_text(pages: List[Dict[str, Any]], chunk_size: int = 600, chunk_overlap: int = 100) -> List[Dict[str, Any]]:
        """
        Splits text into chunks with overlap, preserving page references.
        """
        chunks = []
        chunk_idx = 0
        
        for p in pages:
            page_num = p["page_number"]
            text = p["text"]
            
            if not text:
                continue
                
            # Paragraph-aware splitting
            paragraphs = text.split("\n\n")
            current_chunk = ""
            
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                    
                if len(current_chunk) + len(para) <= chunk_size:
                    current_chunk += ("\n\n" + para if current_chunk else para)
                else:
                    if current_chunk:
                        chunks.append({
                            "chunk_index": chunk_idx,
                            "content": current_chunk.strip(),
                            "page_number": page_num,
                            "token_count": len(current_chunk.split())
                        })
                        chunk_idx += 1
                        
                        # Retain overlap from end of current_chunk
                        overlap_words = current_chunk.split()[-20:]
                        current_chunk = " ".join(overlap_words) + "\n\n" + para
                    else:
                        # Para itself is larger than chunk_size, split by sentences or words
                        words = para.split()
                        sub_chunk = ""
                        for w in words:
                            if len(sub_chunk) + len(w) <= chunk_size:
                                sub_chunk += (" " + w if sub_chunk else w)
                            else:
                                chunks.append({
                                    "chunk_index": chunk_idx,
                                    "content": sub_chunk.strip(),
                                    "page_number": page_num,
                                    "token_count": len(sub_chunk.split())
                                })
                                chunk_idx += 1
                                sub_chunk = w
                        current_chunk = sub_chunk
                        
            if current_chunk:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": current_chunk.strip(),
                    "page_number": page_num,
                    "token_count": len(current_chunk.split())
                })
                chunk_idx += 1
                
        return chunks
