"import React, { useEffect, useState, useMemo } from \"react\";
import { listEntries } from \"../lib/storage\";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from \"recharts\";
import { TrendingUp, Flame, HeartHandshake } from \"lucide-react\";

export default function Analytics() {
  const [entries, setEntries] = useState([]);
  useEffect(() => { listEntries().then(setEntries); }, []);

  const trend = useMemo(() =>
    [...entries].sort((a,b) => (a.date||\"\").localeCompare(b.date||\"\"))
      .map(e => ({ date: e.date, mood: e.mood_score || 0, energy: e.energy_score || 0 })),
    [entries]);

  const emotions = useMemo(() => {
    const c = {};
    for (const e of entries) for (const em of e.emotions || []) c[em] = (c[em] || 0) + 1;
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name, count]) => ({ name, count }));
  }, [entries]);

  const habitCount = useMemo(() => {
    const c = {};
    for (const e of entries) for (const h of e.habits || []) {
      const k = h.replace(/^[+\-]/, \"\").trim(); if (k) c[k] = (c[k] || 0) + 1;
    }
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name, count]) => ({ name, count }));
  }, [entries]);

  const avgMood = useMemo(() => {
    const v = entries.filter(e => e.mood_score).map(e => e.mood_score);
    return v.length ? (v.reduce((a,b)=>a+b,0) / v.length).toFixed(1) : \"—\";
  }, [entries]);

  return (
    <div className=\"overflow-y-auto scrollbar-thin\">
      <div className=\"mx-auto max-w-6xl p-6 lg:p-8\">
        <h1 className=\"font-heading text-2xl tracking-tight\">Analytics</h1>
        <p className=\"text-sm text-muted-foreground mt-1\">Patterns Guinevere has noticed across your reflections.</p>

        <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8\">
          <Kpi icon={HeartHandshake} label=\"Reflections\" value={entries.length} />
          <Kpi icon={TrendingUp} label=\"Avg mood\" value={avgMood} />
          <Kpi icon={Flame} label=\"Top habit\" value={habitCount[0]?.name || \"—\"} />
        </div>

        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6\">
          <Card title=\"Mood & Energy over time\">
            <ResponsiveContainer width=\"100%\" height={260}>
              <LineChart data={trend} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray=\"3 3\" stroke=\"hsl(var(--border))\" />
                <XAxis dataKey=\"date\" stroke=\"hsl(var(--muted-foreground))\" fontSize={12}/>
                <YAxis domain={[0,10]} stroke=\"hsl(var(--muted-foreground))\" fontSize={12}/>
                <Tooltip contentStyle={{ background: \"hsl(var(--card))\", border: \"1px solid hsl(var(--border))\", borderRadius: 8 }}/>
                <Line type=\"monotone\" dataKey=\"mood\" stroke=\"hsl(var(--primary))\" strokeWidth={2} dot={{ r: 3 }} />
                <Line type=\"monotone\" dataKey=\"energy\" stroke=\"hsl(var(--muted-foreground))\" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title=\"Habit frequency\">
            <ResponsiveContainer width=\"100%\" height={260}>
              <BarChart data={habitCount} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray=\"3 3\" stroke=\"hsl(var(--border))\" />
                <XAxis dataKey=\"name\" stroke=\"hsl(var(--muted-foreground))\" fontSize={11} interval={0} angle={-15} textAnchor=\"end\" height={50}/>
                <YAxis stroke=\"hsl(var(--muted-foreground))\" fontSize={12}/>
                <Tooltip contentStyle={{ background: \"hsl(var(--card))\", border: \"1px solid hsl(var(--border))\", borderRadius: 8 }}/>
                <Bar dataKey=\"count\" fill=\"hsl(var(--primary))\" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title=\"Emotion distribution\">
            <ResponsiveContainer width=\"100%\" height={260}>
              <BarChart data={emotions} layout=\"vertical\" margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray=\"3 3\" stroke=\"hsl(var(--border))\" />
                <XAxis type=\"number\" stroke=\"hsl(var(--muted-foreground))\" fontSize={12}/>
                <YAxis dataKey=\"name\" type=\"category\" stroke=\"hsl(var(--muted-foreground))\" fontSize={12} width={90}/>
                <Tooltip contentStyle={{ background: \"hsl(var(--card))\", border: \"1px solid hsl(var(--border))\", borderRadius: 8 }}/>
                <Bar dataKey=\"count\" fill=\"hsl(var(--primary))\" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title=\"Recent themes\">
            <div className=\"flex flex-wrap gap-2 p-2\">
              {Array.from(new Set(entries.flatMap(e => e.themes || []))).slice(0, 24).map((t, i) => (
                <span key={i} className=\"px-3 py-1.5 rounded-full bg-muted text-xs\">{t}</span>
              ))}
              {entries.length === 0 && <div className=\"text-sm text-muted-foreground\">No themes yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Kpi = ({ icon: Icon, label, value }) => (
  <div className=\"rounded-xl border border-border bg-card p-5\">
    <div className=\"flex items-center justify-between\">
      <div className=\"text-xs uppercase tracking-widest text-muted-foreground\">{label}</div>
      <Icon className=\"h-4 w-4 text-primary\" strokeWidth={1.5}/>
    </div>
    <div className=\"mt-3 font-heading text-3xl tracking-tight\">{value}</div>
  </div>
);

const Card = ({ title, children }) => (
  <div className=\"rounded-xl border border-border bg-card p-5\">
    <div className=\"font-heading text-sm tracking-tight mb-3\">{title}</div>
    {children}
  </div>
);
"