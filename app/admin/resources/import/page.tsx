"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const COLUMNS = [
  "title", "subject", "medium", "category", "year", "term",
  "fileUrl", "fileKey", "fileType", "fileSize", "tags",
  "description", "slug", "isActive", "isFeatured", "seoTitle", "seoDescription",
];

const REQUIRED_COLS = ["title", "subject", "medium", "category", "fileUrl", "fileKey"];

type ParsedRow = { [key: string]: string | number | undefined; _rowNum: number; _error?: string };

type ImportResult = {
  row: number;
  success: boolean;
  slug?: string;
  error?: string;
};

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };

  const splitLine = (line: string) => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });

  return { headers, rows };
}

function validateRow(row: Record<string, string>): string | null {
  for (const col of REQUIRED_COLS) {
    if (!row[col]?.trim()) return `Missing required field: ${col}`;
  }
  const medium = row.medium?.toLowerCase();
  if (!["sinhala", "tamil", "english"].includes(medium)) {
    return `Invalid medium "${row.medium}" (must be sinhala, tamil or english)`;
  }
  if (row.year && isNaN(parseInt(row.year))) return "year must be a number";
  if (row.fileSize && isNaN(parseInt(row.fileSize))) return "fileSize must be a number";
  return null;
}

const TEMPLATE_CSV = `title,subject,medium,category,year,term,fileUrl,fileKey,fileType,fileSize,tags,description,isActive,isFeatured
Accounting Past Paper 2023,accounting,sinhala,past-papers,2023,,https://example.com/file.pdf,resources/file.pdf,pdf,1024000,accounting|past-paper|2023,A/L Accounting Past Paper 2023,true,false
`;

export default function ImportResourcesPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      setHeaders(h);
      const parsed: ParsedRow[] = r.map((row, i) => ({
        ...row,
        _rowNum: i + 1,
        _error: validateRow(row) || undefined,
      }));
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const validRows = rows.filter((r) => !r._error);
  const invalidRows = rows.filter((r) => r._error);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const payload = validRows.map(({ _rowNum, _error, ...rest }) => {
        void _rowNum; void _error;
        return rest;
      });
      const res = await fetch("/api/admin/resources/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
      setStep("done");
      toast.success(`Imported ${data.created} resources${data.failed > 0 ? `, ${data.failed} failed` : ""}!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setRows([]); setHeaders([]); setFileName("");
    setResults(null); setStep("upload");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/resources" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import Resources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload a CSV file to create multiple resources at once</p>
        </div>
      </div>

      {step === "upload" && (
        <div className="space-y-5">
          {/* Template download */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Step 1 — Download the template</h2>
            <p className="text-sm text-gray-500 mb-4">
              Use the template to prepare your CSV. Required columns: <span className="font-medium text-gray-700">{REQUIRED_COLS.join(", ")}</span>.
              Tags must be separated with a pipe <code className="bg-gray-100 px-1 rounded">|</code> character.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="text-xs text-gray-500 border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {COLUMNS.map((c) => (
                      <th key={c} className={`px-2 py-1.5 border border-gray-200 font-semibold text-left whitespace-nowrap ${REQUIRED_COLS.includes(c) ? "text-blue-700" : ""}`}>
                        {c}{REQUIRED_COLS.includes(c) ? " *" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {COLUMNS.map((c) => (
                      <td key={c} className="px-2 py-1.5 border border-gray-200 text-gray-400 italic whitespace-nowrap">
                        {c === "title" ? "Accounting Past Paper 2023" :
                         c === "subject" ? "accounting" :
                         c === "medium" ? "sinhala" :
                         c === "category" ? "past-papers" :
                         c === "year" ? "2023" :
                         c === "fileUrl" ? "https://..." :
                         c === "fileKey" ? "resources/..." :
                         c === "tags" ? "accounting|past-paper" :
                         c === "isActive" ? "true" :
                         ""}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "commerce-lk-import-template.csv";
                a.click(); URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          {/* File upload */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Step 2 — Upload your CSV</h2>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Click to upload CSV file</p>
              <p className="text-xs text-gray-400 mt-1">UTF-8 encoded, comma-separated</p>
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-5">
          {/* Summary bar */}
          <div className="card p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {rows.length} rows parsed — <span className="text-green-600 font-medium">{validRows.length} valid</span>
                {invalidRows.length > 0 && <span className="text-red-500 font-medium ml-1">· {invalidRows.length} with errors</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Start Over
              </button>
              <button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="btn-primary py-2 px-5 text-sm disabled:opacity-50"
              >
                {importing ? "Importing…" : `Import ${validRows.length} Resources`}
              </button>
            </div>
          </div>

          {/* Errors first */}
          {invalidRows.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-700">{invalidRows.length} rows with errors (will be skipped)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Row</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invalidRows.map((r) => (
                      <tr key={r._rowNum} className="bg-red-50/50">
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{r._rowNum}</td>
                        <td className="px-4 py-2.5 text-gray-700 max-w-[200px] truncate">{r.title || "—"}</td>
                        <td className="px-4 py-2.5 text-red-600 text-xs">{r._error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valid rows preview */}
          {validRows.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-green-700">{validRows.length} rows ready to import</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Medium</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Year</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {validRows.slice(0, 100).map((r) => (
                      <tr key={r._rowNum} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{r._rowNum}</td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium max-w-[240px] truncate">{r.title}</td>
                        <td className="px-4 py-2.5 text-gray-600">{r.subject}</td>
                        <td className="px-4 py-2.5">
                          <span className="badge bg-gray-100 text-gray-600 capitalize">{r.medium}</span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{r.category}</td>
                        <td className="px-4 py-2.5 text-gray-500">{r.year || "—"}</td>
                        <td className="px-4 py-2.5">
                          <span className={`badge ${r.isActive !== "false" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {r.isActive !== "false" ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validRows.length > 100 && (
                  <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
                    Showing 100 of {validRows.length} rows
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "done" && results && (
        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Import complete</h2>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-semibold">{results.filter(r => r.success).length} created</span>
                  {results.filter(r => !r.success).length > 0 && (
                    <span className="text-red-500 font-semibold ml-2">· {results.filter(r => !r.success).length} failed</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/resources" className="btn-primary py-2 px-5 text-sm">
                View Resources
              </Link>
              <button onClick={reset} className="btn-ghost border border-gray-200 py-2 px-5 text-sm">
                Import More
              </button>
            </div>
          </div>

          {results.filter(r => !r.success).length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                <h3 className="font-semibold text-red-700">Failed rows</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Row</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.filter(r => !r.success).map((r) => (
                      <tr key={r.row} className="bg-red-50/50">
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{r.row}</td>
                        <td className="px-4 py-2.5 text-red-600 text-xs">{r.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
