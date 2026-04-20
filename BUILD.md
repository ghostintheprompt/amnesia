# Building Amnesia

Amnesia is a React + Vite application with an Express backend for asset proxying and scanning.

### Prerequisites
- Node.js (v18+)
- Gemini API Key

### Build Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ghostintheprompt/amnesia.git
   cd amnesia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

### First-Launch Instructions
The first time you run the app, ensure your `GEMINI_API_KEY` is correctly set. Navigate to `http://localhost:3000` to access the web interface.

### Troubleshooting
- **CORS Errors:** Assets are proxied through the backend. If an asset fails to load, the target site may be blocking headful requests.
- **Analysis Failures:** Check your Gemini API quota and ensure the key has access to the `gemini-1.5-flash` model.
