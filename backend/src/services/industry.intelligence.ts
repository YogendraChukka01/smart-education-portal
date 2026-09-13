import { prisma } from '../lib/prisma';

type SkillDemand = {
  skillId: string;
  skillName: string;
  category: string;
  demandScore: number;
  opportunityCount: number;
  avgRequiredLevel: number;
  trend: 'rising' | 'stable' | 'emerging';
};

const safeJson = <T>(value: string | null | undefined, fallback: T): T => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

export async function buildIndustryIntelligence() {
  const [skills, opportunities, students] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: 'asc' } }),
    prisma.opportunity.findMany({
      where: { status: 'active' },
      select: { id: true, title: true, type: true, createdAt: true, requiredSkillsJson: true, eligibleDepartmentsJson: true },
    }),
    prisma.studentSkillScore.findMany({
      select: { skillId: true, score: true },
    }),
  ]);

  const skillMap = new Map(skills.map((s) => [s.id, s]));
  const demand = new Map<string, { count: number; weightedLevel: number; recent: number; older: number; roleTypes: Set<string> }>();
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  for (const opp of opportunities) {
    const reqs = safeJson<Array<{ skillId: string; level?: number; weight?: number }>>(opp.requiredSkillsJson, []);
    const age = now - opp.createdAt.getTime();
    for (const req of reqs) {
      if (!skillMap.has(req.skillId)) continue;
      const item = demand.get(req.skillId) || { count: 0, weightedLevel: 0, recent: 0, older: 0, roleTypes: new Set<string>() };
      const weight = Math.max(1, Number(req.weight || 1));
      item.count += weight;
      item.weightedLevel += Number(req.level || 50) * weight;
      item.roleTypes.add(opp.type);
      if (age <= thirtyDays) item.recent += weight;
      else if (age <= ninetyDays) item.older += weight;
      demand.set(req.skillId, item);
    }
  }

  const studentStats = new Map<string, { sum: number; count: number }>();
  for (const score of students) {
    const item = studentStats.get(score.skillId) || { sum: 0, count: 0 };
    item.sum += score.score;
    item.count += 1;
    studentStats.set(score.skillId, item);
  }

  const rows: SkillDemand[] = [...demand.entries()].map(([skillId, d]) => {
    const skill = skillMap.get(skillId)!;
    const avgRequiredLevel = d.count ? d.weightedLevel / d.count : 0;
    const momentum = d.older > 0 ? d.recent / d.older : d.recent > 0 ? 2 : 1;
    const trend: SkillDemand['trend'] = momentum >= 1.35 ? 'rising' : momentum <= 0.75 ? 'stable' : 'stable';
    const demandScore = Math.min(100, Math.round((d.count * 10 + avgRequiredLevel * 0.35 + skill.industryDemandWeight * 8) * 10) / 10);
    return { skillId, skillName: skill.name, category: skill.category, demandScore, opportunityCount: Math.round(d.count), avgRequiredLevel: Math.round(avgRequiredLevel), trend };
  }).sort((a, b) => b.demandScore - a.demandScore);

  const gaps = rows.map((row) => {
    const stat = studentStats.get(row.skillId);
    const studentAvg = stat ? stat.sum / stat.count : 0;
    return {
      ...row,
      studentAvg: Math.round(studentAvg),
      gap: Math.max(0, Math.round(row.avgRequiredLevel - studentAvg)),
      readiness: Math.min(100, Math.round((studentAvg / Math.max(row.avgRequiredLevel, 1)) * 100)),
    };
  }).sort((a, b) => b.gap - a.gap);

  const categories = new Map<string, { demand: number; gap: number; count: number }>();
  for (const row of gaps) {
    const item = categories.get(row.category) || { demand: 0, gap: 0, count: 0 };
    item.demand += row.demandScore;
    item.gap += row.gap;
    item.count += 1;
    categories.set(row.category, item);
  }

  return {
    generatedAt: new Date().toISOString(),
    methodology: {
      demand: 'Active opportunity skill requirements weighted by requirement weight, required proficiency and the seeded industry-demand prior.',
      gap: 'Industry-required proficiency minus observed student skill score average.',
      trend: '30-day requirement momentum compared with the previous 60 days; this is a prototype proxy, not a labour-market forecast.',
    },
    summary: {
      activeOpportunities: opportunities.length,
      skillsObserved: rows.length,
      risingSkills: rows.filter((r) => r.trend === 'rising').length,
      highRiskGaps: gaps.filter((g) => g.gap >= 25).length,
    },
    topDemand: rows.slice(0, 12),
    topGaps: gaps.slice(0, 12),
    categories: [...categories.entries()].map(([category, v]) => ({ category, demandScore: Math.round(v.demand / v.count), avgGap: Math.round(v.gap / v.count), skills: v.count })).sort((a, b) => b.demandScore - a.demandScore),
  };
}
