# Product Requirements Document — KnowBridge

## Problem statement

The organisation serves multiple clients, each with its own processes, service levels, rules, and regulations documented across files. Staff currently search these documents manually, which is slow and can lead to inconsistent, outdated, or cross-client answers.

KnowBridge is a centralised knowledge chatbot for staff. It must answer questions using only active documents belonging to the user's authorised client. It must not use the internet or the model's general knowledge as a factual source. A user authorised for one client must not be able to retrieve another client's information.

## Target users

- **Operations staff:** Ask about procedures and rules for their assigned client.
- **Account managers:** Find and verify client-specific guidance.
- **Administrators:** Upload documents, manage assignments, and review audit/processing information.

## Objectives

1. Make client-specific knowledge quick to find during day-to-day work.
2. Ground answers in the authorised client's uploaded documents.
3. Enforce client isolation structurally, not through model instructions alone.
4. Make factual answers verifiable through citations.
5. Prefer an honest refusal to an unsupported answer.
6. Record who asked what and which sources were retrieved.

## Core features

### Document ingestion

- Admin uploads digital PDF and DOCX documents for a client.
- Extract text, split it into chunks, generate embeddings, and index it in Qdrant.
- Associate chunks with client, document, version, and page/section location.
- Report failed or unsupported processing clearly.
- OCR and scanned-document processing are out of scope for this demo.

### Authentication and authorization

- Authenticate users before chat or document management.
- Resolve client access from trusted server-side user assignments.
- Do not trust a client ID supplied by the browser to select a retrieval tenant.

### Question answering

- Retrieve only relevant chunks belonging to the authenticated user's client and active documents.
- Generate answers from retrieved evidence and return document/version/location citations.
- Refuse or state that the documents do not provide enough evidence when appropriate.
- Surface conflicting sources with citations rather than silently choosing one.

### Audit and administration

- Record user, query, timestamp, and retrieved sources for each query.
- Make audit records reviewable by authorized administrators/evaluators.
- Keep superseded document versions for audit while excluding them from current retrieval.

## Hackathon demo scenarios

- Answer a supported question with a checkable citation.
- Refuse a question not covered by the user's client documents.
- Show that a Client A user cannot retrieve Client B information.
- Show an audit entry for the query and retrieved sources.

## Scope and exclusions

- This is a local hackathon demonstration, not a production deployment.
- Use a small fictional dataset for at least two clients.
- The React frontend is developed separately by another teammate; this document describes backend behavior and integration needs.
- Scanned documents/OCR and production-scale capacity guarantees are excluded.
