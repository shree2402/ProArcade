import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const data = await login(email, password);
      navigate(data.onboardingRequired ? "/onboarding" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <AuthLayout title="Enter the arcade" subtitle="Resume your saved board, active lock, proof reel, and gallery from any browser session." mode="login">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">Email</span>
          <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-3">
            <Mail size={18} className="text-arcade-cyan" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent outline-none" type="email" required />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">Password</span>
          <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-3">
            <LockKeyhole size={18} className="text-arcade-magenta" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent outline-none" type="password" required />
          </span>
        </label>
        {error && <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        <button className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-pink-400 px-4 py-3 font-black text-slate-950 shadow-neon transition hover:scale-[1.01]">
          Login
        </button>
      </form>
    </AuthLayout>
  );
}
