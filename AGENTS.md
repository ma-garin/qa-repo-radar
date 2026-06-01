# AGENTS.md

This file defines instructions for AI coding agents working in this repository.

## Project purpose

Build a tool that discovers and evaluates public GitHub repositories from the viewpoint of third-party software testing and quality assurance service companies.

The tool must not become a generic OSS ranking tool. All implementation decisions must be aligned with third-party QA service value.

## Required work style

- Read `docs/requirements.md` before implementation.
- Read `docs/evaluation-criteria.md` before implementing scoring or classification.
- Read `docs/acceptance-criteria.md` before declaring work complete.
- Keep changes small and reviewable.
- Prefer simple Python implementation before introducing frameworks.
- Do not add external services unless explicitly required.
- Do not store GitHub tokens, personal data, or private repository data.

## Domain constraints

The judgement criteria must prioritize:

- third-party verification service applicability
- customer explanation value
- standardization potential
- QA process improvement
- quality risk reduction
- test design usefulness
- test automation usefulness
- quality visualization usefulness
- AI quality assurance relevance

Star count, popularity, and novelty are secondary indicators only.

## Implementation constraints

- Use Python for the first MVP.
- Use SQLite for local persistence.
- Generate static HTML reports first.
- Keep network access isolated under `src/collector/`.
- Keep scoring logic isolated under `src/scorer/`.
- Keep classification logic isolated under `src/classifier/`.
- Keep report generation isolated under `src/reporter/`.
- Add tests for scoring and classification rules.

## Done means

Work is complete only when:

1. The change satisfies the relevant acceptance criteria.
2. The output can be inspected without relying on hidden reasoning.
3. Tests are added or updated for logic changes.
4. Documentation is updated when behavior or judgement criteria change.
