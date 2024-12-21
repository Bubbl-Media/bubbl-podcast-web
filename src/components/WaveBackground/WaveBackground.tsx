import React, { useRef, useEffect } from 'react'

interface WavePoint {
  x: number
  y: number
  originalY: number
}

interface Particle {
  x: number
  y: number
  speed: number
  size: number
}

export const WaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()
  const wavePointsRef = useRef<WavePoint[]>([])
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      const points = []
      const frequency = 0.02
      const amplitude = 10
      const pointCount = Math.floor(canvas.width / 20) + 2
      
      for (let i = 0; i < pointCount; i++) {
        const x = (canvas.width / (pointCount - 3)) * i
        const y = canvas.height / 2 + Math.sin(i * frequency) * amplitude
        points.push({ x, y, originalY: y })
      }
      
      wavePointsRef.current = points

      const particleCount = 60
      const particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.08 + Math.random() * 0.15,
          size: 1.0 + Math.random() * 2.5
        })
      }
      particlesRef.current = particles
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const waveColors = [
        { start: "rgba(20, 184, 166, 0.1)", end: "rgba(20, 184, 166, 0.05)" },
        { start: "rgba(13, 148, 136, 0.1)", end: "rgba(13, 148, 136, 0.05)" },
        { start: "rgba(45, 212, 191, 0.1)", end: "rgba(45, 212, 191, 0.05)" }
      ];

      wavePointsRef.current.forEach((point, i) => {
        const distanceFromMouse = Math.sqrt(
          Math.pow(point.x - mousePosition.x, 2) + 
          Math.pow(point.originalY - mousePosition.y, 2)
        )
        const influence = Math.max(0, 1 - distanceFromMouse / 200)
        point.y = point.originalY + Math.sin(Date.now() * 0.0005 + i * 0.2) * 15
        point.y += influence * 30 * Math.sin(Date.now() * 0.003)
      })

      waveColors.forEach((color, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, color.start);
        gradient.addColorStop(1, color.end);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        wavePointsRef.current.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y + index * 5)
          } else {
            const prevPoint = wavePointsRef.current[i - 1]
            const cx = (point.x + prevPoint.x) / 2
            const cy = (point.y + prevPoint.y) / 2 + index * 5
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y + index * 5, cx, cy)
          }
        })

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        ctx.fillStyle = gradient
        ctx.fill()
      })

      particlesRef.current.forEach(particle => {
        particle.y -= particle.speed
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
        }

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        )

        gradient.addColorStop(0, "rgba(153, 246, 228, 0.8)")
        gradient.addColorStop(1, "rgba(153, 246, 228, 0)")

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", updateSize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        touchAction: "none",
        pointerEvents: "none",
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent'
      }}
    />
  )
}
