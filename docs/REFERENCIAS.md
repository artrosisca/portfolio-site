# Referências e ideias (23/11/2026)

Pesquisa feita para repensar **as cores do site** e **o que vem depois da intro**. A intro está aprovada.

> Observação: estes sites vieram de buscas e de listas do Awwwards. Abra cada um para ver ao vivo antes de decidir.

## Referências

### Portfólios de dev bem resolvidos (clareza)
- **Brittany Chiang** ([site](https://brittanychiang.com/), [código v4](https://github.com/bchiang7/v4)): o portfólio de dev mais copiado. Fundo escuro, um acento só e tipografia limpa. O recrutador entende tudo em 10 segundos.
- **Rauno Freiberg** ([perfil](https://uiuxshowcase.com/portfolio/rauno-freiberg/)): design engineer na Vercel. O site imita um sistema operacional, e ele é referência em microinterações ([ensaio "Invisible Details of Interaction Design"](https://www.uxtools.co/blog/your-ui-needs-more-walt-disney)). É o que mais conversa com o nosso desktop Fedora.

### Tipografia e cor (personalidade)
- **Isabel Moranta**, Awwwards Site of the Day ([via Lovable](https://lovable.dev/guides/dark-mode-website-examples-guide)): **duas fontes com papéis**. A monoespaçada é a voz técnica e a serifada é a voz pessoal. Combina com a gente: o terminal é a parte técnica e o Arthur é a parte pessoal.
- [Vencedores de tipografia no Awwwards](https://www.awwwards.com/websites/winner_category_typography/) e [portfólios vencedores](https://www.awwwards.com/websites/winner_category_portfolio/), bons para folhear.
- [Tendências de cor 2026](https://lunasites.io/blog/website-color-trends-2026): saída do branco puro para **off-white quente** (o "Cloud Dancer" da Pantone), com tons terrosos (terracota, ferrugem, oliva) e tons editoriais escuros (berinjela, índigo, bordô). Ver também [este guia de paleta para portfólio](https://mnml.page/blog/portfolio-website-color-palette).

### Dados de um jeito criativo
- **Nadieh Bremer / Visual Cinnamon** ([portfólio](https://www.visualcinnamon.com/portfolio)): visualização de dados como arte (NYT, Guardian, Google). É a referência para transformar o TCC em algo visual.
- **Yan Holtz** e outros ([lista da CareerFoundry](https://careerfoundry.com/en/blog/data-analytics/data-analytics-portfolio-examples/)): portfólio de dados com gráficos que reagem ao mouse.
- **Simon Späti** ([via Colorlib](https://colorlib.com/wp/data-science-portfolio-examples/)): engenheiro de dados que usa a escrita como portfólio.

### Critério de júri
- [Hon Tran, "Best Award-Winning Websites of 2026"](https://www.hontran.dev/blog/best-award-winning-websites-2026) aponta três critérios: direção de arte forte e específica, movimento com propósito e 60 fps num celular médio.

---

## Direções de cor

O site hoje é escuro com azul, e isso some no meio de mil portfólios de dev iguais. Três caminhos:

| | Fundo | Texto | Acento | Ideia |
|---|---|---|---|---|
| **A. "A luz acendeu"** | `#f1ece2` papel | `#16140f` | `#c4502b` ferrugem | A intro é noite. Quando o site abre em tela cheia, **é dia**: papel claro, quente, editorial. Contraste forte com a intro e foge do "dark mode de dev". |
| **B. Noite quente** | `#0f0d0b` preto quente | `#efe6d8` | `#d9a441` mostarda queimada | Continua escuro, mas quente como o quarto (sem azul). Mais coeso, menos surpresa. |
| **C. Editorial escuro** | `#14111a` berinjela | `#ece6f0` | `#b8443f` bordô | Escuro com personalidade, menos "tech", mais revista. |

**Recomendo a A.** Ela usa a própria história: você sai do quarto escuro e entra num site claro, como acender a luz. Combina com a dupla tipográfica (serifada para títulos, mono para os detalhes de terminal).

## Ideias criativas

1. **Trocar o efeito de decodificar** por algo editorial: título numa serifada grande, revelado palavra por palavra por uma máscara que sobe. Ou nada: tipografia boa parada também impressiona.
2. **O TCC como experiência de dados**, no lugar de um card: ao rolar, os 37 milhões de pontos de GPS viram uma nuvem, a nuvem vira a rota da linha 541, e aparecem as paradas "fantasma" (omitidas em 98% das viagens). Inspirado na Nadieh Bremer, com dados reais e leve (canvas). É o "uau" da parte de dados, mais forte que um data center genérico.
3. **Seções como continuação do desktop, mas com leveza** (estilo Rauno): projetos abrem como abas, o contato é um `ssh` e o currículo é um `.pdf` no dock. Sem virar um sistema operacional inteiro, só detalhes.
4. **Terminal de verdade (easter egg)**: atalho `` ` `` abre um terminal onde `help`, `projetos`, `cv` e `sudo contratar` funcionam.
5. **"Agora"**: um bloco pequeno com o que estou estudando e o último commit (puxado do GitHub na hora do build). Dá sensação de site vivo.
6. **Modo recrutador**: um botão "versão de 30 segundos" que mostra só o essencial (stack, projetos, contato) numa tela.
7. **Epílogo**: no fim da página, voltar ao quarto com a luminária apagando (já estava no roteiro).
