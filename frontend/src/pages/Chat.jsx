"import React, { useEffect, useRef, useState, useCallback } from \"react\";
import { useNavigate, useOutletContext, useParams } from \"react-router-dom\";
import { Send, Sparkles, BookText, Loader2 } from \"lucide-react\";
import { Button } from \"../components/ui/button\";
import { Textarea } from \"../components/ui/textarea\";
import { toast } from \"sonner\";
import { http, API } from \"../lib/api\";
import { saveEntry, getStatus, pickFolder, supportsFSA } from \"../lib/storage\";

const PROMPTS = [
  \"How was your day, really?\",
  \"What's taking up the most space in your mind right now?\",
  \"What's one thing you're proud of from today?\",
  \"What drained you today, and what filled you up?\",
];

export default function Chat() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const { refreshSessions } = useOutletContext() || {};
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(\"\");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState(\"\");
  const [extracting, setExtracting] = useState(false);
  const [storageStatus, setStorageStatus] = useState({ mode: \"loading\" });
  const scrollRef = useRef(null);

  const ensureSession = useCallback(async () => {
    if (sessionId) {
      try {
        const { data } = await http.get(`/chat/sessions/${sessionId}/messages`);
        setSession(data.session); setMessages(data.messages);
      } catch { toast.error(\"Could not load reflection\"); }
    } else {
      try {
        const { data } = await http.post(\"/chat/sessions\", { title: \"New Reflection\" });
        refreshSessions?.();
        nav(`/chat/${data.session_id}`, { replace: true });
      } catch { toast.error(\"Could not start a reflection\"); }
    }
  }, [sessionId, nav, refreshSessions]);

  useEffect(() => { ensureSession(); }, [ensureSession]);
  useEffect(() => { getStatus().then(setStorageStatus); }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamText]);

  const send = async () => {
    if (!input.trim() || !sessionId || streaming) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: \"user\", content: userMsg, created_at: new Date().toISOString() }]);
    setInput(\"\");
    setStreaming(true); setStreamText(\"\");

    try {
      const token = localStorage.getItem(\"jg_token\");
      const res = await fetch(`${API}/chat/stream`, {
        method: \"POST\", credentials: \"include\",
        headers: {
          \"Content-Type\": \"application/json\",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
      });
      if (!res.ok || !res.body) throw new Error(\"Stream error\");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = \"\", acc = \"\";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(\"

\");
        buffer = events.pop() || \"\";
        for (const ev of events) {
          const line = ev.split(\"
\").find(l => l.startsWith(\"data:\"));
          if (!line) continue;
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.delta) { acc += data.delta; setStreamText(acc); }
            if (data.done) {
              setMessages(m => [...m, { role: \"assistant\", content: acc, created_at: new Date().toISOString() }]);
              setStreamText(\"\");
            }
            if (data.error) toast.error(data.error);
          } catch {}
        }
      }
      refreshSessions?.();
    } catch (e) {
      toast.error(\"Connection error\");
    } finally {
      setStreaming(false);
    }
  };

  const saveJournal = async () => {
    if (messages.length < 2) return toast.error(\"Reflect a bit more first\");
    setExtracting(true);
    try {
      const transcript = messages.map(m => `${m.role === \"user\" ? \"User\" : \"Guinevere\"}: ${m.content}`).join(\"
\");
      const { data } = await http.post(\"/journal/extract\", { session_id: sessionId, transcript });
      const result = await saveEntry(data);
      if (result.saved === \"fsa\") toast.success(`Saved to ${result.path}`);
      else toast.success(\"Saved locally (IndexedDB)\");
      setStorageStatus(await getStatus());
    } catch (e) {
      toast.error(e.response?.data?.detail || \"Could not extract journal\");
    } finally {
      setExtracting(false);
    }
  };

  const connectFolder = async () => {
    try { await pickFolder(); setStorageStatus(await getStatus()); toast.success(\"Folder connected\"); }
    catch { toast.error(\"Folder selection cancelled\"); }
  };

  const empty = messages.length === 0 && !streamText;

  return (
    <div className=\"flex flex-col h-full\">
      <header className=\"border-b border-border px-6 py-3 flex items-center justify-between\">
        <div>
          <div className=\"font-heading text-lg tracking-tight\">Guinevere Journal</div>
          <div className=\"text-xs text-muted-foreground\">{session?.title || \"Today's reflection\"}</div>
        </div>
        <div className=\"flex items-center gap-2\">
          <StorageBadge status={storageStatus} onConnect={connectFolder} />
          <Button size=\"sm\" variant=\"outline\" onClick={saveJournal} disabled={extracting || messages.length < 2} data-testid=\"chat-save-journal-btn\">
            {extracting ? <Loader2 className=\"h-4 w-4 animate-spin mr-2\" strokeWidth={1.5}/> : <BookText className=\"h-4 w-4 mr-2\" strokeWidth={1.5}/>}
            Save as journal
          </Button>
        </div>
      </header>

      <div ref={scrollRef} className=\"flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-8 py-8\">
        <div className=\"mx-auto max-w-3xl\">
          {empty && (
            <div className=\"animate-fade-in-up\">
              <div className=\"inline-flex items-center gap-2 text-xs text-muted-foreground\">
                <Sparkles className=\"h-3 w-3 text-primary\" strokeWidth={1.5}/> Start a reflection
              </div>
              <h2 className=\"mt-3 font-heading text-3xl tracking-tight\">How was your day?</h2>
              <p className=\"mt-2 text-muted-foreground\">Type below, or pick a prompt to start.</p>
              <div className=\"mt-6 grid sm:grid-cols-2 gap-3\">
                {PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => setInput(p)}
                          className=\"text-left rounded-lg border border-border bg-card p-4 text-sm font-journal hover:-translate-y-[1px] hover:shadow-sm transition-all duration-200\"
                          data-testid={`chat-prompt-${i}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
          {streamText && <Bubble role=\"assistant\" content={streamText} streaming />}
        </div>
      </div>

      <div className=\"border-t border-border px-4 sm:px-8 py-4\">
        <div className=\"mx-auto max-w-3xl flex items-end gap-2\">
          <Textarea
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === \"Enter\" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder=\"Talk to Guinevere…  (Enter to send · Shift+Enter for newline)\"
            rows={2} className=\"font-journal resize-none\" data-testid=\"chat-input\"
          />
          <Button onClick={send} disabled={streaming || !input.trim()} size=\"lg\" className=\"h-[60px] px-5\" data-testid=\"chat-send-btn\">
            {streaming ? <Loader2 className=\"h-5 w-5 animate-spin\" strokeWidth={1.5}/> : <Send className=\"h-5 w-5\" strokeWidth={1.5}/>}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content, streaming }) {
  const isUser = role === \"user\";
  return (
    <div className={`my-4 flex animate-fade-in-up ${isUser ? \"justify-end\" : \"justify-start\"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? \"bg-primary/15 text-foreground rounded-tr-sm\"
            : \"bg-card border border-border rounded-tl-sm font-journal text-[15px]\"
        }`}>
        {content}{streaming && <span className=\"caret\"/>}
      </div>
    </div>
  );
}

function StorageBadge({ status, onConnect }) {
  if (status.mode === \"loading\") return null;
  if (status.mode === \"fsa\") return (
    <div className=\"text-xs text-muted-foreground px-2 py-1 rounded-md border border-border\">
      <span className=\"text-primary\">●</span> {status.folderName}
    </div>
  );
  if (status.mode === \"fsa-unconfigured\") return (
    <Button size=\"sm\" variant=\"outline\" onClick={onConnect} data-testid=\"chat-connect-folder-btn\">Connect folder</Button>
  );
  return <div className=\"text-xs text-muted-foreground px-2 py-1 rounded-md border border-border\">Saving locally (IndexedDB)</div>;
}
"s