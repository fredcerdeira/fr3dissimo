# Garmin → portefólio

Uma vez por dia, uma GitHub Action vai buscar os teus treinos à **Garmin Connect Personal API** e grava `data/stats.json`. A página lê esse ficheiro e mostra os números. A chave da API nunca chega ao browser.

```
.github/workflows/garmin-sync.yml   corre todos os dias (05:17 UTC) e faz commit do stats.json
scripts/garmin-sync.mjs             chave → token de 24 h → atividades → stats.json
site/stats-loader.js                preenche os elementos com data-stat="…"
site/example.html                   exemplo de marcação
sample/activities.json              dados falsos para testar sem chave
```

## Configuração (uns 10 minutos)

1. **Criar a chave** em connect.garmin.com → Settings → Account → Personal API Token → *Create Key*. Escolhe a validade e aceita os termos. A chave só aparece uma vez, por isso copia-a logo.
2. **Criar um repositório** no GitHub (pode ser o do próprio site) e copiar estes ficheiros para lá.
3. **Guardar a chave como secret:** repo → Settings → Secrets and variables → Actions → *New repository secret*, com o nome `GARMIN_API_KEY`.
4. **Correr a primeira vez à mão:** separador Actions → *Garmin sync* → *Run workflow*. Deve aparecer um commit com `data/stats.json`.
5. **Ligar a página:** inclui `stats-loader.js` e marca os números com `data-stat` (vê `site/example.html`).

Quando a chave expirar (30, 90, 180 dias ou 1 ano), a Action falha e o GitHub avisa-te por email. Basta criar uma chave nova e atualizar o secret.

## Publicar o site (GitHub Pages)

`index.html` na raiz é o site. No repositório: Settings → Pages → *Deploy from a branch* → `main` / `(root)`. Cada vez que a Action atualiza o `stats.json`, o Pages volta a publicar sozinho. Até à primeira sincronização, os números aparecem como "–".

## O que fica público

Só totais e informação básica:

- **Ano corrente:** sessões, km, horas e desnível, por natação, ciclismo e corrida.
- **Semana tipo:** média das últimas 8 semanas completas.
- **Gráfico:** horas por semana nas últimas 12 semanas.
- **Últimas 5 sessões:** só data, modalidade, distância e duração.

Ficam fora, de propósito: GPS e coordenadas, horas de início, nomes das atividades (muitas vezes têm o nome do sítio), frequência cardíaca e dados de saúde. Assim ninguém consegue tirar da página onde moras ou a que horas sais para treinar.

## Elementos disponíveis

| `data-stat` | Exemplo |
|---|---|
| `ytd.total.count` / `.km` / `.hours` | 287 · 4,312 km · 312.5 h |
| `ytd.swim.km`, `ytd.bike.km`, `ytd.run.km` (e `.count`, `.hours`) | |
| `ytd.elevationM` (com `data-format="m"`) | 22,530 m |
| `typicalWeek.hours`, `.swimKm`, `.bikeKm`, `.runKm` | 9.5 h |
| `updatedAt` (com `data-format="date"`) | 20 Nov 2026 |
| `year` | 2026 |

Também há dois contentores: `data-stat-recent` (uma `<ul>` com as últimas sessões) e `data-stat-weekly` (um gráfico de barras com a cor do texto, `currentColor`).

Formatos possíveis: `int`, `km`, `hours`, `m`, `date`, `duration`.

## Testar sem chave

```
node scripts/garmin-sync.mjs --from-file sample/activities.json
```

## Notas

- **Endpoints usados:**
  - `POST /personalapitoken-service/personal-api/personal-api-key/token` (`Authorization: ApiKey …`)
  - `GET /activitylist-service/activities/search/activities` (`Authorization: Bearer …`), em `personal.connectapi.garmin.com`
- **Nomes dos parâmetros e dos campos:** o script usa `start`, `limit`, `startDate` e `endDate`, e os campos `startTimeLocal`, `activityType.typeKey`, `distance` (m), `duration`/`movingDuration` (s) e `elevationGain`. São os mesmos do Garmin Connect, mas confirma-os na documentação Swagger da Personal API na primeira vez que correres o script.
- **Limites:** o Garmin devolve no máximo 99 atividades por pedido (o script vai buscar as páginas todas) e às vezes responde 429 quando há pedidos a mais (o script espera e tenta outra vez).
