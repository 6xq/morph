import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export function fadeInUp(element: string | Element, options?: { delay?: number; duration?: number; stagger?: number }) {
  const { delay = 0, duration = 0.8, stagger = 0.1 } = options || {}
  return gsap.fromTo(
    element,
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration, delay, stagger, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 85%" } }
  )
}
