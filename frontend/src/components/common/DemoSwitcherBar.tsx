import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, GraduationCap, Building2, Briefcase, Wrench, Award } from 'lucide-react';
import { ROLES } from '@ayush-portal/shared';

export const DemoSwitcherBar: React.FC = () => {
  const { user, loginWithDemoAccount } = useAuth();
  const navigate = useNavigate();

  const demoPresets = [
    {
      role: ROLES.STUDENT,
      email: 'student@demo.com',
      label: 'Student (CSE)',
      sub: 'Roshan • Sem 6 • Java/DSA',
      icon: GraduationCap,
      path: '/student/dashboard',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      activeColor: 'ring-2 ring-blue-500 bg-blue-700 text-white',
    },
    {
      role: ROLES.STUDENT,
      email: 'student.mech@demo.com',
      label: 'Student (Mech)',
      sub: 'Aman • Sem 6 • CAD/SolidWorks',
      icon: Wrench,
      path: '/student/dashboard',
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      activeColor: 'ring-2 ring-amber-500 bg-amber-700 text-white',
    },
    {
      role: ROLES.ACADEMICIAN,
      email: 'academician@demo.com',
      label: 'Faculty',
      sub: 'Dr. Joshi • HOD CSE',
      icon: Building2,
      path: '/academician/dashboard',
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      activeColor: 'ring-2 ring-indigo-500 bg-indigo-700 text-white',
    },
    {
      role: ROLES.INDUSTRY,
      email: 'industry@demo.com',
      label: 'Industry',
      sub: 'TCS Digital Labs Recruiter',
      icon: Briefcase,
      path: '/industry/dashboard',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      activeColor: 'ring-2 ring-emerald-500 bg-emerald-700 text-white',
    },
    {
      role: ROLES.INSTITUTION_ADMIN,
      email: 'admin@demo.com',
      label: 'Placement Cell',
      sub: 'MITAOE Dean & T&P Officer',
      icon: UserCheck,
      path: '/admin/dashboard',
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      activeColor: 'ring-2 ring-purple-500 bg-purple-700 text-white',
    },
    {
      role: ROLES.ALUMNI,
      email: 'alumni@demo.com',
      label: 'Alumni',
      sub: 'Rahul Patil • Microsoft SDE',
      icon: Award,
      path: '/alumni/dashboard',
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      activeColor: 'ring-2 ring-rose-500 bg-rose-700 text-white',
    },
  ];

  const handlePresetClick = async (preset: typeof demoPresets[0]) => {
    try {
      await loginWithDemoAccount(preset.email);
      navigate(preset.path);
    } catch (err) {
      console.error('Demo switcher error:', err);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 shadow-sm select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide uppercase text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SIH PS 26044 Prototype Demo
          </span>
          <span className="text-slate-400 hidden sm:inline">• 1-Click Role Switcher:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {demoPresets.map((preset) => {
            const Icon = preset.icon;
            const isActive = user?.email === preset.email;
            return (
              <button
                key={preset.email}
                onClick={() => handlePresetClick(preset)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  isActive ? preset.activeColor : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={`Switch to ${preset.sub}`}
              >
                <Icon className="w-3 h-3" />
                <span>{preset.label}</span>
                {isActive && <span className="text-[9px] bg-white/20 px-1 rounded">Active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
