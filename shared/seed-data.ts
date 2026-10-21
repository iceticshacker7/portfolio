// Content that used to be hardcoded in the React components. `npm run seed`
// loads it into MongoDB, and the site falls back to it if the API is unreachable.
import type { Achievement, Experience, Profile, SkillCategory } from "./schemas.js";

type Seed<T> = Omit<T, "id">;

export const seedProfile: Profile = {
  name: "Divyansh Rai",
  initials: "DR",
  avatar: "",
  headline: "ML Graduate | System Engineer @TCS",
  focusAreas: [
    "Machine Learning Algorithms",
    "Deep Learning Frameworks",
    "Computer Vision Techniques",
    "Mathematical Foundations",
    "Natural Language Processing",
  ],
  keySkills: "Tensorflow, Pytorch, Scikit-Learn, Langchain, OpenCV, NLTK",
  footerTagline: "System Engineer | ML Graduate",
  resumeUrl: "",
  socials: [
    { platform: "github", url: "https://github.com/iceticshacker7" },
    { platform: "linkedin", url: "https://www.linkedin.com/in/divyanshrai7" },
    { platform: "kaggle", url: "https://kaggle.com/divyanshrai7" },
  ],
  about: {
    title: "Why Choose Me?",
    paragraphs: [
      "As a passionate and innovative technologist, I bring a unique blend of technical expertise and creative problem-solving to every project. With a strong foundation in both software development and data science, I'm able to tackle complex challenges and deliver robust, scalable solutions that drive real business value.",
      "My commitment to continuous learning keeps me at the forefront of emerging technologies, allowing me to implement cutting-edge solutions that give your projects a competitive edge. Whether it's developing intuitive user interfaces, architecting efficient backend systems, or extracting actionable insights from data, I'm dedicated to exceeding expectations and pushing the boundaries of what's possible.",
    ],
    expertise: [
      "Full-stack Development",
      "Data Engineering & Analysis",
      "Machine Learning & AI",
      "Team Collaboration",
      "Rapid Prototyping",
    ],
    ctaTitle: "Ready to Collaborate?",
    ctaText:
      "I'm always excited to take on new challenges and contribute to innovative projects. Let's work together to bring your ideas to life and create something extraordinary.",
  },
};

export const seedSkills: Seed<SkillCategory>[] = [
  { name: "Programming Languages", icon: "code", skills: ["C", "C++", "Python", "JavaScript"], featured: false, order: 1 },
  { name: "Web-Technologies", icon: "globe", skills: ["HTML5", "CSS", "Tailwind CSS", "React.js", "Express.js", "Node.js"], featured: false, order: 2 },
  { name: "Databases", icon: "database", skills: ["MongoDB", "SQL/MySQL"], featured: false, order: 3 },
  {
    name: "AI & Data Science",
    icon: "library",
    skills: ["Langchain", "Tensorflow", "Scikit-Learn", "OpenCV", "NLP", "Pytorch", "numpy", "pandas", "matplotlib", "seaborn", "Tableau"],
    featured: true,
    order: 4,
  },
  {
    name: "Subjects",
    icon: "book",
    skills: ["Machine Learning", "Deep Learning", "Computer Vision", "Mathematics", "Statistics & Probability", "Natural Language Processing (NLP)"],
    featured: true,
    order: 5,
  },
  {
    name: "Academic",
    icon: "school",
    skills: ["Data Structures and Algorithms (DSA)", "Test Driven Development (TDD)", "Object-Oriented Programming (OOP)", "Database Management Systems"],
    featured: false,
    order: 6,
  },
  { name: "Services", icon: "server", skills: ["AWS (RDS, EC2)", "Oracle Cloud", "Google Qwik-Labs", "Vercel", "MongoDB Atlas"], featured: false, order: 7 },
  { name: "Gen-AI Tools", icon: "bot", skills: ["GPT", "Claude", "Hugging Face", "v0.dev", "Copilot", "Gemini"], featured: true, order: 8 },
  { name: "Miscellaneous", icon: "bookplus", skills: ["Visual Studio", "GitHub", "PuTTY", "VM-Oracle", "Linux"], featured: false, order: 9 },
];

export const seedExperience: Seed<Experience>[] = [
  { section: "Academic", title: "B.Tech - Artificial Intelligence & Machine Learning", description: "Grade : 8.7", institution: "Gyan Ganga Institute of Technology & Sciences, India", dateRange: "2020 - 2024", order: 1 },
  { section: "Academic", title: "Class XII", description: "Grade : 8.3", institution: "Maths, Physics, Chemistry | CBSE", dateRange: "2020", order: 2 },
  { section: "Academic", title: "Class X", description: "Percentage : 84.4%", institution: "Central Board of Secondary Education, India", dateRange: "2018", order: 3 },
  { section: "Professional", title: "Systems Engineer Trainee", description: "Trainings : Java | SQL | UNIX | UI Design", institution: "@ TCSL, India", dateRange: "August 2024 - Present", order: 1 },
  { section: "Offers", title: "Systems Engineer", description: "Full-time | Status: Accepted", institution: "@ TCS, India", dateRange: "18 July 2024", order: 1 },
  { section: "Offers", title: "Frontend Developer", description: "Full-time | Status: Declined", institution: "@ Prodesk IT, India", dateRange: "20th July 2024", order: 2 },
  { section: "Offers", title: "Software Development Engineer", description: "Internship + PPO | Status: Revoked", institution: "@ Brane Enterprises, India", dateRange: "14 September 2023", order: 3 },
  { section: "Offers", title: "Got Awarded NLP research Intership", description: "Internship | Status: Declined", institution: "@ IIT Bombay, India", dateRange: "20th July 2024", order: 4 },
  { section: "Participations", title: "Finalist", description: "Developed a Data Analysis Dashboard using Tableau", institution: "Microsoft Engage 2022", dateRange: "2022", order: 1 },
  { section: "Participations", title: "Pre-Finalist", description: "Cleared the first round of the Hackathon", institution: "Flipkart Grid '22", dateRange: "2022", order: 2 },
];

export const seedAchievements: Seed<Achievement>[] = [
  { text: "Proficient Algorithm Learner", icon: "🏆", link: "", order: 1 },
  { text: "Researched AI Topics", icon: "👥", link: "", order: 2 },
  { text: "Earned ML Certificates", icon: "🌟", link: "/certificates", order: 3 },
  { text: "Trained LLM from scratch", icon: "✍️", link: "", order: 4 },
];
