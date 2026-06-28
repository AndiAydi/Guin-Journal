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

export default function Login() {
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [busy, setBusy] = useState(false);
  const { setUser } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await http.post(\"/auth/login\", { email, password });
      localStorage.setItem(\"jg_token\", data.token);
      setUser(data.user);
      toast.success(\"Welcome back\");
      nav(\"/chat\");
    } catch (err) {
      toast.error(err.response?.data?.detail || \"Login failed\");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className=\"min-h-screen grid md:grid-cols-2 bg-background\">
      <div className=\"hidden md:block relative grain bg-muted\">
        <img
          src=\"https://images.unsplash.com/photo-1708465034183-7e3528d41944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHdhcm0lMjBzYW5kJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3ODIzOTA0MzB8MA&ixlib=rb-4.1.0&q=85\"
          alt=\"\" className=\"absolute inset-0 h-full w-full object-cover opacity-60\" />
        <div className=\"absolute inset-0 bg-gradient-to-tr from-background/80 via-background/30 to-transparent\" />
        <div className=\"relative z-10 h-full flex flex-col justify-end p-12\">
          <div className=\"font-heading text-3xl tracking-tight\">Welcome back.</div>
          <p className=\"mt-2 text-sm text-muted-foreground max-w-sm\">Pick up your reflection where you left off.</p>
        </div>
      </div>
      <div className=\"flex items-center justify-center p-8\">
        <form onSubmit={onSubmit} className=\"w-full max-w-sm\" data-testid=\"login-form\">
          <Link to=\"/\" className=\"text-xs text-muted-foreground hover:text-foreground\">← Home</Link>
          <h1 className=\"mt-6 font-heading text-3xl tracking-tight\">Log in</h1>
          <p className=\"mt-2 text-sm text-muted-foreground\">Continue to Guinevere.</p>

          <Button type=\"button\" variant=\"outline\" className=\"w-full mt-6\" onClick={googleSignIn} data-testid=\"login-google-btn\">
            Continue with Google
          </Button>
          <div className=\"my-6 flex items-center gap-3 text-xs text-muted-foreground\">
            <div className=\"h-px flex-1 bg-border\" /> or email <div className=\"h-px flex-1 bg-border\" />
          </div>

          <div className=\"space-y-3\">
            <div>
              <Label htmlFor=\"email\">Email</Label>
              <Input id=\"email\" type=\"email\" value={email} onChange={e => setEmail(e.target.value)}
                     required data-testid=\"login-email-input\" />
            </div>
            <div>
              <Label htmlFor=\"password\">Password</Label>
              <Input id=\"password\" type=\"password\" value={password} onChange={e => setPassword(e.target.value)}
                     required data-testid=\"login-password-input\" />
            </div>
          </div>
          <Button type=\"submit\" className=\"w-full mt-6\" disabled={busy} data-testid=\"login-submit-btn\">
            {busy ? \"Signing in…\" : \"Sign in\"}
          </Button>
          <p className=\"mt-6 text-sm text-muted-foreground\">
            New here? <Link to=\"/signup\" className=\"text-primary underline-offset-4 hover:underline\">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
"