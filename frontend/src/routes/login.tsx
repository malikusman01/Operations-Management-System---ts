import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { OpsGraph } from "@/components/app/ops-graph";
import { LogoMark } from "@/components/app/logo";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password is required"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const SERVICES = [
  { name: "auth-service", ok: true },
  { name: "task-queue", ok: true },
  { name: "ticket-router", ok: true },
  { name: "asset-registry", ok: true },
  { name: "notify-worker", ok: true },
];

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ITOMS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@itoms.io", password: "demo1234", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success("Signed in");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — the operations console scene */}
      <div className="relative hidden overflow-hidden bg-[#0B1220] text-[#E8EDF5] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className={`pointer-events-none absolute inset-0 ${reducedMotion ? "" : "login-grid-bg"}`} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#34D8C6]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[420px] w-[520px] opacity-70">
          <OpsGraph animate={!reducedMotion} />
        </div>

        <div className="relative z-10 flex items-center gap-3 login-fade-up">
          <LogoMark size={38} />
          <span className="text-lg font-semibold tracking-tight">ITOMS</span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="login-fade-up" style={{ animationDelay: "80ms" }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#34D8C6]">
              Operations console
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
              Command your IT operations.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#9BAAC4]">
              Tasks, tickets, and assets — tracked, assigned, and resolved from one console.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm login-fade-up" style={{ animationDelay: "160ms" }}>
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-[#6B7C99]">
              Live status
            </p>
            <ul className="space-y-2">
              {SERVICES.map((s, i) => (
                <li
                  key={s.name}
                  className="login-ticker-row flex items-center justify-between font-mono text-xs"
                  style={{ animationDelay: `${260 + i * 90}ms` }}
                >
                  <span className="flex items-center gap-2 text-[#C5D0E6]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-[#34D8C6] ${reducedMotion ? "" : "login-node-pulse"}`} />
                    </span>
                    {s.name}
                  </span>
                  <span className="text-[#34D8C6]">operational</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3 login-fade-up" style={{ animationDelay: "760ms" }}>
            {[
              { k: "Tickets resolved", v: "12,431" },
              { k: "Assets tracked", v: "4,802" },
              { k: "Uptime", v: "99.98%" },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xl font-semibold tabular-nums">{s.v}</p>
                <p className="text-[11px] text-[#6B7C99]">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#6B7C99] login-fade-up" style={{ animationDelay: "840ms" }}>
          © ITOMS · IT Operations Management System
        </p>
      </div>

      {/* Right — the form */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden login-fade-up">
            <div className="mb-4 flex items-center gap-2">
              <LogoMark size={34} />
              <span className="font-semibold">ITOMS</span>
            </div>
          </div>

          <div className="login-fade-up" style={{ animationDelay: "60ms" }}>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your corporate IT account to continue.
            </p>
          </div>

          <div className="space-y-2 login-fade-up" style={{ animationDelay: "130ms" }}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="transition-shadow focus-visible:shadow-[0_0_0_4px_var(--color-ring)]/15"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2 login-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => toast.info("Password reset link sent to your email.")}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="transition-shadow focus-visible:shadow-[0_0_0_4px_var(--color-ring)]/15"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 login-fade-up" style={{ animationDelay: "260ms" }}>
            <Checkbox id="remember" {...register("remember")} />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
              Remember me on this device
            </Label>
          </div>

          <div className="login-fade-up" style={{ animationDelay: "330ms" }}>
            <Button type="submit" className="relative w-full overflow-hidden" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating…
                </>
              ) : (
                <span className="group flex items-center justify-center gap-1.5">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
              {!submitting && !reducedMotion && (
                <span className="pointer-events-none absolute inset-0 -z-0 login-shimmer-sweep bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              )}
            </Button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground login-fade-up" style={{ animationDelay: "400ms" }}>
            <ShieldCheck className="h-3.5 w-3.5" /> Demo mode — any email / password works
          </p>
        </form>
      </div>
    </div>
  );
}