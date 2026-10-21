import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Link, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "./component/Header";
import Footer from "./component/Footer";
import ProfileCard from "./component/ProfileCard";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, RequireAdmin } from "./lib/auth";
import { ProfileProvider } from "./lib/profile";

// Route-level code splitting: the home page loads first, everything else on demand.
const ExperienceSection = lazy(() => import("./pages/ExperienceSection"));
const SkillsTree = lazy(() => import("./pages/SkillsTree"));
const CertificatesSection = lazy(() => import("./pages/CertificatesSection"));
const ProjectsSection = lazy(() => import("./pages/ProjectsSection"));
const HierarchicalLearningTags = lazy(() => import("./pages/LearningPage"));
const BlogsPage = lazy(() => import("./pages/blog-page"));
const ProjectDetailPage = lazy(() => import("./component/ProjectDetailsPage"));
const LearningContentPage = lazy(() => import("./component/LearningContentPage"));
const LoginPage = lazy(() => import("./services/LoginPage"));
const AdminLayout = lazy(() => import("./services/AdminLayout"));
const ProjectManagementPage = lazy(() => import("./services/ProjectManagementPage"));
const CertificateManagementPage = lazy(() => import("./services/CertificateManagementPage"));
const DirectoryManagementPage = lazy(() => import("./services/DirectoryManagementPage"));
const ProfileManagementPage = lazy(() => import("./services/ProfileManagementPage"));
const SimpleCollectionPages = lazy(() => import("./services/SimpleCollectionPages"));
const MessagesPage = lazy(() => import("./services/MessagesPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 font-mono">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-gray-600">This page doesn't exist.</p>
    <Link to="/" className="text-blue-600 hover:underline">
      Go home
    </Link>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <div className="App flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<ProfileCard />} />
                  <Route path="/experience" element={<ExperienceSection />} />
                  <Route path="/projects" element={<ProjectsSection />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/resume" element={<SkillsTree />} />
                  <Route path="/certificates" element={<CertificatesSection />} />
                  <Route path="/learnings" element={<HierarchicalLearningTags />} />
                  <Route path="/learning/:id" element={<LearningContentPage />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  <Route
                    path="/admin"
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<Navigate to="profile" replace />} />
                    <Route path="profile" element={<ProfileManagementPage />} />
                    <Route path="projects" element={<ProjectManagementPage />} />
                    <Route path="certificates" element={<CertificateManagementPage />} />
                    <Route path="learnings" element={<DirectoryManagementPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path=":collection" element={<SimpleCollectionPages />} />
                  </Route>

                  {/* Old admin URLs */}
                  <Route path="/project-management" element={<Navigate to="/admin/projects" replace />} />
                  <Route path="/certificate-management" element={<Navigate to="/admin/certificates" replace />} />
                  <Route path="/directory-management" element={<Navigate to="/admin/learnings" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </div>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}
