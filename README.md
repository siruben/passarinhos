# Passarinhos (web)

Joguinho inspirado em Angry Birds: você puxa o passarinho no estilingue e solta para lançar, derrubando estruturas e eliminando alvos.

## Rodar localmente

Você precisa servir os arquivos com um servidor estático (por causa de `type="module"`).

### Python
```bash
python -m http.server 5173
```

### Node (npx)
```bash
npx serve .
```

Abra http://localhost:5173

## Controles
- Clique e arraste o passarinho no estilingue
- Solte para lançar
- Botão **Reiniciar** reinicia a fase
