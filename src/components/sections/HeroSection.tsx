import { useRef, useEffect } from "react"
import { gsap } from "@/lib/gsap"

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="px-6 sm:px-12 py-24 sm:py-32">
      <div className="max-w-3xl">
        <h2 className="font-['Instrument_Serif',serif] text-[48px] sm:text-[64px] leading-none text-black dark:text-white not-italic mb-6">
          Curating what
          <br />
          <span className="italic">matters</span>
        </h2>
        <p className="font-['Intel_One_Mono',monospace] text-[14px] text-black/60 dark:text-white/60 max-w-lg leading-relaxed">
          Every piece in this archive was chosen because it left a mark. Music, film, books — fragments of taste that
          refuse to fade. This is my digital memory palace.
        </p>
      </div>
    </section>
  )
}
