# Roteiro do site (rascunho para alinharmos)

Ideia central: **uma noite no quarto do Arthur**. O visitante entra no quarto, o computador liga o site, o site mostra quem eu sou e, na parte de dados, a gente "desce para dentro da máquina", até um data center. No fim, a gente volta para o quarto.

Status: ✅ pronto · 🟡 parcial · ⬜ a fazer

---

## Ato 1: O quarto (intro 3D) 🟡

### Roteiro de animação, batida por batida

| # | Momento (scroll) | O que se vê | O que se ouve |
|---|---|---|---|
| 0 | Carregou (0%) | Quarto escuro. Só a tela do monitor brilha, a chuva escorre na janela e os pisca-piscas estão bem fracos. O título aparece letra por letra. | Chuva baixinha e o zumbido do PC (só com o som ligado). |
| 1 | Primeiro scroll/clique | **A luminária acende com um "clic"**. Ela pisca duas vezes e a luz âmbar se espalha pelo quarto, revelando os objetos. | O clic do interruptor. |
| 2 | 0–35% | A câmera orbita de lado. Tem poeira flutuando no feixe da luz, vapor saindo da caneca e o cubo mágico girando uma camada. | Ambiente. |
| 3 | 35–75% | A câmera desce e contorna a mesa. Os objetos reagem ao mouse: passar pelo violão faz uma corda vibrar (com uma nota) e passar pelo cubo faz ele girar. | Uma nota de violão no hover. |
| 4 | 75–100% | Aproximação da tela. A luz do monitor ilumina mais a cena e o bloom some. | O ambiente fica mais abafado. |
| 5 | Boot (trava o scroll) | O terminal digita **e as teclas do Sofle afundam de verdade, em sincronia com cada letra digitada**. Depois vem o Firefox, o duplo clique e o F11. | Teclado mecânico sincronizado, cliques do mouse e a tecla F11. |
| 6 | Tela cheia | O site aparece. | O som ambiente vai sumindo. |

### Melhorias do quarto (leves)
- **Janela** com vista noturna e chuva. É um shader em um plano, sem modelo 3D.
- **Texturas geradas no código**: veio da madeira, trama do tapete, lombadas dos livros e pôsteres.
- **Sombras de contato** e "AO falso" com gradientes, para os objetos não parecerem flutuando.
- **Pisca-pisca** na parede usando pontos com bloom, que custam quase nada.
- **Poeira no feixe** (partículas) e **vapor na caneca** (sprite com shader).
- No celular a cena usa a qualidade "low": sem sombras, menos partículas e janela estática.

### Som
- Começa **mudo**. O navegador bloqueia som sem um clique antes, então tem um botão 🔈 fixo no canto e o primeiro clique pergunta "ligar som?".
- Sons curtos em `.ogg`/`.opus`, somando menos de 300 KB, ou sintetizados com Web Audio. O ambiente é carregado só depois que a pessoa liga o som.
- A escolha fica salva (localStorage) e vale também para o data center.

---

## Ato 2: O site

1. **Hero** ✅: nome, frase, botões e currículo.
2. **Sobre** ⬜ (`$ cat sobre.md`): um texto curto, foto, onde estudo, formatura em dez/2026 e o que eu procuro. Pode ter detalhes pessoais (cubo: meu tempo médio; violão: o que toco).
3. **Projetos** ⬜ (`$ ls projetos/`): estudos de caso com problema → o que fiz → resultado/números → stack → links.
   - TCC URBS (ML, `ml-grafico`, `fluxo`)
   - Data Warehouse (`dw-arquitetura`)
   - + outros?
4. **Ato 3, o data center** ⬜ (logo abaixo)
5. **Experiência** ⬜ (`$ git log --oneline carreira`): uma linha do tempo em estilo git log (Soma Tecnologia, estágio, faculdade).
6. **Stack** ⬜ (`$ fastfetch --skills`): reaproveita o visual do fastfetch, separando Full-Stack e Dados.
7. **Contato** ⬜ (`$ ssh arthur@contato`): e-mail, LinkedIn, GitHub e currículo PT/EN.

---

## Ato 3: O data center (seção de dados) ⬜

Uma **segunda cena 3D**, carregada só quando a pessoa chega perto dela, para não pesar a intro.

- **Entrada**: a página "entra no cabo de rede". Um terminal faz `ssh dados@datacenter` e a câmera atravessa um corredor de racks com LEDs piscando, numa luz fria (azul/ciano) que contrasta com o âmbar do quarto.
- **O scroll conduz um pacote de dados** pela jornada, e cada etapa fica fixa na tela com um texto curto:
  1. **Fontes**: APIs, CSV, sensores (no TCC, os dados dos ônibus da URBS)
  2. **Ingestão**: os pacotes entram pela fila
  3. **Processamento/ETL**: Python e SQL, limpeza
  4. **Armazenamento**: o Data Warehouse aparece como um esquema estrela montado em 3D
  5. **Consumo**: dashboards, ML, Process Mining
- Cada etapa liga a um projeto real, para mostrar que eu fiz isso e não só que conheço.
- Fica leve com racks instanciados e pacotes como partículas. No mobile ou com movimento reduzido, vira uma versão 2D em SVG animado.

---

## Epílogo: voltar ao quarto ⬜

No rodapé/contato, a gente volta para o quarto: a câmera se afasta da tela, **a luminária apaga com o clic** e fica só a chuva. A frase final é algo como "boa noite, até a próxima". Isso fecha o ciclo.

---

## Ordem sugerida de trabalho

1. Montar o conteúdo do Ato 2 (o que mais importa para recrutadores).
2. Fazer a batida 1 (acender a luminária) e o sistema de som.
3. Teclado sincronizado com a digitação, mais poeira, vapor e pisca-pisca.
4. Janela com chuva e texturas geradas no código.
5. Data center (Ato 3).
6. Epílogo, OG image, deploy e preview na Vercel.
