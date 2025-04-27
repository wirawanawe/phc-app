import * as jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Gunakan secret key yang sama untuk generasi dan verifikasi
const JWT_SECRET =
  process.env.JWT_SECRET || "default-secret-key-for-phc-app-2024";

export function verifyToken(token: string): TokenPayload | null {
  try {
    console.log("Verifying token - starting verification process");

    // Log what secret we're using (tetapi jangan tampilkan nilai sebenarnya)
    console.log("Using JWT_SECRET from environment:", !!process.env.JWT_SECRET);
    console.log("Secret length:", JWT_SECRET.length);

    // Try to decode without verification to check format
    try {
      const decoded = jwt.decode(token);
      if (!decoded) {
        console.log("Token decoding failed - not a valid JWT format");
      } else {
        console.log("Token format valid, contains keys:", Object.keys(decoded));
      }
    } catch (decodeErr) {
      console.log("Error during token pre-decoding:", decodeErr);
    }

    // Actual verification
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    console.log("Token verified successfully for user:", decoded.userId);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function generateToken(
  payload: Omit<TokenPayload, "iat" | "exp">
): string {
  console.log("Generating token for user:", payload.userId);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function getUserIdFromToken(token: string): string | null {
  const payload = verifyToken(token);
  return payload?.userId || null;
}

export function getRoleFromToken(token: string): string | null {
  const payload = verifyToken(token);
  return payload?.role || null;
}
