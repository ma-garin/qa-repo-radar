import type { RepositoryCandidate } from '../models';

interface GitHubLicense {
  spdx_id?: unknown;
}

interface GitHubRepoItem {
  full_name?: unknown;
  html_url?: unknown;
  description?: unknown;
  topics?: unknown;
  language?: unknown;
  stargazers_count?: unknown;
  forks_count?: unknown;
  open_issues_count?: unknown;
  license?: GitHubLicense | null;
  pushed_at?: unknown;
}

interface GitHubSearchResult {
  items?: GitHubRepoItem[];
}

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export interface CollectorOptions {
  token?: string;
  perPage?: number;
  fetchFn?: FetchFn;
}

function safeString(val: unknown): string | null {
  return typeof val === 'string' && val.length > 0 ? val : null;
}

function safeNumber(val: unknown): number {
  return typeof val === 'number' && isFinite(val) ? Math.max(0, Math.round(val)) : 0;
}

function safeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === 'string');
}

function mapItem(item: GitHubRepoItem, collectedAt: string): RepositoryCandidate | null {
  const fullName = safeString(item.full_name);
  if (!fullName) return null;
  const url = safeString(item.html_url) ?? `https://github.com/${fullName}`;
  const spdxId = item.license?.spdx_id;
  const license =
    typeof spdxId === 'string' && spdxId.length > 0 && spdxId !== 'NOASSERTION'
      ? spdxId
      : null;
  return {
    fullName,
    url,
    description: safeString(item.description),
    topics: safeStringArray(item.topics),
    primaryLanguage: safeString(item.language),
    stars: safeNumber(item.stargazers_count),
    forks: safeNumber(item.forks_count),
    openIssues: safeNumber(item.open_issues_count),
    license,
    pushedAt: safeString(item.pushed_at) ?? collectedAt,
    readmeText: null,
    hasCi: false,
    collectedAt,
  };
}

export class GitHubCollector {
  private readonly token: string | undefined;
  private readonly perPage: number;
  private readonly fetchFn: FetchFn;

  constructor(options: CollectorOptions = {}) {
    this.token = options.token ?? process.env['GITHUB_TOKEN'];
    this.perPage = Math.min(options.perPage ?? 30, 100);
    this.fetchFn = options.fetchFn ?? (fetch as FetchFn);
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async searchByKeyword(keyword: string): Promise<RepositoryCandidate[]> {
    const q = encodeURIComponent(`${keyword} fork:false`);
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${this.perPage}`;
    return this.fetchAndMap(url);
  }

  async searchByTopic(topic: string): Promise<RepositoryCandidate[]> {
    const q = encodeURIComponent(`topic:${topic} fork:false`);
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${this.perPage}`;
    return this.fetchAndMap(url);
  }

  private async fetchAndMap(url: string): Promise<RepositoryCandidate[]> {
    const res = await this.fetchFn(url, { headers: this.headers() });
    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status} ${res.statusText}: ${url}`);
    }
    const data = (await res.json()) as GitHubSearchResult;
    const collectedAt = new Date().toISOString();
    const results: RepositoryCandidate[] = [];
    for (const item of data.items ?? []) {
      const mapped = mapItem(item, collectedAt);
      if (mapped) results.push(mapped);
    }
    return results;
  }

  deduplicateByFullName(repos: RepositoryCandidate[]): RepositoryCandidate[] {
    const seen = new Set<string>();
    return repos.filter(r => {
      if (seen.has(r.fullName)) return false;
      seen.add(r.fullName);
      return true;
    });
  }
}
