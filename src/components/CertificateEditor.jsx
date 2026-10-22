import {
  Type,
  Palette,
  Move,
  RotateCcw,
} from "lucide-react";

import {
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
} from "../utils/certificateUtils";

export default function CertificateEditor({
  settings,
  setSettings,
}) {
  const update = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={20} className="text-violet-600" />
          <h3 className="font-bold">Customize Certificate</h3>
        </div>

        <button
          onClick={() => setSettings({ ...DEFAULT_SETTINGS })}
          className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Type size={16} />
            Font Family
          </label>

          <select
            value={settings.fontFamily}
            onChange={(e) =>
              update("fontFamily", e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Font Weight
          </label>

          <select
            value={settings.fontWeight}
            onChange={(e) =>
              update("fontWeight", e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
          </select>
        </div>

        <div>
          <div className="mb-3 flex justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Font Size
            </label>

            <span className="text-sm font-semibold text-violet-600">
              {settings.fontSize}px
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="90"
            value={settings.fontSize}
            onChange={(e) =>
              update("fontSize", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Text Color
          </label>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.color}
              onChange={(e) =>
                update("color", e.target.value)
              }
              className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            />

            <input
              type="text"
              value={settings.color}
              onChange={(e) => {
                const value = e.target.value;

                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                  update("color", value);
                }
              }}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="#24315a"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="mb-5 flex items-center gap-2">
            <Move size={18} className="text-violet-600" />
            <h4 className="font-semibold">Name Position</h4>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Horizontal Position
                </span>
                <span className="font-semibold">
                  {settings.x}%
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="90"
                value={settings.x}
                onChange={(e) =>
                  update("x", Number(e.target.value))
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Vertical Position
                </span>
                <span className="font-semibold">
                  {settings.y}%
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="90"
                value={settings.y}
                onChange={(e) =>
                  update("y", Number(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}