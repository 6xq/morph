export function Footer({ onSendClick }: { onSendClick: () => void }) {
  return (
    <footer className="px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 border-t border-black/10">
      <p className="text-[13px] text-black/50 font-['Intel_One_Mono',monospace]">Last updated 06.10.2026</p>
      <button
        onClick={onSendClick}
        className="text-[13px] text-[#7d7d7d] underline underline-offset-2 hover:text-black transition-colors font-['Intel_One_Mono',monospace]"
      >
        Send a message / recommendation
      </button>
    </footer>
  )
}
