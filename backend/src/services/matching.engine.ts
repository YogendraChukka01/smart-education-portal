/**
 * CORE MATCHING ENGINE
 * 
 * Standalone, deterministic mathematical scoring engine for:
 * 1. Student -> Opportunity Recommendations (Internships / Jobs / Programs)
 * 2. Recruiter -> Candidate Ranking
 * 3. Student -> Career Role Skill Gap Analysis
 * 
 * Mathematical Formulation:
 * -------------------------------------------------------------
 * 1. Skill Overlap Score (Weight = 70% of total score):
 *    Let:
 *      S_i = Student proficiency score for skill i (range 0..100)
 *      R_i = Required minimum level for skill i in the opportunity (range 1..100)
 *      W_i = Importance weight for skill i (range 1..5)
 * 
 *      SkillMatchPct = [ Σ ( min(S_i, R_i) * W_i ) / Σ ( R_i * W_i ) ] * 100
 * 
 * 2. Academic Branch Alignment (Weight = 20% of total score):
 *    - 100% if student's branch is explicitly in eligibleBranches or eligibleBranches is empty
 *    - 60% if student's department matches an eligible department
 *    - 20% otherwise (cross-discipline interest)
 * 
 * 3. CGPA & Academic Eligibility (Weight = 10% of total score):
 *    - 100% if student CGPA >= minCgpa
 *    - Graduated penalty if below threshold
 * 
 * Total Composite Match Score = 0.70 * SkillMatchPct + 0.20 * BranchMatchPct + 0.10 * CgpaMatchPct
 * -------------------------------------------------------------
 */

export interface CandidateSkill {
  skillId: string;
  skillName?: string;
  score: number; // 0 to 100
  source?: 'self-assessed' | 'assessed' | 'verified';
}

export interface OpportunitySkillRequirement {
  skillId: string;
  skillName?: string;
  level: number; // 1 to 100 (required proficiency level)
  weight: number; // 1 to 5 (importance weight)
  isMandatory?: boolean;
}

export interface CandidateAcademicProfile {
  departmentName?: string;
  branchName?: string;
  cgpa?: number;
  graduationYear?: number;
}

export interface OpportunityAcademicCriteria {
  eligibleDepartments?: string[];
  eligibleBranches?: string[];
  minCgpa?: number;
  eligibleGradYears?: number[];
}

export interface SkillMatchContribution {
  skillId: string;
  skillName: string;
  studentScore: number;
  requiredLevel: number;
  weight: number;
  effectiveScore: number; // min(studentScore, requiredLevel)
  contributionPct: number;
  isSatisfied: boolean;
  gap: number; // max(0, requiredLevel - studentScore)
}

export interface MatchScoreResult {
  scorePct: number; // 0.0 to 100.0 (overall composite score)
  skillMatchPct: number; // 0.0 to 100.0 (skill-only overlap)
  branchMatchPct: number;
  eligibilityMatchPct: number;
  isEligible: boolean;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  breakdown: SkillMatchContribution[];
  topGaps: SkillMatchContribution[];
  topStrengths: SkillMatchContribution[];
  missingMandatorySkills: string[];
}

/**
 * Pure scoring function: calculates explainable match score between candidate profile and opportunity.
 */
export function calculateMatchScore(
  candidateSkills: CandidateSkill[],
  requirements: OpportunitySkillRequirement[],
  candidateAcademic?: CandidateAcademicProfile,
  opportunityAcademic?: OpportunityAcademicCriteria
): MatchScoreResult {
  // 1. Skill Overlap Calculation
  let skillMatchPct = 100.0;
  let matchedSkillsCount = 0;
  const breakdown: SkillMatchContribution[] = [];
  const missingMandatorySkills: string[] = [];

  const skillMap = new Map<string, CandidateSkill>();
  for (const sk of candidateSkills) {
    skillMap.set(sk.skillId, sk);
    if (sk.skillName) {
      skillMap.set(sk.skillName.toLowerCase(), sk);
    }
  }

  if (requirements && requirements.length > 0) {
    let totalWeightedRequired = 0;
    let totalWeightedAchieved = 0;

    for (const req of requirements) {
      const requiredLevel = Math.max(1, Math.min(100, req.level || 50));
      const weight = Math.max(1, Math.min(5, req.weight || 1));
      const maxContributionForSkill = requiredLevel * weight;
      totalWeightedRequired += maxContributionForSkill;

      // Lookup by skillId or skillName
      let studentSkill = skillMap.get(req.skillId);
      if (!studentSkill && req.skillName) {
        studentSkill = skillMap.get(req.skillName.toLowerCase());
      }

      const rawStudentScore = studentSkill ? Math.max(0, Math.min(100, studentSkill.score)) : 0;
      const effectiveScore = Math.min(rawStudentScore, requiredLevel);
      const weightedAchieved = effectiveScore * weight;
      totalWeightedAchieved += weightedAchieved;

      const isSatisfied = rawStudentScore >= requiredLevel;
      if (isSatisfied) {
        matchedSkillsCount++;
      } else if (req.isMandatory) {
        missingMandatorySkills.push(req.skillName || req.skillId);
      }

      const gap = Math.max(0, requiredLevel - rawStudentScore);
      const skillName = req.skillName || studentSkill?.skillName || req.skillId;

      breakdown.push({
        skillId: req.skillId,
        skillName,
        studentScore: rawStudentScore,
        requiredLevel,
        weight,
        effectiveScore,
        contributionPct: Math.round((weightedAchieved / maxContributionForSkill) * 100),
        isSatisfied,
        gap,
      });
    }

    const rawSkillScore = totalWeightedRequired > 0 
      ? (totalWeightedAchieved / totalWeightedRequired) * 100 
      : 100;
    skillMatchPct = Math.round(rawSkillScore * 10) / 10;
  }

  // 2. Branch Match Calculation
  let branchMatchPct = 100.0;
  if (opportunityAcademic?.eligibleBranches && opportunityAcademic.eligibleBranches.length > 0 && candidateAcademic?.branchName) {
    const isDirectBranchMatch = opportunityAcademic.eligibleBranches.some(
      (b) => b.toLowerCase() === candidateAcademic.branchName?.toLowerCase() || b.toLowerCase().includes('all')
    );

    if (isDirectBranchMatch) {
      branchMatchPct = 100.0;
    } else if (
      opportunityAcademic.eligibleDepartments &&
      candidateAcademic.departmentName &&
      opportunityAcademic.eligibleDepartments.some(
        (d) => d.toLowerCase() === candidateAcademic.departmentName?.toLowerCase()
      )
    ) {
      branchMatchPct = 65.0;
    } else {
      branchMatchPct = 30.0; // Cross-branch applicant
    }
  }

  // 3. CGPA Eligibility Calculation
  let eligibilityMatchPct = 100.0;
  let isEligible = true;

  if (opportunityAcademic?.minCgpa && candidateAcademic?.cgpa !== undefined) {
    if (candidateAcademic.cgpa >= opportunityAcademic.minCgpa) {
      eligibilityMatchPct = 100.0;
    } else {
      isEligible = false;
      const deficit = opportunityAcademic.minCgpa - candidateAcademic.cgpa;
      eligibilityMatchPct = Math.max(0, Math.round((1 - deficit / 2) * 100));
    }
  }

  // Weighted Composite Score
  // If academic profile or criteria is provided, calculate weighted composite score: 70% Skill + 20% Branch + 10% CGPA.
  // Otherwise, default to skillMatchPct.
  const hasAcademicContext = Boolean(
    candidateAcademic?.branchName ||
    candidateAcademic?.departmentName ||
    candidateAcademic?.cgpa !== undefined ||
    opportunityAcademic?.eligibleBranches?.length ||
    opportunityAcademic?.eligibleDepartments?.length ||
    opportunityAcademic?.minCgpa !== undefined
  );

  const compositeScore = hasAcademicContext
    ? Math.round(skillMatchPct * 0.7 + branchMatchPct * 0.2 + eligibilityMatchPct * 0.1)
    : Math.round(skillMatchPct);

  const topGaps = [...breakdown]
    .filter((b) => b.gap > 0)
    .sort((a, b) => b.gap * b.weight - a.gap * a.weight);

  const topStrengths = [...breakdown]
    .filter((b) => b.isSatisfied)
    .sort((a, b) => b.studentScore - a.studentScore);

  return {
    scorePct: compositeScore,
    skillMatchPct,
    branchMatchPct,
    eligibilityMatchPct,
    isEligible,
    matchedSkillsCount,
    totalRequiredSkills: requirements.length,
    breakdown,
    topGaps,
    topStrengths,
    missingMandatorySkills,
  };
}

/**
 * Ranks opportunities for a student by composite score descending.
 */
export function rankOpportunitiesForStudent<
  T extends {
    requiredSkills: OpportunitySkillRequirement[];
    eligibleBranches?: string[];
    eligibleDepartments?: string[];
    minCgpa?: number;
    eligibleGradYears?: number[];
  }
>(
  studentSkills: CandidateSkill[],
  opportunitiesOrAcademic: CandidateAcademicProfile | T[],
  maybeOpportunities?: T[]
): (T & { matchResult: MatchScoreResult })[] {
  let academic: CandidateAcademicProfile | undefined;
  let opportunities: T[];

  if (Array.isArray(opportunitiesOrAcademic)) {
    opportunities = opportunitiesOrAcademic;
    academic = undefined;
  } else {
    academic = opportunitiesOrAcademic;
    opportunities = maybeOpportunities || [];
  }

  return opportunities
    .map((opp) => ({
      ...opp,
      matchResult: calculateMatchScore(
        studentSkills,
        opp.requiredSkills,
        academic,
        {
          eligibleBranches: opp.eligibleBranches,
          eligibleDepartments: opp.eligibleDepartments,
          minCgpa: opp.minCgpa,
          eligibleGradYears: opp.eligibleGradYears,
        }
      ),
    }))
    .sort((a, b) => b.matchResult.scorePct - a.matchResult.scorePct);
}

/**
 * Ranks candidates for a given opportunity requisition by composite score descending.
 */
export function rankCandidatesForOpportunity<
  T extends {
    skills: CandidateSkill[];
    departmentName?: string;
    branchName?: string;
    cgpa?: number;
  }
>(
  requirements: OpportunitySkillRequirement[],
  candidates: T[],
  opportunityAcademic?: OpportunityAcademicCriteria
): (T & { matchResult: MatchScoreResult })[] {
  return candidates
    .map((cand) => ({
      ...cand,
      matchResult: calculateMatchScore(
        cand.skills,
        requirements,
        {
          departmentName: cand.departmentName,
          branchName: cand.branchName,
          cgpa: cand.cgpa,
        },
        opportunityAcademic
      ),
    }))
    .sort((a, b) => b.matchResult.scorePct - a.matchResult.scorePct);
}
