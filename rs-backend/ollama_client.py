import requests

BASE = "http://localhost:11434/v1/chat/completions"


def ask_ollama(system: str, user: str, model="llama3"):
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
    }
    resp = requests.post(BASE, json=payload)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def summarize_passages(passages: list[str]) -> str:
    joined = "\n\n".join(passages)
    prompt = (
        "You are a helpful research assistant. "
        "Please provide a concise summary of the following extracted sections:\n\n"
        f"{joined}"
    )
    return ask_ollama(
        system="You are a research summarizer.",
        user=prompt
    )


def simplify_translation(text: str, target_language="English") -> str:
    prompt = (
        f"Please translate the following text into simpler {target_language}, "
        "using clear, easy-to-understand language:\n\n" + text
    )
    return ask_ollama(
        system="You are a translator and simplifier.",
        user=prompt
    )


def ask_question(question: str, passages: list[str], history: list[dict]) -> str:
    context = "\n\n".join(passages)

    chat_context = ""
    for msg in history:
        role = msg["role"].capitalize()
        chat_context += f"{role}: {msg['text']}\n"


    prompt = (
        f"{chat_context}\n"
        f"Based on the conversation history above and the context below"
        ", answer the following question completely concisely:\n"
        f"{question}\n\n"
        f"The following is the context:"
        f"Context: {context}"
        f"Be specific and direct. Do not repeat unecessary text from the question"
    )

    return ask_ollama(
        system="You are a helpful assistant that uses prior conversation and relevant documents.",
        user=prompt
    )


def generate_related_queries(user_question: str) -> list[str]:
    prompt = (
        f"The user asked: '{user_question}'\n\n"
        "Generate 3-5 alternate search queries that can retrieve relevant information "
        "from a document. These can be synonyms or reworded versions. Return one per line."
    )

    response = ask_ollama(
        system="You are a helpful assistant for generating semantic search queries.",
        user=prompt
    )

    return [q.strip("-• ").strip() for q in response.splitlines() if q.strip()]
