#!/bin/bash
# Gera assets/voice/<id>.wav com Kokoro local (pm_alex, pt-br), acelerando se não couber na janela.
cd "$(dirname "$0")/.." && export DO_NOT_TRACK=1
H="node /home/user/sitesnofarol/.claude/skills/hyperframes/scripts/plugin-cli.mjs"
node -e 'for (const [id,t,max,txt] of require("./tools/narracao.json")) console.log([id,max,txt].join("\t"))' |
while IFS=$'\t' read -r id max txt; do
  for sp in 1.05 1.15 1.25 1.35; do
    d=$($H tts "$txt" -v pm_alex -l pt-br -s $sp -o assets/voice/$id.wav --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s.slice(s.indexOf("{"))).durationSeconds))')
    if awk "BEGIN{exit !($d <= $max)}"; then break; fi
  done
  echo "$id speed=$sp dur=$d max=$max"
done
