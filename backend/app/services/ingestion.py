from io import BytesIO
from pathlib import Path

import fitz
from docx import Document as DocxDocument
from fastapi import HTTPException, UploadFile


SUPPORTED_SUFFIXES = {".pdf", ".docx"}


def extract_digital_text(upload: UploadFile, raw: bytes) -> list[tuple[str, int | None, str | None]]:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in SUPPORTED_SUFFIXES:
        raise HTTPException(422, "Only digital PDF and DOCX files are supported")
    if suffix == ".pdf":
        pdf = fitz.open(stream=raw, filetype="pdf")
        pages = [(page.get_text("text").strip(), number + 1, None) for number, page in enumerate(pdf)]
    else:
        docx = DocxDocument(BytesIO(raw))
        text = "\n".join(paragraph.text for paragraph in docx.paragraphs).strip()
        pages = [(text, None, "Document")]
    if not any(text for text, _, _ in pages):
        raise HTTPException(422, "Document has no extractable digital text; scanned/OCR documents are unsupported")
    return pages


def chunk_text(pages: list[tuple[str, int | None, str | None]], size: int = 900, overlap: int = 150):
    chunks = []
    for text, page, section in pages:
        for start in range(0, len(text), size - overlap):
            snippet = text[start:start + size].strip()
            if snippet:
                chunks.append((snippet, page, section))
    return chunks
