import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Award,
} from "lucide-react";

import { drawCertificate } from "../utils/certificateUtils";

export default function CertificatePreview({
  template,
  participants,
  selectedIndex,
  setSelectedIndex,
  settings,
}) {
  const canvasRef = useRef(null);
  const [previewError, setPreviewError] = useState("");

  const participant = participants[selectedIndex];

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;

      try {
        await drawCertificate({
          canvas: canvasRef.current,
          template,
          name: participant?.name || "Your Name Here",
          settings,
        });

        if (!cancelled) setPreviewError("");
      } catch (error) {
        if (!cancelled) {
          setPreviewError(error.message);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [template, participant?.name, settings]);

  const previous = () => {
    setSelectedIndex((current) =>
      Math.max(current - 1, 0)
    );
  };

  const next = () => {
    setSelectedIndex((current) =>
      Math.min(current + 1, participants.length - 1)
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Award size={19} className="text-violet-600" />
          <h3 className="font-bold">Live Certificate Preview</h3>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <ZoomIn size={14} />
          Live Preview
        </div>
      </div>

      <div className="bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-md bg-white shadow-xl">
          <canvas
            ref={canvasRef}
            width={1000}
            height={707}
            className="block h-auto w-full"
          />
        </div>

        {previewError && (
          <p className="mt-3 text-center text-sm text-red-600">
            {previewError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {participant?.name || "Sample Certificate"}
          </p>

          <p className="text-xs text-slate-400">
            {participants.length
              ? `Certificate ${selectedIndex + 1} of ${participants.length}`
              : "Upload an Excel file to preview participants"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={previous}
            disabled={!participants.length || selectedIndex === 0}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Previous participant"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={next}
            disabled={
              !participants.length ||
              selectedIndex === participants.length - 1
            }
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Next participant"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}