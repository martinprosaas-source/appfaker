interface StatusBarProps {
  time: string;
  battery: number;
}

export default function StatusBar({ time, battery }: StatusBarProps) {
  const batteryFillWidth = Math.max(2, Math.round((battery / 100) * 18));

  return (
    <div className="flex items-center justify-between px-6 pt-2 pb-1 text-[15px] font-semibold text-black select-none">
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.8" fill="black" />
          <rect x="5" y="5" width="3" height="7" rx="0.8" fill="black" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" fill="black" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill="black" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.5a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"
            fill="black"
          />
          <path
            d="M5.1 7.4a4.1 4.1 0 0 1 5.8 0l-1.1 1.1a2.5 2.5 0 0 0-3.6 0L5.1 7.4Z"
            fill="black"
          />
          <path
            d="M2.6 4.9a7.6 7.6 0 0 1 10.8 0l-1.1 1.1a6 6 0 0 0-8.6 0L2.6 4.9Z"
            fill="black"
          />
        </svg>
        {/* battery */}
        <div className="flex items-center">
          <div className="relative w-[24px] h-[12px] rounded-[3.5px] border border-black/90 flex items-center px-[1.5px]">
            <div
              className="h-[8px] rounded-[1.5px] bg-black"
              style={{ width: `${batteryFillWidth}px` }}
            />
          </div>
          <div className="w-[1.5px] h-[4px] bg-black/90 rounded-r ml-[1px]" />
        </div>
      </div>
    </div>
  );
}
