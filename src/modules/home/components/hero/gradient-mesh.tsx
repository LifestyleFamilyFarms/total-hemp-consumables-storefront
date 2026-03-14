export default function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Teal blob — top left, dominant */}
      <div
        className="absolute -left-[10%] -top-[15%] h-[65%] w-[65%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(18,165,120,0.35) 0%, rgba(18,165,120,0.08) 50%, transparent 70%)",
          filter: "blur(60px)",
          animation: "hero-gradient-drift-1 14s ease-in-out infinite alternate",
        }}
      />
      {/* Gold blob — bottom right, warm accent */}
      <div
        className="absolute -bottom-[10%] -right-[5%] h-[60%] w-[55%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,191,61,0.28) 0%, rgba(244,191,61,0.06) 50%, transparent 70%)",
          filter: "blur(60px)",
          animation: "hero-gradient-drift-2 17s ease-in-out infinite alternate",
        }}
      />
      {/* Tangelo blob — center right, warm highlight */}
      <div
        className="absolute right-[15%] top-[25%] h-[45%] w-[40%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(229,101,37,0.2) 0%, rgba(229,101,37,0.04) 50%, transparent 70%)",
          filter: "blur(50px)",
          animation: "hero-gradient-drift-3 20s ease-in-out infinite alternate",
        }}
      />
      {/* Forest blob — bottom left, grounding */}
      <div
        className="absolute -left-[5%] bottom-[5%] h-[50%] w-[45%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(25,87,43,0.3) 0%, rgba(25,87,43,0.06) 50%, transparent 70%)",
          filter: "blur(55px)",
          animation: "hero-gradient-drift-4 16s ease-in-out infinite alternate",
        }}
      />
      {/* Center glow — focuses the eye */}
      <div
        className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(18,165,120,0.12) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "glow-pulse 8s ease-in-out infinite",
        }}
      />
    </div>
  )
}
