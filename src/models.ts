// QA service domains defined in docs/service-domain.md
export type ServiceDomain =
  | 'test-design-support'
  | 'test-automation'
  | 'api-testing'
  | 'e2e-testing'
  | 'quality-visualization'
  | 'verification-pmo'
  | 'agile-qa'
  | 'exploratory-testing-support'
  | 'compatibility-testing'
  | 'non-functional-testing'
  | 'ai-quality-assurance'
  | 'qa-process-improvement';

// Classification labels defined in docs/evaluation-criteria.md
export type ClassificationLabel =
  | 'customer-proposal-ready'
  | 'internal-standardization-candidate'
  | 'automation-foundation'
  | 'test-design-support'
  | 'quality-visualization'
  | 'qa-pmo-support'
  | 'agile-qa-support'
  | 'ai-quality-assurance'
  | 'learning-reference'
  | 'watchlist'
  | 'low-priority';

// Scoring dimensions defined in docs/evaluation-criteria.md
export type ScoreDimension =
  | 'third-party-qa-applicability'
  | 'customer-explanation-value'
  | 'test-design-usefulness'
  | 'quality-risk-reduction'
  | 'automation-integration'
  | 'standardization-potential'
  | 'documentation-quality'
  | 'license-clarity'
  | 'maintenance-freshness'
  | 'adoption-feasibility';

// Observable evidence used to justify classification or scoring
export interface Evidence {
  type: 'fact' | 'inference';
  source:
    | 'description'
    | 'topics'
    | 'readme'
    | 'license'
    | 'update-date'
    | 'ci-config'
    | 'examples'
    | 'issue-activity'
    | 'other';
  content: string;
}

// A single scored dimension with justification
export interface ScoreComponent {
  dimension: ScoreDimension;
  points: number;
  evidence: string;
}

// A penalty applied to the total score
export interface ScorePenalty {
  reason: string;
  points: number;
}

// Public GitHub repository metadata collected for evaluation
export interface RepositoryCandidate {
  fullName: string;
  url: string;
  description: string | null;
  topics: string[];
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  pushedAt: string;
  readmeText: string | null;
  hasCi: boolean;
  collectedAt: string;
}

// Explainable score assigned to a repository
export interface EvaluationScore {
  totalScore: number;
  scoreComponents: ScoreComponent[];
  penalties: ScorePenalty[];
  evidence: Evidence[];
  inferenceNotes: string[];
}

// Practical recommendation for a third-party QA company
export interface Recommendation {
  usefulnessLevel: 'high' | 'medium' | 'low';
  recommendedUsage: string;
  targetUser: string;
  adoptionDifficulty: 'easy' | 'moderate' | 'hard';
  customerExplanationValue: 'high' | 'medium' | 'low';
  internalStandardizationValue: 'high' | 'medium' | 'low';
  cautionPoints: string[];
}

// A repository with completed classification, score, and recommendation
export interface EvaluatedRepository {
  candidate: RepositoryCandidate;
  domains: ServiceDomain[];
  classificationLabels: ClassificationLabel[];
  score: EvaluationScore;
  recommendation: Recommendation;
}

// Search conditions used during collection
export interface SearchCondition {
  keywords: string[];
  topics: string[];
  collectedAt: string;
}

// Static HTML report output
export interface Report {
  generatedAt: string;
  searchConditions: SearchCondition;
  repositories: EvaluatedRepository[];
  summary: string;
  highPriorityItems: EvaluatedRepository[];
  watchlistItems: EvaluatedRepository[];
  lowPriorityItems: EvaluatedRepository[];
}
