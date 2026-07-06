import { useState } from "react"
import { Routes, Route } from "react-router"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ArchiveGrid } from "@/components/sections/ArchiveGrid"
import { SendForm } from "@/components/sections/SendForm"
import { Inbox } from "@/pages/Inbox"
import { EditArchive } from "@/pages/EditArchive"

function Home() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="pb-16">
          <ArchiveGrid />
        </div>
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/morpheus-inbox" element={<Inbox />} />
      <Route path="/edit-archive" element={<EditArchive />} />
    </Routes>
  )
}
