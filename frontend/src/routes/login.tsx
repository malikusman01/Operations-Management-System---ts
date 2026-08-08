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
import { ShieldCheck, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password is required"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ITOMS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
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
      <div className="relative hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">IT</div>
          <span className="text-lg font-semibold">ITOMS</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">Run IT operations with clarity.</h2>
          <p className="max-w-md text-sidebar-foreground/70">
            Tasks, tickets, assets, infrastructure and reports — one operational console for your IT department.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { k: "Tickets resolved", v: "12,431" },
              { k: "Assets tracked", v: "4,802" },
              { k: "Uptime", v: "99.98%" },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
                <p className="text-xl font-semibold">{s.v}</p>
                <p className="text-xs text-sidebar-foreground/60">{s.k}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© ITOMS · IT Operations Management System</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-bold">IT</div>
              <span className="font-semibold">ITOMS</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Use your corporate IT account to continue.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button type="button" className="text-xs text-primary hover:underline" onClick={() => toast.info("Password reset link sent to your email.")}>
                Forgot password?
              </button>
            </div>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="remember" {...register("remember")} />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me on this device</Label>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Demo mode — any email / password works
          </p>
        </form>
      </div>
    </div>
  );
}
