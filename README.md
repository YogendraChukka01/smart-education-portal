# 🎓 EduBridge: Academia–Industry Collaboration Platform
### Smart India Hackathon (SIH 2026) — Problem Statement ID 26044
**"Portal for Academia - Industry Collaboration for Skill Mapping, Internships and Placement"**

---

## 🌟 Overview
**EduBridge** is a full-stack, enterprise-grade Academia–Industry collaboration platform built for Indian technical universities and engineering institutions. It solves the critical disconnect between university curricula, student skill development, and industry hiring standards through:
1. **Explainable, Deterministic Multi-Dimensional Matching Engine** (70% Skill Overlap + 20% Branch Alignment + 10% Academic Eligibility).
2. **Multi-Branch Standardized Skill Taxonomy & Scenario Assessments** covering 6 major engineering departments (CSE, IT, ENTC, Mechanical, Civil, Electrical) and 11 specialized branches.
3. **Career Track Benchmarking & Actionable Learning Roadmaps** providing clear skill gap visualization (Recharts Radar & Comparative Deltas).
4. **Institutional Curriculum Gap Radar** aggregating real-time corporate requisition requirements against student assessment scores to signal policy actions for Board of Studies and Faculty Development Programs (FDPs).
5. **Verifiable Digital Student Portfolio & Printable Credential Slugs** with institution verification seals.

---

## 🏛️ Real University Hierarchy & Multi-Branch Taxonomy
```
COEP Technological University / VJTI Mumbai
├── Computer Science & Engineering
│   ├── Computer Science & Engineering
│   ├── Artificial Intelligence & Data Science
│   └── Cyber Security
├── Information Technology
│   └── Information Technology
├── Electronics & Telecommunication (ENTC)
│   ├── Electronics & Telecommunication Engineering
│   └── VLSI Design & Embedded Systems
├── Mechanical Engineering
│   ├── Mechanical Engineering
│   └── Robotics & Automation
├── Civil Engineering
│   ├── Civil Engineering
│   └── Structural Engineering
└── Electrical Engineering
    └── Electrical Engineering
```

---

## ⚙️ Mathematical Matching Engine Formula
Rather than opaque black-box scoring, the matching engine computes deterministic, explainable compatibility:

$$\text{Composite Match Score} = 0.70 \times \text{SkillMatch} + 0.20 \times \text{BranchMatch} + 0.10 \times \text{CgpaEligibility}$$

Where:
- $\text{SkillMatch} = \frac{\sum_{i} \min(S_i, R_i) \times W_i}{\sum_{i} (R_i \times W_i)} \times 100$
- $\text{BranchMatch} = 100\%$ if student's branch is in posting's eligible list, else $0\%$
- $\text{CgpaEligibility} = 100\%$ if $\text{Student CGPA} \ge \text{Min CGPA}$, else scaled proportionally

---

## 🔑 Demo Credentials (Password for all: `password123`)

| Role | Account Name | Email | Focus / Key Details |
| :--- | :--- | :--- | :--- |
| **Student (CSE)** | Roshan Shinde | `student@demo.com` | Sem 6 • CGPA 8.64 • Target: Java Backend • Spring Boot Gap |
| **Student (Mech)** | Aman Verma | `student.mech@demo.com` | Sem 6 • CGPA 8.25 • Target: CAD Design • FEA Simulation |
| **Academician** | Dr. Anjali Joshi | `academician@demo.com` | HOD & Professor, CSE • Mentorship & Joint Grants |
| **Industry Recruiter** | TCS Digital Labs | `industry@demo.com` | University Talent Acquisition • Branch Targeting & Funnel |
| **Placement Cell** | COEP Dean / TPO | `admin@demo.com` | Institution Admin • Curriculum Gap Radar & Roster |

> 💡 **Tip:** Use the **1-Click Demo Switcher Bar** at the top of every screen to instantly switch roles without re-typing credentials!

---

## 🚀 Quickstart & Setup Guide

### Deploying to Render

The repository includes a `render.yaml` Blueprint for deploying the Setu API, frontend, and a persistent PostgreSQL database.

1. In Render, choose **New → Blueprint** and select this GitHub repository.
2. Review and apply the services defined in `render.yaml`.
3. After the first deployment, open the backend service Shell and run:

```bash
npm run db:seed --workspace=backend
```

The seed command creates the demo accounts and sample opportunities. Run it only once because it resets seeded application data.

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "SIH 2026"
npm install
```

### 2. Database Migration & Realistic Seeding
```bash
npm run build --workspace=shared
npx prisma db push --schema=backend/prisma/schema.prisma
npx tsx backend/prisma/seed.ts
```

### 3. Run Backend & Frontend Servers
In two separate terminals:

**Terminal 1 (Backend API - Port 5000):**
```bash
npm run dev --workspace=backend
```

**Terminal 2 (Frontend React App - Port 5173):**
```bash
npm run dev --workspace=frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Complete End-to-End User Journeys

### 1. Student Scholar Lifecycle
1. **5-Question Dashboard** (`/student/dashboard`): Placement readiness %, top skill gaps, next best action, recommended internships, and active applications.
2. **Skill Assessment** (`/student/assessment`): Technical core coding and quantitative aptitude questions with instant proficiency score update.
3. **Career Track & Gap Analysis** (`/student/career-gaps`): Select target job role, view radar chart vs industry benchmark, review ranked deficits, and actionable project roadmaps.
4. **Marketplace & 1-Click Apply** (`/student/opportunities`): Filter by branch, work mode, and stipend; inspect explainable match breakdown; submit application.
5. **Pipeline Tracker** (`/student/applications`): Track stage progression (`Applied` ➔ `Shortlisted` ➔ `Assessment` ➔ `Interview` ➔ `Selected`).
6. **Digital Portfolio** (`/portfolio/roshan-shinde-coep`): Public verifiable credential view with print/PDF export.

### 2. Industry Recruiter Experience
1. **Talent Dashboard** (`/industry/dashboard`): Hiring funnel, active listings, and applicant pool skill distribution.
2. **Post Opportunity** (`/industry/post`): Define eligible branches (e.g. CSE, AI & DS, Mech), minimum CGPA, and skill importance weights.
3. **Candidate Compatibility Ranker** (`/industry/applicants`): View applicants ranked by composite match %, review statements, and advance stages with recruiter feedback.

### 3. Placement Cell & Institution Admin
1. **Placement Dashboard** (`/admin/dashboard`): Placement rate (78%), assessment completion (84%), and department readiness comparison bar chart.
2. **Curriculum Gap Radar** (`/admin/curriculum-gap`): Filter by department; visualize Industry Demand vs Student Proficiency; view actionable syllabus reform signals for Board of Studies.
3. **Student & Faculty Roster** (`/admin/roster`): Filterable directory of all student scholars and faculty members with assessment benchmarks.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, SQLite
- **Architecture**: Monorepo (`shared`, `backend`, `frontend`) with shared constants & types

## v2.1 Upgrade — Industry Skill Intelligence

New SIH-focused capability: **Industry Skill Intelligence**.

- `/api/industry-intelligence/overview` — explainable skill-demand and gap analytics
- `/admin/industry-intelligence` — institution dashboard for demand, gaps and curriculum priorities
- Uses existing opportunity requirements + student skill scores; no fake external labour-market claims
- Designed to evolve into verified job-description ingestion, skill normalization and validated trend analytics
