import React from 'react';
import { GraduationCap, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1e1b4b] to-[#0f0d2e] text-slate-300 border-t border-indigo-500/20 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-brand">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span>Setu Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal for Academia - Industry Collaboration for Skill Mapping, Internships, and Placement.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart India Hackathon 2026 (PS 26044)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Key Stakeholders</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-indigo-300 font-medium">Students:</span> Skill Radar, Smart Match, Digital Portfolio</li>
              <li><span className="text-sky-400 font-medium">Faculty:</span> FDPs, Joint Grants, Mentorship</li>
              <li><span className="text-amber-400 font-medium">Industry:</span> Branch Tagging, Ranked Talent Pipeline</li>
              <li><span className="text-emerald-400 font-medium">Placement Cell:</span> Curriculum Gap Radar & Roster</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Deterministic Weighted Overlap Matching Engine</li>
              <li>Multi-Branch Standardized Skill Assessments</li>
              <li>Curriculum Gap Signal for National Syllabus Reform</li>
              <li>Verifiable Digital Student Portfolio</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Partner Institutions</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Audisankara University</li>
              <li>Autonomous Engineering Colleges Network</li>
              <li>TCS Digital Labs University Relations</li>
              <li>Bosch Mobility Solutions & L&T</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Smart India Hackathon Submission (Problem Statement ID 26044).</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <span>AICTE / University Collaboration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
