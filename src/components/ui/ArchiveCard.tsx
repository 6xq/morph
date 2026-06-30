export function ArchiveCard({ title, date, img }: { title: string; date: string; img: string }) {
  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
      <div className="bg-[#f1f1f1] w-full aspect-[320/380] flex items-center justify-center relative overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-[60%] h-[66%] object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="font-['Intel_One_Mono',monospace] text-[13px] leading-snug">
        <p className="text-black font-normal">{title}</p>
        <p className="text-[#8e8e8e] font-normal">{date}</p>
      </div>
    </div>
  )
}
