from transformers import AutoTokenizer, AutoModelForCausalLM
from langchain_community.embeddings import HuggingFaceEmbeddings

print("Downloading LLM (Qwen/Qwen2.5-0.5B-Instruct)...")
AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")

print("Downloading Embeddings (all-MiniLM-L6-v2)...")
HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

print("All models downloaded and cached successfully!")
