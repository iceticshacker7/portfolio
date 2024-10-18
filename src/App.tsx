import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExperienceSection from './pages/ExperienceSection';
import Header from './component/Header';
import ProfileCard from './component/ProfileCard';
import SkillsTree from './pages/SkillsTree';
import Footer from './component/Footer';
import CertificatesSection from './pages/CertificatesSection';
import ProjectsSection from './pages/ProjectsSection';
import HierarchicalLearningTags from './pages/LearningPage';
import LoginPage from './services/LoginPage';
import ProjectDetailPage from './component/ProjectDetailsPage';
import ProjectManagementPage from './services/ProjectManagementPage';
import CertificateManagementPage from './services/CertificateManagementPage';
import DirectoryManagementPage from './services/DirectoryManagementPage';
import LearningContentPage from './component/LearningContentPage';
export default function App() {
  return (
    
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<ProfileCard />} />
          <Route path="/experience" element={<ExperienceSection />} />
          <Route path="/projects" element={<ProjectsSection />} />
          <Route path="/resume" element={<SkillsTree/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/certificates" element={<CertificatesSection />} /> 
          <Route path="/learnings" element={<HierarchicalLearningTags />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/project-management" element={<ProjectManagementPage />} />
          <Route path="/certificate-management" element={<CertificateManagementPage />} />
        <Route path="/learning/:id" element={<LearningContentPage />} />

          <Route path="/directory-management" element={<DirectoryManagementPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
