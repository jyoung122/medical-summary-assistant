import React from "react";
import Editor from "@monaco-editor/react";

export default function TemplateEditor({ value, onChange, onSave, saving }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden rounded-lg border border-slate-800">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          theme="vs-dark"
          value={value}
          onChange={(next) => onChange?.(next ?? "")}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </div>
  );
}
