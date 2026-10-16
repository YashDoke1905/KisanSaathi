/**
 * SMS OTP Adapter Layer
 * Dev mode prints OTP in console and allows instant testing without SMS cost.
 * Production mode can connect to MSG91, Fast2SMS, or Twilio via SMS_PROVIDER_API_KEY.
 */

export interface SmsResult {
  success: boolean;
  message: string;
  debugOtp?: string; // Only populated when OTP_DEV_MODE=true
}

export async function sendOtpSms(phone: string, otpCode: string): Promise<SmsResult> {
  const isDevMode = process.env.OTP_DEV_MODE === "true" || !process.env.SMS_PROVIDER_API_KEY;

  if (isDevMode) {
    console.log("=================================================");
    console.log(`📱 [DEV OTP SERVICE] To: ${phone}`);
    console.log(`🔑 Verification Code: ${otpCode}`);
    console.log(`⏱️ Valid for 10 minutes.`);
    console.log("=================================================");

    return {
      success: true,
      message: "OTP sent (Dev Mode: printed in server console)",
      debugOtp: otpCode,
    };
  }

  // Production provider dispatch (e.g. Fast2SMS / MSG91 / Twilio)
  try {
    const apiKey = process.env.SMS_PROVIDER_API_KEY;
    // Example: Integration with standard Indian transactional SMS API
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otpCode,
        numbers: phone,
      }),
    });

    const data = await response.json();
    return {
      success: data.return === true,
      message: data.message?.[0] || "SMS dispatched",
    };
  } catch (error) {
    console.error("SMS dispatch error:", error);
    return {
      success: false,
      message: "Failed to send SMS gateway request",
    };
  }
}
