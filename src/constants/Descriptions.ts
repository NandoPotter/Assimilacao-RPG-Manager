// ARQUIVO: src/constants/Descriptions.ts

export interface DescriptionData {
    title: string;
    text1: string;
    text2?: string;
    textC?: string;
    table?: {
        headers: string[];
        rows: string[][];
    };
    text3?: string;
    text4?: string;
    textE?: string;
}

export const DESCRIPTIONS: Record<string, DescriptionData> = {

    //  ====================================================================
    //                               INTINTOS
    //  ====================================================================

    generation: {
        title: "Geração",
        text1: "Determina a época em que um(a) Infectado(a) nasceu em relação ao Colapso. Infectados da Geração Pré-Colapso nasceram e foram criados antes do evento; a Geração-Colapso passou pelo Colapso entre os 5 e 12 anos; já a Geração Pós-Colapso nasceu depois ou tinha menos de 5 anos durante o evento."
    },

    occupation: {
        title: "Ocupação",
        text1: "Refere-se a sua função, o empenho diário em sua vida. Ajuda a delinear melhor suas rotinas e sua posição perante o grupo de Infectados e as comunidades que o conhecem.",
        table: {
            headers: ["Exemplos:"],
            rows: [
                ["Negociador(a) pilantra"],
                ["Clinico(a) geral"],
                ["Fazendeiro(a) bairrista"],
                ["Aristocrata decadente"],
                ["Mercenario(a) por necessidade"]
            ]
        }
    },

    defining_event: {
        title: "Evento Marcante",
        text1: "Refere-se a um evento do passado que moldou a forma como o(a) Infectado(a) vê o mundo. Pode se referir a uma tragédia pessoal, um momento de superação ou um fato isolado que o impactou.",
        table: {
            headers: ["Exemplos:"],
            rows: [
                ["Sobrevivente da queda de São Leopoldo"],
                ["Abandonado(a) por seus companheiros"],
                ["Líder destronado(a) pelo irmão"],
                ["Caçado(a) pelos motoqueiros do Pico Verde"],
                ["Viveu escondido(a) entre o lixo"]
            ]
        }
    },

    purposes: {
        title: "Propósitos",
        text1: "Metas de uma personagem Infectada que, ao concluídas, geram um momento de Clareza de Propósito."
    },

    characteristics: {
        title: "Características",
        text1: "Traços únicos que definem detalhes e particularidades do personagem. Elas permitem personalizar o(a) Infectado(a) além dos números da Ficha, destacando talentos, comportamentos, adaptações e conexões com o mundo ao seu redor."
    },

    starting_kit: {
        title: "Kits Iniciais",
        text1: "Define as posses iniciais do seu Infectado, ou seja, seus equipamentos iniciais para começar suas aventuras."
    },

    //  ====================================================================
    //                               INTINTOS
    //  ====================================================================

    instincts: {
        title: "Instintos",
        text1: "Os Instintos representam as características inerentes dos seres vivos, seja através de força muscular, raciocínio, ou até mesmo os 5 sentidos. Estes são os atributos que regem o mundo animal.",
        text2: "Animais possuem mais pontos nessas Aptidões e tendem a usá-las de maneira mais natural. O parasita dentro de todos os Infectados não tem Práticas ou Conhecimentos, mas é muito mais conectado aos seus Instintos que o homem moderno.",
        table: {
            headers: ["Valor", "Pessoa"],
            rows: [
                ["1", "ENFRAQUECIDA"],
                ["2", "NORMAL"],
                ["3", "DE DESTAQUE"],
                ["4", "EXTRAORDINÁRIA"],
                ["5", "NO ÁPICE"]
            ]
        }
    },

    influencia: {
        title: "Influência",
        text1: "A capacidade dos Infectados de influenciar outras pessoas. Seu magnetismo pessoal, carisma, habilidade com palavras e liderança.",
        text2: "Inclui a capacidade de intimidar ameaças e sua credibilidade. Pode ser testada em ações ou percepções de terceiros que envolvam aparência, olhares, cheiros, palavras, gestos e afins.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["1", "TÍMIDA", "Tem dificuldades sociais"],
                ["2", "EQUILIBRADA", "Não se destaca"],
                ["3", "PERSUASIVA", "É cativante e convincente"],
                ["4", "MAGNÉTICA", "É a estrela da festa em todas as festas"],
                ["5", "LÍDER", "Capaz de inspirar e encantar ou de intimidar e dominar"]
            ]
        },
        text3: "Influência deve ser a base de qualquer teste que envolva relações pessoais, convencimento, manipulação e para imprimir sentimentos em outros. Testes que influenciem comportamento de terceiros em geral são norteados por este Instinto.",
        text4: "Passivamente, a Influência interfere na forma como as pessoas os percebem. Despertar respeitabilidade, confiabilidade, segurança, atração, boa vontade, interesse ou até medo são consequências naturais dos Infectados com muitos pontos em Influência."
    },

    percepcao: {
        title: "Percepção",
        text1: "Rege a capacidade sensorial dos Infectados, incluindo sentidos e atenção.",
        text2: "Usado em testes para perceber nuances, notar detalhes, enxergar longas distâncias, identificar odores e até mesmo pontaria.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["1", "DISTRAÍDA", "Não percebe detalhes óbvios, constantemente aérea"],
                ["2", "ATENTA", "Percebe o que está ao seu redor, mas sem acuidade"],
                ["3", "PERSPICAZ", "Nota detalhes sutis e padrões com facilidade"],
                ["4", "AGUÇADA", "Sentidos apurados, como os de um predador em alerta"],
                ["5", "VIGILANTE", "Percebe tudo ao seu redor como um radar vivo"]
            ]
        },
        text3: "Percepção é a base para os testes de detecção em sentido amplo. Envolve perceber segundas intenções se rolado com Expressão, notar uma dificuldade sutil no caminhar de outra personagem em cena se rolado com Atletismo ou até mesmo para perceber condições meteorológicas com Geografia. Pode ser provocado pelo(a) Assimilador(a) sem explicar a razão ou mesmo ser rolado em segredo por este.",
        text4: ""
    },

    potencia: {
        title: "Potência",
        text1: "Capacidade de exercer força física e resistir a pressões externas.",
        text2: "Mede seu poder físico, incluindo a capacidade de realizar movimentos rápidos e potentes. É o atributo que define tanto a força bruta quanto a capacidade de tração e explosão, combinando potência muscular e agilidade dinâmica.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["1", "FRACA", "Dificuldade em realizar esforços físicos"],
                ["2", "FUNCIONAL", "Consegue lidar com atividades físicas comuns"],
                ["3", "FORTE", "Capaz de feitos físicos respeitáveis"],
                ["4", "PODEROSA", "Mostra primor em força bruta e explosão muscular, capaz de superar obstáculos físicos extremos"],
                ["5", "TITÂNICA", "Força poucas vezes vista na raça humana, capaz de realizar proezas físicas extraordinárias"]
            ]
        },
        text3: "Todo teste que envolva intensidade física deve ser parametrizado por Potência, mas existem casos em que seria exigido teste em conjunto com Conhecimentos, uma vez que podem ter efeito prático (como medicina, para serrar um osso).",
        text4: "Potência não significa necessariamente um aumento de massa corporal, mas sim a capacidade de exercer força ou a explosão muscular propriamente dita, não interferindo diretamente na estatura ou peso dos Infectados, mas sim em suas capacidades, podendo ter um impacto físico muito notável ou sutil, acompanhando o conceito da personagem."
    },

    reacao: {
        title: "Reação",
        text1: "Instinto básico que mede a velocidade e precisão das reações dos Infectados.",
        text2: "Geralmente é posto à prova em situações em que a personagem precise agir rapidamente e não tenha se preparado.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["1", "LENTA", "Reflexos lentos e descoordenados"],
                ["2", "ESPERTA", "Reage dentro do esperado para situações comuns"],
                ["3", "ÁGIL", "Reage com velocidade acima da média"],
                ["4", "VELOZ", "Reflexos quase instantâneos, como um felino"],
                ["5", "RELÂMPAGO", "Reage antes mesmo de perceber o perigo, como um sexto sentido"]
            ]
        },
        text3: "Reação será o Instinto eleito para a rolagem sempre que não houver tempo para pensar sobre a ação, caso o(a) Infectado(a) tenha sido surpreendido(a) e precise reagir rapidamente ou caso esteja realizando atividade naturalmente reflexiva como desviar de pedras caindo do telhado ou ação similar.",
        text4: "Geralmente na primeira rodada de um Conflito, a Reação será o Instinto mais indicado, assim como para qualquer ação naturalmente reativa em relação a ações de terceiros."
    },
    
    resolucao: {
        title: "Resolução",
        text1: "Resistência física, resiliência mental e empenho.",
        text2: "Representa a capacidade dos Infectados de resistir à pressão psicológica e suas resistências físicas e fisiológicas.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["1", "VACILANTE", "Desiste facilmente diante de desafios"],
                ["2", "ESTÁVEL", "Mantém a calma em situações comuns"],
                ["3", "DETERMINADA", "Resiste a pressões e persiste em seus objetivos"],
                ["4", "INQUEBRÁVEL", "Quase imune a pressões psicológicas e físicas"],
                ["5", "INDOMÁVEL", "Força de vontade inabalável, capaz de superar qualquer obstáculo"]
            ]
        },
        text3: "Resolução é o Instinto de resistência. Usado para resistir à Intimidação, para evitar queda de Determinação após sofrer uma grande perda, para resistir aos próprios impulsos, para resistir a ferimentos, envenenamento ou hemorragia, ou até mesmo para realizar uma ação quando está sob efeito de alguma condição que a afete. Caso tente atacar alguém que ama, ainda que seja por autodefesa, precisaria testar esse ataque com Resolução.",
        text4: "Um(a) Infectado(a) testaria Resolução com Armas para atacar com uma faca em local sob efeito de um incêndio, pois a fumaça dificultaria a visão e a respiração, portanto quem lutará melhor será aquele que conseguir ser mais resoluto."
    },

    sagacidade: {
        title: "Sagacidade",
        text1: "Facilidade para entender e interpretar informações, explicações ou situações, deduzir ou concluir resultados; agudeza de espírito; perspicácia, argúcia, astúcia.",
        text2: "A Sagacidade é testada para chegar a conclusões baseadas em seus Conhecimentos ou exercer de forma astuta e inteligente qualquer atividade.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["1", "INGÊNUA", "Dificuldade em entender situações complexas"],
                ["2", "RAZOÁVEL", "Compreende o básico, mas sem grandes sacadas"],
                ["3", "ASTUTA", "Consegue deduzir e interpretar informações com facilidade"],
                ["4", "BRILHANTE", "Mente afiada, capaz de resolver problemas complexos rapidamente"],
                ["5", "GÊNIAL", "Inteligência quase sobrenatural, capaz de prever e manipular situações com maestria"]
            ]
        },
        text3: "Pode ser testado com Engenharia para fazer um projeto ou com Geografia para interpretar um mapa. Porém a Sagacidade não se limita somente a Conhecimentos, pode testar também astúcia e inteligência na execução de outras tarefas, como se esconder com Furtividade, ou confeccionar manufaturas.",
        text4: "Um(a) Infectado(a) pode testar Medicina com Sagacidade para identificar sintomas visíveis de uma fratura em sua perna, porém, para tratá-la sem anestesia o teste seria de Medicina com Resolução, pois sua capacidade de resistir à dor seria mais determinante para o resultado que entendimento ou interpretação."
    },

    //  ====================================================================
    //                            CONHECIMENTOS
    //  ====================================================================

    knowledge: {
        title: "Conhecimentos",
        text1: "Os Conhecimentos são adquiridos através de longo período de investigação e estudo. Conhecimentos também podem ser usados em testes ativos para realizar algo, como um teste de Biologia para construir uma pequena fazenda ou Erudição para não violar nenhum costume em interação com um grupo de cultura muito diferente.",
        textC: "Animais não possuem níveis nessas aptidões.",
        table: {
            headers: ["Nível", "Pessoa"],
            rows: [
                ["0", "LEIGA"],
                ["1", "INFORMADA"],
                ["2", "CONHECEDORA"],
                ["3", "ESTUDIOSA"],
                ["4", "MESTRA"],
                ["5", "SÁBIA"]
            ]
        }
    },
    
    biologia: {
        title: "Biologia",
        text1: "O campo do conhecimento que estuda a vida em todas as suas formas e como elas interagem com o meio ambiente.",
        text2: "Inclui o estudo biológico do ser humano, a fauna, a flora e outros seres vivos. Além disso, abrange a química orgânica, que investiga a estrutura, propriedades e reações dos compostos químicos que formam a base da vida. Essa aptidão é voltada para a pesquisa sobre a origem, evolução, adaptação e o funcionamento dos organismos.",
        table: {
            headers: ["Valor", "Nível", "Descrição"],
            rows: [
                ["0", "LEIGA", "Não possui conhecimento científico ou empírico sobre biologia"],
                ["1", "CURIOSA", "Conhece o básico sobre biologia, como anatomia e ciclos de vida"],
                ["2", "NATURALISTA", "Entende conceitos intermediários, como ecologia, fisiologia e reações orgânicas comuns"],
                ["3", "BIÓLOGA", "Domina conhecimentos avançados, como genética, microbiologia e síntese de compostos orgânicos"],
                ["4", "ESPECIALISTA", "Referência em sua área, capaz de realizar pesquisas complexas e desenvolver novas tecnologias"],
                ["5", "PIONEIRA", "Revoluciona o campo com descobertas e teorias inovadoras como Graziela Maciel Barroso"]
            ]
        },
        text3: "",
        text4: ""
    },

    erudicao: {
        title: "Erudição",
        text1: "História humana, culturas, artes, ciências políticas, filosofia, sociologia e psicologia são os principais conhecimentos eruditos.",
        text2: "Além do conhecimento teórico, rege prática de exercícios de manutenção da saúde mental, trabalhos artísticos e facilita a compreensão da cultura e características de civilizações presentes e passadas.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "LEIGA", "Não possui conhecimento sobre culturas ou ciências humanas"],
                ["1", "INFORMADA", "Conhece teorias básicas e tem noção artística"],
                ["2", "ESTUDANTE", "Conhece história humana, arte e culturas"],
                ["3", "ERUDITA", "Domina teorias complexas e debates contemporâneos"],
                ["4", "MENTORA", "Guia outros com sabedoria e conhecimento profundo"],
                ["5", "ILUMINADA", "Sua compreensão da condição humana é quase transcendental"]
            ]
        },
        textE: "A Erudição pode ser testada em apresentação artística ou sessão de terapia para recuperar pontos de Determinação de aliados. Cada 1 Sucesso, restaura um Ponto de Determinação, mas cada Pressão retira um ponto."
    },

    engenharia: {
        title: "Engenharia",
        text1: "Conhecimentos técnicos e científicos sobre Matemática, Física, Química Inorgânica e Engenharia.",
        text2: "Essa aptidão abrange a aplicação prática de princípios matemáticos e físicos para projetar, construir e manter estruturas, máquinas, sistemas e processos. Inclui desde a construção de pontes e edifícios até a criação de tecnologias avançadas e a resolução de problemas complexos por meio de cálculos precisos e método científico.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "LEIGA", "Não dispõe de qualquer conhecimento matemático"],
                ["1", "ENTUSIASTA", "Conhece princípios básicos de matemática e física"],
                ["2", "TÉCNICA", "Aplica conceitos práticos em projetos simples"],
                ["3", "ENGENHEIRA", "Domina teorias avançadas e realiza projetos complexos"],
                ["4", "INVENTORA", "Cria soluções inovadoras e revolucionárias"],
                ["5", "VISIONÁRIA", "Redefine os limites da engenharia com ideias disruptivas, como Marie Curie e Alan Turing"]
            ]
        }
    },

    geografia: {
        title: "Geografia",
        text1: "Investigações sobre a Terra, seus fenômenos naturais e a interação entre o ambiente e as sociedades humanas.",
        text2: "Inclui o estudo de mapas, climas, ecossistemas, relevos e recursos naturais. ajudando a entender como as civilizações se adaptam e transformam o espaço geográfico.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "LEIGA", "Não tem noção de clima, relevo ou qualquer base de orientação geográfica"],
                ["1", "INEXPERIENTE", "Conhece mapas básicos e sabe localizar os pontos cardeais"],
                ["2", "VIAJANTE", "Identifica características gerais de regiões e padrões climáticos"],
                ["3", "EXPLORADORA", "Domina conhecimentos avançados sobre cartografia e ecossistemas"],
                ["4", "GEÓGRAFA", "Referência em estudos geográficos e ambientais"],
                ["5", "DOUTORA EM GEOGRAFIA", "Sua compreensão do planeta, seus relevos, biomas, climas e ciclos é capaz de prever eventos naturais futuros e interpretar mudanças geográficas antes que elas se manifestem de forma mais notável"]
            ]
        }
    },

    medicina: {
        title: "Medicina",
        text1: "Conhecimento sobre saúde humana e suas áreas conectadas, inclui também a medicina veterinária.",
        text2: "Além do conhecimento teórico, inclui a prática de tratamentos relacionados, como diagnóstico, cirurgia, prescrição de medicamentos e reabilitação. Essa aptidão é essencial para a cura de doenças, a manutenção da saúde e a compreensão do funcionamento do corpo humano e animal.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "LEIGA", "Desconhece até mesmo práticas simples de manutenção da saúde"],
                ["1", "QUE SABE PRIMEIROS SOCORROS", "Conhece primeiros socorros e noções básicas de saúde"],
                ["2", "ESTUDIOSA DE MEDICINA", "Realiza diagnósticos simples e tratamentos comuns"],
                ["3", "MÉDICA", "Domina técnicas avançadas e cirurgias complexas"],
                ["4", "CIRURGIÃ ou PESQUISADORA", "Referência em sua especialidade, capaz de salvar vidas em situações críticas e criar soluções para endemias"],
                ["5", "CIENTISTA DISRUPTIVA", "Realiza procedimentos que desafiam o conhecimento convencional, é capaz de desenvolver ações de contenção e tratamento até mesmo de pandemias, como Rosalind Franklin"]
            ]
        },
        textE: "A Medicina é a Aptidão testada para realizar tratamento médico, possibilitando a Regeneração de Pontos de Saúde e Níveis de Saúde."
    },

    seguranca: {
        title: "Segurança",
        text1: "Conhecimento que engloba medidas de segurança.",
        text2: "De mecanismos rudimentares até os mais complexos, incluindo avaliação de riscos, manutenção preventiva e proteção contra ameaças. Em um mundo pós-apocalíptico, essa Aptidão é essencial para garantir a sobrevivência, proteger recursos e evitar desastres. Inclui a criação de barreiras físicas, sistemas de alarme, armadilhas e rotinas de segurança para situações cotidianas ou extremas.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "LEIGA", "Não tem conhecimento sobre sistemas ou rotinas de segurança"],
                ["1", "PRECAVIDA", "Conhece noções básicas de segurança, como trancar portas ou evitar áreas perigosas, mas não possui treinamento"],
                ["2", "VIGIA", "Aplica medidas simples de segurança no dia a dia, como criar barreiras rudimentares ou identificar riscos latentes"],
                ["3", "PROTETORA", "Domina técnicas intermediárias, como instalar sistemas de alarme, criar armadilhas e realizar manutenção preventiva básica"],
                ["4", "ESTRATEGISTA", "Capaz de tornar fortalezas impenetráveis, sistemas de defesa infalíveis e protocolos que garantem a sobrevivência em qualquer cenário possível"],
                ["5", "GUARDIÃ", "Capaz de tornar fortalezas impenetráveis, sistemas de defesa infalíveis e protocolos que garantem a sobrevivência em qualquer cenário possível"]
            ]
        }
    },

    //  ====================================================================
    //                               PRÁTICAS
    //  ====================================================================

    practices: {
        title: "Práticas",
        text1: "As Práticas regem as Aptidões desenvolvidas e exercitáveis por treino e/ou prática recorrente. Pode estar relacionado ou não com o uso de objetos e outras ferramentas.",
        table: {
            headers: ["Nível", "Pessoa"],
            rows: [
                ["0", "INÁBIL"],
                ["1", "ENTUSIASTA"],
                ["2", "INICIANTE"],
                ["3", "PRATICANTE"],
                ["4", "PROFISSIONAL"],
                ["5", "EXTRAORDINÁRIA"]
            ]
        }
    },

    armas: {
        title: "Armas",
        text1: "Prática relacionada ao uso eficiente de armas, sejam elas brancas ou de fogo.",
        text2: "Inclui técnicas de combate, precisão, manutenção e adaptação a diferentes tipos de armamento.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "INÁBIL", "Nunca segurou uma arma"],
                ["1", "AFICIONADA", "Sabe segurar uma arma, mas não tem prática ou precisão"],
                ["2", "HABILIDOSA", "Treina regularmente, consegue acertar alvos com alguma precisão"],
                ["3", "DUELISTA", "Utiliza armas com maestria em situações de combate ou caça"],
                ["4", "ARMEIRA", "Especialista reconhecida, capaz de treinar guerreiros e improvisar com diferentes armas"],
                ["5", "VETERANA", "Mestra de armas, com habilidades extraordinárias e precisão infalível"]
            ]
        }
    },

    atletismo: {
        title: "Atletismo",
        text1: "Prática relacionada ao condicionamento físico, incluindo corrida, salto, natação e outras atividades que exigem força, agilidade e resistência.",
        text2: "É essencial para superar obstáculos físicos e manter o corpo em forma.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "INÁBIL", "Não pratica atividades físicas"],
                ["1", "FUNCIONAL", "Realiza atividades físicas ocasionais, sem treino consistente"],
                ["2", "PRATICANTE", "Treina regularmente, mantendo um bom condicionamento físico"],
                ["3", "ATLETA", "Utiliza suas habilidades atléticas para superar desafios"],
                ["4", "ATLETA DE ALTA-PERFORMANCE", "Referência de proeza física na região, capaz de treinar outros atletas"],
                ["5", "IMBATÍVEL", "Dispõe de habilidades físicas que desafiam os limites humanos"]
            ]
        }
    },

    expressao: {
        title: "Expressão",
        text1: "Prática relacionada à comunicação e à arte, incluindo oratória, escrita, música, dança e outras formas de expressão criativa.",
        text2: "É usada para influenciar, emocionar e transmitir ideias.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "INÁBIL", "Não sabe se expressar adequadamente"],
                ["1", "ACANHADA", "Consegue passar a mensagem, mas lhe falta clareza e não passa confiança"],
                ["2", "COMUNICADORA", "Fala bem, tem interações sociais regulares e consegue transmitir emoções"],
                ["3", "PERSUASIVA", "Se expressa de forma eficaz e toca corações com suas palavras e performances"],
                ["4", "ENCANTADORA", "Dramaturga, negociadora ou oradora com grande reputação"],
                ["5", "ÍCONE", "Capacidade de comunicação reconhecida, admirada e recontada"]
            ]
        }
    },

    furtividade: {
        title: "Furtividade",
        text1: "Prática relacionada à capacidade de se mover silenciosamente, passar despercebido, esconder objetos e realizar ações sem chamar atenção.",
        text2: "Inclui técnicas de camuflagem, infiltração, evasão e ocultação de itens em locais estratégicos.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "INÁBIL", "Desastrada e nada sutil"],
                ["1", "DISCRETA", "Já se escondeu como brincadeira na infância"],
                ["2", "CUIDADOSA", "Entende o básico de camuflagem"],
                ["3", "INFILTRADORA", "Tem treinamento em infiltração e ocultação"],
                ["4", "NINJA", "Especialista em infiltração capaz de entrar e sair de quase qualquer lugar sem ser notado"],
                ["5", "FANTASMA", "Quase indetectável, a mestra furtiva evita câmeras, olhares e atenção sem deixar qualquer rastro de sua presença no local"]
            ]
        }
    },

    manufaturas: {
        title: "Manufaturas",
        text1: "Prática relacionada à criação, reparo e modificação de objetos, ferramentas e estruturas.",
        text2: "Inclui habilidades como carpintaria, metalurgia, costura e engenharia prática.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "INÁBIL", "Não possui habilidades manuais"],
                ["1", "COORDENADA", "Consegue enrolar fumo e fazer pequenos reparos"],
                ["2", "PRENDADA", "Pode confeccionar e reparar objetos com eventual desperdício de material"],
                ["3", "ARTESÃ", "Produz itens úteis com qualidade consistente e é econômico com matéria-prima"],
                ["4", "CONSTRUTORA", "O reconhecimento por suas criações a precede"],
                ["5", "INOVADORA", "Criadora de obras-primas como Leonardo da Vinci ou Santos Dumont"]
            ]
        },
        text3: "",
        text4: ""
    },

    sobrevivencia: {
        title: "Sobrevivência",
        text1: "Prática relacionada à capacidade de sobreviver em ambientes hostis.",
        text2: "Inclui técnicas de caça, pesca, construção de abrigos, obtenção de água e fogo, e identificação de perigos naturais.",
        table: {
            headers: ["Valor", "Pessoa", "Descrição"],
            rows: [
                ["0", "INÁBIL", "Não sabe fazer o básico"],
                ["1", "CAMPISTA", "Tem instrução simples e pouca prática"],
                ["2", "ESCOTEIRA", "Sabe se virar em ambientes naturais"],
                ["3", "PATRULHEIRA", "Capaz de guiar um grupo em uma mata fechada"],
                ["4", "MATEIRA", "Se adapta a qualquer ambiente"],
                ["5", "EXPLORADORA", "Domina qualquer ambiente como um nativo"]
            ]
        }
    }

};