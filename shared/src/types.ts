import {
  UserRole,
  OpportunityType,
  AudienceType,
  ApplicationStatus,
  PortfolioItemType,
  MentorshipEventType,
  ResumeTemplateType,
  AlumniPostType,
  AlumniPostStatus,
} from './constants';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  institutionId?: string | null;
  companyId?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  studentProfile?: StudentProfile | null;
  academicianProfile?: AcademicianProfile | null;
  alumniProfile?: AlumniProfile | null;
  institution?: Institution | null;
  company?: Company | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  degree: string;
  departmentName: string;
  branchName: string;
  year: number; // 1 to 4
  semester: number; // 1 to 8
  rollNumber?: string | null;
  enrollmentNumber?: string | null;
  cgpa: number; // e.g. 8.4
  academicRank?: number | null;
  departmentRank?: number | null;
  branchRank?: number | null;
  batchRank?: number | null;
  graduationYear: number; // e.g. 2026
  phone?: string | null;
  location?: string | null;
  targetRoleId?: string | null;
  portfolioSlug: string;
  bio?: string | null;
  careerGoal?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  institutionName?: string | null;
  profileCompletedPct?: number;
  createdAt: string;
}

export interface AcademicianProfile {
  id: string;
  userId: string;
  name: string;
  department: string;
  branch?: string | null;
  designation?: string | null;
  experienceYears?: number;
  specialization?: string | null;
  researchInterests?: string[];
  publications?: string[];
  labExpertise?: string[];
  expertiseTags: string[];
  bio?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  orcidUrl?: string | null;
  institutionName?: string | null;
  createdAt: string;
}

export interface AlumniProfile {
  id: string;
  userId: string;
  name: string;
  graduationYear: number;
  departmentName: string;
  branchName: string;
  company: string;
  role: string;
  experienceYears: number;
  location?: string | null;
  skills: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isAvailableForMentorship: boolean;
  careerStoryQuote?: string | null;
  createdAt: string;
}

export interface Institution {
  id: string;
  name: string;
  type: string;
  location?: string | null;
  code?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  website?: string | null;
  placementOfficerName?: string | null;
  placementOfficerEmail?: string | null;
  placementOfficerPhone?: string | null;
  createdAt: string;
}

export interface Department {
  id: string;
  institutionId: string;
  name: string;
  code: string;
}

export interface Branch {
  id: string;
  departmentId: string;
  name: string;
  code: string;
}

export interface Company {
  id: string;
  name: string;
  industryType: string;
  description: string;
  website?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  companySize?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  hiringDomains?: string[];
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  departmentName?: string | null;
  description: string;
  industryDemandWeight?: number;
}

export interface CareerRoleSkill {
  skillName: string;
  minLevel: number; // 1-100
  weight: number; // 1-5
  isMandatory?: boolean;
}

export interface CareerRole {
  id: string;
  title: string;
  departmentName: string;
  branchName?: string | null;
  description: string;
  requiredSkills: CareerRoleSkill[];
  preferredSkills?: string[];
  recommendedProjects?: string[];
  minCgpa?: number;
}

export interface CodingQuestionExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface AssessmentQuestion {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  questionType: 'technical' | 'aptitude' | 'soft_skills' | 'coding';
  questionText: string;
  scenarioText?: string;
  options: {
    label: string;
    score: number; // 0 - 100
  }[];
  difficulty?: 'easy' | 'medium' | 'hard';
  departmentName?: string | null;
  branchName?: string | null;
  targetCareer?: string | null;
  marks?: number;
  correctAnswer?: string | null;
  explanation?: string | null;
  constraints?: string | null;
  examples?: CodingQuestionExample[];
  isActive?: boolean;
  recruiterCompanyId?: string | null;
}

export interface CodingSubmission {
  id: string;
  studentId: string;
  questionId: string;
  questionTitle?: string;
  fileName: string;
  fileLanguage: string;
  fileContent: string;
  status: 'submitted' | 'reviewed';
  score?: number | null;
  reviewerNotes?: string | null;
  uploadedAt: string;
}

export interface StudentSkillScore {
  id: string;
  studentId: string;
  skillId: string;
  skill?: Skill;
  score: number; // 0 - 100
  source: 'self-assessed' | 'assessed' | 'verified';
  updatedAt: string;
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  studentScore: number;
  benchmarkScore: number;
  gap: number;
  status: 'proficient' | 'moderate_gap' | 'critical_gap';
  isMandatory?: boolean;
  recommendedAction: string;
  recommendedResource?: string;
}

export interface SkillProfileData {
  student: StudentProfile & { email: string };
  skills: {
    skillId: string;
    skillName: string;
    category: string;
    score: number;
    source: 'self-assessed' | 'assessed' | 'verified';
  }[];
  categoryAverages: {
    category: string;
    score: number;
    benchmark: number;
  }[];
  radarData: {
    skill: string;
    category: string;
    studentScore: number;
    benchmarkScore: number;
  }[];
  skillGaps: SkillGapItem[];
  overallReadinessPct: number;
  topStrengths: string[];
  targetRole?: CareerRole | null;
  availableRoles: CareerRole[];
}

export interface RequiredSkill {
  skillId: string;
  skillName?: string;
  level: number; // 1-100 required proficiency level
  weight: number; // 1-5 importance weight
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  postedByCompanyId?: string | null;
  postedByInstitutionId?: string | null;
  company?: Company | null;
  institution?: Institution | null;
  title: string;
  description: string;
  location: string;
  workMode: string; // 'Onsite' | 'Hybrid' | 'Remote'
  stipendOrSalary: string;
  durationWeeks: number;
  requiredSkills: RequiredSkill[];
  eligibleDepartments: string[];
  eligibleBranches: string[];
  minCgpa: number;
  eligibleGradYears: number[];
  audience: AudienceType;
  status: 'active' | 'closed' | 'draft';
  openings?: number;
  createdAt: string;
  deadline?: string | null;
  applicantsCount?: number;
  matchScorePct?: number;
  matchExplanation?: {
    skillMatchPct: number;
    branchMatchPct: number;
    eligibilityMatchPct: number;
    overallScorePct: number;
    isEligible: boolean;
    missingSkills: string[];
    satisfiedSkills: string[];
  };
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  notes?: string | null;
  changedAt: string;
  changedByUserId?: string | null;
}

export interface Application {
  id: string;
  opportunityId: string;
  applicantUserId: string;
  opportunity?: Opportunity;
  applicant?: User;
  status: ApplicationStatus;
  matchScorePct: number;
  matchDetails?: {
    matchedSkillsCount: number;
    totalRequiredSkills: number;
    skillBreakdown: {
      skillName: string;
      studentScore: number;
      requiredLevel: number;
      contributionPct: number;
    }[];
  };
  coverNote?: string | null;
  appliedAt: string;
  statusHistory: ApplicationStatusHistory[];
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  type: PortfolioItemType;
  title: string;
  issuer: string;
  description?: string | null;
  fileUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  technologies?: string | null;
  role?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  teamMembers?: string | null;
  verified: boolean;
  date: string;
  skillsTagged?: string[];
}

export interface PublicPortfolioData {
  student: StudentProfile;
  institutionName: string;
  skills: {
    skillName: string;
    category: string;
    score: number;
    source: 'self-assessed' | 'assessed' | 'verified';
  }[];
  portfolioItems: PortfolioItem[];
  stats: {
    verifiedSkillsCount: number;
    certificatesCount: number;
    projectsCount: number;
    internshipsCompletedCount: number;
  };
}

export interface MentorshipEvent {
  id: string;
  hostAcademicianId: string;
  hostAcademician?: {
    name: string;
    department: string;
    institutionName?: string | null;
    avatarUrl?: string | null;
  };
  title: string;
  type: MentorshipEventType;
  description: string;
  dateTime: string;
  startTime?: string | null;
  endTime?: string | null;
  mode?: string;
  locationOrLink: string;
  relevantBranch?: string | null;
  relevantSkills?: string[];
  maxAttendees?: number;
  attendeesCount: number;
  isRegistered?: boolean;
}

export interface PlacedStudent {
  id: string;
  institutionId: string;
  studentName: string;
  branchName: string;
  cgpa: number;
  companyName: string;
  role: string;
  packageLpa: number;
  placementType: string;
  academicYear: string;
  placedAt: string;
  skills?: string[];
  isPublicStory: boolean;
  storyQuote?: string | null;
  avatarUrl?: string | null;
}

export interface CompanyPlacementStats {
  companyName: string;
  industryType: string;
  eligibleStudentsCount: number;
  appearedCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  offersMadeCount: number;
  acceptedCount: number;
  highestPackageLpa: number;
  averagePackageLpa: number;
  medianPackageLpa: number;
}

export interface InternshipOutcomeStory {
  id: string;
  studentName: string;
  branchName: string;
  companyName: string;
  role: string;
  skillsGained: string[];
  durationWeeks: number;
  outcome: string;
  year: number;
  storyText?: string | null;
  avatarUrl?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  senderName?: string;
  receiverName?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  studentUserId: string;
  mentorUserId: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  responseNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  studentUser?: {
    id: string;
    email: string;
    avatarUrl?: string | null;
    studentProfile?: StudentProfile | null;
  };
  mentorUser?: {
    id: string;
    email: string;
    avatarUrl?: string | null;
    alumniProfile?: AlumniProfile | null;
    academicianProfile?: AcademicianProfile | null;
  };
}

// Analytics DTOs
export interface StudentAnalytics {
  placementReadinessPct: number;
  profileCompletionPct: number;
  skillAssessmentStatus: 'Completed' | 'Pending';
  targetRoleTitle: string;
  targetRoleMatchPct: number;
  topSkillGaps: SkillGapItem[];
  nextBestAction: {
    title: string;
    description: string;
    actionLink: string;
    buttonLabel: string;
  };
  applicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  offersCount: number;
  recommendedOpportunities: Opportunity[];
  upcomingEventsCount?: number;
  activeProjectsCount?: number;
}

export interface AcademicianAnalytics {
  activeMentorshipsCount: number;
  totalMenteesCount: number;
  collaborativeProjectsCount: number;
  supervisedStudents: {
    id: string;
    name: string;
    branchName: string;
    year: number;
    cgpa: number;
    readinessScore: number;
    topSkill: string;
    gapSkill: string;
  }[];
  appliedOpportunities: Opportunity[];
  upcomingEvents: MentorshipEvent[];
}

export interface IndustryAnalytics {
  activePostingsCount: number;
  totalApplicantsCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  offersMadeCount: number;
  applicantSkillDistribution: { skillName: string; applicantAverage: number; requiredThreshold: number }[];
  pipelineFunnel: { stage: string; count: number; percentage: number }[];
  recentPostings: {
    id: string;
    title: string;
    type: string;
    location: string;
    workMode: string;
    applicantsCount: number;
    eligibleBranches: string[];
    createdAt: string;
  }[];
}

export interface InstitutionAnalytics {
  totalStudents: number;
  studentsAssessedCount: number;
  assessmentCompletionPct: number;
  internshipParticipationRatePct: number;
  placementRatePct: number;
  averageTimeToPlacementDays: number;
  highestPackageLpa: number;
  averagePackageLpa: number;
  departmentReadiness: { department: string; readinessPct: number; studentCount: number }[];
  skillGapSeverityDistribution: {
    severity: 'Low (<15% gap)' | 'Moderate (15-35% gap)' | 'High (>35% gap)';
    studentCount: number;
    percentage: number;
  }[];
  topInDemandSkills: {
    skillName: string;
    category: string;
    demandFrequency: number;
    avgRequiredLevel: number;
  }[];
  curriculumGapRadar: {
    skillName: string;
    category: string;
    departmentName: string;
    industryDemandScore: number; // 0 - 100
    studentProficiencyScore: number; // 0 - 100
    curriculumGapScore: number; // industryDemand - studentProficiency
    gapStatus: 'Critical Priority' | 'Moderate Gap' | 'Aligned / Surplus';
  }[];
  companyPlacementStats: CompanyPlacementStats[];
  placedStudents: PlacedStudent[];
  internshipOutcomes: InternshipOutcomeStory[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ResumeSectionConfig {
  education: boolean;
  skills: boolean;
  projects: boolean;
  internships: boolean;
  certifications: boolean;
  achievements: boolean;
  publications: boolean;
  extraCurricular: boolean;
  workExperience: boolean;
  positionsOfResponsibility: boolean;
  languages: boolean;
  interests: boolean;
  relevantCoursework: boolean;
  research: boolean;
  leadership: boolean;
  references: boolean;
}

export interface ResumeDraft {
  id: string;
  studentId: string;
  title: string;
  targetRole: string;
  templateId: ResumeTemplateType;
  summary?: string | null;
  careerObjective?: string | null;
  selectedSkillIds?: string[];
  customSkills?: string[];
  selectedProjectIds?: string[];
  selectedInternshipIds?: string[];
  selectedCertIds?: string[];
  selectedAchievementIds?: string[];
  additionalSections?: Partial<ResumeSectionConfig>;
  customSectionsData?: Record<string, string>;
  sectionOrder?: string[];
  isPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniPost {
  id: string;
  authorUserId: string;
  title: string;
  content: string;
  postType: AlumniPostType;
  company?: string | null;
  role?: string | null;
  branchName?: string | null;
  graduationYear?: number | null;
  tags?: string[];
  status: AlumniPostStatus;
  isFeatured?: boolean;
  likesCount: number;
  commentsCount?: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    alumniProfile?: AlumniProfile | null;
  };
  comments?: AlumniPostComment[];
}

export interface AlumniPostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    studentProfile?: { name: string; branchName: string; avatarUrl?: string | null } | null;
    alumniProfile?: { name: string; company: string; role: string; avatarUrl?: string | null } | null;
    academicianProfile?: { name: string; department: string; avatarUrl?: string | null } | null;
  };
}

export interface CompanyPlacementStatsRecord {
  id: string;
  institutionId: string;
  companyName: string;
  academicYear: string;
  departmentName?: string | null;
  eligibleStudents: number;
  appeared: number;
  shortlisted: number;
  interviewed: number;
  offersCount: number;
  acceptedCount: number;
  highestPackage: number;
  averagePackage: number;
  medianPackage: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: any;
  createdAt: string;
}
