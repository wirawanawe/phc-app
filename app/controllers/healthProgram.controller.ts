import { Request, Response } from "express";
import { HealthProgramModel } from "../models";

export const createHealthProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const programData = req.body;
    const newProgram = await HealthProgramModel.create(programData);

    res.status(201).json({
      success: true,
      message: "Health program created successfully",
      data: newProgram,
    });
  } catch (error) {
    console.error("Error creating health program:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create health program",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllHealthPrograms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const programs = await HealthProgramModel.findAll();

    res.status(200).json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error("Error fetching health programs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch health programs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getHealthProgramById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      res.status(404).json({
        success: false,
        message: "Health program not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error fetching health program:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch health program",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateHealthProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      res.status(404).json({
        success: false,
        message: "Health program not found",
      });
      return;
    }

    await program.update(updateData);

    res.status(200).json({
      success: true,
      message: "Health program updated successfully",
      data: program,
    });
  } catch (error) {
    console.error("Error updating health program:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update health program",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteHealthProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      res.status(404).json({
        success: false,
        message: "Health program not found",
      });
      return;
    }

    await program.destroy();

    res.status(200).json({
      success: true,
      message: "Health program deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting health program:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete health program",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
