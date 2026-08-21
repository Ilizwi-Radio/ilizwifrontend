// import express from "express";
// import "./config/env"; // Load environment variables from .env file  
// import { GoogleGenAI, Type } from "@google/genai";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import { query } from "./config/database";
// import cors from "cors";
// import {
//     requireAuth,
//   requirePresenter
// }
// from "./middleware/auth";
// import { JWT_SECRET } from "./config/env";



// const app = express();
// app.use(cors({origin:["http://localhost:3001"],credentials:true})); // Allow all origins for development; adjust in production
// const PORT = 3000;


// // Set up large limits for base64 audio uploads
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

// // Lazy initializer for Google GenAI client
// let aiInstance: GoogleGenAI | null = null;
// function getGeminiClient(): GoogleGenAI {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new Error("GEMINI_API_KEY environment variable is required. Please manage it via settings/secrets.");
//   }
//   if (!aiInstance) {
//     aiInstance = new GoogleGenAI({
//       apiKey,
//       httpOptions: {
//         headers: {
//           'User-Agent': 'aistudio-build',
//         }
//       }
//     });
//   }
//   return aiInstance;
// }

// // 1. Health check route
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", port: PORT });
// });

// // 2. Oral History Recording - Transcribe and Analytically Harmonize
// app.post("/api/audio/transcribe", async (req, res) => {
//   try {
//     const { audio, mimeType } = req.body;
//     if (!audio) {
//       return res.status(400).json({ error: "No audio data provided in request body." });
//     }

//     const ai = getGeminiClient();

//     // Prepare audio container
//     const audioPart = {
//       inlineData: {
//         mimeType: mimeType || "audio/webm",
//         data: audio
//       }
//     };

//     const promptText = `You are an expert ethnomusicologist, sound archaeologist, and music culturalist. 
// Analyze this voice recording (an oral storytelling, song translation, or music reflection), and respond in a structured JSON dictionary containing:
// 1. "transcription": The word-for-word text transcription of what is spoken.
// 2. "detected_emotion": A brief, highly poetic description of the underlying emotional resonance in their voice.
// 3. "cultural_musical_pairing": A creative proposal describing what traditional arrangement would suit this. Include:
//    - "tempo": a suggested beats-per-minute number (e.g. 75)
//    - "key": a recommended system scale (e.g., "A Minor Pentatonic", "Raga Bhairavi", "D Dorian")
//    - "instrument_harmony": 2-3 traditional instruments to represent this mood (e.g., "Mbira", "Kora", "Sitar") and their contribution.
//    - "vibe": A descriptive noun-phrase for the backing loop.`;

//     const response = await ai.models.generateContent({
//       model: "gemini-3.5-flash",
//       contents: [
//         audioPart,
//         { text: promptText }
//       ],
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             transcription: { type: Type.STRING },
//             detected_emotion: { type: Type.STRING },
//             cultural_musical_pairing: {
//               type: Type.OBJECT,
//               properties: {
//                 tempo: { type: Type.INTEGER },
//                 key: { type: Type.STRING },
//                 instrument_harmony: { type: Type.STRING },
//                 vibe: { type: Type.STRING }
//               },
//               required: ["tempo", "key", "instrument_harmony", "vibe"]
//             }
//           },
//           required: ["transcription", "detected_emotion", "cultural_musical_pairing"]
//         }
//       }
//     });

//     if (!response.text) {
//       throw new Error("Empty response received from transcription analyzer.");
//     }

//     const result = JSON.parse(response.text.trim());
//     return res.json(result);
//   } catch (error: any) {
//     console.error("Error in transcription endpoint:", error);
//     return res.status(500).json({ error: error.message || "Failed to process audio recording." });
//   }
// });

// // 3. Cultural Insight & Narration (Text generation + Text-to-Speech)
// app.post("/api/audio/narrate", async (req, res) => {
//   try {
//     const { prompt, voice } = req.body;
//     if (!prompt) {
//       return res.status(400).json({ error: "Missing prompt parameter." });
//     }

//     const ai = getGeminiClient();
//     const voiceName = voice || "Kore"; // Kore, Zephyr, Puck, Fenrir, Charon

//     // Step A: Generate a concise, beautiful storytelling paragraph
//     const scriptPrompt = `You are a respectful, poetic narrator of traditional musical heritage.
// Write a brief, evocative cultural story / legend (exactly 35 to 50 words) about the following music topic or instrument: "${prompt}".
// Keep it highly engaging, historically rich, and poetic. Do not include any meta-introductions; start directly with the story or legend.`;

//     const scriptResponse = await ai.models.generateContent({
//       model: "gemini-3.5-flash",
//       contents: scriptPrompt
//     });

//     const scriptText = scriptResponse.text?.trim() || "";
//     if (!scriptText) {
//       throw new Error("Failed to write a historical story script.");
//     }

//     // Step B: Text to Speech generation
//     const ttsPrompt = `Speak this poetic oral history clearly, with a respectful cultural depth: ${scriptText}`;

//     const ttsResponse = await ai.models.generateContent({
//       model: "gemini-3.1-flash-tts-preview",
//       contents: [{ parts: [{ text: ttsPrompt }] }],
//       config: {
//         responseModalities: ["AUDIO"],
//         speechConfig: {
//           voiceConfig: {
//             prebuiltVoiceConfig: { voiceName }
//           }
//         }
//       }
//     });

//     const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
//     if (!base64Audio) {
//       throw new Error("Could not generate audio content from Gemini TTS service.");
//     }

//     return res.json({
//       text: scriptText,
//       audio: base64Audio
//     });
//   } catch (error: any) {
//     console.error("Error in AI narration/TTS endpoint:", error);
//     return res.status(500).json({ error: error.message || "Failed to generate AI narration." });
//   }
// });

// // 4. AI-Assisted Traditional Music Composition
// app.post("/api/music/generate-composition", async (req, res) => {
//   try {
//     const { mood, culture, tempo, instrument } = req.body;
//     const targetTempo = tempo || 80;
//     const instrumentType = instrument || "Mbira";

//     const ai = getGeminiClient();

//     const compositionPrompt = `You are a legendary traditional music compiler and composer.
// Compose a short, authentic 4-to-8 bar musical motif/melody for a/an ${instrumentType} reflecting a modern ${mood} atmosphere of ${culture} heritage.
// Generate a structured musical sequence suitable for direct synthesis.

// The response MUST follow this exact schema. 
// Return the output as a valid JSON dictionary:
// - keys:
//   - "tempo": The suggested BPM (near ${targetTempo}),
//   - "key_scale": The specific traditional scale (e.g. "Kora Scale", "Bhupali", "Hirajoshi", "Dorian"),
//   - "background_chord_progression": An array of Roman numerals for chords or pedal notes (e.g., ["I", "IV", "v"]),
//   - "notes": An array of note events, where each note event contains:
//      - "pitch": The letter/number frequency index (from "C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4", "C5", "D5"), restrict to these standard acoustic octaves.
//      - "time": The beat offset (e.g. 0.0, 0.5, 1.0, 1.5, 2.0, etc.) from the start of the grid.
//      - "duration": Note length in beats (e.g., 0.25, 0.5, 1.0)
//      - "velocity": Relative dynamic loudness between 0.2 and 1.0.

// Provide a highly rhythmically syncopated, beautiful, and authentic traditional alignment. Be highly creative so the pattern has musical variety (do not just repeat a single note). Create around 8 to 16 note events.`;

//     const response = await ai.models.generateContent({
//       model: "gemini-3.5-flash",
//       contents: compositionPrompt,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             tempo: { type: Type.INTEGER },
//             key_scale: { type: Type.STRING },
//             background_chord_progression: {
//               type: Type.ARRAY,
//               items: { type: Type.STRING }
//             },
//             notes: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.OBJECT,
//                 properties: {
//                   pitch: { type: Type.STRING },
//                   time: { type: Type.NUMBER },
//                   duration: { type: Type.NUMBER },
//                   velocity: { type: Type.NUMBER }
//                 },
//                 required: ["pitch", "time", "duration", "velocity"]
//               }
//             }
//           },
//           required: ["tempo", "key_scale", "background_chord_progression", "notes"]
//         }
//       }
//     });

//     if (!response.text) {
//       throw new Error("Unable to retrieve composition plan from Gemini.");
//     }

//     const composition = JSON.parse(response.text.trim());
//     return res.json(composition);
//   } catch (error: any) {
//     console.error("Error in music composition generator:", error);
//     return res.status(500).json({ error: error.message || "Failed to compile custom musical composition." });
//   }
// });

// // ============================================================================
// // 1. IDENTITY & ACCESS (USERS & AUTHENTICATION API ROUTES)
// // ============================================================================

// /**
//  * Register a new user in the PostgreSQL system of record.
//  * Hashes passwords securely with bcrypt and tracks preferred cultural language channels.
//  */
// app.post("/api/auth/register", async (req, res) => {
//   console.log("REGISTER BODY:", req.body)
//   try {
//     const { fullName, email, phone, password, preferredLanguages } = req.body;
//     if (!fullName || (!email && !phone)) {
//       return res.status(400).json({ error: "Full name and either an email or phone number are required." });
//     }

//         // Check whether user exists already
//     const existingUser = await query(
//       `
//       SELECT id
//       FROM users
//       WHERE email = $1
//       `,
//       [email]
//     );

//     if (existingUser.rows.length > 0) {
//       return res.status(409).json({
//         error: "A user with this email already exists."
//       });
//     }
//     // Encrypt password
//     let passwordHash = null;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       passwordHash = await bcrypt.hash(password, salt);
//     }

//     // Insert user record
//     const insertQuery = `
//       INSERT INTO users (full_name, email, phone, password_hash, preferred_languages, is_verified)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING id, full_name, email, phone, role, preferred_languages, created_at;
//     `;
//     const params = [fullName, email || null, phone || null, passwordHash, preferredLanguages || ["en"], true];
//     const dbResult = await query(insertQuery, params);

//     return res.status(201).json({
//       message: "User registered successfully.",
//       user: dbResult.rows[0]
//     });
//   } catch (error: any) {
//     console.error("Error in auth register route:", error);
//     return res.status(500).json({ error: error.message || "Database registration failed." });
//   }
// });

// /**
//  * Login endpoint verifying hashed passwords and returning user session profiles.
//  */
// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required." });
//     }

//     // Query user by email
//     const findQuery = "SELECT * FROM users WHERE email = $1 LIMIT 1;";
//     const dbResult = await query(findQuery, [email]);
//     if (dbResult.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password credentials." });
//     }

//     const user = dbResult.rows[0];
//     if (!user.password_hash) {
//       return res.status(400).json({ error: "Please log in using your social auth provider." });
//     }

//     // Compare bcrypt hashes
//     const isMatch = await bcrypt.compare(password, user.password_hash);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid email or password credentials." });
//     }

//     // Safe profile return (exclude raw sensitive password hashes)

// const authToken = jwt.sign(
//   {
//     id: user.id,
//     email: user.email,
//     role: user.role
//   },
//   JWT_SECRET,
//   {
//     expiresIn: "7d"
//   }
// );
// const { password_hash, ...safeProfile } = user;

// return res.json({
//   message: "Authentication successful.",
//   token: authToken,
//   user: safeProfile
// });

//   } catch (error: any) {
//     console.error("Error in auth login route:", error);
//     return res.status(500).json({ error: error.message || "Database login failed." });
//   }
// });


// /**
//  * Simulated OTP dispatch and hash caching.
//  */
// app.post("/api/auth/otp-send", async (req, res) => {
//   try {
//     const { userId, channel } = req.body; // channel: 'email' or 'sms'
//     if (!userId) {
//       return res.status(400).json({ error: "Missing required parameter: userId." });
//     }

//     const mockCode = "1285"; // A fixed symbolic OTP code
//     const codeHash = await bcrypt.hash(mockCode, 6);
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

//     const insertOtpQuery = `
//       INSERT INTO otp_verifications (user_id, code_hash, channel, expires_at)
//       VALUES ($1, $2, $3, $4)
//       RETURNING id, channel, expires_at;
//     `;
//     const dbResult = await query(insertOtpQuery, [userId, codeHash, channel || "email", expiresAt]);

//     return res.json({
//       message: `OTP sent successfully via ${channel || "email"}.`,
//       otpId: dbResult.rows[0]?.id,
//       simulatedCode: mockCode, // Included for convenient user-testing locally!
//       expiresAt: dbResult.rows[0]?.expires_at
//     });
//   } catch (error: any) {
//     console.error("Error in OTP send route:", error);
//     return res.status(500).json({ error: error.message || "Failed to generate OTP verification code." });
//   }
// });

// // ============================================================================
// // 2. BROADCASTING & AI PRESENTERS API ROUTES
// // ============================================================================

// /**
//  * Fetch scheduled radio shows, AI presenters, and live broadcasting timetables.
//  */
// app.get("/api/shows", async (req, res) => {
//   try {
//     const showsQuery = `
//       SELECT s.*, p.display_name as presenter_name, p.presenter_type 
//       FROM shows s
//       LEFT JOIN presenters p ON s.presenter_id = p.id
//       ORDER BY s.scheduled_start ASC;
//     `;
//     const dbResult = await query(showsQuery);
//     return res.json(dbResult.rows);
//   } catch (error: any) {
//     console.error("Error fetching broadcast shows:", error);
//     return res.status(500).json({ error: "Failed to retrieve scheduled shows." });
//   }
// });

// app.post(
//   "/api/shows",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {

//       const {
//         title,
//         presenterId,
//         description,
//         showType,
//         languageCode,
//         scheduledStart,
//         scheduledEnd,
//         streamUrl
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO shows
//         (
//           presenter_id,
//           title,
//           description,
//           show_type,
//           language_code,
//           scheduled_start,
//           scheduled_end,
//           stream_url
//         )
//         VALUES
//         (
//           $1,$2,$3,$4,$5,$6,$7,$8
//         )
//         RETURNING *;
//         `,
//         [
//           presenterId,
//           title,
//           description,
//           showType || "audio",
//           languageCode,
//           scheduledStart,
//           scheduledEnd,
//           streamUrl || null
//         ]
//       );

//       res.status(201).json({
//         message: "Broadcast show created successfully.",
//         show: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create show."
//       });

//     }
//   }
// );

// app.put(
//   "/api/shows/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {

//       const {
//         title,
//         description,
//         showType,
//         languageCode,
//         scheduledStart,
//         scheduledEnd,
//         status,
//         streamUrl
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE shows
//         SET
//           title = $1,
//           description = $2,
//           show_type = $3,
//           language_code = $4,
//           scheduled_start = $5,
//           scheduled_end = $6,
//           status = $7,
//           stream_url = $8
//         WHERE id = $9
//         RETURNING *;
//         `,
//         [
//           title,
//           description,
//           showType,
//           languageCode,
//           scheduledStart,
//           scheduledEnd,
//           status,
//           streamUrl,
//           req.params.id
//         ]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Show not found."
//         });
//       }

//       res.json({
//         message: "Show updated successfully.",
//         show: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to update show."
//       });

//     }
//   }
// );

// app.delete(
//   "/api/shows/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {

//       const result = await query(
//         `
//         DELETE FROM shows
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Show not found."
//         });
//       }

//       return res.json({
//         message: "Show deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to delete show."
//       });

//     }
//   }
// );
  

// /**
//  * Store user interactions (comments, reactions, song requests) for active broadcasts.
//  */
// app.post("/api/shows/:id/interact", requireAuth, async (req: any, res) => {
//   try {
//     const showId = req.params.id;
//     const userId = req.user?.id; // Assuming the user ID is available in the request object after authentication
//     const { type, content } = req.body; // type: 'comment' | 'reaction' | 'song_request'
//     if (!type) {
//       return res.status(400).json({ error: "Missing interaction type in request body." });
//     }

//     const insertInteraction = `
//       INSERT INTO show_interactions (show_id, user_id, type, content)
//       VALUES ($1, $2, $3, $4)
//       RETURNING *;
//     `;
//     const dbResult = await query(insertInteraction, [showId, userId || null, type, content || null]);
//     return res.status(201).json({
//       message: "Show interaction registered successfully.",
//       interaction: dbResult.rows[0]
//     });
//   } catch (error: any) {
//     console.error("Error adding show interaction:", error);
//     return res.status(500).json({ error: "Failed to log show interaction." });
//   }
// });

// app.get(
//   "/api/shows/:id/interactions",
//   async (req, res) => {
//     try {
//       const result = await query(
//         `
//       SELECT
//         si.*,
//         u.full_name
//       FROM show_interactions si
//       LEFT JOIN users u
//         ON si.user_id = u.id
//       WHERE si.show_id = $1
//       ORDER BY si.created_at DESC
//       `,
//         [req.params.id]
//       );

//       res.json(result.rows);
//     } catch (error: any) {
//       console.error("Error retrieving show interactions:", error);
//       return res.status(500).json({ error: "Failed to retrieve show interactions." });
//     }
//   }
// );
// // ============================================================================
// // 2.1. AI PRESENTERS MANAGEMENT
// // ============================================================================
// app.get("/api/presenters", async (req, res) => {

//   const result = await query(`
//     SELECT *
//     FROM presenters
//     ORDER BY display_name
//   `);

//   res.json(result.rows);

// });

// app.post(
//   "/api/presenters",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {
//       const {
//         displayName,
//         presenterType,
//         bio
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO presenters
//         (
//           display_name,
//           presenter_type,
//           bio,
//           status
//         )
//         VALUES ($1,$2,$3,'approved')
//         RETURNING *
//         `,
//         [
//           displayName,
//           presenterType,
//           bio
//         ]
//       );

//       res.status(201).json(result.rows[0]);
//     } catch (error: any) {
//       console.error("Error creating presenter:", error);
//       return res.status(500).json({ error: "Failed to create presenter." });
//     }
//   }
// );
// app.put(
//   "/api/presenters/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {
//       const { displayName, presenterType, bio } = req.body;
//       const result = await query(
//         `
//         UPDATE presenters
//         SET
//           display_name = $1,
//           presenter_type = $2,
//           bio = $3
//         WHERE id = $4
//         RETURNING *;
//         `,
//         [displayName, presenterType, bio, req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Presenter not found."
//         });
//       }

//       res.json({
//         message: "Presenter updated successfully.",
//         presenter: result.rows[0]
//       });

//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         error: "Failed to update presenter."
//       });
//     }
//   }
// );
// app.delete(
//   "/api/presenters/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {
//       const result = await query(
//         `
//         DELETE FROM presenters
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Presenter not found."
//         });
//       }

//       res.json({
//         message: "Presenter deleted successfully."
//       });

//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         error: "Failed to delete presenter."
//       });
//     }
//   }
// );
// // ============================================================================
// // 3. MUSIC MANAGEMENT SYSTEM API ROUTES
// // ============================================================================

// /**
//  * Retrieve curated African track libraries, filtering by language or genre.
//  */
// app.get("/api/songs", async (req, res) => {
//   try {
//     const { genre, language } = req.query;
//     let baseQuery = `
// SELECT
//     s.*,
//     a.name AS artist_name,
//     a.country,
//     COUNT(sl.song_id) AS like_count

// FROM songs s

// JOIN artists a
//     ON s.artist_id = a.id

// LEFT JOIN song_likes sl
//     ON sl.song_id = s.id
// `;
//     const params: any[] = [];

//     if (genre && language) {
//       baseQuery += " WHERE s.genre = $1 AND s.language_code = $2";
//       params.push(genre, language);
//     } else if (genre) {
//       baseQuery += " WHERE s.genre = $1";
//       params.push(genre);
//     } else if (language) {
//       baseQuery += " WHERE s.language_code = $1";
//       params.push(language);
//     }

//     baseQuery += " GROUP BY s.id, a.name, a.country ORDER BY s.play_count DESC LIMIT 100;";
//     const dbResult = await query(baseQuery, params);
//     return res.json(dbResult.rows);
//   } catch (error: any) {
//     console.error("Error in music catalog retrieval:", error);
//     return res.status(500).json({ error: "Failed to retrieve music records." });
//   }
// });
// app.post(
//   "/api/songs",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {

//       const {
//         artistId,
//         title,
//         languageCode,
//         genre,
//         durationSeconds,
//         audioFileUrl,
//         coverArtUrl,
//         isDownloadable
//       } = req.body;

//       if (
//         !artistId ||
//         !title ||
//         !languageCode ||
//         !genre ||
//         !durationSeconds ||
//         !audioFileUrl
//       ) {
//         return res.status(400).json({
//           error: "Missing required song fields."
//         });
//       }

//       const result = await query(
//         `
//         INSERT INTO songs
//         (
//           artist_id,
//           title,
//           language_code,
//           genre,
//           duration_seconds,
//           audio_file_url,
//           cover_art_url,
//           is_downloadable
//         )
//         VALUES
//         (
//           $1,$2,$3,$4,$5,$6,$7,$8
//         )
//         RETURNING *;
//         `,
//         [
//           artistId,
//           title,
//           languageCode,
//           genre,
//           durationSeconds,
//           audioFileUrl,
//           coverArtUrl || null,
//           isDownloadable ?? false
//         ]
//       );

//       return res.status(201).json({
//         message: "Song created successfully.",
//         song: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to create song."
//       });

//     }
//   }
// );

// app.put(
//   "/api/songs/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {

//       const {
//         title,
//         languageCode,
//         genre,
//         durationSeconds,
//         audioFileUrl,
//         coverArtUrl,
//         isDownloadable
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE songs
//         SET
//           title = $1,
//           language_code = $2,
//           genre = $3,
//           duration_seconds = $4,
//           audio_file_url = $5,
//           cover_art_url = $6,
//           is_downloadable = $7
//         WHERE id = $8
//         RETURNING *;
//         `,
//         [
//           title,
//           languageCode,
//           genre,
//           durationSeconds,
//           audioFileUrl,
//           coverArtUrl,
//           isDownloadable,
//           req.params.id
//         ]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Song not found."
//         });
//       }

//       return res.json({
//         message: "Song updated successfully.",
//         song: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to update song."
//       });

//     }
//   }
// );

// app.delete(
//   "/api/songs/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {
//     try {

//       const result = await query(
//         `
//         DELETE FROM songs
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Song not found."
//         });
//       }

//       return res.json({
//         message: "Song deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to delete song."
//       });

//     }
//   }
// );

// app.get(
//   "/api/songs/:id",
//   async (req, res) => {
//     try {

//       const result = await query(
//         `
//         SELECT
//           s.*,
//           a.name as artist_name
//         FROM songs s
//         JOIN artists a
//         ON s.artist_id = a.id
//         WHERE s.id = $1
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Song not found."
//         });
//       }

//       return res.json(result.rows[0]);

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to retrieve song."
//       });

//     }
//   }
// );
// /**
//  * Handle user song likes and favorite markings.
//  */
// app.post("/api/songs/:id/like", requireAuth, async (req: any, res) => {
//   try {
//     const songId = req.params.id;
//     const userId = req.user.id;
//     const { unlike } = req.body;
//     if (!userId) {
//       return res.status(400).json({ error: "User verification id required." });
//     }

//     if (unlike) {
//       await query("DELETE FROM song_likes WHERE user_id = $1 AND song_id = $2;", [userId, songId]);
//       return res.json({ message: "Song unliked successfully.", songId, liked: false });
//     } else {
//       await query(
//         "INSERT INTO song_likes (user_id, song_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
//         [userId, songId]
//       );
//       return res.status(201).json({ message: "Song liked successfully.", songId, liked: true });
//     }
//   } catch (error: any) {
//     console.error("Error liking track:", error);
//     return res.status(500).json({ error: "Failed to register like action." });
//   }
// });

// // ============================================================================
// // 3.1. ARTISTS MANAGEMENT
// // ============================================================================
// app.get("/api/artists", async (req, res) => {
//   try {

//     const result = await query(`
//       SELECT *
//       FROM artists
//       ORDER BY name;
//     `);

//     res.json(result.rows);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve artists."
//     });

//   }
// });

// app.post(
//   "/api/artists",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         name,
//         bio,
//         country
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO artists
//         (
//           name,
//           bio,
//           country
//         )
//         VALUES
//         (
//           $1,
//           $2,
//           $3
//         )
//         RETURNING *;
//         `,
//         [
//           name,
//           bio || null,
//           country
//         ]
//       );

//       res.status(201).json({
//         message: "Artist created successfully.",
//         artist: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create artist."
//       });

//     }

//   }
// );

// app.put(
//   "/api/artists/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         name,
//         bio,
//         country
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE artists
//         SET
//           name = $1,
//           bio = $2,
//           country = $3
//         WHERE id = $4
//         RETURNING *;
//         `,
//         [
//           name,
//           bio,
//           country,
//           req.params.id
//         ]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Artist not found."
//         });
//       }

//       res.json({
//         message: "Artist updated successfully.",
//         artist: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to update artist."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/artists/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         DELETE FROM artists
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Artist not found."
//         });
//       }

//       res.json({
//         message: "Artist deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to delete artist."
//       });

//     }

//   }
// );

// app.get(
//   "/api/artists/:id",
//   async (req, res) => {

//     try {

//       const artistResult = await query(
//         `
//         SELECT *
//         FROM artists
//         WHERE id = $1
//         `,
//         [req.params.id]
//       );

//       if (artistResult.rows.length === 0) {
//         return res.status(404).json({
//           error: "Artist not found."
//         });
//       }

//       const songsResult = await query(
//         `
//         SELECT *
//         FROM songs
//         WHERE artist_id = $1
//         ORDER BY title
//         `,
//         [req.params.id]
//       );

//       return res.json({
//         artist: artistResult.rows[0],
//         songs: songsResult.rows
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to retrieve artist."
//       });

//     }

//   }
// );

// // ============================================================================
// // 3.2. PLAYLIST MANAGEMENT
// // ============================================================================

// app.get("/api/playlists", async (req, res) => {
//   try {

//     const result = await query(`
//       SELECT *
//       FROM playlists
//       ORDER BY created_at DESC
//     `);

//     res.json(result.rows);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve playlists."
//     });

//   }
// });
// app.post(
//   "/api/playlists",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       const { name, isPublic } = req.body;

//       const result = await query(
//         `
//         INSERT INTO playlists
//         (
//           user_id,
//           name,
//           is_public
//         )
//         VALUES
//         (
//           $1,
//           $2,
//           $3
//         )
//         RETURNING *;
//         `,
//         [
//           req.user.id,
//           name,
//           isPublic ?? true
//         ]
//       );

//       res.status(201).json({
//         message: "Playlist created successfully.",
//         playlist: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create playlist."
//       });

//     }

//   }
// );

// app.post(
//   "/api/playlists/:id/songs",
//   requireAuth,
//   async (req, res) => {

//     try {

//       const { songId, position } = req.body;

//       const result = await query(
//         `
//         INSERT INTO playlist_songs
//         (
//           playlist_id,
//           song_id,
//           position
//         )
//         VALUES
//         (
//           $1,
//           $2,
//           $3
//         )
//         RETURNING *;
//         `,
//         [
//           req.params.id,
//           songId,
//           position || 1
//         ]
//       );

//       res.status(201).json({
//         message: "Song added to playlist.",
//         entry: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to add song."
//       });

//     }

//   }
// );

// app.get(
//   "/api/playlists/:id",
//   async (req, res) => {

//     try {

//       const playlist = await query(
//         `
//         SELECT *
//         FROM playlists
//         WHERE id = $1
//         `,
//         [req.params.id]
//       );

//       if (!playlist.rows.length) {
//         return res.status(404).json({
//           error: "Playlist not found."
//         });
//       }

//       const songs = await query(
//         `
//         SELECT
//           s.*,
//           a.name as artist_name,
//           ps.position
//         FROM playlist_songs ps
//         JOIN songs s
//           ON ps.song_id = s.id
//         JOIN artists a
//           ON s.artist_id = a.id
//         WHERE ps.playlist_id = $1
//         ORDER BY ps.position
//         `,
//         [req.params.id]
//       );

//       res.json({
//         playlist: playlist.rows[0],
//         songs: songs.rows
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to retrieve playlist."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/playlists/:playlistId/songs/:songId",
//   requireAuth,
//   async (req, res) => {

//     try {

//       await query(
//         `
//         DELETE FROM playlist_songs
//         WHERE playlist_id = $1
//         AND song_id = $2
//         `,
//         [
//           req.params.playlistId,
//           req.params.songId
//         ]
//       );

//       res.json({
//         message: "Song removed from playlist."
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to remove song."
//       });

//     }

//   }
// );

// // ============================================================================
// // 3.3. EVENTS MANAGEMENT
// // ============================================================================
// app.get("/api/events", async (req, res) => {
//   try {

//     const result = await query(`
//       SELECT *
//       FROM events
//       ORDER BY start_at ASC
//     `);

//     res.json(result.rows);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve events."
//     });

//   }
// });

// app.get("/api/events/:id", async (req, res) => {
//   try {

//     const result = await query(
//       `
//       SELECT *
//       FROM events
//       WHERE id = $1
//       `,
//       [req.params.id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         error: "Event not found."
//       });
//     }

//     res.json(result.rows[0]);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve event."
//     });

//   }
// });

// app.post(
//   "/api/events",
//   requireAuth,
//   requirePresenter,
//   async (req: any, res) => {

//     try {

//       const {
//         title,
//         category,
//         description,
//         location,
//         isOnline,
//         livestreamUrl,
//         startAt,
//         endAt,
//         posterUrl
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO events
//         (
//           organizer_id,
//           title,
//           category,
//           description,
//           poster_url,
//           location,
//           is_online,
//           livestream_url,
//           start_at,
//           end_at
//         )
//         VALUES
//         (
//           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
//         )
//         RETURNING *;
//         `,
//         [
//           req.user.id,
//           title,
//           category,
//           description,
//           posterUrl || null,
//           location,
//           isOnline || false,
//           livestreamUrl || null,
//           startAt,
//           endAt
//         ]
//       );

//       res.status(201).json({
//         message: "Event created successfully.",
//         event: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create event."
//       });

//     }

//   }
// );

// app.put(
//   "/api/events/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         title,
//         category,
//         description,
//         location,
//         isOnline,
//         livestreamUrl,
//         startAt,
//         endAt
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE events
//         SET
//           title = $1,
//           category = $2,
//           description = $3,
//           location = $4,
//           is_online = $5,
//           livestream_url = $6,
//           start_at = $7,
//           end_at = $8
//         WHERE id = $9
//         RETURNING *;
//         `,
//         [
//           title,
//           category,
//           description,
//           location,
//           isOnline,
//           livestreamUrl,
//           startAt,
//           endAt,
//           req.params.id
//         ]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Event not found."
//         });
//       }

//       res.json({
//         message: "Event updated successfully.",
//         event: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to update event."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/events/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         DELETE FROM events
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Event not found."
//         });
//       }

//       res.json({
//         message: "Event deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to delete event."
//       });

//     }

//   }
// );

// // ============================================================================
// // 3.4. EVENT TICKETS & ATTENDEES MANAGEMENT
// // ============================================================================

// app.post(
//   "/api/events/:id/tickets",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         tierName,
//         price,
//         quantityAvailable
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO event_tickets
//         (
//           event_id,
//           tier_name,
//           price,
//           quantity_available
//         )
//         VALUES
//         (
//           $1,$2,$3,$4
//         )
//         RETURNING *;
//         `,
//         [
//           req.params.id,
//           tierName,
//           price,
//           quantityAvailable
//         ]
//       );

//       res.status(201).json({
//         message: "Ticket tier created.",
//         ticket: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create ticket tier."
//       });

//     }

//   }
// );

// app.get(
//   "/api/events/:id/tickets",
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT *
//         FROM event_tickets
//         WHERE event_id = $1
//         ORDER BY price
//         `,
//         [req.params.id]
//       );

//       res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to retrieve tickets."
//       });

//     }

//   }
// );

// app.post(
//   "/api/events/:id/register",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       const {
//         ticketId
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO event_attendees
//         (
//           event_id,
//           user_id,
//           ticket_id,
//           status
//         )
//         VALUES
//         (
//           $1,$2,$3,'registered'
//         )
//         RETURNING *;
//         `,
//         [
//           req.params.id,
//           req.user.id,
//           ticketId
//         ]
//       );

//       res.status(201).json({
//         message: "Successfully registered.",
//         registration: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Registration failed."
//       });

//     }

//   }
// );

// app.get(
//   "/api/events/:id/attendees",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT
//           ea.*,
//           u.full_name,
//           u.email
//         FROM event_attendees ea
//         JOIN users u
//           ON ea.user_id = u.id
//         WHERE ea.event_id = $1
//         ORDER BY ea.id DESC
//         `,
//         [req.params.id]
//       );

//       res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to retrieve attendees."
//       });

//     }

//   }
// );

// app.get(
//   "/api/events/:id/dashboard",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const attendeeCount = await query(
//         `
//         SELECT COUNT(*) as count
//         FROM event_attendees
//         WHERE event_id = $1
//         `,
//         [req.params.id]
//       );

//       const ticketCount = await query(
//         `
//         SELECT COUNT(*) as count
//         FROM event_tickets
//         WHERE event_id = $1
//         `,
//         [req.params.id]
//       );

//       res.json({
//         attendees: attendeeCount.rows[0].count,
//         ticketTiers: ticketCount.rows[0].count
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to load dashboard."
//       });

//     }

//   }
// );

// // ============================================================================
// // 3.5. FOLLOWERS MANAGEMENT
// // ============================================================================

// app.post(
//   "/api/presenters/:id/follow",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       await query(
//         `
//         INSERT INTO presenter_follows
//         (
//           user_id,
//           presenter_id
//         )
//         VALUES
//         (
//           $1,$2
//         )
//         ON CONFLICT DO NOTHING;
//         `,
//         [
//           req.user.id,
//           req.params.id
//         ]
//       );

//       return res.status(201).json({
//         message: "Presenter followed."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to follow presenter."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/presenters/:id/follow",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       await query(
//         `
//         DELETE FROM presenter_follows
//         WHERE user_id = $1
//         AND presenter_id = $2
//         `,
//         [
//           req.user.id,
//           req.params.id
//         ]
//       );

//       return res.json({
//         message: "Presenter unfollowed."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to unfollow presenter."
//       });

//     }

//   }
// );

// app.get(
//   "/api/presenters/:id",
//   async (req, res) => {

//     try {

//       const presenter = await query(
//         `
//         SELECT *
//         FROM presenters
//         WHERE id = $1
//         `,
//         [req.params.id]
//       );

//       if (!presenter.rows.length) {
//         return res.status(404).json({
//           error: "Presenter not found."
//         });
//       }

//       const followers = await query(
//         `
//         SELECT COUNT(*) AS total
//         FROM presenter_follows
//         WHERE presenter_id = $1
//         `,
//         [req.params.id]
//       );

//       const shows = await query(
//         `
//         SELECT *
//         FROM shows
//         WHERE presenter_id = $1
//         ORDER BY scheduled_start DESC
//         `,
//         [req.params.id]
//       );

//       return res.json({
//         presenter: presenter.rows[0],
//         followers:
//           Number(
//             followers.rows[0].total
//           ),
//         shows: shows.rows
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to load presenter."
//       });

//     }

//   }
// );

// app.get(
//   "/api/presenters/:id/followers",
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT
//           u.id,
//           u.full_name,
//           u.profile_picture_url
//         FROM presenter_follows f
//         JOIN users u
//           ON f.user_id = u.id
//         WHERE f.presenter_id = $1
//         `,
//         [req.params.id]
//       );

//       return res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to load followers."
//       });

//     }

//   }
// );

// app.get(
//   "/api/community/stats",
//   async (req, res) => {

//     try {

//       const followers = await query(`
//         SELECT COUNT(*)
//         FROM presenter_follows
//       `);

//       const badges = await query(`
//         SELECT COUNT(*)
//         FROM certificates
//       `);

//       const conversations = await query(`
//         SELECT COUNT(*)
//         FROM show_interactions
//       `);

//       return res.json({
//         dailyConversations:
//           Number(
//             conversations.rows[0].count
//           ),

//         badgesEarned:
//           Number(
//             badges.rows[0].count
//           ),

//         totalFollows:
//           Number(
//             followers.rows[0].count
//           ),

//         communityRating: 4.9
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to load stats."
//       });

//     }

//   }
// );

// // ============================================================================
// // 4. AFRICAN LANGUAGE LEARNING API ROUTES
// // ============================================================================

// /**
//  * List registered language courses and associated lesson steps (e.g. greetings).
//  */

// //============================================================================
// // 4.1. LANGUAGE COURSES MANAGEMENT
// //============================================================================
// app.get("/api/language/courses", async (req, res) => {
//   try {
//     const coursesQuery = `
//       SELECT lc.*, JSON_AGG(l.* ORDER BY l.sequence_order) as lessons_list 
//       FROM language_courses lc
//       LEFT JOIN lessons l ON lc.id = l.course_id
//       GROUP BY lc.id;
//     `;
//     const dbResult = await query(coursesQuery);
//     return res.json(dbResult.rows);
//   } catch (error: any) {
//     console.error("Error getting courses:", error);
//     return res.status(500).json({ error: "Failed to retrieve courses." });
//   }
// });

// app.get(
//   "/api/language/courses/:id",
//   async (req, res) => {

//     try {

//       const course = await query(
//         `
//         SELECT *
//         FROM language_courses
//         WHERE id = $1
//         `,
//         [req.params.id]
//       );

//       if (!course.rows.length) {
//         return res.status(404).json({
//           error: "Course not found."
//         });
//       }

//       const lessons = await query(
//         `
//         SELECT *
//         FROM lessons
//         WHERE course_id = $1
//         ORDER BY sequence_order;
//         `,
//         [req.params.id]
//       );

//       res.json({
//         course: course.rows[0],
//         lessons: lessons.rows
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to retrieve course."
//       });

//     }

//   }
// );

// app.post(
//   "/api/language/courses",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         languageCode,
//         level,
//         title
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO language_courses
//         (
//           language_code,
//           level,
//           title
//         )
//         VALUES
//         (
//           $1,$2,$3
//         )
//         RETURNING *;
//         `,
//         [
//           languageCode,
//           level,
//           title
//         ]
//       );

//       res.status(201).json({
//         message: "Course created.",
//         course: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create course."
//       });

//     }

//   }
// );

// app.post(
//   "/api/language/courses/:id/lessons",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         title,
//         contentType,
//         audioReferenceUrl,
//         sequenceOrder
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO lessons
//         (
//           course_id,
//           title,
//           content_type,
//           audio_reference_url,
//           sequence_order
//         )
//         VALUES
//         (
//           $1,$2,$3,$4,$5
//         )
//         RETURNING *;
//         `,
//         [
//           req.params.id,
//           title,
//           contentType,
//           audioReferenceUrl,
//           sequenceOrder
//         ]
//       );

//       res.status(201).json({
//         message: "Lesson created.",
//         lesson: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create lesson."
//       });

//     }

//   }
// );

// app.get(
//   "/api/language/courses/:id/lessons",
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT *
//         FROM lessons
//         WHERE course_id = $1
//         ORDER BY sequence_order;
//         `,
//         [req.params.id]
//       );

//       res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to retrieve lessons."
//       });

//     }

//   }
// );

// app.put(
//   "/api/language/courses/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         languageCode,
//         level,
//         title
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE language_courses
//         SET
//           language_code = $1,
//           level = $2,
//           title = $3
//         WHERE id = $4
//         RETURNING *;
//         `,
//         [
//           languageCode,
//           level,
//           title,
//           req.params.id
//         ]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Course not found."
//         });
//       }

//       return res.json({
//         message: "Course updated successfully.",
//         course: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to update course."
//       });

//     }

//   }
// );
// app.delete(
//   "/api/language/courses/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         DELETE FROM language_courses
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Course not found."
//         });
//       }

//       return res.json({
//         message: "Course deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to delete course."
//       });

//     }

//   }
// );
// app.put(
//   "/api/lessons/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         title,
//         contentType,
//         audioReferenceUrl,
//         sequenceOrder
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE lessons
//         SET
//           title = $1,
//           content_type = $2,
//           audio_reference_url = $3,
//           sequence_order = $4
//         WHERE id = $5
//         RETURNING *;
//         `,
//         [
//           title,
//           contentType,
//           audioReferenceUrl,
//           sequenceOrder,
//           req.params.id
//         ]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Lesson not found."
//         });
//       }

//       return res.json({
//         message: "Lesson updated successfully.",
//         lesson: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to update lesson."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/lessons/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         DELETE FROM lessons
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Lesson not found."
//         });
//       }

//       return res.json({
//         message: "Lesson deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to delete lesson."
//       });

//     }

//   }
// );



// /**
//  * Record lesson completions, pronunciation tracking, and Whisper-based metrics.
//  */
// app.post("/api/language/progress",requireAuth, async (req: any, res) => {
//   try {
//     const userId = req.user.id;
//     const { lessonId, status, score } = req.body;
//     if (!userId || !lessonId) {
//       return res.status(400).json({ error: "Missing userId or lessonId parameter." });
//     }

//     const upsertProgress = `
//       INSERT INTO user_lesson_progress(user_id,lesson_id,status,pronunciation_score,completed_at)
//       VALUES($1,$2,$3,$4,$5)
//       ON CONFLICT (user_id, lesson_id)
//       DO UPDATE
//       SET
//       status = EXCLUDED.status,pronunciation_score = EXCLUDED.pronunciation_score,completed_at = EXCLUDED.completed_at
//       RETURNING *;
//     `;
//     const completedAt = status === "completed" ? new Date() : null;
//     const dbResult = await query(upsertProgress, [userId, lessonId, status || "started", score || null, completedAt]);
//     const lessonResult = await query(
//           `
//           SELECT course_id
//           FROM lessons
//           WHERE id = $1
//           `,
//           [lessonId]
//         );

// const courseId =  lessonResult.rows[0].course_id;

// const totalLessons = await query(
//   `
//   SELECT COUNT(*) AS total
//   FROM lessons
//   WHERE course_id = $1
//   `,
//   [courseId]
// );

// const completedLessons = await query(
//   `
//   SELECT COUNT(*) AS completed
//   FROM user_lesson_progress ulp
//   JOIN lessons l
//     ON l.id = ulp.lesson_id
//   WHERE ulp.user_id = $1
//   AND l.course_id = $2
//   AND ulp.status = 'completed'
//   `,
//   [userId, courseId]
// );

// const total =
//   Number(totalLessons.rows[0].total);

// const completed =
//   Number(completedLessons.rows[0].completed);

// let certificateEarned = false;

// if (
//   total > 0 &&
//   completed === total
// ) {

//   const existingCertificate =
//     await query(
//       `
//       SELECT *
//       FROM certificates
//       WHERE user_id = $1
//       AND course_id = $2
//       `,
//       [userId, courseId]
//     );

//   if (
//     existingCertificate.rows.length === 0
//   ) {

//     await query(
//       `
//       INSERT INTO certificates
//       (
//         user_id,
//         course_id,
//         certificate_file_url
//       )
//       VALUES
//       (
//         $1,$2,$3
//       )
//       `,
//       [
//         userId,
//         courseId,
//         "/certificates/default.pdf"
//       ]
//     );

//     certificateEarned = true;

//   }

// }

//     return res.json({
//   message: "Language learning progress recorded.",
//   progress: dbResult.rows[0],

//   completed,

//   total,

//   percentage:
//     total > 0
//       ? Math.round(
//           (completed / total) * 100
//         )
//       : 0,

//   certificateEarned
// });
//   } catch (error: any) {
//     console.error("Error updating lesson progress:", error);
//     return res.status(500).json({ error: "Database progress log failed." });
//   }
// });

// app.get(
//   "/api/language/courses/:id/progress",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       const userId = req.user.id;
//       const courseId = req.params.id;
//       const totalLessons = await query(
//         `
//         SELECT COUNT(*) AS total
//         FROM lessons
//         WHERE course_id = $1
//         `,
//         [courseId]
//       );

//       const completedLessons = await query(
//         `
//         SELECT COUNT(*) AS completed
//         FROM user_lesson_progress ulp
//         JOIN lessons l
//           ON l.id = ulp.lesson_id
//         WHERE ulp.user_id = $1
//         AND l.course_id = $2
//         AND ulp.status = 'completed'
//         `,
//         [userId, courseId]
//       );

//       const total =
//         Number(
//           totalLessons.rows[0].total
//         );

//       const completed =
//         Number(
//           completedLessons.rows[0].completed
//         );

//       const percentage =
//         total > 0
//           ? Math.round(
//               (completed / total) * 100
//             )
//           : 0;

//       return res.json({
//         completed,
//         total,
//         percentage
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to calculate progress."
//       }); 
//     }
//   });

//   app.get(
//   "/api/users/me/certificates",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT
//           c.*,
//           lc.title,
//           lc.language_code,
//           lc.level

//         FROM certificates c

//         JOIN language_courses lc
//           ON lc.id = c.course_id

//         WHERE c.user_id = $1

//         ORDER BY c.issued_at DESC
//         `,
//         [req.user.id]
//       );

//       return res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to retrieve certificates."
//       });

//     }

//   }
// );

// app.get(
//   "/api/users/me/badges",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT
//           lc.title,
//           lc.language_code,
//           lc.level,
//           c.issued_at

//         FROM certificates c

//         JOIN language_courses lc
//           ON lc.id = c.course_id

//         WHERE c.user_id = $1

//         ORDER BY c.issued_at DESC
//         `,
//         [req.user.id]
//       );return res.json(
//   result.rows.map(
//     (badge: any) => ({
//       name:
//         `${badge.title} Explorer`,

//       language:
//         badge.language_code,

//       level:
//         badge.level,

//       earnedAt:
//         badge.issued_at
//     })
//   )
// );

// } catch (error) {

//   console.error(error);

//   return res.status(500).json({
//     error: "Failed to retrieve badges."
//   });

// }

// }
// );


// // ============================================================================
// // 5. VIDEO MANAGEMENT API ROUTES
// // ============================================================================

// app.get("/api/videos", async (req, res) => {
//   try {

//     const result = await query(`
//       SELECT
//         v.*,
//         vc.name as category_name
//       FROM videos v
//       LEFT JOIN video_categories vc
//         ON v.category_id = vc.id
//       ORDER BY v.created_at DESC;
//     `);

//     res.json(result.rows);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve videos."
//     });

//   }
// });

// app.get(
//   "/api/test-auth",
//   requireAuth,
//   (req: any, res) => {

//     res.json({
//       success: true,
//       user: req.user
//     });

//   }
// );

// app.get(
//   "/api/debug-token",
//   (req, res) => {

//     try {

//       const authHeader =
//         req.headers.authorization;

//       const token =
//         authHeader?.replace(
//           "Bearer ",
//           ""
//         );

//       const decoded =
//         jwt.decode(token || "");

//       return res.json({
//         token,
//         decoded
//       });

//     } catch (error) {

//       return res.status(500).json({
//         error
//       });

//     }

//   }
// );

// app.get("/api/videos/:id", async (req, res) => {
//   try {

//     const result = await query(
//       `
//       SELECT
//         v.*,
//         vc.name as category_name
//       FROM videos v
//       LEFT JOIN video_categories vc
//         ON v.category_id = vc.id
//       WHERE v.id = $1
//       `,
//       [req.params.id]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({
//         error: "Video not found."
//       });
//     }

//     res.json(result.rows[0]);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve video."
//     });

//   }
// });

// app.post(
//   "/api/videos",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         categoryId,
//         title,
//         description,
//         thumbnailUrl,
//         videoUrl
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO videos
//         (
//           category_id,
//           title,
//           description,
//           thumbnail_url,
//           video_url
//         )
//         VALUES
//         (
//           $1,$2,$3,$4,$5
//         )
//         RETURNING *;
//         `,
//         [
//           categoryId,
//           title,
//           description,
//           thumbnailUrl,
//           videoUrl
//         ]
//       );

//       res.status(201).json({
//         message: "Video created successfully.",
//         video: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create video."
//       });

//     }

//   }
// );

// app.put(
//   "/api/videos/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         categoryId,
//         title,
//         description,
//         thumbnailUrl,
//         videoUrl
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE videos
//         SET
//           category_id = $1,
//           title = $2,
//           description = $3,
//           thumbnail_url = $4,
//           video_url = $5
//         WHERE id = $6
//         RETURNING *;
//         `,
//         [
//           categoryId,
//           title,
//           description,
//           thumbnailUrl,
//           videoUrl,
//           req.params.id
//         ]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Video not found."
//         });
//       }

//       res.json({
//         message: "Video updated successfully.",
//         video: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to update video."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/videos/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         DELETE FROM videos
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Video not found."
//         });
//       }

//       res.json({
//         message: "Video deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to delete video."
//       });

//     }

//   }
// );

// app.get("/api/video-categories", async (req, res) => {
//   try {

//     const result = await query(`
//       SELECT *
//       FROM video_categories
//       ORDER BY name;
//     `);

//     res.json(result.rows);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       error: "Failed to retrieve categories."
//     });

//   }
// });

// app.post(
//   "/api/video-categories",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const { name } = req.body;

//       const result = await query(
//         `
//         INSERT INTO video_categories
//         (name)
//         VALUES ($1)
//         RETURNING *;
//         `,
//         [name]
//       );

//       res.status(201).json({
//         category: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to create category."
//       });

//     }

//   }
// );

// app.get(
//   "/api/videos/:id/comments",
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT
//           vc.*,
//           u.full_name
//         FROM video_comments vc
//         JOIN users u
//           ON vc.user_id = u.id
//         WHERE vc.video_id = $1
//         ORDER BY vc.created_at DESC;
//         `,
//         [req.params.id]
//       );

//       res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to retrieve comments."
//       });

//     }

//   }
// );

// app.post(
//   "/api/videos/:id/comments",
//   requireAuth,
//   async (req: any, res) => {

//     try {

//       const { content } = req.body;

//       const result = await query(
//         `
//         INSERT INTO video_comments
//         (
//           video_id,
//           user_id,
//           content
//         )
//         VALUES
//         (
//           $1,$2,$3
//         )
//         RETURNING *;
//         `,
//         [
//           req.params.id,
//           req.user.id,
//           content
//         ]
//       );

//       res.status(201).json({
//         comment: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         error: "Failed to add comment."
//       });

//     }

//   }
// );



// // ============================================================================
// // 5. CAREERS & VOLUNTEER OPPORTUNITIES API ROUTES
// // ============================================================================

// /**
//  * List available cultural job postings, internships, and scholarships.
//  */
// app.get("/api/careers", async (req, res) => {
//   try {
//     const listQuery = "SELECT * FROM opportunities ORDER BY deadline ASC;";
//     const dbResult = await query(listQuery);
//     return res.json(dbResult.rows);
//   } catch (error: any) {
//     console.error("Error retrieving job postings:", error);
//     return res.status(500).json({ error: "Failed to fetch active opportunities." });
//   }
// });

// /**
//  * Store applicant applications, supporting CV files or resumes.
//  */
// app.post("/api/careers/:id/apply", requireAuth, async (req: any, res) => {
//   try {
//     const opportunityId = req.params.id;
//     const userId = req.user.id;
//     const { cvFileUrl } = req.body;
//     if (!cvFileUrl) {
//       return res.status(400).json({ error: "Missing required field (cvFileUrl)." });
//     }

//     const applyQuery = `
//       INSERT INTO applications (opportunity_id, user_id, cv_file_url)
//       VALUES ($1, $2, $3)
//       RETURNING *;
//     `;
//     const dbResult = await query(applyQuery, [opportunityId, userId, cvFileUrl]);

//     return res.status(201).json({
//       message: "Application submitted successfully.",
//       application: dbResult.rows[0]
//     });
//   } catch (error: any) {
//     console.error("Error submitting application:", error);
//     return res.status(500).json({ error: "Failed to log candidate application." });
//   }
// });

// app.get("/api/careers/:id", async (req, res) => {
//   try {

//     const result = await query(
//       `
//       SELECT *
//       FROM opportunities
//       WHERE id = $1
//       `,
//       [req.params.id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         error: "Opportunity not found."
//       });
//     }

//     return res.json(result.rows[0]);

//   } catch (error) {

//     console.error(error);

//     return res.status(500).json({
//       error: "Failed to retrieve opportunity."
//     });

//   }
// });

// app.post(
//   "/api/careers",
//   requireAuth,
//   requirePresenter,
//   async (req: any, res) => {

//     try {

//       const {
//         category,
//         title,
//         description,
//         deadline
//       } = req.body;

//       const result = await query(
//         `
//         INSERT INTO opportunities
//         (
//           category,
//           title,
//           description,
//           deadline,
//           posted_by
//         )
//         VALUES
//         (
//           $1,$2,$3,$4,$5
//         )
//         RETURNING *;
//         `,
//         [
//           category,
//           title,
//           description,
//           deadline,
//           req.user.id
//         ]
//       );

//       return res.status(201).json({
//         message: "Opportunity created successfully.",
//         opportunity: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to create opportunity."
//       });

//     }

//   }
// );

// app.put(
//   "/api/careers/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const {
//         category,
//         title,
//         description,
//         deadline
//       } = req.body;

//       const result = await query(
//         `
//         UPDATE opportunities
//         SET
//           category = $1,
//           title = $2,
//           description = $3,
//           deadline = $4
//         WHERE id = $5
//         RETURNING *;
//         `,
//         [
//           category,
//           title,
//           description,
//           deadline,
//           req.params.id
//         ]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Opportunity not found."
//         });
//       }

//       return res.json({
//         message: "Opportunity updated successfully.",
//         opportunity: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to update opportunity."
//       });

//     }

//   }
// );

// app.delete(
//   "/api/careers/:id",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         DELETE FROM opportunities
//         WHERE id = $1
//         RETURNING *;
//         `,
//         [req.params.id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Opportunity not found."
//         });
//       }

//       return res.json({
//         message: "Opportunity deleted successfully."
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to delete opportunity."
//       });

//     }

//   }
// );


// app.get(
//   "/api/careers/:id/applications",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const result = await query(
//         `
//         SELECT
//           a.*,
//           u.full_name,
//           u.email
//         FROM applications a
//         JOIN users u
//           ON a.user_id = u.id
//         WHERE a.opportunity_id = $1
//         ORDER BY a.submitted_at DESC
//         `,
//         [req.params.id]
//       );

//       return res.json(result.rows);

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to retrieve applications."
//       });

//     }

//   }
// );

// app.put(
//   "/api/applications/:id/status",
//   requireAuth,
//   requirePresenter,
//   async (req, res) => {

//     try {

//       const { status } = req.body;

//       const result = await query(
//         `
//         UPDATE applications
//         SET status = $1
//         WHERE id = $2
//         RETURNING *;
//         `,
//         [
//           status,
//           req.params.id
//         ]
//       );

//       if (!result.rows.length) {
//         return res.status(404).json({
//           error: "Application not found."
//         });
//       }

//       return res.json({
//         message: "Application updated.",
//         application: result.rows[0]
//       });

//     } catch (error) {

//       console.error(error);

//       return res.status(500).json({
//         error: "Failed to update application."
//       });

//     }

//   }
// );


// // ============================================================================
// // 6. MONETIZATION (SUBSCRIPTIONS, PAYMENTS, DONATIONS) API ROUTES
// // ============================================================================

// /**
//  * Log payments for ad-free premium plans or direct cultural community donations.
//  */
// app.post("/api/monetization/payment", requireAuth, async (req: any, res) => {
//   try {
//     const { type, amount, currency, providerRef } = req.body;
//     const userId = req.user.id;
//     if (!type || !amount || !currency || !providerRef) {
//       return res.status(400).json({ error: "Missing required transaction values." });
//     }

//     const insertPayment = `
//       INSERT INTO payments (user_id, type, amount, currency, provider_reference, status)
//       VALUES ($1, $2, $3, $4, $5, 'successful')
//       RETURNING *;
//     `;
//     const dbResult = await query(insertPayment, [userId || null, type, amount, currency, providerRef]);

//     // If type is subscription, also insert or update subscription record
//     let subscription = null;
//     if (type === "subscription" && userId) {
//       const startedAt = new Date();
//       const renewsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days renewal
//       const insertSub = `
//         INSERT INTO subscriptions (user_id, plan, status, started_at, renews_at)
//         VALUES ($1, 'Premium Ad-Free Monthly', 'active', $2, $3)
//         RETURNING *;
//       `;
//       const subResult = await query(insertSub, [userId, startedAt, renewsAt]);
//       subscription = subResult.rows[0];
//     }

//     return res.status(201).json({
//       message: "Payment processed and stored successfully.",
//       payment: dbResult.rows[0],
//       subscription
//     });
//   } catch (error: any) {
//     console.error("Error creating payment ledger:", error);
//     return res.status(500).json({ error: "Database payment ledger failed." });
//   }
// });

// // ============================================================================
// // 7. ANALYTICS EVENTS LOGGING API ROUTE
// // ============================================================================





// /**
//  * Ingest high-volume analytics events (likes, listens, lesson starts) for dashboards.
//  */
// app.post("/api/analytics/event", requireAuth, async (req: any, res) => {
//   try {
//     const { eventType, metadata } = req.body;
//     const userId = req.user.id;
//     if (!eventType) {
//       return res.status(400).json({ error: "Missing required parameter: eventType." });
//     }

//     const insertEvent = `
//       INSERT INTO analytics_events (user_id, event_type, metadata)
//       VALUES ($1, $2, $3)
//       RETURNING id, occurred_at;
//     `;
//     const dbResult = await query(insertEvent, [userId || null, eventType, JSON.stringify(metadata || {})]);

//     return res.status(201).json({
//       success: true,
//       id: dbResult.rows[0]?.id,
//       occurredAt: dbResult.rows[0]?.occurred_at
//     });
//   } catch (error: any) {
//     console.error("Error logging analytics event:", error);
//     // Silent fail gracefully for telemetry so it never blocks key user actions!
//     return res.status(201).json({ success: false, info: "Gracefully bypassed telemetry error." });
//   }
// });

// app.listen(PORT, () => {
//   console.log(
//     `Backend running on port ${PORT}`
//   );
// });


