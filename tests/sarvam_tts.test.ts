import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/tts/route";
import { NextRequest } from "next/server";

describe("Sarvam AI TTS API Route Tests", () => {
  it("rejects empty or missing text with 400 status", async () => {
    const req = new NextRequest("http://localhost:3000/api/tts", {
      method: "POST",
      body: JSON.stringify({ text: "   " }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("missing_text");
  });

  it("handles valid text and returns structured response from Sarvam AI", async () => {
    const req = new NextRequest("http://localhost:3000/api/tts", {
      method: "POST",
      body: JSON.stringify({
        text: "नमस्कार शेतकरी बंधूंनो",
        language: "mr",
        pace: 1.0,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toBeDefined();
    // Either returns success with audioBase64 or graceful fallback info
    if (json.success) {
      expect(json.provider).toBe("sarvamai");
      expect(typeof json.audioBase64).toBe("string");
    } else {
      expect(json.provider).toBe("sarvamai");
      expect(["insufficient_quota", "api_error"]).toContain(json.error);
    }
  });
});
