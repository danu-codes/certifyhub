import { Menu, Bell, CircleHelp } from "lucide-react";

export default function Header({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs text-slate-400">Workspace / CertifyHub</p>
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Browser Mode
        </div>

        <span title="Help">
          <CircleHelp
            size={20}
            className="hidden text-slate-400 sm:block"
          />
        </span>

        <span title="Notifications">
          <Bell size={20} className="text-slate-400" />
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
          CH
        </div>
      </div>
    </header>
  );
}