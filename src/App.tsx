import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ArchiveGrid } from "@/components/sections/ArchiveGrid"
import { SendForm } from "@/components/sections/SendForm"

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Header />
      <main className="pb-16">
        <ArchiveGrid />
      </main>
      <Footer onSendClick={() => setModalOpen(true)} />

      {modalOpen && (
        <div
          className="fixed inset-0 bg-[#191818]/60 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <SendForm onClose={() => setModalOpen(false)} />
        </div>
      )}
    </div>
  )
}
