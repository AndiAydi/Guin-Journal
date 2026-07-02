"/**
 * Hybrid local-first storage for Journal-Guin journal entries.
 * Primary: File System Access API (saves real .md files in user-chosen folder).
 * Fallback: IndexedDB (browsers without FSA, e.g. Safari/Firefox).
 *
 * Storage status is exposed via getStatus() so the UI can show which mode is active.
 */

const FOLDER_HANDLE_KEY = \"jg_folder_handle\";
const DB_NAME = \"journal_guin\";
const STORE_ENTRIES = \"entries\";
const STORE_META = \"meta\";

export const supportsFSA = () => typeof window !== \"undefined\" && \"showDirectoryPicker\" in window;

// ---------- IndexedDB helpers ----------
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) db.createObjectStore(STORE_ENTRIES, { keyPath: \"entry_id\" });
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(store, value, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, \"readwrite\");
    const s = tx.objectStore(store);
    const r = key !== undefined ? s.put(value, key) : s.put(value);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, \"readonly\");
    const r = tx.objectStore(store).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function idbAll(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, \"readonly\");
    const r = tx.objectStore(store).getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
}

// ---------- Folder handle persistence ----------
export async function getSavedFolderHandle() {
  if (!supportsFSA()) return null;
  const h = await idbGet(STORE_META, FOLDER_HANDLE_KEY);
  if (!h) return null;
  try {
    const perm = await h.queryPermission({ mode: \"readwrite\" });
    if (perm === \"granted\") return h;
    const req = await h.requestPermission({ mode: \"readwrite\" });
    return req === \"granted\" ? h : null;
  } catch {
    return null;
  }
}

export async function pickFolder() {
  if (!supportsFSA()) throw new Error(\"File System Access API not supported in this browser\");
  const handle = await window.showDirectoryPicker({ id: \"journal-guin\", mode: \"readwrite\" });
  await idbPut(STORE_META, handle, FOLDER_HANDLE_KEY);
  return handle;
}

export async function forgetFolder() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_META, \"readwrite\");
    tx.objectStore(STORE_META).delete(FOLDER_HANDLE_KEY);
    tx.oncomplete = () => resolve(true);
  });
}

// ---------- Markdown formatting ----------
export function entryToMarkdown(e) {
  const lines = [
    `# ${e.date} — ${e.mood || \"reflection\"}`,
    \"\",
    `| Field | Value |`,
    `|---|---|`,
    `| Date | ${e.date || \"\"} |`,
    `| Mood | ${e.mood || \"\"} |`,
    `| Mood score | ${e.mood_score ?? \"\"} |`,
    `| Energy score | ${e.energy_score ?? \"\"} |`,
    `| Emotions | ${(e.emotions || []).join(\", \")} |`,
    `| Themes | ${(e.themes || []).join(\", \")} |`,
    `| Habits | ${(e.habits || []).join(\", \")} |`,
    \"\",
    `## Summary`,
    e.summary || \"\",
    \"\",
    `## Wins`,
    ...((e.wins || []).map((w) => `- ${w}`)),
    \"\",
    `## Challenges`,
    ...((e.challenges || []).map((c) => `- ${c}`)),
    \"\",
    `## Growth nudge`,
    `> ${e.growth_nudge || \"\"}`,
    \"\",
    `<!-- entry_id: ${e.entry_id} | session_id: ${e.session_id || \"\"} -->`,
  ];
  return lines.join(\"
\");
}

function fileNameFor(e) {
  return `${e.date || \"entry\"}__${e.entry_id || Date.now()}.md`;
}

// ---------- Public API ----------
export async function getStatus() {
  if (supportsFSA()) {
    const h = await getSavedFolderHandle();
    return {
      mode: h ? \"fsa\" : \"fsa-unconfigured\",
      folderName: h?.name || null,
      supportsFSA: true,
    };
  }
  return { mode: \"indexeddb\", folderName: null, supportsFSA: false };
}

export async function saveEntry(entry) {
  const md = entryToMarkdown(entry);
  // Always keep an IndexedDB copy (works in every browser, also serves analytics view)
  await idbPut(STORE_ENTRIES, { ...entry, _md: md });

  if (supportsFSA()) {
    const folder = await getSavedFolderHandle();
    if (folder) {
      const fh = await folder.getFileHandle(fileNameFor(entry), { create: true });
      const w = await fh.createWritable();
      await w.write(md);
      await w.close();
      return { saved: \"fsa\", path: `${folder.name}/${fileNameFor(entry)}` };
    }
  }
  return { saved: \"indexeddb\" };
}

export async function listEntries() {
  // Prefer reading from the folder so users can edit .md files externally and we still see them.
  if (supportsFSA()) {
    const folder = await getSavedFolderHandle();
    if (folder) {
      const entries = [];
      for await (const [name, handle] of folder.entries()) {
        if (handle.kind !== \"file\" || !name.endsWith(\".md\")) continue;
        try {
          const file = await handle.getFile();
          const text = await file.text();
          entries.push(parseMarkdownEntry(text, name));
        } catch {
          /* skip */
        }
      }
      entries.sort((a, b) => (b.date || \"\").localeCompare(a.date || \"\"));
      return entries;
    }
  }
  const rows = await idbAll(STORE_ENTRIES);
  rows.sort((a, b) => (b.date || \"\").localeCompare(a.date || \"\"));
  return rows;
}

function parseMarkdownEntry(text, filename) {
  const get = (label) => {
    const m = text.match(new RegExp(`\\|\\s*${label}\\s*\\|\\s*([^|]*)\\|`, \"i\"));
    return m ? m[1].trim() : \"\";
  };
  const list = (label) => get(label).split(\",\").map((s) => s.trim()).filter(Boolean);
  const section = (head) => {
    const re = new RegExp(`## ${head}\\s*\
([\\s\\S]*?)(?=\
##\\s|$)`, \"i\");
    const m = text.match(re);
    return m ? m[1].trim() : \"\";
  };
  const bullets = (head) =>
    section(head).split(\"
\").map((l) => l.replace(/^[-*]\s*/, \"\").trim()).filter(Boolean);
  const idMatch = text.match(/entry_id:\s*([^\s|]+)/);
  return {
    entry_id: idMatch ? idMatch[1] : filename,
    date: get(\"Date\"),
    mood: get(\"Mood\"),
    mood_score: Number(get(\"Mood score\")) || null,
    energy_score: Number(get(\"Energy score\")) || null,
    emotions: list(\"Emotions\"),
    themes: list(\"Themes\"),
    habits: list(\"Habits\"),
    summary: section(\"Summary\"),
    wins: bullets(\"Wins\"),
    challenges: bullets(\"Challenges\"),
    growth_nudge: section(\"Growth nudge\").replace(/^>\s*/, \"\").trim(),
    _md: text,
    _source: filename,
  };
}
"