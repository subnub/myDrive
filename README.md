# Cloud9: AI-Powered Cloud Storage & Semantic Search

Cloud9 is a modern, AI-powered cloud file storage and sharing platform. It enables users to securely store, access, and share files, with advanced features like digital certificate hosting and highly accurate AI semantic search. The platform is designed for seamless deployment in cloud environments and robust, scalable file management.

---
<p align="center">
  <img src="./images/ui.png" alt="Cloud9 UI Screenshot" style="border: 2px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); max-width: 100%;">
</p>

[![Test Cloud9 in Production](https://img.shields.io/badge/Launch%20Cloud9-Production-blue?style=for-the-badge&logo=cloud)](https://cloud9ca3.azurewebsites.net/home)

[![User Guide](https://img.shields.io/badge/User%20Guide-Read%20Now-green?style=for-the-badge&logo=book)](./user-guide.md)
## Table of Contents
- [Introduction](#introduction)
- [Key Features](#key-features)
- [AI Semantic Search: How It Works and Why It's Accurate](#ai-semantic-search-how-it-works-and-why-its-accurate)
- [Tech Stack](#tech-stack)
- [Deployment & Architecture](#deployment--architecture)
- [Getting Started](#getting-started)
- [Authors](#authors)

---

## Introduction
Cloud9 is built for individuals and organizations that need secure, scalable, and intelligent file management. It supports:
- Uploading and storing any file type
- Accessing files with built-in viewers (images, video)
- Sharing files via secure links 
- Public hosting of PDF certificates
- Secure document distribution via email
- Advanced AI-powered semantic search for fast, context-aware file discovery

---

## Key Features
- User authentication with JWT 
- Folder-based, intuitive file/folder management
- Multi-format viewers: native HTML5 video/image players
- Secure sharing: signed links
- AI semantic search: find files by meaning, not just filename
- Email distribution of documents
- Cloud-native storage: Local (MVP), AWS S3, or Azure Blob (production)

---

## AI Semantic Search: How It Works and Why It's Accurate
Cloud9's AI semantic search is a core feature, providing highly accurate, context-aware file discovery that goes far beyond traditional filename or keyword search. Here’s how it works:

### Deep Content Analysis
- For every file (text, image, video, audio), Cloud9 extracts the actual content using specialized tools:
  - Text extraction from documents (PDF, DOCX, TXT)
  - Image and video captioning using large language models (LLMs)
  - Audio transcription using AssemblyAI
- The extracted content is then analyzed by advanced LLMs (OpenAI via NScale, HuggingFace Transformers) to generate:
  - Key tokens and keywords
  - Categories and topics
  - Sentiment analysis
  - Concise summaries

### Embedding and Indexing
- The system generates dense vector embeddings for each file using HuggingFace models, capturing the semantic meaning of the content.
- All semantic data (tokens, categories, embeddings, sentiment, summary, and full text) is indexed and stored in MongoDB, not in Azure AI Search. This enables fast, private, and scalable search directly on your own infrastructure.

### Semantic Search Process
- When a user searches, their query is also embedded into a vector using the same AI models.
- Cloud9 computes the similarity between the query embedding and all file embeddings using cosine similarity, ranking results by true semantic relevance, not just keyword match.
#### Example: How Semantic Indexes Are Stored in MongoDB

All semantic indexes—such as tokens, categories, embeddings, sentiment, summary, and full text—are stored in MongoDB documents for each file. For example, an audio file like `untitled.mp3` might have tokens, categories, an embedding vector, sentiment, summary, and full text all saved together in its MongoDB record:

```json
{
  "_id": ObjectId("685d0c67854ca2d196c63b8f"),
  "fileKey": "untitled.mp3",
  "userId": ObjectId("685d09ceb6a5652a04fbeecf"),
  "__v": 0,
  "tokens": [
    "Wow",
    "pizza",
    "arrived",
    "delivery",
    "excitement",
    "arrival",
    "fast food",
    "customer experience",
    "quick service",
    "food delivery",
    "positive feedback",
    "online ordering",
    "takeout",
    "delivery food",
    "restaurant"
  ],
  "categories": [
    "Food Delivery",
    "Customer Experience",
    "Fast Food",
    "Restaurant Services",
    "Online Ordering",
    "Takeout",
    "Delivery Service",
    "Food Industry",
    "Consumer Satisfaction",
    "Service Efficiency"
  ],
  "type": "audio",
  "embedding": [
    -0.04133770242333412,
    0.047071561217308044,
    0.02026103250682354,
    // ... (truncated for brevity)
    -0.05322674289345741
  ],
  "sentiment": "positive",
  "summary": "The text expresses excitement and satisfaction about the prompt arrival of a pizza delivery.",
  "fullText": "Wow, pizza arrived."
}
```
#### Example: How Semantic Indexes Are Stored for Video Files in MongoDB

Video files are indexed in MongoDB with the same rich semantic structure as audio files. For example, a video file like `recording_cam1_20250605112322.mov` might have tokens, categories, an embedding vector, sentiment, summary, and full text all saved together in its MongoDB record:

```json
{
  "_id": ObjectId("685d0a59c1efc358e3749961"),
  "fileKey": "recording_cam1_20250605112322.mov",
  "userId": ObjectId("685d09ceb6a5652a04fbeecf"),
  "__v": 0,
  "tokens": [
    "highway",
    "vehicles",
    "cars",
    "vans",
    "trucks",
    "emergency vehicles",
    "police car",
    "ambulance",
    "headlights",
    "dim lighting",
    "road conditions",
    "urban traffic",
    "low-light period",
    "multiple lanes",
    "grass median"
  ],
  "categories": [
    "Urban Traffic",
    "Highway",
    "Vehicles",
    "Emergency Services",
    "Road Infrastructure",
    "Lighting Conditions",
    "Nighttime/Morning Commute",
    "Transportation",
    "Safety",
    "Infrastructure"
  ],
  "type": "video",
  "embedding": [
    -0.02244461700320244,
    0.001266930135898292,
    0.005562394391745329,
    // ... (truncated for brevity)
    -0.0016332012601196766
  ],
  "sentiment": "neutral",
  "summary": "The image captures a busy highway during low-light conditions, featuring a mix of cars, vans, and trucks, along with police and emergency vehicles, against dimly lit urban traffic settings.",
  "fullText": "The image depicts a busy highway with multiple lanes of traffic, featuring various vehicles such as cars, vans, and trucks. The scene is set during either early morning or late evening, as indicated by the dim lighting and the use of headlights by many vehicles.\n\n**Key Features:**\n\n*   **Vehicles:** The highway is filled with a variety of vehicles, including:\n    *   Cars: Many cars are visible, some with their headlights on.\n    *   Vans: Several vans are present, some of which appear to be white.\n    *   Trucks: A few trucks can be seen in the distance.\n*   **Road Conditions:** The highway has multiple lanes, with a solid white line separating the lanes and a grassy median on the left side.\n*   **Lighting:** The lighting conditions suggest that the photo was taken during either early morning or late evening, as evidenced by the dim light and the use of headlights by many vehicles.\n*   **Emergency Vehicles:** Two emergency vehicles are visible in the image:\n    *   One has its lights on and appears to be a police car.\n    *   The other is an ambulance or fire truck with yellow and red markings.\n\n**Overall Scene:**\n\nThe image captures a typical urban traffic scene, with a mix of personal and commercial vehicles navigating through the highway during a low-light period. The presence of emergency vehicles adds a sense of urgency to the scene."
}
```

This structure ensures that video files are just as searchable and context-aware as audio or text files, enabling semantic search across all file types.
#### Example: How Semantic Indexes Are Stored for PDF/Text Files in MongoDB

PDF and text files are indexed in MongoDB with the same comprehensive semantic structure as audio and video files. For example, a PDF file like `Immatrikulations- und Studienbescheinigung (mit Verifizierung) [DE]-5.pdf` might have tokens, categories, an embedding vector, sentiment, summary, and full text all saved together in its MongoDB record:

```json
{
  ```json
  {
    "_id": ObjectId("685d0a4fccf8c40d7ef038ac"),
    "fileKey": "Immatrikulations- und Studienbescheinigung (mit Verifizierung) [DE]-5.pdf",
    "userId": ObjectId("685d09ceb6a5652a04fbeecf"),
    "__v": 0,
    "tokens": [
      "Technische Hochschule Rosenheim",
      "Immatrikulationsbescheinigung",
      "Bachelorstudiengang Applied Artificial Intelligence",
      "Neil Phillips",
      "Matrikelnummer 12345",
      "Vollzeitstudium",
      "ECTS Credits",
      "Regelstudienzeit",
      "Sommersemester 2025",
      "Wintersemester 2021/22",
      "PO WiSe 2021/22",
      "Bavarian Hochschulgesetz",
      "Haupthörer",
      "Bankverbindung",
      "Verifikationsnummer"
    ],
    "categories": [
      "Higher Education",
      "Academic Enrollment",
      "Study Programs",
      "University Administration",
      "Student Records",
      "ECTS Credits",
      "Study Regulations",
      "German Universities",
      "Artificial Intelligence",
      "Bavarian Higher Education Law"
    ],
    "type": "text",
    "embedding": [
      0.03585714101791382,
      0.06605468690395355,
      -0.051140423864126205,
      // ... (truncated)
      0.04784803465008736
    ],
    "sentiment": "neutral",
    "summary": "Herr , matriculated at Technische Hochschule Rosenheim since Wintersemester 2021/22, is enrolled in a full-time Bachelor's program in Applied Artificial Intelligence, with an extended regulation study period due to Bavarian higher education laws.",
    "fullText": "Immatrikulationsbescheinigung für Bachelorstudiengang Applied Artificial Intelligence, Technische Hochschule Rosenheim. Matrikelnummer 12345, Vollzeitstudium, immatrikuliert seit Wintersemester 2021/22. Sommersemester 2025, Regelstudienzeit verlängert gemäß Bayerisches Hochschulgesetz. Verifikationsnummer: ipNeJSHgJJwL."
  }
  ```
}
```
This structure ensures that PDF and text files are fully searchable and benefit from semantic search, just like audio and video files.
#### Example: How Semantic Indexes Are Stored for Image Files in MongoDB

Image files are indexed in MongoDB with the same comprehensive semantic structure as other file types. For example, a photo like `photo-1544923408-75c5cef46f14.jpeg` might have tokens, categories, an embedding vector, sentiment, summary, and full text all saved together in its MongoDB record:

```json
{
  "_id": ObjectId("685d0a37fd3b1dc7caa5e601"),
  "fileKey": "photo-1544923408-75c5cef46f14.jpeg",
  "userId": ObjectId("685d09ceb6a5652a04fbeecf"),
  "__v": 0,
  "tokens": [
    "red macaw",
    "vibrant plumage",
    "bright red body",
    "blue",
    "green",
    "yellow tail feathers",
    "white face",
    "black beak",
    "brown branch",
    "blurred green background",
    "natural setting",
    "forest",
    "jungle",
    "colorful macaw",
    "stunning portrait"
  ],
  "categories": [
    "Bird species",
    "Wildlife photography",
    "Animal imagery",
    "Natural habitats",
    "Avian characteristics",
    "Colorful animals",
    "Photography",
    "Tropical birds",
    "Nature photography",
    "Wildlife portraiture"
  ],
  "type": "image",
  "embedding": [
    0.0061674220487475395,
    -0.0004680829297285527,
    // ... (truncated for brevity)
    0.07107603549957275
  ],
  "sentiment": "positive",
  "summary": "The image showcases a vibrant red macaw with striking multicolored tail feathers perched on a branch in a natural forest or jungle setting, presenting a colorful and visually stunning wildlife portrait.",
  "fullText": "The image depicts a vibrant red macaw perched on a branch, showcasing its striking plumage. The bird's body is predominantly bright red, with a white face and black beak. Its tail feathers display a beautiful gradient of colors, transitioning from blue to green and yellow.\n\n**Key Features:**\n\n* **Bird:** A red macaw with a white face and black beak\n* **Plumage:** Bright red body, blue, green, and yellow tail feathers\n* **Branch:** A brown branch that the macaw is perched on\n* **Background:** A blurred green background, suggesting a natural setting such as a forest or jungle\n\nOverall, the image presents a stunning portrait of a colorful macaw in its natural habitat."
}
```
This structure ensures that image files are fully searchable and benefit from semantic search, just like audio, video, and text files.
- The result: Users find the right files even if they don’t remember exact filenames or keywords—search works by meaning, context, and even sentiment or summary.

### Why It’s Accurate
- Uses state-of-the-art LLMs for content understanding and feature extraction
- Handles all file types: text, images, video, and audio
- Embeddings and semantic features are updated as files are added or changed
- Search is robust to typos, synonyms, and vague queries
- All AI analysis and search is performed on your own MongoDB database for privacy and speed

---

## Tech Stack
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express, TypeScript
- Database: MongoDB (with optional DocumentDB/Azure CosmosDB)
- Authentication: JWT
- Storage: Local (MVP), AWS S3, Azure Blob
- AI/ML: OpenAI (NScale), HuggingFace, AssemblyAI
- PDF/Image/Video: PDF.js, Tesseract.js, ffmpeg, native HTML5

---

## Deployment & Architecture
- Cloud-native: Designed for deployment on Azure, AWS, or any cloud
- Dockerized: All services run in Docker containers for portability
- CI/CD: Supports automated build and deployment pipelines
- Environment management: Uses environment variables for secure config
- Scalable: Built for horizontal scaling in cloud environments

---

## Getting Started
### Prerequisites
- Sign up for free API keys for AI/ML services:
  - [Gwen NScale](https://gwen.nscale.io/) – required for LLM-based features
  - [HuggingFace](https://huggingface.co/join) – for embeddings and model inference
  After setting up your AI service accounts, add the following environment variables to your `.env` file:

  - `NSCALE_API_KEY` (for Gwen NScale)
  - `HUGGINGFACE_API_KEY` or `HF_TOKEN` (for HuggingFace)
  - `OPENAI_API_KEY` (if using OpenAI directly)
  - `ASSEMBLYAI_API_KEY` (for AssemblyAI)

  If you plan to use Azure Cognitive Search, also set:

  - `AZURE_SEARCH_ENDPOINT`
  - `AZURE_SEARCH_API_KEY`
  - `AZURE_SEARCH_INDEX`

  To enable email verification (for sharing and certificate delivery), create a [Mailjet](https://www.mailjet.com/) account and set these variables in your `.env` file:

  - `MAILJET_API_KEY`
  - `MAILJET_SECRET_KEY`
  - `EMAIL_VERIFICATION` (set to `true` to enable)
  - `EMAIL_DOMAIN`
  - `EMAIL_ADDRESS`
  - `EMAIL_API_KEY`
  - `EMAIL_HOST`
  - `REMOTE_URL`

  These variables are required for Cloud9 to send verification and sharing emails using Mailjet.
  - To enable email verification (for sharing and certificate delivery), you need a [Mailjet](https://www.mailjet.com/) account and must set the following environment variables in your `.env` file:
    - `MAILJET_API_KEY`
    - `MAILJET_SECRET_KEY`
    - `EMAIL_VERIFICATION` (set to `true` to enable)
    - `EMAIL_DOMAIN`
    - `EMAIL_ADDRESS`
    - `EMAIL_API_KEY`
    - `EMAIL_HOST`
    - `REMOTE_URL`
  - These variables are required for Cloud9 to send verification and sharing emails using Mailjet.
- Ensure your account is on a free tier or trial plan to get started
- Add your API keys to the appropriate environment variables as described in the `.env` file
- Node.js >= 18.x
- MongoDB (or Azure CosmosDB)
- Git

### Local Development
1. Clone the repo
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm start` (or use Docker Compose)

### Cloud Deployment
- Build and deploy using Docker images
- Configure environment variables for your cloud services
- Use your preferred cloud provider’s container hosting

---

## Authors
- [Soumyadip Banerjee](https://github.com/Nova200019)
- [subnub](https://github.com/subnub)

---

Cloud9: Secure, intelligent, and accurate file management with AI-powered semantic search.
