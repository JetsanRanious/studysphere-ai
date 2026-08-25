import json
import re
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.services.vector_service import VectorService

class AIService:
    @staticmethod
    async def generate_chat_response(
        prompt: str,
        context_chunks: List[Dict[str, Any]] = [],
        room_name: Optional[str] = None,
        doc_title: Optional[str] = None,
        provider: str = "auto",
        openai_api_key: Optional[str] = None,
        openai_model: str = "gpt-4o"
    ) -> Dict[str, Any]:
        """
        Supports OpenAI (ChatGPT), Ollama, and StudySphere Local Heuristics Engine.
        """
        context_str = ""
        sources = []
        
        if context_chunks:
            context_pieces = []
            for idx, c in enumerate(context_chunks):
                sources.append({
                    "chunk_id": c.get("chunk_id"),
                    "document_id": c.get("document_id"),
                    "page_number": c.get("page_number"),
                    "excerpt": c.get("content", "")[:180] + "..."
                })
                context_pieces.append(f"[Source {idx+1} | Page {c.get('page_number', 'N/A')}]:\n{c.get('content', '')}")
            context_str = "\n\n".join(context_pieces)

        system_instruction = (
            "You are StudySphere AI, an expert academic assistant. "
            "Help the student understand concepts clearly, provide structured explanations, "
            "and cite facts accurately from provided course materials when available."
        )

        full_prompt = f"{system_instruction}\n\n"
        if room_name:
            full_prompt += f"Study Room Context: {room_name}\n"
        if doc_title:
            full_prompt += f"Active Document: {doc_title}\n"
        if context_str:
            full_prompt += f"RELEVANT STUDY MATERIAL CONTEXT:\n{context_str}\n\n"
        
        full_prompt += f"Student Question: {prompt}\n\nAnswer concisely with clear bullet points and helpful explanations:"

        # 1. Try OpenAI / ChatGPT if requested or configured
        if (provider == "openai" or openai_api_key) and openai_api_key:
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    res = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {openai_api_key}"},
                        json={
                            "model": openai_model or "gpt-4o",
                            "messages": [
                                {"role": "system", "content": system_instruction},
                                {"role": "user", "content": full_prompt}
                            ],
                            "temperature": 0.3
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        resp_text = data["choices"][0]["message"]["content"]
                        return {
                            "response": resp_text.strip(),
                            "sources": sources,
                            "model_used": f"OpenAI ChatGPT ({openai_model})"
                        }
            except Exception:
                pass

        # 2. Try Ollama LLM
        if provider in ["auto", "ollama"]:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    res = await client.post(
                        f"{settings.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": settings.OLLAMA_MODEL,
                            "prompt": full_prompt,
                            "stream": False
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        return {
                            "response": data.get("response", "").strip(),
                            "sources": sources,
                            "model_used": f"Ollama ({settings.OLLAMA_MODEL})"
                        }
            except Exception:
                pass

        # 3. Fallback intelligent academic response generator
        response_text = AIService._generate_fallback_chat(prompt, context_chunks, doc_title, room_name)
        return {
            "response": response_text,
            "sources": sources,
            "model_used": "StudySphere AI Engine (Local Mode)"
        }

    @staticmethod
    def _generate_fallback_chat(prompt: str, chunks: List[Dict[str, Any]], doc_title: Optional[str], room_name: Optional[str]) -> str:
        """Constructs an intelligent answer when LLM is in local mode."""
        prompt_lower = prompt.lower()
        
        if chunks:
            top_chunk = chunks[0].get("content", "")
            words = set(re.findall(r'\w{3,}', prompt_lower))
            sentences = [s.strip() for s in re.split(r'\.|\n', top_chunk) if s.strip()]
            matched = [s for s in sentences if any(w in s.lower() for w in words)]
            
            highlight = "\n• ".join(matched[:4]) if matched else "\n• ".join(sentences[:3])
            
            return (
                f"### Analysis from {doc_title or 'Study Material'}\n\n"
                f"Based on your uploaded course material, here are the key insights regarding **{prompt}**:\n\n"
                f"• {highlight}\n\n"
                f"**Key Takeaway:** Make sure to review the foundational principles and how they connect to the rest of the {room_name or 'subject'} syllabus."
            )
        
        if "iam" in prompt_lower or "identity" in prompt_lower:
            return (
                "### Identity & Access Management (IAM) Overview\n\n"
                "**Identity and Access Management (IAM)** is a security framework ensuring appropriate individuals possess proper access to technology resources.\n\n"
                "**Core Components:**\n"
                "• **Identification:** Verifying who the user is (e.g. usernames, biometrics).\n"
                "• **Authentication:** Validating user identity (e.g. passwords, MFA, OAuth tokens).\n"
                "• **Authorization (RBAC):** Determining permissions and resource scopes.\n"
                "• **Auditing:** Tracking access logs for compliance and anomaly detection.\n\n"
                "💡 *Study Tip: Remember the principle of Least Privilege (PoLP) for your exams.*"
            )
        elif "exam" in prompt_lower or "revise" in prompt_lower or "quiz" in prompt_lower:
            return (
                f"### Key Revision Topics for {room_name or 'this Subject'}\n\n"
                "1. **Core Terminology & Definitions:** Ensure you can define the primary protocols, models, and architectures.\n"
                "2. **Comparative Analysis:** Be prepared for questions comparing different mechanisms and tradeoffs.\n"
                "3. **Practical Problem Solving:** Review sample case studies, diagrams, and numerical problems.\n"
                "4. **Security & Best Practices:** Always link theoretical concepts with real-world implementation safeguards."
            )
        else:
            return (
                f"### StudySphere Response on: {prompt}\n\n"
                f"Here is a structured overview of your query regarding **{prompt}**:\n\n"
                "• **Core Concept:** Understanding the underlying principles and definitions.\n"
                "• **Key Mechanisms:** How different components interact in the overall architecture.\n"
                "• **Practical Application:** Typical use-cases, industry standards, and exam focus points.\n\n"
                "*(Note: You can connect ChatGPT / OpenAI API or local Ollama in Settings).* "
            )

    @staticmethod
    async def generate_summary(text: str, summary_type: str = "key_concepts") -> Dict[str, Any]:
        prompt = (
            f"Generate a high-quality {summary_type} study summary of the following material:\n\n"
            f"{text[:3000]}\n\n"
            "Format with Markdown headers, bullet points, and high-yield takeaways."
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
                )
                if res.status_code == 200:
                    resp_text = res.json().get("response", "")
                    return {
                        "summary": resp_text,
                        "key_takeaways": [line.strip("- •") for line in resp_text.split("\n") if line.strip().startswith(("-", "•"))][:6]
                    }
        except Exception:
            pass

        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
        summary_body = "\n\n".join([f"**Key Point {i+1}:** {p}" for i, p in enumerate(paragraphs[:4])])
        if not summary_body:
            summary_body = "**Summary Overview:** Comprehensive overview of uploaded study materials covering theoretical definitions, core mechanisms, and practical applications."

        takeaways = [
            "Master foundational terms and architectural components.",
            "Review practical trade-offs between efficiency and security.",
            "Practice applying concepts to real-world scenario problems.",
            "Consolidate notes into flashcards for spaced repetition."
        ]

        return {
            "summary": f"### Executive Study Summary\n\n{summary_body}\n\n### Exam Preparation Focus\nEnsure you understand the core mechanics and can explain them in structured bullet points.",
            "key_takeaways": takeaways
        }

    @staticmethod
    async def generate_quiz(text: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        prompt = (
            f"Create {num_questions} multiple-choice quiz questions based on this study text:\n"
            f"{text[:2500]}\n\n"
            "Output MUST be valid JSON matching this format:\n"
            "["
            "  {\"question\": \"Question text?\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correct_answer_index\": 0, \"explanation\": \"Why option A is correct\"}"
            "]"
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "format": "json", "stream": False}
                )
                if res.status_code == 200:
                    content = res.json().get("response", "")
                    quiz_data = json.loads(content)
                    if isinstance(quiz_data, list) and len(quiz_data) > 0:
                        return quiz_data[:num_questions]
        except Exception:
            pass

        return [
            {
                "question": "What is the primary objective of the Principle of Least Privilege (PoLP)?",
                "options": [
                    "Granting users only the minimum permissions necessary to complete their duties",
                    "Ensuring all database passwords are changed every 24 hours",
                    "Disabling all outbound network firewall traffic",
                    "Allowing complete administrator access across all cloud subnets"
                ],
                "correct_answer_index": 0,
                "explanation": "PoLP limits access rights for users to the bare minimum permissions required to perform their authorized work, minimizing security attack vectors."
            },
            {
                "question": "In Role-Based Access Control (RBAC), how are permissions assigned to users?",
                "options": [
                    "Directly to each user individually on every file",
                    "To roles, which are subsequently assigned to users based on job functions",
                    "Randomly based on IP subnet ranges",
                    "Through unencrypted plaintext configuration scripts"
                ],
                "correct_answer_index": 1,
                "explanation": "In RBAC, access decisions are based on the roles that individual users have as part of an organization, simplifying access management."
            },
            {
                "question": "Which of the following is considered an essential factor in Multi-Factor Authentication (MFA)?",
                "options": [
                    "Something you know, something you have, and something you are",
                    "A username, email address, and home address",
                    "A strong font, uppercase letters, and ASCII symbols",
                    "Operating system version, RAM size, and CPU model"
                ],
                "correct_answer_index": 0,
                "explanation": "MFA requires two or more distinct authentication categories: knowledge (password/PIN), possession (hardware key/authenticator app), or inherence (biometrics)."
            },
            {
                "question": "What is the key advantage of Retrieval-Augmented Generation (RAG) over vanilla LLMs?",
                "options": [
                    "It eliminates the need for any programming code",
                    "It retrieves verified, up-to-date domain documents to ground AI responses and minimize hallucinations",
                    "It increases token processing speeds by 1000x without computation",
                    "It removes the need for vector databases"
                ],
                "correct_answer_index": 1,
                "explanation": "RAG pulls relevant context from specific uploaded knowledge bases, providing factual citations and reducing hallucinations."
            },
            {
                "question": "How does spaced repetition enhance long-term memory retention?",
                "options": [
                    "By reviewing material at increasing time intervals just before forgetting occurs",
                    "By cramming all subjects continuously without taking any breaks",
                    "By reading entire textbooks backwards",
                    "By memorizing only the first page of every chapter"
                ],
                "correct_answer_index": 0,
                "explanation": "Spaced repetition leverages the spacing effect to strengthen neural pathways by recalling information at scientifically timed intervals."
            }
        ]

    @staticmethod
    async def generate_study_plan(
        prompt: str, 
        available_daily_hours: float = 4.0,
        openai_api_key: Optional[str] = None,
        openai_model: Optional[str] = "gpt-4o"
    ) -> List[Dict[str, Any]]:
        if openai_api_key:
            try:
                sys_msg = (
                    "You are StudySphere AI, an expert academic planner. Generate a 7-day study schedule based on the user's prompt.\n"
                    "Output MUST be valid JSON containing an array of objects. Do not include markdown code blocks or any other text, JUST the JSON array.\n"
                    "Each task object MUST have these exact fields:\n"
                    "- title: string (short, actionable)\n"
                    "- subject: string\n"
                    "- day: string (Monday, Tuesday, etc.)\n"
                    "- day_offset: integer (0 for Monday, 6 for Sunday)\n"
                    "- start_time: string (HH:MM format)\n"
                    "- end_time: string (HH:MM format)\n"
                    "- estimated_minutes: integer (usually 30 to 90)\n"
                    "- priority: string ('high', 'medium', 'low')\n"
                    "- description: string (brief study instructions)"
                )
                user_msg = f"User Request: {prompt}\nAvailable Hours/Day: {available_daily_hours}\nGenerate the JSON array schedule now."
                
                async with httpx.AsyncClient(timeout=25.0) as client:
                    res = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {openai_api_key}"},
                        json={
                            "model": openai_model or "gpt-4o",
                            "messages": [
                                {"role": "system", "content": sys_msg},
                                {"role": "user", "content": user_msg}
                            ],
                            "temperature": 0.3
                        }
                    )
                    if res.status_code == 200:
                        content = res.json()["choices"][0]["message"]["content"]
                        # Strip markdown if present
                        content = content.strip()
                        if content.startswith("```json"):
                            content = content.replace("```json", "", 1)
                        if content.endswith("```"):
                            content = content[:-3]
                        
                        tasks = json.loads(content.strip())
                        if isinstance(tasks, list) and len(tasks) > 0:
                            return tasks
            except Exception as e:
                print(f"OpenAI Plan Error: {e}")
                pass

        subjects = []
        if "cloud" in prompt.lower():
            subjects.append("Cloud Security")
        if "crypto" in prompt.lower():
            subjects.append("Cryptography")
        if "network" in prompt.lower():
            subjects.append("Network Security")
        if "data structure" in prompt.lower() or "dsa" in prompt.lower():
            subjects.append("Data Structures")
        if "operating" in prompt.lower() or "os" in prompt.lower():
            subjects.append("Operating Systems")
            
        if not subjects:
            subjects = ["Cloud Security", "Cryptography", "Network Security"]

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        tasks = []
        
        topics_map = {
            "Cloud Security": ["IAM Architecture & Policies", "Container Security & Docker", "VPC & Cloud Firewalls", "Cloud Compliance & Auditing"],
            "Cryptography": ["AES & Symmetric Ciphers", "RSA & Public Key Infrastructure", "Hash Functions & SHA-256", "Zero-Knowledge Proofs"],
            "Network Security": ["Firewalls & Packet Filtering", "IDS/IPS Deep Inspection", "VPNs & IPsec Protocols", "TLS/SSL Handshake Flow"],
            "Data Structures": ["Balanced Trees & AVL", "Graph Traversal (BFS/DFS)", "Dynamic Programming Patterns", "Tries & String Algorithms"],
            "Operating Systems": ["Process Synchronization & Mutex", "Virtual Memory & Paging", "File System Inodes", "CPU Scheduling Algorithms"]
        }

        task_id_counter = 1
        for day_idx, day in enumerate(days):
            subject1 = subjects[day_idx % len(subjects)]
            subject2 = subjects[(day_idx + 1) % len(subjects)]
            
            topic1 = topics_map.get(subject1, ["Core Concepts", "Problem Solving"])[day_idx % 4]
            topic2 = topics_map.get(subject2, ["Review", "Practice Questions"])[(day_idx + 1) % 4]

            tasks.append({
                "id": task_id_counter,
                "day": day,
                "day_offset": day_idx,
                "title": f"{subject1}: {topic1}",
                "subject": subject1,
                "start_time": "09:00",
                "end_time": "10:30",
                "estimated_minutes": 90,
                "priority": "high" if day_idx < 3 else "medium",
                "description": f"Master {topic1} fundamentals, read textbook chapters, and take active recall notes."
            })
            task_id_counter += 1

            tasks.append({
                "id": task_id_counter,
                "day": day,
                "day_offset": day_idx,
                "title": f"{subject2}: {topic2}",
                "subject": subject2,
                "start_time": "11:00",
                "end_time": "12:15",
                "estimated_minutes": 75,
                "priority": "medium",
                "description": f"Solve problem sets on {topic2} and generate flashcards."
            })
            task_id_counter += 1

            if day_idx in [0, 2, 4, 5]:
                tasks.append({
                    "id": task_id_counter,
                    "day": day,
                    "day_offset": day_idx,
                    "title": f"Review & Practice Quiz: {subject1}",
                    "subject": subject1,
                    "start_time": "17:00",
                    "end_time": "18:00",
                    "estimated_minutes": 60,
                    "priority": "low" if day_idx > 4 else "medium",
                    "description": "Take 10 practice MCQs and review incorrect questions."
                })
                task_id_counter += 1

        return tasks
