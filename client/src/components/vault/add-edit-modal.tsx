import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Eye, EyeOff, Wand2, ChevronDown, Loader2 } from "lucide-react";
import { PasswordGenerator } from "./password-generator";
import type { VaultEntry, Folder } from "@shared/schema";
import { calculatePasswordStrength } from "@/lib/authUtils";
import { decryptPassword } from "@/lib/encryption";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  website: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1, "Password is required"),
  notes: z.string().optional(),
  folderId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: VaultEntry | null;
  folders: Folder[];
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function AddEditModal({
  open,
  onOpenChange,
  entry,
  folders,
  onSubmit,
  isSubmitting,
}: AddEditModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      website: "",
      username: "",
      password: "",
      notes: "",
      folderId: "",
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        website: entry.website || "",
        username: entry.username || "",
        password: entry.encryptedPassword || "",
        notes: entry.notes || "",
        folderId: entry.folderId || "",
      });
    } else {
      form.reset({
        title: "",
        website: "",
        username: "",
        password: "",
        notes: "",
        folderId: "",
      });
    }
    setShowGenerator(false);
    setShowPassword(false);
  }, [entry, form, open]);

  const password = form.watch("password");
  const strength = password ? calculatePasswordStrength(password) : null;

  const getStrengthColor = () => {
    if (!strength) return "bg-muted";
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

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Password" : "Add New Password"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Google Account"
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. google.com"
                      {...field}
                      data-testid="input-website"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username / Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username or email"
                      {...field}
                      data-testid="input-username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="pr-20 font-mono"
                          {...field}
                          data-testid="input-password"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => setShowGenerator(!showGenerator)}
                            data-testid="button-open-generator"
                          >
                            <Wand2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {strength && (
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
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Collapsible open={showGenerator} onOpenChange={setShowGenerator}>
              <CollapsibleContent className="pt-2">
                <div className="p-4 rounded-md bg-muted/50 border">
                  <PasswordGenerator
                    compact
                    onSelect={(password) => {
                      form.setValue("password", password);
                      setShowGenerator(false);
                    }}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {folders.length > 0 && (
              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-folder">
                          <SelectValue placeholder="Select a folder (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No folder</SelectItem>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between px-0 hover:bg-transparent"
                  data-testid="button-toggle-notes"
                >
                  <span className="text-sm text-muted-foreground">Add notes</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes..."
                          className="min-h-[80px] resize-none"
                          {...field}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-save"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {entry ? "Save Changes" : "Add Password"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
