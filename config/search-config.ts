import type { ServiceDomain } from '../src/models';

export interface SearchKeyword {
  keyword: string;
  domainHints: ServiceDomain[];
}

export interface SearchTopic {
  topic: string;
  domainHints: ServiceDomain[];
}

export interface CollectionLimits {
  perKeyword: number;
  perTopic: number;
}

export interface SearchConfig {
  keywords: SearchKeyword[];
  topics: SearchTopic[];
  limits: CollectionLimits;
}

export const searchConfig: SearchConfig = {
  limits: {
    perKeyword: 20,
    perTopic: 20,
  },

  keywords: [
    // Test design
    { keyword: 'test design',             domainHints: ['test-design-support'] },
    { keyword: 'pairwise testing',        domainHints: ['test-design-support'] },
    { keyword: 'decision table testing',  domainHints: ['test-design-support'] },
    { keyword: 'model based testing',     domainHints: ['test-design-support'] },
    { keyword: 'mutation testing',        domainHints: ['test-design-support', 'qa-process-improvement'] },

    // Test automation
    { keyword: 'test automation',         domainHints: ['test-automation', 'agile-qa'] },
    { keyword: 'playwright testing',      domainHints: ['test-automation', 'e2e-testing'] },
    { keyword: 'selenium testing',        domainHints: ['test-automation', 'e2e-testing', 'compatibility-testing'] },
    { keyword: 'cypress testing',         domainHints: ['test-automation', 'e2e-testing'] },
    { keyword: 'visual regression testing', domainHints: ['e2e-testing', 'compatibility-testing'] },
    { keyword: 'browser compatibility testing', domainHints: ['compatibility-testing', 'e2e-testing'] },

    // API testing
    { keyword: 'api testing',             domainHints: ['api-testing'] },
    { keyword: 'contract testing',        domainHints: ['api-testing'] },
    { keyword: 'openapi testing',         domainHints: ['api-testing'] },

    // Exploratory testing
    { keyword: 'exploratory testing',     domainHints: ['exploratory-testing-support'] },
    { keyword: 'session based testing',   domainHints: ['exploratory-testing-support'] },

    // Quality visualization
    { keyword: 'test reporting',          domainHints: ['quality-visualization'] },
    { keyword: 'allure report',           domainHints: ['quality-visualization', 'test-automation'] },
    { keyword: 'reportportal',            domainHints: ['quality-visualization'] },
    { keyword: 'flaky test',              domainHints: ['quality-visualization', 'qa-process-improvement'] },
    { keyword: 'defect analytics',        domainHints: ['quality-visualization', 'verification-pmo'] },
    { keyword: 'qa metrics',              domainHints: ['quality-visualization', 'verification-pmo', 'qa-process-improvement'] },

    // Non-functional testing
    { keyword: 'accessibility testing',   domainHints: ['non-functional-testing'] },
    { keyword: 'performance testing',     domainHints: ['non-functional-testing'] },

    // QA process
    { keyword: 'quality gate',            domainHints: ['agile-qa', 'qa-process-improvement'] },

    // AI quality assurance
    { keyword: 'llm evaluation',          domainHints: ['ai-quality-assurance'] },
    { keyword: 'ai testing',              domainHints: ['ai-quality-assurance'] },
    { keyword: 'prompt evaluation',       domainHints: ['ai-quality-assurance'] },
  ],

  topics: [
    // General QA
    { topic: 'testing',            domainHints: ['test-automation', 'test-design-support'] },
    { topic: 'qa',                 domainHints: ['qa-process-improvement'] },
    { topic: 'quality-assurance',  domainHints: ['qa-process-improvement'] },

    // Test automation frameworks
    { topic: 'test-automation',    domainHints: ['test-automation'] },
    { topic: 'playwright',         domainHints: ['test-automation', 'e2e-testing'] },
    { topic: 'selenium',           domainHints: ['test-automation', 'e2e-testing', 'compatibility-testing'] },
    { topic: 'cypress',            domainHints: ['test-automation', 'e2e-testing'] },
    { topic: 'pytest',             domainHints: ['test-automation'] },
    { topic: 'vitest',             domainHints: ['test-automation'] },

    // API testing
    { topic: 'api-testing',        domainHints: ['api-testing'] },
    { topic: 'contract-testing',   domainHints: ['api-testing'] },
    { topic: 'openapi',            domainHints: ['api-testing'] },

    // Agile QA
    { topic: 'bdd',                domainHints: ['agile-qa', 'test-design-support'] },
    { topic: 'tdd',                domainHints: ['agile-qa'] },
    { topic: 'ci-cd',              domainHints: ['agile-qa', 'qa-process-improvement'] },
    { topic: 'devops',             domainHints: ['agile-qa'] },

    // Quality visualization
    { topic: 'test-reporting',     domainHints: ['quality-visualization'] },
    { topic: 'allure',             domainHints: ['quality-visualization', 'test-automation'] },
    { topic: 'reportportal',       domainHints: ['quality-visualization'] },

    // Non-functional
    { topic: 'accessibility',      domainHints: ['non-functional-testing'] },
    { topic: 'performance-testing', domainHints: ['non-functional-testing'] },

    // Test design
    { topic: 'mutation-testing',   domainHints: ['test-design-support', 'qa-process-improvement'] },
    { topic: 'visual-regression',  domainHints: ['e2e-testing', 'compatibility-testing'] },

    // AI quality assurance
    { topic: 'llm-evaluation',     domainHints: ['ai-quality-assurance'] },
    { topic: 'ai-testing',         domainHints: ['ai-quality-assurance'] },
  ],
};
