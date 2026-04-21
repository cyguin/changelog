# cyguin changelog — Build State

## Current Slice: 6 — COMPLETE (published to npm)

## Packages Built
- @cyguin/changelog-core@0.0.1 — types, ChangelogAdapter interface, cuid2 util
- @cyguin/changelog-adapter-sqlite@0.0.1 — SQLiteAdapter (better-sqlite3)
- @cyguin/changelog-adapter-postgres@0.0.1 — PostgresAdapter (postgres npm pkg)
- @cyguin/changelog-cli@0.0.1 — route template strings + interactive CLI scaffolder (tsup dual output: ESM + CJS, shebang banner)
- @cyguin/changelog-react@0.0.1 — React components + hooks (tsup ESM only + DTS)

## Package Locations
- packages/core
- packages/adapters/sqlite
- packages/adapters/postgres
- packages/cli
- packages/react

## Build Status
All five packages build clean. `packages/react` uses ESM-only output with DTS generation. Externals correct.

## Examples Added
- examples/with-sqlite/ — Next.js 14 App Router + SQLite adapter + Drizzle ORM
- examples/with-postgres/ — Next.js 14 App Router + Postgres adapter + Drizzle ORM

## Publish Prep
- All 5 package.json polished (description, keywords, repository, homepage, license, author, removed "private": true)
- CLI bin path fixed (./dist/bin.js, not ./dist/bin/index.js)
- Root README.md and LICENSE (MIT) added
- `pnpm publish --dry-run --no-git-checks` passes for all 5 packages

## Remaining Slices
- [x] Slice 4 — CLI scaffolder ✅ COMPLETE
- [x] Slice 5 — Examples + publish prep ✅ COMPLETE
- [x] Slice 6 — Publish to npm ✅ COMPLETE

## Notes
- STATE.md and DECISIONS.md were not written by agent — created manually post-slice.
- `packages/react` requires `@types/react` and `@types/react-dom` as devDeps for DTS generation to work.
- LSP errors in workspace are pre-existing and unrelated to current slice.
- Remote has no `main` branch — integration branch is `feature/slice-4-cli-scaffolder`.
- PR #1 (slices 1–5) merged into `feature/slice-4-cli-scaffolder` at commit `7d1412b`.
- PR: https://github.com/cyguin/changelog/pull/1 (MERGED)

## Notes
- STATE.md and DECISIONS.md were not written by agent — created manually post-slice.
- `packages/react` requires `@types/react` and `@types/react-dom` as devDeps for DTS generation to work. These are in addition to the peerDeps declaration for `react` and `react-dom`.
- LSP errors in workspace are pre-existing and unrelated to current slice.
