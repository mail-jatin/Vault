import {
  users,
  sessions,
  vaultEntries,
  folders,
  webauthnCredentials,
  type User,
  type UpsertUser,
  type VaultEntry,
  type InsertVaultEntry,
  type Folder,
  type InsertFolder,
  type WebauthnCredential,
  type InsertWebauthnCredential,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getVaultEntries(userId: string): Promise<VaultEntry[]>;
  getVaultEntry(id: string, userId: string): Promise<VaultEntry | undefined>;
  createVaultEntry(entry: InsertVaultEntry): Promise<VaultEntry>;
  updateVaultEntry(id: string, userId: string, entry: Partial<InsertVaultEntry>): Promise<VaultEntry | undefined>;
  deleteVaultEntry(id: string, userId: string): Promise<boolean>;
  
  getFolders(userId: string): Promise<Folder[]>;
  getFolder(id: string, userId: string): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: string, userId: string, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: string, userId: string): Promise<boolean>;
  
  getWebauthnCredentials(userId: string): Promise<WebauthnCredential[]>;
  getWebauthnCredentialById(credentialId: string): Promise<WebauthnCredential | undefined>;
  createWebauthnCredential(credential: InsertWebauthnCredential): Promise<WebauthnCredential>;
  updateWebauthnCredentialCounter(credentialId: string, counter: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getVaultEntries(userId: string): Promise<VaultEntry[]> {
    return await db
      .select()
      .from(vaultEntries)
      .where(eq(vaultEntries.userId, userId))
      .orderBy(sql`${vaultEntries.updatedAt} DESC`);
  }

  async getVaultEntry(id: string, userId: string): Promise<VaultEntry | undefined> {
    const [entry] = await db
      .select()
      .from(vaultEntries)
      .where(and(eq(vaultEntries.id, id), eq(vaultEntries.userId, userId)));
    return entry;
  }

  async createVaultEntry(entry: InsertVaultEntry): Promise<VaultEntry> {
    const [created] = await db.insert(vaultEntries).values(entry).returning();
    return created;
  }

  async updateVaultEntry(
    id: string,
    userId: string,
    entry: Partial<InsertVaultEntry>
  ): Promise<VaultEntry | undefined> {
    const [updated] = await db
      .update(vaultEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(and(eq(vaultEntries.id, id), eq(vaultEntries.userId, userId)))
      .returning();
    return updated;
  }

  async deleteVaultEntry(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(vaultEntries)
      .where(and(eq(vaultEntries.id, id), eq(vaultEntries.userId, userId)));
    return true;
  }

  async getFolders(userId: string): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.name);
  }

  async getFolder(id: string, userId: string): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return folder;
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [created] = await db.insert(folders).values(folder).returning();
    return created;
  }

  async updateFolder(
    id: string,
    userId: string,
    folder: Partial<InsertFolder>
  ): Promise<Folder | undefined> {
    const [updated] = await db
      .update(folders)
      .set({ ...folder, updatedAt: new Date() })
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .returning();
    return updated;
  }

  async deleteFolder(id: string, userId: string): Promise<boolean> {
    await db
      .update(vaultEntries)
      .set({ folderId: null })
      .where(and(eq(vaultEntries.folderId, id), eq(vaultEntries.userId, userId)));
    
    await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return true;
  }

  async getWebauthnCredentials(userId: string): Promise<WebauthnCredential[]> {
    return await db
      .select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.userId, userId));
  }

  async getWebauthnCredentialById(credentialId: string): Promise<WebauthnCredential | undefined> {
    const [credential] = await db
      .select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.credentialId, credentialId));
    return credential;
  }

  async createWebauthnCredential(credential: InsertWebauthnCredential): Promise<WebauthnCredential> {
    const [created] = await db
      .insert(webauthnCredentials)
      .values(credential)
      .returning();
    return created;
  }

  async updateWebauthnCredentialCounter(credentialId: string, counter: string): Promise<void> {
    await db
      .update(webauthnCredentials)
      .set({ counter, lastUsed: new Date() })
      .where(eq(webauthnCredentials.credentialId, credentialId));
  }
}

export const storage = new DatabaseStorage();
