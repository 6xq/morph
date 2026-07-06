import { useState, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { Divider } from "@/components/ui/Divider"
import { requireSupabase } from "@/lib/supabase"

const TYPE_OPTIONS = [
  { label: "Song", value: "song" },
  { label: "Album", value: "album" },
  { label: "Film", value: "film" },
  { label: "Book", value: "book" },
  { label: "Show", value: "show" },
  { label: "Other", value: "other" },
]

export function SendForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("")
  const [typeOpen, setTypeOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [artistDirector, setArtistDirector] = useState("")
  const [link, setLink] = useState("")
  const [message, setMessage] = useState("")
  const [senderName, setSenderName] = useState("")

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formRenderedAt, setFormRenderedAt] = useState(0)

  useEffect(() => {
    setFormRenderedAt(Date.now())
  }, [])

  const mono = "font-['Intel_One_Mono',monospace] font-normal text-[13px]"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!type) {
      setError("Please select a type.")
      return
    }
    if (!title.trim()) {
      setError("Title is required.")
      return
    }
    if (title.trim().length > 200) {
      setError("Title must be 200 characters or fewer.")
      return
    }
    if (link) {
      try {
        const url = new URL(link)
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          setError("Link must start with http:// or https://")
          return
        }
      } catch {
        setError("Link is not a valid URL.")
        return
      }
    }

    setSubmitting(true)

    try {
      const { error } = await requireSupabase().from("recommendations").insert({
        type,
        title: title.trim(),
        artist_director: artistDirector.trim() || null,
        link: link.trim() || null,
        message: message.trim() || null,
        sender_name: senderName.trim() || null,
        website_url_confirm: "",
        form_rendered_at: String(formRenderedAt),
      })

      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send. Try again.")
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
    setType("")
    setTitle("")
    setArtistDirector("")
    setLink("")
    setMessage("")
    setSenderName("")
    setFormRenderedAt(Date.now())
  }

  if (submitted) {
    return (
      <div className="bg-[#f9f9f9] w-full max-w-[575px] px-8 py-10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/40 hover:text-black transition-opacity"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col gap-4 items-center justify-center min-h-[200px]">
          <h2 className="font-['Instrument_Serif',serif] text-[38px] leading-none text-black not-italic">
            SENT — THANKS
          </h2>
          <p className={`${mono} opacity-50 text-black text-center max-w-[320px]`}>
            Your recommendation has been sent. Morpheus will see it.
          </p>
          <button
            onClick={onClose}
            className={`${mono} mt-4 w-full max-w-[200px] bg-black text-white py-3 hover:bg-black/85 transition-colors tracking-widest`}
          >
            CLOSE
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f9f9f9] w-full max-w-[575px] px-8 py-10 relative"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-black/40 hover:text-black transition-opacity"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col gap-2 mb-9">
        <h2 className="font-['Instrument_Serif',serif] text-[38px] leading-none text-black not-italic">
          SEND SOMETHING
        </h2>
        <p className={`${mono} opacity-50 text-black`}>Send anything worth keeping.</p>
      </div>

      {/* ── Honeypot — off-screen, hidden from real users ── */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label htmlFor="website_url_confirm">Website</label>
        <input
          id="website_url_confirm"
          name="website_url_confirm"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value=""
          readOnly
        />
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Type ── */}
        <div className="flex flex-col gap-2">
          <label className={`${mono} text-black`}>TYPE</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTypeOpen(!typeOpen)}
              className={`${mono} text-black w-full flex items-center justify-between pb-2`}
            >
              <span className={type ? "text-black" : "text-black/60"}>
                {type ? TYPE_OPTIONS.find((o) => o.value === type)?.label : "Choose..."}
              </span>
              <ChevronDown size={16} className="text-[#8e8e8e]" />
            </button>
            <Divider />
            {typeOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-black/10 z-10 shadow-sm">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      setType(opt.value)
                      setTypeOpen(false)
                    }}
                    className={`${mono} w-full text-left px-3 py-2 hover:bg-[#f1f1f1] transition-colors text-black`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Title ── */}
        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>TITLE</p>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Song title, Album, Film..."
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        {/* ── Artist / Director ── */}
        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>ARTIST / DIRECTOR (OPTIONAL)</p>
          </div>
          <input
            type="text"
            value={artistDirector}
            onChange={(e) => setArtistDirector(e.target.value)}
            placeholder="e.g. Artist, Director, Band..."
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        {/* ── Link ── */}
        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>LINK (OPTIONAL)</p>
          </div>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        {/* ── Message ── */}
        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>MESSAGE (OPTIONAL)</p>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something..."
            rows={4}
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e] resize-none`}
          />
        </div>

        {/* ── Sender Name (new optional field) ── */}
        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>YOUR NAME (OPTIONAL)</p>
          </div>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Alex, Jordan..."
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        {/* ── Error message ── */}
        {error && (
          <p className={`${mono} text-red-600 text-[12px]`}>{error}</p>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={submitting}
          className={`${mono} w-full bg-black text-white py-3 hover:bg-black/85 disabled:opacity-50 transition-opacity tracking-widest`}
        >
          {submitting ? "SENDING..." : "SEND"}
        </button>
      </div>
    </form>
  )
}
