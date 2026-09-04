from transformers import AutoTokenizer, AutoModelForCausalLM
import os

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

print(f"Downloading LLM ({MODEL_NAME})...")
AutoTokenizer.from_pretrained(MODEL_NAME)
AutoModelForCausalLM.from_pretrained(MODEL_NAME)

print("All models downloaded and cached successfully!")
