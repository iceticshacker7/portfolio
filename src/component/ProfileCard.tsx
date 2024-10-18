import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FaGithub, FaKaggle, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa"
import myImage from '@/assets/myimage.jpeg'
import FeaturedAchievements from './FeaturedAchievements'
const socialIcons = [
  { Icon: FaGithub, href: "https://github.com/iceticshacker7" },
  { Icon: FaLinkedin, href: "https://www.linkedin.com/in/divyanshrai7" },
  { Icon: FaKaggle, href: "https://kaggle.com" },
  { Icon: FaTwitter, href: "https://twitter.com" },
  { Icon: FaYoutube, href: "https://youtube.com" },
]

const skills = [
  "Training ML & DL Models",
  "Data Engineering & Analysis",
  "MLOPS",
  "NLP and OpenCV",
  "Community Learning Kaggle",
]

export default function ProfileCard() {
  const [typedText, setTypedText] = useState('')
  const fullText = "System engineer @TCS"

  useEffect(() => {
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 to-purple-100 p-1 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-6xl bg-white border-2 border-black rounded-3xl shadow-lg font-mono overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex flex-col items-center md:items-start">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="w-32 h-32 border-2 border-black rounded-full overflow-hidden">
                    <AvatarImage src={myImage} alt="Divyansh Rai" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.h2
                  className="mt-4 text-3xl font-bold"
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
                      <Icon className="w-6 h-6 text-black hover:text-blue-600 transition-colors" />
                    </motion.a>
                  ))}
                </div>
              </div>
              <div className="flex-grow">
                <motion.p
                  className="text-xl text-neutral-700 font-semibold mb-7"
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
                  <Button className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold py-2 px-4 rounded-lg relative overflow-hidden group">
                    <span className="relative z-10">Hire Me / Contact</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
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
              <strong>Key Skills:</strong> Tensorflow Python Scikit-Learn
              Langchain OpenCV NLP
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      <FeaturedAchievements/>
    </div>
  )
}