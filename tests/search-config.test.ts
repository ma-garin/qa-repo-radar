import { describe, it, expect } from 'vitest';
import { searchConfig } from '../config/search-config';

describe('searchConfig', () => {
  it('keywords is non-empty', () => {
    expect(searchConfig.keywords.length).toBeGreaterThan(0);
  });

  it('topics is non-empty', () => {
    expect(searchConfig.topics.length).toBeGreaterThan(0);
  });

  it('keyword count is within MVP range', () => {
    expect(searchConfig.keywords.length).toBeGreaterThanOrEqual(20);
    expect(searchConfig.keywords.length).toBeLessThanOrEqual(40);
  });

  it('topic count is within MVP range', () => {
    expect(searchConfig.topics.length).toBeGreaterThanOrEqual(20);
    expect(searchConfig.topics.length).toBeLessThanOrEqual(40);
  });

  it('every keyword has at least one domainHint', () => {
    for (const entry of searchConfig.keywords) {
      expect(entry.domainHints.length, `keyword "${entry.keyword}" has no domainHints`).toBeGreaterThan(0);
    }
  });

  it('every topic has at least one domainHint', () => {
    for (const entry of searchConfig.topics) {
      expect(entry.domainHints.length, `topic "${entry.topic}" has no domainHints`).toBeGreaterThan(0);
    }
  });

  it('perKeyword is a positive number', () => {
    expect(searchConfig.limits.perKeyword).toBeGreaterThan(0);
  });

  it('perTopic is a positive number', () => {
    expect(searchConfig.limits.perTopic).toBeGreaterThan(0);
  });

  it('no duplicate keywords', () => {
    const seen = new Set<string>();
    for (const entry of searchConfig.keywords) {
      expect(seen.has(entry.keyword), `duplicate keyword: "${entry.keyword}"`).toBe(false);
      seen.add(entry.keyword);
    }
  });

  it('no duplicate topics', () => {
    const seen = new Set<string>();
    for (const entry of searchConfig.topics) {
      expect(seen.has(entry.topic), `duplicate topic: "${entry.topic}"`).toBe(false);
      seen.add(entry.topic);
    }
  });
});
