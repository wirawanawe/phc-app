import express from "express";
import {
  createHealthProgram,
  getAllHealthPrograms,
  getHealthProgramById,
  updateHealthProgram,
  deleteHealthProgram,
} from "../controllers/healthProgram.controller";

const router = express.Router();

// Health program routes
router.post("/", createHealthProgram);
router.get("/", getAllHealthPrograms);
router.get("/:id", getHealthProgramById);
router.put("/:id", updateHealthProgram);
router.delete("/:id", deleteHealthProgram);

export default router;
