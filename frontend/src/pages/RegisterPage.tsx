import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, UserRole, ENGINEERING_DEPARTMENTS, ENGINEERING_BRANCHES } from '@ayush-portal/shared';
import {
  GraduationCap,
  BookOpen,
  Building2,
  Users,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>(ROLES.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Student specific fields
  const [degree, setDegree] = useState('B.Tech');
  const [departmentName, setDepartmentName] = useState('Computer Science & Engineering');
  const [branchName, setBranchName] = useState('Computer Science & Engineering');
  const [year, setYear] = useState(3);
  const [semester, setSemester] = useState(6);
  const [cgpa, setCgpa] = useState(8.2);
  const [graduationYear, setGraduationYear] = useState(2026);

  // Faculty specific fields
  const [facultyDepartment, setFacultyDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('Distributed Systems & Cloud Architecture');

  // Industry specific fields
  const [companyName, setCompanyName] = useState('');
  const [industryType, setIndustryType] = useState('Enterprise Software & Cloud Systems');

  // Institution / Placement Cell specific fields
  const [institutionName, setInstitutionName] = useState('Audisankara University');
  const [institutionType, setInstitutionType] = useState('Deemed-to-be University with an autonomous engineering college');

  // Alumni specific fields
  const [alumniCompany, setAlumniCompany] = useState('');
  const [alumniRole, setAlumniRole] = useState('Software Engineer');
  const [alumniGradYear, setAlumniGradYear] = useState(2023);
  const [alumniDepartment, setAlumniDepartment] = useState('Computer Science & Engineering');
  const [alumniBranch, setAlumniBranch] = useState('Computer Science & Engineering');
  const [experienceYears, setExperienceYears] = useState(2);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let payload: any = {
        email: email.trim(),
        password,
        role,
        name: name.trim(),
      };

      if (role === ROLES.STUDENT) {
        payload = {
          ...payload,
          degree,
          departmentName,
          branchName,
          year: Number(year),
          semester: Number(semester),
          cgpa: Number(cgpa),
          graduationYear: Number(graduationYear),
        };
      } else if (role === ROLES.ACADEMICIAN) {
        payload = {
          ...payload,
          department: facultyDepartment,
          designation,
          specialization,
          expertiseTags: [specialization, 'Engineering Pedagogy'],
        };
      } else if (role === ROLES.INDUSTRY) {
        payload = {
          ...payload,
          companyName: companyName.trim() || 'Tech Innovators Corp',
          industryType: industryType.trim() || 'Software & Cloud Solutions',
        };
      } else if (role === ROLES.INSTITUTION_ADMIN) {
        payload = {
          ...payload,
          institutionName: institutionName.trim() || 'Engineering Autonomous College',
          institutionType: institutionType.trim() || 'Autonomous Engineering College',
        };
      } else if (role === ROLES.ALUMNI) {
        payload = {
          ...payload,
          company: alumniCompany.trim() || 'Tech Global Systems',
          roleInCompany: alumniRole.trim() || 'Software Engineer',
          departmentName: alumniDepartment,
          branchName: alumniBranch,
          graduationYear: Number(alumniGradYear),
          experienceYears: Number(experienceYears),
        };
      }

      const user = await register(payload);
      if (user.role === ROLES.STUDENT) navigate('/student/assessment');
      else if (user.role === ROLES.ACADEMICIAN) navigate('/academician/dashboard');
      else if (user.role === ROLES.INDUSTRY) navigate('/industry/dashboard');
      else if (user.role === ROLES.ALUMNI) navigate('/alumni/dashboard');
      else if (user.role === ROLES.INSTITUTION_ADMIN) navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      console.error('Registration failed:', err);
      const backendError = err.response?.data?.error;
      const details = err.response?.data?.details;
      if (details && Array.isArray(details) && details.length > 0) {
        const detailMsgs = details.map((d: any) => `${d.field ? `${d.field}: ` : ''}${d.message}`).join('; ');
        setError(`${backendError || 'Validation error'}: ${detailMsgs}`);
      } else if (backendError) {
        setError(backendError);
      } else {
        setError(err.message || 'Registration failed. Please check form fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/70 via-violet-50/40 to-slate-50">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl btn-brand shadow-xs mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Create an <span className="brand-text">Account</span>
          </h2>
          <p className="text-xs text-slate-500">
            Join the Engineering Academia–Industry Collaboration & Placement Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl">
          {[
            { id: ROLES.STUDENT, label: 'Student', icon: GraduationCap },
            { id: ROLES.ACADEMICIAN, label: 'Faculty', icon: BookOpen },
            { id: ROLES.INDUSTRY, label: 'Industry', icon: Briefcase },
            { id: ROLES.INSTITUTION_ADMIN, label: 'Placement Cell', icon: Building2 },
            { id: ROLES.ALUMNI, label: 'Alumni', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = role === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRole(item.id as UserRole);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white text-indigo-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === ROLES.STUDENT && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentName}
                  onChange={(e) => {
                    const d = e.target.value;
                    const b = ENGINEERING_BRANCHES[d] || [d];
                    setDepartmentName(d);
                    setBranchName(b[0]);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  {ENGINEERING_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch / Specialization</label>
                <select
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  {(ENGINEERING_BRANCHES[departmentName] || [departmentName]).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  <option value={1}>1st Year (Junior)</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year (Pre-Final)</option>
                  <option value={4}>4th Year (Final Year)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CGPA (out of 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Faculty Specific Fields */}
          {role === ROLES.ACADEMICIAN && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={facultyDepartment}
                  onChange={(e) => setFacultyDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  {ENGINEERING_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="Professor & HOD">Professor & HOD</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Training & Placement Officer">Training & Placement Officer</option>
                  <option value="Dean / Director">Dean / Director</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Specialization / Research Area</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Distributed Systems, Robotics & AI, Structural Dynamics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Industry Specific Fields */}
          {role === ROLES.INDUSTRY && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value)}
                  placeholder="e.g. Enterprise Software & Cloud"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Institution Admin Specific Fields */}
          {role === ROLES.INSTITUTION_ADMIN && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution / College Name</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Audisankara University"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Type</label>
                <input
                  type="text"
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  placeholder="e.g. Autonomous Engineering College"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Alumni Specific Fields */}
          {role === ROLES.ALUMNI && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Company</label>
                <input
                  type="text"
                  required
                  value={alumniCompany}
                  onChange={(e) => setAlumniCompany(e.target.value)}
                  placeholder="e.g. Microsoft India, Google, TCS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Role / Title</label>
                <input
                  type="text"
                  required
                  value={alumniRole}
                  onChange={(e) => setAlumniRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduated Department</label>
                <select
                  value={alumniDepartment}
                  onChange={(e) => {
                    const d = e.target.value;
                    const b = ENGINEERING_BRANCHES[d] || [d];
                    setAlumniDepartment(d);
                    setAlumniBranch(b[0]);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                >
                  {ENGINEERING_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  min="1990"
                  max="2025"
                  value={alumniGradYear}
                  onChange={(e) => setAlumniGradYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 btn-brand text-white font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-1">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-700 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
