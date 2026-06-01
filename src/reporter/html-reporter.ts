import type { EvaluatedRepository, Report } from '../models';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badge(label: string, bg: string): string {
  return `<span class="badge" style="background:${bg}">${esc(label)}</span>`;
}

function scoreColor(n: number): string {
  if (n >= 70) return '#16a34a';
  if (n >= 40) return '#d97706';
  return '#dc2626';
}

function renderRepo(r: EvaluatedRepository, idx: number): string {
  const c = r.candidate;
  const s = r.score;
  const rec = r.recommendation;

  const domainBadges = r.domains.map(d => badge(d, '#4f46e5')).join(' ');
  const labelBadges = r.classificationLabels.map(l => badge(l, '#0891b2')).join(' ');

  const cautionHtml =
    rec.cautionPoints.length > 0
      ? `<div class="caution"><strong>⚠ Caution points</strong><ul>${rec.cautionPoints.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`
      : '';

  const componentRows = s.scoreComponents
    .map(
      comp =>
        `<tr><td>${esc(comp.dimension)}</td><td class="num">${comp.points}</td><td>${esc(comp.evidence)}</td></tr>`,
    )
    .join('');

  const penaltyRows = s.penalties
    .map(
      p =>
        `<tr class="penalty-row"><td colspan="2">${esc(p.reason)}</td><td class="num">${p.points}</td></tr>`,
    )
    .join('');

  const inferHtml =
    s.inferenceNotes.length > 0
      ? `<p class="inference-note">⚙ Inference: ${s.inferenceNotes.map(n => esc(n)).join(' / ')}</p>`
      : '';

  const factEvidence = s.evidence
    .filter(e => e.type === 'fact')
    .map(e => `<li><strong>${esc(e.source)}</strong>: ${esc(e.content)}</li>`)
    .join('');

  return `
<details class="repo-card">
  <summary class="repo-summary">
    <span class="repo-num">#${idx + 1}</span>
    <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.fullName)}</a>
    <span class="score-badge" style="color:${scoreColor(s.totalScore)}">${s.totalScore}pt</span>
    <span class="usefulness ${rec.usefulnessLevel}">${rec.usefulnessLevel}</span>
  </summary>
  <div class="repo-body">
    <div class="meta-row">
      ${c.primaryLanguage ? `<span class="meta-tag">🔤 ${esc(c.primaryLanguage)}</span>` : ''}
      <span class="meta-tag">⭐ ${c.stars.toLocaleString()}</span>
      ${c.license ? `<span class="meta-tag">📄 ${esc(c.license)}</span>` : '<span class="meta-tag warn">📄 No license</span>'}
      <span class="meta-tag">🕐 ${esc(c.pushedAt.slice(0, 10))}</span>
    </div>
    ${c.description ? `<p class="desc">${esc(c.description)}</p>` : '<p class="desc muted">No description</p>'}
    <div class="badges">${domainBadges}</div>
    <div class="badges">${labelBadges}</div>
    <hr>
    <p><strong>Recommended usage:</strong> ${esc(rec.recommendedUsage)}</p>
    <p><strong>Target user:</strong> ${esc(rec.targetUser)}</p>
    <p>
      <strong>Customer explanation value:</strong> ${esc(rec.customerExplanationValue)} &nbsp;
      <strong>Standardization value:</strong> ${esc(rec.internalStandardizationValue)} &nbsp;
      <strong>Adoption difficulty:</strong> ${esc(rec.adoptionDifficulty)}
    </p>
    ${cautionHtml}
    <details class="score-detail">
      <summary>Score breakdown</summary>
      <table class="score-table">
        <thead><tr><th>Dimension</th><th>Pts</th><th>Evidence</th></tr></thead>
        <tbody>${componentRows}${penaltyRows}</tbody>
        <tfoot><tr><td colspan="2"><strong>Total</strong></td><td class="num"><strong>${s.totalScore}</strong></td></tr></tfoot>
      </table>
      ${inferHtml}
    </details>
    ${factEvidence ? `<details class="evidence-detail"><summary>Observed facts</summary><ul>${factEvidence}</ul></details>` : ''}
  </div>
</details>`;
}

function inlineCSS(): string {
  return `
body{font-family:system-ui,sans-serif;max-width:980px;margin:0 auto;padding:16px;background:#f8fafc;color:#1e293b}
h1{font-size:1.5rem;margin-bottom:4px}
.meta{font-size:.82rem;color:#64748b;margin-bottom:20px}
.section-title{font-size:1rem;font-weight:700;color:#4f46e5;margin:24px 0 8px;border-left:4px solid #4f46e5;padding-left:8px}
.repo-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;overflow:hidden}
.repo-summary{cursor:pointer;padding:12px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none}
.repo-summary::-webkit-details-marker{display:none}
.repo-summary::before{content:'▶';font-size:.7rem;color:#94a3b8}
details[open] .repo-summary::before{content:'▼'}
.repo-num{font-size:.75rem;color:#94a3b8;min-width:28px}
.repo-summary a{font-weight:600;color:#1d4ed8;text-decoration:none;flex:1}
.score-badge{font-weight:700;font-size:1rem}
.usefulness{font-size:.75rem;padding:2px 8px;border-radius:12px;font-weight:600}
.usefulness.high{background:#dcfce7;color:#16a34a}
.usefulness.medium{background:#fef9c3;color:#ca8a04}
.usefulness.low{background:#fee2e2;color:#dc2626}
.repo-body{padding:0 16px 16px}
.meta-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.meta-tag{font-size:.78rem;background:#f1f5f9;padding:2px 8px;border-radius:4px}
.meta-tag.warn{background:#fff7ed;color:#ea580c}
.desc{font-size:.88rem;color:#475569;margin:6px 0}
.desc.muted{color:#94a3b8;font-style:italic}
.badges{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}
.badge{font-size:.72rem;color:#fff;padding:2px 8px;border-radius:4px}
.caution{background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:10px 14px;margin:10px 0;font-size:.85rem}
.caution ul{margin:6px 0 0 16px}
hr{border:none;border-top:1px solid #e2e8f0;margin:12px 0}
.score-detail,.evidence-detail{margin-top:10px;font-size:.83rem}
.score-detail summary,.evidence-detail summary{cursor:pointer;color:#64748b}
.score-table{width:100%;border-collapse:collapse;margin-top:8px}
.score-table th,.score-table td{padding:4px 8px;text-align:left;border-bottom:1px solid #f1f5f9}
.score-table th{background:#f8fafc;font-weight:600}
.score-table .penalty-row td{color:#dc2626}
.score-table .num{text-align:right;width:50px}
.inference-note{color:#7c3aed;font-size:.8rem;margin-top:8px}
.summary-box{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;font-size:.9rem}
.summary-stats{display:flex;gap:20px;flex-wrap:wrap;margin-top:8px}
.stat{text-align:center}
.stat-val{font-size:1.5rem;font-weight:700;color:#4f46e5}
.stat-label{font-size:.75rem;color:#64748b}
`;
}

export function generateHtml(report: Report): string {
  const highSection =
    report.highPriorityItems.length > 0
      ? `<div class="section-title">High priority (score ≥ 70)</div>${report.highPriorityItems.map((r, i) => renderRepo(r, i)).join('')}`
      : '';
  const watchOffset = report.highPriorityItems.length;
  const watchSection =
    report.watchlistItems.length > 0
      ? `<div class="section-title">Watchlist (score 40–69)</div>${report.watchlistItems.map((r, i) => renderRepo(r, watchOffset + i)).join('')}`
      : '';
  const lowOffset = watchOffset + report.watchlistItems.length;
  const lowSection =
    report.lowPriorityItems.length > 0
      ? `<div class="section-title">Low priority (score &lt; 40)</div>${report.lowPriorityItems.map((r, i) => renderRepo(r, lowOffset + i)).join('')}`
      : '';

  const kwList = report.searchConditions.keywords.map(k => esc(k)).join(', ') || '—';
  const topicList = report.searchConditions.topics.map(t => esc(t)).join(', ') || '—';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>QA Repo Radar — Report</title>
<style>${inlineCSS()}</style>
</head>
<body>
<h1>QA Repo Radar</h1>
<p class="meta">Generated: ${esc(report.generatedAt)} &nbsp;|&nbsp; Keywords: ${kwList} &nbsp;|&nbsp; Topics: ${topicList}</p>
<div class="summary-box">
  <strong>Summary</strong>
  <p>${esc(report.summary)}</p>
  <div class="summary-stats">
    <div class="stat"><div class="stat-val">${report.repositories.length}</div><div class="stat-label">Total repos</div></div>
    <div class="stat"><div class="stat-val">${report.highPriorityItems.length}</div><div class="stat-label">High priority</div></div>
    <div class="stat"><div class="stat-val">${report.watchlistItems.length}</div><div class="stat-label">Watchlist</div></div>
    <div class="stat"><div class="stat-val">${report.lowPriorityItems.length}</div><div class="stat-label">Low priority</div></div>
  </div>
</div>
${highSection}
${watchSection}
${lowSection}
<p class="meta" style="margin-top:32px;text-align:center">QA Repo Radar — facts and inferences are labeled separately in score breakdowns</p>
</body>
</html>`;
}

export function writeReport(report: Report, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, generateHtml(report), 'utf-8');
}
