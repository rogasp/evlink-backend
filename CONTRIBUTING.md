# Contributing to EVLinkHA

Thank you for your interest in contributing to EVLinkHA! We welcome contributions of all kinds—bug reports, feature requests, documentation improvements, code, and more.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Reporting Issues](#reporting-issues)
4. [Feature Requests](#feature-requests)
5. [Development Workflow](#development-workflow)
6. [Branching Strategy](#branching-strategy)
7. [Commit Message Guidelines](#commit-message-guidelines)
8. [Pull Request Process](#pull-request-process)
9. [Local Testing](#local-testing)
10. [Documentation](#documentation)
11. [Contact](#contact)

---

## Code of Conduct

EVLinkHA is an open and inclusive community. Please read and follow our [CODE\_OF\_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:

   ```bash
   git clone https://github.com/<your-username>/evlink-backend.git
   cd evlink-backend
   ```
3. Install dependencies:

   * Backend: `cd backend && pip install -r requirements.txt`
   * Frontend: `cd frontend && pnpm install`
4. Follow the development setup guide: [docs/SETUP.md](docs/SETUP.md).

---

## Reporting Issues

* Check existing issues before opening a new one.
* Use the **Bug Report** template: click **New Issue** → **Bug report**.

Include:

* Steps to reproduce
* Expected vs actual behavior
* Logs or screenshots

---

## Feature Requests

* Use the **Feature Request** template: click **New Issue** → **Feature request**.
* Provide clear motivation and use cases.

---

## Development Workflow

1. Create a new branch from `staging`:

   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/your-feature-name
   ```
2. Make commits in small, logical chunks.
3. Rebase or merge latest `staging` frequently to stay up to date.

---

## Branching Strategy

* `main`: only stable release tags
* `staging`: integration branch for next release
* `feature/*`: new features and improvements
* `hotfix/*`: urgent fixes to `main`

---

## Commit Message Guidelines

Use Conventional Commits format:

```
<type>(<scope>): <short description>

<body>

<footer>
```

Types:

* `feat`: new feature
* `fix`: bug fix
* `docs`: documentation only changes
* `style`: formatting, missing semicolons, etc
* `refactor`: code change that neither fixes a bug nor adds a feature
* `test`: adding missing tests or correcting existing tests
* `chore`: maintenance tasks

---

## Pull Request Process

1. Push your branch to your fork.
2. Open a Pull Request to `staging`.
3. Fill out the PR template.
4. Assign reviewers and wait for feedback.
5. Address comments and update your branch.
6. Once approved, a maintainer will merge.

---

## Local Testing

* Backend: run unit tests: `pytest` in `/backend`
* Frontend: run `pnpm test` or `npm test` in `/frontend`

---

## Documentation

* Update or add documentation in the `docs/` folder.
* Document API changes in [`docs/API.md`](docs/API.md).

---

## Contact

For questions or help, join discussions in [GitHub Discussions](https://github.com/rogasp/evlink-backend/discussions) or reach out to the maintainer via GitHub or email.
