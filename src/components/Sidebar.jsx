import {
  Award,
  LayoutDashboard,
  FileBadge,
  Users,
  Settings,
  X,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Certificate Studio", icon: FileBadge },
  { label: "Participants", icon: Users },
];

export default function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Award size={23} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Certify<span className="text-violet-600">Hub</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Certificate Platform
              </p>
            </div>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActivePage(item.label);
                    setIsOpen(false);
                  }}
                  className={`
                    flex w-full items-center gap-3 rounded-xl
                    px-4 py-3 text-left text-sm font-semibold
                    transition-all
                    ${
                      active
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white">
            <Sparkles size={24} className="mb-3" />

            <h3 className="font-bold">Create something great</h3>

            <p className="mt-2 text-xs leading-relaxed text-violet-100">
              Generate beautiful certificates for your events in seconds.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-slate-400">
            <Settings size={17} />
            <span>Practice Version 1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}