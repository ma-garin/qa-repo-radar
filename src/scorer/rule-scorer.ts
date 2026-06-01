import type {
  RepositoryCandidate,
  ServiceDomain,
  EvaluationScore,
  ScoreComponent,
  ScorePenalty,
  Evidence,
  Recommendation,
} from '../models';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const QA_DOMAINS = new Set<ServiceDomain>([
  'test-automation',
  'api-testing',
  'e2e-testing',
  'test-design-support',
  'quality-visualization',
  'exploratory-testing-support',
  'compatibility-testing',
  'non-functional-testing',
  'ai-quality-assurance',
  'qa-process-improvement',
  'verification-pmo',
  'agile-qa',
]);

function monthsAgo(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (30 * 24 * 60 * 60 * 1000));
}

function isStale(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > ONE_YEAR_MS;
}

export interface ScoringInput {
  candidate: RepositoryCandidate;
  domains: ServiceDomain[];
}

export interface ScoringResult {
  evaluationScore: EvaluationScore;
  recommendation: Recommendation;
}

export function score(input: ScoringInput): ScoringResult {
  const { candidate: c, domains } = input;
  const components: ScoreComponent[] = [];
  const penalties: ScorePenalty[] = [];
  const evidence: Evidence[] = [];
  const inferenceNotes: string[] = [];

  const qaRelevant = domains.filter(d => QA_DOMAINS.has(d));
  const hasQa = qaRelevant.length > 0;
  const stale = isStale(c.pushedAt);
  const months = monthsAgo(c.pushedAt);
  const descLen = c.description?.length ?? 0;

  // 1. Third-party QA applicability (max 30) — highest weight
  const qaPoints = qaRelevant.length >= 3 ? 30 : qaRelevant.length === 2 ? 22 : qaRelevant.length === 1 ? 15 : 0;
  if (qaPoints > 0) {
    components.push({
      dimension: 'third-party-qa-applicability',
      points: qaPoints,
      evidence: `${qaRelevant.length} QA domain(s): ${qaRelevant.join(', ')}`,
    });
    evidence.push({ type: 'inference', source: 'topics', content: `QA domains: ${qaRelevant.join(', ')}` });
  }

  // 2. Customer explanation value (max 25)
  let explainPts = descLen > 80 ? 20 : descLen > 30 ? 12 : descLen > 0 ? 6 : 0;
  if (c.topics.length >= 3) explainPts = Math.min(explainPts + 5, 25);
  if (explainPts > 0) {
    components.push({
      dimension: 'customer-explanation-value',
      points: explainPts,
      evidence: `description length=${descLen}, topics=${c.topics.length}`,
    });
    if (descLen > 30) evidence.push({ type: 'fact', source: 'description', content: `description: "${c.description?.slice(0, 80)}"` });
    if (c.topics.length > 0) evidence.push({ type: 'fact', source: 'topics', content: `topics: ${c.topics.join(', ')}` });
  }

  // 3. Test design usefulness (max 25)
  if (domains.includes('test-design-support') || domains.includes('test-automation')) {
    const tdPts = domains.includes('test-design-support') ? 20 : 12;
    components.push({
      dimension: 'test-design-usefulness',
      points: tdPts,
      evidence: 'test-design or test-automation domain detected',
    });
    inferenceNotes.push('Test design usefulness inferred from domain classification');
  }

  // 4. Quality risk reduction (max 20)
  if (domains.includes('quality-visualization') || domains.includes('qa-process-improvement')) {
    components.push({ dimension: 'quality-risk-reduction', points: 15, evidence: 'quality-visualization or qa-process-improvement domain' });
  } else if (hasQa && c.stars > 200) {
    components.push({ dimension: 'quality-risk-reduction', points: 8, evidence: `Popular QA tool (${c.stars} stars)` });
    inferenceNotes.push('Risk reduction inferred from popularity + QA relevance');
  }

  // 5. Automation integration (max 20)
  if (domains.includes('test-automation') || domains.includes('api-testing') || domains.includes('e2e-testing')) {
    const autoPts = c.hasCi ? 20 : 14;
    components.push({
      dimension: 'automation-integration',
      points: autoPts,
      evidence: c.hasCi ? 'CI present + automation domain' : 'Automation domain detected (CI not confirmed in MVP)',
    });
    if (!c.hasCi) inferenceNotes.push('CI config not fetched in MVP; automation integration inferred from domain');
  }

  // 6. Standardization potential (max 20)
  if (domains.includes('qa-process-improvement') || domains.includes('agile-qa') || domains.includes('verification-pmo')) {
    components.push({ dimension: 'standardization-potential', points: 16, evidence: 'process improvement / agile-qa / pmo domain' });
  } else if (domains.includes('test-design-support')) {
    components.push({ dimension: 'standardization-potential', points: 10, evidence: 'test-design-support often becomes internal standard' });
    inferenceNotes.push('Standardization potential inferred from test-design domain');
  }

  // 7. Documentation quality (max 15)
  const hasReadme = typeof c.readmeText === 'string' && c.readmeText.length > 100;
  if (hasReadme) {
    components.push({ dimension: 'documentation-quality', points: 15, evidence: `README present (${c.readmeText!.length} chars)` });
    evidence.push({ type: 'fact', source: 'readme', content: `README length: ${c.readmeText!.length}` });
  } else if (descLen > 30) {
    components.push({ dimension: 'documentation-quality', points: 6, evidence: 'Description present; README not fetched in MVP' });
    inferenceNotes.push('Documentation quality estimated from description — README not fetched');
  }

  // 8. License clarity (max 15)
  if (c.license) {
    components.push({ dimension: 'license-clarity', points: 15, evidence: `License: ${c.license}` });
    evidence.push({ type: 'fact', source: 'license', content: `License: ${c.license}` });
  }

  // 9. Maintenance freshness (max 10)
  if (!stale) {
    const freshPts = months <= 3 ? 10 : months <= 6 ? 8 : 5;
    components.push({ dimension: 'maintenance-freshness', points: freshPts, evidence: `Updated ${months} month(s) ago` });
  }
  evidence.push({
    type: 'fact',
    source: 'update-date',
    content: `pushedAt: ${c.pushedAt} (${months} months ago)${stale ? ' — STALE' : ''}`,
  });

  // 10. Adoption feasibility (max 10)
  if (c.stars >= 500) {
    components.push({ dimension: 'adoption-feasibility', points: 8, evidence: `${c.stars} stars — active community` });
    inferenceNotes.push('Adoption feasibility inferred from star count; not a direct quality signal');
  } else if (c.stars >= 50) {
    components.push({ dimension: 'adoption-feasibility', points: 5, evidence: `${c.stars} stars` });
    inferenceNotes.push('Adoption feasibility inferred from star count');
  }

  // --- Penalties ---
  if (!hasQa) {
    penalties.push({ reason: 'No clear QA or testing relevance detected', points: -30 });
  }
  if (stale) {
    penalties.push({ reason: `No meaningful update for over 1 year (${months} months ago)`, points: -30 });
  }
  if (descLen <= 10 && !c.readmeText) {
    penalties.push({ reason: 'README too thin to evaluate; description also missing', points: -20 });
  }
  if (!c.license) {
    penalties.push({ reason: 'License missing or unclear', points: -15 });
  }
  if (!hasQa && c.stars > 1000) {
    penalties.push({ reason: 'Popular but no detected QA service delivery value', points: -20 });
  }

  const rawTotal = components.reduce((s, x) => s + x.points, 0);
  const penaltyTotal = penalties.reduce((s, p) => s + p.points, 0);
  const totalScore = Math.max(0, rawTotal + penaltyTotal);

  // --- Recommendation ---
  const usefulnessLevel: 'high' | 'medium' | 'low' =
    totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low';

  const cautionPoints: string[] = [];
  if (!c.license) cautionPoints.push('License missing — confirm before using in client projects');
  if (stale) cautionPoints.push(`Not updated for ${months} months — verify if still maintained`);
  if (!hasQa) cautionPoints.push('QA relevance not confirmed — manual review recommended');
  if (!c.readmeText) cautionPoints.push('README not fetched in MVP — documentation quality unconfirmed');

  const recommendation: Recommendation = {
    usefulnessLevel,
    recommendedUsage: buildUsage(domains, c),
    targetUser: buildTargetUser(domains),
    adoptionDifficulty: c.stars >= 500 && c.license ? 'easy' : c.stars >= 50 ? 'moderate' : 'hard',
    customerExplanationValue: explainPts >= 18 ? 'high' : explainPts >= 10 ? 'medium' : 'low',
    internalStandardizationValue: totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low',
    cautionPoints,
  };

  return {
    evaluationScore: { totalScore, scoreComponents: components, penalties, evidence, inferenceNotes },
    recommendation,
  };
}

function buildUsage(domains: ServiceDomain[], c: RepositoryCandidate): string {
  if (domains.includes('test-automation') || domains.includes('e2e-testing')) {
    return 'Evaluate as a test automation foundation for client projects';
  }
  if (domains.includes('api-testing')) {
    return 'Use for API verification and contract testing on client engagements';
  }
  if (domains.includes('test-design-support')) {
    return 'Adopt as a test design aid for coverage modelling and case generation';
  }
  if (domains.includes('quality-visualization')) {
    return 'Deploy for quality status visualization and customer-facing reporting';
  }
  if (domains.includes('ai-quality-assurance')) {
    return 'Explore for AI/LLM quality assurance and evaluation workflows';
  }
  if (domains.includes('qa-process-improvement')) {
    return 'Use for QA process maturity assessment and improvement planning';
  }
  return `Evaluate for QA value — ${c.description?.slice(0, 80) ?? 'no description'}`;
}

function buildTargetUser(domains: ServiceDomain[]): string {
  if (domains.includes('verification-pmo')) return 'Verification PMO / QA lead';
  if (domains.includes('ai-quality-assurance')) return 'AI quality assurance engineer';
  if (
    domains.includes('test-automation') ||
    domains.includes('e2e-testing') ||
    domains.includes('api-testing')
  ) return 'Test automation engineer';
  if (domains.includes('test-design-support')) return 'Test designer / QA analyst';
  if (domains.includes('quality-visualization')) return 'QA lead / test manager';
  return 'QA engineer';
}
