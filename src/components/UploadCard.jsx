import {
  UploadCloud,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  X,
} from "lucide-react";

export default function UploadCard({
  title,
  description,
  type,
  file,
  onChange,
  onRemove,
}) {
  const isExcel = type === "excel";

  const Icon = isExcel ? FileSpreadsheet : ImageIcon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div
          className={`rounded-xl p-3 ${
            isExcel
              ? "bg-emerald-50 text-emerald-600"
              : "bg-violet-50 text-violet-600"
          }`}
        >
          <Icon size={22} />
        </div>

        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-violet-400 hover:bg-violet-50/40">
        <UploadCloud
          size={28}
          className="mb-3 text-slate-400"
        />

        <p className="text-sm font-semibold text-slate-700">
          Click to upload file
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {isExcel ? "XLSX, XLS or CSV" : "PNG or JPG"}
        </p>

        <input
          type="file"
          className="hidden"
          accept={
            isExcel
              ? ".xlsx,.xls,.csv"
              : ".png,.jpg,.jpeg,image/png,image/jpeg"
          }
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];

            if (selectedFile) {
              onChange(selectedFile);
            }

            e.target.value = "";
          }}
        />
      </label>

      {file && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <CheckCircle2
              size={18}
              className="shrink-0 text-emerald-600"
            />

            <span className="truncate text-sm font-medium text-emerald-800">
              {file.name}
            </span>
          </div>

          <button
            onClick={onRemove}
            className="shrink-0 text-emerald-700 hover:text-red-600"
            aria-label={`Remove ${title}`}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}