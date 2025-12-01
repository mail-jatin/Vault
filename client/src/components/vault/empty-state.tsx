import { Button } from "@/components/ui/button";
import { Lock, Plus, FolderOpen, Star, Search, Trash2 } from "lucide-react";

interface EmptyStateProps {
  type: "all" | "favorites" | "folder" | "trash" | "search";
  folderName?: string;
  onAdd?: () => void;
}

export function EmptyState({ type, folderName, onAdd }: EmptyStateProps) {
  const content = {
    all: {
      icon: Lock,
      title: "Your vault is empty",
      description: "Add your first password to get started. Your passwords are encrypted and stored securely.",
      action: "Add Password",
    },
    favorites: {
      icon: Star,
      title: "No favorites yet",
      description: "Star your most-used passwords to access them quickly here.",
      action: null,
    },
    folder: {
      icon: FolderOpen,
      title: `No passwords in ${folderName || "this folder"}`,
      description: "Add passwords to this folder or move existing ones here.",
      action: "Add Password",
    },
    trash: {
      icon: Trash2,
      title: "Trash is empty",
      description: "Deleted passwords will appear here. They can be restored or permanently deleted.",
      action: null,
    },
    search: {
      icon: Search,
      title: "No results found",
      description: "Try a different search term or check your spelling.",
      action: null,
    },
  };

  const { icon: Icon, title, description, action } = content[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {action && onAdd && (
        <Button onClick={onAdd} data-testid="button-empty-add">
          <Plus className="mr-2 h-4 w-4" />
          {action}
        </Button>
      )}
    </div>
  );
}
