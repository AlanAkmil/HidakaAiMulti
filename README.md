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

## Model yang dipakai (dicek live 15 Sep 2026, semua FREE dalam rate limit)

| Agent | Provider | Model | Kenapa |
|---|---|---|---|
| Router | Groq | `openai/gpt-oss-20b` | Cepat, buat JSON planning ringan |
| Architect | OpenRouter | `nvidia/nemotron-3-ultra-550b-a55b:free` | Didesain buat agent orchestration & reasoning, 1M context |
| UI/UX Designer | Gemini | `gemini-2.5-flash` | Satu-satunya lini Gemini yang masih gratis (Pro sudah paid-only), tetap kuat visual judgment |
| Anti-Slop Reviewer | Gemini | `gemini-2.5-flash` | Sama, buat evaluasi desain |
| CSS Specialist | OpenRouter | `poolside/laguna-s-2.1:free` | Coding agent, 70.2% Terminal-Bench 2.1 |
| JS Specialist | Groq | `openai/gpt-oss-120b` | Diklaim setara o3-mini buat code gen |
| Scraper Agent | Groq | `groq/compound` | Built-in tool web search + visit website + code execution |
| Bug Checker/QA | OpenRouter | `nex-agi/nex-n2.5-pro:free` | Didesain buat loop diagnose → revise → test |
| Security Reviewer | OpenRouter | `cohere/north-mini-code:free` | Coding agentic, latency rendah |
| Assembler | Groq | `openai/gpt-oss-120b` | Reliable gabungin jadi HTML final |

## Hal penting yang perlu lu tau

- **Model ID gampang berubah** — provider sering rilis/deprecate model tiap
  beberapa bulan. Contoh yang udah kejadian: `llama-3.3-70b-versatile` di Groq
  pindah ke tier Enterprise (bayar), dan `gemini-2.5-pro`/semua varian "Pro" di
  Gemini jadi paid-only sejak April 2026 — makanya di atas dipakai `gpt-oss` dan
  `gemini-2.5-flash`. Kalau ada error "model not found" atau tiba-tiba kena
  charge, cek ulang lalu ganti string model-nya di `lib/agents.ts`:
  - Groq: [console.groq.com/docs/models](https://console.groq.com/docs/models)
  - OpenRouter free models: [openrouter.ai/collections/free-models](https://openrouter.ai/collections/free-models)
  - Gemini: [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing) (cek kolom "Free tier")
- **Rate limit model free itu nyata.** Groq ±30 request/menit, OpenRouter
  model `:free` ±20 request/menit, Gemini Flash ±10 RPM/500 RPD. Kalau Studio
  dipakai bolak-balik cepat, bisa kena error 429 (too many requests) — itu
  limit provider, bukan bug.
- **Durasi request.** 10 agent jalan berurutan = bisa 30–90 detik sekali brief,
  tergantung kompleksitas & provider. Vercel **Hobby plan** default timeout
  function di 10–60 detik — kalau kena timeout, upgrade ke Pro (timeout sampai
  300 detik, sudah gua set di `maxDuration`) atau kurangi jumlah agent yang jalan
  buat task simple (edit `plan.steps` di router prompt).
- **Python jalan di browser**, bukan di server (pakai Pyodide/WASM) — jadi gratis,
  tapi load pertama agak berat (~10MB runtime, di-cache browser setelah itu).
- **API key aman** — semua panggilan ke Gemini/OpenRouter/Groq lewat API route
  server (`app/api/chat/route.ts`), key gak pernah dikirim ke browser.
- **Scraper agent (`groq/compound`)** punya tool bawaan visit-website & code
  execution, jadi kadang responsnya sudah termasuk hasil kunjungan situs itu
  sendiri — endpoint `/api/fetch-url` yang manual masih kepake sebagai fallback
  kalau task-nya butuh proxy fetch biasa.
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
