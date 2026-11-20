// Narração com ElevenLabs (chave injetada pelo proxy do ambiente: nada de segredo aqui).
// Uso: node tools/tts_eleven.mjs [voice_id] [n01,n02,...]
import { readFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const VOICE = process.argv[2] || "TX3LPaxmHKxFdv7VOQHJ"; // Liam
const only = process.argv[3] ? process.argv[3].split(",") : null;
const lines = JSON.parse(readFileSync("tools/narracao.json", "utf8"));
mkdirSync("assets/voice", { recursive: true });
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
let chars = 0;
lines.forEach(([id, start, max, text], i) => {
  if (only && !only.includes(id)) return;
  for (const speed of [1.0, 1.1]) {
    const body = {
      text, model_id: "eleven_multilingual_v2", language_code: "pt",
      previous_text: lines[i - 1]?.[3], next_text: lines[i + 1]?.[3],
      voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true, speed },
    };
    const code = execFileSync("curl", ["-sS", "-m", "90", "-X", "POST",
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
      "-H", "xi-api-key: proxy-injected", "-H", "Content-Type: application/json", "-d", "@-",
      "-o", `assets/voice/${id}.mp3`, "-w", "%{http_code}"], { input: JSON.stringify(body) }).toString();
    chars += text.length;
    if (code !== "200") { console.log(id, "ERRO", code, readFileSync(`assets/voice/${id}.mp3`, "utf8").slice(0, 160)); return; }
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `assets/voice/${id}.mp3`, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", `assets/voice/${id}.wav`]);
    const d = dur(`assets/voice/${id}.wav`);
    console.log(id, `speed=${speed}`, `dur=${d.toFixed(2)}`, `max=${max}`, d <= max ? "ok" : "LONGO");
    if (d <= max) break;
  }
});
console.log("caracteres gastos ~", chars);
