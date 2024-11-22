"use client"

import React from "react"

interface AspectRatioProps {
  ratio?: number
  children?: React.ReactNode
  className?: string
}

const AspectRatio: React.FC<AspectRatioProps> = ({ 
  ratio = 1, 
  children,
  className = ""
}) => {
  return (
    <div 
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: `${(1 / ratio) * 100}%`
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { AspectRatio } 