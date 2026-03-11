export default function Card({ title, tone = 'primary', children }) {
  const tones = {
    primary: 'bg-[#1C66B8]',
    purple: 'bg-[#4C4ACF]',
    teal: 'bg-[#0F8F7D]',
    green: 'bg-[#1C8F3A]',
    dark: 'bg-[#0E3F91]',
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className={`${tones[tone] ?? tones.primary} px-5 py-4 text-white`}>
        <div className="text-sm font-bold tracking-wide">{title}</div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
