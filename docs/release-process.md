# 🚀 EVLink Release Process

This document defines how features and fixes move from development to production.

---

## 🔀 Branches

| Branch     | Purpose            |
|------------|--------------------|
| `main`     | Production          |
| `staging`  | Pre-release / QA    |
| `feature/*`| New features        |
| `hotfix/*` | Critical bugfixes   |

---

## 🛠 Feature Workflow

1. **Create issue in GitHub** and assign milestone (e.g. `2025.06`)
2. **Create feature branch from staging**

```bash
git checkout staging
git pull origin staging
git checkout -b feature/my-feature
```

3. **Develop, commit and push**

```bash
git add .
git commit -m "feat: add my feature (closes #123)"
git push -u origin feature/my-feature
```

4. **Create Pull Request** → `staging`

```bash
gh pr create --base staging --head feature/my-feature --fill
```

5. **Review & merge via GitHub**

---

## 🚀 Release to Production

1. **Ensure staging is up to date**
2. **Create Pull Request from `staging` → `main`**

```bash
gh pr create --base main --head staging --title "Release v1.X.0" --body "Includes milestone 2025.06"
```

3. **Merge PR and tag release**

```bash
git checkout main
git pull origin main
git tag v1.X.0
git push origin v1.X.0
```

4. **Close milestone** on GitHub

---

## 🩹 Patch Process

1. **Branch from `main`**

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug
```

2. **Fix and commit**

```bash
git commit -am "fix: handle edge case in auth"
git push -u origin hotfix/fix-critical-bug
```

3. **PR → `main`**, merge & tag

```bash
gh pr create --base main --head hotfix/fix-critical-bug --fill
git checkout main
git pull origin main
git tag v1.X.Y
git push origin v1.X.Y
```

4. **Cherry-pick or merge hotfix to `staging`**

```bash
git checkout staging
git pull origin staging
git merge hotfix/fix-critical-bug
git push origin staging
```