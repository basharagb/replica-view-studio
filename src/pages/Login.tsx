import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const response = await login(email, password);
      
      if (response.success) {
        navigate("/", { replace: true });
      } else {
        setLoginError(response.message);
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-950 dark:to-black px-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-xl border-muted/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/50">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">Access the silo monitoring and analytics suite</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                User Name
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter User Name"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {loginError}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              <strong>Test Users:</strong><br/>
              ahmed/ahmed (Admin), hussein/hussein (Technician), bashar/bashar (Operator)
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          {/* Temporary helper removed since login now routes to dashboard on success */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
