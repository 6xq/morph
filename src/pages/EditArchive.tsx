import { useEffect, useState } from "react"
import { Link } from "react-router"
import { requireSupabase } from "@/lib/supabase"
import type { AuthSession } from "@supabase/supabase-js"

type ArchiveEntry = {
  id: number
  title: string
  date: string | null
  image_url: string | null
  category: string | null
  position: number
  link: string | null
  description: string | null
  created_at: string
  updated_at: string
}

const CATEGORIES = ["music", "film", "book", "art", "other"]

const mono = "font-['Intel_One_Mono',monospace] font-normal text-[13px]"

const emptyForm = {
  title: "",
  date: "",
  image_url: "",
  category: "other",
  link: "",
  description: "",
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const name = username.trim()
    if (!name) {
      setError("Enter your username")
      setLoading(false)
      return
    }

    const email = name.includes("@") ? name : `${name}@morpheus.io`

    try {
      const sb = requireSupabase()
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) throw error
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-8 w-full max-w-[400px]">
        <h1 className="font-['Instrument_Serif',serif] text-[32px] mb-6 text-black">EDIT ARCHIVE</h1>
        <div className="flex flex-col gap-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required
            className={`${mono} w-full border-b border-black/30 pb-2 outline-none bg-transparent text-black placeholder:text-[#8e8e8e]`} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
            className={`${mono} w-full border-b border-black/30 pb-2 outline-none bg-transparent text-black placeholder:text-[#8e8e8e]`} />
          {error && <p className={`${mono} text-[12px] text-red-600`}>{error}</p>}
          <button type="submit" disabled={loading}
            className={`${mono} w-full bg-black text-white py-3 hover:bg-black/85 disabled:opacity-50 transition-opacity tracking-widest mt-2`}>
            {loading ? "..." : "SIGN IN"}
          </button>
          <Link to="/" className={`${mono} text-black/50 hover:text-black transition-colors text-center text-[12px]`}>
            ← Back to archive
          </Link>
        </div>
      </form>
    </div>
  )
}

export function EditArchive() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [entries, setEntries] = useState<ArchiveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const sb = requireSupabase()
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchEntries()
      else setLoading(false)
    })
  }, [])

  async function fetchEntries() {
    setLoading(true)
    setError("")
    try {
      const sb = requireSupabase()
      const { data, error } = await sb
        .from("archive_entries")
        .select("*")
        .order("position", { ascending: true })
      if (error) throw error
      setEntries((data || []) as ArchiveEntry[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    }
    setLoading(false)
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  function editEntry(entry: ArchiveEntry) {
    setForm({
      title: entry.title,
      date: entry.date || "",
      image_url: entry.image_url || "",
      category: entry.category || "other",
      link: entry.link || "",
      description: entry.description || "",
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError("Title is required")
      return
    }
    setSaving(true)
    setError("")
    try {
      const sb = requireSupabase()
      if (editingId) {
        const { error } = await sb
          .from("archive_entries")
          .update({
            title: form.title.trim(),
            date: form.date.trim() || null,
            image_url: form.image_url.trim() || null,
            category: form.category,
            link: form.link.trim() || null,
            description: form.description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
        if (error) throw error
      } else {
        const maxPos = entries.reduce((max, e) => Math.max(max, e.position), -1)
        const { error } = await sb
          .from("archive_entries")
          .insert({
            title: form.title.trim(),
            date: form.date.trim() || null,
            image_url: form.image_url.trim() || null,
            category: form.category,
            position: maxPos + 1,
            link: form.link.trim() || null,
            description: form.description.trim() || null,
          })
        if (error) throw error
      }
      resetForm()
      fetchEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this entry?")) return
    setError("")
    try {
      const sb = requireSupabase()
      const { error } = await sb.from("archive_entries").delete().eq("id", id)
      if (error) throw error
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  async function move(id: number, direction: "up" | "down") {
    const idx = entries.findIndex((e) => e.id === id)
    if (idx < 0) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= entries.length) return

    const a = entries[idx]
    const b = entries[swapIdx]

    try {
      const sb = requireSupabase()
      await sb.from("archive_entries").update({ position: b.position }).eq("id", a.id)
      await sb.from("archive_entries").update({ position: a.position }).eq("id", b.id)
      fetchEntries()
    } catch (err) {
      setError("Failed to reorder")
    }
  }

  if (!session) {
    return <LoginForm onLogin={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="max-w-[960px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Instrument_Serif',serif] text-[38px] text-black">EDIT ARCHIVE</h1>
            <p className={`${mono} opacity-50 text-black`}>
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/" className={`${mono} text-[12px] text-black/50 hover:text-black transition-colors`}>
              ← Archive
            </Link>
            <button onClick={() => { resetForm(); setShowForm(true) }}
              className={`${mono} text-[12px] px-3 py-1 border border-black/20 hover:bg-black/5 transition-colors`}>
              + New
            </button>
            <button onClick={fetchEntries}
              className={`${mono} text-[12px] px-3 py-1 border border-black/20 hover:bg-black/5 transition-colors`}>
              Refresh
            </button>
          </div>
        </div>

        {error && <p className={`${mono} text-red-600 text-[12px] mb-4`}>{error}</p>}

        {showForm && (
          <form onSubmit={handleSave} className="bg-white border border-black/10 p-6 mb-8 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`${mono} border border-black/20 px-3 py-2 bg-white text-black text-[13px]`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>Date</label>
                <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`${mono} border border-black/20 px-3 py-2 bg-white text-black text-[13px]`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className={`${mono} border border-black/20 px-3 py-2 bg-white text-black text-[13px]`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${mono} border border-black/20 px-3 py-2 bg-white text-black text-[13px]`}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>Link</label>
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className={`${mono} border border-black/20 px-3 py-2 bg-white text-black text-[13px]`} />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={`${mono} border border-black/20 px-3 py-2 bg-white text-black text-[13px] resize-none`} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className={`${mono} text-[12px] px-4 py-2 bg-black text-white hover:bg-black/85 disabled:opacity-50 transition-colors`}>
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
              <button type="button" onClick={resetForm}
                className={`${mono} text-[12px] px-4 py-2 border border-black/20 hover:bg-black/5 transition-colors`}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className={`${mono} text-black/50`}>Loading...</p>
        ) : entries.length === 0 ? (
          <div className="border border-black/10 bg-white p-8 text-center">
            <p className={`${mono} text-black/50`}>No archive entries yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="bg-white border border-black/10 px-5 py-4 flex items-center gap-4">
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => move(entry.id, "up")} disabled={idx === 0}
                    className={`text-[10px] leading-none ${idx === 0 ? "text-black/10" : "text-black/30 hover:text-black"} transition-colors`}>▲</button>
                  <button onClick={() => move(entry.id, "down")} disabled={idx === entries.length - 1}
                    className={`text-[10px] leading-none ${idx === entries.length - 1 ? "text-black/10" : "text-black/30 hover:text-black"} transition-colors`}>▼</button>
                </div>
                {entry.image_url && (
                  <img src={entry.image_url} alt="" className="w-12 h-14 object-cover bg-[#f1f1f1] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {entry.category && (
                      <span className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>{entry.category}</span>
                    )}
                  </div>
                  <p className={`${mono} text-black font-semibold truncate`}>{entry.title}</p>
                  {entry.date && <p className={`${mono} text-black/50 text-[12px]`}>{entry.date}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editEntry(entry)}
                    className={`${mono} text-[11px] px-2 py-1 border border-black/20 text-black/50 hover:border-black/60 transition-colors`}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(entry.id)}
                    className={`${mono} text-[11px] px-2 py-1 border border-red-200 text-red-500 hover:bg-red-50 transition-colors`}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
