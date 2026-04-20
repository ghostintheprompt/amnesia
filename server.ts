import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route: Scan a URL for media
  app.post('/api/scan', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      const baseUrl = new URL(url).origin;

      const images: any[] = [];
      $('img').each((_, el) => {
        let src = $(el).attr('src');
        if (src) {
          if (src.startsWith('/')) {
            src = `${baseUrl}${src}`;
          } else if (!src.startsWith('http')) {
            src = new URL(src, url).href;
          }
          images.push({
            src,
            alt: $(el).attr('alt') || '',
            status: 'pending'
          });
        }
      });

      const videos: any[] = [];
      $('video').each((_, el) => {
        let src = $(el).attr('src') || $(el).find('source').attr('src');
        if (src) {
          if (src.startsWith('/')) {
            src = `${baseUrl}${src}`;
          } else if (!src.startsWith('http')) {
            src = new URL(src, url).href;
          }
          videos.push({
            src,
            status: 'pending'
          });
        }
      });

      res.json({ url, images, videos });
    } catch (error: any) {
      console.error('Scan error:', error.message);
      res.status(500).json({ error: 'Failed to scan website' });
    }
  });

  // API Route: Proxy image to avoid CORS and get base64
  app.get('/api/proxy-resource', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL required');

    try {
      const response = await axios.get(url as string, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      const contentType = response.headers['content-type'] as string || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.send(response.data);
    } catch (error) {
      res.status(500).send('Failed to fetch resource');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
