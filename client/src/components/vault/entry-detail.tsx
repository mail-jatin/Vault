import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  Globe,
  Check,
  Clock,
} from "lucide-react";
import type { VaultEntry, Folder } from "@shared/schema";
import { getFaviconUrl, copyToClipboard, calculatePasswordStrength } from "@/lib/authUtils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EntryDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: VaultEntry | null;
  folder?: Folder | null;
  onEdit: (entry: VaultEntry) => void;
  onDelete: (entry: VaultEntry) => void;
  onToggleFavorite: (entry: VaultEntry) => void;
}

export function EntryDetail({
  open,
  onOpenChange,
  entry,
  folder,
  onEdit,
  onDelete,
  onToggleFavorite,
}: EntryDetailProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!entry) return null;

  const faviconUrl = getFaviconUrl(entry.website);
  const displayPassword = entry.encryptedPassword || "••••••••••••";
  const strength = entry.encryptedPassword
    ? calculatePasswordStrength(entry.encryptedPassword)
    : null;

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getStrengthColor = () => {
    if (!strength) return "bg-muted";
    switch (strength.score) {
      case 1:
        return "bg-red-500 text-white";
      case 2:
        return "bg-yellow-500 text-white";
      case 3:
        return "bg-primary text-white";
      case 4:
        return "bg-green-500 text-white";
      default:
        return "bg-muted";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Globe className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg truncate">{entry.title}</SheetTitle>
                {entry.isFavorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>
              {entry.website && (
                <a
                  href={entry.website.startsWith("http") ? entry.website : `https://${entry.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  data-testid="link-website"
                >
                  {entry.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {folder && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">FOLDER</p>
              <Badge variant="secondary" className="text-xs">
                {folder.name}
              </Badge>
            </div>
          )}

          {entry.username && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">USERNAME / EMAIL</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium flex-1 truncate">{entry.username}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => handleCopy(entry.username || "", "username")}
                  data-testid="button-detail-copy-username"
                >
                  {copiedField === "username" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">PASSWORD</p>
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-sm font-mono flex-1",
                !showPassword && "password-blur select-none"
              )}>
                {showPassword ? displayPassword : "••••••••••••••••"}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-detail-toggle-password"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleCopy(displayPassword, "password")}
                data-testid="button-detail-copy-password"
              >
                {copiedField === "password" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {strength && (
              <Badge className={cn("mt-2 text-xs", getStrengthColor())}>
                {strength.label}
              </Badge>
            )}
          </div>

          {entry.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">NOTES</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {entry.notes}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">LAST MODIFIED</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {entry.updatedAt
                ? format(new Date(entry.updatedAt), "MMM d, yyyy 'at' h:mm a")
                : "Unknown"}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onToggleFavorite(entry);
              }}
              data-testid="button-detail-favorite"
            >
              <Star className={cn("mr-2 h-4 w-4", entry.isFavorite && "fill-yellow-500 text-yellow-500")} />
              {entry.isFavorite ? "Unfavorite" : "Favorite"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onEdit(entry);
                onOpenChange(false);
              }}
              data-testid="button-detail-edit"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                onDelete(entry);
                onOpenChange(false);
              }}
              className="text-destructive hover:text-destructive"
              data-testid="button-detail-delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
