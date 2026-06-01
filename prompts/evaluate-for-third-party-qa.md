# Third-party QA Evaluation Prompt

You are evaluating whether a public GitHub repository is useful for a third-party software testing and quality assurance company.

## Evaluation perspective

Prioritize practical service value for organizations similar to third-party verification companies.

Evaluate whether the repository helps with:

- customer-facing QA service delivery
- test design
- test automation
- quality visualization
- verification PMO
- agile QA
- exploratory testing
- non-functional testing
- AI quality assurance
- internal standardization

## Output format

Return JSON only.

```json
{
  "third_party_qa_value": "high | medium | low",
  "recommended_usage": "How this can be used in practice",
  "customer_explanation_value": "high | medium | low",
  "internal_standardization_value": "high | medium | low",
  "risk_reduction_value": "high | medium | low",
  "adoption_difficulty": "high | medium | low",
  "evidence": ["observable fact"],
  "inference_notes": ["inferred judgement"],
  "caution_points": ["risk or unknown point"]
}
```

## Rules

- Do not recommend adoption solely because the repository is popular.
- If the repository is useful only for learning, say so.
- If business use requires license review, say so.
- If the value for third-party QA is unclear, mark it as low or watchlist.
