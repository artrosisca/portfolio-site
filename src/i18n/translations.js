export const translations = {
  PT: {
    nav: {
      about: "SOBRE",
      tech: "TECNOLOGIAS",
      experience: "EXPERIÊNCIA",
      projects: "PROJETOS",
      contact: "CONTATO",
      download_cv: "BAIXAR CV",
      doc_preview: "Pré-visualização"
    },
    hero: {
      subheadline: "DESENVOLVEDOR FULL-STACK",
      description: "Desenvolvedor Full-Stack & Soluções em Dados. Concepção de sistemas web escaláveis, arquiteturas resilientes e pipelines analíticos com tecnologia moderna.",
      cta_contact: "CONTATO",
      cta_projects: "VER PROJETOS"
    },
    boot: {
      msg1: "iniciando sessão...",
      msg2: "seja bem vindo..."
    },
    about: {
      title: "SOBRE",
      p1: "Estudante de Ciência da Computação pela <strong class='text-on-surface'>UTFPR</strong> com experiência prática no desenvolvimento de sistemas web <strong class='text-on-surface'>Full-Stack</strong> e modelagem de bancos de dados relacionais.",
      p2: "Atuação diária em ambiente <strong class='text-on-surface'>Linux</strong>, combinando arquiteturas modernas de backend (Laravel, APIs REST, Webhooks) e interfaces reativas (Vue 3, React), além de sólida bagagem em modelagem dimensional e Process Mining.",
      degree: "Bacharelado em Ciência da Computação",
      education_title: "FORMAÇÃO & CERTIFICAÇÃO",
      utfpr_period: "Jan 2022 – Dez 2026",
      cert_de_title: "Associate Data Engineer",
      cert_de_issuer: "DataCamp",
      cert_de_date: "Dezembro 2025",
      proficiency: "PROFICIÊNCIA"
    },
    tech: {
      title: "tech stack",
      subtitle: "Linguagens e tecnologias",
      popup_title: "Aplicações & Conceitos",
      popup_cta: "Ver projetos relacionados",
      cat_data_engineering: "Engenharia de Dados & Bancos",
      desc_data_engineering: "Modelagem relacional e dimensional, SQL Avançado, PostgreSQL, MySQL e construção de Pipelines ETL sob a Arquitetura Medalhão.",
      cat_analytics: "Análise & BI",
      desc_analytics: "Criação de Dashboards, Process Mining (PM4Py) para fluxos operacionais e modelos preditivos em Machine Learning (Random Forest, K-Means).",
      cat_devops: "DevOps & Sistemas",
      desc_devops: "Ambiente Linux no dia a dia, containers com Docker, controle de versão via Git/GitHub/Bitbucket e pipelines de automação CI/CD.",
      cat_management: "Práticas & Gestão",
      desc_management: "Metodologias ágeis (Kanban/Scrum via Jira), documentação técnica, Git Flow e resolução proativa de anomalias em produção.",
      cat_web_dev: "Desenvolvimento Web",
      desc_web_dev: "Desenvolvimento Full-Stack: Backend escalável com PHP (Laravel, Inertia.js), Python (FastAPI), Java e arquitetura Service-Repository; Frontend com Vue, React e TailwindCSS.",
      cat_ai: "IA & Agentes Autônomos",
      desc_ai: "Integração de modelos generativos, automação de fluxos autônomos e otimização de contexto com Model Context Protocol (MCP)."
    },
    experience: {
      title: "HISTÓRICO",
      title_highlight: "PROFISSIONAL",
      current_badge: "ATUAL",
      job1_role: "Desenvolvedor Full-Stack (Estágio)",
      job1_company: "Soma Tecnologia",
      job1_period: "Junho 2026 – Presente",
      job1_b1: "Desenvolvimento e evolução de módulos da plataforma SaaS voltados a CRM (gestão de pipeline e clientes) e esteiras operacionais de onboarding/implantação, utilizando arquitetura Service-Repository.",
      job1_b2: "Modelagem e manutenção de bancos de dados relacionais (MySQL e PostgreSQL), otimizando consultas SQL e gerenciando conexões multi-database.",
      job1_b3: "Construção e consumo de APIs REST com integração de webhooks de serviços externos (gateways financeiros e assinaturas digitais).",
      job1_b4: "Identificação e correção proativa de anomalias e bugs em produção, assegurando a estabilidade da aplicação e documentação técnica atualizada.",
      job2_role: "Desenvolvedor Front-End (Estágio)",
      job2_company: "Onikode Solutions",
      job2_period: "Março 2025 – Julho 2025",
      job2_b1: "Desenvolvimento e manutenção de interfaces de usuário modulares e responsivas em Angular, integrando componentes ao back-end via APIs e exibição dinâmica de dados.",
      job2_b2: "Colaboração direta no alinhamento de contratos de APIs e mapeamento de fluxos de dados ponta a ponta (E2E), alinhando consistência técnica entre front e back.",
      job2_b3: "Atuação remota em equipe ágil utilizando Jira para acompanhamento de demandas, controle de versão colaborativo via Git e Bitbucket e refatorações preventivas."
    },
    projects: {
      title: "projetos",
      subtitle: "",
      architecture: "ARQUITETURA",
      view_github: "VER GITHUB",
      p1: {
        title: "SQL Data Warehouse (Arquitetura Medalhão)",
        desc: "Implementação de um Data Warehouse completo utilizando o SQL Server, estruturado sob a Arquitetura de Medalhão (Bronze, Silver e Gold).",
        step1: "Bronze Layer: Ingestão de dados brutos do CRM e ERP.",
        step2: "Silver Layer: Limpeza, padronização e data quality.",
        step3: "Gold Layer: Modelagem dimensional pronta para BI."
      },
      p2: {
        title: "Predição de Risco de Doenças Crônicas",
        desc: "Desenvolvido em parceria com Unimed & UTFPR para identificar precocemente beneficiários em risco.",
        step1: "ETL Pipeline: Consolidação de 6 fontes distintas.",
        step2: "Model Comparison: Random Forest e Gradient Boosting.",
        step3: "Data Quality: Tratamento de outliers clínicos."
      },
      p3: {
        title: "Controle de Despesas",
        desc: "Sistema web completo para gerenciamento e controle de despesas pessoais, desenvolvido em PHP com painel de visualização e categorização de gastos.",
        step1: "Backend: API REST em PHP com autenticação.",
        step2: "Frontend: Interface responsiva com filtros dinâmicos.",
        step3: "Relatórios: Dashboard com gráficos de gastos."
      },
      p4: {
        title: "Process Mining — Fluxo de Recebimento",
        desc: "Aplicação de técnicas de Process Mining no fluxo de Confirmação de Recebimento, focando na análise de gargalos temporais e conformidade com regras de negócio.",
        step1: "ETL: Extração e transformação de event logs.",
        step2: "Discovery: Mineração de processos com PM4Py.",
        step3: "Conformance: Verificação de desvios do fluxo ideal."
      }
    },
    contact: {
      title: "Contato",
      subtitle: "",
      description: "INTERESSADO EM CONSTRUIR SOLUÇÕES INOVADORAS? VAMOS CONVERSAR.",
      status: "STATUS: DISPONÍVEL",
      ready: "ABERTO A NOVAS OPORTUNIDADES",
      form_name: "NOME",
      form_email: "E-MAIL",
      form_message: "MENSAGEM",
      form_name_placeholder: "Seu nome",
      form_email_placeholder: "Seu e-mail",
      form_message_placeholder: "Escreva sua mensagem aqui...",
      form_send: "ENVIAR MENSAGEM",
      copied: "COPIADO!",
      hire_me: "ME CONTRATE",
      hire_message: "Olá, Arthur! Vi seu portfólio e fiquei interessado no seu trabalho. Gostaria de saber se você tem interesse em uma oportunidade de colaboração. Podemos conversar?"
    },
    terminal: {
      location: "Pederneiras, SP",
      specialization: "Desenvolvimento Full-Stack",
      focus: "Sistemas Web / Dados",
      status: "Disponível_para_Operações",
      help: "Comandos disponíveis: sobre, skills, projetos, contato, clear, social"
    }
  },
  EN: {
    nav: {
      about: "ABOUT",
      tech: "TECH STACK",
      experience: "EXPERIENCE",
      projects: "PROJECTS",
      contact: "CONTACT",
      download_cv: "DOWNLOAD CV",
      doc_preview: "Document Preview"
    },
    hero: {
      subheadline: "FULL-STACK DEVELOPER",
      description: "Full-Stack Developer & Data Solutions. Building scalable web systems, resilient architectures, and analytical pipelines with modern technology.",
      cta_contact: "CONTACT",
      cta_projects: "VIEW PROJECTS"
    },
    boot: {
      msg1: "initializing session...",
      msg2: "welcome..."
    },
    about: {
      title: "ABOUT",
      p1: "Computer Science student at <strong class='text-on-surface'>UTFPR</strong> with hands-on experience in <strong class='text-on-surface'>Full-Stack</strong> web application development and relational database modeling.",
      p2: "Working daily in a <strong class='text-on-surface'>Linux</strong> environment, combining modern backend architectures (Laravel, REST APIs, Webhooks) and reactive interfaces (Vue 3, React), alongside a solid foundation in dimensional modeling and Process Mining.",
      degree: "Bachelor's in Computer Science",
      education_title: "EDUCATION & CERTIFICATION",
      utfpr_period: "Jan 2022 – Dec 2026",
      cert_de_title: "Associate Data Engineer",
      cert_de_issuer: "DataCamp",
      cert_de_date: "December 2025",
      proficiency: "PROFICIENCY"
    },
    tech: {
      title: "tech stack",
      subtitle: "Languages and technologies",
      popup_title: "Applications & Concepts",
      popup_cta: "See related projects",
      cat_data_engineering: "Data Engineering & Databases",
      desc_data_engineering: "Relational and dimensional modeling, advanced SQL, PostgreSQL, MySQL, and building ETL pipelines under Medallion Architecture.",
      cat_analytics: "Analytics & BI",
      desc_analytics: "Interactive Dashboards, Process Mining (PM4Py) for operational flows, and predictive Machine Learning models (Random Forest, K-Means).",
      cat_devops: "DevOps & Systems",
      desc_devops: "Daily Linux workflow, Docker containerization, version control with Git/GitHub/Bitbucket, and CI/CD automation pipelines.",
      cat_management: "Practices & Agile",
      desc_management: "Agile methodologies (Kanban/Scrum via Jira), technical documentation, Git Flow, and proactive production bug resolution.",
      cat_web_dev: "Web Development",
      desc_web_dev: "Full-Stack Development: Scalable backends with PHP (Laravel, Inertia.js), Python (FastAPI), Java, and Service-Repository architecture; Frontend with Vue, React, and TailwindCSS.",
      cat_ai: "AI & Autonomous Agents",
      desc_ai: "Generative AI integration, autonomous agent workflows, and context optimization with Model Context Protocol (MCP)."
    },
    experience: {
      title: "WORK",
      title_highlight: "EXPERIENCE",
      current_badge: "CURRENT",
      job1_role: "Full-Stack Developer (Internship)",
      job1_company: "Soma Tecnologia",
      job1_period: "June 2026 – Present",
      job1_b1: "Development and evolution of SaaS platform modules for CRM (pipeline and client management) and operational onboarding/implementation pipelines, utilizing Service-Repository architecture.",
      job1_b2: "Modeling and maintenance of relational databases (MySQL and PostgreSQL), optimizing SQL queries and managing multi-database connections.",
      job1_b3: "Building and consuming REST APIs with webhook integration from external services (financial gateways and digital signatures).",
      job1_b4: "Proactive identification and resolution of production anomalies and bugs, ensuring application stability and up-to-date technical documentation.",
      job2_role: "Front-End Developer (Internship)",
      job2_company: "Onikode Solutions",
      job2_period: "March 2025 – July 2025",
      job2_b1: "Development and maintenance of responsive, modular user interfaces in Angular, integrating components with the backend via REST APIs and dynamic data rendering.",
      job2_b2: "Direct collaboration on API contracts and end-to-end (E2E) data flow mapping, ensuring architectural consistency between frontend and backend.",
      job2_b3: "Remote work in an agile team using Jira for demand tracking, collaborative version control via Git and Bitbucket, and preventive code refactoring."
    },
    projects: {
      title: "projects",
      subtitle: "",
      architecture: "ARCHITECTURE",
      view_github: "VIEW GITHUB",
      p1: {
        title: "SQL Data Warehouse (Medallion Architecture)",
        desc: "Implementation of a complete Data Warehouse using SQL Server, structured under the Medallion Architecture (Bronze, Silver, and Gold).",
        step1: "Bronze Layer: Ingestion of raw data from CRM and ERP.",
        step2: "Silver Layer: Cleaning, standardization, and data quality.",
        step3: "Gold Layer: Dimensional modeling ready for BI."
      },
      p2: {
        title: "Chronic Disease Risk Prediction",
        desc: "Developed in partnership with Unimed & UTFPR to identify high-risk beneficiaries early.",
        step1: "ETL Pipeline: Consolidação de 6 distinct sources.",
        step2: "Model Comparison: Random Forest and Gradient Boosting.",
        step3: "Data Quality: Clinical outlier treatment."
      },
      p3: {
        title: "Expense Tracker",
        desc: "Full web system for managing and tracking personal expenses, built with PHP featuring a visualization dashboard and spend categorization.",
        step1: "Backend: REST API in PHP with authentication.",
        step2: "Frontend: Responsive interface with dynamic filters.",
        step3: "Reports: Dashboard with spending charts."
      },
      p4: {
        title: "Process Mining — Receipt Flow",
        desc: "Application of Process Mining techniques on the Receipt Confirmation flow, focusing on temporal bottleneck analysis and business rule compliance.",
        step1: "ETL: Extraction and transformation of event logs.",
        step2: "Discovery: Process mining with PM4Py.",
        step3: "Conformance: Checking deviations from ideal flow."
      }
    },
    contact: {
      title: "Contact",
      subtitle: "",
      description: "INTERESTED IN BUILDING INNOVATIVE SOLUTIONS? LET'S TALK.",
      status: "STATUS: AVAILABLE",
      ready: "OPEN TO NEW OPPORTUNIDADES",
      form_name: "NAME",
      form_email: "E-MAIL",
      form_message: "MESSAGE",
      form_name_placeholder: "Your name",
      form_email_placeholder: "Your e-mail",
      form_message_placeholder: "Write your message here...",
      form_send: "SEND MESSAGE",
      copied: "COPIED!",
      hire_me: "HIRE ME",
      hire_message: "Hi Arthur! I checked out your portfolio and I'm interested in your work. I’d like to see if you're open to a collaboration opportunity. Are you available to chat?"
    },
    terminal: {
      location: "Pederneiras, SP, Brazil",
      specialization: "Full-Stack Development",
      focus: "Web Systems / Data",
      status: "Available_for_Operations",
      help: "Available commands: about, skills, projects, contact, clear, social"
    }
  }
};
