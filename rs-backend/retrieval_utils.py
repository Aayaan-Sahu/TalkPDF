from vector_store import VectorStore
from ollama_client import generate_related_queries


def hybrid_multi_query_search(user_question: str, store: VectorStore | None, k=3) -> list[str]:
    queries = generate_related_queries(user_question)
    seen = set()
    results = []

    for q in queries:
        # Vector search
        for chunk in store.query(q, k=k):
            if chunk not in seen:
                seen.add(chunk)
                results.append(chunk)

        # Keyword fallback
        keyword_hits = store.simple_keyword_match(q, top_k=k)
        for chunk in keyword_hits:
            if chunk not in seen:
                seen.add(chunk)
                results.append(chunk)

    return results
