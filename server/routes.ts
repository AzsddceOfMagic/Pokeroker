import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTrainingSessionSchema, insertBotSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check for daily credit regeneration
      await storage.regenerateCredits(userId);
      const updatedUser = await storage.getUser(userId);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Scenario routes
  app.get('/api/scenarios/:type', isAuthenticated, async (req, res) => {
    try {
      const { type } = req.params;
      
      if (type !== 'gto' && type !== 'icm') {
        return res.status(400).json({ message: "Invalid scenario type" });
      }
      
      const scenarios = await storage.getScenariosByType(type);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ message: "Failed to fetch scenarios" });
    }
  });

  app.get('/api/scenarios/single/:id', isAuthenticated, async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.id);
      const scenario = await storage.getScenario(scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error fetching scenario:", error);
      res.status(500).json({ message: "Failed to fetch scenario" });
    }
  });

  // Training session routes
  app.post('/api/training/session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertTrainingSessionSchema.parse(req.body);
      
      // Get scenario to check credit cost
      const scenario = await storage.getScenario(sessionData.scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
      // Deduct credits
      const creditsDeducted = await storage.deductCredits(userId, scenario.credits);
      if (!creditsDeducted) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      
      // Create training session
      const session = await storage.createTrainingSession({
        ...sessionData,
        userId,
        creditsSpent: scenario.credits,
      });
      
      // Update user progress
      const currentProgress = await storage.getUserProgress(userId);
      const sessionsPlayed = currentProgress ? currentProgress.totalHandsPlayed + 1 : 1;
      const newAccuracy = sessionData.isCorrect ? 100 : 0;
      
      let gtoAccuracy = currentProgress?.gtoAccuracy || 0;
      let icmScore = currentProgress?.icmScore || 0;
      
      if (scenario.type === 'gto') {
        gtoAccuracy = currentProgress ? 
          ((Number(currentProgress.gtoAccuracy) * (sessionsPlayed - 1)) + newAccuracy) / sessionsPlayed :
          newAccuracy;
      } else if (scenario.type === 'icm') {
        icmScore = currentProgress ?
          ((Number(currentProgress.icmScore) * (sessionsPlayed - 1)) + newAccuracy) / sessionsPlayed :
          newAccuracy;
      }
      
      await storage.updateUserProgress(userId, {
        totalHandsPlayed: sessionsPlayed,
        gtoAccuracy: gtoAccuracy.toString(),
        icmScore: icmScore.toString(),
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ message: "Failed to create training session" });
    }
  });

  app.get('/api/training/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserTrainingSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ message: "Failed to fetch training sessions" });
    }
  });

  // Bot session routes
  app.post('/api/bot/session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertBotSessionSchema.parse(req.body);
      
      // Deduct credits for bot practice (25 credits per session)
      const creditsDeducted = await storage.deductCredits(userId, 25);
      if (!creditsDeducted) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      
      const session = await storage.createBotSession({
        ...sessionData,
        userId,
        creditsSpent: 25,
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating bot session:", error);
      res.status(500).json({ message: "Failed to create bot session" });
    }
  });

  app.put('/api/bot/session/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      
      const session = await storage.updateBotSession(sessionId, updates);
      res.json(session);
    } catch (error) {
      console.error("Error updating bot session:", error);
      res.status(500).json({ message: "Failed to update bot session" });
    }
  });

  app.get('/api/bot/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserBotSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching bot sessions:", error);
      res.status(500).json({ message: "Failed to fetch bot sessions" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      
      if (!progress) {
        // Create default progress
        const defaultProgress = await storage.updateUserProgress(userId, {
          gtoAccuracy: "0",
          icmScore: "0",
          totalHandsPlayed: 0,
          winRate: "0",
          preflopAccuracy: "0",
          postflopAccuracy: "0",
          bettingSizeAccuracy: "0",
        });
        return res.json(defaultProgress);
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Credit management routes
  app.post('/api/credits/regenerate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.regenerateCredits(userId);
      res.json({ credits: user.credits });
    } catch (error) {
      console.error("Error regenerating credits:", error);
      res.status(500).json({ message: "Failed to regenerate credits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
