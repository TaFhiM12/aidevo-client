import { useMemo, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

const FAQ_BANK = [
  {
    keywords: ["apply", "application", "join"],
    answer:
      "Go to Organizations, open a profile, and submit your application. You can track status updates from your dashboard applications section.",
  },
  {
    keywords: ["event", "events", "attend"],
    answer:
      "Open the Events page, choose an event, and click attend. For paid events, complete payment first, then your attendance is confirmed.",
  },
  {
    keywords: ["chat", "message", "communication"],
    answer:
      "Use dashboard chat to message organizations or students in real time. You can send text and attachments with delivery/read ticks.",
  },
  {
    keywords: ["blood", "donor", "urgent"],
    answer:
      "Visit Blood Bank from the public menu to register donors, post urgent requests, filter by blood group, and view nearest entries.",
  },
  {
    keywords: ["payment", "fee", "paid"],
    answer:
      "Paid events require payment before attendance. Receipts and payment history are available in dashboard payment sections.",
  },
  {
    keywords: ["organization", "club", "member"],
    answer:
      "Organizations can manage members, review applications, publish events, and communicate with students from the dashboard.",
  },
];

const quickPrompts = [
  "How do I join an organization?",
  "How does event attendance work?",
  "How can I use blood bank?",
  "How do I chat with organizations?",
];

const buildBotAnswer = (question) => {
  const normalized = String(question || "").toLowerCase();

  const matched = FAQ_BANK.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matched) {
    return matched.answer;
  }

  return "I can help with organizations, events, chat, blood bank, and payments. Try asking with one of those keywords.";
};

const AssistantBotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I am Aidevo Assistant. Ask me anything about events, applications, chat, blood bank, or payments.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const ask = (text) => {
    const question = String(text || "").trim();
    if (!question) return;

    const answer = buildBotAnswer(question);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "bot", text: answer },
    ]);
    setInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-[70] bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-xl px-4 py-3 inline-flex items-center gap-2 hover:scale-[1.02] transition"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Assistant</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-[80] w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <p className="font-semibold text-sm">Aidevo Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 border-b border-slate-100 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => ask(prompt)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AssistantBotWidget;
