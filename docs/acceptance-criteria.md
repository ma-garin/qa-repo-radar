# Acceptance Criteria

## MVP acceptance criteria

The MVP is acceptable when all conditions below are satisfied.

### Collection

- The tool can collect public GitHub repository metadata from configured keywords or topics.
- Collection logic is isolated under `src/collector/`.
- GitHub API tokens are read from environment variables and never stored in the repository.
- The tool handles missing fields safely.

### Storage

- Collected metadata can be stored locally.
- The storage format is documented.
- Re-running collection does not blindly duplicate repositories.

### Classification

- Each repository can be assigned one or more QA service domain labels.
- Classification reasons are stored or shown in the report.
- Classification logic is testable.

### Scoring

- Each repository receives an explainable score.
- Score components are visible.
- Star count is not the primary scoring factor.
- Third-party QA applicability is weighted highest.
- Scoring logic has unit tests.

### Reporting

- A static HTML report is generated.
- The report shows both facts and inferred evaluations.
- The report includes recommended usage and caution points.
- The report is readable without running the application.

### AIDD readiness

- `README.md`, `AGENTS.md`, `CLAUDE.md`, and core docs are present.
- Requirements, evaluation criteria, and acceptance criteria are consistent.
- Implementation tasks can be split into small issues or prompts.

## Definition of done for changes

A change is done only when:

1. It satisfies the relevant requirement.
2. It has an explicit acceptance condition.
3. It does not weaken third-party QA orientation.
4. It does not introduce secrets or private data.
5. It is documented if it changes behavior.
6. It is tested if it changes logic.
