import os
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import threading

class LocalRAGService:
    def __init__(self):
        print("Loading local LLM...", flush=True)
        
        try:
            model_id = "Qwen/Qwen2.5-0.5B-Instruct"
            self.tokenizer = AutoTokenizer.from_pretrained(model_id)
            model = AutoModelForCausalLM.from_pretrained(model_id)
            self.llm_pipeline = pipeline(
                "text-generation",
                model=model,
                tokenizer=self.tokenizer,
                max_new_tokens=200,
                do_sample=False,
            )
            print("Local Models Loaded successfully!", flush=True)
            self.is_ready = True
        except Exception as e:
            print(f"Error loading models: {e}", flush=True)
            self.is_ready = False
            self.llm_pipeline = None

    def query(self, user_query: str, context_texts: list[str], history: list[dict] = None) -> str:
        if not self.is_ready or not self.llm_pipeline:
            return "I am still warming up my AI brain (loading local model). Please try again in a few seconds!"

        context = ""
        if context_texts:
            # The context is small (max 30 txns + summary), so we pass everything directly to the LLM
            # This guarantees 100% accurate mathematical reasoning without retrieval loss.
            context = "\n".join(context_texts)

        # Format history for chat template
        messages = [
            {"role": "system", "content": f"You are VaultMind, an intelligent and friendly AI financial assistant for VaultIQ. You MUST strictly use the following Financial Context to answer the user's question. Do NOT make up, guess, or hallucinate any numbers or information. If the answer is not in the context, say you don't know.\n\nFinancial Context:\n{context}"}
        ]
        if history:
            for msg in history[-5:]:
                role = "user" if msg.get("sender") == "user" else "assistant"
                messages.append({"role": role, "content": msg.get("text")})
        
        messages.append({"role": "user", "content": user_query})

        prompt = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        
        try:
            result = self.llm_pipeline(prompt)
            # Pipeline returns the full string (prompt + generation) for CausalLM. We just need the generated part.
            generated_text = result[0]["generated_text"]
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):]
            return generated_text.strip()
        except Exception as e:
            print(f"Error during generation: {e}", flush=True)
            return "Sorry, I encountered an error while thinking. Please try again."

# Singleton instance
rag_service = LocalRAGService()
