import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Globe, Award, BookOpen, Users, ArrowRight } from "lucide-react";
import type { Achievement, Certificate, Contribution, DirectoryItem, Project, SkillCategory as Skill } from "@shared/schemas";
import { seedAchievements } from "@shared/seed-data";
import { useApi } from "@/lib/api";
import { useProfile } from "@/lib/profile";
import { useSkills } from "@/lib/useSkills";
import { SkillIconView, socialIconMap } from "@/lib/icons";
import AboutSection from "./AboutSection";
import ContactMeModal from "./ContactMeModal";

/** Featured items first; if nothing is marked featured yet, show the first few so the section isn't empty. */
function useFeatured<T extends { featured?: boolean }>(path: string, limit: number) {
  const { data, loading } = useApi<T[]>(path, []);
  const featured = data.filter((d) => d.featured);
  return { items: (featured.length ? featured : data).slice(0, limit), loading };
}

const cardClass =
  "w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 h-full";

const SkillCategory: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="rounded-lg p-6 flex flex-col items-center transform transition-all hover:scale-105"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div
        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white mb-4"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <SkillIconView icon={skill.icon} className="w-6 h-6" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-4 text-center">{skill.name}</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {skill.skills.map((item, index) => (
          <motion.span
            key={item}
            className="bg-gradient-to-r from-teal-100 to-blue-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

const PointList: React.FC<{ points: string[] }> = ({ points }) =>
  points.length ? (
    <ul className="list-disc list-inside mb-4">
      {points.map((point) => (
        <li key={point} className="text-sm text-gray-600">
          {point}
        </li>
      ))}
    </ul>
  ) : null;

const ExternalButton: React.FC<{ href: string; children: React.ReactNode; tone?: "teal" | "blue" }> = ({ href, children, tone = "teal" }) => (
  <Button
    variant="outline"
    asChild
    className={tone === "teal" ? "text-teal-600 hover:bg-teal-50 border-teal-200" : "text-blue-600 hover:bg-blue-50 border-blue-200"}
  >
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  </Button>
);

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const points = project.keyPoints.length ? project.keyPoints : project.tags.slice(0, 3);
  return (
    <Card className={cardClass}>
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{project.title}</h3>
        <div className="flex-grow">
          <PointList points={points} />
        </div>
        <div className="flex flex-wrap gap-2 justify-between">
          <Button variant="outline" asChild className="text-teal-600 hover:bg-teal-50 border-teal-200">
            <Link to={`/projects/${project.id}`}>Details</Link>
          </Button>
          {project.liveUrl && (
            <ExternalButton href={project.liveUrl} tone="blue">
              Live Demo
            </ExternalButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CertificateCard: React.FC<{ certificate: Certificate; onClick: () => void }> = ({ certificate, onClick }) => (
  <Card className={`${cardClass} cursor-pointer`} onClick={onClick}>
    <CardContent className="p-6">
      {certificate.image ? (
        <img src={certificate.image} alt={certificate.title} loading="lazy" className="w-full h-40 object-cover mb-4 rounded" />
      ) : (
        <div className="w-full h-40 mb-4 rounded bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
          <Award className="w-12 h-12 text-teal-500" />
        </div>
      )}
      <h3 className="text-xl font-bold mb-2 text-gray-800">{certificate.title}</h3>
      {certificate.instituteName && <p className="text-sm text-gray-500 mb-3">{certificate.instituteName}</p>}
      {certificate.credentialUrl && (
        <Button
          variant="outline"
          asChild
          className="w-full text-teal-600 hover:bg-teal-50 border-teal-200"
          onClick={(e) => e.stopPropagation()}
        >
          <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer">
            Verify Certificate
          </a>
        </Button>
      )}
    </CardContent>
  </Card>
);

const LearningCard: React.FC<{ item: DirectoryItem }> = ({ item }) => (
  <Card className={cardClass}>
    <CardContent className="p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{item.learningItem?.title || item.name}</h3>
      <div className="flex-grow">
        <PointList points={(item.learningItem?.keywords || []).slice(0, 4)} />
      </div>
      <Button variant="outline" asChild className="w-full text-blue-600 hover:bg-blue-50 border-blue-200">
        <Link to={`/learning/${item.id}`}>Read More</Link>
      </Button>
    </CardContent>
  </Card>
);

const ContributionCard: React.FC<{ contribution: Contribution }> = ({ contribution }) => (
  <Card className={cardClass}>
    <CardContent className="p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{contribution.title}</h3>
      <div className="flex-grow">
        <PointList points={contribution.keyPoints} />
      </div>
      {contribution.link && <ExternalButton href={contribution.link}>View Project</ExternalButton>}
    </CardContent>
  </Card>
);

const FeaturedAchievements: React.FC<{ achievements: Achievement[]; onOpen: (link: string) => void }> = ({ achievements, onOpen }) => {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggleAchievement = (achievement: Achievement) => {
    setCompleted((prev) => ({ ...prev, [achievement.id]: !prev[achievement.id] }));
    if (achievement.link) onOpen(achievement.link);
  };

  return (
    <div className="flex justify-center w-full p-1 mt-10 font-mono">
      <div className="w-full max-w-6xl flex flex-wrap gap-3 justify-center">
        {achievements.map((achievement, index) => {
          const done = completed[achievement.id];
          return (
            <motion.button
              type="button"
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center text-left p-3 border-2 rounded-lg ${
                done ? "bg-teal-100 border-teal-300" : "bg-white border-gray-200"
              }`}
              onClick={() => toggleAchievement(achievement)}
              whileHover={{ scale: 1.05, boxShadow: "0px 3px 10px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="mr-3 text-2xl"
                animate={{ rotate: done ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                aria-hidden
              >
                {achievement.icon}
              </motion.span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={done ? "done" : "todo"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={done ? "line-through text-gray-500" : "text-gray-800"}
                >
                  {achievement.text}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  icon,
  children,
  action,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      className="w-full max-w-6xl my-12 sm:my-16"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2 text-gray-800">
        {icon}
        <span>{title}</span>
      </h2>
      {children}
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </motion.section>
  );
};

const SeeAll: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link to={to} className="inline-flex items-center text-blue-600 font-semibold hover:underline group">
    {label}
    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
  </Link>
);

const ShimmerGrid: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
    ))}
  </>
);

export default function EnhancedPortfolio() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [achievementLink, setAchievementLink] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { skills: featuredSkills } = useSkills(true);
  const achievementsApi = useApi<Achievement[]>("/achievements", []);
  const achievements = achievementsApi.error ? seedAchievements.map((a, i) => ({ ...a, id: `seed-${i}` })) : achievementsApi.data;
  const projects = useFeatured<Project>("/projects", 4);
  const certificates = useFeatured<Certificate>("/certificates", 3);
  const contributions = useApi<Contribution[]>("/contributions", []);
  const directories = useApi<DirectoryItem[]>("/directories", []);
  const learningFiles = directories.data.filter((d) => d.type === "file" && d.learningItem);
  const learnings = (learningFiles.some((d) => d.featured) ? learningFiles.filter((d) => d.featured) : learningFiles).slice(0, 3);

  const fullText = profile.headline;
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  const openAchievement = (link: string) => {
    // Internal pages navigate normally; external pages open in a new tab since
    // most sites refuse to be framed.
    if (link.startsWith("/")) navigate(link);
    else setAchievementLink(link);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-12 sm:pt-20 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-6xl">
        <Card className="w-full bg-white border-2 border-gray-200 rounded-3xl shadow-lg font-mono overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex flex-col items-center md:items-start">
                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Avatar className="w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden">
                    <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                    <AvatarFallback>{profile.initials}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.h1
                  className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800 text-center md:text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {profile.name}
                </motion.h1>
                <div className="flex space-x-4 mt-2">
                  {profile.socials.map(({ platform, url }, index) => {
                    const { Icon, label } = socialIconMap[platform];
                    return (
                      <motion.a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Icon className="w-6 h-6 text-gray-600 hover:text-teal-600 transition-colors" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
              <div className="flex-grow w-full">
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-6 min-h-[1.75rem] text-center md:text-left" aria-label={fullText}>
                  {typedText}
                </p>
                <ul className="space-y-2 text-base sm:text-lg pl-6 md:pl-10 list-disc">
                  {profile.focusAreas.map((area, index) => (
                    <motion.li
                      key={area}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-gray-700"
                    >
                      {area}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsContactModalOpen(true)}
                    className="w-full bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 font-bold py-2 px-4 rounded-lg relative overflow-hidden group"
                  >
                    <span className="relative z-10">Hire Me : Contact</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Button>
                </motion.div>
                {profile.resumeUrl && (
                  <Button variant="outline" asChild>
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                      Download Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
            {profile.keySkills && (
              <motion.div
                className="mt-8 text-center text-base sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <strong className="text-gray-800">Key Skills:</strong> <span className="text-gray-600">{profile.keySkills}</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {achievements.length > 0 && (
        <Section title="Featured Achievements" icon={<Award className="w-8 h-8 text-teal-500" />}>
          <FeaturedAchievements achievements={achievements} onOpen={openAchievement} />
        </Section>
      )}

      {featuredSkills.length > 0 && (
        <Section
          title="Top Skills"
          icon={<Globe className="w-8 h-8 text-blue-500" />}
          action={<SeeAll to="/resume" label="All skills" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSkills.map((skill, index) => (
              <SkillCategory key={skill.id} skill={skill} index={index} />
            ))}
          </div>
        </Section>
      )}

      {(projects.loading || projects.items.length > 0) && (
        <Section title="Projects" icon={<Code className="w-8 h-8 text-teal-500" />} action={<SeeAll to="/projects" label="All projects" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {projects.loading ? <ShimmerGrid count={4} /> : projects.items.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </Section>
      )}

      {(certificates.loading || certificates.items.length > 0) && (
        <Section
          title="Certificates"
          icon={<Award className="w-8 h-8 text-blue-500" />}
          action={<SeeAll to="/certificates" label="All certificates" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.loading ? (
              <ShimmerGrid count={3} />
            ) : (
              certificates.items.map((c) => <CertificateCard key={c.id} certificate={c} onClick={() => setSelectedCertificate(c)} />)
            )}
          </div>
        </Section>
      )}

      {learnings.length > 0 && (
        <Section title="Top Learnings" icon={<BookOpen className="w-8 h-8 text-teal-500" />} action={<SeeAll to="/learnings" label="All learnings" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learnings.map((l) => (
              <LearningCard key={l.id} item={l} />
            ))}
          </div>
        </Section>
      )}

      {contributions.data.length > 0 && (
        <Section title="Top Contributions" icon={<Users className="w-8 h-8 text-blue-500" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contributions.data.map((c) => (
              <ContributionCard key={c.id} contribution={c} />
            ))}
          </div>
        </Section>
      )}

      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={selectedCertificate.title}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">{selectedCertificate.title}</h3>
              {selectedCertificate.image && <img src={selectedCertificate.image} alt={selectedCertificate.title} className="w-full h-auto" />}
              {selectedCertificate.description && <p className="mt-4 text-gray-600">{selectedCertificate.description}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {achievementLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setAchievementLink(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-4 w-full max-w-4xl h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <ExternalButton href={achievementLink}>Open in new tab</ExternalButton>
              </div>
              <iframe
                src={achievementLink}
                title="Achievement Details"
                className="w-full flex-grow border-none"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AboutSection contact={() => setIsContactModalOpen(true)} />
      <ContactMeModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
}
