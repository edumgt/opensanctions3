# OpenSanctions Repository Overview

## Purpose
OpenSanctions collects, cleans, and normalises sanctions and other KYC/AML source data into structured FollowTheMoney entities so the information can be analysed and shared consistently across jurisdictions.【F:CLAUDE.md†L1-L4】

## Repository Structure
### `zavod/`
Zavod is the core ETL framework that powers the crawlers. It defines metadata models, entity abstractions, and context helpers for building reproducible data pipelines, and it is published as the `zavod` Python package with its own dependency set and command-line entry point.【F:CLAUDE.md†L5-L10】【F:zavod/pyproject.toml†L6-L88】

### `datasets/`
Each sanctions source is described here through a YAML descriptor and optional Python crawler code. Pipelines are executed with `zavod crawl <dataset.yml>`, which downloads source material, enforces strict parsing (failing on ambiguous cases), and writes outputs and log files under `data/datasets/<dataset_name>/`. Lookups can be added to clarify problematic values.【F:CLAUDE.md†L11-L16】

### `contrib/`
Utility and QA scripts that support day-to-day operations, such as aggregating crawler issues from published datasets for review.【F:contrib/aggregate_issues.py†L1-L30】

### `analysis/`
Research notes and SQL snippets used to investigate data quality and programme coverage, e.g. queries that join analytics tables to inspect sanctioning authorities and programmes.【F:analysis/program_notes.md†L1-L24】

### `ui/`
A Next.js front-end for reviewing and editing crawler output. It relies on React 18, Bootstrap styling, CodeMirror editors, and integrates FollowTheMoney schemas via the `@opensanctions/followthemoney` package.【F:CLAUDE.md†L17-L18】【F:ui/package.json†L1-L48】

### `Dockerfile`
Multi-stage container build that installs the Zavod package in an Ubuntu 24.04 base image, sets up locales, runtime dependencies (Poppler, LevelDB, etc.), and configures the default command to run `zavod` inside `/opensanctions`.【F:Dockerfile†L1-L60】

### `docker-compose.yml`
Runs the ETL batch in a container against every dataset (excluding certain heavy or internal ones), exporting failures to `failed_datasets.md` for follow-up.【F:docker-compose.yml†L1-L54】

### `start.sh` and `start.ps1`
Convenience scripts that orchestrate the full stack: reset containers, initialise the PostgreSQL service, run `zavod crawl → export → load-db` for a chosen dataset, and bring up the UI, with both Bash and PowerShell variants for different environments.【F:start.sh†L1-L59】【F:start.ps1†L1-L50】

### `Makefile`
Targets to build project images, open a shell inside the ETL container, run the default pipeline, and clean generated artefacts.【F:Makefile†L1-L27】

### `init-test-db.sql`
Helper script for local testing that provisions a PostgreSQL database and user (`testuser`/`testpass`).【F:init-test-db.sql†L1-L3】

## Typical Usage
* **Run a dataset locally:** `zavod crawl datasets/<country>/<dataset>.yml` (follow with `zavod export` or `zavod load-db` as required). Repeat runs reuse downloaded source resources via `context.fetch_resource`.【F:CLAUDE.md†L11-L16】
* **Batch processing:** `docker compose run --rm zavod` executes the loop defined in `docker-compose.yml` to crawl, export, and load most datasets automatically.【F:docker-compose.yml†L16-L53】
* **End-to-end demo environment:** Use `./start.sh` (or `./start.ps1` on Windows) to spin up PostgreSQL, execute the ETL for a selected dataset, and launch the UI for inspection.【F:start.sh†L1-L59】【F:start.ps1†L1-L50】

## Development Practices
* Run crawler unit tests (`pytest`) and strict type checks (`mypy`) from the `zavod` directory when making framework changes.【F:CLAUDE.md†L8-L10】
* Treat upstream data as untrusted: prefer explicit checks (`if var is None`) and fail-fast logic to avoid emitting ambiguous entities.【F:CLAUDE.md†L22-L24】
* Prefer typed Python for new crawlers, minimise new dependencies, and reuse helpers from `zavod/zavod/helpers` by importing them as `from zavod import helpers as h`.【F:CLAUDE.md†L12-L26】
