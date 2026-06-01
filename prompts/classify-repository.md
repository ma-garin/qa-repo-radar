# Repository Classification Prompt

You are classifying a public GitHub repository for a third-party software testing and quality assurance company.

## Input

- repository name
- description
- topics
- README summary
- primary language
- license
- update date

## Task

Classify the repository into one or more QA service domains.

Allowed domains:

- test-design-support
- test-automation
- api-testing
- e2e-testing
- quality-visualization
- verification-pmo
- agile-qa
- exploratory-testing-support
- compatibility-testing
- non-functional-testing
- ai-quality-assurance
- qa-process-improvement
- learning-reference
- low-priority

## Output format

Return JSON only.

```json
{
  "domains": ["test-automation"],
  "confidence": "high",
  "evidence": ["README mentions browser automation", "topics include playwright"],
  "inference_notes": ["Likely useful for E2E testing"]
}
```

## Rules

- Do not classify by popularity alone.
- Use third-party QA service value as the main criterion.
- If evidence is weak, use `low-priority` or `learning-reference`.
- Separate facts from inference.
