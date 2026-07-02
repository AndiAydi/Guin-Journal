"import React from \"react\";
import { Link } from \"react-router-dom\";
import { Sparkles, Lock, FolderOpen, BarChart3, ArrowRight } from \"lucide-react\";
import { Button } from \"../components/ui/button\";
import { useTheme } from \"../context/ThemeContext\";

const Feature = ({ icon: Icon, title, body }) => (
  <div className=\"rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm\">
    <Icon className=\"h-5 w-5 text-primary\" strokeWidth={1.5} />
    <h3 className=\"mt-4 font-heading text-lg\">{title}</h3>
    <p className=\"mt-2 text-sm text-muted-foreground leading-relaxed\">{body}</p>
  </div>
);

export default function Landing() {
  const { theme, toggle } = useTheme();
  return (
    <div className=\"min-h-screen bg-background grain\">
      <header className=\"border-b border-border\">
        <div className=\"mx-auto max-w-6xl px-6 py-4 flex items-center justify-between\">
          <div className=\"flex items-center gap-2\">
            <div className=\"h-8 w-8 rounded-lg bg-primary grid place-items-center font-heading font-bold text-primary-foreground\">G</div>
            <span className=\"font-heading font-semibold tracking-tight\">Journal-Guin</span>
          </div>
          <div className=\"flex items-center gap-2\">
            <Button variant=\"ghost\" size=\"sm\" data-testid=\"landing-theme-toggle\" onClick={toggle}>
              {theme === \"dark\" ? \"Light\" : \"Dark\"}
            </Button>
            <Link to=\"/login\"><Button variant=\"ghost\" size=\"sm\" data-testid=\"landing-login-btn\">Log in</Button></Link>
            <Link to=\"/signup\"><Button size=\"sm\" data-testid=\"landing-signup-btn\">Start journaling</Button></Link>
          </div>
        </div>
      </header>

      <section className=\"mx-auto max-w-6xl px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-12 items-center\">
        <div className=\"lg:col-span-7 animate-fade-in-up\">
          <div className=\"inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground\">
            <Sparkles className=\"h-3 w-3 text-primary\" strokeWidth={1.5} /> Your AI growth mentor
          </div>
          <h1 className=\"mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]\">
            Talk to Guinevere.<br />
            <span className=\"text-primary\">She turns it into a journal.</span>
          </h1>
          <p className=\"mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed\">
            Chat about your day. Guinevere listens, asks the right questions, and quietly saves a structured markdown reflection to a folder you own — Obsidian-style, on your machine.
          </p>
          <div className=\"mt-8 flex gap-3\">
            <Link to=\"/signup\">
              <Button size=\"lg\" data-testid=\"hero-cta-btn\">
                Begin your first reflection <ArrowRight className=\"ml-2 h-4 w-4\" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link to=\"/login\">
              <Button variant=\"outline\" size=\"lg\" data-testid=\"hero-login-btn\">I already have an account</Button>
            </Link>
          </div>
        </div>

        <div className=\"lg:col-span-5\">
          <div className=\"rounded-2xl border border-border bg-card p-6 shadow-sm\">
            <div className=\"text-xs uppercase tracking-widest text-muted-foreground\">Today · 22:14</div>
            <p className=\"mt-4 font-journal text-lg leading-relaxed\">
              \"Long day. Shipped the migration, but I snapped at Sam. Feeling proud and a little ashamed at the same time.\"
            </p>
            <div className=\"mt-4 rounded-lg bg-muted/50 p-4 border border-border\">
              <div className=\"text-xs font-medium text-primary mb-2\">Guinevere</div>
              <p className=\"font-journal text-sm leading-relaxed text-foreground/90\">
                Both feelings are honest. The pride is earned. The shame is a signal — what was going on for you right before you snapped?
              </p>
            </div>
            <div className=\"mt-4 grid grid-cols-3 gap-2 text-xs\">
              <div className=\"rounded-md border border-border p-2\"><div className=\"text-muted-foreground\">Mood</div><div className=\"font-medium\">Mixed</div></div>
              <div className=\"rounded-md border border-border p-2\"><div className=\"text-muted-foreground\">Energy</div><div className=\"font-medium\">6/10</div></div>
              <div className=\"rounded-md border border-border p-2\"><div className=\"text-muted-foreground\">Win</div><div className=\"font-medium\">Shipped</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className=\"mx-auto max-w-6xl px-6 pb-24 grid md:grid-cols-3 gap-6\">
        <Feature icon={FolderOpen} title=\"You own the data\" body=\"Journals are saved as plain .md files in a folder you pick. Take them anywhere. Edit them in Obsidian. Delete the app — keep the words.\" />
        <Feature icon={Lock} title=\"Sandboxed cloud\" body=\"Only auth + chat history live in the cloud, isolated per user. Your structured journal entries never need to leave your device.\" />
        <Feature icon={BarChart3} title=\"Patterns, not nags\" body=\"Built-in analytics surface mood, habits and emotional themes over time — the way a good mentor would notice.\" />
      </section>
    </div>
  );
}
"