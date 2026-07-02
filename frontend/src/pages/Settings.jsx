"import React, { useEffect, useState } from \"react\";
import { Button } from \"../components/ui/button\";
import { useTheme } from \"../context/ThemeContext\";
import { useAuth } from \"../context/AuthContext\";
import { pickFolder, forgetFolder, getStatus, supportsFSA } from \"../lib/storage\";
import { Folder, Sun, Moon, LogOut, Info } from \"lucide-react\";
import { toast } from \"sonner\";
import { useNavigate } from \"react-router-dom\";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = useState({ mode: \"loading\" });

  const refresh = async () => setStatus(await getStatus());
  useEffect(() => { refresh(); }, []);

  const connect = async () => {
    try { await pickFolder(); await refresh(); toast.success(\"Folder connected\"); }
    catch { toast.error(\"Folder selection cancelled\"); }
  };
  const forget = async () => { await forgetFolder(); await refresh(); toast.success(\"Folder disconnected\"); };

  return (
    <div className=\"overflow-y-auto scrollbar-thin\">
      <div className=\"mx-auto max-w-3xl p-6 lg:p-8 space-y-8\">
        <header>
          <h1 className=\"font-heading text-2xl tracking-tight\">Settings</h1>
          <p className=\"text-sm text-muted-foreground mt-1\">Account, storage and appearance.</p>
        </header>

        <Section title=\"Local journal storage\" description=\"Where your structured .md journal entries are saved.\">
          {!supportsFSA() && (
            <div className=\"flex gap-2 items-start rounded-lg border border-border bg-muted/40 p-3 text-sm\">
              <Info className=\"h-4 w-4 mt-0.5 text-primary\" strokeWidth={1.5}/>
              <div>
                Your browser doesn't support the File System Access API (Safari / Firefox). Journals are stored in this browser's IndexedDB.
                For real <code>.md</code> files on disk, use Chrome, Edge, Arc or Brave.
              </div>
            </div>
          )}
          {status.mode === \"fsa\" && (
            <Row label=\"Connected folder\" value={status.folderName}
                 action={<Button variant=\"outline\" size=\"sm\" onClick={forget} data-testid=\"settings-forget-folder-btn\">Disconnect</Button>} />
          )}
          {status.mode === \"fsa-unconfigured\" && (
            <Row label=\"No folder connected\" value=\"Saving in IndexedDB until you pick one\"
                 action={<Button size=\"sm\" onClick={connect} data-testid=\"settings-pick-folder-btn\"><Folder className=\"h-4 w-4 mr-2\" strokeWidth={1.5}/>Pick folder</Button>} />
          )}
          {status.mode === \"indexeddb\" && (
            <Row label=\"Storage\" value=\"IndexedDB (browser-local)\" />
          )}
        </Section>

        <Section title=\"Appearance\">
          <Row label=\"Theme\" value={theme === \"dark\" ? \"Dark (slate)\" : \"Light (warm)\"}
               action={
                 <div className=\"flex gap-2\">
                   <Button variant={theme === \"light\" ? \"default\" : \"outline\"} size=\"sm\" onClick={() => setTheme(\"light\")} data-testid=\"settings-theme-light\">
                     <Sun className=\"h-4 w-4 mr-2\" strokeWidth={1.5}/> Light
                   </Button>
                   <Button variant={theme === \"dark\" ? \"default\" : \"outline\"} size=\"sm\" onClick={() => setTheme(\"dark\")} data-testid=\"settings-theme-dark\">
                     <Moon className=\"h-4 w-4 mr-2\" strokeWidth={1.5}/> Dark
                   </Button>
                 </div>
               }
          />
        </Section>

        <Section title=\"Account\">
          <Row label=\"Name\" value={user?.name} />
          <Row label=\"Email\" value={user?.email} />
          <Row label=\"Sign in method\" value={user?.auth_provider === \"google\" ? \"Google\" : \"Email & password\"} />
          <Row label=\"Session\" value=\"Sign out from this device\"
               action={<Button variant=\"outline\" size=\"sm\" onClick={async () => { await signOut(); nav(\"/login\"); }} data-testid=\"settings-signout-btn\">
                 <LogOut className=\"h-4 w-4 mr-2\" strokeWidth={1.5}/> Sign out</Button>} />
        </Section>
      </div>
    </div>
  );
}

const Section = ({ title, description, children }) => (
  <section className=\"rounded-xl border border-border bg-card p-5\">
    <div className=\"mb-3\">
      <h2 className=\"font-heading text-base tracking-tight\">{title}</h2>
      {description && <p className=\"text-xs text-muted-foreground mt-0.5\">{description}</p>}
    </div>
    <div className=\"divide-y divide-border\">{children}</div>
  </section>
);

const Row = ({ label, value, action }) => (
  <div className=\"py-3 flex flex-wrap items-center justify-between gap-3\">
    <div>
      <div className=\"text-xs uppercase tracking-widest text-muted-foreground\">{label}</div>
      <div className=\"text-sm mt-0.5\">{value}</div>
    </div>
    {action}
  </div>
);
"