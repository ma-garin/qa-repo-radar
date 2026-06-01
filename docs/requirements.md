# Requirements

## Purpose

QA Repo Radar discovers public GitHub repositories that can improve the service capability of third-party software testing and quality assurance companies.

The tool supports practical technology discovery for QA engineers, QA leads, test automation engineers, verification PMO members, and AI-assisted QA practitioners.

## Non-goals

- It is not a generic GitHub trend ranking tool.
- It is not a general developer productivity tool finder.
- It does not evaluate private repositories.
- It does not clone or analyze full source code in the first MVP.
- It does not make automatic adoption decisions.

## MVP scope

The MVP shall:

1. Collect public GitHub repository metadata.
2. Use search keywords and topics related to QA, testing, automation, quality visualization, and AI quality assurance.
3. Store collected metadata in SQLite or a local structured file during early prototyping.
4. Classify repositories into third-party QA service domains.
5. Score repositories using explicit criteria.
6. Generate a static HTML report.
7. Show why each repository is useful, not only that it is popular.

## Repository metadata

The collector should capture at least:

- repository full name
- URL
- description
- topics
- primary language
- star count
- fork count
- open issue count
- license
- latest push date
- README availability
- CI configuration availability

## Report requirements

The report should show:

- repository name
- service domain classification
- third-party QA usefulness score
- recommended usage
- customer explanation value
- internal standardization value
- risk reduction value
- adoption difficulty
- caution points

## Initial service domains

- Test design support
- Test automation
- API testing
- E2E testing
- Quality visualization
- Verification PMO
- Agile QA
- Exploratory testing support
- Compatibility and cross-browser testing
- Non-functional testing
- AI quality assurance
- QA process improvement

## Quality requirements

- Scoring must be explainable.
- Classification must be traceable to repository metadata or README text.
- The report must separate facts from inferred evaluation.
- The system must avoid storing secrets.
- The first MVP must work locally.
