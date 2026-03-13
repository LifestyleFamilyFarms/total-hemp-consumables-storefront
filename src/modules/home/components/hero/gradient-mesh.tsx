export default function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(18,165,120,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "hero-gradient-drift-1 14s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -right-[5%] -bottom-[15%] h-[55%] w-[50%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,191,61,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "hero-gradient-drift-2 17s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute right-[20%] top-[30%] h-[40%] w-[35%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(229,101,37,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "hero-gradient-drift-3 20s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -left-[5%] bottom-[10%] h-[45%] w-[40%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(25,87,43,0.12) 0%, transparent 70%)",
          filter: "blur(55px)",
          animation: "hero-gradient-drift-4 16s ease-in-out infinite alternate",
        }}
      />
    </div>
  )
}
