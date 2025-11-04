import React, { useEffect, useMemo, useState } from "react";
import { ChatContainer, PromptInput } from "prompt-kit";

function MessageBubble({ author, content }) {
  const isUser = author === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl rounded-xl px-4 py-2 text-sm shadow ${
          isUser ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default function ChatInterface({ loading, onSubmit, onUploadPdf, summary }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      author: "assistant",
      content: "Upload a PDF or paste clinician notes to generate a structured discharge summary.",
    },
  ]);

  const fileInputId = useMemo(() => `pdf-upload-${Math.random().toString(36).slice(2)}`, []);

  useEffect(() => {
    if (!summary) return;
    setMessages((prev) => [
      ...prev.filter((message) => message.id !== "latest-summary"),
      { id: "latest-summary", author: "assistant", content: summary },
    ]);
  }, [summary]);

  const handleSend = async (content) => {
    if (!content.trim()) return;
    const messageId = Date.now().toString();
    const userMessage = { id: messageId, author: "user", content };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: `${messageId}-pending`, author: "assistant", content: "Streaming response..." },
    ]);
    setDraft("");
    try {
      await onSubmit(content);
    } finally {
      setMessages((prev) => prev.filter((message) => message.id !== `${messageId}-pending`));
    }
  };

  const handlePromptSubmit = async () => {
    await handleSend(draft);
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUploadPdf?.(file);
    const placeholderText = `Summarise insights from the PDF titled "${file.name}".`;
    await handleSend(placeholderText);
  };

  return (
    <div className="flex h-full flex-col">
      <ChatContainer className="flex-1 space-y-4 overflow-y-auto bg-slate-900 p-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} author={message.author} content={message.content} />
        ))}
      </ChatContainer>
      <div className="flex items-center gap-3 border-t border-slate-800 bg-slate-900 p-4">
        <button
          type="button"
          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200"
          onClick={() =>
            setMessages((prev) => [
              ...prev,
              {
                id: `voice-${Date.now()}`,
                author: "assistant",
                content: "Voice input placeholder activated.",
              },
            ])
          }
        >
          🎙 Voice
        </button>
        <label
          htmlFor={fileInputId}
          className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200"
        >
          📄 Upload PDF
        </label>
        <input id={fileInputId} className="hidden" type="file" accept="application/pdf" onChange={handlePdfUpload} />
        <div className="flex-1">
          <PromptInput
            value={draft}
            onChange={setDraft}
            onSubmit={handlePromptSubmit}
            disabled={loading}
            placeholder="Describe the encounter or paste notes..."
          />
        </div>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          onClick={() => handleSend(draft)}
          disabled={loading || !draft.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
