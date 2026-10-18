import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = "mr", pace = 1.0, speaker } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "missing_text", message: "Text parameter is required" },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "sarvam_tts.py");
    const payload = JSON.stringify({
      text: text.trim(),
      language,
      pace: Number(pace) || 1.0,
      speaker: speaker || undefined,
    });

    const pythonBin = process.env.PYTHON_BIN || "python";

    // Spawn python process
    const result = await new Promise<{
      stdout: string;
      stderr: string;
      exitCode: number | null;
    }>((resolve) => {
      const child = spawn(pythonBin, [scriptPath], {
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.setEncoding("utf-8");
      child.stderr.setEncoding("utf-8");

      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });

      child.on("close", (code) => {
        resolve({ stdout, stderr, exitCode: code });
      });

      child.on("error", (err) => {
        resolve({ stdout: "", stderr: err.message, exitCode: -1 });
      });

      // Write payload to stdin and close
      child.stdin.setDefaultEncoding("utf-8");
      child.stdin.write(payload);
      child.stdin.end();

      // 12 second timeout
      setTimeout(() => {
        try {
          child.kill();
        } catch {
          // ignore
        }
        resolve({ stdout, stderr: "Process timed out after 12s", exitCode: -2 });
      }, 12000);
    });

    if (result.stdout.trim()) {
      try {
        const parsed = JSON.parse(result.stdout.trim());
        return NextResponse.json(parsed);
      } catch (e) {
        console.error("Failed to parse Sarvam Python output:", result.stdout, e);
        return NextResponse.json({
          success: false,
          fallback: true,
          error: "parse_error",
          raw: result.stdout,
        });
      }
    }

    return NextResponse.json({
      success: false,
      fallback: true,
      error: "process_failed",
      stderr: result.stderr,
    });
  } catch (error: any) {
    console.error("TTS API route error:", error);
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        error: "internal_error",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
