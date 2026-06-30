export function Header() {
  return (
    <header className="px-6 sm:px-12 pt-8 sm:pt-10 pb-6 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
      <h1 className="font-['Instrument_Serif',serif] text-[32px] sm:text-[38px] leading-none text-black not-italic">
        MORPHEUS (ARCHIVE)*
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
        <p className="text-[11px] text-black/50 max-w-[300px] leading-relaxed font-light font-['Intel_One_Mono',monospace]">
          The Archive (Morpheus)
          <br />A space where fragments of taste, memory, and obsession coexist
        </p>
        <p className="text-[11px] text-black/50 max-w-[220px] leading-relaxed font-light font-['Intel_One_Mono',monospace]">
          My personal corner on the internet, a place for anything that felt worth keeping
        </p>
      </div>
    </header>
  )
}
