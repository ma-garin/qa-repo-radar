# QA Repo Radar

サードパーティのソフトウェアテスト・品質保証会社にとって有用な公開GitHubリポジトリを**発見・分類・評価・レポート出力**するためのAIDD対応ツールです。

汎用的なGitHubトレンド発見ツールではありません。Veriserve・SHIFTのような第三者検証会社のサービス提供を改善できるリポジトリの特定を主目的とします。

---

## 目次

1. [対象ユーザー](#対象ユーザー)
2. [MVPゴール](#mvpゴール)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [セットアップ](#セットアップ)
5. [使い方](#使い方)
6. [ドメインモデル](#ドメインモデル)
7. [評価基準とスコアリング](#評価基準とスコアリング)
8. [分類ラベル](#分類ラベル)
9. [QAサービスドメイン](#qaサービスドメイン)
10. [検索設定のカスタマイズ](#検索設定のカスタマイズ)
11. [LLMプロンプト](#llmプロンプト)
12. [テストの実行](#テストの実行)
13. [データポリシー](#データポリシー)
14. [ロードマップ](#ロードマップ)
15. [開発ガイドライン](#開発ガイドライン)

---

## 対象ユーザー

| ロール | 主な用途 |
|---|---|
| QAエンジニア（第三者検証会社） | 新技術・ツールの調査・提案準備 |
| テスト自動化エンジニア | 自動化基盤の候補選定 |
| QAリード・アシスタントマネージャー | 内部標準化・ケイパビリティ構築 |
| 検証PMOメンバー | 品質可視化・プロジェクト品質管理 |
| AI支援開発の実践者 | AI品質保証ツールの発見と評価 |

---

## MVPゴール

サードパーティQAサービスに役立つ高価値GitHubリポジトリの一覧を含む**週次HTMLレポート**を生成する。

MVPで実現する5ステップ:

1. キーワードとトピックを使ってGitHubから公開リポジトリを収集する
2. リポジトリのメタデータをローカルに保存する
3. リポジトリをQAサービスドメイン別に分類する
4. サードパーティ検証基準に基づいて各リポジトリをスコアリングする
5. 実践的な活用ガイダンスを含む静的HTMLレポートを生成する

---

## ディレクトリ構成

```text
qa-repo-radar/
├── README.md                  # このファイル
├── AGENTS.md                  # AIエージェント向け実装指示
├── CLAUDE.md                  # Claude Code向けプロジェクト設定
├── package.json               # Node.js依存関係・スクリプト
├── tsconfig.json              # TypeScript設定
│
├── config/
│   └── search-config.ts       # 検索キーワード・トピック設定
│
├── docs/
│   ├── requirements.md        # 機能要件
│   ├── evaluation-criteria.md # スコアリング基準・分類ラベル定義
│   ├── acceptance-criteria.md # 受け入れ基準
│   ├── roadmap.md             # 開発ロードマップ
│   ├── domain-model.md        # ドメインモデル定義
│   ├── service-domain.md      # QAサービスドメイン定義
│   └── data-policy.md        # データ取り扱いポリシー
│
├── prompts/
│   ├── summarize-readme.md        # README要約プロンプト（LLM用）
│   ├── classify-repository.md     # リポジトリ分類プロンプト（LLM用）
│   └── evaluate-for-third-party-qa.md  # QA評価プロンプト（LLM用）
│
├── src/
│   ├── models.ts              # 型定義（ドメインモデル全体）
│   ├── index.ts               # エントリーポイント
│   ├── collector/             # GitHub APIからのメタデータ収集
│   ├── classifier/            # QAサービスドメイン分類
│   ├── scorer/                # スコアリングロジック
│   ├── reporter/              # 静的HTMLレポート生成
│   └── storage/               # ローカルストレージ（SQLite/JSONL）
│
├── tests/
│   ├── models.test.ts         # ドメインモデルの型テスト
│   ├── search-config.test.ts  # 検索設定のバリデーションテスト
│   ├── scorer.test.ts         # スコアリングテスト（プレースホルダー）
│   └── classifier.test.ts     # 分類テスト（プレースホルダー）
│
├── data/                      # 収集したリポジトリメタデータ（.gitignore推奨）
└── reports/                   # 生成したHTMLレポート出力先
```

---

## セットアップ

### 必要環境

- Node.js 20以上
- npm
- GitHubアカウント（APIトークン推奨、レート制限回避のため）

### インストール手順

1. リポジトリをクローン:
   ```bash
   git clone <repository-url>
   cd qa-repo-radar
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. 環境変数を設定（GitHub APIトークン）:
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```
   トークンはリポジトリに**絶対にコミットしないこと**。`.env`ファイルを使う場合は`.gitignore`に追加してください。

4. TypeScriptのビルド確認:
   ```bash
   npm run build
   ```

---

## 使い方

> **現在のステータス**: Phase 0（AIDDファウンデーション）完了。Phase 1（ローカルMVP）実装中。  
> コレクター・スコアラー・レポーターは未実装のため、以下は実装完了後の使い方です。

### 基本的な実行フロー（実装予定）

```bash
# Step 1: GitHubからリポジトリを収集
npm run collect

# Step 2: 収集したリポジトリを分類・スコアリング
npm run evaluate

# Step 3: HTMLレポートを生成
npm run report
```

### 検索設定の確認

`config/search-config.ts` に定義されたキーワードとトピックで検索が行われます:

```bash
# 現在設定されているキーワード・トピック数を確認
npm test -- search-config
```

現在の設定:
- **キーワード数**: 28件（`test design`, `playwright testing`, `llm evaluation` など）
- **トピック数**: 25件（`playwright`, `pytest`, `bdd`, `allure` など）
- **1キーワードあたりの収集上限**: 20件
- **1トピックあたりの収集上限**: 20件

### 出力レポートの見方

生成されるHTMLレポートには以下の情報が含まれます:

| 項目 | 説明 |
|---|---|
| リポジトリ名・URL | GitHubへのリンク |
| QAサービスドメイン | 分類されたドメイン（複数可） |
| 総合スコア | 0〜190点（各次元の合計） |
| スコア内訳 | 各評価次元のポイントと根拠 |
| 推奨活用方法 | 第三者QA企業での具体的な使い方 |
| 顧客説明価値 | high / medium / low |
| 内部標準化価値 | high / medium / low |
| 導入難易度 | easy / moderate / hard |
| 注意点 | ライセンス・インフラ要件など |

---

## ドメインモデル

### `RepositoryCandidate`（収集対象リポジトリ）

```typescript
{
  fullName: string;       // 例: "microsoft/playwright"
  url: string;
  description: string | null;
  topics: string[];       // 例: ["testing", "e2e", "automation"]
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  pushedAt: string;       // ISO 8601
  readmeText: string | null;
  hasCi: boolean;
  collectedAt: string;
}
```

### `EvaluationScore`（評価スコア）

```typescript
{
  totalScore: number;
  scoreComponents: ScoreComponent[];  // 各次元のスコアと根拠
  penalties: ScorePenalty[];          // 減点と理由
  evidence: Evidence[];               // 観察事実・推論の区別
  inferenceNotes: string[];
}
```

### `Recommendation`（推奨事項）

```typescript
{
  usefulnessLevel: 'high' | 'medium' | 'low';
  recommendedUsage: string;
  targetUser: string;
  adoptionDifficulty: 'easy' | 'moderate' | 'hard';
  customerExplanationValue: 'high' | 'medium' | 'low';
  internalStandardizationValue: 'high' | 'medium' | 'low';
  cautionPoints: string[];
}
```

---

## 評価基準とスコアリング

スコアは「スター数」ではなく「第三者QAサービスへの実用価値」で決まります。

### スコア次元（加点）

| 次元 | 最大点数 | 説明 |
|---|---:|---|
| `third-party-qa-applicability` | 30 | 第三者検証・QAコンサルティングに使える度合い |
| `customer-explanation-value` | 25 | 品質・リスク・カバレッジを顧客に説明できる価値 |
| `test-design-usefulness` | 25 | テスト設計・カバレッジモデリング・テスト生成への貢献 |
| `quality-risk-reduction` | 20 | 不具合漏れ・フレイキーテスト・リリースリスクの低減 |
| `automation-integration` | 20 | CI/CD・自動テストワークフローへの統合可能性 |
| `standardization-potential` | 20 | 社内標準テンプレート・手法・フレームワーク化の可能性 |
| `documentation-quality` | 15 | README・例・チュートリアルの充実度 |
| `license-clarity` | 15 | ライセンスの明確さ・商用利用への適合性 |
| `maintenance-freshness` | 10 | 最終更新の新しさ |
| `adoption-feasibility` | 10 | プロジェクトチームでの現実的な導入可能性 |

**合計最大点: 190点**

### ペナルティ（減点）

| 条件 | 減点 |
|---|---:|
| QA・テストとの関連が不明確 | -30 |
| 1年以上意味のある更新なし | -30 |
| READMEが薄すぎて評価不能 | -20 |
| 個人実験的で再利用性が低い | -20 |
| 人気だがQAサービス価値が低い | -20 |
| ライセンスが欠如または不明確 | -15 |
| 価値確認前に重インフラが必要 | -10 |

---

## 分類ラベル

各リポジトリには以下のラベルが1つ以上付与されます:

| ラベル | 意味 |
|---|---|
| `customer-proposal-ready` | 顧客提案にそのまま使える |
| `internal-standardization-candidate` | 社内標準化の候補 |
| `automation-foundation` | 自動化基盤として使える |
| `test-design-support` | テスト設計支援に特化 |
| `quality-visualization` | 品質可視化に特化 |
| `qa-pmo-support` | QA PMO・プロジェクト管理支援 |
| `agile-qa-support` | アジャイルQA・シフトレフトに有用 |
| `ai-quality-assurance` | AI品質保証に関連 |
| `learning-reference` | 学習・参照用途（実務直結は低い） |
| `watchlist` | 将来性あり・今後要確認 |
| `low-priority` | 現時点では優先度低 |

---

## QAサービスドメイン

| ドメイン | 対象 |
|---|---|
| `test-design-support` | ペアワイズ・決定表・MBT・テスト生成 |
| `test-automation` | Playwright/Selenium/Cypress/pytest等 |
| `api-testing` | コントラクトテスト・OpenAPIテスト・スキーマ検証 |
| `e2e-testing` | ブラウザ自動化・ビジュアルリグレッション・テスト証跡 |
| `quality-visualization` | テストダッシュボード・不具合分析・フレイキーテスト可視化 |
| `verification-pmo` | プロジェクト品質ガバナンス・リスクダッシュボード |
| `agile-qa` | BDD・受け入れ基準・CIクオリティゲート |
| `exploratory-testing-support` | セッションベーステスト・テスト計画・証跡キャプチャ |
| `compatibility-testing` | ブラウザ互換・デバイス互換・レスポンシブ検証 |
| `non-functional-testing` | 負荷テスト・アクセシビリティ・OWASPテスト |
| `ai-quality-assurance` | LLM評価・プロンプト評価・AI安全性テスト |
| `qa-process-improvement` | QAメトリクス・成熟度モデル・プロセス改善 |

---

## 検索設定のカスタマイズ

`config/search-config.ts` を編集してキーワードとトピックをカスタマイズできます。

### キーワードの追加例

```typescript
// config/search-config.ts
keywords: [
  // 既存のキーワード...
  { keyword: 'chaos engineering', domainHints: ['non-functional-testing'] },
  { keyword: 'shift left testing', domainHints: ['agile-qa', 'qa-process-improvement'] },
],
```

### 収集件数の変更

```typescript
limits: {
  perKeyword: 30,  // デフォルト: 20
  perTopic: 30,    // デフォルト: 20
},
```

### 変更後のバリデーション

設定変更後はテストで検証してください:

```bash
npm test -- search-config
```

テストが確認する内容:
- キーワード・トピックが空でないこと
- 各エントリに `domainHints` が1つ以上あること
- 重複キーワード・重複トピックがないこと
- MVP想定件数（20〜40件）の範囲内であること

---

## LLMプロンプト

`prompts/` ディレクトリに3つのLLM用プロンプトが定義されています。Phase 2でLLM支援評価に使用します。

### `summarize-readme.md`

README本文をQAエンジニア向けに要約するプロンプト。出力形式:

```json
{
  "summary": "短い実用的な要約",
  "main_capabilities": ["機能1"],
  "qa_relevance": "high | medium | low",
  "useful_for": ["test automation"],
  "adoption_notes": ["Node.js 18以上が必要"],
  "caution_points": ["ライセンス要確認"]
}
```

### `classify-repository.md`

リポジトリをQAサービスドメインに分類するプロンプト。出力形式:

```json
{
  "domains": ["test-automation"],
  "confidence": "high",
  "evidence": ["READMEにブラウザ自動化の記述あり"],
  "inference_notes": ["E2Eテストサービスに有用と推定"]
}
```

### `evaluate-for-third-party-qa.md`

第三者QA企業向けの総合評価プロンプト。出力形式:

```json
{
  "third_party_qa_value": "high | medium | low",
  "recommended_usage": "具体的な活用方法",
  "customer_explanation_value": "high | medium | low",
  "internal_standardization_value": "high | medium | low",
  "risk_reduction_value": "high | medium | low",
  "adoption_difficulty": "high | medium | low",
  "evidence": ["観察事実"],
  "inference_notes": ["推論による評価"],
  "caution_points": ["注意点・リスク"]
}
```

---

## テストの実行

```bash
# 全テストを実行
npm test

# 特定のテストファイルのみ実行
npm test -- models
npm test -- search-config
npm test -- scorer
npm test -- classifier
```

### テスト構成

| テストファイル | 内容 |
|---|---|
| `tests/models.test.ts` | ドメインモデルの型整合性テスト |
| `tests/search-config.test.ts` | 検索設定のバリデーション（重複・空値チェック等） |
| `tests/scorer.test.ts` | スコアリングロジックのテスト（Phase 1で実装） |
| `tests/classifier.test.ts` | 分類ロジックのテスト（Phase 1で実装） |

テストカバレッジの目標: **80%以上**

---

## データポリシー

- **収集対象**: 公開GitHubリポジトリのメタデータのみ
- **収集禁止**: プライベートリポジトリ・個人アクセストークン・顧客固有データ
- **GitHubトークン**: 環境変数 `GITHUB_TOKEN` から読み込む。リポジトリへのコミット禁止
- **ローカルストレージ**: SQLite（推奨）またはJSONL（プロトタイピング用）
- **キャッシュ**: `full_name` をキーとしてメタデータをキャッシュ。`pushed_at` で更新判断
- **ライセンス表記**: `license present` / `license missing` / `license requires review` の3段階。法的適合性の自動判断はしない
- **レポート出力**: トークン・ローカルパス・プライベート環境情報を含めない

---

## ロードマップ

| フェーズ | 目標 | 状態 |
|---|---|---|
| **Phase 0** | AIDDファウンデーション（要件・基準・ドキュメント整備） | 完了 |
| **Phase 1** | ローカルMVP（収集→分類→スコアリング→HTMLレポート） | 実装中 |
| **Phase 2** | LLM支援評価（README要約・分類・評価プロンプト） | 計画中 |
| **Phase 3** | 週次レポートワークフロー（GitHub Actions） | 計画中 |
| **Phase 4** | パーソナライゼーション（興味・業務コンテキストに基づく優先度付け） | 計画中 |
| **Phase 5** | PWA・ダッシュボード（お気に入り・レビュー済み管理） | 計画中 |

---

## 開発ガイドライン

### 実装前の確認事項

コード変更前に以下を必ず確認してください:

1. `docs/requirements.md` — 機能要件との整合性
2. `docs/evaluation-criteria.md` — スコアリング・分類基準との整合性
3. `docs/acceptance-criteria.md` — 受け入れ基準との整合性

### 実装の優先順位

```
1. ドメインモデルと評価基準
2. リポジトリメタデータスキーマ
3. コレクター（src/collector/）
4. 分類器（src/classifier/）
5. スコアラー（src/scorer/）
6. 静的HTMLレポーター（src/reporter/）
7. テスト
8. CI
```

### モジュール分離ルール

| モジュール | 責務 |
|---|---|
| `src/collector/` | GitHub APIアクセスのみ。外部通信はここに集約 |
| `src/classifier/` | ドメイン分類ロジックのみ |
| `src/scorer/` | スコアリングロジックのみ |
| `src/reporter/` | HTMLレポート生成のみ |
| `src/storage/` | ローカル永続化のみ |

### 変更完了の定義

変更が「完了」とみなされるのは以下の条件をすべて満たした場合のみ:

1. 対応する受け入れ基準を満たしている
2. 隠れた推論に依存せず出力が検査可能
3. ロジック変更にはテストが追加・更新されている
4. 挙動・判断基準の変更はドキュメントが更新されている
5. 第三者QA指向を弱めていない
6. シークレット・プライベートデータを含まない
