# from fastapi.security import OAuth2PasswordBearer
# from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, Depends, HTTPException, Header, status
from pydantic import BaseModel



import os

from pdfloader import load_pdf
from text_utils import chunk_text
from vector_store import VectorStore
from retrieval_utils import hybrid_multi_query_search
from ollama_client import summarize_passages, simplify_translation, ask_question

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store: VectorStore | None = None

@app.post("/api/upload")
async def upload_files(files: list[UploadFile]):
    global store
    store = VectorStore()
    for f in files:
        # save to temp
        path = f"/tmp/{f.filename}"
        with open(path, "wb") as out:
            out.write(await f.read())
        text = load_pdf(path)
        store.add(list(chunk_text(text)))
        os.remove(path)
    return {"status": "ok"}


class QueryIn(BaseModel):
    question: str


@app.post("/api/query")
def query(q: QueryIn):
    global store
    relevant = hybrid_multi_query_search(q.question, store, k=3)
    return {"relevant": relevant}


class SummarizeIn(BaseModel):
    chunks: list[str]


@app.post("/api/summarize")
def summarize(body: SummarizeIn):
    summary = summarize_passages(body.chunks)
    return {"summary": summary}


class TranslateIn(BaseModel):
    text: str


@app.post("/api/translate")
def translate(body: TranslateIn):
    translation = simplify_translation(body.text)
    return {"translation": translation}


class AnswerIn(BaseModel):
    question: str
    chunks: list[str]
    history: list[dict]


@app.post("/api/answer")
def answer(body: AnswerIn):
    answer = ask_question(body.question, body.chunks, body.history)
    return {"answer": answer}