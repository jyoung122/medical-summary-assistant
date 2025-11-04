import React, { useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import yaml from "js-yaml";

import ChatInterface from "./components/ChatInterface.jsx";
import SummarySidebar from "./components/SummarySidebar.jsx";

const queryClient = new QueryClient();

async function invokeSummarize(payload) {
  if (window?.electron?.ipcRenderer) {
    return window.electron.ipcRenderer.invoke("summarize", payload);
  }
  if (window?.require) {
    try {
      const { ipcRenderer } = window.require("electron");
      if (ipcRenderer) {
        return ipcRenderer.invoke("summarize", payload);
      }
    } catch (error) {
      console.warn("IPC renderer unavailable, falling back to fetch", error);
    }
  }

  const response = await fetch("http://localhost:8001/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Summarization request failed");
  }
  return response.json();
}

function TemplateManager({ selectedTemplate }) {
  const client = useQueryClient();
  const [summary, setSummary] = useState("");
  const [ner, setNer] = useState({});
  const [templateYaml, setTemplateYaml] = useState("");

  const { data: templateData } = useQuery({
    queryKey: ["template", selectedTemplate],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8001/template/${selectedTemplate}`);
      if (!response.ok) {
        throw new Error("Unable to load template");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (templateData) {
      setTemplateYaml(yaml.dump(templateData, { noRefs: true }));
    }
  }, [templateData]);

  const summarizeMutation = useMutation({
    mutationFn: (text) => invokeSummarize({ text, template_name: selectedTemplate }),
    onSuccess: (data) => {
      setSummary(data.summary ?? "");
      setNer(data.ner ?? {});
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (nextYaml) => {
      const parsed = yaml.load(nextYaml);
      const response = await fetch("http://localhost:8001/template/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedTemplate, data: parsed }),
      });
      if (!response.ok) {
        throw new Error("Failed to save template");
      }
      return response.json();
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["template", selectedTemplate] });
    },
  });

  const handleSummarize = async (text) => {
    await summarizeMutation.mutateAsync(text);
  };

  const handleTemplateSave = async () => {
    await saveTemplateMutation.mutateAsync(templateYaml);
  };

  const templatePreview = useMemo(() => templateYaml, [templateYaml]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <div className="flex flex-1 flex-col border-r border-slate-800">
        <ChatInterface
          loading={summarizeMutation.isPending}
          onSubmit={handleSummarize}
          onUploadPdf={(file) => console.debug("PDF upload placeholder", file?.name)}
          summary={summary}
        />
      </div>
      <SummarySidebar
        summary={summary}
        templateYaml={templatePreview}
        onTemplateChange={setTemplateYaml}
        onTemplateSave={handleTemplateSave}
        nerData={ner}
        templateIsSaving={saveTemplateMutation.isPending}
      />
    </div>
  );
}

function AppShell() {
  const [selectedTemplate] = useState("discharge_summary");
  return <TemplateManager selectedTemplate={selectedTemplate} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
