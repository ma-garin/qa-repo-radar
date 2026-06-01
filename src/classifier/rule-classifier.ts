import type { RepositoryCandidate, ServiceDomain, ClassificationLabel, Evidence } from '../models';
import type { SearchConfig } from '../../config/search-config';

export interface ClassificationResult {
  domains: ServiceDomain[];
  classificationLabels: ClassificationLabel[];
  evidence: Evidence[];
}

const DOMAIN_SIGNALS: Record<ServiceDomain, string[]> = {
  'test-design-support': [
    'pairwise', 'decision table', 'boundary value', 'model based test',
    'test case generat', 'mutation test', 'test design', 'coverage model',
    'equivalence partition',
  ],
  'test-automation': [
    'test automation', 'automated test', 'playwright', 'selenium',
    'cypress', 'pytest', 'vitest', 'jest ', 'automation framework',
    'test runner', 'test framework',
  ],
  'api-testing': [
    'api test', 'api testing', 'contract test', 'openapi', 'rest api test',
    'schema validat', 'postman', 'api mock', 'http test',
  ],
  'e2e-testing': [
    'e2e', 'end to end', 'end-to-end', 'browser automation',
    'visual regression', 'cross browser', 'user journey', 'web test',
    'browser test',
  ],
  'quality-visualization': [
    'test report', 'allure', 'reportportal', 'test dashboard',
    'defect analytic', 'flaky test', 'qa metric', 'coverage report',
    'test result', 'quality dashboard',
  ],
  'verification-pmo': [
    'issue analytic', 'project metric', 'risk dashboard',
    'progress report', 'verification pmo', 'quality governance',
    'test management',
  ],
  'agile-qa': [
    'bdd', 'tdd', 'acceptance criteria', 'quality gate',
    'shift left', 'continuous test', 'ci cd', 'devops quality',
    'agile test', 'specification by example',
  ],
  'exploratory-testing-support': [
    'exploratory test', 'session based test', 'test charter',
    'evidence capture', 'mind map test',
  ],
  'compatibility-testing': [
    'compatibility', 'cross browser', 'browser matrix',
    'device farm', 'responsive test', 'multi browser',
    'cross platform',
  ],
  'non-functional-testing': [
    'performance test', 'load test', 'accessibility test',
    'security test', 'reliability test', 'usability test',
    'stress test', 'a11y',
  ],
  'ai-quality-assurance': [
    'llm evaluation', 'llm eval', 'ai test', 'prompt evaluation',
    'prompt eval', 'hallucination', 'model robustness',
    'ai safety', 'llm benchmark', 'rag evaluation',
  ],
  'qa-process-improvement': [
    'qa metric', 'test maturity', 'process improvement',
    'quality gate', 'engineering productivity', 'quality assurance process',
    'defect prevention', 'qa process',
  ],
};

function norm(text: string): string {
  return text.toLowerCase().replace(/[-_]/g, ' ');
}

function detectDomainsFromText(text: string): Array<{ domain: ServiceDomain; signal: string }> {
  const n = norm(text);
  const results: Array<{ domain: ServiceDomain; signal: string }> = [];
  for (const [domain, signals] of Object.entries(DOMAIN_SIGNALS) as Array<[ServiceDomain, string[]]>) {
    for (const signal of signals) {
      if (n.includes(signal)) {
        results.push({ domain, signal });
        break;
      }
    }
  }
  return results;
}

function inferLabels(domains: ServiceDomain[], totalScore: number): ClassificationLabel[] {
  const labels = new Set<ClassificationLabel>();
  if (totalScore >= 70) labels.add('customer-proposal-ready');
  if (
    domains.includes('test-automation') ||
    domains.includes('api-testing') ||
    domains.includes('e2e-testing')
  ) labels.add('automation-foundation');
  if (domains.includes('test-design-support')) labels.add('test-design-support');
  if (domains.includes('quality-visualization')) labels.add('quality-visualization');
  if (domains.includes('verification-pmo')) labels.add('qa-pmo-support');
  if (domains.includes('agile-qa')) labels.add('agile-qa-support');
  if (domains.includes('ai-quality-assurance')) labels.add('ai-quality-assurance');
  if (domains.includes('qa-process-improvement')) labels.add('internal-standardization-candidate');
  if (labels.size === 0) {
    labels.add(totalScore >= 40 ? 'watchlist' : 'low-priority');
  }
  return [...labels];
}

export function classify(
  candidate: RepositoryCandidate,
  config: SearchConfig,
): ClassificationResult {
  const evidence: Evidence[] = [];
  const domainSet = new Set<ServiceDomain>();

  // 1. domainHints from search-config topics
  for (const { topic, domainHints } of config.topics) {
    if (candidate.topics.some(t => norm(t) === norm(topic))) {
      for (const d of domainHints) domainSet.add(d);
      evidence.push({
        type: 'fact',
        source: 'topics',
        content: `Topic "${topic}" → domainHints: ${domainHints.join(', ')}`,
      });
    }
  }

  // 2. domainHints from search-config keywords (description match)
  if (candidate.description) {
    for (const { keyword, domainHints } of config.keywords) {
      if (norm(candidate.description).includes(norm(keyword))) {
        for (const d of domainHints) domainSet.add(d);
        evidence.push({
          type: 'inference',
          source: 'description',
          content: `Keyword "${keyword}" found in description → ${domainHints.join(', ')}`,
        });
      }
    }
  }

  // 3. Description freetext signals
  if (candidate.description) {
    for (const { domain, signal } of detectDomainsFromText(candidate.description)) {
      if (!domainSet.has(domain)) {
        domainSet.add(domain);
        evidence.push({
          type: 'inference',
          source: 'description',
          content: `"${signal}" in description → ${domain}`,
        });
      }
    }
  }

  // 4. Topics freetext signals
  const topicsText = candidate.topics.join(' ');
  for (const { domain, signal } of detectDomainsFromText(topicsText)) {
    if (!domainSet.has(domain)) {
      domainSet.add(domain);
      evidence.push({
        type: 'inference',
        source: 'topics',
        content: `"${signal}" in topics → ${domain}`,
      });
    }
  }

  // 5. Repo name signals
  const repoName = candidate.fullName.split('/')[1] ?? '';
  for (const { domain, signal } of detectDomainsFromText(repoName)) {
    if (!domainSet.has(domain)) {
      domainSet.add(domain);
      evidence.push({
        type: 'inference',
        source: 'other',
        content: `"${signal}" in repo name → ${domain}`,
      });
    }
  }

  const domains = [...domainSet];
  const roughScore = domains.length * 10 + (candidate.stars > 100 ? 20 : 0);
  const classificationLabels = inferLabels(domains, roughScore);

  return { domains, classificationLabels, evidence };
}
