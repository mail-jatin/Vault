import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Lock, 
  Settings as SettingsIcon, 
  LogOut,
  Fingerprint,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: credentials = [], isLoading: credentialsLoading } = useQuery({
    queryKey: ["/api/webauthn/credentials"],
  });

  const handleDeleteAllData = async () => {
    if (
      confirm(
        "Are you absolutely sure? This will permanently delete all your passwords and cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        toast({ title: "Note", description: "This feature is in development." });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" data-testid="tab-account">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              <Lock className="mr-2 h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg font-medium mt-1">{user?.email || "Not provided"}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg font-medium mt-1">
                    {user?.firstName || user?.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "Not provided"}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-lg font-medium mt-1">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sign Out</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You will be signed out of your account and returned to the login page.
                </p>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  asChild
                  data-testid="button-logout"
                >
                  <a href="/api/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Registered Devices
                </CardTitle>
                <CardDescription>
                  Devices you can use to unlock your vault with fingerprint authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                {credentialsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : credentials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No devices registered yet. Set up fingerprint authentication in your vault.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {credentials.map((cred: any) => (
                      <div
                        key={cred.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`credential-${cred.id}`}
                      >
                        <div>
                          <p className="font-medium text-sm">{cred.deviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            Registered:{" "}
                            {new Date(cred.createdAt).toLocaleDateString()}
                          </p>
                          {cred.lastUsed && (
                            <p className="text-xs text-muted-foreground">
                              Last used:{" "}
                              {new Date(cred.lastUsed).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Manage your login password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Password management is coming soon. Your passwords are securely stored with encryption.
                </p>
                <Button disabled className="opacity-50">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Customize how SecureVault looks
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm">Appearance</span>
                <ThemeToggle />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Timeout</CardTitle>
                <CardDescription>
                  Automatically lock your vault after inactivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Session timeout settings coming soon. Your vault is currently protected with encryption.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete all your data. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                  data-testid="button-delete-all"
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
