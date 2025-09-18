import express from "express";
import { runCompleteSystemTest, runSystemHealthCheck } from "../utils/testValidator.js";
import { authenticate as protect, IsAdmin as adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Complete system validation
router.get("/validate-system", protect, adminOnly, async (req, res) => {    
  try {
    const results = await runCompleteSystemTest();
    res.json({
      message: "System validation completed",
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    res.status(500).json({
      message: "System validation failed",  
      error: error.message
    });
  }
});

// Quick health check
router.get("/health", async (req, res) => {
  try {
    const results = await runSystemHealthCheck();
    const isHealthy = Object.values(results).every(Boolean);
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks: results
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      error: error.message
    });
  }
});

export default router;
