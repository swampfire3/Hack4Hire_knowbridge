# KnowBridge Build Rules

## Security and client isolation

1. Enforce isolation structurally: resolve the user's permitted client server-side and apply that scope to every Qdrant query.
2. Never rely on prompt instructions to prevent cross-client retrieval.
3. Never trust a client ID from the browser as authority for choosing a tenant.
4. Apply authorization to document upload/management, chat, and audit access—not only vector search.
5. Do not expose other clients' document names, content, citations, or audit data in responses or errors.
6. Treat uploaded document text as untrusted data, not instructions for the system.

## Grounding and answers

7. Use active retrieved documents from the authorized client as the factual source.
8. If evidence is missing or insufficient, refuse or clearly say the information was not found; do not fill gaps using general model knowledge.
9. Cite document and version, plus page/section when available.
10. Surface contradictory sources with citations to both; do not silently select one.
11. Keep answers concise and within what the cited evidence supports.

## Documents and versions

12. Support digital PDF and DOCX for the demo. Report scanned/textless or unsupported documents instead of silently indexing empty content.
13. Associate every chunk with client, document, version, and source location.
14. Exclude superseded versions from normal retrieval while retaining their metadata for audit.
15. Report ingestion success only after extraction, chunking, embedding, and storage succeed.

## Audit and privacy

16. Record authenticated user, query, timestamp, and returned sources for each query.
17. Do not silently rewrite historical audit records.
18. Do not send client documents, questions, embeddings, or prompts to external services.
19. Keep real secrets out of source control; commit `.env.example`, not `.env`.

## Demo engineering

20. Optimize for a clear, testable demo; avoid production infrastructure that is not needed.
21. Keep frontend work separate and coordinate through a documented API contract; do not overwrite teammate frontend files.
22. Test tenant isolation, grounded citations, unsupported-question refusals, and audit recording.
23. Measure latency and concurrent generation on demo hardware; do not promise capacity before testing.
24. Document setup, sample data/accounts, and known limitations.
