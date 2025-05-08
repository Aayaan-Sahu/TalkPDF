import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import Any, List
import re
from difflib import get_close_matches
from ollama_client import generate_related_queries


model = SentenceTransformer("all-MiniLM-L6-v2")


class VectorStore:
    def __init__(self, dim: int = 384) -> None:
        self.index = faiss.IndexFlatL2(dim)
        self.texts: List[str] = []

    def add(self, chunks: List[str]) -> None:
        embs = model.encode(chunks, convert_to_numpy=True)
        embs = np.ascontiguousarray(embs, dtype=np.float32)
        self.index.add(embs)  # type: ignore
        self.texts.extend(chunks)

    def simple_keyword_match(self, query: str, cutoff=0.6, top_k=3):
        query_lower = query.lower()
        matches = [text for text in self.texts if re.search(re.escape(query_lower), text.lower())]

        # Fuzzy match fallback
        if len(matches) < top_k:
            matches.extend(get_close_matches(query, self.texts, n=top_k, cutoff=cutoff))

        return matches[:top_k]

    def query(self, query_text: str, k: int = 5) -> List[str]:
        q_emb = model.encode([query_text], convert_to_numpy=True)
        q_emb = np.ascontiguousarray(q_emb, dtype=np.float32)
        D, I = self.index.search(q_emb, k)  # type: ignore
        return [self.texts[i] for i in I[0]]

