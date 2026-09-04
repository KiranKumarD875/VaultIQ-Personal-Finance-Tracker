import os
from groq import Groq

class RAGService:
    def __init__(self):
        api_key = os.environ.get("GROQ_API_KEY", "")
        if not api_key:
            print("⚠️  GROQ_API_KEY not set. AI responses will be disabled.", flush=True)
            self.client = None
        else:
            self.client = Groq(api_key=api_key)
            print("✅ Groq AI client initialised (llama-3.1-8b-instant).", flush=True)

    @property
    def is_ready(self) -> bool:
        return self.client is not None

    def query(self, user_query: str, context_texts: list[str], history: list[dict] = None) -> str:
        if not self.is_ready:
            return (
                "VaultMind AI is not configured. "
                "Please set the GROQ_API_KEY environment variable on Render."
            )

        # Build the full financial context string
        context = "\n".join(context_texts) if context_texts else ""

        system_prompt = (
            "You are VaultMind, an intelligent and friendly AI financial assistant for VaultIQ. "
            "You MUST strictly use ONLY the following Financial Context to answer the user's question. "
            "Quote the exact numbers from the context — do NOT make up, guess, or hallucinate any figures. "
            "Keep answers concise, clear, and friendly. "
            "If the answer cannot be found in the context, say: "
            "\"I don't have enough data to answer that right now.\"\n\n"
            f"=== Financial Context ===\n{context}\n=== End of Context ==="
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Append last 5 conversation turns for context continuity
        if history:
            for msg in history[-5:]:
                role = "user" if msg.get("sender") == "user" else "assistant"
                content = msg.get("text", "")
                if content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_query})

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                max_tokens=400,
                temperature=0.2,   # Low temperature = factual, consistent answers
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq API error: {e}", flush=True)
            return "Sorry, I encountered an error while thinking. Please try again."


# Singleton instance — zero RAM overhead, no model download needed
rag_service = RAGService()
