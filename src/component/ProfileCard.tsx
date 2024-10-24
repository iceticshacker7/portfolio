"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaGithub,
  FaKaggle,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import {
  Code,
  Library,
  Globe,
  Award,
  BookOpen,
  Users,
  Bot,
} from "lucide-react";
import myImage from "@/assets/myimage.jpeg";
import AboutSection from "./AboutSection";
import ContactMeModal from "./ContactMeModal";

const socialIcons = [
  { Icon: FaGithub, href: "https://github.com/iceticshacker7" },
  { Icon: FaLinkedin, href: "https://www.linkedin.com/in/divyanshrai7" },
  { Icon: FaKaggle, href: "https://kaggle.com/divyanshrai7" },
  { Icon: FaTwitter, href: "https://twitter.com" },
  { Icon: FaYoutube, href: "https://youtube.com" },
];

const skills =  [
  "Machine Learning Algorithms",
  "Deep Learning Frameworks",
  "Computer Vision Techniques",
  "Mathematical Foundations",
  "Natural Language Processing"
];


interface Skill {
  name: string;
  icon: React.ReactNode;
  skills: string[];
}

const skillsData: Skill[] = [
  {
    name: "Gen-AI Tools",
    icon: <Bot className="w-6 h-6" />,
    skills: ["GPT", "Claude", "Hugging Face", "v0.dev", "Copilot", "Gemini"],
  },
  {
    name: "Subjects",
    icon: <BookOpen className="w-6 h-6" />,
    skills: [
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",'Mathematics',
      "Statistics & Probability",
      "Natural Language Processing (NLP)",
    ],
  },
  {
    name: "AI & Data Science",
    icon: <Library className="w-6 h-6" />,
    skills: [
      'Langchain',
      "Tensorflow",
      "Scikit-Learn",
      "OpenCV",
      "Pytorch",
      "numpy",
      "pandas",
      "matplotlib",
    ],
  },
];

const projects = [
  {
    title: "AI-Powered Chatbot",
    keyPoints: [
      "Natural Language Processing",
      "Machine Learning",
      "Real-time responses",
    ],
    blogLink: "https://example.com/chatbot-blog",
    demoLink: "https://example.com/chatbot-demo",
  },
  {
    title: "Data Visualization Dashboard",
    keyPoints: [
      "Interactive charts",
      "Real-time data processing",
      "Customizable views",
    ],
    blogLink: "https://example.com/dashboard-blog",
    demoLink: "https://example.com/dashboard-demo",
  },
  {
    title: "Image Recognition App",
    keyPoints: ["Deep Learning", "Computer Vision", "Mobile-friendly"],
    blogLink: "https://example.com/image-recognition-blog",
    demoLink: "https://example.com/image-recognition-demo",
  },
  {
    title: "Predictive Analytics Tool",
    keyPoints: ["Statistical Modeling", "Big Data Processing", "Forecasting"],
    blogLink: "https://example.com/predictive-analytics-blog",
    demoLink: "https://example.com/predictive-analytics-demo",
  },
];

const certificates = [
  {
    title: "Machine Learning Specialization",
    image: "/placeholder.svg?height=200&width=300",
    verifyUrl: "https://example.com/verify-ml-cert",
  },
  {
    title: "Deep Learning Nanodegree",
    image: "/placeholder.svg?height=200&width=300",
    verifyUrl: "https://example.com/verify-dl-cert",
  },
  {
    title: "Data Science Professional Certificate",
    image: "/placeholder.svg?height=200&width=300",
    verifyUrl: "https://example.com/verify-ds-cert",
  },
];

const learnings = [
  {
    title: "Advanced NLP Techniques",
    keyPoints: ["Transformer models", "BERT and GPT", "Sentiment analysis"],
    blogLink: "https://example.com/nlp-techniques-blog",
  },
  {
    title: "Computer Vision Deep Dive",
    keyPoints: ["Object detection", "Image segmentation", "GANs"],
    blogLink: "https://example.com/computer-vision-blog",
  },
  {
    title: "MLOps Best Practices",
    keyPoints: [
      "Model versioning",
      "Automated testing",
      "Continuous deployment",
    ],
    blogLink: "https://example.com/mlops-blog",
  },
];

const contributions = [
  {
    title: "Open Source ML Library",
    keyPoints: [
      "Implemented new algorithms",
      "Improved documentation",
      "Performance optimization",
    ],
    projectLink: "https://github.com/example/ml-library",
  },
  {
    title: "Kaggle Competition Solution",
    keyPoints: [
      "Top 5% ranking",
      "Novel feature engineering",
      "Ensemble modeling",
    ],
    projectLink: "https://kaggle.com/example-competition",
  },
  {
    title: "Tech Blog Articles",
    keyPoints: [
      "Weekly AI/ML insights",
      "Tutorial series",
      "Industry trend analysis",
    ],
    projectLink: "https://techblog.com/author/divyanshrai",
  },
];

const achievements = [
  {
    text: "Proficient Algorithm Learner",
    icon: "🏆",
    link: "https://example.com/algorithm-learning",
  },
  {
    text: "Researched AI Topics",
    icon: "👥",
    link: "https://example.com/ai-research",
  },
  {
    text: "Earned ML Certificates ",
    icon: "🌟",
    link: "https://example.com/ml-certificates",
  },
  {
    text: "Trained LLM from scratch",
    icon: "✍️",
    link: "https://example.com/llm-training",
  },
];

const SkillCategory: React.FC<{ skill: Skill; index: number }> = ({
  skill,
  index,
}) => {
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
        {skill.icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-4 text-center">{skill.name}</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {skill.skills.map((item, index) => (
          <motion.span
            key={index}
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

const ProjectCard: React.FC<{
  title: string;
  keyPoints: string[];
  blogLink: string;
  demoLink: string;
}> = ({ title, keyPoints, blogLink, demoLink }) => {
  return (
    <Card className="w-full max-w-sm bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <ul className="list-disc list-inside mb-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="text-sm text-gray-600">
              {point}
            </li>
          ))}
        </ul>
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="text-teal-600 hover:bg-teal-50 border-teal-200"
            onClick={() => window.open(blogLink, "_blank")}
          >
            Blog
          </Button>
          <Button
            variant="outline"
            className="text-blue-600 hover:bg-blue-50 border-blue-200"
            onClick={() => window.open(demoLink, "_blank")}
          >
            Live Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CertificateCard: React.FC<{
  title: string;
  image: string;
  verifyUrl: string;
  onClick: () => void;
}> = ({ title, image, verifyUrl, onClick }) => {
  return (
    <Card
      className="w-full max-w-sm bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <img
          src={image}
          alt={title}
          width={300}
          height={200}
          className="w-full h-40 object-cover mb-4 rounded"
        />
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <Button
          variant="outline"
          className="w-full text-teal-600 hover:bg-teal-50 border-teal-200"
          onClick={(e) => {
            e.stopPropagation();
            window.open(verifyUrl, "_blank");
          }}
        >
          Verify Certificate
        </Button>
      </CardContent>
    </Card>
  );
};

const LearningCard: React.FC<{
  title: string;
  keyPoints: string[];
  blogLink: string;
}> = ({ title, keyPoints, blogLink }) => {
  return (
    <Card className="w-full max-w-sm bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <ul className="list-disc list-inside mb-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="text-sm text-gray-600">
              {point}
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          className="w-full text-blue-600 hover:bg-blue-50 border-blue-200"
          onClick={() => window.open(blogLink, "_blank")}
        >
          Read More
        </Button>
      </CardContent>
    </Card>
  );
};

const ContributionCard: React.FC<{
  title: string;
  keyPoints: string[];
  projectLink: string;
}> = ({ title, keyPoints, projectLink }) => {
  return (
    <Card className="w-full max-w-sm bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <ul className="list-disc list-inside mb-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="text-sm text-gray-600">
              {point}
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          className="w-full text-teal-600 hover:bg-teal-50 border-teal-200"
          onClick={() => window.open(projectLink, "_blank")}
        >
          View Project
        </Button>
      </CardContent>
    </Card>
  );
};

const FeaturedAchievements: React.FC<{
  onAchievementClick: (link: string) => void;
}> = ({ onAchievementClick }) => {
  const [completed, setCompleted] = useState<boolean[]>(
    new Array(achievements.length).fill(false)
  );

  const toggleAchievement = (index: number) => {
    setCompleted((prev) => {
      const newCompleted = [...prev];
      newCompleted[index] = !newCompleted[index];
      return newCompleted;
    });
    onAchievementClick(achievements[index].link);
  };

  return (
    <motion.div
      className="flex justify-center w-full p-1 mt-10 font-mono"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-6xl">
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <motion.div
                className={`flex items-center cursor-pointer p-3 border-2 rounded-lg ${
                  completed[index]
                    ? "bg-teal-100 border-teal-300"
                    : "bg-white border-gray-200"
                }`}
                onClick={() => toggleAchievement(index)}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                <motion.div
                  className="w-1/5 mr-3 flex items-center justify-center"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: completed[index] ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                </motion.div>
                <div className="w-4/5">
                  <AnimatePresence mode="wait">
                    {completed[index] ? (
                      <motion.span
                        key="completed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="line-through text-gray-500"
                      >
                        {achievement.text}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="uncompleted"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-800"
                      >
                        {achievement.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function EnhancedPortfolio() {
  const [typedText, setTypedText] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<{
    title: string;
    image: string;
  } | null>(null);
  const [achievementLink, setAchievementLink] = useState<string | null>(null);
  const fullText = "ML Graduate | System Engineer @TCS";;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
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
  }, []);
  const contactOpen = () => {
    setIsContactModalOpen(true);
  };
  const sectionRefs = {
    profile: useRef(null),
    achievements: useRef(null),
    skills: useRef(null),
    projects: useRef(null),
    certificates: useRef(null),
    learnings: useRef(null),
    contributions: useRef(null),
  };

  const Section: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
      <motion.section
        ref={ref}
        className="w-full max-w-6xl my-16"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center flex items-center justify-center space-x-2 text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {icon}
          <span>{title}</span>
        </motion.h2>
        {children}
      </motion.section>
    );
  };

  const handleAchievementClick = (link: string) => {
    setAchievementLink(link);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        ref={sectionRefs.profile}
      >
        <Card className="w-full max-w-6xl bg-white border-2 border-gray-200 rounded-3xl shadow-lg font-mono overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex flex-col items-center md:items-start">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden">
                    <AvatarImage src={myImage} alt="Divyansh Rai" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.h2
                  className="mt-4 text-3xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Divyansh Rai
                </motion.h2>
                <div className="flex space-x-4 mt-2">
                  {socialIcons.map(({ Icon, href }, index) => (
                    <motion.a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Icon className="w-6 h-6 text-gray-600 hover:text-teal-600 transition-colors" />
                    </motion.a>
                  ))}
                </div>
              </div>
              <div className="flex-grow">
                <motion.p
                  className="text-xl text-gray-700 font-semibold mb-7"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {typedText}
                </motion.p>
                <ul className="space-y-2 text-lg ml-40 list-disc">
                  {skills.map((skill, index) => (
                    <motion.li
                      key={skill}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-gray-700"
                    >
                      {skill}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 md:mt-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                onClick={() => setIsContactModalOpen(true)}
                  
                  className="bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 font-bold py-2 px-4 rounded-lg relative overflow-hidden group">
                    <span 
                    
                    className="relative z-10">Hire Me : Contact</span>
                   
                    <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Button>
                  
                </motion.div>
                
              </div>
            </div>
            <motion.div
              className="mt-8 text-center text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <strong className="text-gray-800">Key Skills:</strong>{" "}
              <span className="text-gray-600">
                Tensorflow, Pytorch, Scikit-Learn, Langchain, OpenCV, NLTK
              </span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <Section
        title="Featured Achievements"
        icon={<Award className="w-8 h-8 text-teal-500" />}
      >
        <FeaturedAchievements onAchievementClick={handleAchievementClick} />
      </Section>

      <Section
        title="Top Skills"
        icon={<Globe className="w-8 h-8 text-blue-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillsData.map((skill, index) => (
            <SkillCategory key={index} skill={skill} index={index} />
          ))}
        </div>
      </Section>

      <Section
        title="Projects"
        icon={<Code className="w-8 h-8 text-teal-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </Section>

      <Section
        title="Certificates"
        icon={<Award className="w-8 h-8 text-blue-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <CertificateCard
              key={index}
              {...cert}
              onClick={() => setSelectedCertificate(cert)}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Top Learnings"
        icon={<BookOpen className="w-8 h-8 text-teal-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {learnings.map((learning, index) => (
            <LearningCard key={index} {...learning} />
          ))}
        </div>
      </Section>

      <Section
        title="Top Contributions"
        icon={<Users className="w-8 h-8 text-blue-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contributions.map((contribution, index) => (
            <ContributionCard key={index} {...contribution} />
          ))}
        </div>
      </Section>

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
            className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedCertificate.title}
            </h3>
            <img
              src={selectedCertificate.image}
              alt={selectedCertificate.title}
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </motion.div>
        </motion.div>
      )}

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
            className="bg-white rounded-lg p-4 w-full max-w-4xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={achievementLink}
              title="Achievement Details"
              className="w-full h-full border-none"
            />
          </motion.div>
        </motion.div>
      )}
      <AboutSection contact={contactOpen} />
      <ContactMeModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
              />
    </div>
  );
}
