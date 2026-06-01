import { describe, it, expect } from 'vitest';
import { classify } from '../src/classifier/rule-classifier';
import type { RepositoryCandidate } from '../src/models';
import { searchConfig } from '../config/search-config';

function makeCandidate(overrides: Partial<RepositoryCandidate> = {}): RepositoryCandidate {
  return {
    fullName: 'example/repo',
    url: 'https://github.com/example/repo',
    description: null,
    topics: [],
    primaryLanguage: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    license: 'MIT',
    pushedAt: '2025-06-01T00:00:00Z',
    readmeText: null,
    hasCi: false,
    collectedAt: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('classify', () => {
  it('detects test-automation domain from playwright topic', () => {
    const c = makeCandidate({ topics: ['playwright', 'testing'] });
    const { domains } = classify(c, searchConfig);
    expect(domains).toContain('test-automation');
    expect(domains).toContain('e2e-testing');
  });

  it('detects api-testing domain from description', () => {
    const c = makeCandidate({ description: 'A tool for contract testing and openapi validation' });
    const { domains } = classify(c, searchConfig);
    expect(domains).toContain('api-testing');
  });

  it('detects quality-visualization from description keyword', () => {
    const c = makeCandidate({ description: 'Allure report generation and test reporting dashboard' });
    const { domains } = classify(c, searchConfig);
    expect(domains).toContain('quality-visualization');
  });

  it('detects ai-quality-assurance from description', () => {
    const c = makeCandidate({ description: 'Framework for llm evaluation and prompt evaluation' });
    const { domains } = classify(c, searchConfig);
    expect(domains).toContain('ai-quality-assurance');
  });

  it('detects non-functional-testing from topic', () => {
    const c = makeCandidate({ topics: ['accessibility', 'a11y'] });
    const { domains } = classify(c, searchConfig);
    expect(domains).toContain('non-functional-testing');
  });

  it('detects agile-qa from bdd topic', () => {
    const c = makeCandidate({ topics: ['bdd', 'tdd'] });
    const { domains } = classify(c, searchConfig);
    expect(domains).toContain('agile-qa');
  });

  it('returns empty domains for completely unrelated repo', () => {
    const c = makeCandidate({ description: 'A cooking recipe management app', topics: ['food', 'recipes'] });
    const { domains } = classify(c, searchConfig);
    expect(domains).toHaveLength(0);
  });

  it('produces fact evidence from matching search-config topic', () => {
    const c = makeCandidate({ topics: ['playwright'] });
    const { evidence } = classify(c, searchConfig);
    const factEvidence = evidence.filter(e => e.type === 'fact');
    expect(factEvidence.length).toBeGreaterThan(0);
    expect(factEvidence[0].source).toBe('topics');
  });

  it('produces inference evidence from description signal', () => {
    const c = makeCandidate({ description: 'visual regression testing for web apps' });
    const { evidence } = classify(c, searchConfig);
    const inferEvidence = evidence.filter(e => e.type === 'inference');
    expect(inferEvidence.length).toBeGreaterThan(0);
  });

  it('labels high-star QA repo as customer-proposal-ready or automation-foundation', () => {
    const c = makeCandidate({ topics: ['playwright', 'testing', 'e2e'], stars: 500 });
    const { classificationLabels } = classify(c, searchConfig);
    const hasLabel = classificationLabels.includes('automation-foundation') ||
      classificationLabels.includes('customer-proposal-ready');
    expect(hasLabel).toBe(true);
  });

  it('labels unrelated repo as low-priority', () => {
    const c = makeCandidate({ description: 'Personal portfolio website', topics: [] });
    const { classificationLabels } = classify(c, searchConfig);
    expect(classificationLabels).toContain('low-priority');
  });

  it('returns no duplicate domains', () => {
    const c = makeCandidate({
      description: 'playwright test automation e2e testing framework',
      topics: ['playwright', 'e2e'],
    });
    const { domains } = classify(c, searchConfig);
    const unique = new Set(domains);
    expect(unique.size).toBe(domains.length);
  });
});
