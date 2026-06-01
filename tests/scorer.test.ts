import { describe, it, expect } from 'vitest';
import { score } from '../src/scorer/rule-scorer';
import type { RepositoryCandidate, ServiceDomain } from '../src/models';

const RECENT = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const STALE = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();

function makeCandidate(overrides: Partial<RepositoryCandidate> = {}): RepositoryCandidate {
  return {
    fullName: 'example/repo',
    url: 'https://github.com/example/repo',
    description: 'A QA tool for test automation',
    topics: ['testing', 'playwright', 'e2e'],
    primaryLanguage: 'TypeScript',
    stars: 300,
    forks: 40,
    openIssues: 10,
    license: 'MIT',
    pushedAt: RECENT,
    readmeText: null,
    hasCi: false,
    collectedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('score', () => {
  it('QA-relevant repo scores higher than non-QA repo', () => {
    const qa = score({ candidate: makeCandidate(), domains: ['test-automation', 'e2e-testing'] });
    const nonQa = score({ candidate: makeCandidate({ description: 'A cooking app' }), domains: [] });
    expect(qa.evaluationScore.totalScore).toBeGreaterThan(nonQa.evaluationScore.totalScore);
  });

  it('stale repo receives staleness penalty', () => {
    const fresh = score({ candidate: makeCandidate({ pushedAt: RECENT }), domains: ['test-automation'] });
    const old = score({ candidate: makeCandidate({ pushedAt: STALE }), domains: ['test-automation'] });
    const oldPenalties = old.evaluationScore.penalties.map(p => p.reason);
    expect(oldPenalties.some(r => r.toLowerCase().includes('year'))).toBe(true);
    expect(fresh.evaluationScore.totalScore).toBeGreaterThan(old.evaluationScore.totalScore);
  });

  it('repo without license receives license penalty', () => {
    const result = score({ candidate: makeCandidate({ license: null }), domains: ['test-automation'] });
    const penalties = result.evaluationScore.penalties;
    expect(penalties.some(p => p.reason.toLowerCase().includes('license'))).toBe(true);
  });

  it('repo with no QA relevance receives no-qa penalty of -30', () => {
    const result = score({ candidate: makeCandidate(), domains: [] });
    const noQaPenalty = result.evaluationScore.penalties.find(p => p.points === -30 && p.reason.includes('QA'));
    expect(noQaPenalty).toBeDefined();
  });

  it('third-party-qa-applicability is highest scoring component for multi-domain QA repo', () => {
    const domains: ServiceDomain[] = ['test-automation', 'e2e-testing', 'api-testing'];
    const result = score({ candidate: makeCandidate(), domains });
    const qaComp = result.evaluationScore.scoreComponents.find(c => c.dimension === 'third-party-qa-applicability');
    expect(qaComp).toBeDefined();
    expect(qaComp!.points).toBe(30);
  });

  it('stars alone do not make repo high-value: popular non-QA repo stays low', () => {
    const result = score({
      candidate: makeCandidate({ stars: 50000, description: 'Game engine framework', topics: [] }),
      domains: [],
    });
    expect(result.evaluationScore.totalScore).toBeLessThan(40);
  });

  it('totalScore is never negative', () => {
    const result = score({
      candidate: makeCandidate({ pushedAt: STALE, license: null, description: '' }),
      domains: [],
    });
    expect(result.evaluationScore.totalScore).toBeGreaterThanOrEqual(0);
  });

  it('high-score repo gets high usefulnessLevel recommendation', () => {
    const domains: ServiceDomain[] = ['test-automation', 'e2e-testing', 'api-testing'];
    const result = score({
      candidate: makeCandidate({
        description: 'Comprehensive test automation framework for end-to-end and API testing',
        topics: ['playwright', 'e2e', 'testing'],
        stars: 600,
        license: 'MIT',
        pushedAt: RECENT,
      }),
      domains,
    });
    expect(result.evaluationScore.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.recommendation.usefulnessLevel).toBe('high');
  });

  it('caution point added when license is missing', () => {
    const result = score({ candidate: makeCandidate({ license: null }), domains: ['test-automation'] });
    expect(result.recommendation.cautionPoints.some(p => p.toLowerCase().includes('license'))).toBe(true);
  });

  it('score components contain evidence strings', () => {
    const result = score({ candidate: makeCandidate(), domains: ['test-automation'] });
    for (const comp of result.evaluationScore.scoreComponents) {
      expect(comp.evidence.length).toBeGreaterThan(0);
    }
  });

  it('test-design domain boosts test-design-usefulness dimension', () => {
    const result = score({ candidate: makeCandidate(), domains: ['test-design-support'] });
    const tdComp = result.evaluationScore.scoreComponents.find(c => c.dimension === 'test-design-usefulness');
    expect(tdComp).toBeDefined();
    expect(tdComp!.points).toBe(20);
  });

  it('inference notes are populated when CI info is missing', () => {
    const result = score({ candidate: makeCandidate({ hasCi: false }), domains: ['test-automation'] });
    expect(result.evaluationScore.inferenceNotes.some(n => n.toLowerCase().includes('ci'))).toBe(true);
  });
});
