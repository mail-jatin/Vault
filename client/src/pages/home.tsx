import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultCard } from "@/components/vault/vault-card";
import { AddEditModal } from "@/components/vault/add-edit-modal";
import { FolderModal } from "@/components/vault/folder-modal";
import { DeleteConfirmModal } from "@/components/vault/delete-confirm-modal";
import { EntryDetail } from "@/components/vault/entry-detail";
import { EmptyState } from "@/components/vault/empty-state";
import { FingerprintSetup } from "@/components/vault/fingerprint-setup";
import { PasswordGenerator } from "@/components/vault/password-generator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { encryptPassword, decryptPassword } from "@/lib/encryption";
import type { VaultEntry, Folder } from "@shared/schema";
import { Key, Wand2, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [fingerprintSetupOpen, setFingerprintSetupOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<VaultEntry | null>(null);

  const { data: entries = [], isLoading: entriesLoading } = useQuery<VaultEntry[]>({
    queryKey: ["/api/vault"],
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
  });

  const entryCounts = useMemo(() => {
    const activeEntries = entries.filter((e) => !e.isDeleted);
    const deletedEntries = entries.filter((e) => e.isDeleted);
    const byFolder: Record<string, number> = {};

    folders.forEach((folder) => {
      byFolder[folder.id] = activeEntries.filter(
        (e) => e.folderId === folder.id
      ).length;
    });

    return {
      all: activeEntries.length,
      favorites: activeEntries.filter((e) => e.isFavorite).length,
      trash: deletedEntries.length,
      byFolder,
    };
  }, [entries, folders]);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (activeView === "all") {
      result = entries.filter((e) => !e.isDeleted);
    } else if (activeView === "favorites") {
      result = entries.filter((e) => e.isFavorite && !e.isDeleted);
    } else if (activeView === "trash") {
      result = entries.filter((e) => e.isDeleted);
    } else if (activeView.startsWith("folder-")) {
      const folderId = activeView.replace("folder-", "");
      result = entries.filter((e) => e.folderId === folderId && !e.isDeleted);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.website?.toLowerCase().includes(query) ||
          e.username?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [entries, activeView, searchQuery]);

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/vault", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault"] });
      setAddEditModalOpen(false);
      toast({ title: "Password saved", description: "Your password has been securely stored." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to save password.", variant: "destructive" });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/vault/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault"] });
      setAddEditModalOpen(false);
      setSelectedEntry(null);
      toast({ title: "Password updated", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update password.", variant: "destructive" });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vault/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault"] });
      setDeleteModalOpen(false);
      setEntryToDelete(null);
      toast({ title: "Password deleted", description: "The password has been removed." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete password.", variant: "destructive" });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return await apiRequest("POST", "/api/folders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setFolderModalOpen(false);
      toast({ title: "Folder created", description: "Your new folder is ready." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create folder.", variant: "destructive" });
    },
  });

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setAddEditModalOpen(true);
  };

  const handleEditEntry = (entry: VaultEntry) => {
    setSelectedEntry(entry);
    setAddEditModalOpen(true);
  };

  const handleDeleteEntry = (entry: VaultEntry) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  };

  const handleViewEntry = (entry: VaultEntry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  const handleToggleFavorite = async (entry: VaultEntry) => {
    await updateEntryMutation.mutateAsync({
      id: entry.id,
      data: { isFavorite: !entry.isFavorite },
    });
  };

  const handleSubmitEntry = async (data: any) => {
    const encrypted = await encryptPassword(data.password);
    
    if (selectedEntry) {
      await updateEntryMutation.mutateAsync({
        id: selectedEntry.id,
        data: {
          title: data.title,
          website: data.website || null,
          username: data.username || null,
          encryptedPassword: encrypted,
          notes: data.notes || null,
          folderId: data.folderId === "none" ? null : data.folderId || null,
        },
      });
    } else {
      await createEntryMutation.mutateAsync({
        title: data.title,
        website: data.website || null,
        username: data.username || null,
        encryptedPassword: encrypted,
        notes: data.notes || null,
        folderId: data.folderId === "none" ? null : data.folderId || null,
      });
    }
  };

  const handleSubmitFolder = async (data: { name: string }) => {
    await createFolderMutation.mutateAsync(data);
  };

  const handleSetupFingerprint = async (deviceName: string): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) {
        toast({
          title: "Not supported",
          description: "Your browser doesn't support fingerprint authentication.",
          variant: "destructive",
        });
        return false;
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        toast({
          title: "Not available",
          description: "No fingerprint sensor found on this device.",
          variant: "destructive",
        });
        return false;
      }

      const challengeRes = await apiRequest("POST", "/api/webauthn/register-challenge", {});
      const challenge = await challengeRes.json();

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge.challenge), (c) => c.charCodeAt(0)),
          rp: {
            name: "SecureVault",
            id: window.location.hostname,
          },
          user: {
            id: Uint8Array.from(user?.id || "user", (c) => c.charCodeAt(0)),
            name: user?.email || "user",
            displayName: user?.firstName || user?.email || "User",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });

      if (credential) {
        const rawIdArray = Array.from(new Uint8Array((credential as PublicKeyCredential).rawId));
        const attestationArray = Array.from(
          new Uint8Array(
            ((credential as PublicKeyCredential).response as AuthenticatorAttestationResponse).attestationObject
          )
        );
        const clientDataArray = Array.from(
          new Uint8Array((credential as PublicKeyCredential).response.clientDataJSON)
        );

        await apiRequest("POST", "/api/webauthn/register", {
          credential: {
            id: (credential as PublicKeyCredential).id,
            rawId: btoa(String.fromCharCode.apply(null, rawIdArray)),
            response: {
              attestationObject: btoa(String.fromCharCode.apply(null, attestationArray)),
              clientDataJSON: btoa(String.fromCharCode.apply(null, clientDataArray)),
            },
            type: (credential as PublicKeyCredential).type,
          },
          deviceName,
        });

        toast({
          title: "Fingerprint registered",
          description: "You can now use your fingerprint to unlock the vault.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Fingerprint setup error:", error);
      return false;
    }
  };

  const getViewTitle = () => {
    if (activeView === "all") return "All Items";
    if (activeView === "favorites") return "Favorites";
    if (activeView === "trash") return "Trash";
    if (activeView.startsWith("folder-")) {
      const folderId = activeView.replace("folder-", "");
      const folder = folders.find((f) => f.id === folderId);
      return folder?.name || "Folder";
    }
    return "Vault";
  };

  const getEmptyStateType = (): "all" | "favorites" | "folder" | "trash" | "search" => {
    if (searchQuery.trim()) return "search";
    if (activeView === "favorites") return "favorites";
    if (activeView === "trash") return "trash";
    if (activeView.startsWith("folder-")) return "folder";
    return "all";
  };

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  const currentFolder = activeView.startsWith("folder-")
    ? folders.find((f) => f.id === activeView.replace("folder-", ""))
    : null;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar
          user={user || null}
          folders={folders}
          entryCounts={entryCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddEntry={handleAddEntry}
          onAddFolder={() => setFolderModalOpen(true)}
          onSetupFingerprint={() => setFingerprintSetupOpen(true)}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">{getViewTitle()}</h1>
              <span className="text-sm text-muted-foreground">
                {filteredEntries.length} {filteredEntries.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-generate">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <PasswordGenerator />
                </PopoverContent>
              </Popover>
              <Button size="sm" onClick={handleAddEntry} data-testid="button-header-add">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {entriesLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <EmptyState
                type={getEmptyStateType()}
                folderName={currentFolder?.name}
                onAdd={handleAddEntry}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEntries.map((entry) => (
                  <VaultCard
                    key={entry.id}
                    entry={entry}
                    folder={folders.find((f) => f.id === entry.folderId) || null}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                    onToggleFavorite={handleToggleFavorite}
                    onView={handleViewEntry}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <AddEditModal
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        entry={selectedEntry}
        folders={folders}
        onSubmit={handleSubmitEntry}
        isSubmitting={createEntryMutation.isPending || updateEntryMutation.isPending}
      />

      <FolderModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        folder={selectedFolder}
        onSubmit={handleSubmitFolder}
        isSubmitting={createFolderMutation.isPending}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Password"
        description={`Are you sure you want to delete "${entryToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => entryToDelete && deleteEntryMutation.mutate(entryToDelete.id)}
        isDeleting={deleteEntryMutation.isPending}
      />

      <EntryDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        entry={selectedEntry}
        folder={selectedEntry ? folders.find((f) => f.id === selectedEntry.folderId) || null : null}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onToggleFavorite={handleToggleFavorite}
      />

      <FingerprintSetup
        open={fingerprintSetupOpen}
        onOpenChange={setFingerprintSetupOpen}
        onSetup={handleSetupFingerprint}
      />
    </SidebarProvider>
  );
}
