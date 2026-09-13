import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  Briefcase,
  Target,
  FileCheck2,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Wrench,
  Compass,
  CheckCircle2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { ROLES } from '@ayush-portal/shared';

export const LandingPage: React.FC = () => {
  const { user, loginWithDemoAccount } = useAuth();

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Smart India Hackathon • Problem Statement ID 26044
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Connect Skills with Industry Opportunities
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Assess skills, identify department-wise gaps, build placement readiness, and connect engineering students with verified internships and job opportunities.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => loginWithDemoAccount('student@demo.com')}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Student Flow</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => loginWithDemoAccount('industry@demo.com')}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-slate-600" />
              <span>For Industry Recruiters</span>
            </button>

            <button
              onClick={() => loginWithDemoAccount('admin@demo.com')}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>For Placement Cells</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-slate-100 mt-10">
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-blue-700">6 Branches</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">CSE, AI/DS, Mech, ENTC, Civil, EE</div>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-slate-900">28+ Skills</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Standardized Engineering Taxonomy</div>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-emerald-700">87% Match</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Deterministic Overlap Algorithm</div>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-purple-700">Live Signals</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Curriculum Gap Radar for Colleges</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Complete Engineering Student Lifecycle */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The Complete Student Career Lifecycle
          </h2>
          <p className="text-sm text-slate-500">
            A structured progression from self-assessment to skill improvement, matching, and verified placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900">Assess Skills</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Take standardized technical, aptitude, and core branch assessments to establish verified proficiency benchmarks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900">Identify Gaps & Learn</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare your current score against target career requirements and follow practical roadmap projects.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900">Match & Apply</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover opportunities with explainable compatibility scores (Skill Match, Branch Eligibility, CGPA).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-base text-slate-900">Digital Portfolio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Build a verifiable digital credentials portfolio with official institution verification seals.
            </p>
          </div>
        </div>
      </section>

      {/* Multi-Branch Academic Matrix */}
      <section className="bg-white py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Supported Engineering Departments & Branches
            </h2>
            <p className="text-sm text-slate-500">
              Not just Computer Science. Tailored career mapping and skill assessments for all core disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">Computer Science & IT</h3>
              </div>
              <p className="text-xs text-slate-500">Java, DSA, Spring Boot, React, SQL, Cloud & DevOps</p>
              <div className="text-[11px] font-semibold text-blue-700">Roles: Java Backend, Full Stack, Cloud Engineer</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">AI & Data Science</h3>
              </div>
              <p className="text-xs text-slate-500">Python, Machine Learning, Deep Learning, Power BI, Statistics</p>
              <div className="text-[11px] font-semibold text-emerald-700">Roles: Data Scientist, ML Engineer, Analytics</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-slate-900">Mechanical & Robotics</h3>
              </div>
              <p className="text-xs text-slate-500">CAD Modeling, SolidWorks, AutoCAD 3D, CNC Tooling, ROS2</p>
              <div className="text-[11px] font-semibold text-amber-700">Roles: CAD Design Engineer, Robotics Engineer</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-sm text-slate-900">Electronics & Telecomm (ENTC)</h3>
              </div>
              <p className="text-xs text-slate-500">Embedded C, ARM Microcontrollers, VLSI / Verilog, MATLAB</p>
              <div className="text-[11px] font-semibold text-indigo-700">Roles: Embedded Firmware, VLSI Design Engineer</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900">Civil Engineering</h3>
              </div>
              <p className="text-xs text-slate-500">Structural Analysis, STAAD.Pro, BIM Revit, Quantity Surveying</p>
              <div className="text-[11px] font-semibold text-teal-700">Roles: Structural Engineer, BIM Coordinator</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">Electrical Engineering</h3>
              </div>
              <p className="text-xs text-slate-500">Power Systems, PLC & SCADA, Motor Drives, EV Battery Systems</p>
              <div className="text-[11px] font-semibold text-purple-700">Roles: Automation Engineer, Power Systems</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for the Entire University Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">For Engineering Students</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Placement readiness score and target career roadmaps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Identifies exact missing skills needed for target jobs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>One-click apply to branch-eligible internships</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">For Industry Recruiters</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Post opportunities with branch and skill requirements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Rank candidates automatically by explainable match %</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Manage hiring pipeline stages from Applied to Selected</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">For Institutions & T&P Cells</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Department and branch-wise placement readiness metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Curriculum Gap Radar comparing industry demand vs syllabus</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Complete student scholar and faculty directory</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
