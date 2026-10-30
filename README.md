# KnowBridge

KnowBridge is a local multi-client knowledge chatbot demo. Staff can query only the active documents for their server-assigned client and receive cited answers or an insufficient-evidence refusal. Admin uploads are stored in persistent local document storage; PostgreSQL stores metadata/audit records and Qdrant stores searchable chunks.

This is a hackathon/demo setup, not a production deployment. Keep client files and `.env` local; do not commit secrets or real client documents.

## Local setup

1. Copy `.env.example` to `.env`. Set a unique `JWT_SECRET` of at least 32 characters. The example selects Ollama `llama3.2:3b` and the locally included embedding model path.
2. Start the backend and data services:

   ```bash
   docker compose up --build -d
   ```

3. Pull the configured Ollama model once:

   ```bash
   docker compose exec ollama ollama pull llama3.2:3b
   ```

4. Create the first administrator. This command creates an admin without client assignments so the admin can create the organization's first client in the website:

   ```bash
   docker compose exec backend python -m app.create_admin \
     --email admin@your-company.example --name "Organization Admin"
   ```

   Save the generated password; it is printed once. Bootstrap is allowed only for `development` or `demo` and refuses to reset an existing account. The bootstrap command is an operator tool, not a public registration endpoint.

5. Compose starts the React/Vite frontend with the backend and data services. Open `http://localhost:5173`. API docs are at `http://localhost:8000/docs`; health check is `http://localhost:8000/health`.

### Running without OpenCode

OpenCode is not required once the project files and container runtime are available. From a regular terminal in this Fedora/Podman environment, run:

```bash
cd /home/swampfire/Documents/project101
/home/swampfire/.local/share/knowbridge-tools/bin/podman-compose up -d --build
```

The Podman Compose helper is installed in the user's home directory, not under OpenCode's temporary files. For Docker Desktop, use `docker compose up -d --build` from the project root instead. Use `podman-compose down` or `docker compose down` to stop containers; do not add `-v` unless intentionally deleting persistent data.

## Storage and access

- Original uploads are written under `DOCUMENT_STORAGE_PATH` (default `/data/documents`) on the persistent `document_data` volume. The database stores metadata and the managed storage path; Qdrant stores chunks and tenant/version metadata.
- Staff permissions come from PostgreSQL assignments. The browser cannot choose its own retrieval tenant.
- Admin upload is restricted to clients assigned to that admin. The file endpoint applies the same client authorization before returning an original file.
- Sign in as the initial admin, open **User Management**, create a client, then create staff users and assign each to a client. User passwords are hashed before storage; choose strong initial passwords and share them securely.
- The demo supports digital PDF and DOCX only. Textless/scanned documents are rejected; OCR is not configured.
- Do not run `docker compose down -v` unless you intend to erase the local database, vectors, documents, and Ollama model volumes.

The former `seed_demo` command and fictional sample documents have been removed. The application does not fabricate client or user records; enter organization data through the admin workflow after backing up and confirming the local database contents.

## Checks

```bash
cd backend && pytest
cd ../frontend && npm run build
```

## Project documents

- `prd.md` — problem, users, objectives, and demo features
- `techstack.md` — technology choices and open decisions
- `rules.md` — isolation, grounding, audit, and implementation rules
