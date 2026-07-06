import { useEffect, useState } from "react"
import { Link } from "react-router"
import { requireSupabase } from "@/lib/supabase"
import type { AuthSession } from "@supabase/supabase-js"

type Recommendation = {
  id: number
  type: string
  title: string
  artist_director: string | null
  link: string | null
  message: string | null
  sender_name: string | null
  status: string
  created_at: string
}

const STATUS_ORDER = ["unread", "read", "queued", "dismissed"]

const mono = "font-['Intel_One_Mono',monospace] font-normal text-[13px]"

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
      const { error } = await sb.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-black/10 p-8 w-full max-w-[400px]"
      >
        <h1 className="font-['Instrument_Serif',serif] text-[32px] mb-6 text-black">
          MORPHEUS INBOX
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className={`${mono} w-full border-b border-black/30 pb-2 outline-none bg-transparent text-black placeholder:text-[#8e8e8e]`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={`${mono} w-full border-b border-black/30 pb-2 outline-none bg-transparent text-black placeholder:text-[#8e8e8e]`}
          />

          {error && (
            <p className={`${mono} text-[12px] text-red-600`}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${mono} w-full bg-black text-white py-3 hover:bg-black/85 disabled:opacity-50 transition-opacity tracking-widest mt-2`}
          >
            {loading ? "..." : "SIGN IN"}
          </button>

          <Link
            to="/"
            className={`${mono} text-black/50 hover:text-black transition-colors text-center text-[12px]`}
          >
            ← Back to archive
          </Link>
        </div>
      </form>
    </div>
  )
}

export function Inbox() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [rows, setRows] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")

  useEffect(() => {
    const sb = requireSupabase()
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchRows()
      else setLoading(false)
    })
  }, [])

  async function fetchRows() {
    setLoading(true)
    setError("")
    try {
      const sb = requireSupabase()
      let query = sb
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false })

      if (filterStatus) query = query.eq("status", filterStatus)
      if (filterType) query = query.eq("type", filterType)

      const { data, error } = await query
      if (error) throw error
      setRows((data || []) as Recommendation[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    }
    setLoading(false)
  }

  async function updateStatus(id: number, status: string) {
    try {
      const sb = requireSupabase()
      const { error } = await sb
        .from("recommendations")
        .update({ status })
        .eq("id", id)
      if (error) throw error
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    }
  }

  async function handleSignOut() {
    const sb = requireSupabase()
    await sb.auth.signOut()
    setSession(null)
    setRows([])
  }

  if (!session) {
    return <LoginForm onLogin={() => window.location.reload()} />
  }

  const filteredRows = rows.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false
    if (filterType && r.type !== filterType) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="max-w-[960px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Instrument_Serif',serif] text-[38px] text-black">
              INBOX
            </h1>
            <p className={`${mono} opacity-50 text-black`}>
              {rows.length} recommendation{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/"
              className={`${mono} text-[12px] text-black/50 hover:text-black transition-colors`}
            >
              ← Archive
            </Link>
            <Link
              to="/edit-archive"
              className={`${mono} text-[12px] px-3 py-1 border border-black/20 hover:bg-black/5 transition-colors`}
            >
              Edit Archive
            </Link>
            <button
              onClick={handleSignOut}
              className={`${mono} text-[12px] text-black/50 hover:text-black transition-colors`}
            >
              Sign out
            </button>
            <button
              onClick={fetchRows}
              className={`${mono} text-[12px] px-3 py-1 border border-black/20 hover:bg-black/5 transition-colors`}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <p className={`${mono} text-red-600 text-[12px] mb-4`}>{error}</p>
        )}

        <div className="flex gap-3 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${mono} border border-black/20 px-3 py-1.5 bg-white text-black text-[12px]`}
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`${mono} border border-black/20 px-3 py-1.5 bg-white text-black text-[12px]`}
          >
            <option value="">All types</option>
            {["song", "album", "film", "book", "show", "other"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className={`${mono} text-black/50`}>Loading...</p>
        ) : rows.length === 0 ? (
          <div className="border border-black/10 bg-white p-8 text-center">
            <p className={`${mono} text-black/50`}>No recommendations yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredRows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-black/10 px-5 py-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${mono} text-[11px] uppercase tracking-wider text-black/40`}>
                        {r.type}
                      </span>
                      <span className={`${mono} text-[11px] text-black/30`}>
                        [{r.status}]
                      </span>
                    </div>
                    <p className={`${mono} text-black font-semibold truncate`}>
                      {r.title}
                    </p>
                    {r.artist_director && (
                      <p className={`${mono} text-black/60 text-[12px]`}>
                        {r.artist_director}
                      </p>
                    )}
                    {r.sender_name && (
                      <p className={`${mono} text-black/40 text-[11px] mt-1`}>
                        from {r.sender_name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(r.id, s)}
                        className={`${mono} text-[10px] uppercase tracking-wider px-2 py-1 border transition-colors ${
                          r.status === s
                            ? "bg-black text-white border-black"
                            : "border-black/20 text-black/40 hover:border-black/60"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {r.message && (
                  <p className={`${mono} text-black/50 text-[12px] border-t border-black/5 pt-2 mt-1`}>
                    {r.message}
                  </p>
                )}
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${mono} text-[11px] text-blue-700 hover:underline truncate`}
                  >
                    {r.link}
                  </a>
                )}
                <p className={`${mono} text-[10px] text-black/30`}>
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
