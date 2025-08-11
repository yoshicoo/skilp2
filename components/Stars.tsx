'use client'
export default function Stars({ level }: { level: number }) {
  const n = Math.max(0, Math.min(5, Math.round(level)))
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i<=n? '#fbbf24' : 'none'} stroke="#fbbf24" strokeWidth="1.5">
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.68 1.56 8.271L12 18.897l-7.496 4.36 1.56-8.271L0 9.306l8.332-1.151z"/>
        </svg>
      ))}
    </div>
  )
}
