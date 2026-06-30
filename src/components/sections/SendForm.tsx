import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Divider } from "@/components/ui/Divider"

const TYPE_OPTIONS = ["Music", "Film", "Book", "Album", "Other"]

export function SendForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("")
  const [typeOpen, setTypeOpen] = useState(false)

  const mono = "font-['Intel_One_Mono',monospace] font-normal text-[13px]"

  return (
    <div className="bg-[#f9f9f9] w-full max-w-[575px] px-8 py-10 relative">
      <button
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

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className={`${mono} text-black`}>TYPE</label>
          <div className="relative">
            <button
              onClick={() => setTypeOpen(!typeOpen)}
              className={`${mono} text-black w-full flex items-center justify-between pb-2`}
            >
              <span className={type ? "text-black" : "text-black/60"}>
                {type || "Choose..."}
              </span>
              <ChevronDown size={16} className="text-[#8e8e8e]" />
            </button>
            <Divider />
            {typeOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-black/10 z-10 shadow-sm">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setType(opt); setTypeOpen(false) }}
                    className={`${mono} w-full text-left px-3 py-2 hover:bg-[#f1f1f1] transition-colors text-black`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>TITLE</p>
          </div>
          <input
            type="text"
            placeholder="e.g. Song title, Album, Film..."
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>ARTIST / DIRECTOR (OPTIONAL)</p>
          </div>
          <input
            type="text"
            placeholder="e.g. Artist, Director, Band..."
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>LINK (OPTIONAL)</p>
          </div>
          <input
            type="url"
            placeholder="https://"
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e]`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className={`${mono} text-black`}>
            <p>MESSAGE (OPTIONAL)</p>
          </div>
          <textarea
            placeholder="Write something..."
            rows={4}
            className={`${mono} w-full bg-transparent outline-none border-b border-black/30 pb-2 text-black placeholder:text-[#8e8e8e] resize-none`}
          />
        </div>

        <button className={`${mono} w-full bg-black text-white py-3 hover:bg-black/85 transition-colors tracking-widest`}>
          SEND
        </button>
      </div>
    </div>
  )
}
