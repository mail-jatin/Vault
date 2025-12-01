import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  Globe,
} from "lucide-react";
import type { VaultEntry, Folder } from "@shared/schema";
import { getFaviconUrl, copyToClipboard } from "@/lib/authUtils";
import { cn } from "@/lib/utils";

interface VaultCardProps {
  entry: VaultEntry;
  folder?: Folder | null;
  onEdit: (entry: VaultEntry) => void;
  onDelete: (entry: VaultEntry) => void;
  onToggleFavorite: (entry: VaultEntry) => void;
  onView: (entry: VaultEntry) => void;
}

export function VaultCard({
  entry,
  folder,
  onEdit,
  onDelete,
  onToggleFavorite,
  onView,
}: VaultCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const faviconUrl = getFaviconUrl(entry.website);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const displayPassword = entry.encryptedPassword || "••••••••••••";

  return (
    <Card
      className="group hover-elevate cursor-pointer"
      onClick={() => onView(entry)}
      data-testid={`card-vault-entry-${entry.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{entry.title}</h3>
              {entry.isFavorite && (
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {entry.username || entry.website || "No username"}
            </p>
            {folder && (
              <p className="text-xs text-muted-foreground/60 truncate mt-1">
                {folder.name}
              </p>
            )}
          </div>

          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(entry.username || "", "username");
              }}
              data-testid={`button-copy-username-${entry.id}`}
            >
              {copiedField === "username" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(displayPassword, "password");
              }}
              data-testid={`button-copy-password-${entry.id}`}
            >
              {copiedField === "password" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  data-testid={`button-menu-${entry.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                  data-testid={`menu-edit-${entry.id}`}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(entry);
                  }}
                  data-testid={`menu-favorite-${entry.id}`}
                >
                  <Star className={cn("mr-2 h-4 w-4", entry.isFavorite && "fill-yellow-500 text-yellow-500")} />
                  {entry.isFavorite ? "Remove from favorites" : "Add to favorites"}
                </DropdownMenuItem>
                {entry.website && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = entry.website?.startsWith("http")
                        ? entry.website
                        : `https://${entry.website}`;
                      window.open(url, "_blank");
                    }}
                    data-testid={`menu-open-${entry.id}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open website
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry);
                  }}
                  className="text-destructive focus:text-destructive"
                  data-testid={`menu-delete-${entry.id}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
