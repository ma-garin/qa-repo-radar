# Domain Model

## RepositoryCandidate

A public GitHub repository collected as a candidate for evaluation.

Fields:

- full_name
- url
- description
- topics
- primary_language
- stars
- forks
- open_issues
- license
- pushed_at
- readme_text
- has_ci
- collected_at

## ServiceDomain

A QA service domain where the repository may provide value.

Examples:

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

## EvaluationScore

An explainable score assigned to a repository.

Fields:

- total_score
- score_components
- penalties
- evidence
- inference_notes

## Recommendation

A practical recommendation generated from repository metadata, classification, and score.

Fields:

- usefulness_level
- recommended_usage
- target_user
- adoption_difficulty
- customer_explanation_value
- internal_standardization_value
- caution_points

## Report

A static output for human review.

Fields:

- generated_at
- search_conditions
- repositories
- summary
- high_priority_items
- watchlist_items
- low_priority_items

## Evidence

Observable information used to justify classification or scoring.

Examples:

- README excerpt
- repository topics
- license
- update date
- CI file presence
- examples directory presence
- documentation links
