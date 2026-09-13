export const ROLES = {
  STUDENT: 'student',
  ACADEMICIAN: 'academician',
  INDUSTRY: 'industry',
  INSTITUTION_ADMIN: 'institution_admin',
  ALUMNI: 'alumni',
  ALUMNI_ADMIN: 'alumni_admin',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const RESUME_TEMPLATES = {
  ATS: 'ats',
  MODERN: 'modern',
  PROFESSIONAL: 'professional',
} as const;

export type ResumeTemplateType = (typeof RESUME_TEMPLATES)[keyof typeof RESUME_TEMPLATES];

export const ALUMNI_POST_TYPES = {
  CAREER_ADVICE: 'Career Advice',
  PLACEMENT_EXPERIENCE: 'Placement Experience',
  INTERVIEW_EXPERIENCE: 'Interview Experience',
  LEARNING_RESOURCES: 'Learning Resources',
  INDUSTRY_TRENDS: 'Industry Trends',
  PROJECT_ADVICE: 'Project Advice',
  HIGHER_STUDIES: 'Higher Studies',
  INTERNSHIP_ADVICE: 'Internship Advice',
  COMPANY_EXPERIENCE: 'Company Experience',
  GENERAL_GUIDANCE: 'General Guidance',
} as const;

export type AlumniPostType = (typeof ALUMNI_POST_TYPES)[keyof typeof ALUMNI_POST_TYPES];

export const ALUMNI_POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type AlumniPostStatus = (typeof ALUMNI_POST_STATUS)[keyof typeof ALUMNI_POST_STATUS];

export const OPPORTUNITY_TYPES = {
  INTERNSHIP: 'internship',
  JOB: 'job',
  PROGRAM: 'program',
  FDP: 'fdp',
  CONSULTANCY: 'consultancy',
  RESEARCH: 'research',
} as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[keyof typeof OPPORTUNITY_TYPES];

export const AUDIENCE_TYPES = {
  STUDENT: 'student',
  ACADEMICIAN: 'academician',
  BOTH: 'both',
} as const;

export type AudienceType = (typeof AUDIENCE_TYPES)[keyof typeof AUDIENCE_TYPES];

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  ASSESSMENT: 'assessment',
  INTERVIEW: 'interview',
  SELECTED: 'selected',
  REJECTED: 'rejected',
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const SKILL_CATEGORIES = {
  PROGRAMMING: 'Programming & DSA',
  FRAMEWORKS: 'Frameworks & Web Dev',
  DATABASES: 'Databases & SQL',
  CLOUD_DEVOPS: 'Cloud & DevOps',
  AI_ML_DATA: 'AI, Data Science & ML',
  CORE_ENGINEERING: 'Core Engineering (CAD, Embedded, Structural)',
  TOOLS: 'Tools & Version Control',
  APTITUDE_SOFT_SKILLS: 'Aptitude & Technical Communication',
} as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[keyof typeof SKILL_CATEGORIES];

export const PORTFOLIO_ITEM_TYPES = {
  CERTIFICATE: 'certificate',
  PROJECT: 'project',
  INTERNSHIP_COMPLETION: 'internship-completion',
  ACHIEVEMENT: 'achievement',
} as const;

export type PortfolioItemType = (typeof PORTFOLIO_ITEM_TYPES)[keyof typeof PORTFOLIO_ITEM_TYPES];

export const MENTORSHIP_EVENT_TYPES = {
  WORKSHOP: 'workshop',
  GUEST_LECTURE: 'guest-lecture',
  MENTORSHIP: 'mentorship',
  FDP: 'fdp',
  ALUMNI_TALK: 'alumni-talk',
} as const;

export type MentorshipEventType = (typeof MENTORSHIP_EVENT_TYPES)[keyof typeof MENTORSHIP_EVENT_TYPES];

export const ENGINEERING_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
] as const;

export const ENGINEERING_BRANCHES: Record<string, string[]> = {
  'Computer Science & Engineering': [
    'Computer Science & Engineering',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Cyber Security',
  ],
  'Information Technology': ['Information Technology'],
  'Electronics & Telecommunication': [
    'Electronics & Telecommunication Engineering',
    'VLSI & Embedded Systems',
  ],
  'Mechanical Engineering': [
    'Mechanical Engineering',
    'Robotics & Automation',
  ],
  'Civil Engineering': [
    'Civil Engineering',
    'Structural & Construction Engineering',
  ],
  'Electrical Engineering': ['Electrical Engineering'],
};

export const ENGINEERING_BRANCHES_ALL: string[] = Object.values(ENGINEERING_BRANCHES).flat();
