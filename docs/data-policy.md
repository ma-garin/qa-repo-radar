# Data Policy

## Public data only

The tool must collect only public GitHub repository information.

Do not collect:

- private repository data
- personal access tokens
- user private data
- secrets
- credentials
- proprietary customer data

## GitHub token handling

If a GitHub token is needed, read it from an environment variable such as `GITHUB_TOKEN`.

The token must never be committed to the repository.

## Local storage

The first MVP should store collected data locally.

Allowed local storage options:

- SQLite
- JSONL for prototyping
- CSV for report export only

## Caching

Use caching to avoid unnecessary GitHub API calls.

Recommended policy:

- Store repository metadata by `full_name`.
- Update stale records based on `pushed_at` or collection timestamp.
- Avoid repeatedly fetching README content if the repository has not changed.

## License handling

The tool may collect license metadata, but it must not automatically conclude legal suitability.

Reports should use cautious wording:

- `license present`
- `license missing`
- `license requires review`
- `commercial use requires confirmation`

## Generated report data

Reports may include repository metadata and inferred QA evaluation.

Reports must separate:

- observed facts
- inferred classification
- inferred recommendation
- caution points

## Privacy and security

Do not output tokens, local machine paths, or private environment information in reports.
