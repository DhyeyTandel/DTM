# Dhyey Tandel Motors (DTM)

Car dealership inventory app, built as a take-home for Incubyte (an XP shop: TDD, small frequent releases, pair programming, developers own the whole pipeline). The repo should work that way, not just tick the brief.

Read before working: `docs/BRIEF.md`, `docs/STORIES.md`, `docs/TEST_LIST.md`, `docs/DECISIONS.md`.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, Postgres, pytest
- Frontend: React, Vite, TypeScript, Tailwind
- Deploy: Docker Compose and Caddy behind Cloudflare, on my own VPS
- CI: ruff and mypy on the backend, eslint and prettier on the frontend, plus all tests

## Decisions already made

Do not reopen these. They are in `docs/DECISIONS.md` with the reason for each.

- List returns every vehicle, including zero stock. The UI shows those as out of stock.
- Add, update, delete and restock are admin only.
- A purchase is always one unit.
- Register never picks a role. Admin comes from a seed script.
- Purchase is one atomic update, never read then write. 409 when out of stock.
- Prices are integer paise (INR), stored as BigInteger.
- Out of scope: refresh tokens, email verification, pagination.

`docs/DECISIONS.md` is append only. New decisions are new entries. Never edit old ones.

## How we work: strict TDD, one behaviour at a time

Each behaviour comes from a line in `docs/TEST_LIST.md`.

1. **Red.** Write one failing test. Run it. Show me the failure output. Commit.
2. **Green.** Write the minimum code that passes. Run the whole suite. Commit.
3. **Refactor.** Only if there is something worth cleaning. Run the whole suite. Commit. No refactor commit when there is nothing to clean.

Sometimes I write the failing test myself and you make it pass. Never change my tests unless I say so.

Stop at the end of each phase so I can review. Do not start the next phase on your own.

## Commits

- Subject in conventional style (`test:`, `feat:`, `refactor:`, `chore:`, `docs:`)
- Body: what you did, and what I decided
- Then 2 blank lines, then exactly:

```
Co-authored-by: Claude Code <noreply@anthropic.com>
```

## Code rules

These matter as much as the tests passing.

- I must be able to explain every line in an interview. If something needs more than a couple of sentences to explain, it is too clever. Write it simpler.
- Small functions that do one thing. If the name needs an "and", split it.
- Names say what things are. No abbreviations. Comments only for why, never for what.
- Services do not know about HTTP. They raise domain errors (`VehicleNotFound`, `OutOfStock`, ...) and one handler maps them to status codes. Business logic stays reusable and testable without FastAPI.
- Services reach the database through a repository interface, so tests use fakes and the database can change without touching business logic.
- No magic numbers or strings. Use constants or config.
- Do not abstract until something is actually repeated. No base classes or helpers "for later".
- Type hints everywhere.
- No dead code. No commented out code.

### Frontend

- Components never call `fetch`. API calls live in one api layer.
- Data reaches components through hooks.
- Repeated UI bits become small shared components.

## Agents

- You write all the code and make all the commits. No subagent ever edits files.
- Never run agents in parallel on code.
- **architect** (opus, read only, `.claude/agents/architect.md`). Call it automatically for:
  - checking the test list and decisions before we start
  - the data model, before the first migration
  - the purchase concurrency design, before writing it
  - any bug not fixed after 2 tries

  Tell me what it said.
- **test-runner** (haiku) runs tests.
- **reviewer** (sonnet) reviews at the end of each phase.
- **explore** (haiku) searches the codebase.

## Learning rules

My global VibeWise rules still apply. When I say "pause learning", "just implement this one" or "skip checkpoints", bypass the checkpoints for that task.

## Brief deliverables to keep in mind

README with setup, screenshots, test report and a "My AI Usage" section. A root `PROMPTS.md` with raw chat logs. AI co-author trailer on every commit where AI helped.
