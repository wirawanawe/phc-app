import { NextRequest, NextResponse } from "next/server";
import { WebsiteSettingsModel } from "@/app/models";

// Helper to ensure URL paths are properly formatted
function normalizeUrlPath(url: string): string {
  if (!url) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

// GET /api/settings - Get current website settings
export async function GET() {
  try {
    // Get the first settings entry or create default if none exists
    const [settings] = await WebsiteSettingsModel.findOrCreate({
      where: {},
      defaults: {
        logoUrl: "/logo doctorPHC.jpg",
        heroBackgroundUrl: "/hero-background.jpg",
        email: "support@phc.com",
        phone: "+62 21 1234 5678",
        whatsapp: "+6281234567890",
        address: "Jl. Kesehatan No. 123, Jakarta, Indonesia",
        workingHours:
          "Senin - Jumat: 08.00 - 17.00\nSabtu: 09.00 - 15.00\nMinggu: Tutup",
        mapLocation:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126933.56208307289!2d106.7271068502019!3d-6.176921781125624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f436b8c94d63%3A0x6ea6d5398b7c784d!2sJakarta%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1667793998540!5m2!1sid!2sid",
        facebook: "",
        twitter: "",
        instagram: "",
        youtube: "",
      },
    });

    // Normalize image URLs before sending to client
    const normalizedSettings = settings.toJSON();
    normalizedSettings.logoUrl = normalizeUrlPath(normalizedSettings.logoUrl);
    normalizedSettings.heroBackgroundUrl = normalizeUrlPath(
      normalizedSettings.heroBackgroundUrl
    );

    return NextResponse.json({ success: true, data: normalizedSettings });
  } catch (error) {
    console.error("Error fetching website settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch website settings: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update website settings
export async function PUT(request: NextRequest) {
  try {
    // Check for auth cookie (optional, we'll rely on x-user header)
    const cookies = request.cookies;
    const authCookie = cookies.get("auth_token");

    // Get user from request header (primary authentication method)
    const user = request.headers.get("x-user");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - User data missing" },
        { status: 401 }
      );
    }

    // Parse the user data
    let userData;
    try {
      userData = JSON.parse(user);
    } catch (e) {
      console.error("Failed to parse user data:", e);
      return NextResponse.json(
        { success: false, error: "Invalid user data format" },
        { status: 401 }
      );
    }

    // Check for admin role
    if (!userData.role || userData.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get request body
    let data;
    try {
      data = await request.json();

      // Normalize image URLs
      if (data.logoUrl) {
        data.logoUrl = normalizeUrlPath(data.logoUrl);
      }
      if (data.heroBackgroundUrl) {
        data.heroBackgroundUrl = normalizeUrlPath(data.heroBackgroundUrl);
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid request body format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !data.email ||
      !data.phone ||
      !data.whatsapp ||
      !data.address ||
      !data.workingHours
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All contact information fields are required",
        },
        { status: 400 }
      );
    }

    // Get settings to update
    const settings = await WebsiteSettingsModel.findOne();

    if (!settings) {
      // Create new settings if none exist
      try {
        const newSettings = await WebsiteSettingsModel.create(data);

        // Normalize image URLs before sending to client
        const normalizedSettings = newSettings.toJSON();
        normalizedSettings.logoUrl = normalizeUrlPath(
          normalizedSettings.logoUrl
        );
        normalizedSettings.heroBackgroundUrl = normalizeUrlPath(
          normalizedSettings.heroBackgroundUrl
        );

        return NextResponse.json({ success: true, data: normalizedSettings });
      } catch (createError) {
        console.error("Error creating settings:", createError);
        const errMsg =
          createError instanceof Error ? createError.message : "Database error";
        return NextResponse.json(
          { success: false, error: `Failed to create settings: ${errMsg}` },
          { status: 500 }
        );
      }
    }

    // Update existing settings
    try {
      await settings.update(data);

      // Normalize image URLs before sending to client
      const updatedSettings = settings.toJSON();
      updatedSettings.logoUrl = normalizeUrlPath(updatedSettings.logoUrl);
      updatedSettings.heroBackgroundUrl = normalizeUrlPath(
        updatedSettings.heroBackgroundUrl
      );

      return NextResponse.json({ success: true, data: updatedSettings });
    } catch (updateError) {
      console.error("Error updating settings:", updateError);
      const errMsg =
        updateError instanceof Error ? updateError.message : "Database error";
      return NextResponse.json(
        { success: false, error: `Failed to update settings: ${errMsg}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating website settings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update website settings: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
