"import React, { useEffect, useRef } from \"react\";
import { useNavigate } from \"react-router-dom\";
import { http } from \"../lib/api\";
import { useAuth } from \"../context/AuthContext\";

export default function AuthCallback() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || \"\";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { nav(\"/login\", { replace: true }); return; }
    const session_id = decodeURIComponent(m[1]);

    (async () => {
      try {
        const { data } = await http.post(\"/auth/session\", { session_id });
        setUser(data.user);
        // Clean URL fragment then navigate
        window.history.replaceState({}, \"\", \"/chat\");
        nav(\"/chat\", { replace: true, state: { user: data.user } });
      } catch {
        nav(\"/login\", { replace: true });
      }
    })();
  }, [nav, setUser]);

  return (
    <div className=\"h-screen w-screen flex items-center justify-center bg-background\">
      <div className=\"text-sm text-muted-foreground\">Finishing sign-in…</div>
    </div>
  );
}
"