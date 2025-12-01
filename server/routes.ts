import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { registerLocalUser, loginLocalUser } from "./localAuth";
import { z } from "zod";
import crypto from "crypto";

const vaultEntrySchema = z.object({
  title: z.string().min(1),
  website: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  encryptedPassword: z.string().min(1),
  notes: z.string().nullable().optional(),
  folderId: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

const folderSchema = z.object({
  name: z.string().min(1).max(50),
});

const webauthnChallenges = new Map<string, { challenge: string; type: "register" | "auth" }>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const user = await registerLocalUser({
        email,
        password,
        firstName,
        lastName,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.status(201).json(user);
      });
    } catch (error: any) {
      const message = error.message || "Registration failed";
      res.status(400).json({ message });
    }
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await loginLocalUser(email, password);

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json(user);
      });
    } catch (error: any) {
      const message = error.message || "Login failed";
      res.status(401).json({ message });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/vault", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getVaultEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching vault entries:", error);
      res.status(500).json({ message: "Failed to fetch vault entries" });
    }
  });

  app.get("/api/vault/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.getVaultEntry(req.params.id, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching vault entry:", error);
      res.status(500).json({ message: "Failed to fetch vault entry" });
    }
  });

  app.post("/api/vault", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = vaultEntrySchema.parse(req.body);
      
      const entry = await storage.createVaultEntry({
        userId,
        title: data.title,
        website: data.website || null,
        username: data.username || null,
        encryptedPassword: data.encryptedPassword,
        notes: data.notes || null,
        folderId: data.folderId || null,
        isFavorite: data.isFavorite || false,
        isDeleted: data.isDeleted || false,
      });
      
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating vault entry:", error);
      res.status(500).json({ message: "Failed to create vault entry" });
    }
  });

  app.patch("/api/vault/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = vaultEntrySchema.partial().parse(req.body);
      
      const entry = await storage.updateVaultEntry(req.params.id, userId, data);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating vault entry:", error);
      res.status(500).json({ message: "Failed to update vault entry" });
    }
  });

  app.delete("/api/vault/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteVaultEntry(req.params.id, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting vault entry:", error);
      res.status(500).json({ message: "Failed to delete vault entry" });
    }
  });

  app.get("/api/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folders = await storage.getFolders(userId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = folderSchema.parse(req.body);
      
      const folder = await storage.createFolder({
        userId,
        name: data.name,
      });
      
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating folder:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.patch("/api/folders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = folderSchema.partial().parse(req.body);
      
      const folder = await storage.updateFolder(req.params.id, userId, data);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating folder:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteFolder(req.params.id, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  app.post("/api/webauthn/register-challenge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenge = crypto.randomBytes(32).toString("base64");
      webauthnChallenges.set(userId, { challenge, type: "register" });
      
      setTimeout(() => webauthnChallenges.delete(userId), 60000);
      
      res.json({ challenge });
    } catch (error) {
      console.error("Error generating challenge:", error);
      res.status(500).json({ message: "Failed to generate challenge" });
    }
  });

  app.post("/api/webauthn/register", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { credential, deviceName } = req.body;
      
      const storedChallenge = webauthnChallenges.get(userId);
      if (!storedChallenge) {
        return res.status(400).json({ message: "Challenge expired or not found" });
      }
      
      webauthnChallenges.delete(userId);
      
      const webauthnCredential = await storage.createWebauthnCredential({
        userId,
        credentialId: credential.id,
        publicKey: credential.response.attestationObject,
        counter: "0",
        deviceName: deviceName || "Unknown device",
      });
      
      res.status(201).json({ id: webauthnCredential.id });
    } catch (error) {
      console.error("Error registering credential:", error);
      res.status(500).json({ message: "Failed to register credential" });
    }
  });

  app.get("/api/webauthn/credentials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const credentials = await storage.getWebauthnCredentials(userId);
      res.json(
        credentials.map((c) => ({
          id: c.id,
          deviceName: c.deviceName,
          createdAt: c.createdAt,
          lastUsed: c.lastUsed,
        }))
      );
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });

  app.post("/api/webauthn/auth-challenge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const credentials = await storage.getWebauthnCredentials(userId);
      
      if (credentials.length === 0) {
        return res.status(400).json({ message: "No fingerprint registered" });
      }

      const challenge = crypto.randomBytes(32).toString("base64");
      webauthnChallenges.set(userId, { challenge, type: "auth" });
      
      setTimeout(() => webauthnChallenges.delete(userId), 60000);
      
      res.json({
        challenge,
        allowCredentials: credentials.map((c) => ({
          id: c.credentialId,
          type: "public-key",
        })),
      });
    } catch (error) {
      console.error("Error generating auth challenge:", error);
      res.status(500).json({ message: "Failed to generate challenge" });
    }
  });

  app.post("/api/webauthn/authenticate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { credential } = req.body;
      
      const storedChallenge = webauthnChallenges.get(userId);
      if (!storedChallenge || storedChallenge.type !== "auth") {
        return res.status(400).json({ message: "Challenge expired or not found" });
      }
      
      webauthnChallenges.delete(userId);
      
      const storedCredential = await storage.getWebauthnCredentialById(credential.id);
      if (!storedCredential || storedCredential.userId !== userId) {
        return res.status(400).json({ message: "Invalid credential" });
      }

      const newCounter = String(parseInt(storedCredential.counter) + 1);
      await storage.updateWebauthnCredentialCounter(credential.id, newCounter);
      
      res.json({ success: true, verified: true });
    } catch (error) {
      console.error("Error authenticating:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  return httpServer;
}
