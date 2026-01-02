/** ============================================================
 * ARQUIVO: src/interfaces/World.ts
 * DESCRIÇÃO: Tipagem estrita para o módulo de Gestão de Mundo
 * ============================================================ */

// --- CONFIGURAÇÕES DA BIBLIOTECA (O JSON clonado) ---

export interface WorldBiome {
    name: string;
    description: string;
}

export interface RefugeArchetype {
    type: 'community' | 'group';
    name: string;
    description: string;
    // Futuro: default_stats?: Partial<RefugeStats>;
}

export interface WorldConstruction {
    name: string;
    effect: string;
    cost?: string;
    notes?: string;
}

export interface WorldSettings {
    biomes: WorldBiome[];
    archetypes: RefugeArchetype[];
    constructions: WorldConstruction[];
    // Futuro: resource_types: string[];
}

// --- ENTIDADES PRINCIPAIS ---

export interface WorldLibrary {
    id: string;
    user_id: string;
    name: string;
    description: string;
    is_public: boolean;
    is_official: boolean;
    settings: WorldSettings; // Aqui vivem as regras customizáveis deste mundo
    created_at: string;
    profiles?: { username: string }; // Join com perfil do usuário
}

// --- REGIÕES ---

export interface RegionStats {
    size: number;          // 0-6
    danger: number;        // 0-6
    habitation: number;    // 0-6 (Max <= Size)
    resources_level: number; // 0-6
    contamination: number; // 0-6
    displacement: number;  // 0-6
}

export interface Region {
    id?: string;
    library_id: string;
    name: string;
    biome: string; // Deve bater com WorldSettings.biomes
    stats: RegionStats;
    
    // Descrições narrativas para cada nível de estatística
    descriptions: {
        size?: string;
        danger?: string;
        habitation?: string;
        resources?: string;
        contamination?: string;
        displacement?: string;
        general?: string;
    };
    
    details: {
        resource_types_found: string[];
        adventure_hooks: string;
        landmarks: {
            name: string;
            description: string;
            is_visible?: boolean;
        }[];
    };
}

// --- REFÚGIOS (COMUNIDADES E GRUPOS) ---

export interface RefugeStats {
    population: { current: number; max: number };
    reserves: { current: number; max: number };
    mobility: number;    // 0-6
    defense: number;     // 0-6
    morale: number;      // 0-6
    belligerence: number;// 0-6
}

export interface Refuge {
    id?: string;
    library_id: string;
    name: string;
    type: 'community' | 'group';
    archetype: string; // Deve bater com WorldSettings.archetypes
    
    stats: RefugeStats;
    
    // Descrições narrativas para as estatísticas
    descriptions: {
        population?: string;
        reserves?: string;
        mobility?: string;
        defense?: string;
        morale?: string;
        belligerence?: string;
        general?: string;
    };
    
    assets: {
        constructions: { name: string; notes?: string }[];
        // Estoque detalhado (opcional, ou simplificado)
        stock: Record<string, number>; 
    };
}