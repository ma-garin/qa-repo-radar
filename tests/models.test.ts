import { describe, it, expect } from 'vitest';
import type {
  ServiceDomain,
  ClassificationLabel,
  ScoreDimension,
  Evidence,
  ScoreComponent,
  ScorePenalty,
  RepositoryCandidate,
  EvaluationScore,
  Recommendation,
  EvaluatedRepository,
  SearchCondition,
  Report,
} from '../src/models';

describe('models type shapes', () => {
  it('RepositoryCandidate holds expected fields', () => {
    const candidate: RepositoryCandidate = {
      fullName: 'example/playwright-utils',
      url: 'https://github.com/example/playwright-utils',
      description: 'Utilities for Playwright test automation',
      topics: ['playwright', 'testing', 'e2e'],
      primaryLanguage: 'TypeScript',
      stars: 120,
      forks: 15,
      openIssues: 3,
      license: 'MIT',
      pushedAt: '2024-11-01T00:00:00Z',
      readmeText: '# playwright-utils\nHelpers for E2E testing.',
      hasCi: true,
      collectedAt: '2026-06-01T00:00:00Z',
    };
    expect(candidate.fullName).toBe('example/playwright-utils');
    expect(candidate.topics).toContain('playwright');
  });

  it('EvaluationScore holds components, penalties, evidence, and notes', () => {
    const score: EvaluationScore = {
      totalScore: 85,
      scoreComponents: [
        {
          dimension: 'third-party-qa-applicability' satisfies ScoreDimension,
          points: 25,
          evidence: 'Topics include playwright and e2e',
        },
      ],
      penalties: [
        { reason: 'README is thin', points: -20 } satisfies ScorePenalty,
      ],
      evidence: [
        {
          type: 'fact',
          source: 'topics',
          content: 'playwright, e2e',
        } satisfies Evidence,
      ],
      inferenceNotes: ['Likely suitable for E2E test support services'],
    };
    expect(score.totalScore).toBe(85);
    expect(score.scoreComponents[0].dimension).toBe('third-party-qa-applicability');
  });

  it('Recommendation captures third-party QA guidance fields', () => {
    const rec: Recommendation = {
      usefulnessLevel: 'high',
      recommendedUsage: 'Use as a base for E2E test automation on client projects',
      targetUser: 'Test automation engineer',
      adoptionDifficulty: 'easy',
      customerExplanationValue: 'high',
      internalStandardizationValue: 'medium',
      cautionPoints: ['License requires confirmation for commercial use'],
    };
    expect(rec.usefulnessLevel).toBe('high');
    expect(rec.cautionPoints).toHaveLength(1);
  });

  it('Report contains evaluated repositories split by priority', () => {
    const searchConditions: SearchCondition = {
      keywords: ['playwright', 'test automation'],
      topics: ['testing'],
      collectedAt: '2026-06-01T00:00:00Z',
    };

    const repo: EvaluatedRepository = {
      candidate: {
        fullName: 'example/playwright-utils',
        url: 'https://github.com/example/playwright-utils',
        description: null,
        topics: ['playwright'],
        primaryLanguage: 'TypeScript',
        stars: 120,
        forks: 15,
        openIssues: 3,
        license: 'MIT',
        pushedAt: '2024-11-01T00:00:00Z',
        readmeText: null,
        hasCi: false,
        collectedAt: '2026-06-01T00:00:00Z',
      },
      domains: ['e2e-testing' satisfies ServiceDomain, 'test-automation'],
      classificationLabels: ['automation-foundation' satisfies ClassificationLabel],
      score: {
        totalScore: 70,
        scoreComponents: [],
        penalties: [],
        evidence: [],
        inferenceNotes: [],
      },
      recommendation: {
        usefulnessLevel: 'medium',
        recommendedUsage: 'Evaluate for E2E automation projects',
        targetUser: 'Test automation engineer',
        adoptionDifficulty: 'moderate',
        customerExplanationValue: 'medium',
        internalStandardizationValue: 'medium',
        cautionPoints: [],
      },
    };

    const report: Report = {
      generatedAt: '2026-06-01T00:00:00Z',
      searchConditions,
      repositories: [repo],
      summary: '1 repository evaluated',
      highPriorityItems: [],
      watchlistItems: [repo],
      lowPriorityItems: [],
    };

    expect(report.repositories).toHaveLength(1);
    expect(report.watchlistItems[0].domains).toContain('e2e-testing');
  });
});
