# Studio — Multi-Agent Coding Chat

Chat AI khusus coding: 10 agent spesialis (Gemini, OpenRouter, Groq) yang bagi
tugas — router, architect, UI/UX + anti-slop reviewer, CSS, JS, scraper, QA,
security, assembler — buat bikin landing page / web / scraper, lengkap dengan
timeline kerja, live preview, run Python (via Pyodide di browser), dan export ZIP.

## Cara upload & deploy (GitHub web + Vercel, tanpa terminal)

1. Buat repo baru di GitHub (lewat web, "Add file" > "Upload files").
2. Upload semua file/folder di project ini, jaga struktur foldernya (app/, lib/,
   components/, dst) — kalau upload lewat web UI GitHub, bikin folder dengan
   cara ketik nama folder diikuti `/` saat kasih nama file baru.
3. Buka [vercel.com](https://vercel.com) > New Project > Import dari repo GitHub itu.
   Next.js auto-detect, tinggal Deploy.
4. **Sebelum atau sesudah deploy**, di Vercel: Settings > Environment Variables,
   tambahkan 3 key ini (dari `.env.example`):
   - `GEMINI_API_KEY` — dari [aistudio.google.com](https://aistudio.google.com/apikey)
   - `OPENROUTER_API_KEY` — dari [openrouter.ai/keys](https://openrouter.ai/keys)
   - `GROQ_API_KEY` — dari [console.groq.com/keys](https://console.groq.com/keys)
5. Redeploy setelah nambah env var (Vercel > Deployments > ⋯ > Redeploy).

## Hal penting yang perlu lu tau

- **Semua model yang dipakai FREE tier** (per Sept 2026): `gemini-3.8-flash` (Gemini),
  `openai/gpt-oss-120b` & `openai/gpt-oss-20b` (Groq), dan beberapa model `:free`
  di OpenRouter (`nvidia/nemotron-3-super-120b-a12b`, `cohere/north-mini-code`,
  `poolside/laguna-s-2.1`, `nex-agi/nex-n2.5-pro`). **Model ID gampang berubah** —
  provider sering rilis/deprecate model tiap beberapa bulan (contoh: `gemini-2.5-pro`
  dan `llama-3.3-70b-versatile` yang tadinya gua pakai udah dideprecate/paid-only).
  Kalau ada error "model not found", cek ulang:
  - Gemini: [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
  - Groq: [console.groq.com/docs/models](https://console.groq.com/docs/models)
  - OpenRouter free models: [openrouter.ai/collections/free-models](https://openrouter.ai/collections/free-models)
- **Rate limit model free.** OpenRouter `:free` biasanya ±20 request/menit &
  200/hari; Groq free tier ±30 req/menit & 1.000/hari. Kalau brief kompleks dan
  ke-throttle (error 429), tunggu sebentar atau kurangi jumlah agent yang jalan.
- **Durasi request.** 10 agent jalan berurutan = bisa 30–90 detik sekali brief,
  tergantung kompleksitas & provider. Vercel **Hobby plan** default timeout
  function di 10–60 detik — kalau kena timeout, upgrade ke Pro (timeout sampai
  300 detik, sudah gua set di `maxDuration`) atau kurangi jumlah agent yang jalan
  buat task simple (edit `plan.steps` di router prompt).
- **Python jalan di browser**, bukan di server (pakai Pyodide/WASM) — jadi gratis,
  tapi load pertama agak berat (~10MB runtime, di-cache browser setelah itu).
- **API key aman** — semua panggilan ke Gemini/OpenRouter/Groq lewat API route
  server (`app/api/chat/route.ts`), key gak pernah dikirim ke browser.
- Anti-slop reviewer ngecek pattern generic (bg krem+terracotta, kartu rounded
  seragam, eyebrow ALL CAPS, dst) dan minta UI agent revisi max 2x per request.

## Struktur

```
app/
  page.tsx          -> UI chat + workbench (timeline, kode, preview)
  api/chat/route.ts -> orchestrator, streaming SSE
  api/fetch-url/    -> proxy scrape server-side (hindari CORS)
lib/
  agents.ts         -> definisi 10 agent (role, provider, model, system prompt)
  providers/        -> pemanggil API Gemini / OpenRouter / Groq
  extract.ts        -> helper parse code block & JSON dari respons LLM
components/
  AgentTimeline, CodeViewer, PreviewFrame, PythonRunner, ZipDownload
```

## Yang masih bisa dikembangin

- Simpan history project (sekarang tiap kirim brief baru = mulai dari nol).
- Tambah agent baru: tinggal tambah entry di `AGENTS` (lib/agents.ts) dan
  masukkan id-nya ke urutan langkah di `app/api/chat/route.ts`.
- Multi-file output (sekarang di-assemble jadi 1 index.html) — kalau butuh
  React/Next project sebagai output, ganti prompt Assembler.
