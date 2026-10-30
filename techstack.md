# KnowBridge Technology Stack

The stack is for a local hackathon demonstration. Docker Compose starts local services consistently; it is not a production deployment plan.

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Python + FastAPI | API and application logic |
| Frontend | React (separate teammate workstream) | Chat and administration UI |
| Relational database | PostgreSQL | Users, client assignments, document metadata/versions, audit records |
| Vector database | Qdrant | Embedded document chunks with tenant-scoped retrieval |
| Embeddings | Sentence Transformers | Local text embeddings |
| LLM runtime | Ollama | Local model inference; exact model TBD |
| PDF processing | PyMuPDF | Text and page extraction from digital PDFs |
| DOCX processing | python-docx | Text extraction from Word documents |
| Authentication | JWT + server-side user-to-client mapping | User identity and authorized client resolution |
| Local service orchestration | Docker Compose | Starts backend and local dependencies for the demo |

## Excluded

- Tesseract/OCR: the demo corpus is digital-only.
- Redis or a separate queue service: defer unless testing demonstrates a need.
- Cloud LLM, embedding, or document-processing services: client content stays local.

## Model decision

Ollama is selected as the local runtime, but the model and quantization are not finalized. Llama 3.2 3B was discussed as a candidate. Select after measuring answer grounding and latency on the demo machine.
