# 📋 COMPLETE PRECEDENCE TABLE - Branch Review Logic

## 🎯 Priority Order (highest to lowest)

| Priority | Type               | Example         | Score | Description                 |
| -------- | ------------------ | --------------- | ----- | --------------------------- |
| 1        | Exclusions         | `!main`         | 100   | Always wins over inclusions |
| 2        | Specific Wildcards | `feature/*`     | 8     | Wins over general wildcards |
| 3        | Exact Patterns     | `main`          | 10    | Wins over wildcards         |
| 4        | Contains           | `contains:demo` | 5     | Medium priority             |
| 5        | General Wildcards  | `*`             | 1     | Lowest priority             |

---

## 📊 Precedence Cases

### CASE 1: Exclusion vs General Wildcard

**Configuration:** `*, !main`

| Source        | Target    | Result       | Explanation                              |
| ------------- | --------- | ------------ | ---------------------------------------- |
| `feature/xyz` | `main`    | ❌ NO REVIEW | Exclusion `!main` wins over wildcard `*` |
| `feature/xyz` | `develop` | ✅ REVIEW    | Wildcard `*` allows                      |
| `hotfix/xyz`  | `main`    | ❌ NO REVIEW | Exclusion `!main` wins over wildcard `*` |
| `hotfix/xyz`  | `develop` | ✅ REVIEW    | Wildcard `*` allows                      |

### CASE 2: Exclusion vs Specific Wildcard

**Configuration:** `feature/*, !main`

| Source        | Target    | Result       | Explanation                                      |
| ------------- | --------- | ------------ | ------------------------------------------------ |
| `feature/xyz` | `main`    | ❌ NO REVIEW | Exclusion `!main` wins over wildcard `feature/*` |
| `feature/xyz` | `develop` | ❌ NO REVIEW | `develop` is not in the list                     |
| `hotfix/xyz`  | `main`    | ❌ NO REVIEW | Exclusion `!main` wins over wildcard `*`         |
| `hotfix/xyz`  | `develop` | ❌ NO REVIEW | `develop` is not in the list                     |

### CASE 3: Specific Wildcard vs General Wildcard

**Configuration:** `feature/*, *`

| Source        | Target    | Result    | Explanation         |
| ------------- | --------- | --------- | ------------------- |
| `feature/xyz` | `main`    | ✅ REVIEW | Wildcard `*` allows |
| `feature/xyz` | `develop` | ✅ REVIEW | Wildcard `*` allows |
| `hotfix/xyz`  | `main`    | ✅ REVIEW | Wildcard `*` allows |
| `hotfix/xyz`  | `develop` | ✅ REVIEW | Wildcard `*` allows |

### CASE 4: Exact Pattern vs Wildcard

**Configuration:** `main, feature/*`

| Source        | Target        | Result       | Explanation                       |
| ------------- | ------------- | ------------ | --------------------------------- |
| `main`        | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `feature/xyz` | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `hotfix/xyz`  | `main`        | ✅ REVIEW    | `main` is in the list             |
| `hotfix/xyz`  | `feature/abc` | ✅ REVIEW    | `feature/abc` matches `feature/*` |

### CASE 5: Multiple Exclusions

**Configuration:** `*, !main, !develop`

| Source        | Target    | Result       | Explanation               |
| ------------- | --------- | ------------ | ------------------------- |
| `feature/xyz` | `main`    | ❌ NO REVIEW | Exclusion `!main` wins    |
| `feature/xyz` | `develop` | ❌ NO REVIEW | Exclusion `!develop` wins |
| `feature/xyz` | `staging` | ✅ REVIEW    | Wildcard `*` allows       |
| `hotfix/xyz`  | `main`    | ❌ NO REVIEW | Exclusion `!main` wins    |

### CASE 6: Specific Exclusion vs General Inclusion

**Configuration:** `feature/*, !feature/hotfix`

| Source           | Target        | Result       | Explanation                       |
| ---------------- | ------------- | ------------ | --------------------------------- |
| `feature/xyz`    | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `feature/hotfix` | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `feature/bugfix` | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `feature/xyz`    | `feature/abc` | ✅ REVIEW    | `feature/abc` matches `feature/*` |

### CASE 7: Contains vs Wildcard

**Configuration:** `contains:demo, feature/*`

| Source               | Target        | Result       | Explanation                       |
| -------------------- | ------------- | ------------ | --------------------------------- |
| `feature/demo-xyz`   | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `feature/xyz`        | `develop`     | ❌ NO REVIEW | `develop` is not in the list      |
| `hotfix/demo-urgent` | `main`        | ❌ NO REVIEW | `main` is not in the list         |
| `feature/demo-xyz`   | `feature/abc` | ✅ REVIEW    | `feature/abc` matches `feature/*` |

### CASE 8: Complex - Multiple Rules

**Configuration:** `feature/*, hotfix/*, !main, !develop`

| Source          | Target    | Result       | Explanation                  |
| --------------- | --------- | ------------ | ---------------------------- |
| `feature/xyz`   | `main`    | ❌ NO REVIEW | Exclusion `!main` wins       |
| `feature/xyz`   | `develop` | ❌ NO REVIEW | Exclusion `!develop` wins    |
| `feature/xyz`   | `staging` | ❌ NO REVIEW | `staging` is not in the list |
| `hotfix/urgent` | `main`    | ❌ NO REVIEW | Exclusion `!main` wins       |
| `hotfix/urgent` | `develop` | ❌ NO REVIEW | Exclusion `!develop` wins    |
| `hotfix/urgent` | `staging` | ❌ NO REVIEW | `staging` is not in the list |
| `release/v1.0`  | `main`    | ❌ NO REVIEW | Exclusion `!main` wins       |

---

## 🎯 Precedence Rules

### ✅ **ALWAYS WINS:**

1. **Exclusions (`!pattern`)** - Always have maximum priority (score 100)
2. **Specific wildcards** - Win over general wildcards
3. **Exact patterns** - Win over wildcards

### ⚠️ **LIMITATIONS:**

1. **Specific exclusions within wildcards** - Edge case not fully supported
2. **Multiple exclusions at same level** - Applied in specificity order

### 🔧 **HOW IT WORKS:**

1. **Source Pattern** - Checks if source branch matches pattern (always `*`)
2. **Target Pattern** - Checks if target branch matches pattern
3. **Specificity Score** - Calculates priority based on pattern type
4. **Highest Priority Wins** - Rule with highest specificity prevails

---

## 📝 Practical Examples

### GitFlow

```
feature/*, hotfix/*
```

- ❌ `feature/xyz → develop` = NO REVIEW (develop is not in the list)
- ❌ `hotfix/xyz → main` = NO REVIEW (main is not in the list)
- ✅ `feature/xyz → feature/abc` = REVIEW (feature/abc matches feature/\*)
- ✅ `hotfix/xyz → hotfix/urgent` = REVIEW (hotfix/urgent matches hotfix/\*)

### GitHub Flow

```
feature/*, hotfix/*, !main
```

- ❌ `feature/xyz → main` = NO REVIEW (exclusion !main wins)
- ❌ `feature/xyz → develop` = NO REVIEW (develop is not in the list)
- ✅ `feature/xyz → feature/abc` = REVIEW (feature/abc matches feature/\*)

### Client Flow (Your case)

```
feature/aggregation, !develop, !main
```

- ✅ `feature/xyz → feature/aggregation` = REVIEW (feature/aggregation is in the list)
- ❌ `feature/xyz → develop` = NO REVIEW (exclusion !develop wins)
- ❌ `feature/xyz → main` = NO REVIEW (exclusion !main wins)

### Review Everything Except

```
*, !main, !develop
```

- ❌ `any → main` = NO REVIEW (exclusion !main wins)
- ❌ `any → develop` = NO REVIEW (exclusion !develop wins)
- ✅ `any → staging` = REVIEW (wildcard \* allows)

### Real User Configuration

```
develop, feature/*, main
```

- ✅ `feature/xyz → develop` = REVIEW (develop is in the list)
- ✅ `feature/xyz → main` = REVIEW (main is in the list)
- ✅ `feature/xyz → feature/abc` = REVIEW (feature/abc matches feature/\*)
- ❌ `feature/xyz → staging` = NO REVIEW (staging is not in the list)
- ✅ `hotfix/xyz → develop` = REVIEW (develop is in the list)
- ✅ `hotfix/xyz → main` = REVIEW (main is in the list)
- ❌ `hotfix/xyz → staging` = NO REVIEW (staging is not in the list)

---

## 🔑 **FUNDAMENTAL CONCEPT**

**ALL configurations are TARGET PATTERNS (base branches):**

- `['develop', 'main']` = "Any branch can go to develop or main"
- `['feature/*']` = "Any branch can go to branches that start with feature/"
- `['!main']` = "Any branch CANNOT go to main"

**Source is always `*` (any branch), Target is what's configured!**
