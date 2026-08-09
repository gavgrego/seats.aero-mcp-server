# Contributing

## Development

Install dependencies and run the full build and test suite before opening a
pull request:

```sh
pnpm install --frozen-lockfile
pnpm test
```

Pull requests run the same checks with GitHub Actions.

## Commit messages and versions

This repository uses
[Conventional Commits](https://www.conventionalcommits.org/) to determine the
next [Semantic Version](https://semver.org/):

| Commit | Release | Example |
| --- | --- | --- |
| Bug fix | Patch | `fix: preserve cached-search cursor` |
| New backward-compatible feature | Minor | `feat: add destination search` |
| Breaking API change | Major | `feat!: rename flight-search inputs` |

Use a `BREAKING CHANGE:` footer when the reason or migration guidance needs
more detail. Documentation, tests, refactoring, and maintenance commits can use
their corresponding types (`docs:`, `test:`, `refactor:`, and `chore:`); these
do not create a release unless they contain a breaking-change marker.

## GitHub release cycle

1. Merge conventional commits into `main`.
2. The `Release Please` workflow creates or updates one release PR.
3. Review the generated version, `CHANGELOG.md`, and package metadata.
4. Merge the release PR when the accumulated changes are ready to ship.
5. Release Please creates the `vX.Y.Z` tag and a published GitHub Release from
   the changelog entry.

Do not manually edit the package version or add an unreleased changelog heading
in feature pull requests. Release Please owns those changes. The current
released version is bootstrapped in `.release-please-manifest.json`; after the
first automated release, that file is maintained by Release Please.

Repository administrators must allow GitHub Actions to create pull requests in
**Settings > Actions > General > Workflow permissions**. The workflow uses the
built-in `GITHUB_TOKEN` by default. If checks or other workflows must run on the
release PR itself, add a fine-grained personal access token or GitHub App token
as the `RELEASE_PLEASE_TOKEN` Actions secret, because events created by the
built-in token do not start additional workflow runs.
