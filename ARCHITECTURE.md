# EduBridge – System Architecture
**Engineering Academia-Industry Collaboration, Skill Intelligence & Placement Automation Platform**  
*Smart India Hackathon (SIH 2026) — Problem Statement PS 26044*

---

## 1. System Overview

**EduBridge** is a unified, multi-stakeholder web platform designed to bridge the structural gap between engineering academia and industry requirements. In conventional educational ecosystems, curricula, student skill development, faculty industry exposure, and corporate recruitment function in isolated silos. EduBridge integrates all five key academic-industry stakeholders—**Students**, **Faculty / Academicians**, **Industry Recruiters**, **Institution / Placement Cell Administrators**, and **Alumni**—into a single, data-driven, continuous collaboration platform.

### Core Objectives & Capabilities
- **Deterministic Skill Gap Intelligence:** Standardized skill taxonomy mapped to real engineering branches and corporate career roles, calculating exact percentage deficits between student proficiency and industry benchmarks.
- **Multimodal Assessment Engine:** Evaluation via technical MCQs, aptitude tests, and automated practical source-code file submissions across Java, Python, C++, and JavaScript.
- **Transparent Mathematical Match Engine:** Multi-factor weighted recommendation algorithm (70% Skill Proficiency + 20% Academic Branch Alignment + 10% CGPA Eligibility) powering bi-directional candidate-to-opportunity matching.
- **Automated Digital Portfolio & ATS Resume Builder:** Verifiable project showcase with live public URLs (`/portfolio/:slug`), certificate storage, and dynamically generated ATS/Modern/Professional resumes compiled from platform data.
- **Continuous Industry-Academia Linkage:** Corporate internship and job requisitions, Faculty Development Programs (FDPs), industry mentorship sessions, and alumni career guidance networks.
- **Institutional Accreditation & Placement Analytics:** Real-time NAAC/NIRF Criteria 5.2.1/5.2.2 reporting, Curriculum Gap Radar analysis, tier-wise company placement statistics, and automated academic rank calculation.

---

## 2. Users / Roles

EduBridge implements role-based access control (RBAC) across five primary actor roles (with administrative extensions).

```
+-----------------------------------------------------------------------------------+
|                               EDUBRIDGE ECOSYSTEM                                 |
|                                                                                   |
|  +--------------+   +-------------------+   +--------------+   +---------------+  |
|  |   STUDENT    |   | FACULTY / ACADEM. |   |   INDUSTRY   |   |  INSTITUTION  |  |
|  +-------+------+   +---------+---------+   +-------+------+   +-------+-------+  |
|          |                    |                     |                  |          |
|          +--------------------+----------+----------+------------------+          |
|                                          |                                        |
|                                  +-------+------+                                 |
|                                  |    ALUMNI    |                                 |
|                                  +--------------+                                 |
+-----------------------------------------------------------------------------------+
```

### 2.1 Student (`student`)
- **Authentication:** Email and password registration/login with JWT Bearer authentication. Profile linked to college institution, degree, department, and branch.
- **Dashboard (`/student/dashboard`):** Real-time placement readiness score, profile completion gauge, target role status, top skill gaps, next best action cards, recommended opportunities, active applications counter, and upcoming events.
- **Major Functions:**
  - Complete technical & aptitude MCQ assessments.
  - Upload code solution files for 250+ structured coding assessment challenges.
  - View radar graphs comparing personal skills vs. target industry roles (`/student/career-gaps`).
  - Search, filter, and apply to internships, jobs, and training programs with instant match score breakdown.
  - Manage projects, certificates, internship completion records (`/student/projects`).
  - Generate shareable digital portfolios (`/portfolio/:slug`) and build ATS resumes (`/student/profile`).
  - Browse alumni directory, request direct mentorship, and register for faculty/alumni workshops.
- **Data Created/Updated:** `StudentProfile`, `StudentSkillScore`, `CodingSubmission`, `Application`, `PortfolioItem`, `ResumeDraft`, `EventRegistration`, `MentorshipRequest`, `Message`.
- **Interactions:** Receives recommendations from Industry opportunities; receives guidance and event invitations from Faculty and Alumni; submits applications reviewed by Recruiters and Placement Admins.

### 2.2 Faculty / Academician (`academician`)
- **Authentication:** JWT Bearer authentication linked to department, designation, research areas, and expertise tags.
- **Dashboard (`/academician/dashboard`):** Mentorship metrics, mentee count, supervised student skill distribution, upcoming sessions, and corporate research/FDP opportunities.
- **Major Functions:**
  - Host and manage workshops, guest lectures, FDPs, and technical mentorship sessions (`/academician/mentorship`).
  - Review student department roster, identifying high-performing scholars and students with critical skill deficits.
  - Access and manage the centralized Question Bank (`/api/skills/question-bank`) to create new technical/coding problems.
  - Apply to industry-posted Faculty Development Programs (FDPs), consultancy projects, and joint research initiatives.
  - Update faculty profile, research publications, ORCID ID, and lab expertise (`/academician/profile`).
- **Data Created/Updated:** `AcademicianProfile`, `MentorshipEvent`, `AssessmentQuestion`, `Application` (for FDPs/Research), `Message`.
- **Interactions:** Guides Students via events and direct messaging; collaborates with Industry on FDPs and consultancy; provides academic feedback to Institution Admins.

### 2.3 Industry / Recruiter (`industry`)
- **Authentication:** JWT authentication associated with a corporate profile (`Company`), hiring domains, and recruiter credentials.
- **Dashboard (`/industry/dashboard`):** Active requisitions count, total applicants pipeline funnel (Applied -> Shortlisted -> Interview -> Selected), applicant skill distribution vs. threshold, and recent postings.
- **Major Functions:**
  - Post and manage opportunities (Internships, Jobs, Programs, FDPs, Consultancy, Research) with custom skill proficiency levels and weights (`/industry/post`).
  - Review candidate applications ranked in descending order by the match calculation engine (`/industry/applicants`).
  - Inspect candidate skill breakdowns, verified credentials, portfolio links, and GPA.
  - Transition applicant recruitment stages (`applied` -> `under_review` -> `shortlisted` -> `interview` -> `selected` / `rejected`) with stage audit notes.
  - Maintain corporate profile, industry domain tags, recruiter contact, and company logo (`/industry/company-profile`).
- **Data Created/Updated:** `Company`, `Opportunity`, `ApplicationStatusHistory`, `AuditLog`, `Message`.
- **Interactions:** Posts opportunities for Students and Faculty; evaluates ranked applicants; coordinates with Institution Placement Cells for campus drives.

### 2.4 Institution / Placement Cell Admin (`institution_admin`)
- **Authentication:** JWT authentication bound to the apex Institution entity (`Institution`), placement officer details, and campus code.
- **Dashboard (`/admin/dashboard`):** Total enrollment, assessment completion rate, placement rate (%), average time-to-placement, highest/average CTC packages, department-wise readiness metrics, and recent campus placements.
- **Major Functions:**
  - **Curriculum Gap Radar (`/admin/curriculum-gap`):** Department-filtered radar analysis contrasting aggregate student cohort proficiency against aggregate corporate hiring demand.
  - **Placement Statistics (`/admin/placement-stats`):** Tier-wise company breakdown table (eligible, appeared, shortlisted, interviewed, offers, highest/avg/median LPA) and 1-click NAAC/NIRF Criteria 5.2.1/5.2.2 report generation.
  - **Student & Faculty Roster (`/admin/roster`):** Complete searchable roster with deterministic rank calculation (Batch, Department, Branch, Overall).
  - **Institution Settings (`/admin/settings`):** Manage college branding, accreditation status, official TPO contacts, and departmental structures.
- **Data Created/Updated:** `Institution`, `Department`, `Branch`, `CompanyPlacementStat`, `PlacedStudent`, `InternshipOutcomeStory`.
- **Interactions:** Monitors all Student cohorts, Faculty sessions, and Corporate recruitment metrics across the institution.

### 2.5 Alumni (`alumni` / `alumni_admin`)
- **Authentication:** JWT authentication linked to graduation year, alumnus company, job designation, and branch.
- **Dashboard (`/alumni/dashboard`):** Community feed of career advice, thought sharing, like/comment interactions, incoming mentorship requests management, and active alumni directory.
- **Major Functions:**
  - Publish industry insights, interview experiences, placement preparation tips, and learning resources (`AlumniPost`).
  - Engage in threaded discussions with current engineering undergraduates.
  - Accept or decline 1-on-1 mentorship requests submitted by students with custom response notes.
  - Browse and connect with fellow alumni across companies and graduation batches (`/student/alumni`).
  - Moderation capabilities for `alumni_admin` to feature posts, pin guidance, and maintain network hygiene.
- **Data Created/Updated:** `AlumniProfile`, `AlumniPost`, `AlumniPostComment`, `AlumniPostLike`, `MentorshipRequest` (responses).
- **Interactions:** Mentors undergraduate Students; shares industry trends with Faculty; expands institutional alumni network for Placement Cells.

---

## 3. High-Level Architecture

The system follows a decoupled, modular three-tier client-server architecture with deterministic intelligence engines operating at the service layer:

```
+---------------------------------------------------------------------------------+
|                                1. PRESENTATION LAYER                            |
|  React 18 SPA (Vite) + Tailwind CSS + Lucide Icons + Recharts + React Router    |
|  - Role-Specific Portals (Student, Faculty, Industry, Placement Admin, Alumni)  |
|  - Shared Components (DemoSwitcherBar, Navbar, ProfilePhotoUpload, Protected)   |
+----------------------------------------+----------------------------------------+
                                         |  HTTPS / REST / JSON + Form-Data
                                         v
+---------------------------------------------------------------------------------+
|                                2. API & SECURITY LAYER                          |
|  Node.js + Express 4                                                            |
|  - CORS & Body Parser (15MB JSON payload limit)                                 |
|  - JWT Authentication Middleware (`authenticateJwt`)                            |
|  - Role-Based Authorization Middleware (`requireRoles`)                          |
|  - Zod Request Schema Validation (`validateBody`)                               |
|  - Multer Memory Storage & File Validation (5MB Image / 15MB Document)          |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                3. CORE SERVICE LAYER                            |
|  - Deterministic Matching Engine (`matching.engine.ts`)                         |
|  - Standard Competition Ranking Engine (`assignStandardRanks`)                  |
|  - Local File Storage Service (`storage.service.ts`)                            |
|  - Analytics & NAAC/NIRF Aggregator (`analytics.routes.ts`)                     |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                                4. PERSISTENCE LAYER                             |
|  - Prisma ORM 5.22 (`prisma-client-js`)                                         |
|  - SQLite Relational Database (`dev.db`)                                        |
|  - Local File System Storage (`/uploads/avatars`, `/uploads/certificates`)      |
+---------------------------------------------------------------------------------+
```

### Layer Interaction Flow
1. **User Interaction:** A user initiates an action in the React client (e.g., submitting an assessment, posting an internship, requesting mentorship).
2. **Client Request:** `axios` instance in `lib/api.ts` attaches the JWT token from `localStorage` into the `Authorization: Bearer <token>` header.
3. **Route & Auth Handling:** Express router receives the request; `authenticateJwt` validates the token, queries Prisma to load the user profile context, and assigns `req.user`.
4. **Role Authorization:** `requireRoles(...)` ensures the actor possesses the requisite permissions.
5. **Payload Validation:** `validateBody(zodSchema)` guarantees strict runtime typing and rejects malformed payloads before execution.
6. **Business Logic & Math Engine:** Backend executes the operation, invoking `calculateMatchScore(...)` or rank aggregators where applicable.
7. **Database Persistence:** Prisma ORM performs atomic queries/mutations against the relational database.
8. **Structured Response:** Client receives a normalized JSON response and updates the UI state reactively.

---

## 4. Frontend Architecture

The frontend is built with **React 18** using **Vite 6** as the build tool and bundler.

### 4.1 Routing & Route Protection
The client routing in `frontend/src/App.tsx` utilizes `react-router-dom` v6:
- **Public Routes:** `/`, `/login`, `/register`, `/portfolio/:slug`, `/messages`.
- **Role-Guarded Routes:** Wrapped with `<ProtectedRoute allowedRoles={[...]} />` which verifies `user.role` from `AuthContext` and redirects unauthorized actors to `/`.

```
/ (LandingPage)
|-- /login, /register
|-- /portfolio/:slug (Public Portfolio)
|-- /messages (Common Messaging)
|-- /student/*
|   |-- /dashboard, /profile, /assessment, /coding, /career-gaps
|   |-- /opportunities, /applications, /projects, /events, /alumni
|-- /academician/*
|   |-- /dashboard, /opportunities, /mentorship, /profile
|-- /industry/*
|   |-- /dashboard, /post, /applicants, /company-profile
|-- /admin/*
|   |-- /dashboard, /placement-stats, /curriculum-gap, /roster, /settings
|-- /alumni/*
    |-- /dashboard
```

### 4.2 State & Context Management
- **`AuthContext.tsx`:** Manages global user authentication state, active JWT tokens, session persistence via `localStorage`, login/register methods, demo account switcher (`switchDemoRole`), and dynamic profile refreshes (`refreshUserProfile`).
- **Component Local State:** Handled via standard React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) for high responsiveness without unnecessary external state overhead.

### 4.3 UI Design System & Component Structure
- **Tailwind CSS 3.4:** Custom design palette (`slate`, `blue`, `indigo`, `emerald`, `amber`, `rose`, `violet`) with glassmorphism effects, flexbox/grid layouts, and responsive breakpoints.
- **Lucide React Icons:** Consistent iconography throughout navigation, metrics cards, status tags, and action buttons.
- **Recharts 2.15:** High-performance data visualization for:
  - Radar Charts (`RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar`) for student skill vs. target benchmark comparisons and institutional curriculum gap radars.
  - Bar Charts (`BarChart`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `Bar`) for department readiness scores and applicant pipeline stages.
- **`ProfilePhotoUpload.tsx`:** Unified image uploader component with client-side validation (5MB limit, JPG/PNG/WEBP), image preview, and multipart form submission.
- **`DemoSwitcherBar.tsx`:** Quick role-switching top bar allowing instant demonstration across all five user personas without re-entering credentials.
- **PDF Resume Exporter:** Built with `jspdf` and `html2canvas` for client-side rendering and downloading of ATS-compliant resumes.

---

## 5. Backend Architecture

The backend is built as a RESTful service using **Express 4** in **TypeScript (Node.js)** with modular route separation.

### 5.1 Server Entry & Middleware Pipeline
1. `src/server.ts` initializes the server, binds environment variables, and listens on `PORT` (default: 5000).
2. `src/app.ts` configures global middleware:
   - `cors({ origin: '*', credentials: true })`: Enables cross-origin requests.
   - `express.json({ limit: '15mb' })`: Parses large JSON payloads (e.g., source code submissions, resume draft JSON blobs).
   - `express.urlencoded({ extended: true, limit: '15mb' })`: URL-encoded form parser.
   - `express.static(...)`: Serves uploaded avatars and certificates statically under `/uploads`.
   - Global error handler intercepting runtime exceptions.

### 5.2 API Route Modules
All endpoints are namespaced under `/api`:
- `/api/auth` (`auth.routes.ts`): User authentication, registration, profile updates, unified photo uploads, demo switcher.
- `/api/skills` (`skills.routes.ts`): Skill taxonomy, career roles, MCQ assessment, coding assessment upload, question bank CRUD.
- `/api/opportunities` (`opportunities.routes.ts`): Opportunity creation, listing, filtering, matching, updating, deleting.
- `/api/applications` (`applications.routes.ts`): Application submissions, candidate ranking, recruitment pipeline stage transitions.
- `/api/portfolio` (`portfolio.routes.ts`): Project/certificate uploads, public portfolio view, dynamic ATS resume builder.
- `/api/mentorship` (`mentorship.routes.ts`): Faculty mentorship events, workshop scheduling, registration.
- `/api/alumni` (`alumni.routes.ts`): Alumni feed, thought posts, likes/comments, 1-on-1 mentorship requests.
- `/api/analytics` (`analytics.routes.ts`): Role-specific dashboards, curriculum gap radar, company stats, NAAC reports, student roster rank calculations.
- `/api/notifications` (`notifications.routes.ts`): In-app notifications and read state management.
- `/api/messages` (`messages.routes.ts`): Direct peer-to-peer messaging between platform users.

---

## 6. Database Architecture

The persistence model is managed by **Prisma ORM** interacting with an SQLite database (`backend/prisma/schema.prisma`).

```
+-----------------------------------------------------------------------------------+
|                                 DATABASE SCHEMA                                   |
|                                                                                   |
|  +-------------+       +-------------------+       +-----------------------+      |
|  | Institution |<------|    Department     |<------|        Branch         |      |
|  +------+------+       +-------------------+       +-----------------------+      |
|         |                                                      ^                  |
|         v                                                      |                  |
|  +------+------+       +-------------------+                   |                  |
|  |    User     |------>|  StudentProfile   |-------------------+                  |
|  +------+------+       +---------+---------+                                      |
|         |                        |                                                |
|         +--> AcademicianProfile  +--> StudentSkillScore <---+                     |
|         +--> AlumniProfile       +--> PortfolioItem         |                     |
|         +--> Company             +--> ResumeDraft           |                     |
|                                  +--> CodingSubmission      |                     |
|                                                             |                     |
|  +-------------+       +-------------------+                |                     |
|  | Opportunity |<------|    Application    |                |                     |
|  +------+------+       +-------------------+          +-----+------+              |
|         ^                                             |   Skill    |              |
|         |              +-------------------+          +-----+------+              |
|         +--------------| AssessmentQuestion|<---------------+                     |
|                        +-------------------+                                      |
+-----------------------------------------------------------------------------------+
```

### 6.1 Entity Models & Primary Relations

| Model | Purpose | Key Relations |
| :--- | :--- | :--- |
| **`User`** | Central identity entity | 1:1 `StudentProfile`, `AcademicianProfile`, `AlumniProfile`; N:1 `Institution`, `Company`; 1:N `Application`, `Message`, `Notification` |
| **`Institution`** | Engineering university/college | 1:N `Department`, `User`, `Opportunity`, `PlacedStudent` |
| **`Department`** | Academic department (CSE, MECH, etc.) | N:1 `Institution`; 1:N `Branch` |
| **`Branch`** | Specialization branch (AI-DS, Robotics, etc.) | N:1 `Department` |
| **`Company`** | Corporate hiring organization | 1:N `User`, `Opportunity` |
| **`StudentProfile`** | Academic & demographic record of student | 1:1 `User`; 1:N `StudentSkillScore`, `PortfolioItem`, `CodingSubmission`, `ResumeDraft` |
| **`AcademicianProfile`**| Faculty academic & research record | 1:1 `User`; 1:N `MentorshipEvent` |
| **`AlumniProfile`** | Alumnus professional record | 1:1 `User` |
| **`Skill`** | Standardized engineering skill node | 1:N `StudentSkillScore`, `AssessmentQuestion` |
| **`CareerRole`** | Industry role with skill requirements JSON | Independent benchmark entity |
| **`AssessmentQuestion`**| MCQ and Coding challenge repository | N:1 `Skill`; 1:N `CodingSubmission` |
| **`CodingSubmission`** | Code uploaded by student for coding challenge| N:1 `StudentProfile`, `AssessmentQuestion` |
| **`StudentSkillScore`**| Measured proficiency (0-100) per skill | N:1 `StudentProfile`, `Skill` (Unique: `studentId_skillId`) |
| **`Opportunity`** | Requisition posted by Company/College | N:1 `Company`, `Institution`; 1:N `Application` |
| **`Application`** | Student application to opportunity | N:1 `Opportunity`, `User`; 1:N `ApplicationStatusHistory` |
| **`ApplicationStatusHistory`**| Audit trail of stage changes | N:1 `Application` |
| **`PortfolioItem`** | Verifiable project or certificate | N:1 `StudentProfile` |
| **`MentorshipEvent`** | Workshop or FDP scheduled by faculty | N:1 `AcademicianProfile`; 1:N `EventRegistration` |
| **`EventRegistration`**| Student booking for mentorship event | N:1 `MentorshipEvent`, `User` (Unique: `eventId_userId`) |
| **`PlacedStudent`** | Verified campus placement record | N:1 `Institution` |
| **`InternshipOutcomeStory`**| Verified internship case study | Independent institutional record |
| **`Notification`** | In-app user alert | N:1 `User` |
| **`Message`** | Peer-to-peer direct communication | N:1 `User` (as sender and receiver) |
| **`ResumeDraft`** | Student customized ATS resume draft | N:1 `StudentProfile` |
| **`AlumniPost`** | Article, advice, or discussion post | N:1 `User`; 1:N `AlumniPostComment`, `AlumniPostLike` |
| **`AlumniPostComment`**| Threaded reply on alumni post | N:1 `AlumniPost`, `User` |
| **`AlumniPostLike`** | Like record on alumni post | N:1 `AlumniPost`, `User` (Unique: `postId_userId`) |
| **`CompanyPlacementStat`**| Tier/Company-wise placement statistics | Independent institutional metric record |
| **`AuditLog`** | Security and action audit ledger | Independent log entity |
| **`MentorshipRequest`**| 1-on-1 student-to-alumni guidance request | N:1 `User` (Student and Mentor) |

---

## 7. Authentication & Security

1. **Password Hashing:** Passwords encrypted using `bcryptjs` with salt round factor 10 prior to database write.
2. **Stateless JWT Tokens:** Standard signed JSON Web Tokens (`jsonwebtoken`) containing `{ id, email, role }` signed with `JWT_SECRET`, expiring in `7d`.
3. **Role-Based Authorization:** Strict route interceptors (`requireRoles`) ensuring students cannot access recruiter pipelines, recruiters cannot modify institutional settings, and non-administrators cannot perform moderation.
4. **Input Sanitization & Schema Validation:** Request payloads validated with `zod` schemas enforcing string length limits, allowed enum sets, and type coercion.
5. **File Upload Security:**
   - Handled via `multer.memoryStorage()`.
   - Strict MIME-type filtering: Images restricted to `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
   - File size caps: 5 MB for profile photos/logos; 15 MB for portfolio documents/certificates.
   - Files stored with sanitized filenames and timestamps via `LocalStorageService`.
6. **Environment Isolation:** Secrets (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `UPLOAD_DIR`) isolated in `.env` and excluded via `.gitignore`.

---

## 8. Student Workflow

The implemented end-to-end undergraduate student journey:

```
[1. Register / Login] 
       │
       ▼
[2. Complete Academic Profile] (Degree, Department, Branch, Year, CGPA)
       │
       ▼
[3. Skill Assessment & Coding Upload] (MCQ + Practical Coding Challenge Submissions)
       │
       ▼
[4. Skill Profile & Radar Generation] (Student score vs. Target Role Benchmark)
       │
       ▼
[5. Explore & Filter Opportunities] (Instant Match Score % calculated dynamically)
       │
       ▼
[6. Submit Opportunity Application] (Application tracked in recruiter pipeline)
       │
       ▼
[7. Portfolio & Project Management] (Upload projects, certificates, GitHub/Live links)
       │
       ▼
[8. ATS Resume Generation] (Auto-populated ATS/Modern PDF export)
       │
       ▼
[9. Alumni Mentorship & Events] (1-on-1 requests + Workshop attendance)
       │
       ▼
[10. Campus Placement & Offer] (Status moves to 'selected' -> PlacedStudent record)
```

---

## 9. Faculty Workflow

The implemented academician workflow:

```
[1. Faculty Registration & Profile Setup] (Department, Research, ORCID, Expertise Tags)
       │
       ▼
[2. Host Mentorship Sessions & Workshops] (Create online/offline events with capacity caps)
       │
       ▼
[3. Question Bank Management] (Create, edit, and delete technical & coding questions)
       │
       ▼
[4. Supervise Department Cohort] (Monitor student readiness and department skill gaps)
       │
       ▼
[5. Engage with Industry Opportunities] (Apply to Corporate FDPs & Consultancy Projects)
```

---

## 10. Industry Workflow

The corporate talent acquisition workflow:

```
[1. Recruiter Registration & Company Profile] (Hiring domains, size, recruiter contact)
       │
       ▼
[2. Post Opportunity] (Specify type, stipend, CGPA cutoff, branches, and required skills with weights)
       │
       ▼
[3. Automated Candidate Matching & Ranking] (Applicants ranked by composite match score %)
       │
       ▼
[4. Inspect Detailed Candidate Profiles] (Review skill breakdown, gaps, portfolio, and code submissions)
       │
       ▼
[5. Recruitment Pipeline Management] (Transition stages: Applied -> Shortlisted -> Interview -> Selected)
```

---

## 11. Institution / Placement Cell Workflow

The institutional placement automation workflow:

```
[1. Institutional Overview & Configuration] (Branding, official TPO contacts, campus code)
       │
       ▼
[2. Curriculum Gap Radar Analysis] (Identify branch-wise deficits between student skills and hiring demand)
       │
       ▼
[3. Cohort Roster & Rank Computation] (Deterministic calculation of Batch, Dept, Branch, and Overall Ranks)
       │
       ▼
[4. Placement Statistics Tracking] (Company-wise eligible, appeared, shortlisted, offers, and package metrics)
       │
       ▼
[5. NAAC / NIRF Accreditation Report Export] (1-click export for Criteria 5.2.1, 5.2.2, 3.5.2, and 1.2.1)
```

---

## 12. Alumni Workflow

The alumni networking and guidance workflow:

```
[1. Alumnus Profile Setup] (Graduation batch, company, current role, mentorship availability)
       │
       ▼
[2. Publish Knowledge Thoughts & Articles] (Share interview experiences, career advice, and roadmaps)
       │
       ▼
[3. Community Engagement] (Like, comment, and participate in discussions with students)
       │
       ▼
[4. 1-on-1 Mentorship Fulfillment] (Review incoming student mentorship requests and accept with notes)
       │
       ▼
[5. Alumni Directory Connection] (Network across graduating batches and partner companies)
```

---

## 13. Skill Assessment & Matching Architecture

### 13.1 Mathematical Match Engine Formulation
Implemented in `backend/src/services/matching.engine.ts`, the composite match calculation evaluates three distinct dimensions:

$$\text{Composite Match Score} = (0.70 \times \text{SkillMatchPct}) + (0.20 \times \text{BranchMatchPct}) + (0.10 \times \text{EligibilityMatchPct})$$

#### 1. Skill Overlap Score ($\text{SkillMatchPct}$, Weight = 70%)
Let:
- $S_i$ = Candidate proficiency in skill $i$ ($0 \le S_i \le 100$)
- $R_i$ = Requisition required proficiency for skill $i$ ($1 \le R_i \le 100$)
- $W_i$ = Importance weight for skill $i$ ($1 \le W_i \le 5$)

$$\text{SkillMatchPct} = \left[ \frac{\sum_{i=1}^N \min(S_i, R_i) \times W_i}{\sum_{i=1}^N R_i \times W_i} \right] \times 100$$

#### 2. Academic Branch Alignment ($\text{BranchMatchPct}$, Weight = 20%)
- **$100\%$**: Candidate branch is explicitly listed in `eligibleBranches` (or `eligibleBranches` is empty / "All").
- **$65\%$**: Candidate department matches an eligible department.
- **$30\%$**: Cross-discipline applicant.

#### 3. CGPA & Academic Eligibility ($\text{EligibilityMatchPct}$, Weight = 10%)
- **$100\%$**: Candidate CGPA $\ge \text{minCgpa}$.
- **Penalized**: If $\text{CGPA} < \text{minCgpa}$, $\text{EligibilityMatchPct} = \max\left(0, \left(1 - \frac{\text{minCgpa} - \text{CGPA}}{2}\right) \times 100\right)$, and $\text{isEligible} = \text{false}$.

### 13.2 Deterministic Ranking Algorithm
- Implemented in `backend/src/routes/analytics.routes.ts` (`assignStandardRanks`), the system uses standard competition ranking (1, 1, 3 for ties) based on CGPA for overall, batch, department, and branch rankings.

---

## 14. Data Flow Diagrams

### A. Student Skill Assessment Flow
```
Student                Frontend (/assessment)            Backend (/api/skills)            Database (SQLite)
   |                             |                                  |                            |
   |--- 1. Selects MCQ/Coding -->|                                  |                            |
   |--- 2. Submits answers/file ->|-- 3. POST /assessment/submit --->|                            |
   |                             |                                  |-- 4. Upsert SkillScore --->|
   |                             |                                  |-- 5. Insert Submission --->|
   |                             |<-- 6. Updated Skill Profile -----|                            |
   |<-- 7. Renders Radar Chart --|                                  |                            |
```

### B. Job Matching & Recommendation Flow
```
Student / System               Frontend (/opportunities)         Backend (/api/opportunities)     Matching Engine
   |                             |                                  |                            |
   |--- 1. Views Opportunities ->|-- 2. GET /recommendations ------>|                            |
   |                             |                                  |-- 3. Load Candidate Skills-|
   |                             |                                  |-- 4. Load Active Postings -|
   |                             |                                  |-- 5. Execute Math Match -->|
   |                             |                                  |<-- 6. Ranked Result Set ---|
   |                             |<-- 7. Sorted Opportunities + Gaps-|                            |
   |<-- 8. Displays Match % -----|                                  |                            |
```

### C. Internship Application & Review Flow
```
Student                Frontend                          Backend (/api/applications)      Recruiter / Industry
   |                             |                                  |                            |
   |--- 1. Clicks Apply -------->|-- 2. POST /apply --------------->|                            |
   |                             |                                  |-- 3. Creates Application ->|
   |                             |                                  |-- 4. Computes Match Score -|
   |                             |                                  |                            |--- 5. Views Ranked Apps
   |                             |                                  |<-- 6. PATCH /status -------|
   |                             |<-- 7. Notification / Stage Update|                            |
```

### D. Institutional Placement & Curriculum Gap Analysis Flow
```
Admin / TPO            Frontend (/admin/curriculum-gap)  Backend (/api/analytics)        Database & Math Aggregator
   |                             |                                  |                            |
   |--- 1. Selects Department -->|-- 2. GET /institution ---------->|                            |
   |                             |                                  |-- 3. Aggregate Student Avg |
   |                             |                                  |-- 4. Aggregate Demand Wt --|
   |                             |                                  |-- 5. Compute Deficit (Gap) |
   |                             |<-- 6. Gap Radar & Company Stats -|                            |
   |<-- 7. Displays Radar & KPI -|                                  |                            |
```

### E. Alumni Interaction & Mentorship Flow
```
Student                Frontend                          Backend (/api/alumni)            Alumnus
   |                             |                                  |                            |
   |--- 1. Requests Mentorship ->|-- 2. POST /mentorship-requests ->|                            |
   |                             |                                  |-- 3. In-app Notification ->|
   |                             |                                  |                            |--- 4. Reviews Request
   |                             |                                  |<-- 5. PUT /request (Accept)|
   |<-- 6. Receives Acceptance --|<-- 7. Update Notification -------|                            |
```

### F. Faculty Mentorship Event Flow
```
Faculty                Frontend (/academician/mentorship) Backend (/api/mentorship)        Student
   |                             |                                  |                            |
   |--- 1. Schedules Workshop -->|-- 2. POST /events -------------->|                            |
   |                             |                                  |                            |--- 3. Explores Events
   |                             |                                  |<-- 4. POST /register ------|
   |                             |<-- 5. Updated Attendee Roster ---|                            |
```

---

## 15. Technology Stack

All technologies listed below are actively present in `package.json` and project source files:

| Layer | Technology | Purpose in Project |
| :--- | :--- | :--- |
| **Frontend Framework** | `React 18.3.1` | Declarative component UI rendering and reactive state management |
| **Frontend Build Tool** | `Vite 6.0.3` | Modern lightning-fast HMR and bundle compilation |
| **Client Routing** | `react-router-dom 6.28.0` | Client-side single-page application routing and role-guarded routes |
| **Styling & Design** | `Tailwind CSS 3.4.16` | Utility-first CSS responsive design system and glassmorphism styling |
| **CSS Utility Helpers** | `clsx 2.1.1`, `tailwind-merge 2.5.5` | Dynamic, conflict-free className generation |
| **Data Visualization** | `recharts 2.15.0` | SVG-based Radar Charts, Bar Charts, and analytical trend graphs |
| **Iconography** | `lucide-react 0.468.0` | Modern, scalable SVG icons across all dashboards and navigation |
| **HTTP Client** | `axios 1.7.9` | Interceptor-enabled async communication with backend REST API |
| **Client Query Cache** | `@tanstack/react-query 5.62.8` | Server state fetching and cache utilities |
| **PDF Resume Exporter** | `jspdf 4.2.1`, `html2canvas 1.4.1` | Client-side HTML-to-canvas and PDF resume generation |
| **Backend Framework** | `Express 4.21.2` | RESTful API server routing, middleware, and request handling |
| **Language & Runtime** | `TypeScript 5.7.3`, `Node.js` (with `tsx 4.19.2`) | Strict type safety across frontend, backend, and shared libraries |
| **Database & ORM** | `Prisma ORM 5.22.0`, `SQLite` (`dev.db`) | Relational database schema modeling, migrations, and typed queries |
| **Authentication & Security** | `jsonwebtoken 9.0.2`, `bcryptjs 2.4.3` | Secure password hashing and stateless JWT bearer token authentication |
| **Schema Validation** | `zod 3.24.1` | Runtime API request payload validation |
| **File Upload Handling** | `multer 1.4.5-lts.1` | Memory storage buffer parsing and multipart form data handling |
| **Environment Config** | `dotenv 16.4.7` | Secure environment variable resolution |
| **Monorepo Shared Package** | `@ayush-portal/shared` | Shared TypeScript types, enums, constants, and taxonomies |

---

## 16. API Architecture

| Route Prefix | Controller / Handler | Primary Responsibilities |
| :--- | :--- | :--- |
| `/api/auth` | `auth.routes.ts` | User login, multi-role registration, `/me` profile retrieval, profile updates, photo/logo upload (`/profile-photo`), demo accounts. |
| `/api/skills` | `skills.routes.ts` | Skill taxonomy, career role requirements, MCQ assessment submission, coding assessment file submission, question bank CRUD. |
| `/api/opportunities` | `opportunities.routes.ts` | Listing and searching opportunities, posting new requisitions, updating/deleting postings, calculating student match recommendations. |
| `/api/applications` | `applications.routes.ts` | Opportunity application submission, candidate rank retrieval for recruiters, recruitment stage progression (`applied` -> `selected`). |
| `/api/portfolio` | `portfolio.routes.ts` | Student project and certificate uploads, `/public/:slug` digital portfolio rendering, live ATS resume builder draft saving. |
| `/api/mentorship` | `mentorship.routes.ts` | Workshop and FDP event scheduling, session listing, student registration and capacity tracking. |
| `/api/alumni` | `alumni.routes.ts` | Alumni guidance posts feed, likes, comments, 1-on-1 mentorship request workflow. |
| `/api/analytics` | `analytics.routes.ts` | Student/Faculty/Industry dashboards, institutional placement metrics, curriculum gap radar data, student roster rank recalculation, NAAC report export. |
| `/api/notifications`| `notifications.routes.ts`| User notification fetching and read state updates. |
| `/api/messages` | `messages.routes.ts` | Direct peer-to-peer messaging between platform users. |

---

## 17. File / Project Structure

```
SIH2026Project-main/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Relational Prisma models & relations
│   │   ├── seed.ts                    # Comprehensive seed data script
│   │   └── dev.db                     # SQLite database file (ignored in git)
│   ├── src/
│   │   ├── config/index.ts            # Environment variables & constants
│   │   ├── lib/prisma.ts              # Singleton Prisma client instance
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification & role authorization
│   │   │   └── validate.middleware.ts # Zod body validation wrapper
│   │   ├── routes/
│   │   │   ├── alumni.routes.ts       # Alumni post & mentorship endpoints
│   │   │   ├── analytics.routes.ts    # Dashboard metrics, NAAC, ranking
│   │   │   ├── applications.routes.ts # Candidate application pipeline
│   │   │   ├── auth.routes.ts         # Authentication & photo uploads
│   │   │   ├── mentorship.routes.ts   # Faculty mentorship sessions
│   │   │   ├── messages.routes.ts     # Peer-to-peer messages
│   │   │   ├── notifications.routes.ts# User notification endpoints
│   │   │   ├── opportunities.routes.ts# Requisition management & matching
│   │   │   ├── portfolio.routes.ts    # Portfolio, projects, resume builder
│   │   │   └── skills.routes.ts       # Skill taxonomy, coding, question bank
│   │   ├── services/
│   │   │   ├── matching.engine.ts     # Deterministic match calculation algorithm
│   │   │   ├── matching.engine.test.ts# Match engine test verification
│   │   │   └── storage.service.ts     # Local filesystem upload/delete handler
│   │   ├── app.ts                     # Express app & route mounting
│   │   └── server.ts                  # Server entry & port binding
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/common/
│   │   │   ├── DemoSwitcherBar.tsx    # Quick persona switcher
│   │   │   ├── Footer.tsx             # Standard portal footer
│   │   │   ├── Navbar.tsx             # Dynamic role-based navigation bar
│   │   │   ├── ProfilePhotoUpload.tsx # Reusable photo upload modal
│   │   │   └── ProtectedRoute.tsx     # Role-guarded route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Global auth state & user session
│   │   ├── data/
│   │   │   └── codingQuestions250.ts  # Structured coding challenge catalog
│   │   ├── lib/
│   │   │   └── api.ts                 # Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── academician/           # Faculty dashboard, events, profile
│   │   │   ├── admin/                 # Placement stats, gap radar, roster, settings
│   │   │   ├── alumni/                # Alumni dashboard & post feed
│   │   │   ├── common/                # Messaging page
│   │   │   ├── industry/              # Recruiter dashboard, post opp, review
│   │   │   ├── student/               # Student dashboard, assessment, coding, portfolio
│   │   │   ├── LandingPage.tsx        # Main public portal overview
│   │   │   ├── LoginPage.tsx          # Login portal
│   │   │   ├── PublicPortfolioPage.tsx# Public shareable student showcase
│   │   │   └── RegisterPage.tsx       # Multi-role registration portal
│   │   ├── App.tsx                    # Top-level routing & layout assembly
│   │   ├── index.css                  # Tailwind directives & global styling
│   │   └── main.tsx                   # React DOM root entry
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── shared/
│   ├── src/
│   │   ├── constants.ts               # Roles, categories, statuses, departments
│   │   ├── index.ts                   # Export barrel
│   │   └── types.ts                   # Unified shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── .gitignore
├── ARCHITECTURE.md                    # This architecture document
├── package.json                       # Monorepo root configuration
└── README.md                          # Project documentation & setup guide
```

---

## 18. Deployment Architecture

### 18.1 Currently Implemented (Local & Staging Monorepo)
- **Monorepo Structure:** npm workspaces linking `@ayush-portal/shared`, `@ayush-portal/backend`, and `@ayush-portal/frontend`.
- **Database:** Local embedded SQLite database (`dev.db`) accessed via Prisma ORM client with automated seeding scripts (`prisma/seed.ts`).
- **File Storage:** Local disk storage in `/uploads` mapped via Express static file middleware.
- **Frontend Dev Server:** Vite development server running on port `5173` proxying `/api` requests to Express on port `5000`.

### 18.2 Planned / Future Production Deployment
*(Marked as planned extensions for cloud deployment)*
- **Database Migration:** Swap SQLite for managed PostgreSQL / MySQL on AWS RDS or Supabase using Prisma schema provider switch (`provider = "postgresql"`).
- **Object Storage:** Swap `LocalStorageService` with AWS S3 / Cloudinary for distributed media and document persistence.
- **Containerization & Hosting:** Docker containers deployed on AWS ECS / DigitalOcean / Vercel with automated CI/CD pipelines via GitHub Actions.

---

## 19. Architecture Diagram Specification

*(Optimized for SIH Presentation Slide: Vertically compact, clean hierarchy, readable labels, minimal clutter)*

```
+---------------------------------------------------------------------------------------------------+
|                                  5 STAKEHOLDER PERSONAS (WEB CLIENT)                              |
|   [Student]      [Faculty / Academician]      [Industry / Recruiter]      [Placement Cell]      [Alumni]  |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                               PRESENTATION & CLIENT APPLICATION (SPA)                             |
|   React 18 + Vite  •  Role-Based Navigation  •  Recharts Visualizations  •  Tailwind Design System |
+-------------------------------------------------+-------------------------------------------------+
                                                  |  HTTPS REST / JSON / FormData
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                API GATEWAY & SECURITY MIDDLEWARE                                  |
|   Express 4 Server  •  JWT Token Authentication  •  Role Authorization (RBAC)  •  Zod Validation   |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                     CORE BUSINESS MODULES                                         |
|  [Skill Assessment & Coding]  [Opportunity & Requisition]  [Recruitment Pipeline]  [Portfolio & ATS Resume] |
|  [Mentorship & FDP Sessions]  [Alumni Thought Network]     [Curriculum Gap Radar]  [NAAC / NIRF Reporting]  |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                               INTELLIGENCE & MATHEMATICAL ENGINES                                 |
|  • Candidate-Opportunity Match Engine (70% Skill + 20% Branch + 10% CGPA)                         |
|  • Deterministic Rank Calculation Engine (Batch / Dept / Branch / Overall)                        |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  PERSISTENCE & STORAGE LAYER                                      |
|            Prisma ORM 5.22 Client  •  Relational Database  •  Document File Storage               |
+---------------------------------------------------------------------------------------------------+

                          KEY CROSS-STAKEHOLDER COLLABORATION CHANNELS
  Student <======== Bi-directional Match / Applications ========> Industry / Recruiter
  Student <============= Mentorship & Workshops ================> Faculty / Academician
  Student <============ Career Guidance & Insights =============> Alumni
  Industry <============= Placements & Hiring Drives ============> Placement Cell Admin
  Faculty <============== FDPs & Joint Consultancy =============> Industry / Recruiter
  Placement Cell <====== Cohort Analytics & Compliance =========> All Stakeholders
```

---

## 20. Architecture Diagram Labels

Use these exact short labels inside the presentation slide blocks:

1. **Top Row (Users):** `Student` | `Faculty` | `Industry` | `Placement Admin` | `Alumni`
2. **Layer 1 (Frontend):** `React 18 Single-Page Application (Vite + Tailwind CSS)`
3. **Layer 2 (Security):** `JWT Authentication & Role-Based Access Control (RBAC)`
4. **Layer 3 (Backend):** `Express 4 RESTful API Layer & Zod Validation`
5. **Layer 4 (Modules):** `Skill Intelligence` | `Opportunity Management` | `Recruitment Funnel` | `ATS Resume Builder` | `Mentorship & Events` | `Alumni Network`
6. **Layer 5 (Engine):** `Deterministic Match Engine (70% Skills + 20% Branch + 10% CGPA)`
7. **Layer 6 (Database):** `Prisma ORM + Relational Database + File Storage`

---

## 21. SIH Presentation Explanation (60–90 Second Spoken Script)

> *"Good morning, respected jury members. Today, we present **EduBridge**, a comprehensive engineering academia-industry collaboration and placement intelligence platform built specifically for Problem Statement PS 26044.*
>
> *At its core, EduBridge breaks the traditional silos between **Students**, **Faculty**, **Industry**, **Placement Cells**, and **Alumni**.*
>
> *Our architecture is designed as a three-tier reactive system:*
> *First, our **Frontend** delivers five specialized, role-guarded portals built with React 18 and Recharts, providing real-time data visualizations such as the Curriculum Gap Radar and instant skill match breakdowns.*
>
> *Second, our **API and Security Layer** leverages Express with JWT and Zod schema validation, ensuring complete role isolation and secure data handling.*
>
> *Third, our **Core Intelligence Layer** features a deterministic mathematical matching engine. Instead of black-box heuristics, it objectively evaluates candidates on a formula of 70% skill proficiency, 20% academic branch alignment, and 10% CGPA eligibility. This powers bi-directional candidate ranking for recruiters and personalized internship recommendations for students.*
>
> *Finally, our **Persistence Layer** is managed via Prisma ORM, linking everything from MCQ and practical coding submissions to automated ATS resumes, alumni mentorship requests, and 1-click NAAC Criteria 5.2.1 compliance reports.*
>
> *EduBridge transforms engineering education from disconnected learning into a measurable, industry-aligned placement ecosystem. Thank you!"*

## v2.1 — Industry Skill Intelligence Upgrade

EduBridge now includes `/api/industry-intelligence/overview` and the institution-admin UI at `/admin/industry-intelligence`.

The module creates an explainable prototype signal from existing active opportunity requirements:
- weighted skill demand score
- required proficiency benchmark
- 30-day vs previous-60-day requirement momentum
- observed student skill average
- student-vs-industry proficiency gap
- category-level curriculum priority map

This is deliberately not marketed as a labour-market forecast. Production can replace the internal opportunity signal with verified external job-description feeds and a normalized skill ontology without changing the UI contract.
