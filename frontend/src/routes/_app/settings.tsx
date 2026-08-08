import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — ITOMS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Manage your profile and preferences." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><Label>Full name</Label><Input defaultValue={user?.fullName} /></div>
              <div className="grid gap-2"><Label>Email</Label><Input defaultValue={user?.email} type="email" /></div>
              <div className="grid gap-2"><Label>Role</Label><Input defaultValue={user?.role} disabled /></div>
              <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card><CardHeader><CardTitle>Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><Label>Current password</Label><Input type="password" /></div>
              <div className="grid gap-2"><Label>New password</Label><Input type="password" /></div>
              <div className="grid gap-2"><Label>Confirm new password</Label><Input type="password" /></div>
              <Button onClick={() => toast.success("Password updated")}>Update password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="font-medium">Dark mode</p><p className="text-sm text-muted-foreground">Use dark theme across the app</p></div><Switch checked={theme === "dark"} onCheckedChange={toggle} /></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card><CardHeader><CardTitle>Notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {["Task assigned to me","Deadline reminders","Overdue tasks","Ticket updates"].map((label) => (
                <div key={label}>
                  <div className="flex items-center justify-between"><Label>{label}</Label><Switch defaultChecked /></div>
                  <Separator className="mt-3" />
                </div>
              ))}
              <Button onClick={() => toast.success("Preferences saved")}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
