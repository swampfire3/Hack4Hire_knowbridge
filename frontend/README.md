# KnowBridge Frontend

This is the React + TypeScript + Tailwind CSS frontend application for **KnowBridge**, implemented strictly according to the PRD (`prd.md`), design system specification (`DESIGN.md`), and system build rules (`rules.md`).

## Current integration status

The interface contains the planned chat and administration screens, but the FastAPI service in this repository currently exposes only `/` and `/health`. To avoid pretending that browser state is authorization, sign-in is deliberately unavailable until the backend authentication/session contract exists. The frontend does not contain demo passwords, tokens, or an API client ID.

See [API_CONTRACT.md](./API_CONTRACT.md) for the agreed frontend requirements and the backend questions that must be resolved before wiring requests.

## Screens included

1. **Authentication UI**:
   - Staff and administrator presentation views, pending server-backed authentication.

2. **Tenant-Scoped Knowledge Chat**:
   - Chat interface matching `staff_knowledge_chatbot` layout.
   - Grounded document answers with interactive citations (document, version, section/page).
   - Side panel showing active citations for the current answer.
   - Quick-test prompt buttons for testing:
     - Permitted client retrieval & grounded citations.
     - Blocked cross-client queries (Security Rules 1 & 4).
     - Unsupported / out-of-scope refusal (Grounding Rule 7).
     - Conflicting documents detection (Rule 9).

3. **Document Management**:
   - Overview of digital PDFs and DOCXs with active versions, superseded status, and chunk counts.
   - Ingestion modal with digital text validation.
   - Identification and rejection of scanned/OCR documents per rule 11.

4. **Audit & Verification Logging**:
   - Immutable append-oriented audit table capturing timestamp, user, client scope, query, retrieved citations, and access status (`allowed`, `blocked`, `refused`).

5. **Access Control**:
   - Server-side user-to-client bindings configuration view ensuring browser cannot unilaterally choose tenant retrieval.

## Running the Frontend

To start the development server:

```bash
cd frontend
npm ci
# Copy .env.example to .env and set VITE_API_BASE_URL if FastAPI is not at localhost:8000
npm run dev
```

To build for production:

```bash
cd frontend
npm run build
```

