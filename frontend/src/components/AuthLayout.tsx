import { Link } from "react-router-dom";

export function AuthLayout({
  title,
  subtitle,
  mode,
  children
}: {
  title: string;
  subtitle: string;
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-400/10 to-transparent" />
      <section className="glass-panel relative w-full max-w-md rounded-lg p-7 shadow-neon">
        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.24em] text-arcade-cyan">ProArcade</p>
          <h1 className="text-3xl font-black neon-text">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === "login" ? "New player?" : "Already registered?"}{" "}
          <Link className="font-bold text-arcade-cyan hover:text-white" to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Create an account" : "Log in"}
          </Link>
        </p>
      </section>
    </div>
  );
}
