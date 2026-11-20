# REVIEW — O centavo que dobrava (v1)

## Decisões criativas
- Construída a storyline A (STORYLINES.md). Não construídas: B "a formiga que levantou um carro",
  C "o menino que pausava o tempo".
- 66 s, 1080x1920, sem voz e sem música: o texto na tela carrega a história (funciona no mudo).
- Valores reais: 1 centavo dobrando por 30 dias = R$ 5.368.709,12 no dia 30 (0,01 × 2^29).
- Cenas geradas por `tools/gen.mjs` (rode `node tools/gen.mjs` após editar).

## O que foi medido / só olhado
- `hyperframes check`: 0 erros. Snapshots revisados em 0.5, 2.9, 15, 22.5, 29.6, 44.6, 50, 52, 61 s.
- Som: não há. Nada foi ouvido.

## Avisos mantidos de propósito
- `line_unread` nos números do calendário: a contagem rápida é a montagem (a sensação de "voando").
- `film_silent`: sem login HeyGen não há música/efeitos. Próximo passo: bed + riser no dia 30.
- `timeline_track_too_dense` / `composition_file_too_large` em `dias`: 50 clips de contador.

## Ponto mais fraco
- Cena 3 (escolha): a mão do vovô com a moeda entra pela janela e fica pequena; com mais tempo,
  o vovô inteiro em quadro e o Leo andando até ele.
- Personagens se movem por poses (braços, boca, olhos, contorno "fervendo"); não há animação
  quadro a quadro. Para mais vida: mais poses intermediárias e piscar mais frequente.
