import { useRef, useEffect, useState } from "react"
import { gsap } from "@/lib/gsap"
import { ArchiveCard } from "@/components/ui/ArchiveCard"
import { requireSupabase } from "@/lib/supabase"
import imgRect2 from "@/imports/Home/c5c97b06420f9fb37ab8ad36eaa0d81317c92607.png"
import imgRect3 from "@/imports/Home/cb3fcca203ce3df2ca7b001f7ae274a76797263c.png"
import imgRect4 from "@/imports/Home/fa2c65584b671e16c0ccd2d10fb7fc317eb4d5bf.png"
import imgRect5 from "@/imports/Home/cad14d93c7c3e3d21e827654eb0d7d10df369ca4.png"
import imgRect6 from "@/imports/Home/6786bf8c0cab97b35112fd3a5f9dfe1faeb40a60.png"
import imgRect7 from "@/imports/Home/640c959c80bdb4188917f57a241536ae067907db.png"
import imgRect8 from "@/imports/Home/0180d31d32607011a14723c8c850b464f5c76f12.png"
import imgRect9 from "@/imports/Home/d6ddb872a3bb560570256771d1a4982aad7b85b9.png"

type DisplayItem = { title: string; date: string; img: string }

const FALLBACK_ITEMS: DisplayItem[] = [
  { title: "WENDYKURK / SOFT MEAT", date: "10 June, 2026", img: imgRect2 },
  { title: "FELVIDEK", date: "8 June, 2026", img: imgRect4 },
  { title: "MAUVAIS SANG 1986 / LEOS CARAX", date: "9 June, 2026", img: imgRect6 },
  { title: "WHITE NIGHTS // FYODOR DOSTOEVSKY", date: "8 June, 2026", img: imgRect8 },
  { title: "MOOSE / COOL BREEZE", date: "1 April, 2025", img: imgRect3 },
  { title: "G-SCHMITT / GARNET", date: "1 April, 2025", img: imgRect5 },
  { title: "MBV / YOU MADE ME REALISE", date: "30 December, 2021", img: imgRect7 },
  { title: "THE MYRIAD FORM / THE MYRIAD FORM", date: "30 January, 2026", img: imgRect9 },
]

const fallbackMap = new Map(FALLBACK_ITEMS.map((i) => [i.title, i.img]))

const PAGE_SIZE = 8

export function ArchiveGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<DisplayItem[]>(FALLBACK_ITEMS)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const sb = requireSupabase()
        const { count } = await sb
          .from("archive_entries")
          .select("*", { count: "exact", head: true })
        const total = count ?? 0
        setHasMore(total > PAGE_SIZE)

        const { data, error } = await sb
          .from("archive_entries")
          .select("title, date, image_url")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1)
        if (!error && data && data.length > 0) {
          setItems(data.map((e) => ({
            title: e.title,
            date: e.date || "",
            img: e.image_url || fallbackMap.get(e.title) || "",
          })))
          setPage(1)
        }
      } catch {}
    }
    load()
  }, [])

  async function loadMore() {
    setLoading(true)
    try {
      const sb = requireSupabase()
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error } = await sb
        .from("archive_entries")
        .select("title, date, image_url")
        .order("created_at", { ascending: false })
        .range(from, to)
      if (!error && data && data.length > 0) {
        setItems((prev) => [
          ...prev,
          ...data.map((e) => ({
            title: e.title,
            date: e.date || "",
            img: e.image_url || fallbackMap.get(e.title) || "",
          })),
        ])
        setPage((p) => p + 1)
        if (data.length < PAGE_SIZE) setHasMore(false)
      } else {
        setHasMore(false)
      }
    } catch {}
    setLoading(false)
  }

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
  }, [items])

  return (
    <section ref={gridRef} className="pl-6 sm:pl-12 pr-8 sm:pr-16 lg:pr-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.title} className="archive-card">
            <ArchiveCard {...item} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-[#f1f1f1] text-black text-[13px] font-['Intel_One_Mono',monospace] px-6 py-3 rounded-full hover:bg-[#e4e4e4] disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  )
}
