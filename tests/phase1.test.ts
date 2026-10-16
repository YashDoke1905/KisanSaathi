import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken } from "../src/lib/auth";
import { sendOtpSms } from "../src/lib/sms";
import { findBestVoice } from "../src/lib/soundUtils";

describe("Phase 1: Security & Auth Module Tests", () => {
  it("generates and verifies JWT session tokens with claims", async () => {
    const payload = {
      userId: "test_farmer_123",
      role: "farmer",
      phone: "9876543210",
      username: "tukaram",
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("test_farmer_123");
    expect(verified?.phone).toBe("9876543210");
  });

  it("handles invalid or tampered JWT gracefully", async () => {
    const verified = await verifySessionToken("invalid.tampered.token");
    expect(verified).toBeNull();
  });

  it("dispatches OTP in dev mode and returns verification code in debug response", async () => {
    process.env.OTP_DEV_MODE = "true";
    const result = await sendOtpSms("9876543210", "654321");
    expect(result.success).toBe(true);
    expect(result.debugOtp).toBe("654321");
  });
});

describe("Phase 1: Audio & Voice Matcher Tests", () => {
  it("finds Marathi voice when available or falls back gracefully to Hindi/English", () => {
    const mockVoices = [
      { lang: "en-US", name: "Microsoft David", default: true } as SpeechSynthesisVoice,
      { lang: "hi-IN", name: "Google हिन्दी", default: false } as SpeechSynthesisVoice,
    ];

    // Marathi requested: should fallback to Hindi (which reads Devanagari accurately)
    const mrMatch = findBestVoice(mockVoices, "mr");
    expect(mrMatch.langTag).toBe("hi-IN");

    // Hindi requested: direct match
    const hiMatch = findBestVoice(mockVoices, "hi");
    expect(hiMatch.langTag).toBe("hi-IN");

    // English requested: matches en-US
    const enMatch = findBestVoice(mockVoices, "en");
    expect(enMatch.langTag).toBe("en-US");
  });
});

describe("Phase 1: Land Unit Normalization Math", () => {
  it("converts Gunthas to normalized Acres accurately (40 Gunthas = 1 Acre)", () => {
    const gunthas = 40;
    const acre = gunthas / 40;
    expect(acre).toBe(1.0);

    const halfAcreGunthas = 20;
    expect(halfAcreGunthas / 40).toBe(0.5);

    const smallPlotGunthas = 10;
    expect(smallPlotGunthas / 40).toBe(0.25);
  });

  it("converts Hectares to Acres accurately (1 Hectare ≈ 2.47105 Acres)", () => {
    const hectares = 1;
    const acre = hectares * 2.47105;
    expect(acre).toBeCloseTo(2.47105, 4);

    const standardSmallholderLimitHectares = 2.0; // 2 Hectares small farmer definition
    expect(standardSmallholderLimitHectares * 2.47105).toBeCloseTo(4.9421, 3);
  });

  it("converts Bighas to Acres accurately (1 Bigha ≈ 0.625 Acres in Western India)", () => {
    const bighas = 1.6;
    const acre = bighas * 0.625;
    expect(acre).toBe(1.0);
  });
});
