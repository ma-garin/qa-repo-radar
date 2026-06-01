# QA Repo Radar

QA Repo Radar is an AIDD-ready tool concept for discovering, classifying, and evaluating public GitHub repositories that are useful for third-party software testing and quality assurance companies.

The project is not a generic GitHub trend finder. Its primary purpose is to identify repositories that can improve service delivery for companies similar to Veriserve and SHIFT, including test design, test automation, QA process improvement, quality visualization, verification PMO, agile QA, and AI quality assurance.

## Primary users

- QA engineers in third-party verification companies
- Test automation engineers
- QA leads and assistant managers
- Verification PMO members
- AI-assisted development practitioners who need reusable QA assets

## MVP goal

Generate a weekly HTML report that lists high-value GitHub repositories for third-party QA services.

The first MVP should:

1. Collect public repositories from GitHub using keywords and topics.
2. Store repository metadata locally.
3. Classify repositories by QA service domain.
4. Score each repository using third-party verification criteria.
5. Generate a concise report with practical usage guidance.

## Core judgement principle

A repository is valuable only if it can contribute to third-party QA service delivery, customer explanation, standardization, risk reduction, or internal capability building.

Star count alone is not sufficient.

## Initial structure

```text
qa-repo-radar/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── docs/
├── prompts/
├── src/
├── tests/
├── data/
├── reports/
└── .github/workflows/
```

## Development approach

This repository assumes AIDD. Requirements, evaluation criteria, acceptance criteria, and agent instructions must be maintained before implementation work begins.
