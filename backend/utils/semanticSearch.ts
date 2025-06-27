import File, { FileInterface } from "../models/file-model";
import fs from "fs";
import path from "path";
import env from "../enviroment/env";
import { getFSStoragePath } from "./getFSStoragePath";
import ffmpeg from "fluent-ffmpeg";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { WaveFile } from "wavefile";
import getFileData from "../services/chunk-service/utils/getFileData";
import os from "os";
import crypto from "crypto";
import User from "../models/user-model";
import axios from "axios";
import FormData from "form-data";
import OpenAI from "openai";
import { AssemblyAI } from "assemblyai";
import { Request, Response } from "express";
import { SearchClient, AzureKeyCredential, odata } from "@azure/search-documents";
import SemanticIndex from "../models/semantic-index-model";

// --- Logging Helper ---
function logInfo(...args: any[]) {
  console.log("[SemanticSearch][INFO]", ...args);
}
function logWarn(...args: any[]) {
  console.warn("[SemanticSearch][WARN]", ...args);
}
function logError(...args: any[]) {
  console.error("[SemanticSearch][ERROR]", ...args);
}

const NSCALE_API_KEY = process.env.NSCALE_API_KEY || "";
const NSCALE_BASE_URL = "https://inference.api.nscale.com/v1";
const nscaleClient = new OpenAI({
  apiKey: NSCALE_API_KEY,
  baseURL: NSCALE_BASE_URL,
});

const HF_API_TOKEN = process.env.HF_API_TOKEN || "";
if (!HF_API_TOKEN) {
  logError("FATAL: HF_API_TOKEN is not set in the environment. AI features will be disabled.");
}

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || "";
const assemblyClient = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });

const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT || "https://cloud9.search.windows.net";
const AZURE_SEARCH_API_KEY = process.env.AZURE_SEARCH_API_KEY || "";
const AZURE_SEARCH_INDEX = process.env.AZURE_SEARCH_INDEX || "semantic-index";

const searchClient = new SearchClient(
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_INDEX,
  new AzureKeyCredential(AZURE_SEARCH_API_KEY)
);

// --- Extraction Helpers (with Audio) ---

const extractFrame = (videoPath: string, framePath: string): Promise<void> => {
  logInfo(`Extracting frame from video: ${videoPath} -> ${framePath}`);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", () => {
        logInfo("Frame extraction complete:", framePath);
        resolve();
      })
      .on("error", (err) => {
        logError("Frame extraction failed:", err);
        reject(err);
      })
      .screenshots({ count: 1, filename: path.basename(framePath), folder: path.dirname(framePath) });
  });
};

const extractAudio = (mediaPath: string, audioPath: string): Promise<void> => {
  logInfo(`Extracting audio from media: ${mediaPath} -> ${audioPath}`);
  return new Promise((resolve, reject) => {
    ffmpeg(mediaPath)
      .on("end", () => {
        logInfo("Audio extraction complete:", audioPath);
        resolve();
      })
      .on("error", (err) => {
        logError("Audio extraction failed:", err);
        reject(err);
      })
      .output(audioPath)
      .audioCodec('pcm_s16le').audioFrequency(16000).audioChannels(1)
      .run();
  });
};

// --- NScale Llama for Image/Video Captioning ---
async function getImageCaptionNScale(imageBuffer: Buffer): Promise<string> {
  logInfo("Requesting image caption from NScale Llama...");
  const base64Image = imageBuffer.toString("base64");
  try {
    const response = await nscaleClient.chat.completions.create({
      model: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is in this image?" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });
    const caption = response.choices?.[0]?.message?.content?.trim() || "";
    logInfo("Received image caption:", caption);
    return caption;
  } catch (err) {
    logError("Failed to get image caption from NScale:", err);
    return "";
  }
}

// --- NScale Qwen for Text Keywords/Categories/Sentiment/Summary ---
async function getTextFeaturesNScale(text: string): Promise<{
  keywords: string[];
  categories: string[];
  sentiment: string;
  summary: string;
}> {
  logInfo("Requesting advanced features from NScale Qwen...");
  const prompt = `
Given the following text, do the following:
1. Extract the 20 most important keywords or keyphrases (comma-separated).
2. Extract the 15 most relevant categories or topics (comma-separated).
3. Analyze the overall sentiment (positive, negative, neutral, or mixed).
4. Provide a concise summary (1-2 sentences).
Return as JSON:
{"keywords": [...], "categories": [...], "sentiment": "...", "summary": "..."}

Text:
${text}
  `.trim();

  try {
    const response = await nscaleClient.chat.completions.create({
      model: "Qwen/Qwen3-32B",
      messages: [{ role: "user", content: prompt }],
    });

    let output = response.choices?.[0]?.message?.content || "";
    logInfo("NScale Qwen raw output:", output);
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) output = jsonMatch[0];
      const parsed = JSON.parse(output);
      logInfo("Parsed advanced features:", parsed);
      return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((s: string) => s.trim()) : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories.map((s: string) => s.trim()) : [],
        sentiment: typeof parsed.sentiment === "string" ? parsed.sentiment.trim() : "",
        summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
      };
    } catch (parseErr) {
      logWarn("Failed to parse NScale Qwen output as JSON:", parseErr);
      return { keywords: [], categories: [], sentiment: "", summary: "" };
    }
  } catch (err) {
    logError("Failed to get advanced features from NScale Qwen:", err);
    return { keywords: [], categories: [], sentiment: "", summary: "" };
  }
}

// --- Hugging Face Audio Transcription (Whisper) ---
async function transcribeAudioWithHF(filePath: string): Promise<string> {
  logInfo("Transcribing audio with Hugging Face Whisper:", filePath);
  const url = "https://api-inference.huggingface.co/models/openai/whisper-base";
  try {
    const audioBuffer = await fs.promises.readFile(filePath);
    const res = await axios.post(
      url,
      audioBuffer,
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "audio/wav"
        },
        timeout: 120000
      }
    );
    logInfo("Audio transcription complete.");
    return res.data.text?.trim() || "";
  } catch (err) {
    logError("Audio transcription failed:", err);
    return "";
  }
}

// --- AssemblyAI Audio Transcription ---
async function transcribeAudioWithAssemblyAI(filePath: string): Promise<string> {
  logInfo("Transcribing audio with AssemblyAI:", filePath);
  try {
    let audioUrl = filePath;
    if (!/^https?:\/\//.test(filePath)) {
      audioUrl = await assemblyClient.files.upload(filePath);
      logInfo("Uploaded audio to AssemblyAI:", audioUrl);
    }

    const params = {
      audio: audioUrl,
     // speech_model: "universal" // Omit or use as any if needed
    };
    const transcript = await assemblyClient.transcripts.transcribe(params);
    logInfo("Audio transcription complete.");
    return transcript.text?.trim() || "";
  } catch (err) {
    logError("Audio transcription failed (AssemblyAI):", err);
    return "";
  }
}

// --- Hugging Face Text Embedding ---
async function getTextEmbeddingHF(text: string): Promise<number[]> {
  logInfo("Requesting text embedding from Hugging Face router...");
  const url = "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5/pipeline/feature-extraction";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });
    const data = await res.json();
    logInfo("Received text embedding from router.");
    // Accept both flat and nested array formats
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        return data[0];
      }
      // Flat array (correct format)
      if (typeof data[0] === "number") {
        return data as number[];
      }
    }
    logWarn("Unexpected embedding response format:", data);
    return [];
  } catch (err) {
    logError("Failed to get text embedding from Hugging Face router:", err);
    return [];
  }
}

// --- Core Logic: Token Generation & Embedding (Enhanced) ---
export async function generateTokensForFile(file: FileInterface): Promise<{
  fileKey: string;
  tokens: string[];
  categories: string[];
  type: string;
  embedding: number[];
  sentiment: string;
  summary: string;
  fullText: string;
} | null> {
  logInfo(`Generating tokens/features for file: ${file.filename}`);
  const decryptedFilePath = await reconstructDecryptedFile(file);
  if (!decryptedFilePath) {
    logWarn("Failed to reconstruct decrypted file:", file.filename);
    return null;
  }

  const ext = path.extname(decryptedFilePath).toLowerCase();
  let tokens: string[] = [];
  let categories: string[] = [];
  let type = "";
  let textForEmbedding = "";
  let sentiment = "";
  let summary = "";
  let fullText = "";

  try {
    if (['.jpg', '.jpeg', '.png', '.webp', '.heic', '.JPG', '.HEIC'].includes(ext)) {
      logInfo("Processing as image file.");
      const imageBuffer = await fs.promises.readFile(decryptedFilePath);
      const caption = await getImageCaptionNScale(imageBuffer);
      fullText = caption;
      const features = await getTextFeaturesNScale(caption);
      tokens = features.keywords;
      categories = features.categories.length ? features.categories : ["image"];
      sentiment = features.sentiment;
      summary = features.summary;
      textForEmbedding = caption + " " + summary;
      type = "image";
    } else if (['.mp4', '.mov', '.mkv'].includes(ext)) {
      logInfo("Processing as video file.");
      const framePath = `${decryptedFilePath}_frame.jpg`;
      await extractFrame(decryptedFilePath, framePath);
      const imageBuffer = await fs.promises.readFile(framePath);
      const caption = await getImageCaptionNScale(imageBuffer);
      fullText = caption;
      const features = await getTextFeaturesNScale(caption);
      tokens = features.keywords;
      categories = features.categories.length ? features.categories : ["video"];
      sentiment = features.sentiment;
      summary = features.summary;
      textForEmbedding = caption + " " + summary;
      type = "video";
      fs.promises.unlink(framePath).catch(() => {});
    } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
      logInfo("Processing as audio file.");
      const audioPath = `${decryptedFilePath}.wav`;
      await extractAudio(decryptedFilePath, audioPath);
      const transcript = await transcribeAudioWithAssemblyAI(audioPath);
      fullText = transcript;
      const features = await getTextFeaturesNScale(transcript);
      tokens = features.keywords;
      categories = features.categories.length ? features.categories : ["audio"];
      sentiment = features.sentiment;
      summary = features.summary;
      textForEmbedding = transcript + " " + summary;
      type = "audio";
      fs.promises.unlink(audioPath).catch(() => {});
    } else if ([".txt", ".md", ".pdf", ".docx"].includes(ext)) {
      logInfo("Processing as text/document file.");
      let text = "";
      if (ext === ".pdf") text = (await pdfParse(await fs.promises.readFile(decryptedFilePath))).text;
      else if (ext === ".docx") text = (await mammoth.extractRawText({ path: decryptedFilePath })).value;
      else text = await fs.promises.readFile(decryptedFilePath, "utf8");
      const safeText = text.slice(0, 20000); // allow more context
      fullText = safeText;
      const features = await getTextFeaturesNScale(safeText);
      tokens = features.keywords;
      categories = features.categories;
      sentiment = features.sentiment;
      summary = features.summary;
      textForEmbedding = safeText + " " + summary;
      type = "text";
    }
  } catch (err) {
    logError("Error during file token/feature generation:", err);
  }

  fs.promises.unlink(decryptedFilePath).catch(() => {});
  if (!tokens.length) {
    logWarn("No tokens generated for file:", file.filename);
    return null;
  }

  // Get dense embedding for the full text + summary for richer context
  let embedding: number[] = [];
  try {
    embedding = textForEmbedding ? await getTextEmbeddingHF(textForEmbedding) : [];
  } catch (err) {
    logError("Error getting embedding:", err);
  }

  logInfo(`Token/feature generation complete for file: ${file.filename}`, { tokens, categories, type, sentiment, summary });
  return { fileKey: file.filename, tokens, categories, type, embedding, sentiment, summary, fullText };
}

// --- Helper: Decrypt and reconstruct file to temp path, return temp path ---
async function reconstructDecryptedFile(file: FileInterface): Promise<string | null> {
  logInfo("Reconstructing decrypted file for:", file.filename);
  try {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `ai-decrypt-${crypto.randomUUID()}${path.extname(file.filename)}`);
    const writeStream = fs.createWriteStream(tempFilePath);

    const user = await User.findById(file.metadata.owner);
    if (!user) {
      logWarn("User not found for file:", file.filename);
      return null;
    }

    const finished = new Promise<void>((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const fakeRes = writeStream as any;
    fakeRes.set = () => {};
    fakeRes.on = writeStream.on.bind(writeStream);

    await getFileData(fakeRes, file._id.toString(), user);
    await finished;

    try {
      const stats = await fs.promises.stat(tempFilePath);
      if (stats.size === 0) {
        logWarn("Decrypted file is empty:", tempFilePath);
        return null;
      }
    } catch (err) {
      logWarn("Failed to stat decrypted file:", tempFilePath, err);
      return null;
    }

    logInfo("Decrypted file reconstructed at:", tempFilePath);
    return tempFilePath;
  } catch (e) {
    logError("Failed to reconstruct decrypted file:", e);
    return null;
  }
}

// --- Cosine similarity ---
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] || 0), 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

// --- Indexing: Store tokens & embedding per file ---
export async function addFileToIndex(file: FileInterface) {
  logInfo("Adding file to MongoDB semantic index:", file.filename);
  try {
    const tokenData = await generateTokensForFile(file);
    if (!tokenData || !tokenData.embedding.length) {
      logWarn("No token data or embedding for file, skipping index:", file.filename);
      return;
    }
    await SemanticIndex.findOneAndUpdate(
      { userId: file.metadata.owner, fileKey: tokenData.fileKey },
      {
        $set: {
          tokens: tokenData.tokens,
          categories: tokenData.categories,
          type: tokenData.type,
          embedding: tokenData.embedding,
          sentiment: tokenData.sentiment,
          summary: tokenData.summary,
          fullText: tokenData.fullText,
        },
      },
      { upsert: true, new: true }
    );
    logInfo("File indexed in MongoDB:", file.filename);
  } catch (error) {
    logError(`[AI] Failed to index file in MongoDB ${file.filename}:`, error);
  }
}

// --- Search: MongoDB vector similarity search with threshold ---
export async function searchFiles(
  query: string,
  userId: string,
  topK = 10,
  similarityThreshold = 0.55 // You can adjust this threshold as needed
): Promise<{ files: any[]; folders: any[] }> {
  logInfo("Semantic search query received:", query);

  if (typeof query !== "string" || !query.trim()) {
    logWarn("Empty or invalid query for semantic search.");
    return { files: [], folders: [] };
  }

  // Get dense embedding for the query
  let queryEmbedding: number[] = [];
  try {
    queryEmbedding = await getTextEmbeddingHF(query);
    logInfo("Query embedding generated:", queryEmbedding.slice(0, 5), "...");
  } catch (err) {
    logError("Failed to get embedding for query:", err);
    return { files: [], folders: [] };
  }

  // Find all semantic indexes for this user
  let semanticDocs = await SemanticIndex.find({ userId });

  // Compute cosine similarity and filter by threshold
  let results = semanticDocs
    .map(doc => ({
      ...doc.toObject(),
      similarity: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .filter(r => r.similarity >= similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  // Fetch file metadata from DB
  let files: any[] = [];
  try {
    if (results.length > 0) {
      const dbFiles = await File.find({
        filename: { $in: results.map((r: any) => r.fileKey) },
        "metadata.trashed": { $ne: true }
      });
      const filesMap = new Map(dbFiles.map((f: any) => [f.filename, f]));
      files = results
        .map((r: any) => {
          const file = filesMap.get(r.fileKey);
          if (file) {
            file.semantic = {
              tokens: r.tokens,
              categories: r.categories,
              sentiment: r.sentiment,
              summary: r.summary,
              fullText: r.fullText,
              similarity: r.similarity,
            };
          }
          return file;
        })
        .filter(Boolean);
      logInfo(`Semantic search found ${files.length} files above threshold.`);
    }
  } catch (err) {
    logError("Failed to fetch files from DB for semantic search:", err);
  }

  // If no results above threshold, return empty arrays
  if (files.length === 0) {
    logInfo("No semantic search results above threshold.");
    return { files: [], folders: [] };
  }

  return { files, folders: [] };
}
export const semanticSearchHandler = async (req: Request, res: Response) => {
  const { query, userId } = req.body;
  if (typeof query !== "string" || !query.trim() || !userId) {
    return res.status(400).json({ error: "Missing or invalid query or user" });
  }
  try {
    const results = await searchFiles(query, userId);
    res.json(results);
  } catch (err) {
    logError("Semantic search handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};