import { describe, it, expect, vi } from 'vitest';
import { GitHubCollector } from '../src/collector/github-collector';
import type { RepositoryCandidate } from '../src/models';

function makeItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    full_name: 'example/playwright-utils',
    html_url: 'https://github.com/example/playwright-utils',
    description: 'Playwright test utilities',
    topics: ['playwright', 'testing', 'e2e'],
    language: 'TypeScript',
    stargazers_count: 250,
    forks_count: 30,
    open_issues_count: 5,
    license: { spdx_id: 'MIT' },
    pushed_at: '2025-06-01T00:00:00Z',
    ...overrides,
  };
}

function mockFetch(items: Record<string, unknown>[]): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items }),
  }) as unknown as typeof fetch;
}

describe('GitHubCollector', () => {
  describe('searchByKeyword', () => {
    it('builds correct search URL with keyword', async () => {
      const fetchFn = mockFetch([makeItem()]);
      const collector = new GitHubCollector({ fetchFn });
      await collector.searchByKeyword('playwright testing');
      const calledUrl = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('search/repositories');
      expect(calledUrl).toContain(encodeURIComponent('playwright testing'));
    });

    it('includes Authorization header when token is provided', async () => {
      const fetchFn = mockFetch([makeItem()]);
      const collector = new GitHubCollector({ token: 'ghp_test123', fetchFn });
      await collector.searchByKeyword('test');
      const headers = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer ghp_test123');
    });

    it('omits Authorization header when no token', async () => {
      const fetchFn = mockFetch([makeItem()]);
      const originalToken = process.env['GITHUB_TOKEN'];
      delete process.env['GITHUB_TOKEN'];
      const collector = new GitHubCollector({ fetchFn });
      await collector.searchByKeyword('test');
      const headers = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
      if (originalToken !== undefined) process.env['GITHUB_TOKEN'] = originalToken;
    });

    it('maps GitHub API response to RepositoryCandidate', async () => {
      const collector = new GitHubCollector({ fetchFn: mockFetch([makeItem()]) });
      const results = await collector.searchByKeyword('playwright');
      expect(results).toHaveLength(1);
      const r: RepositoryCandidate = results[0];
      expect(r.fullName).toBe('example/playwright-utils');
      expect(r.url).toBe('https://github.com/example/playwright-utils');
      expect(r.description).toBe('Playwright test utilities');
      expect(r.topics).toContain('playwright');
      expect(r.primaryLanguage).toBe('TypeScript');
      expect(r.stars).toBe(250);
      expect(r.forks).toBe(30);
      expect(r.openIssues).toBe(5);
      expect(r.license).toBe('MIT');
      expect(r.readmeText).toBeNull();
      expect(r.hasCi).toBe(false);
    });

    it('sets license to null for NOASSERTION', async () => {
      const collector = new GitHubCollector({ fetchFn: mockFetch([makeItem({ license: { spdx_id: 'NOASSERTION' } })]) });
      const [r] = await collector.searchByKeyword('test');
      expect(r.license).toBeNull();
    });

    it('sets license to null when license field is null', async () => {
      const collector = new GitHubCollector({ fetchFn: mockFetch([makeItem({ license: null })]) });
      const [r] = await collector.searchByKeyword('test');
      expect(r.license).toBeNull();
    });

    it('handles missing description gracefully', async () => {
      const collector = new GitHubCollector({ fetchFn: mockFetch([makeItem({ description: null })]) });
      const [r] = await collector.searchByKeyword('test');
      expect(r.description).toBeNull();
    });

    it('handles missing topics as empty array', async () => {
      const collector = new GitHubCollector({ fetchFn: mockFetch([makeItem({ topics: null })]) });
      const [r] = await collector.searchByKeyword('test');
      expect(r.topics).toEqual([]);
    });

    it('handles zero/missing numeric fields', async () => {
      const collector = new GitHubCollector({
        fetchFn: mockFetch([makeItem({ stargazers_count: undefined, forks_count: null, open_issues_count: -1 })]),
      });
      const [r] = await collector.searchByKeyword('test');
      expect(r.stars).toBe(0);
      expect(r.forks).toBe(0);
      expect(r.openIssues).toBe(0);
    });

    it('skips items missing full_name', async () => {
      const collector = new GitHubCollector({ fetchFn: mockFetch([makeItem({ full_name: null })]) });
      const results = await collector.searchByKeyword('test');
      expect(results).toHaveLength(0);
    });

    it('throws on non-ok API response', async () => {
      const failFetch = vi.fn().mockResolvedValue({ ok: false, status: 403, statusText: 'Forbidden' }) as unknown as typeof fetch;
      const collector = new GitHubCollector({ fetchFn: failFetch });
      await expect(collector.searchByKeyword('test')).rejects.toThrow('403');
    });
  });

  describe('searchByTopic', () => {
    it('builds correct topic search URL', async () => {
      const fetchFn = mockFetch([makeItem()]);
      const collector = new GitHubCollector({ fetchFn });
      await collector.searchByTopic('playwright');
      const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('topic%3Aplaywright');
    });
  });

  describe('deduplicateByFullName', () => {
    it('removes duplicate fullNames, keeps first occurrence', () => {
      const collector = new GitHubCollector();
      const a = { fullName: 'org/repo', stars: 100 } as RepositoryCandidate;
      const b = { fullName: 'org/repo', stars: 200 } as RepositoryCandidate;
      const c = { fullName: 'org/other', stars: 50 } as RepositoryCandidate;
      const result = collector.deduplicateByFullName([a, b, c]);
      expect(result).toHaveLength(2);
      expect(result[0].stars).toBe(100);
    });
  });
});
