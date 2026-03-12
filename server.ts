import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Google Sheets Setup
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/auth/callback`
);

// In-memory token storage for demo (should use a database in production)
let tokens: any = null;

app.get("/api/auth/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  res.json({ url });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens: newTokens } = await oauth2Client.getToken(code as string);
    tokens = newTokens;
    oauth2Client.setCredentials(tokens);
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    res.status(500).send("Authentication failed");
  }
});

app.post("/api/rsvp", async (req, res) => {
  const { familyName, members, hotel, message } = req.body;

  if (!tokens) {
    return res.status(401).json({ error: "Not authenticated with Google" });
  }

  try {
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: "GOOGLE_SHEET_ID not configured" });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[familyName, members, hotel, message || ""]],
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving to Google Sheets:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/guests", async (req, res) => {
  const scriptUrl = process.env.VITE_GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycbxXhu53lT7Kv6wlp0gSM9fjuF2Nd-bPUGW0W99Re19WG5NjkkVcnYCR4cnY150-5Dkw/exec";

  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) throw new Error("Failed to fetch from Google Script");
    const guests = await response.json();
    res.json(guests);
  } catch (error: any) {
    console.error("Error fetching guests from script:", error);
    res.status(500).json({ error: "No se pudieron cargar los invitados. Verifica que el script tenga la función doGet y esté publicado como 'Cualquier persona'." });
  }
});

app.get("/api/auth/status", (req, res) => {
  res.json({ authenticated: !!tokens });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
