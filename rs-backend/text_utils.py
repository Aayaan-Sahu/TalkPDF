import tiktoken


def chunk_text(text: str, max_tokens: int = 500):
    encoder = tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)
    for i in range(0, len(tokens), max_tokens):
        yield encoder.decode(tokens[i: i + max_tokens])
