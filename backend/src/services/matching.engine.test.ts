import {
  calculateMatchScore,
  rankOpportunitiesForStudent,
  rankCandidatesForOpportunity,
  CandidateSkill,
  OpportunitySkillRequirement,
} from './matching.engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('\n--- RUNNING MATCHING ENGINE UNIT TESTS ---');

// Test Case 1: Perfect Match (All skills meet or exceed required levels)
{
  const studentSkills: CandidateSkill[] = [
    { skillId: 'ayurveda_diag', score: 90 },
    { skillId: 'ehr_software', score: 80 },
    { skillId: 'patient_comm', score: 85 },
  ];

  const requirements: OpportunitySkillRequirement[] = [
    { skillId: 'ayurveda_diag', level: 80, weight: 3 },
    { skillId: 'ehr_software', level: 70, weight: 2 },
    { skillId: 'patient_comm', level: 80, weight: 1 },
  ];

  const result = calculateMatchScore(studentSkills, requirements);
  assert(result.scorePct === 100, `Perfect match should equal 100%, got ${result.scorePct}%`);
  assert(result.matchedSkillsCount === 3, 'All 3 required skills should be marked satisfied');
  assert(result.topGaps.length === 0, 'No gaps should exist for perfect match');
}

// Test Case 2: Zero Match (Candidate has 0 score in all required skills)
{
  const studentSkills: CandidateSkill[] = [
    { skillId: 'unrelated_skill', score: 100 },
  ];

  const requirements: OpportunitySkillRequirement[] = [
    { skillId: 'panchakarma', level: 80, weight: 3 },
    { skillId: 'herbal_pharm', level: 75, weight: 2 },
  ];

  const result = calculateMatchScore(studentSkills, requirements);
  assert(result.scorePct === 0, `Zero match should equal 0%, got ${result.scorePct}%`);
  assert(result.matchedSkillsCount === 0, 'Zero skills satisfied');
  assert(result.topGaps.length === 2, 'Should identify both skills as gaps');
}

// Test Case 3: Partial Match with Weighted Overlap
{
  // Requirement:
  // Skill A: req 80, weight 3 => max = 240
  // Skill B: req 60, weight 1 => max = 60
  // Total possible = 300
  //
  // Student:
  // Skill A: score 40 => effective 40 * 3 = 120
  // Skill B: score 60 => effective 60 * 1 = 60
  // Achieved = 180 / 300 = 60.0%
  const studentSkills: CandidateSkill[] = [
    { skillId: 'skill_a', score: 40 },
    { skillId: 'skill_b', score: 60 },
  ];

  const requirements: OpportunitySkillRequirement[] = [
    { skillId: 'skill_a', level: 80, weight: 3 },
    { skillId: 'skill_b', level: 60, weight: 1 },
  ];

  const result = calculateMatchScore(studentSkills, requirements);
  assert(result.scorePct === 60.0, `Partial match should equal 60%, got ${result.scorePct}%`);
  assert(result.matchedSkillsCount === 1, 'Only Skill B is fully satisfied');
  assert(result.topGaps.length === 1 && result.topGaps[0].skillId === 'skill_a', 'Skill A is top gap');
}

// Test Case 4: Diminishing returns (score higher than requirement does not inflate over 100%)
{
  const studentSkills: CandidateSkill[] = [
    { skillId: 'skill_a', score: 100 }, // Req is 50
  ];

  const requirements: OpportunitySkillRequirement[] = [
    { skillId: 'skill_a', level: 50, weight: 2 },
  ];

  const result = calculateMatchScore(studentSkills, requirements);
  assert(result.scorePct === 100.0, `Score exceeding required should cap at 100%, got ${result.scorePct}%`);
}

// Test Case 5: Opportunity Ranking for Student
{
  const studentSkills: CandidateSkill[] = [
    { skillId: 'data_analysis', score: 85 },
    { skillId: 'ehr_software', score: 70 },
  ];

  const opp1 = {
    id: 'opp_high',
    title: 'Data Analyst Intern',
    requiredSkills: [{ skillId: 'data_analysis', level: 80, weight: 3 }],
  };

  const opp2 = {
    id: 'opp_low',
    title: 'Panchakarma Intern',
    requiredSkills: [{ skillId: 'panchakarma', level: 90, weight: 4 }],
  };

  const ranked = rankOpportunitiesForStudent(studentSkills, [opp2, opp1]);
  assert(ranked[0].id === 'opp_high', 'Opp1 should be ranked 1st due to higher match score');
  assert(ranked[0].matchResult.scorePct > ranked[1].matchResult.scorePct, 'Rank 1 score > Rank 2 score');
}

// Test Case 6: Candidate Ranking for Recruiter
{
  const reqs: OpportunitySkillRequirement[] = [
    { skillId: 'herbal_pharm', level: 75, weight: 2 },
  ];

  const candidateA = { id: 'cand_a', name: 'Ayush Sharma', skills: [{ skillId: 'herbal_pharm', score: 30 }] };
  const candidateB = { id: 'cand_b', name: 'Dr. Priya Varma', skills: [{ skillId: 'herbal_pharm', score: 90 }] };

  const rankedCandidates = rankCandidatesForOpportunity(reqs, [candidateA, candidateB]);
  assert(rankedCandidates[0].id === 'cand_b', 'Candidate B with higher score should rank 1st');
}

console.log('\n✨ ALL 6 MATCHING ENGINE TESTS PASSED SUCCESSFULLY!\n');
