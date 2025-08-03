# GemMini UI

A single-page front-end for **GemMini Query** – ask natural-language questions,
Gemini turns them into SQL, Supabase runs the query.

*   **Frameworks**: Solarite (reactive micro-JS) + Eternium CSS (utility classes)
*   **API**: Cloudflare Worker ➜ Gemini 1.5 Flash ➜ Supabase Edge Function  
    `https://gemmini-query.baboucarr-lab.workers.dev`
*   **Build**: Vite → static files in `/dist`

## Development

```bash
npm i
npm run dev     # hot-reload at http://localhost:5173
