"import React, { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { toast } from \"sonner\";
import { Button } from \"../components/ui/button\";
import { Input } from \"../components/ui/input\";
import { Label } from \"../components/ui/label\";
import { http } from \"../lib/api\";
import { useAuth } from \"../context/AuthContext\";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function googleSignIn() {
  const redirect = window.location.origin + \"/chat\";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
}

export default function Signup() {
  const [name, setName] = useState(\"\");
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [busy, setBusy] = useState(false);
  const { setUser } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error(\"Password must be at least 6 characters\");
    setBusy(true);
    try {
      const { data } = await http.post(\"/auth/signup\", { name, email, password });
      localStorage.setItem(\"jg_token\", data.token);
      setUser(data.user);
      toast.success(\"Welcome to Journal-Guin\");
      nav(\"/chat\");
    } catch (err) {
      toast.error(err.response?.data?.detail || \"Signup failed\");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className=\"min-h-screen grid md:grid-cols-2 bg-background\">
      <div className=\"hidden md:block relative grain bg-muted\">
        <img src=\"https://images.unsplash.com/photo-1708465034183-7e3528d41944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHdhcm0lMjBzYW5kJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3ODIzOTA0MzB8MA&ixlib=rb-4.1.0&q=85\" alt=\"\" className=\"absolute inset-0 h-full w-full object-cover opacity-60\" />
        <div className=\"absolute inset-0 bg-gradient-to-tr from-background/80 via-background/30 to-transparent\" />
        <div className=\"relative z-10 h-full flex flex-col justify-end p-12\">
          <div className=\"font-heading text-3xl tracking-tight\">A quieter way to journal.</div>
          <p className=\"mt-2 text-sm text-muted-foreground max-w-sm\">Plain markdown. Your folder. Your data.</p>
        </div>
      </div>
      <div className=\"flex items-center justify-center p-8\">
        <form onSubmit={onSubmit} className=\"w-full max-w-sm\" data-testid=\"signup-form\">
          <Link to=\"/\" className=\"text-xs text-muted-foreground hover:text-foreground\">← Home</Link>
          <h1 className=\"mt-6 font-heading text-3xl tracking-tight\">Create your account</h1>
          <p className=\"mt-2 text-sm text-muted-foreground\">Free. No card required.</p>

          <Button type=\"button\" variant=\"outline\" className=\"w-full mt-6\" onClick={googleSignIn} data-testid=\"signup-google-btn\">
            Continue with Google
          </Button>
          <div className=\"my-6 flex items-center gap-3 text-xs text-muted-foreground\">
            <div className=\"h-px flex-1 bg-border\" /> or email <div className=\"h-px flex-1 bg-border\" />
          </div>

          <div className=\"space-y-3\">
            <div><Label htmlFor=\"n\">Name</Label>
              <Input id=\"n\" value={name} onChange={e=>setName(e.target.value)} required data-testid=\"signup-name-input\"/></div>
            <div><Label htmlFor=\"e\">Email</Label>
              <Input id=\"e\" type=\"email\" value={email} onChange={e=>setEmail(e.target.value)} required data-testid=\"signup-email-input\"/></div>
            <div><Label htmlFor=\"p\">Password</Label>
              <Input id=\"p\" type=\"password\" value={password} onChange={e=>setPassword(e.target.value)} required data-testid=\"signup-password-input\"/></div>
          </div>
          <Button type=\"submit\" className=\"w-full mt-6\" disabled={busy} data-testid=\"signup-submit-btn\">
            {busy ? \"Creating…\" : \"Create account\"}
          </Button>
          <p className=\"mt-6 text-sm text-muted-foreground\">
            Already have an account? <Link to=\"/login\" className=\"text-primary underline-offset-4 hover:underline\">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
"