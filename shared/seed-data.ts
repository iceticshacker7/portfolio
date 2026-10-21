// Content that used to be hardcoded in the React components. `npm run seed`
// loads it into MongoDB, and the site falls back to it if the API is unreachable.
import type { Achievement, Experience, Profile, SkillCategory } from "./schemas.js";

type Seed<T> = Omit<T, "id">;

export const seedProfile: Profile = {
  name: "Divyansh Rai",
  initials: "DR",
  avatar: "",
  headline: "AI/ML Graduate | Systems Engineer @TCS",
  focusAreas: [
    "Machine Learning & Deep Learning",
    "Computer Vision",
    "NLP & LLM Applications",
    "Data Analysis & Visualization",
    "Full-stack Development",
  ],
  keySkills: "Python, TensorFlow, PyTorch, Scikit-learn, LangChain, OpenCV, Pandas, SQL, React, Node.js",
  footerTagline: "Systems Engineer @TCS | AI/ML Graduate",
  resumeUrl: "",
  socials: [
    { platform: "github", url: "https://github.com/iceticshacker7" },
    { platform: "linkedin", url: "https://www.linkedin.com/in/divyanshrai7" },
    { platform: "kaggle", url: "https://kaggle.com/divyanshrai7" },
  ],
  about: {
    title: "Building practical machine learning products",
    paragraphs: [
      "I'm a Systems Engineer at Tata Consultancy Services and a B.Tech graduate in Artificial Intelligence & Machine Learning from Gyan Ganga Institute of Technology & Sciences (2020–2024, CGPA 8.7).",
      "I build machine learning and data products end to end: a real-time driver drowsiness detector using OpenCV and a CNN, Code Learner (an LLM assistant that answers questions about code repositories), and interactive analytics dashboards in Streamlit, Plotly and Tableau.",
      "In college I led the team that built our coding club's platform, solved 830+ problems on LeetCode and was a finalist at Microsoft Engage 2022. I'm looking for roles in machine learning engineering and applied AI.",
    ],
    expertise: [
      "Machine learning & deep learning (TensorFlow, PyTorch, Scikit-learn)",
      "Computer vision (OpenCV, CNNs)",
      "LLM applications (LangChain, OpenAI APIs)",
      "Data analysis & dashboards (Pandas, Plotly, Tableau)",
      "Full-stack web (React, Node.js, MongoDB)",
    ],
    ctaTitle: "Let's work together",
    ctaText: "Hiring for an ML or applied AI role, or have a project in mind? I'd be glad to hear from you.",
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
  { section: "Professional", title: "Systems Engineer Trainee", description: "Trainings : Java | SQL | UNIX | UI Design", institution: "Tata Consultancy Services, India", dateRange: "August 2024 - Present", order: 1 },
  { section: "Offers", title: "Systems Engineer", description: "Full-time offer · joined August 2024", institution: "Tata Consultancy Services, India", dateRange: "18 July 2024", order: 1 },
  { section: "Offers", title: "Frontend Developer", description: "Full-time offer", institution: "Prodesk IT, India", dateRange: "20th July 2024", order: 2 },
  { section: "Offers", title: "NLP Research Internship", description: "Selected for a research internship in natural language processing", institution: "IIT Bombay, India", dateRange: "20th July 2024", order: 3 },
  { section: "Participations", title: "Finalist", description: "Developed a Data Analysis Dashboard using Tableau", institution: "Microsoft Engage 2022", dateRange: "2022", order: 1 },
  { section: "Participations", title: "Pre-Finalist", description: "Cleared the first round of the Hackathon", institution: "Flipkart Grid '22", dateRange: "2022", order: 2 },
];

export const seedAchievements: Seed<Achievement>[] = [
  { text: "830+ LeetCode problems · top 10% contest rating", icon: "🏆", link: "https://leetcode.com/divyanshrai7", order: 1 },
  { text: "Codeforces Pupil (max rating 1298)", icon: "📈", link: "https://codeforces.com/profile/dedicatedaf", order: 2 },
  { text: "9 certifications: AWS, Google Cloud, IBM, Cisco", icon: "🎓", link: "/certificates", order: 3 },
  { text: "Led the team behind our college coding club's platform", icon: "👥", link: "/projects/ggits-students-coding-club-website", order: 4 },
];
