import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FingerprintSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetup: (deviceName: string) => Promise<boolean>;
}

type SetupState = "idle" | "scanning" | "success" | "error";

export function FingerprintSetup({
  open,
  onOpenChange,
  onSetup,
}: FingerprintSetupProps) {
  const [deviceName, setDeviceName] = useState("");
  const [state, setState] = useState<SetupState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    if (!deviceName.trim()) {
      setError("Please enter a device name");
      return;
    }

    setState("scanning");
    setError(null);

    try {
      const success = await onSetup(deviceName.trim());
      if (success) {
        setState("success");
        setTimeout(() => {
          onOpenChange(false);
          setState("idle");
          setDeviceName("");
        }, 1500);
      } else {
        setState("error");
        setError("Failed to register fingerprint. Please try again.");
      }
    } catch (err) {
      setState("error");
      setError("An error occurred. Please try again.");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && state !== "scanning") {
      onOpenChange(false);
      setState("idle");
      setDeviceName("");
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Up Fingerprint</DialogTitle>
          <DialogDescription>
            Use your device's fingerprint sensor for quick access to your vault.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                state === "idle" && "bg-primary/10",
                state === "scanning" && "bg-primary/20 fingerprint-pulse",
                state === "success" && "bg-green-500/20",
                state === "error" && "bg-red-500/20"
              )}
            >
              {state === "idle" && (
                <Fingerprint className="w-12 h-12 text-primary" />
              )}
              {state === "scanning" && (
                <div className="relative">
                  <Fingerprint className="w-12 h-12 text-primary" />
                  <div className="absolute inset-0 fingerprint-scan rounded-full" />
                </div>
              )}
              {state === "success" && (
                <CheckCircle2 className="w-12 h-12 text-green-500 checkmark-animate" />
              )}
              {state === "error" && (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
          </div>

          {state === "idle" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g. My Laptop, Work PC"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  data-testid="input-device-name"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleSetup}
                data-testid="button-setup-fingerprint"
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Set Up Fingerprint
              </Button>
            </div>
          )}

          {state === "scanning" && (
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Touch your fingerprint sensor...
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">
                Fingerprint registered successfully!
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                onClick={() => setState("idle")}
                data-testid="button-retry-fingerprint"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
