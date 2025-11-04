import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn-ui/tabs";

import TemplateEditor from "./TemplateEditor.jsx";

export default function SummarySidebar({
  summary,
  templateYaml,
  onTemplateChange,
  onTemplateSave,
  templateIsSaving,
  nerData,
}) {
  return (
    <aside className="w-[420px] border-l border-slate-800 bg-slate-950">
      <Tabs defaultValue="summary" className="flex h-full flex-col">
        <TabsList className="grid grid-cols-3 bg-slate-900">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="template">Template YAML</TabsTrigger>
          <TabsTrigger value="ner">NER View</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="flex-1 overflow-auto p-4">
          <article className="prose prose-invert max-w-none whitespace-pre-wrap">
            {summary || "No summary generated yet."}
          </article>
        </TabsContent>
        <TabsContent value="template" className="flex-1 overflow-auto p-4">
          <TemplateEditor
            value={templateYaml}
            onChange={onTemplateChange}
            onSave={onTemplateSave}
            saving={templateIsSaving}
          />
        </TabsContent>
        <TabsContent value="ner" className="flex-1 overflow-auto p-4">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-emerald-200">
            {JSON.stringify(nerData ?? {}, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
