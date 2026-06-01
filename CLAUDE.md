# CLAUDE.md

This repository is intended to be developed with Claude Code and other AI-assisted development tools.

## Working principle

Before editing code, confirm the active task against:

1. `docs/requirements.md`
2. `docs/evaluation-criteria.md`
3. `docs/acceptance-criteria.md`
4. `docs/roadmap.md`

If the task conflicts with these documents, update the documents first or ask for direction.

## Language and communication

- Use Japanese for user-facing explanations when interacting with the repository owner.
- Use English for source code, file names, comments, and repository documentation unless otherwise requested.
- Keep implementation notes concise and evidence-based.

## Preferred implementation order

1. Domain model and criteria
2. Repository metadata schema
3. Collector
4. Classifier
5. Scorer
6. Static HTML reporter
7. Tests
8. CI

## Avoid

- Large unreviewable changes
- Hidden magic scoring
- Overly complex frameworks before the MVP
- Storing secrets in the repository
- Ranking repositories only by stars
- Treating QA as generic development tooling

## Mandatory review points

Before completing a task, check:

- Does this help a third-party QA company?
- Can the judgement be explained to a customer or internal reviewer?
- Is the logic testable?
- Is the output inspectable?
- Is the change small enough for review?
