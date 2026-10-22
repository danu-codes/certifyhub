import { useState, useEffect } from "react";

import {
  Award,
  Users,
  FileSpreadsheet,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import UploadCard from "../components/UploadCard";
import CertificatePreview from "../components/CertificatePreview";
import CertificateEditor from "../components/CertificateEditor";
import ParticipantList from "../components/ParticipantList";

import { readExcelFile } from "../utils/excelUtils";

import {
  DEFAULT_SETTINGS,
  downloadSingleCertificate,
  downloadAllCertificates,
} from "../utils/certificateUtils";

export default function Dashboard({ activePage }) {
  const [templateFile, setTemplateFile] = useState(null);
  const [template, setTemplate] = useState(null);

  const [excelFile, setExcelFile] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Release uploaded image URLs when replaced or removed.
  useEffect(() => {
    return () => {
      if (template) URL.revokeObjectURL(template);
    };
  }, [template]);

  const handleTemplateUpload = (file) => {
    setError("");
    setMessage("");

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Please upload a PNG or JPG certificate template.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Template image must be smaller than 10 MB.");
      return;
    }

    const url = URL.createObjectURL(file);

    setTemplateFile(file);
    setTemplate(url);
    setMessage("Certificate template uploaded successfully.");
  };

  const handleExcelUpload = async (file) => {
    setError("");
    setMessage("");

    try {
      const data = await readExcelFile(file);

      setParticipants(data);
      setExcelFile(file);
      setSelectedIndex(0);

      setMessage(
        `${data.length} participants imported successfully.`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSingleDownload = async () => {
    const participant = participants[selectedIndex];

    if (!participant || !participant.name.trim()) {
      setError("Please select a participant with a valid name.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await downloadSingleCertificate({
        template,
        participant,
        settings,
      });

      setMessage("Certificate downloaded successfully.");
    } catch (err) {
      setError(err.message || "Failed to generate certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (!participants.length) {
      setError("Please upload an Excel file or add participants.");
      return;
    }

    if (participants.some((person) => !person.name.trim())) {
      setError("Please fill in all participant names before generating.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError("");
    setMessage("");

    try {
      await downloadAllCertificates({
        template,
        participants,
        settings,
        onProgress: setProgress,
      });

      setMessage(
        `${participants.length} certificates generated successfully.`
      );
    } catch (err) {
      setError(err.message || "Failed to generate certificates.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Participants",
      value: participants.length,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Certificate Template",
      value: templateFile ? "Custom" : "Default",
      icon: Award,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Excel Status",
      value: excelFile ? "Uploaded" : "Not Uploaded",
      icon: FileSpreadsheet,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
      {/* Welcome */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
            <Sparkles size={14} />
            Certificate Automation Studio
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {activePage === "Participants"
              ? "Manage Participants"
              : activePage === "Certificate Studio"
              ? "Certificate Studio"
              : "Create Beautiful Certificates"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Upload your certificate design and participant list,
            customize the names, and generate professional PDF
            certificates instantly.
          </p>
        </div>

        <button
          onClick={handleBulkDownload}
          disabled={loading || !participants.length}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}

          {loading ? `Generating ${progress}%` : "Generate All"}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          {message}
          <button
            className="ml-auto font-bold"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {error}
          <button
            className="ml-auto font-bold"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard Statistics */}
      {activePage === "Dashboard" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={23} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Files */}
      {activePage !== "Participants" && (
        <>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                1
              </span>

              <h2 className="text-lg font-bold">
                Upload Your Files
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <UploadCard
                title="Certificate Template"
                description="Upload your certificate background design."
                type="image"
                file={templateFile}
                onChange={handleTemplateUpload}
                onRemove={() => {
                  setTemplate(null);
                  setTemplateFile(null);
                }}
              />

              <UploadCard
                title="Participant List"
                description="Import eligible participant names from Excel."
                type="excel"
                file={excelFile}
                onChange={handleExcelUpload}
                onRemove={() => {
                  setExcelFile(null);
                  setParticipants([]);
                  setSelectedIndex(0);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Editor */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
            2
          </span>

          <h2 className="text-lg font-bold">
            {activePage === "Participants"
              ? "Participant Management"
              : "Customize & Preview"}
          </h2>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-6">
            {activePage !== "Participants" && (
              <CertificatePreview
                template={template}
                participants={participants}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                settings={settings}
              />
            )}

            <ParticipantList
              participants={participants}
              setParticipants={setParticipants}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
          </div>

          <div className="space-y-5">
            <CertificateEditor
              settings={settings}
              setSettings={setSettings}
            />

            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <h3 className="font-bold text-slate-900">
                Ready to Generate?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Preview your certificate and download a single
                PDF or generate all certificates as a ZIP file.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  onClick={handleSingleDownload}
                  disabled={loading || !participants.length}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                >
                  <Download size={17} />
                  Download Current PDF
                </button>

                <button
                  onClick={handleBulkDownload}
                  disabled={loading || !participants.length}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  <Download size={17} />
                  Download All as ZIP
                  <ArrowRight size={16} />
                </button>
              </div>

              {loading && (
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-violet-700">
                    <span>Generating certificates...</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-violet-200">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CertifyHub.
        Built for smarter certificate generation.
      </footer>
    </div>
  );
}