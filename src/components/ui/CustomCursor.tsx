'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { motion } from 'framer-motion'

interface CursorContextType {
  cursorVariant: 'default' | 'text' | 'button'
  setCursorVariant: React.Dispatch<React.SetStateAction<'default' | 'text' | 'button'>>
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)

export const useCursor = () => {
  const context = useContext(CursorContext)
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider')
  }
  return context
}

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorVariant, setCursorVariant] = useState<'default' | 'text' | 'button'>('default')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', mouseMove)

    return () => {
      window.removeEventListener('mousemove', mouseMove)
    }
  }, [])

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: 'rgba(100, 100, 255, 0.4)',
      mixBlendMode: 'difference' as 'difference',
    },
    text: {
      height: 64,
      width: 64,
      x: mousePosition.x - 32,
      y: mousePosition.y - 32,
      backgroundColor: 'rgba(100, 100, 255, 0.2)',
      mixBlendMode: 'difference' as 'difference',
    },
    button: {
      height: 48,
      width: 48,
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      backgroundColor: 'rgba(255, 100, 100, 0.6)',
      mixBlendMode: 'difference' as 'difference',
    },
  }

  return (
    <CursorContext.Provider value={{ cursorVariant, setCursorVariant }}>
      {children}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full"
        animate={cursorVariant}
        variants={variants}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
    </CursorContext.Provider>
  )
}

export const CursorHighlight: React.FC<{
  children: React.ReactNode
  variant: 'text' | 'button'
}> = ({ children, variant }) => {
  const { setCursorVariant } = useCursor()

  return (
    <span
      onMouseEnter={() => setCursorVariant(variant)}
      onMouseLeave={() => setCursorVariant('default')}
    >
      {children}
    </span>
  )
}