// API route for AI agent
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { gameState, tiles, aiUnits, aiCards, gridSize } = req.body;

    if (!gameState || !tiles || !aiUnits || !gridSize) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Path to the AI agent script
    const agentPath = path.join(process.cwd(), "..", "agent");

    // Create temporary input file with the game state
    const inputData = JSON.stringify({
      gameState,
      tiles,
      aiUnits,
      aiCards,
      gridSize,
    });

    // Call the AI agent as a separate process
    console.log("Running AI agent...");

    // Execute the AI agent script
    const { stdout, stderr } = await execPromise(
      `cd ${agentPath} && node dist/src/game-ai-agent.js '${inputData.replace(
        /'/g,
        "\\'"
      )}'`
    );

    if (stderr) {
      console.error("AI agent stderr:", stderr);
    }

    // Parse the agent's output
    let result;
    try {
      result = JSON.parse(stdout);
    } catch (e) {
      console.error("Error parsing AI agent output:", e);
      console.log("Raw output:", stdout);
      return res.status(500).json({
        error: "Failed to parse AI agent output",
        message: "AI agent encountered an issue.",
      });
    }

    // Return the result
    return res.status(200).json({
      tiles: result.tiles || tiles,
      aiUnits: result.aiUnits || aiUnits,
      message: result.message || "AI has completed its turn.",
    });
  } catch (error) {
    console.error("AI agent error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "AI agent encountered an unexpected error.",
    });
  }
}
