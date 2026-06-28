"import React, { useEffect, useState } from \"react\";
import { Link, NavLink, Outlet, useNavigate } from \"react-router-dom\";
import { MessageCircle, History, BarChart3, Settings, LogOut, Plus, Moon, Sun } from \"lucide-react\";
import { Button } from \"../components/ui/button\";
import { useAuth } from \"../context/AuthContext\";
import { useTheme } from \"../context/ThemeContext\";
import { http } from \"../lib/api\";
import { toast } from \"sonner\";

const NAV = [
  { to: \"/chat\", label: \"Guinevere\", icon: MessageCircle, testid: \"sidebar-chat-link\" },
  { to: \"/history\", label: \"Journal History\", icon: History, testid: \"sidebar-history-link\" },
  { to: \"/analytics\", label: \"Analytics\", icon: BarChart3, testid: \"sidebar-analytics-link\" },
  { to: \"/settings\", label: \"Settings\", icon: Settings, testid: \"sidebar-settings-link\" },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    try {
      const { data } = await http.get(\"/chat/sessions\");
      setSessions(data);
    } catch {}
  };
  useEffect(() => { loadSessions(); }, []);

  // Refresh sidebar list whenever URL changes
  useEffect(() => {
    const i = setInterval(loadSessions, 10000);
    return () => clearInterval(i);
  }, []);

  const newChat = async () => {
    try {
      const { data } = await http.post(\"/chat/sessions\", { title: \"New Reflection\" });
      await loadSessions();
      nav(`/chat/${data.session_id}`);
    } catch {
      toast.error(\"Could not start a new chat\");
    }
  };

  return (
    <div className=\"h-screen w-screen flex bg-background text-foreground overflow-hidden\">
      <aside className=\"hidden md:flex w-64 lg:w-72 flex-col border-r border-border bg-sidebar\">
        <div className=\"p-5 flex items-center gap-2\">
          <div className=\"h-9 w-9 rounded-lg bg-primary grid place-items-center font-heading font-bold text-primary-foreground\">G</div>
          <div>
            <div className=\"font-heading font-semibold tracking-tight\">Journal-Guin</div>
            <div className=\"text-[11px] text-muted-foreground\">Guinevere mentor</div>
          </div>
        </div>

        <div className=\"px-3 pt-2\">
          <Button size=\"sm\" className=\"w-full justify-start gap-2\" onClick={newChat} data-testid=\"sidebar-new-chat-btn\">
            <Plus className=\"h-4 w-4\" strokeWidth={1.5} /> New reflection
          </Button>
        </div>

        <nav className=\"px-3 pt-6 space-y-1\">
          {NAV.map(item => (
            <NavLink
              key={item.to} to={item.to} data-testid={item.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                  isActive ? \"bg-card text-foreground shadow-sm border border-border\" : \"text-muted-foreground hover:bg-card/60 hover:text-foreground\"
                }`
              }
            >
              <item.icon className=\"h-4 w-4\" strokeWidth={1.5} /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className=\"px-3 pt-6 flex-1 min-h-0 flex flex-col\">
          <div className=\"text-[11px] uppercase tracking-widest text-muted-foreground px-3 mb-2\">Recent</div>
          <div className=\"flex-1 overflow-y-auto scrollbar-thin pr-1\">
            {sessions.length === 0 && <div className=\"px-3 text-xs text-muted-foreground\">No reflections yet.</div>}
            {sessions.map(s => (
              <Link key={s.session_id} to={`/chat/${s.session_id}`} data-testid={`sidebar-session-${s.session_id}`}
                    className=\"block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-card hover:text-foreground truncate\">
                {s.title || \"Untitled\"}
              </Link>
            ))}
          </div>
        </div>

        <div className=\"p-3 border-t border-border\">
          <div className=\"flex items-center gap-3 px-2 py-2\">
            <div className=\"h-8 w-8 rounded-full bg-muted grid place-items-center text-xs font-medium overflow-hidden\">
              {user?.picture ? <img src={user.picture} alt=\"\" className=\"h-full w-full object-cover\"/> : (user?.name?.[0] || \"?\").toUpperCase()}
            </div>
            <div className=\"flex-1 min-w-0\">
              <div className=\"text-sm truncate\">{user?.name}</div>
              <div className=\"text-[11px] text-muted-foreground truncate\">{user?.email}</div>
            </div>
          </div>
          <div className=\"flex gap-1 mt-1\">
            <Button variant=\"ghost\" size=\"sm\" className=\"flex-1 justify-start gap-2\" onClick={toggle} data-testid=\"theme-toggle-btn\">
              {theme === \"dark\" ? <Sun className=\"h-4 w-4\" strokeWidth={1.5}/> : <Moon className=\"h-4 w-4\" strokeWidth={1.5}/>}
              {theme === \"dark\" ? \"Light\" : \"Dark\"}
            </Button>
            <Button variant=\"ghost\" size=\"sm\" onClick={() => { signOut(); nav(\"/login\"); }} data-testid=\"sidebar-signout-btn\">
              <LogOut className=\"h-4 w-4\" strokeWidth={1.5}/>
            </Button>
          </div>
        </div>
      </aside>

      <main className=\"flex-1 min-w-0 overflow-hidden flex flex-col\">
        <Outlet context={{ refreshSessions: loadSessions }} />
      </main>
    </div>
  );
}
"