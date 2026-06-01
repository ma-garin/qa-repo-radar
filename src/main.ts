import { GitHubCollector } from './collector/github-collector';
import { classify } from './classifier/rule-classifier';
import { score } from './scorer/rule-scorer';
import { writeReport } from './reporter/html-reporter';
import { searchConfig } from '../config/search-config';
import type { EvaluatedRepository, Report } from './models';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT = parseInt(process.env['LIMIT_PER_QUERY'] ?? '5', 10);
const OUTPUT_DIR = 'reports';

async function main(): Promise<void> {
  console.log('QA Repo Radar — Minimum MVP');
  const tokenSet = !!process.env['GITHUB_TOKEN'];
  console.log(`GITHUB_TOKEN: ${tokenSet ? 'set' : 'not set (rate limit applies)'}`);

  const collector = new GitHubCollector({ perPage: LIMIT });

  // Use a small sample for MVP speed
  const keywords = searchConfig.keywords.slice(0, 4).map(k => k.keyword);
  const topics = searchConfig.topics.slice(0, 3).map(t => t.topic);

  console.log(`\nCollecting: keywords=[${keywords.join(', ')}] | topics=[${topics.join(', ')}]`);

  let candidates = [];

  for (const kw of keywords) {
    try {
      const results = await collector.searchByKeyword(kw);
      candidates.push(...results);
      console.log(`  keyword "${kw}": ${results.length} result(s)`);
    } catch (err) {
      console.error(`  keyword "${kw}" failed: ${(err as Error).message}`);
    }
  }

  for (const topic of topics) {
    try {
      const results = await collector.searchByTopic(topic);
      candidates.push(...results);
      console.log(`  topic "${topic}": ${results.length} result(s)`);
    } catch (err) {
      console.error(`  topic "${topic}" failed: ${(err as Error).message}`);
    }
  }

  candidates = collector.deduplicateByFullName(candidates);
  console.log(`\nTotal after dedup: ${candidates.length}`);

  if (candidates.length === 0) {
    console.error('No candidates collected. Check your network or set GITHUB_TOKEN.');
    process.exit(1);
  }

  const evaluated: EvaluatedRepository[] = candidates.map(candidate => {
    const { domains, classificationLabels, evidence: clsEvidence } = classify(candidate, searchConfig);
    const { evaluationScore, recommendation } = score({ candidate, domains });
    evaluationScore.evidence = [...clsEvidence, ...evaluationScore.evidence];
    return { candidate, domains, classificationLabels, score: evaluationScore, recommendation };
  });

  evaluated.sort((a, b) => b.score.totalScore - a.score.totalScore);

  const highPriorityItems = evaluated.filter(r => r.score.totalScore >= 70);
  const watchlistItems = evaluated.filter(r => r.score.totalScore >= 40 && r.score.totalScore < 70);
  const lowPriorityItems = evaluated.filter(r => r.score.totalScore < 40);

  const now = new Date().toISOString();
  const report: Report = {
    generatedAt: now,
    searchConditions: { keywords, topics, collectedAt: now },
    repositories: evaluated,
    summary: `${evaluated.length} repositories evaluated. High: ${highPriorityItems.length}, Watchlist: ${watchlistItems.length}, Low: ${lowPriorityItems.length}.`,
    highPriorityItems,
    watchlistItems,
    lowPriorityItems,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const jsonPath = join(OUTPUT_DIR, 'repositories.json');
  writeFileSync(jsonPath, JSON.stringify(evaluated.map(r => r.candidate), null, 2), 'utf-8');

  const htmlPath = join(OUTPUT_DIR, 'index.html');
  writeReport(report, htmlPath);

  console.log(`\nReport generated:`);
  console.log(`  HTML : ${htmlPath}`);
  console.log(`  JSON : ${jsonPath}`);
  console.log(`  High : ${highPriorityItems.length} | Watch: ${watchlistItems.length} | Low: ${lowPriorityItems.length}`);
}

main().catch(err => {
  console.error('\nFatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
