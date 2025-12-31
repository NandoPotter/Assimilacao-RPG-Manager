/** ============================================================
 * ARQUIVO: src/services/itemLibraryService.ts
 * DESCRIÇÃO: Serviço unificado para Itens e Características
 * ============================================================ */

import { supabase } from './supabaseClient';

// =============================================================
// 1. INTERFACES DE MECÂNICA (A Lógica Complexa das Traits)
// =============================================================

export interface TraitEffect {
    id: string;
    
    // --- GATILHOS / TESTES ---
    trigger_type: 'instinct' | 'knowledge' | 'practice' | 'specific_roll' | 'always'; 
    trigger_val_1: string; 
    trigger_val_2?: string; 
    
    // --- AÇÃO / CONSEQUÊNCIA ---
    action: 'add' | 'remove' | 'convert' | 'none'; 
    
    // --- VALORES ---
    source_qty?: number;
    source_resource?: string;
    target_qty: number;
    target_resource: string;
    
    // --- CONFIGURAÇÕES ---
    is_mandatory: boolean; 
    
    // Configurações de Consequência (Filhos)
    negate_main_effect_on_failure?: boolean; 
    apply_on_first_use?: boolean; 
    risk_condition?: 'always' | 'conflict' | 'non_conflict'; 

    // Dificuldade (Individual)
    difficulty_mode?: 'fixed' | 'increasing'; 
    difficulty_target?: number; 
    difficulty_resource?: string; 

    // Container de Penalidade (Apenas no Pai)
    penalty?: {
        enabled: boolean;
        description?: string; 
        consequences: TraitEffect[]; 
    };
}

export interface TraitCooldown {
    type: 'unlimited' | '1_session' | '1_day' | '1_scene';
}

// =============================================================
// 2. INTERFACES DE DADOS (O Formato do Banco)
// =============================================================

export interface ItemLibrary {
    id: string;
    user_id: string;
    name: string;
    description: string;
    is_public: boolean;
    is_official: boolean;
    created_at: string;
    profiles?: { username: string };
}

export interface ItemTrait {
    id?: string;
    library_id: string;
    name: string;
    description: string;
    cost: number;
    // Aqui usamos a tipagem forte que definimos acima
    mechanics: {
        effects: TraitEffect[];
        cooldown: TraitCooldown;
    };
    created_by?: string;
}

export interface Item {
    id?: string;
    library_id: string;
    name: string;
    description: string;
    slots: number;
    category: string;
    charges?: number;
    quality?: number;
    // O Item salva apenas uma referência leve (ID e Nome) das Traits
    traits: { id: string; name: string }[]; 
    created_by?: string;
}

export interface StartingKit {
    id?: string;
    library_id: string;
    name: string;
    description: string;
    items_data?: any;
}

// =============================================================
// 3. SERVIÇO PRINCIPAL
// =============================================================

export const itemLibraryService = {

    // --- BIBLIOTECAS ---

    async getMyLibraries() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");
        
        const { data, error } = await supabase
            .from('item_libraries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data as ItemLibrary[];
    },

    async getPublicLibraries() {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('item_libraries')
            .select('*, profiles(username)')
            .or(`is_public.eq.true,is_official.eq.true`)
            .neq('user_id', user?.id || '')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createLibrary(library: Partial<ItemLibrary>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão inválida.");
        
        const { data, error } = await supabase.rpc('create_library_clone', {
            new_lib_name: library.name?.trim(),
            new_lib_desc: library.description || '',
            is_lib_public: !!library.is_public,
            owner_id: user.id
        });

        if (error) throw new Error(`Falha ao criar depósito: ${error.message}`);
        
        const { data: newLib } = await supabase.from('item_libraries').select('*').eq('id', data.id).single();
        return newLib as ItemLibrary;
    },

    async updateLibrary(id: string, updates: Partial<ItemLibrary>) {
        const { error } = await supabase.from('item_libraries').update(updates).eq('id', id);
        if (error) throw error;
    },

    async deleteLibrary(id: string) {
        const { error } = await supabase.from('item_libraries').delete().eq('id', id);
        if (error) throw error;
    },

    // --- FAVORITOS (Mantidos simplificados) ---
    async getMyFavorites() {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase.from('user_favorite_items_libraries').select('library:item_libraries(*)').eq('user_id', user?.id);
        return data?.map((e: any) => e.library) as ItemLibrary[] || [];
    },
    async toggleFavorite(libraryId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return false;
        const { data: ex } = await supabase.from('user_favorite_items_libraries').select('id').eq('user_id', user.id).eq('library_id', libraryId).single();
        if (ex) { await supabase.from('user_favorite_items_libraries').delete().eq('id', ex.id); return false; }
        else { await supabase.from('user_favorite_items_libraries').insert([{ user_id: user.id, library_id: libraryId }]); return true; }
    },
    async getFavoriteIds() {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase.from('user_favorite_items_libraries').select('library_id').eq('user_id', user?.id);
        return data?.map(d => d.library_id) || [];
    },

    // --- ITENS (AQUI ESTAVA O FOCO DA SUA DÚVIDA) ---

    async getItemsByLibrary(libraryId: string) {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('library_id', libraryId)
            .order('name', { ascending: true });
            
        if (error) throw error;
        return data as Item[];
    },

    async createItem(item: Item) {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Prepara o objeto para o banco
        // IMPORTANTE: traits é um array JSONB simples aqui
        const payload = { 
            library_id: item.library_id,
            name: item.name,
            description: item.description,
            slots: item.slots,
            category: item.category,
            charges: item.charges,
            quality: item.quality,
            traits: item.traits || [], // Garante que não vá null
            created_by: user?.id 
        };

        const { data, error } = await supabase.from('items').insert([payload]).select().single();
        if (error) throw error;
        return data;
    },

    async updateItem(id: string, updates: Partial<Item>) {
        const { error } = await supabase.from('items').update(updates).eq('id', id);
        if (error) throw error;
    },

    async deleteItem(id: string) {
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) throw error;
    },

    // --- CARACTERÍSTICAS (TRAITS) - COM A LÓGICA COMPLEXA ---

    async getTraitsByLibrary(libId: string) {
        const { data, error } = await supabase
            .from('item_traits')
            .select('*')
            .eq('library_id', libId)
            .order('name', { ascending: true });
            
        if (error) throw error;
        
        // Converte o JSON do banco para a Interface Tipada
        return data.map((t: any) => ({
            ...t,
            mechanics: t.automation_config || { 
                effects: [], 
                cooldown: { type: 'unlimited' } 
            }
        })) as ItemTrait[];
    },

    async saveTrait(trait: ItemTrait) {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Converte a Interface Tipada para JSON do banco
        const payload: any = { 
            name: trait.name,
            description: trait.description,
            cost: trait.cost || 0,
            library_id: trait.library_id,
            automation_config: trait.mechanics, 
            created_by: user?.id 
        };
        
        if (!trait.id) {
            const { data, error } = await supabase.from('item_traits').insert([payload]).select().single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.from('item_traits').update(payload).eq('id', trait.id).select().single();
            if (error) throw error;
            return data;
        }
    },

    async deleteTrait(id: string) {
        const { error } = await supabase.from('item_traits').delete().eq('id', id);
        if (error) throw error;
    },

    // --- KITS ---

    async getKitsByLibrary(libId: string) {
        const { data, error } = await supabase
            .from('starting_kits')
            .select('*')
            .eq('library_id', libId)
            .order('name', { ascending: true });
            
        if (error) throw error;
        return data as StartingKit[];
    }
};