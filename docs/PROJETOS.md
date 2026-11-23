# Projetos: rascunho dos estudos de caso

Escrito a partir dos READMEs e do código no GitHub (22/11/2026). **Revisar:** números, o que você fez sozinho ou em grupo, e o tom.

---

## 1. Mineração de Processos no Transporte Público (TCC)

**Repos:** `tcc-urbs` (público), `coletor-URBS` e `URBS-Process-Mining` (privados, versões anteriores)
**Fonte:** TCC na UTFPR Ponta Grossa (2026), orientado pelo Prof. Dr. André Pinz Borges
**Papel no site:** projeto principal. Conta como **dados e como full-stack**.

**Resumo de uma linha:** transformo o GPS bruto dos ônibus num log de eventos e mostro em uma plataforma web onde a operação foge do itinerário.

**Problema.** A telemetria GPS da frota de ônibus (URBS) chega com ruído, imprecisão e falhas de comunicação. Nesse formato não dá para saber se um ônibus passou por todas as paradas nem onde estão os gargalos, e o fiscal do Centro de Controle Operacional (CCO) não tem uma triagem baseada em dados.

**O que eu fiz:**
- **Coleta 24/7** em Python com a API da URBS. Cada consulta traz a frota inteira, **cerca de 1.500 ônibus de 250 linhas**. Fiz duas campanhas:
  - **Regime A**, a cada 2 min: **5,08 milhões** de registros em cerca de 130 h.
  - **Regime B**, a cada 20 s: **37,2 milhões** de registros em cerca de 149 h, com uns 3,1 GB por semana. A compressão XZ reduz isso **18 vezes**.
- **Pipeline de dados espaciais**:
  - limpeza das leituras inválidas e afastadas do traçado;
  - **map matching com Modelo Oculto de Markov** para associar as leituras ao traçado da linha;
  - horários de passagem nas paradas por **interpolação PCHIP**;
  - log de eventos no padrão **IEEE XES**.
- **Mineração de processos** (PM4Py):
  - descoberta do modelo com Inductive Miner, comparado com o Alpha Miner (que gerou redes inválidas);
  - conformidade contra o modelo normativo do itinerário;
  - ranking de gargalos, só com trechos de n ≥ 30.
- **Plataforma web de auditoria**: API em **FastAPI** com streaming SSE e front em **React + Vite + Tailwind** com mapa **Deck.gl**. São 5 telas: Auditoria Diária, Conformidade, Rede de Petri, Gargalos (DFG) e Replay no mapa. Ela foi pensada para o fiscal: números, cores e mapas, sem jargão.
- **81 testes automatizados**, entre unitários, de integração e E2E.

**Resultados** (3 linhas de tipos diferentes: 541 troncal, 542 alimentadora, 050 interbairros):
- Com a coleta a cada 20 s em vez de 2 min, o **fitness médio subiu de 0,33–0,45 para 0,66–0,76** e os **eventos interpolados caíram de 23–27% para 11–17%**, uma queda de 38 a 52%. Ou seja, **o intervalo de coleta é determinante para fazer mineração de processos com GPS**.
- **Achado:** algumas paradas somem em quase todas as viagens (até 98%) por causa do **próprio dado**, não do motorista. O GPS só troca o sentido depois que o ônibus sai do terminal (91% das leituras perto do terminal vêm no sentido anterior). Assim a plataforma separa as **omissões sistemáticas**, que são problema do dado, das **isoladas**, que são as que o fiscal deve conferir.
- O "gargalo" mais lento da linha 541 (8 min em 1,56 km) era na verdade a **permanência no terminal**, e não trânsito. Descontada essa espera, o trecho final é feito a cerca de 12 km/h.
- A abordagem vale para **qualquer linha e outras cidades** que tenham GPS, cadastro de paradas e traçado.

**Stack:** Python, pandas, PM4Py, SciPy, HMM (map matching), FastAPI, React, Vite, Deck.gl, Tailwind, pytest

**Imagens:** o PDF tem capturas das 5 telas (Figuras 21 e 25–29). Dá para extrair e usar no site.

**No data center:** ele ilustra as etapas de **fontes, ingestão, processamento e consumo**.

> Curitiba aparece só como a origem dos dados da URBS, não como algo pessoal.

---

## 2. Data Warehouse com Arquitetura Medalhão

**Repo:** `sql-data-warehouse` (público)
**Papel no site:** mostra SQL e modelagem dimensional.

**Resumo de uma linha:** junto dados de CRM e ERP num Data Warehouse em SQL Server, em três camadas, até chegar a um esquema estrela pronto para BI.

**O que eu fiz:**
- **Bronze**: carga bruta de 6 tabelas (3 do CRM e 3 do ERP) via *stored procedure*, no esquema *truncate & load*.
- **Silver**: limpeza, padronização de tipos, deduplicação e regras de negócio, com um script de transformação por tabela.
- **Gold**: modelo estrela em *views*, com `dim_customers`, `dim_products` e `fact_sales` e chaves substitutas (*surrogate keys*).
- **Qualidade de dados**: scripts de verificação em cada camada e um catálogo de dados documentado.
- Diagramas de arquitetura, fluxo, integração e esquema estrela (`dw-arquitetura.png` já está no `public/`).

**Stack:** SQL Server, T-SQL, SSMS, modelagem dimensional

**No data center:** é a etapa de **armazenamento**. Os andares Bronze, Prata e Ouro podem virar três níveis do data center.

> **Decidido:** é o projeto guiado do curso do Data With Baraa, sem nada acrescentado. Ele aparece como um **estudo menor**, sem o mesmo destaque, e o texto diz isso: "projeto guiado (Data With Baraa) para praticar a arquitetura medalhão". No data center ele continua servindo de exemplo para a etapa de armazenamento. _Ideia opcional:_ estender o projeto (orquestração, testes de qualidade automáticos, um dashboard) e aí sim colocar em destaque.

---

## 3. Banger: arena de luta em Rust + WebAssembly

**Repos:** `Banger-Bevy` (privado), com versões anteriores em `Banger2.0` e `banger` (TypeScript)
**Papel no site:** projeto pessoal que mostra engenharia e vontade de aprender coisa difícil.

**Resumo de uma linha:** um jogo de luta em arena 3D, feito em Rust com a engine Bevy, que roda no navegador do celular e tem multiplayer em rede local.

**O que eu fiz:**
- Comecei em TypeScript (Three.js + servidor Colyseus) e **reescrevi em Rust com Bevy 0.20**, cerca de 14 mil linhas usando ECS.
- **Roda no navegador** via WebAssembly + WebGL2, com controles por toque no estilo Brawl Stars. Também resolvi problemas reais de mobile: limite de superfície no iPhone Retina e MSAA no WebGL2.
- **Multiplayer em rede local**: o PC roda um servidor autoritativo e os celulares conectam por WebSocket, recebendo 30 "fotos" de estado por segundo serializadas com *postcard*. O servidor gera um QR code para entrar na sala.
- Bots com IA de combate, combos, habilidades como o "Corte Iai" cinematográfico, mapa de ilhas flutuantes e shader toon próprio (WESL).
- Otimizei o WASM com `wasm-opt` (de 40 MB para 31 MB) para caber em celulares com pouca memória.

**Stack:** Rust, Bevy (ECS), WebAssembly, WebGL2, WebSocket, TypeScript (versão anterior)

**No site:** **só vídeo** (um loop curto e mudo com gameplay e o multiplayer no celular). _Falta gravar._

---

## 4. "Como fiz este site" (card menor)

Astro + React Three Fiber, cena 3D procedural (sem nenhum modelo baixado), intro com desktop Fedora simulado, qualidade adaptativa para o celular e som com Web Audio. Link para o repositório `portfolio-site`.

---

## Outros projetos (grade, uma linha cada)

| Projeto | Linha |
|---|---|
| Predição DCNT (Unimed) | Extensão universitária com a Unimed Ponta Grossa: ML para predizer doenças crônicas |
| Process Mining (Recebimento) | Gargalos e conformidade num fluxo de confirmação de recebimento |
| Avaliação de imóveis (RBC) | Raciocínio Baseado em Casos para estimar preço de imóveis |
| SQL EDA | Análise exploratória em SQL |
| Pac-Man IA | Next.js + TypeScript com IA nos fantasmas |
| Gerenciee | App de despesas em Flutter (em dupla) |
| Lab de Sistemas Operacionais | Práticas em C |
| Flex/Bison | Estudos de compiladores |

_(escolha 4 a 6 desses)_
