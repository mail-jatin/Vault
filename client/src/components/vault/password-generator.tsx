import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, RefreshCw, Check } from "lucide-react";
import { generatePassword, calculatePasswordStrength, copyToClipboard } from "@/lib/authUtils";
import { cn } from "@/lib/utils";

interface PasswordGeneratorProps {
  onSelect?: (password: string) => void;
  compact?: boolean;
}

export function PasswordGenerator({ onSelect, compact = false }: PasswordGeneratorProps) {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const strength = calculatePasswordStrength(password);

  const regenerate = () => {
    const newPassword = generatePassword(length, {
      uppercase,
      lowercase,
      numbers,
      symbols,
    });
    setPassword(newPassword);
  };

  useEffect(() => {
    regenerate();
  }, [length, uppercase, lowercase, numbers, symbols]);

  const handleCopy = async () => {
    const success = await copyToClipboard(password);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUse = () => {
    if (onSelect) {
      onSelect(password);
    }
  };

  const getStrengthColor = () => {
    switch (strength.score) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-primary";
      case 4:
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Generated Password</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={password}
              readOnly
              className="font-mono pr-20 text-sm"
              data-testid="input-generated-password"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleCopy}
                data-testid="button-copy-generated"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={regenerate}
                data-testid="button-regenerate"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", getStrengthColor())}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground min-w-[48px]">
            {strength.label}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Length</Label>
          <span className="text-sm text-muted-foreground font-mono">{length}</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={([value]) => setLength(value)}
          min={8}
          max={64}
          step={1}
          className="w-full"
          data-testid="slider-length"
        />
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
        <div className="flex items-center gap-2">
          <Checkbox
            id="uppercase"
            checked={uppercase}
            onCheckedChange={(checked) => setUppercase(checked === true)}
            data-testid="checkbox-uppercase"
          />
          <Label htmlFor="uppercase" className="text-sm cursor-pointer">
            ABC
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="lowercase"
            checked={lowercase}
            onCheckedChange={(checked) => setLowercase(checked === true)}
            data-testid="checkbox-lowercase"
          />
          <Label htmlFor="lowercase" className="text-sm cursor-pointer">
            abc
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="numbers"
            checked={numbers}
            onCheckedChange={(checked) => setNumbers(checked === true)}
            data-testid="checkbox-numbers"
          />
          <Label htmlFor="numbers" className="text-sm cursor-pointer">
            123
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="symbols"
            checked={symbols}
            onCheckedChange={(checked) => setSymbols(checked === true)}
            data-testid="checkbox-symbols"
          />
          <Label htmlFor="symbols" className="text-sm cursor-pointer">
            #$%
          </Label>
        </div>
      </div>

      {onSelect && (
        <Button
          type="button"
          onClick={handleUse}
          className="w-full"
          data-testid="button-use-password"
        >
          Use This Password
        </Button>
      )}
    </div>
  );
}
