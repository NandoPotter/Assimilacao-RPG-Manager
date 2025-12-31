// --- MAPAS DE NOMES E REGRAS ---
export const NAME_MAP: { [key: string]: string } = {
    // Instintos
    influencia: 'Influência', percepcao: 'Percepção', potencia: 'Potência',
    reacao: 'Reação', resolucao: 'Resolução', sagacidade: 'Sagacidade',
    // Conhecimentos
    biologia: 'Biologia', erudicao: 'Erudição', engenharia: 'Engenharia',
    geografia: 'Geografia', medicina: 'Medicina', seguranca: 'Segurança',
    // Práticas
    armas: 'Armas', atletismo: 'Atletismo', expressao: 'Expressão',
    furtividade: 'Furtividade', manufaturas: 'Manufaturas', sobrevivencia: 'Sobrevivência',
    
    // Recursos (Sem Símbolos)
    'health.current': 'Ponto de Vida',
    'health.temp': 'Vida Temporária',
    'determination.current': 'Ponto de Determinação',
    'assimilation.current': 'Ponto de Assimilação',
    'item_pressure': 'Ponto de Pressão no Item', // Novo
    
    // Alvos de Efeito
    'success': 'Sucesso',
    'adaptation': 'Adaptação',
    'pressure': 'Pressão'
};

export const RPG_RULES = {
    instincts: ['influencia', 'percepcao', 'potencia', 'reacao', 'resolucao', 'sagacidade'],
    knowledges: ['biologia', 'erudicao', 'engenharia', 'geografia', 'medicina', 'seguranca'],
    practices: ['armas', 'atletismo', 'expressao', 'furtividade', 'manufaturas', 'sobrevivencia'],
    // Adicionado item_pressure na lista de alvos
    targets: ['success', 'adaptation', 'pressure', 'health.current', 'health.temp', 'determination.current', 'assimilation.current', 'item_pressure']
};

export const ITEM_QUALITIES: { [key: number]: { label: string, desc: string, bonus: string } } = {
    0: { label: "Nível 0 (Quebrado)", desc: "Inutilizado. O equipamento não pode ser usado.", bonus: "Nenhum" },
    1: { label: "Nível 1 (Defeituoso)", desc: "Frágil. Com 1 pressão investida, cai de nível (quebra).", bonus: "Nenhum" },
    2: { label: "Nível 2 (Comprometido)", desc: "Instável. Precisa de 2 pressões investidas para cair de nível.", bonus: "Nenhum" },
    3: { label: "Nível 3 (Padrão)", desc: "Comum. Precisa de 3 pressões investidas para cair de nível.", bonus: "Nenhum" },
    4: { label: "Nível 4 (Reforçado)", desc: "Robusto. Precisa de 4 pressões investidas para cair de nível.", bonus: "+1 Sucesso (1x por sessão)" },
    5: { label: "Nível 5 (Superior)", desc: "Excelente. Precisa de 5 pressões investidas para cair de nível.", bonus: "+1 Sucesso (até 2x por sessão)" },
    6: { label: "Nível 6 (Obra-Prima)", desc: "Lendário. Precisa de 6 pressões investidas para cair de nível.", bonus: "+1 Sucesso (até 3x por sessão)" }
};

export const generateId = () => Math.random().toString(36).substr(2, 9);