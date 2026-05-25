import { useMemo } from 'react'

const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  size: Math.random() * 2 + 0.5,
  top: Math.random() * 100,
  left: Math.random() * 100,
  duration: 2 + Math.random() * 4,
  delay: -Math.random() * 4,
  opacity: Math.random() * 0.5 + 0.1,
}))

export default function Starfield() {
  const stars = useMemo(() => STARS, [])

  return (
    <div className="starfield">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#fff',
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
            '--d': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
