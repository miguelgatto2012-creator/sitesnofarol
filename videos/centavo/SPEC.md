# SPEC — O centavo que dobrava

GOAL:    o espectador fica até o dia 30 para ver o número e comenta "milhão ou centavo".
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps (Reels / Shorts / TikTok)
TIME:    66 s x 30 = 1980 frames; sem música nesta versão (sem login HeyGen)
LOOK:    desenho 2D recortado. Contorno #1E1A2B a 8 px que "ferve" 12x por segundo
         (feTurbulence seed em steps, displacement 5 px). Fundos chapados por mundo:
         gancho #FFD447, sala #8FD8CF com piso #E8A15C, quarto #9ED8FF, virada inunda #22B26B.
         Acento verde-dinheiro #22B26B só em valores em reais; dourado #F2B705 só na moeda.
         Texto: Nunito 900 64–72 px (frases), Archivo Black 96–150 px (números), alinhado à
         esquerda em x=120, largura 768, faixa 300–760 px (zona segura do Reels).
OBJECTS: Leo (camisa laranja #FF6B35, cabelo castanho), vovô (cardigã marrom, careca, óculos,
         bigode branco), Bia (vestido azul #3D7EFF, maria-chiquinha). Moeda dourada com "1",
         maleta aberta com maços verdes, calendário de parede com faixa vermelha "DIA",
         cofrinho rosa, cédulas verdes caindo.
MOTION:  chegada expo.out / back.out(1.6) em personagens; troca de cena power3.in → out;
         palavras 0.067 s de stagger; frase segura 0.5 s + 0.3 s/palavra.
SHOTS:   0–6   gancho: Leo com a moeda, "Ele recusou R$ 1 milhão" já no frame 0 → "...por 1 centavo";
               a moeda cresce e vira o mundo seguinte.
         6–17  proposta: moeda encolhe até a mão do vovô; maleta = "R$ 1 milhão agora";
               moeda = "ou 1 centavo que dobra todo dia, por 30 dias".
         17–25 escolha: Leo entra andando, pensa, aponta para a moeda; Bia ri "Você é louco!".
         25–41 dias 1–25: calendário vira, contador verde; dia 10 = R$ 5,12 (Leo triste),
               dia 20 = R$ 5.242,88, dia 25 = R$ 167.772,16 ("nem 20%").
         41–55 virada: dias 26–30 aceleram, cédulas chovem, fundo inunda de verde no dia 28;
               dia 30 = R$ 5.368.709,12, Leo no topo do monte.
         55–66 final: "O centavo nunca foi pequeno." / "Ele só precisava de tempo." /
               "Milhão ou centavo? Comenta aí".
BANNED:  fundo escuro com coisas flutuando, brilho/partículas decorativas, gradientes roxos,
         papel creme com serifa, tudo entrando com fade + slide up, títulos que flutuam,
         logo no canto, três cards em linha.
QA:      t=0 (gancho legível), 2.6, 12, 21, 29.5, 46, 50.5, 62.
