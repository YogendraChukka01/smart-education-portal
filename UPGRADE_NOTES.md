# EduBridge SIH26044 — Upgrade Notes (v2.1)

## What changed

### 1. Industry Skill Intelligence
A new explainable intelligence layer converts the platform's existing opportunity requirements and student skill scores into:
- top industry-demand skills
- required proficiency benchmarks
- student-vs-industry skill gaps
- category-level curriculum priorities
- prototype 30-day demand momentum

### 2. New backend API
`GET /api/industry-intelligence/overview`

Roles: student, academician, industry and institution admin.

### 3. New institution UI
`/admin/industry-intelligence`

The page is linked from the institution-admin navigation and curriculum gap radar.

### 4. Judge-safe positioning
The implementation explicitly labels the trend metric as a prototype signal. It does not claim to forecast the labour market without verified external data.

## Recommended next production upgrade
Connect verified job-description feeds, normalize extracted skills into the existing Skill taxonomy, retain historical snapshots, and evaluate demand-trend accuracy against held-out data.
