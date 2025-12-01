import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Lock,
  Key,
  Star,
  Folder,
  Trash2,
  Plus,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  Fingerprint,
  FolderPlus,
} from "lucide-react";
import type { User, Folder as FolderType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  user: User | null;
  folders: FolderType[];
  entryCounts: {
    all: number;
    favorites: number;
    trash: number;
    byFolder: Record<string, number>;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddEntry: () => void;
  onAddFolder: () => void;
  onSetupFingerprint: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({
  user,
  folders,
  entryCounts,
  searchQuery,
  onSearchChange,
  onAddEntry,
  onAddFolder,
  onSetupFingerprint,
  activeView,
  onViewChange,
}: AppSidebarProps) {
  const [location] = useLocation();

  const mainItems = [
    {
      id: "all",
      title: "All Items",
      icon: Key,
      count: entryCounts.all,
    },
    {
      id: "favorites",
      title: "Favorites",
      icon: Star,
      count: entryCounts.favorites,
    },
    {
      id: "trash",
      title: "Trash",
      icon: Trash2,
      count: entryCounts.trash,
    },
  ];

  const getUserInitials = (user: User | null) => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">SecureVault</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-sidebar-accent/50"
            data-testid="input-search"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2">
            <Button
              className="w-full justify-start"
              onClick={onAddEntry}
              data-testid="button-add-password"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Password
            </Button>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className="w-full"
                    data-testid={`nav-${item.id}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.count > 0 && (
                      <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-4">
            <span>Folders</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onAddFolder}
              data-testid="button-add-folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.length === 0 ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  No folders yet
                </div>
              ) : (
                folders.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(`folder-${folder.id}`)}
                      isActive={activeView === `folder-${folder.id}`}
                      className="w-full"
                      data-testid={`nav-folder-${folder.id}`}
                    >
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{folder.name}</span>
                      {(entryCounts.byFolder[folder.id] || 0) > 0 && (
                        <SidebarMenuBadge>
                          {entryCounts.byFolder[folder.id]}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onSetupFingerprint}
              className="w-full"
              data-testid="button-sidebar-fingerprint"
            >
              <Fingerprint className="h-4 w-4" />
              <span>Fingerprint</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2 px-2 mt-2"
              data-testid="button-user-menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName || user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <a href="/settings" data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="/api/logout"
                className="text-destructive focus:text-destructive"
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
