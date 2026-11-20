// Gera index.html + compositions/*.html do filme "O centavo que dobrava".
// Rode: node tools/gen.mjs   (a partir da pasta do projeto)
import { writeFileSync, mkdirSync } from "node:fs";

const W = 1080, H = 1920;
const INK = "#1E1A2B";
const C = {
  ink: INK, paper: "#FFF8EC", money: "#22B26B", moneyDark: "#178A50", gold: "#F2B705",
  skin: "#FFD0A6", leoShirt: "#FF6B35", leoHair: "#5A3A22", shorts: "#2C3E8C",
  biaDress: "#3D7EFF", biaHair: "#2B1B12", vovoShirt: "#8C6A4F", vovoPants: "#6B6F7E",
  hook: "#FFD447", room: "#8FD8CF", floor: "#E8A15C", bedroom: "#9ED8FF", red: "#E63946",
};

// ---------- helpers ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; // gerador, não runtime
const r2 = (n) => Math.round(n * 100) / 100;
function brl(day) {
  const cents = 2 ** (day - 1);
  const reais = Math.floor(cents / 100), c = String(cents % 100).padStart(2, "0");
  return "R$ " + reais.toLocaleString("pt-BR") + "," + c;
}
const words = (t) => t.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");

// ---------- personagens (SVG) ----------
const MOUTHS = {
  smile: `<path d="M168 246 Q200 278 232 246" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`,
  grin: `<path d="M162 238 Q200 300 238 238 Z" fill="#7A1F2B" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M172 244 Q200 252 228 244" fill="none" stroke="#fff" stroke-width="7"/>`,
  open: `<ellipse cx="200" cy="256" rx="20" ry="24" fill="#7A1F2B" stroke="${INK}" stroke-width="8"/>`,
  sad: `<path d="M170 266 Q200 240 230 266" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`,
  worried: `<path d="M168 260 q8 -9 16 0 t16 0 t16 0 t16 0" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
  o: `<ellipse cx="200" cy="258" rx="13" ry="17" fill="#7A1F2B" stroke="${INK}" stroke-width="7"/>`,
  smug: `<path d="M172 252 Q205 270 234 240" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`,
};

function arm(id, sx, sy, ex, ey, sleeve, extra = "") {
  return `<g id="${id}">
    <line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${INK}" stroke-width="46" stroke-linecap="round"/>
    <line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${C.skin}" stroke-width="30" stroke-linecap="round"/>
    <line x1="${sx}" y1="${sy}" x2="${(sx * 0.55 + ex * 0.45)}" y2="${(sy * 0.55 + ey * 0.45)}" stroke="${sleeve}" stroke-width="40" stroke-linecap="round"/>
    <circle cx="${ex}" cy="${ey + 8}" r="21" fill="${C.skin}" stroke="${INK}" stroke-width="8"/>
    ${extra}
  </g>`;
}

const coinSVG = (cx, cy, r = 30, id = "", counter = 0) => `<g ${id ? `id="${id}"` : ""} ${counter ? `transform="rotate(${counter} ${cx} ${cy})"` : ""}>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.gold}" stroke="${INK}" stroke-width="7"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="none" stroke="#C98F00" stroke-width="4"/>
  <text x="${cx}" y="${cy + r * 0.36}" font-family="Archivo Black" font-size="${r}" text-anchor="middle" fill="#8A5A00">1</text>
</g>`;

/** kind: leo | vovo | bia. opts: mouth, armL, armR (graus), holdR (svg extra na mão direita), holdL */
function character(p, kind, o = {}) {
  const mouth = o.mouth || "smile";
  const shirt = kind === "leo" ? C.leoShirt : kind === "bia" ? C.biaDress : C.vovoShirt;
  const legs = kind === "vovo" ? C.vovoPants : kind === "bia" ? C.skin : C.shorts;
  let hair = "";
  if (kind === "leo")
    hair = `<path d="M92 165 Q104 62 200 58 Q300 60 308 160 Q280 118 246 126 Q252 96 214 104 Q198 80 168 108 Q136 98 128 134 Q106 134 92 165 Z" fill="${C.leoHair}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  if (kind === "bia")
    hair = `<circle cx="70" cy="150" r="42" fill="${C.biaHair}" stroke="${INK}" stroke-width="8"/>
      <circle cx="330" cy="150" r="42" fill="${C.biaHair}" stroke="${INK}" stroke-width="8"/>
      <circle cx="98" cy="160" r="12" fill="${C.red}" stroke="${INK}" stroke-width="5"/>
      <circle cx="302" cy="160" r="12" fill="${C.red}" stroke="${INK}" stroke-width="5"/>
      <path d="M88 170 Q96 60 200 56 Q306 60 312 170 Q290 120 200 118 Q118 118 88 170 Z" fill="${C.biaHair}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  if (kind === "vovo")
    hair = `<path d="M86 210 Q80 150 108 138 Q112 180 104 214 Z" fill="#E9E9EE" stroke="${INK}" stroke-width="7"/>
      <path d="M314 210 Q320 150 292 138 Q288 180 296 214 Z" fill="#E9E9EE" stroke="${INK}" stroke-width="7"/>`;
  const glasses = kind === "vovo"
    ? `<g fill="none" stroke="${INK}" stroke-width="6"><circle cx="160" cy="192" r="34"/><circle cx="240" cy="192" r="34"/><line x1="194" y1="190" x2="206" y2="190"/></g>` : "";
  const stache = kind === "vovo"
    ? `<path d="M150 236 Q175 214 200 232 Q225 214 250 236 Q240 254 200 244 Q160 254 150 236 Z" fill="#F4F4F7" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>` : "";
  const dress = kind === "bia"
    ? `<path d="M140 320 Q200 296 260 320 L292 492 Q200 516 108 492 Z" fill="${shirt}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`
    : `<path d="M140 320 Q200 292 260 320 L270 452 Q200 470 130 452 Z" fill="${shirt}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
       <path d="M150 440 H250 V500 H208 V478 H192 V500 H150 Z" fill="${legs === C.skin ? C.shorts : legs}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  const cardigan = kind === "vovo"
    ? `<line x1="200" y1="312" x2="200" y2="456" stroke="${INK}" stroke-width="5"/><circle cx="212" cy="360" r="5" fill="${INK}"/><circle cx="212" cy="400" r="5" fill="${INK}"/>` : "";
  const legCol = kind === "bia" ? C.skin : kind === "vovo" ? C.vovoPants : C.skin;
  const armR = arm(`${p}-armR`, 252, 338, 298, 448, shirt, o.holdR || "");
  const armL = arm(`${p}-armL`, 148, 338, 102, 448, shirt, o.holdL || "");
  const m = Object.entries(MOUTHS).map(([k, v]) =>
    `<g id="${p}-m-${k}" opacity="${k === mouth ? 1 : 0}">${v}</g>`).join("");
  const fx = o.boil === false ? "" : `filter="url(#${p}-boil)"`;
  return `<svg viewBox="0 0 400 640" width="100%" height="100%" overflow="visible" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="${p}-boil" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence id="${p}-turb" type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1"/>
    <feDisplacementMap in="SourceGraphic" scale="5"/></filter></defs>
  <ellipse cx="200" cy="626" rx="120" ry="14" fill="rgba(30,26,43,.18)"/>
  <g id="${p}-all" ${fx}>
    <g id="${p}-legL"><rect x="160" y="470" width="32" height="130" rx="14" fill="${legCol}" stroke="${INK}" stroke-width="8"/><ellipse cx="170" cy="606" rx="32" ry="16" fill="${INK}"/></g>
    <g id="${p}-legR"><rect x="208" y="470" width="32" height="130" rx="14" fill="${legCol}" stroke="${INK}" stroke-width="8"/><ellipse cx="230" cy="606" rx="32" ry="16" fill="${INK}"/></g>
    <g id="${p}-torso">
      ${armL}
      ${dress}${cardigan}
      <g id="${p}-head">
        <circle cx="86" cy="196" r="22" fill="${C.skin}" stroke="${INK}" stroke-width="8"/>
        <circle cx="314" cy="196" r="22" fill="${C.skin}" stroke="${INK}" stroke-width="8"/>
        ${kind === "bia" ? hair : ""}
        <circle cx="200" cy="186" r="116" fill="${C.skin}" stroke="${INK}" stroke-width="8"/>
        ${kind !== "bia" ? hair : hair.split("\n").slice(-1)[0]}
        <circle cx="140" cy="232" r="16" fill="#FF8FA3" opacity=".45"/><circle cx="260" cy="232" r="16" fill="#FF8FA3" opacity=".45"/>
        <g id="${p}-eyes">
          <ellipse cx="160" cy="192" rx="24" ry="28" fill="#fff" stroke="${INK}" stroke-width="6"/>
          <ellipse cx="240" cy="192" rx="24" ry="28" fill="#fff" stroke="${INK}" stroke-width="6"/>
          <g id="${p}-pupils"><circle cx="164" cy="198" r="11" fill="${INK}"/><circle cx="244" cy="198" r="11" fill="${INK}"/>
            <circle cx="168" cy="193" r="4" fill="#fff"/><circle cx="248" cy="193" r="4" fill="#fff"/></g>
        </g>
        ${glasses}
        <g id="${p}-brows" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none">
          <path id="${p}-browL" d="M138 150 Q160 140 182 150"/><path id="${p}-browR" d="M218 150 Q240 140 262 150"/></g>
        <path d="M194 214 Q200 224 208 214" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        ${stache}
        ${m}
        <path id="${p}-sweat" opacity="0" d="M316 110 Q330 140 316 150 Q302 140 316 110 Z" fill="#7CC8FF" stroke="${INK}" stroke-width="5"/>
      </g>
      ${armR}
    </g>
  </g>
</svg>`;
}

// ---------- props ----------
const bill = (x, y, rot = 0, s = 1, id = "") => `<g ${id ? `id="${id}"` : ""} transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <rect x="-70" y="-36" width="140" height="72" rx="8" fill="${C.money}" stroke="${INK}" stroke-width="6"/>
  <rect x="-58" y="-25" width="116" height="50" rx="5" fill="none" stroke="${C.moneyDark}" stroke-width="4"/>
  <circle cx="0" cy="0" r="17" fill="#8FE0B5" stroke="${C.moneyDark}" stroke-width="4"/>
  <text x="0" y="8" font-family="Archivo Black" font-size="20" text-anchor="middle" fill="${C.moneyDark}">R$</text></g>`;

const suitcase = (id) => `<svg id="${id}" viewBox="0 0 360 300" width="100%" height="100%" overflow="visible">
  <path d="M30 40 L330 40 L310 -60 L50 -60 Z" fill="#7A4A26" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <rect x="20" y="40" width="320" height="220" rx="18" fill="#9B5E30" stroke="${INK}" stroke-width="8"/>
  ${[0, 1, 2].map((r) => [0, 1].map((c) => bill(100 + c * 160, 90 + r * 62, 0, 1)).join("")).join("")}
  <rect x="150" y="248" width="60" height="22" rx="6" fill="${C.gold}" stroke="${INK}" stroke-width="6"/></svg>`;

const piggy = (id) => `<svg id="${id}" viewBox="0 0 300 240" width="100%" height="100%" overflow="visible">
  <ellipse cx="150" cy="130" rx="120" ry="88" fill="#FF9EB5" stroke="${INK}" stroke-width="8"/>
  <path d="M90 60 L104 18 L130 52 Z" fill="#FF9EB5" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <rect x="62" y="196" width="34" height="38" rx="10" fill="#FF9EB5" stroke="${INK}" stroke-width="7"/>
  <rect x="200" y="196" width="34" height="38" rx="10" fill="#FF9EB5" stroke="${INK}" stroke-width="7"/>
  <ellipse cx="266" cy="132" rx="26" ry="32" fill="#FF7FA0" stroke="${INK}" stroke-width="7"/>
  <circle cx="260" cy="124" r="5" fill="${INK}"/><circle cx="272" cy="140" r="5" fill="${INK}"/>
  <circle cx="210" cy="100" r="9" fill="${INK}"/>
  <rect x="118" y="44" width="64" height="12" rx="6" fill="${INK}"/></svg>`;

// ---------- texto ----------
// linhas: {id,start,dur,html,size,font,top,enter:'words'|'grey'|'line'|'none',color}
function lineHTML(l) {
  const font = l.font || "Nunito";
  return `<div id="${l.id}" class="clip line"${l.hold ? ' data-hold' : ''} data-start="${l.start}" data-duration="${l.dur}" data-track-index="3"
    style="top:${l.top ?? 330}px;${(l.top ?? 330) > 700 ? 'width:660px;' : ''}font-family:'${font}';font-weight:900;font-size:${l.size || 68}px;color:${l.color || INK}">
    <div class="in">${l.html}</div></div>`;
}
function lineJS(l) {
  const s = `#${l.id} .w`, inn = `#${l.id} .in`;
  let js = "";
  if (l.enter === "words" || !l.enter)
    js += `tl.fromTo("${s}",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:.16,stagger:.07,ease:"power2.out"},${l.start});\n`;
  else if (l.enter === "grey")
    js += `tl.fromTo("${s}",{color:"#B9B4C6"},{color:"${l.color || INK}",duration:.12,stagger:.09,ease:"none"},${l.start});\n`;
  else if (l.enter === "line")
    js += `tl.fromTo("${inn}",{opacity:0,filter:"blur(10px)",scale:1.06},{opacity:1,filter:"blur(0px)",scale:1,duration:.22,ease:"power4.out"},${l.start});\n`;
  else if (l.enter === "pop")
    js += `tl.fromTo("${inn}",{scale:.6,opacity:0},{scale:1,opacity:1,duration:.45,ease:"back.out(2)"},${l.start});\n`;
  if (l.exit !== false)
    js += `tl.to("${inn}",{opacity:0,filter:"blur(8px)",duration:.18,ease:"power2.in"},${r2(l.start + l.dur - 0.2)});\n`;
  return js;
}

// ---------- rig helpers (JS emitido) ----------
const OR = { armL: "148 338", armR: "252 338", head: "200 300", torso: "200 470", all: "200 620", eyes: "200 192", legL: "176 470", legR: "224 470" };
const rot = (p, part, deg, t, d = .45, ease = "back.out(1.6)") =>
  `tl.to("#${p}-${part}",{rotation:${deg},svgOrigin:"${OR[part]}",duration:${d},ease:"${ease}"},${t});\n`;
const setRot = (p, part, deg) => `gsap.set("#${p}-${part}",{rotation:${deg},svgOrigin:"${OR[part]}"});\n`;
function mood(p, t, m) {
  return Object.keys(MOUTHS).map((k) => `tl.set("#${p}-m-${k}",{opacity:${k === m ? 1 : 0}},${t});`).join("") + "\n";
}
const blink = (p, t) => `tl.to("#${p}-eyes",{scaleY:.08,svgOrigin:"${OR.eyes}",duration:.06,yoyo:true,repeat:1,ease:"power1.inOut"},${t});\n`;
const brows = (p, t, up = -10, tilt = 0) =>
  `tl.to("#${p}-brows",{y:${up},duration:.2,ease:"power2.out"},${t});tl.to("#${p}-browL",{rotation:${tilt},svgOrigin:"160 146",duration:.2},${t});tl.to("#${p}-browR",{rotation:${-tilt},svgOrigin:"240 146",duration:.2},${t});\n`;
const look = (p, t, x, y = 0) => `tl.to("#${p}-pupils",{x:${x},y:${y},duration:.18,ease:"power2.out"},${t});\n`;
const life = (p, D) => {
  const n = Math.floor(D / 1.3);
  return `tl.fromTo("#${p}-torso",{scaleY:1},{scaleY:1.018,svgOrigin:"${OR.torso}",duration:1.3,ease:"sine.inOut",yoyo:true,repeat:${n}},0);
tl.fromTo("#${p}-turb",{attr:{seed:1}},{attr:{seed:${Math.ceil(D * 12) + 1}},duration:${D},ease:"steps(${Math.ceil(D * 12)})"},0);\n`;
};
const take = (p, t, m, squash = true) => (squash
  ? `tl.to("#${p}-all",{scaleY:.94,scaleX:1.04,svgOrigin:"${OR.all}",duration:.1,ease:"power2.in"},${t});tl.to("#${p}-all",{scaleY:1,scaleX:1,svgOrigin:"${OR.all}",duration:.35,ease:"back.out(3)"},${r2(t + .1)});\n`
  : "") + mood(p, r2(t + .08), m);

// ---------- cena ----------
function scene(id, D, { bg, body, js, extraCSS = "" }) {
  return `<template>
<style>
#root{position:absolute;inset:0;overflow:hidden;background:${bg};}
#${id}-cam{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
#root .abs{position:absolute;}
#root .line{position:absolute;left:120px;width:768px;line-height:1.08;letter-spacing:-0.01em;}
#root .line .in{display:block;}
#root .w{display:inline-block;}
#root .num{font-family:'Archivo Black';letter-spacing:-0.02em;}
#root .g{color:#13804A;}
#root .gold{color:#9A5B00;}
${extraCSS}
</style>
<div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
<div id="${id}-cam">
${body}
</div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
${js}
window.__timelines["${id}"] = tl;
</script>
</template>
`;
}

const charDiv = (id, svg, left, top, w, extra = "") =>
  `<div id="${id}" class="abs" data-layout-ignore style="left:${left}px;top:${top}px;width:${w}px;height:${w * 1.6}px;${extra}">${svg}</div>`;

const room = (p) => `
<div class="abs" data-layout-ignore style="left:0;top:1500px;width:${W}px;height:420px;background:${C.floor};border-top:8px solid ${INK}"></div>
<div class="abs" data-layout-ignore style="left:0;top:1560px;width:${W}px;height:6px;background:rgba(30,26,43,.15)"></div>
<div class="abs" data-layout-ignore style="left:0;top:1680px;width:${W}px;height:6px;background:rgba(30,26,43,.15)"></div>
<div id="${p}-window" class="abs" data-layout-ignore style="left:640px;top:820px;width:300px;height:360px;background:#D6F4FF;border:8px solid ${INK};border-radius:10px;box-shadow:inset 0 -60px 0 #B6E7B0">
  <div class="abs" style="left:142px;top:0;width:8px;height:100%;background:${INK}"></div>
  <div class="abs" style="left:0;top:170px;width:100%;height:8px;background:${INK}"></div></div>`;

// =============== S1 GANCHO (0–6) ===============
const S = [];
{
  const id = "gancho", D = 6, p = "s1leo";
  const coinR = coinSVG(300, 470, 34, "s1-coin", 128);
  const lines = [
    { id: "s1-l1", start: 0, dur: 2.45, enter: "none", top: 340,
      html: `<div style="font-size:72px">Ele recusou</div><div class="num g" style="font-size:136px;line-height:1">R$ 1 milhão</div>` },
    { id: "s1-l2", start: 2.45, dur: 3.1, enter: "words", top: 340,
      html: `<div class="num" style="font-size:118px;line-height:1">${words("…por")}</div><div class="num" style="font-size:118px;line-height:1"><span class="w gold">1</span> <span class="w gold">centavo.</span></div>` },
  ];
  let js = life(p, D);
  js += setRot(p, "armR", -128) + setRot(p, "armL", 14);
  js += blink(p, 1.2) + look(p, 0, 8, -8);
  js += `tl.fromTo("#s1-rays",{rotation:0},{rotation:18,duration:${D},ease:"none",transformOrigin:"50% 50%"},0);\n`;
  js += `tl.fromTo("#s1-coin",{scale:1,rotation:128},{scale:1.35,rotation:128,svgOrigin:"300 470",duration:.35,ease:"back.out(3)"},2.45);\n`;
  js += take(p, 2.45, "smug") + brows(p, 2.45, -12, -8) + look(p, 2.5, 14, -12);
  js += `tl.fromTo("#s1-glint",{scale:0,opacity:0},{scale:1,opacity:1,duration:.25,ease:"back.out(3)",transformOrigin:"50% 50%"},2.6);tl.to("#s1-glint",{scale:0,opacity:0,duration:.2},3.1);\n`;
  // moeda vira o mundo seguinte
  js += `tl.fromTo("#s1-coinbig",{scale:0.05,opacity:0},{scale:1,opacity:1,duration:.55,ease:"power3.in",transformOrigin:"50% 50%"},5.42);\n`;
  js += lines.map(lineJS).join("");
  const body = `
<svg id="s1-rays" class="abs" data-layout-ignore style="left:-420px;top:-60px;width:1920px;height:1920px" viewBox="-100 -100 200 200">
  ${Array.from({ length: 12 }, (_, i) => `<path d="M0 0 L${r2(140 * Math.cos((i * 30) * Math.PI / 180))} ${r2(140 * Math.sin((i * 30) * Math.PI / 180))} L${r2(140 * Math.cos((i * 30 + 13) * Math.PI / 180))} ${r2(140 * Math.sin((i * 30 + 13) * Math.PI / 180))} Z" fill="#FFC21A"/>`).join("")}
</svg>
${charDiv("s1-leo", character(p, "leo", { mouth: "grin", holdR: coinR + `<path id="s1-glint" d="M330 420 l6 18 18 6 -18 6 -6 18 -6 -18 -18 -6 18 -6z" fill="#fff" stroke="${INK}" stroke-width="4"/>` }), 150, 780, 720)}
${lines.map(lineHTML).join("")}
<div id="s1-coinbig" class="abs" data-layout-ignore style="left:-660px;top:-120px;width:2400px;height:2400px;border-radius:50%;background:${C.gold};border:30px solid ${INK};opacity:0"></div>`;
  S.push({ id, D, html: scene(id, D, { bg: C.hook, body, js }) });
}

// =============== S2 PROPOSTA (6–17) ===============
{
  const id = "proposta", D = 11, p = "s2vo";
  const coin = coinSVG(300, 470, 34, "s2-coin");
  const lines = [
    { id: "s2-l1", start: 0.7, dur: 3.2, top: 330, html: words("30 dias antes, o vovô fez uma proposta:"), size: 70 },
    { id: "s2-l2", start: 4.1, dur: 2.9, top: 330, enter: "pop",
      html: `<div class="num g" style="font-size:132px;line-height:1">R$ 1 milhão</div><div style="font-size:70px">agora…</div>` },
    { id: "s2-l3", start: 7.2, dur: 3.8, top: 330, size: 70, exit: false,
      html: `${words("…ou")} <span class="w gold">1 centavo</span> ${words("que dobra todo dia, por 30 dias.")}` },
  ];
  let js = life(p, D);
  js += setRot(p, "armR", -20) + setRot(p, "armL", 20) + `gsap.set("#s2-coin",{rotation:20,svgOrigin:"300 470"});\n`;
  js += `tl.fromTo("#s2-big",{scale:1},{scale:0.03,duration:.6,ease:"power3.out",transformOrigin:"50% 50%"},0);tl.to("#s2-big",{opacity:0,duration:.1},0.55);\n`;
  js += `tl.fromTo("#s2-vovo",{x:40},{x:0,duration:.8,ease:"expo.out"},0);\n`;
  js += blink(p, 1.6) + look(p, 0.8, -6, 4);
  // maleta sobe
  js += rot(p, "armL", 40, 3.8, .5) + `tl.fromTo("#s2-case",{y:260,rotation:-8,opacity:0},{y:0,rotation:0,opacity:1,duration:.6,ease:"back.out(1.6)"},3.85);\n`;
  js += take(p, 4.0, "grin") + brows(p, 4.0, -10);
  // moeda: braço direito sobe
  js += `tl.to("#s2-case",{y:40,rotation:6,duration:.4,ease:"power2.inOut"},7.0);\n`;
  js += rot(p, "armR", -140, 7.0, .55) + take(p, 7.1, "smug") + look(p, 7.2, 14, -12) + brows(p, 7.2, -6, -8);
  js += `tl.to("#s2-coin",{rotation:140,svgOrigin:"300 470",duration:.55,ease:"back.out(1.6)"},7.0);tl.fromTo("#s2-coin",{scale:1},{scale:1.4,svgOrigin:"300 470",duration:.35,ease:"back.out(3)"},7.45);\n`;
  js += blink(p, 9.4);
  js += lines.map(lineJS).join("");
  const body = `${room("s2")}
<div class="abs" data-layout-ignore style="left:110px;top:900px;width:200px;height:240px;background:#FFE7A8;border:8px solid ${INK};border-radius:6px"><div class="abs" style="left:30px;top:30px;width:124px;height:164px;background:${C.money};opacity:.6;border-radius:50%"></div></div>
${charDiv("s2-vovo", character(p, "vovo", { mouth: "smile", holdR: coin }), 240, 760, 700)}
<div id="s2-case" class="abs" data-layout-ignore style="left:40px;top:1300px;width:400px;height:330px">${suitcase("s2-casesvg")}</div>
${lines.map(lineHTML).join("")}
<div id="s2-big" class="abs" data-layout-ignore style="left:-660px;top:-120px;width:2400px;height:2400px;border-radius:50%;background:${C.gold};border:30px solid ${INK}"></div>`;
  S.push({ id, D, html: scene(id, D, { bg: C.room, body, js }) });
}

// =============== S3 ESCOLHA (17–25) ===============
{
  const id = "escolha", D = 8, p = "s3leo", b = "s3bia";
  const lines = [
    { id: "s3-l1", start: 0.2, dur: 2.0, top: 330, html: words("O Leo pensou…"), size: 76, enter: "grey" },
    { id: "s3-l2", start: 2.3, dur: 2.2, top: 330, size: 76,
      html: `${words("e escolheu o")} <span class="w gold">centavo.</span>` },
    { id: "s3-l3", start: 4.6, dur: 3.4, top: 330, size: 70, exit: false,
      html: `${words("A irmã riu:")}<br><span class="w">“Você</span> <span class="w">é</span> <span class="w">louco!”</span>` },
  ];
  let js = life(p, D) + life(b, D);
  js += setRot(p, "armR", 10) + setRot(p, "armL", -10);
  // caminhada
  js += `tl.fromTo("#s3-leo",{x:-620},{x:0,duration:1.4,ease:"power2.out"},0);\n`;
  js += `tl.fromTo("#s3-leo .bob",{y:0},{y:-18,duration:.175,yoyo:true,repeat:7,ease:"sine.inOut"},0);\n`;
  js += `tl.fromTo("#${p}-legL",{rotation:-18},{rotation:18,svgOrigin:"${OR.legL}",duration:.35,yoyo:true,repeat:3,ease:"sine.inOut"},0);`;
  js += `tl.fromTo("#${p}-legR",{rotation:18},{rotation:-18,svgOrigin:"${OR.legR}",duration:.35,yoyo:true,repeat:3,ease:"sine.inOut"},0);\n`;
  js += `tl.to(["#${p}-legL","#${p}-legR"],{rotation:0,svgOrigin:"200 470",duration:.15},1.4);\n`;
  // pensa: mão no queixo
  js += rot(p, "armR", -118, 1.0, .4) + take(p, 1.2, "worried", false) + look(p, 1.2, 10, -14) + brows(p, 1.2, -8, 10);
  js += blink(p, 1.9);
  // aponta para a moeda (da mão do vovô à direita)
  js += rot(p, "armR", -62, 2.3, .3, "back.out(2.5)") + take(p, 2.3, "grin") + look(p, 2.35, 16, -6) + brows(p, 2.3, -12, 0);
  js += `tl.fromTo("#s3-hand",{x:300},{x:0,duration:.5,ease:"expo.out"},2.0);\n`;
  // Bia entra rindo
  js += `tl.fromTo("#s3-bia",{y:700},{y:0,duration:.55,ease:"back.out(1.4)"},4.5);\n`;
  js += setRot(b, "armR", -30) + setRot(b, "armL", 30) + mood(b, 0, "grin");
  js += `tl.fromTo("#${b}-all",{rotation:-3},{rotation:3,svgOrigin:"200 620",duration:.16,yoyo:true,repeat:16,ease:"sine.inOut"},4.9);\n`;
  js += rot(b, "armL", 140, 4.9, .3) + rot(b, "armR", -150, 4.95, .3);
  js += `tl.fromTo("#s3-ha span",{y:40,opacity:0,scale:.4},{y:0,opacity:1,scale:1,duration:.3,stagger:.12,ease:"back.out(3)"},5.0);\n`;
  js += rot(p, "armR", 12, 4.6, .35, "power2.inOut") + take(p, 5.2, "sad") + brows(p, 5.2, 0, 10) + look(p, 5.25, -14, 6);
  js += lines.map(lineJS).join("");
  const body = `${room("s3")}
<div id="s3-hand" class="abs" data-layout-ignore style="left:820px;top:880px;width:300px;height:200px">
  <svg viewBox="0 0 300 200" width="100%" height="100%" overflow="visible">
  <rect x="80" y="60" width="260" height="80" rx="30" fill="${C.vovoShirt}" stroke="${INK}" stroke-width="8"/>
  <circle cx="70" cy="100" r="40" fill="${C.skin}" stroke="${INK}" stroke-width="8"/>${coinSVG(40, 60, 36)}</svg></div>
${charDiv("s3-leo", `<div class="bob" style="width:100%;height:100%">${character(p, "leo", { mouth: "smile" })}</div>`, 110, 800, 640)}
<div id="s3-bia" class="abs" data-layout-ignore style="left:640px;top:1200px;width:420px;height:672px">${character(b, "bia", { mouth: "grin" })}</div>
<div id="s3-ha" class="abs num" data-layout-ignore style="left:640px;top:1100px;font-size:72px;color:${C.red};-webkit-text-stroke:3px ${INK}"><span style="display:inline-block">HA</span><span style="display:inline-block">HA</span><span style="display:inline-block">HA</span></div>
${lines.map(lineHTML).join("")}`;
  S.push({ id, D, html: scene(id, D, { bg: C.room, body, js }) });
}

// =============== contador de dias (S4 e S5) ===============
function counter(prefix, ticks, D) {
  // ticks: [[t, day], ...]; cada dia = um clip com seu número
  let html = "", js = "";
  ticks.forEach(([t, d], i) => {
    const end = i + 1 < ticks.length ? ticks[i + 1][0] : D;
    const dur = r2(end - t);
    html += `<div id="${prefix}-d${d}" class="clip abs cal-day" data-start="${t}" data-duration="${dur}" data-track-index="2"><div class="in">${d}</div></div>`;
    html += `<div id="${prefix}-v${d}" class="clip abs cal-val" data-start="${t}" data-duration="${dur}" data-track-index="2"><div class="in num g">${brl(d)}</div></div>`;
    js += `tl.fromTo("#${prefix}-d${d} .in",{y:-30,opacity:.2},{y:0,opacity:1,duration:.12,ease:"power3.out"},${t});`;
    js += `tl.fromTo("#${prefix}-v${d} .in",{scale:1.12},{scale:1,duration:.18,ease:"power3.out"},${t});`;
    js += `tl.fromTo("#${prefix}-flip",{scaleY:1,opacity:1},{scaleY:0,opacity:.4,duration:.14,ease:"power2.in",transformOrigin:"50% 0%"},${t});\n`;
  });
  return { html, js };
}
const calendar = (prefix, top = 300) => `
<div class="abs" style="left:150px;top:${top}px;width:420px;height:300px;background:${C.paper};border:8px solid ${INK};border-radius:18px;overflow:hidden" data-layout-ignore>
  <div class="abs" style="left:0;top:0;width:100%;height:78px;background:${C.red};border-bottom:8px solid ${INK}"></div>
  <div class="abs num" style="left:0;top:8px;width:100%;text-align:center;font-size:46px;color:#fff">DIA</div>
  <div id="${prefix}-flip" class="abs" style="left:0;top:86px;width:100%;height:214px;background:#F1E6D2"></div>
</div>
<div class="abs" data-layout-ignore style="left:220px;top:${top - 22}px;width:24px;height:52px;border-radius:12px;background:#C9C3D6;border:6px solid ${INK}"></div>
<div class="abs" data-layout-ignore style="left:476px;top:${top - 22}px;width:24px;height:52px;border-radius:12px;background:#C9C3D6;border:6px solid ${INK}"></div>`;
const calCSS = (top = 300) => `
#root .cal-day{left:150px;top:${top + 92}px;width:420px;text-align:center;font-family:'Archivo Black';font-size:170px;line-height:1;color:${INK};}
#root .cal-val{left:120px;top:${top + 330}px;width:768px;font-size:64px;line-height:1;white-space:nowrap;}
#root .cal-val .in{display:inline-block;background:${C.paper};border:8px solid ${INK};border-radius:22px;padding:14px 26px 18px;transform-origin:0 50%;}`;

// =============== S4 DIAS 1–25 (25–41) ===============
{
  const id = "dias", D = 16, p = "s4leo";
  const ticks = [[0, 1], [0.9, 2], [1.6, 3], [2.15, 4], [2.6, 5], [2.95, 6], [3.25, 7], [3.5, 8], [3.75, 9], [4.0, 10],
    [7.4, 11], [7.6, 12], [7.8, 13], [8.0, 14], [8.2, 15], [8.4, 16], [8.6, 17], [8.8, 18], [9.0, 19], [9.25, 20],
    [12.0, 21], [12.25, 22], [12.5, 23], [12.75, 24], [13.0, 25]];
  const cnt = counter("s4", ticks, D);
  const lines = [
    { id: "s4-l1", start: 4.4, dur: 2.9, top: 800, size: 64, html: words("Dava pra um pastel.") },
    { id: "s4-l2", start: 9.6, dur: 2.3, top: 800, size: 64, html: words("Longe do milhão.") },
    { id: "s4-l3", start: 13.3, dur: 2.7, top: 800, size: 64, exit: false, html: words("Faltando 5 dias… nem 20%.") },
  ];
  let js = life(p, D) + cnt.js;
  js += setRot(p, "armR", 30) + setRot(p, "armL", -30);
  js += `tl.fromTo("#s4-pig",{scale:.7},{scale:.7,duration:.01},0);tl.to("#s4-pig",{scale:.85,duration:.3,ease:"back.out(2)",transformOrigin:"50% 100%"},4.0);tl.to("#s4-pig",{scale:1.05,duration:.3,ease:"back.out(2)",transformOrigin:"50% 100%"},9.25);tl.to("#s4-pig",{scale:1.25,duration:.3,ease:"back.out(2)",transformOrigin:"50% 100%"},13.0);\n`;
  js += look(p, 0, -10, -14) + blink(p, 1.8);
  js += take(p, 4.3, "sad") + brows(p, 4.3, 0, 12) + rot(p, "armR", 6, 4.3, .5) + rot(p, "armL", -6, 4.3, .5) + look(p, 4.4, 0, 8);
  js += blink(p, 6.2);
  js += take(p, 9.4, "worried") + `tl.to("#${p}-sweat",{opacity:1,y:30,duration:.6,ease:"power1.in"},9.5);tl.set("#${p}-sweat",{opacity:0,y:0},10.3);\n`;
  js += rot(p, "armR", 20, 9.4, .4) + rot(p, "armL", -20, 9.4, .4) + look(p, 9.5, -10, -14);
  js += take(p, 13.2, "o") + brows(p, 13.2, -14, 0) + rot(p, "armR", -118, 13.2, .35) + rot(p, "armL", 118, 13.2, .35);
  js += `tl.to("#${p}-sweat",{opacity:1,y:30,duration:.6,ease:"power1.in"},13.4);\n`;
  js += lines.map(lineJS).join("");
  const body = `
<div class="abs" data-layout-ignore style="left:0;top:1560px;width:${W}px;height:360px;background:#5E8FD6;border-top:8px solid ${INK}"></div>
${calendar("s4")}
${cnt.html}
${charDiv("s4-leo", character(p, "leo", { mouth: "smile" }), 130, 1010, 560)}
<div id="s4-pig" class="abs" data-layout-ignore style="left:640px;top:1360px;width:300px;height:240px">${piggy("s4-pigsvg")}</div>
${lines.map(lineHTML).join("")}`;
  S.push({ id, D, html: scene(id, D, { bg: C.bedroom, body, js, extraCSS: calCSS() }) });
}

// =============== S5 VIRADA (41–55) ===============
{
  const id = "virada", D = 14, p = "s5leo", b = "s5bia";
  const ticks = [[0, 26], [1.6, 27], [3.0, 28], [6.3, 29], [8.6, 30]];
  const cnt = counter("s5", ticks, D);
  const lines = [
    { id: "s5-l1", start: 0.3, dur: 1.3, top: 800, size: 72, html: words("Mas aí…"), enter: "grey" },
    { id: "s5-l2", start: 3.3, dur: 3.0, top: 800, size: 72, html: words("Passou do milhão.") },
    { id: "s5-l3", start: 9.0, dur: 5.0, top: 800, size: 84, exit: false, enter: "pop", hold: true,
      html: `<span class="num" style="color:#fff;-webkit-text-stroke:4px ${INK}">5 MILHÕES.</span>` },
  ];
  // chuva de dinheiro: 3 ondas
  let rain = "", rjs = "";
  const waves = [[1.6, 6, 3.2], [3.0, 14, 2.6], [6.3, 18, 2.2], [8.6, 26, 1.8], [10.6, 16, 2.4], [12.2, 12, 2.0]];
  let k = 0;
  for (const [t0, n, fall] of waves) {
    for (let i = 0; i < n; i++, k++) {
      const x = Math.round(rnd() * 1000) + 40, dl = r2(t0 + rnd() * 1.6), r0 = Math.round(rnd() * 80 - 40), r1 = Math.round(rnd() * 360 - 180);
      rain += `<div id="s5-b${k}" class="abs" data-layout-ignore style="left:${x - 80}px;top:-200px;width:160px;height:90px"><svg viewBox="-80 -45 160 90" width="100%" height="100%" overflow="visible">${bill(0, 0)}</svg></div>`;
      rjs += `tl.fromTo("#s5-b${k}",{y:0,rotation:${r0}},{y:2300,rotation:${r1},duration:${fall},ease:"power1.in"},${dl});`;
    }
  }
  let js = life(p, D) + life(b, D) + cnt.js + rjs + "\n";
  js += setRot(p, "armR", 20) + setRot(p, "armL", -20) + setRot(b, "armR", 15) + setRot(b, "armL", -15);
  js += take(p, 0.2, "worried", false) + look(p, 0.3, -10, -14);
  js += take(p, 1.7, "o") + brows(p, 1.7, -14);
  // inundação verde no dia 28
  js += `tl.fromTo("#s5-flood",{scale:0},{scale:1,duration:.5,ease:"power2.inOut",transformOrigin:"50% 50%"},3.0);\n`;
  js += take(p, 3.1, "grin") + rot(p, "armR", -118, 3.1, .35) + rot(p, "armL", 118, 3.15, .35);
  js += `tl.fromTo("#s5-bia",{x:-500},{x:0,duration:.5,ease:"expo.out"},3.4);\n` + take(b, 3.6, "o") + brows(b, 3.6, -16);
  js += `tl.fromTo("#${b}-m-o",{scaleY:1},{scaleY:1.6,svgOrigin:"200 258",duration:.3,ease:"back.out(3)"},3.8);\n`;
  // monte de dinheiro sobe e leva o Leo
  js += `tl.fromTo("#s5-pile",{y:500},{y:250,duration:.6,ease:"back.out(1.4)"},6.3);tl.to("#s5-pile",{y:0,duration:.7,ease:"back.out(1.6)"},8.6);\n`;
  js += `tl.to("#s5-leo",{y:-50,duration:.6,ease:"back.out(1.4)"},6.3);tl.to("#s5-leo",{y:-110,duration:.7,ease:"back.out(1.6)"},8.6);\n`;
  js += `tl.to("#s5-bia",{x:-80,y:60,duration:.5,ease:"power2.out"},8.6);\n`;
  js += take(p, 8.65, "grin") + look(p, 8.7, 0, -4) + blink(p, 11.5) + blink(b, 10.2);
  js += `tl.to("#s5-leo",{y:-170,duration:.22,ease:"power2.out",yoyo:true,repeat:1},11.0);tl.to("#s5-leo",{y:-170,duration:.22,ease:"power2.out",yoyo:true,repeat:1},12.4);\n` + blink(p, 13.2);
  js += `tl.fromTo("#virada-cam",{scale:1.06},{scale:1,duration:.5,ease:"expo.out",transformOrigin:"50% 40%"},8.6);\n`;
  js += lines.map(lineJS).join("");
  const pile = Array.from({ length: 34 }, (_, i) => {
    const row = Math.floor(i / 7), col = i % 7;
    return bill(90 + col * 150 + (row % 2) * 70, 120 + row * 70 - Math.abs(3 - col) * 26 * (row < 2 ? 1 : 0), Math.round(rnd() * 30 - 15), 1.15);
  }).join("");
  const body = `
<div class="abs" data-layout-ignore style="left:0;top:1560px;width:${W}px;height:360px;background:#5E8FD6;border-top:8px solid ${INK}"></div>
<div id="s5-flood" class="abs" data-layout-ignore style="left:-930px;top:-500px;width:2940px;height:2940px;border-radius:50%;background:${C.money}"></div>
${rain}
${calendar("s5")}
${cnt.html}
<div id="s5-pile" class="abs" data-layout-ignore style="left:0;top:1340px;width:${W}px;height:600px"><svg viewBox="0 0 1080 600" width="100%" height="100%" overflow="visible"><path d="M-40 600 Q120 140 540 90 Q960 140 1120 600 Z" fill="${C.moneyDark}" stroke="${INK}" stroke-width="8"/>${pile}</svg></div>
${charDiv("s5-leo", character(p, "leo", { mouth: "smile" }), 270, 1100, 520)}
<div id="s5-bia" class="abs" data-layout-ignore style="left:660px;top:1330px;width:340px;height:544px">${character(b, "bia", { mouth: "smile" })}</div>
${lines.map(lineHTML).join("")}`;
  S.push({ id, D, html: scene(id, D, { bg: C.bedroom, body, js, extraCSS: calCSS() }) });
}

// =============== S6 FINAL (55–66) ===============
{
  const id = "final", D = 11, p = "s6leo";
  const coin = coinSVG(300, 470, 34, "s6-coin", 128);
  const lines = [
    { id: "s6-l1", start: 0.4, dur: 2.9, top: 330, size: 74, html: `${words("O centavo nunca foi")} <span class="w gold">pequeno.</span>` },
    { id: "s6-l2", start: 3.4, dur: 3.0, top: 330, size: 74, html: words("Ele só precisava de tempo.") },
    { id: "s6-l3", start: 6.6, dur: 4.4, top: 330, size: 80, exit: false, enter: "line",
      html: `<div><span class="g num">Milhão</span> ou <span class="gold num">centavo?</span></div><div style="font-size:60px;margin-top:20px">Comenta aí qual você escolheria.</div>` },
  ];
  let js = life(p, D);
  js += setRot(p, "armR", -128) + setRot(p, "armL", 14);
  js += `tl.fromTo("#s6-rays",{rotation:0},{rotation:20,duration:${D},ease:"none",transformOrigin:"50% 50%"},0);\n`;
  js += `tl.fromTo("#s6-leo",{scale:.85,y:80},{scale:1,y:0,duration:.6,ease:"back.out(1.6)",transformOrigin:"50% 100%"},0);\n`;
  js += look(p, 0.3, 12, -12) + blink(p, 2.4) + take(p, 3.4, "smile") + look(p, 3.5, 0, 0);
  js += `tl.fromTo("#s6-coin",{scale:1,rotation:128},{scale:1.35,rotation:128,svgOrigin:"300 470",duration:.35,ease:"back.out(3)"},0.5);\n`;
  js += take(p, 6.6, "smug") + brows(p, 6.6, -12, -8) + look(p, 6.7, -6, 2) + blink(p, 8.8);
  js += lines.map(lineJS).join("");
  const body = `
<svg id="s6-rays" class="abs" data-layout-ignore style="left:-420px;top:-60px;width:1920px;height:1920px" viewBox="-100 -100 200 200">
  ${Array.from({ length: 12 }, (_, i) => `<path d="M0 0 L${r2(140 * Math.cos((i * 30) * Math.PI / 180))} ${r2(140 * Math.sin((i * 30) * Math.PI / 180))} L${r2(140 * Math.cos((i * 30 + 13) * Math.PI / 180))} ${r2(140 * Math.sin((i * 30 + 13) * Math.PI / 180))} Z" fill="#FFC21A"/>`).join("")}
</svg>
${charDiv("s6-leo", character(p, "leo", { mouth: "grin", holdR: coin }), 150, 820, 700)}
${lines.map(lineHTML).join("")}`;
  S.push({ id, D, html: scene(id, D, { bg: C.hook, body, js }) });
}

// ---------- escreve ----------
mkdirSync("compositions", { recursive: true });
let t = 0, hosts = "";
for (const s of S) {
  writeFileSync(`compositions/${s.id}.html`, s.html);
  hosts += `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html"
        data-start="${t}" data-duration="${s.D}" data-track-index="1" data-track-kind="graphics"
        data-width="${W}" data-height="${H}"></div>\n`;
  t += s.D;
}
// ---------- áudio: narração (Kokoro local) + efeitos (biblioteca Pixabay da HyperFrames) ----------
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const dur = (f) => r2(Math.floor(parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString()) * 100) / 100);
const narr = JSON.parse(readFileSync("tools/narracao.json", "utf8"));
// [arquivo, momento visual (s), pico do arquivo (s), volume]; início = visual + 1 quadro - pico
const PEAK = { pop: .12, sparkle: .027, whoosh: .162, riser: 3.472, "impact-bass-1": .073, "click-soft": .073, chime: .418 };
const VOL = { pop: 1.15, sparkle: .28, whoosh: .5, riser: .17, "impact-bass-1": .27, "click-soft": 1.1, chime: 2.0 };
const fx = [
  ["pop", 2.45], ["sparkle", 2.6], ["whoosh", 5.95],
  ["pop", 10.0], ["sparkle", 13.5], ["pop", 19.3], ["pop", 22.0], ["pop", 22.12, .8], ["pop", 22.24, .95],
  ...[0, .9, 1.6, 2.15, 2.6, 2.95, 3.25, 3.5, 3.75, 4.0, 7.4, 7.6, 7.8, 8.0, 8.2, 8.4, 8.6, 8.8, 9.0, 9.25, 12, 12.25, 12.5, 12.75, 13]
    .map((t, i) => ["click-soft", 25 + t, i % 2 ? .7 : 1.1]),
  ...[0, 1.6, 3.0, 6.3].map((t) => ["click-soft", 41 + t]),
  ["whoosh", 44.0], ["riser", 49.6], ["impact-bass-1", 49.6], ["pop", 50.0],
  ["whoosh", 55.0], ["chime", 61.6],
];
let audio = "";
narr.forEach(([id, t]) => {
  audio += `      <audio id="vo-${id}" class="clip" src="assets/voice/${id}.wav" data-start="${t}" data-duration="${dur(`assets/voice/${id}.wav`)}" data-track-index="5" data-volume="1"></audio>\n`;
});
const laneEnd = [];
fx.forEach(([f, t, v], i) => {
  const start = Math.max(0, r2(t + 1 / 30 - PEAK[f]));
  const d = Math.min(dur(`assets/sfx/${f}.mp3`), r2(66 - start));
  let lane = laneEnd.findIndex((e) => e <= start); if (lane < 0) lane = laneEnd.length; laneEnd[lane] = start + d;
  audio += `      <audio id="sfx-${String(i).padStart(2, "0")}-${f}" class="clip" src="assets/sfx/${f}.mp3" data-start="${start}" data-duration="${d}" data-track-index="${6 + lane}" data-volume="${v ?? VOL[f]}"></audio>\n`;
});
const index = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.hook}; }
      #root { width: 100%; height: 100%; font-family: Nunito, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${t}" data-width="${W}" data-height="${H}">
${hosts}${audio}    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
writeFileSync("index.html", index);
console.log("ok", t, "s,", S.length, "cenas");
