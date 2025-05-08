from PyPDF2 import PdfReader


def load_pdf(path: str) -> str:
    reader = PdfReader(path)
    text = []
    for page in reader.pages:
        text.append(page.extract_text() or "")
    return "\n\n".join(text)
