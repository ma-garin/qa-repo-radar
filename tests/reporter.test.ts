import { describe, it, expect } from 'vitest';
import { generateHtml } from '../src/reporter/html-reporter';
import type { Report, EvaluatedRepository } from '../src/models';

function makeEvaluated(overrides: Partial<EvaluatedRepository> = {}): EvaluatedRepository {
  return {
    candidate: {
      fullName: 'example/playwright-utils',
      url: 'https://github.com/example/playwright-utils',
      description: 'Playwright utilities for E2E testing',
      topics: ['playwright', 'e2e'],
      primaryLanguage: 'TypeScript',
      stars: 320,
      forks: 40,
      openIssues: 8,
      license: 'MIT',
      pushedAt: '2025-05-01T00:00:00Z',
      readmeText: null,
      hasCi: false,
      collectedAt: '2026-06-01T00:00:00Z',
    },
    domains: ['test-automation', 'e2e-testing'],
    classificationLabels: ['automation-foundation', 'customer-proposal-ready'],
    score: {
      totalScore: 75,
      scoreComponents: [
        { dimension: 'third-party-qa-applicability', points: 22, evidence: 'Two QA domains' },
        { dimension: 'automation-integration', points: 14, evidence: 'automation domain' },
      ],
      penalties: [],
      evidence: [
        { type: 'fact', source: 'topics', content: 'playwright, e2e' },
        { type: 'inference', source: 'description', content: 'E2E testing detected' },
      ],
      inferenceNotes: ['CI not confirmed in MVP'],
    },
    recommendation: {
      usefulnessLevel: 'high',
      recommendedUsage: 'Use as a test automation base for client projects',
      targetUser: 'Test automation engineer',
      adoptionDifficulty: 'easy',
      customerExplanationValue: 'high',
      internalStandardizationValue: 'high',
      cautionPoints: ['README not fetched in MVP'],
    },
    ...overrides,
  };
}

function makeReport(items: EvaluatedRepository[]): Report {
  const high = items.filter(r => r.score.totalScore >= 70);
  const watch = items.filter(r => r.score.totalScore >= 40 && r.score.totalScore < 70);
  const low = items.filter(r => r.score.totalScore < 40);
  return {
    generatedAt: '2026-06-01T00:00:00Z',
    searchConditions: { keywords: ['playwright testing'], topics: ['playwright'], collectedAt: '2026-06-01T00:00:00Z' },
    repositories: items,
    summary: `${items.length} repositories evaluated.`,
    highPriorityItems: high,
    watchlistItems: watch,
    lowPriorityItems: low,
  };
}

describe('generateHtml', () => {
  it('returns a valid HTML document', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('includes repo fullName', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('example/playwright-utils');
  });

  it('includes repo URL', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('https://github.com/example/playwright-utils');
  });

  it('includes description', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('Playwright utilities for E2E testing');
  });

  it('includes star count', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('320');
  });

  it('includes license', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('MIT');
  });

  it('includes pushedAt date', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('2025-05-01');
  });

  it('includes domain labels', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('test-automation');
    expect(html).toContain('e2e-testing');
  });

  it('includes totalScore', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('75');
  });

  it('includes recommendedUsage', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('Use as a test automation base for client projects');
  });

  it('includes cautionPoints', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('README not fetched in MVP');
  });

  it('shows high priority section for high-score repos', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('High priority');
  });

  it('shows watchlist section for medium-score repos', () => {
    const medium = makeEvaluated();
    medium.score = { ...medium.score, totalScore: 55 };
    const html = generateHtml(makeReport([medium]));
    expect(html).toContain('Watchlist');
  });

  it('shows low priority section for low-score repos', () => {
    const low = makeEvaluated();
    low.score = { ...low.score, totalScore: 20 };
    const html = generateHtml(makeReport([low]));
    expect(html).toContain('Low priority');
  });

  it('escapes HTML special chars in description to prevent XSS', () => {
    const r = makeEvaluated();
    r.candidate.description = '<script>alert("xss")</script>';
    const html = generateHtml(makeReport([r]));
    expect(html).not.toContain('<script>alert(');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes generatedAt timestamp', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('2026-06-01T00:00:00Z');
  });

  it('shows No license warning for repos without license', () => {
    const r = makeEvaluated();
    r.candidate.license = null;
    const html = generateHtml(makeReport([r]));
    expect(html).toContain('No license');
  });

  it('includes score breakdown with dimension name', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('third-party-qa-applicability');
    expect(html).toContain('automation-integration');
  });

  it('includes inference note in score breakdown', () => {
    const html = generateHtml(makeReport([makeEvaluated()]));
    expect(html).toContain('CI not confirmed in MVP');
  });
});
