# Setu

![Setu logo](./frontend/public/setu-logo.png)

## Connect - Learn - Grow

**Setu** is an academia-industry skill mapping, internship, mentorship, and placement portal customized for **Audisankara University**. It connects students, academicians, recruiters, placement teams, and alumni through one shared platform.

**Smart India Hackathon 2026 - Problem Statement 26044**
**Portal for Academia-Industry Collaboration for Skill Mapping, Internships and Placement**

## Live portal

- **Web portal:** [https://smart-education-portal-qri6.onrender.com/](https://smart-education-portal-qri6.onrender.com/)
- **Backend API health:** [https://setu-api-d55z.onrender.com/api/health](https://setu-api-d55z.onrender.com/api/health)
- **GitHub repository:** [https://github.com/YogendraChukka01/smart-education-portal](https://github.com/YogendraChukka01/smart-education-portal)

Open the web portal homepage first and use the in-app navigation. The Render static site serves the React application from the root URL.

## Institution

The portal uses Audisankara University as its primary institution profile.

- **University:** Audisankara University
- **Engineering college:** Audisankara College of Engineering & Technology (ASCET)
- **Location:** Gudur, Tirupati District, Andhra Pradesh, India
- **Established:** 2001
- **Approvals and recognition:** AICTE approval, NAAC A+ accreditation, and NBA accreditation
- **Academic affiliation:** Jawaharlal Nehru Technological University, Anantapuramu
- **Innovation ecosystem:** Atal Community Innovation Center (ACIC)
- **Official website:** [audisankarauniversity.edu.in](https://audisankarauniversity.edu.in/)

## What Setu provides

### Students

- Profile and academic information
- Skill radar and skill-gap analysis
- Standardized technical assessments
- Career-track learning roadmaps
- Internship and placement opportunity matching
- Application pipeline tracking
- Digital portfolio and resume management
- Mentorship and messaging

### Academicians

- Student progress and skill analytics
- Mentorship and academic support
- Question-bank and assessment management
- Curriculum and industry-readiness insights

### Industry recruiters

- Opportunity and job-post creation
- Branch, CGPA, and skill requirements
- Explainable candidate matching
- Ranked applicant pipelines
- Application-stage updates and recruiter feedback

### Placement and institution teams

- Placement-readiness dashboards
- Student and faculty roster views
- Curriculum gap radar
- Department-level analytics
- Opportunity and placement monitoring

### Alumni

- Alumni profile and community participation
- Mentorship opportunities
- Events, posts, and professional networking

## Explainable matching engine

Setu uses a deterministic, explainable compatibility score rather than an opaque ranking:

```text
Composite Match Score =
  70% Skill Match
  + 20% Branch Alignment
  + 10% Academic Eligibility
```

The engine compares a student's demonstrated skill levels with opportunity requirements, checks eligible branches, and evaluates the minimum CGPA requirement. The result includes satisfied skills, skill gaps, and a ranked score.

## Demo accounts

The login page includes one-click demo login buttons. For credential login, the demo password is:

```text
password123
```

| Role | Email | Focus |
| --- | --- | --- |
| Student (CSE) | `student.demo@edubridge.local` | Java, DSA, SQL, backend development |
| Student (Mechanical) | `student.mech@demo.com` | SolidWorks, CAD, FEA |
| Academician | `faculty.demo@edubridge.local` | CSE faculty, mentorship, and academic analytics |
| Industry recruiter | `recruiter.demo@edubridge.local` | Talent acquisition and candidate ranking |
| Placement cell | `placement.demo@edubridge.local` | Institution analytics and placement readiness |
| Alumni | `alumni.demo@edubridge.local` | Mentorship and alumni engagement |
| Alumni admin | `alumni.admin@edubridge.local` | Alumni moderation and events |

## Project structure

```text
smart-education-portal/
├── backend/                 Express API, Prisma schema, seed data
├── frontend/                React + Vite web application
├── shared/                  Shared TypeScript types and constants
├── render.yaml              Render service and database blueprint
└── package.json             npm workspace scripts
```

## Technology stack

- **Frontend:** React, TypeScript, React Router, Tailwind CSS, Vite, Recharts, Lucide
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL in Render production; local PostgreSQL or another configured Prisma-compatible database
- **Architecture:** npm monorepo with `shared`, `backend`, and `frontend` workspaces
- **Deployment:** Render static site, Render web service, and Render PostgreSQL

## Run locally on Windows

PowerShell may block `npm.ps1` on some Windows installations. Use `npm.cmd` if that happens.

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL for the current Prisma schema

### Install

```powershell
git clone https://github.com/YogendraChukka01/smart-education-portal.git
cd smart-education-portal
npm.cmd install
```

Set `DATABASE_URL` for the backend before running database commands. For local development, place it in `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/setu"
JWT_SECRET="replace-with-a-local-development-secret"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

### Generate the client, create tables, and seed demo data

```powershell
npm.cmd run build --workspace=shared
npm.cmd run db:push --workspace=backend
npm.cmd run db:seed --workspace=backend
```

### Start the backend

```powershell
npm.cmd run dev --workspace=backend
```

Backend URLs:

- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Start the frontend

In a second terminal:

```powershell
npm.cmd run dev --workspace=frontend
```

Frontend URL:

- `http://localhost:5173`

### Build and test

```powershell
npm.cmd test
npm.cmd run build
```

## Render deployment

The repository includes [`render.yaml`](./render.yaml) for the Render deployment architecture:

1. `setu-api` - Node.js backend service
2. `setu-web` - React static frontend
3. `setu-db` - PostgreSQL database

### Blueprint deployment

1. Open the [Render dashboard](https://dashboard.render.com/).
2. Select **New -> Blueprint**.
3. Choose the GitHub repository.
4. Review the services in `render.yaml`.
5. Apply the blueprint.
6. Confirm `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, and `CORS_ORIGIN`.
7. Run the seed command once after the database is available:

```bash
npm run db:seed --workspace=backend
```

### Current deployed services

- Web: [smart-education-portal-qri6.onrender.com](https://smart-education-portal-qri6.onrender.com/)
- API: [setu-api-d55z.onrender.com](https://setu-api-d55z.onrender.com/)
- API health: [setu-api-d55z.onrender.com/api/health](https://setu-api-d55z.onrender.com/api/health)

The free Render PostgreSQL plan is intended for testing and has an expiry limit. Upgrade the database plan before using the portal for production data.

## Important routes

| Area | Route |
| --- | --- |
| Sign in | `/login` |
| Register | `/register` |
| Student dashboard | `/student/dashboard` |
| Student opportunities | `/student/opportunities` |
| Student applications | `/student/applications` |
| Student portfolio | `/student/portfolio` |
| Academician dashboard | `/academician/dashboard` |
| Industry dashboard | `/industry/dashboard` |
| Placement dashboard | `/admin/dashboard` |
| Alumni dashboard | `/alumni/dashboard` |
| Industry intelligence | `/admin/industry-intelligence` |

## Validation status

- Frontend production build passes
- Backend TypeScript build passes
- Matching-engine test suite passes
- Production API health check returns `healthy`
- Demo accounts and seeded opportunities are available in the deployed environment

## License

This project was developed as an academic and hackathon prototype for academia-industry collaboration and placement workflows.
