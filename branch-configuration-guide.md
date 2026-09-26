# Branch Configuration Guide

## Expression Types

- **`branch`** - Allow PRs TO specific branches (e.g., `develop`, `feature/*`)
- **`!branch`** - Block PRs TO specific branches (e.g., `!main`, `!feature/*`)
- **`contains:text`** - Allow PRs TO branches containing text (e.g., `contains:hotfix`)
- **`*`** - Universal wildcard - allow PRs TO ALL branches

## Key Concept

**All configurations define TARGET branches (where PRs are allowed to go):**

- `['develop', 'main']` = "Any branch can make PRs TO develop or main"
- `['feature/*']` = "Any branch can make PRs TO branches starting with feature/"
- `['!main']` = "Any branch CANNOT make PRs TO main"

## Examples

### Simple - Only Main

```
["main"]
```

- ✅ `feature/xyz → main` = REVIEW
- ✅ `hotfix/urgent → main` = REVIEW
- ❌ `feature/xyz → develop` = NO REVIEW

### GitFlow with Exclusions

```
["develop", "feature/*", "main", "!release/*"]
```

- ✅ `feature/xyz → develop` = REVIEW
- ✅ `feature/xyz → main` = REVIEW
- ✅ `hotfix/urgent → feature/abc` = REVIEW
- ❌ `feature/xyz → release/v1.0` = NO REVIEW

### Everything Except Main

```
["*", "!main"]
```

- ✅ `feature/xyz → develop` = REVIEW
- ✅ `feature/xyz → staging` = REVIEW
- ❌ `feature/xyz → main` = NO REVIEW

### Client Flow (Aggregation Branch)

```
["feature/aggregation", "!develop", "!main", "!release"]
```

- ✅ `feature/xyz → feature/aggregation` = REVIEW
- ✅ `hotfix/urgent → feature/aggregation` = REVIEW
- ❌ `feature/xyz → develop` = NO REVIEW
- ❌ `feature/xyz → main` = NO REVIEW

## Tips

- **Order doesn't matter** - expressions can be in any order
- **Use `*`** to allow PRs to all branches
- **Use `!`** to block PRs to specific branches
- **Maximum 100 characters** per expression
