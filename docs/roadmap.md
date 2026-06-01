# Roadmap

## Phase 0: AIDD foundation

Goal: Make the repository safe for AI-assisted development.

Deliverables:

- README
- AGENTS.md
- CLAUDE.md
- requirements
- evaluation criteria
- acceptance criteria
- data policy
- roadmap

## Phase 1: Local MVP

Goal: Generate a static HTML report from collected repository metadata.

Deliverables:

- keyword configuration
- GitHub repository collector
- local storage
- deterministic classifier
- deterministic scorer
- static HTML reporter
- unit tests for classifier and scorer

## Phase 2: LLM-assisted evaluation

Goal: Improve summary and classification quality using LLM prompts.

Deliverables:

- README summarization prompt
- repository classification prompt
- third-party QA evaluation prompt
- output schema
- manual review workflow

## Phase 3: Weekly report workflow

Goal: Run collection and report generation periodically.

Deliverables:

- GitHub Actions workflow
- cached metadata
- generated report artifact
- manual dispatch support

## Phase 4: Personalization

Goal: Prioritize repositories based on actual interests and work context.

Priority contexts:

- third-party verification services
- test automation
- Playwright
- ISTQB/JSTQB learning
- exploratory testing support
- QA PMO
- AI quality assurance

## Phase 5: PWA or dashboard

Goal: Make the tool easier to use continuously.

Potential features:

- favorites
- already-reviewed tracking
- score adjustment feedback
- category filters
- weekly digest
- export to Markdown or HTML
