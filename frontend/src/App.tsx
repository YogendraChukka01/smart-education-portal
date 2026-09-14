import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ROLES } from '@ayush-portal/shared';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';
import { MessagesPage } from './pages/common/MessagesPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { SkillAssessmentPage } from './pages/student/SkillAssessmentPage';
import { CodingAssessmentPage } from './pages/student/CodingAssessmentPage';
import { CareerRoleGapPage } from './pages/student/CareerRoleGapPage';
import { OpportunitiesPage } from './pages/student/OpportunitiesPage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { StudentProjectsPage } from './pages/student/StudentProjectsPage';
import { StudentEventsPage } from './pages/student/StudentEventsPage';
import { AlumniDirectoryPage } from './pages/student/AlumniDirectoryPage';
import { PortfolioPage } from './pages/student/PortfolioPage';

// Academician Pages
import { AcademicianDashboard } from './pages/academician/AcademicianDashboard';
import { AcademicianOpportunitiesPage } from './pages/academician/AcademicianOpportunitiesPage';
import { MentorshipManagementPage } from './pages/academician/MentorshipManagementPage';
import { FacultyProfilePage } from './pages/academician/FacultyProfilePage';

// Industry Pages
import { IndustryDashboard } from './pages/industry/IndustryDashboard';
import { PostOpportunityPage } from './pages/industry/PostOpportunityPage';
import { ApplicantReviewPage } from './pages/industry/ApplicantReviewPage';
import { CompanyProfilePage } from './pages/industry/CompanyProfilePage';

// Admin Pages
import { InstitutionDashboard } from './pages/admin/InstitutionDashboard';
import { PlacementStatsPage } from './pages/admin/PlacementStatsPage';
import { CurriculumGapRadarPage } from './pages/admin/CurriculumGapRadarPage';
import { RosterPage } from './pages/admin/RosterPage';
import { InstitutionSettingsPage } from './pages/admin/InstitutionSettingsPage';
import { IndustryIntelligencePage } from './pages/admin/IndustryIntelligencePage';

// Alumni Pages
import { AlumniDashboard } from './pages/alumni/AlumniDashboard';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
          <Navbar />
          <main className="flex-1 page-main">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/portfolio/:slug" element={<PublicPortfolioPage />} />
              <Route path="/messages" element={<MessagesPage />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfilePage />} />
                <Route path="/student/assessment" element={<SkillAssessmentPage />} />
                <Route path="/student/coding" element={<CodingAssessmentPage />} />
                <Route path="/student/career-gaps" element={<CareerRoleGapPage />} />
                <Route path="/student/opportunities" element={<OpportunitiesPage />} />
                <Route path="/student/applications" element={<MyApplicationsPage />} />
                <Route path="/student/projects" element={<StudentProjectsPage />} />
                <Route path="/student/portfolio" element={<PortfolioPage />} />
                <Route path="/student/events" element={<StudentEventsPage />} />
                <Route path="/student/alumni" element={<AlumniDirectoryPage />} />
              </Route>

              {/* Academician Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ACADEMICIAN]} />}>
                <Route path="/academician/dashboard" element={<AcademicianDashboard />} />
                <Route path="/academician/opportunities" element={<AcademicianOpportunitiesPage />} />
                <Route path="/academician/mentorship" element={<MentorshipManagementPage />} />
                <Route path="/academician/profile" element={<FacultyProfilePage />} />
              </Route>

              {/* Industry Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.INDUSTRY]} />}>
                <Route path="/industry/dashboard" element={<IndustryDashboard />} />
                <Route path="/industry/post" element={<PostOpportunityPage />} />
                <Route path="/industry/applicants" element={<ApplicantReviewPage />} />
                <Route path="/industry/company-profile" element={<CompanyProfilePage />} />
              </Route>

              {/* Institution Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTITUTION_ADMIN]} />}>
                <Route path="/admin/dashboard" element={<InstitutionDashboard />} />
                <Route path="/admin/placement-stats" element={<PlacementStatsPage />} />
                <Route path="/admin/curriculum-gap" element={<CurriculumGapRadarPage />} />
                <Route path="/admin/industry-intelligence" element={<IndustryIntelligencePage />} />
                <Route path="/admin/roster" element={<RosterPage />} />
                <Route path="/admin/settings" element={<InstitutionSettingsPage />} />
              </Route>

              {/* Alumni Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ALUMNI]} />}>
                <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
