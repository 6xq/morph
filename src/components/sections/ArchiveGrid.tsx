import { useRef, useEffect } from "react"
import { gsap } from "@/lib/gsap"
import { ArchiveCard } from "@/components/ui/ArchiveCard"
import imgRect2 from "@/imports/Home/c5c97b06420f9fb37ab8ad36eaa0d81317c92607.png"
import imgRect3 from "@/imports/Home/cb3fcca203ce3df2ca7b001f7ae274a76797263c.png"
import imgRect4 from "@/imports/Home/fa2c65584b671e16c0ccd2d10fb7fc317eb4d5bf.png"
import imgRect5 from "@/imports/Home/cad14d93c7c3e3d21e827654eb0d7d10df369ca4.png"
import imgRect6 from "@/imports/Home/6786bf8c0cab97b35112fd3a5f9dfe1faeb40a60.png"
import imgRect7 from "@/imports/Home/640c959c80bdb4188917f57a241536ae067907db.png"
import imgRect8 from "@/imports/Home/0180d31d32607011a14723c8c850b464f5c76f12.png"
import imgRect9 from "@/imports/Home/d6ddb872a3bb560570256771d1a4982aad7b85b9.png"

const ARCHIVE_ITEMS = [
  { title: "WENDYKURK / SOFT MEAT", date: "10 June, 2026", img: imgRect2 },
  { title: "FELVIDEK", date: "8 June, 2026", img: imgRect4 },
  { title: "MAUVAIS SANG 1986 / LEOS CARAX", date: "9 June, 2026", img: imgRect6 },
  { title: "WHITE NIGHTS // FYODOR DOSTOEVSKY", date: "8 June, 2026", img: imgRect8 },
  { title: "MOOSE / COOL BREEZE", date: "1 April, 2025", img: imgRect3 },
  { title: "G-SCHMITT / GARNET", date: "1 April, 2025", img: imgRect5 },
  { title: "MBV / YOU MADE ME REALISE", date: "30 December, 2021", img: imgRect7 },
  { title: "THE MYRIAD FORM / THE MYRIAD FORM", date: "30 January, 2026", img: imgRect9 },
]

export function ArchiveGrid() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".archive-card")
    if (cards && cards.length > 0) {
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: cards[0], start: "top 90%" },
        }
      )
    }
  }, [])

  return (
    <section ref={gridRef} className="pl-6 sm:pl-12 pr-8 sm:pr-16 lg:pr-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {ARCHIVE_ITEMS.map((item) => (
          <div key={item.title} className="archive-card">
            <ArchiveCard {...item} />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <button className="bg-[#f1f1f1] text-black text-[13px] font-['Intel_One_Mono',monospace] px-6 py-3 rounded-full hover:bg-[#e4e4e4] transition-colors">
          Load More
        </button>
      </div>
    </section>
  )
}
