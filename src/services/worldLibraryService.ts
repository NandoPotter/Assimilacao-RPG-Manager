/** ============================================================
 * ARQUIVO: src/services/worldLibraryService.ts
 * DESCRIÇÃO: API para gestão de Regiões, Refúgios e Bibliotecas
 * ============================================================ */

import { supabase } from './supabaseClient';
import type { WorldLibrary, Region, Refuge } from '../interfaces/World';

export const worldLibraryService = {

    // --- BIBLIOTECAS (CRUD BÁSICO) ---

    async getMyLibraries() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");

        const { data, error } = await supabase
            .from('world_libraries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as WorldLibrary[];
    },

    // LÓGICA DE CRIAÇÃO (COM SEED DA OFICIAL)
    async createLibrary(payload: { name: string; description: string; is_public: boolean }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão inválida.");

        // 1. Busca as configurações da Biblioteca Oficial (Seed)
        const { data: officialLib } = await supabase
            .from('world_libraries')
            .select('settings')
            .eq('is_official', true)
            .single();

        // Se não achar a oficial (banco vazio), usa um fallback vazio
        const initialSettings = officialLib?.settings || { biomes: [], archetypes: [], constructions: [] };

        // 2. Cria a nova biblioteca injetando as configurações oficiais
        const { data, error } = await supabase
            .from('world_libraries')
            .insert({
                user_id: user.id,
                name: payload.name,
                description: payload.description,
                is_public: payload.is_public,
                settings: initialSettings
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as WorldLibrary;
    },

    async updateLibrary(id: string, updates: Partial<WorldLibrary>) {
        const { error } = await supabase.from('world_libraries').update(updates).eq('id', id);
        if (error) throw error;
    },

    async deleteLibrary(id: string) {
        // Nota: O Supabase deve ter "ON DELETE CASCADE" configurado nas tabelas filhas (regions/refuges)
        // Se não tiver, precisaria deletar as filhas manualmente aqui antes.
        const { error } = await supabase.from('world_libraries').delete().eq('id', id);
        if (error) throw error;
    },

    // --- COMUNIDADE & FAVORITOS (MÉTODOS NOVOS) ---

    async getPublicLibraries() {
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
            .from('world_libraries')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        // Opcional: Excluir as do próprio usuário da lista pública para não duplicar visualmente
        if (user) {
            query = query.neq('user_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as WorldLibrary[];
    },

    async getMyFavorites() {
        // Se você tiver uma tabela 'world_library_favorites', use a lógica de JOIN.
        // Se não, vamos retornar apenas as bibliotecas OFICIAIS do sistema como "Favoritos Padrão".
        
        const { data, error } = await supabase
            .from('world_libraries')
            .select('*')
            .eq('is_official', true)
            .order('name');

        if (error) throw error;
        return data as WorldLibrary[];
    },

    // --- CLONAGEM (Deep Copy) ---
    async cloneLibrary(originalLibId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");

        // 1. Buscar a biblioteca original
        const { data: sourceLib, error: libError } = await supabase
            .from('world_libraries')
            .select('*')
            .eq('id', originalLibId)
            .single();

        if (libError || !sourceLib) throw new Error("Biblioteca original não encontrada.");

        // 2. Criar a Cópia da Biblioteca
        const { data: newLib, error: createError } = await supabase
            .from('world_libraries')
            .insert({
                user_id: user.id,
                name: `${sourceLib.name} (Cópia)`,
                description: sourceLib.description,
                is_public: false, // Cópias nascem privadas
                is_official: false, // Cópias nunca são oficiais
                settings: sourceLib.settings // Copia as configurações (biomas, etc)
            })
            .select()
            .single();

        if (createError || !newLib) throw createError;

        // 3. Buscar e Copiar Regiões
        const { data: sourceRegions } = await supabase
            .from('world_regions')
            .select('*')
            .eq('library_id', originalLibId);

        if (sourceRegions && sourceRegions.length > 0) {
            const regionsPayload = sourceRegions.map(reg => ({
                library_id: newLib.id, // Link com a nova lib
                name: reg.name,
                biome: reg.biome,
                stats: reg.stats,
                descriptions: reg.descriptions,
                details: reg.details
            }));
            await supabase.from('world_regions').insert(regionsPayload);
        }

        // 4. Buscar e Copiar Refúgios
        const { data: sourceRefuges } = await supabase
            .from('world_refuges')
            .select('*')
            .eq('library_id', originalLibId);

        if (sourceRefuges && sourceRefuges.length > 0) {
            const refugesPayload = sourceRefuges.map(ref => ({
                library_id: newLib.id, // Link com a nova lib
                name: ref.name,
                type: ref.type,
                archetype: ref.archetype,
                stats: ref.stats,
                descriptions: ref.descriptions,
                assets: ref.assets
            }));
            await supabase.from('world_refuges').insert(refugesPayload);
        }

        return newLib;
    },

    // --- REGIÕES ---

    async getRegions(libraryId: string) {
        const { data, error } = await supabase
            .from('world_regions')
            .select('*')
            .eq('library_id', libraryId)
            .order('name');
        
        if (error) throw error;
        return data as Region[];
    },

    async saveRegion(region: Region) {
        const payload = { ...region };
        const regionId = payload.id;
        delete payload.id; 

        if (regionId) {
            const { data, error } = await supabase.from('world_regions').update(payload).eq('id', regionId).select().single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.from('world_regions').insert([payload]).select().single();
            if (error) throw error;
            return data;
        }
    },

    async deleteRegion(id: string) {
        const { error } = await supabase.from('world_regions').delete().eq('id', id);
        if (error) throw error;
    },

    // --- REFÚGIOS ---

    async getRefuges(libraryId: string) {
        const { data, error } = await supabase
            .from('world_refuges')
            .select('*')
            .eq('library_id', libraryId)
            .order('name');
        
        if (error) throw error;
        return data as Refuge[];
    },

    async saveRefuge(refuge: Refuge) {
        const payload = { ...refuge };
        const refugeId = payload.id;
        delete payload.id;

        if (refugeId) {
            const { data, error } = await supabase.from('world_refuges').update(payload).eq('id', refugeId).select().single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.from('world_refuges').insert([payload]).select().single();
            if (error) throw error;
            return data;
        }
    },

    async deleteRefuge(id: string) {
        const { error } = await supabase.from('world_refuges').delete().eq('id', id);
        if (error) throw error;
    },
    
    // --- MÉTODOS AUXILIARES ---
    
    async updateLibrarySettings(libraryId: string, newSettings: any) {
        const { error } = await supabase
            .from('world_libraries')
            .update({ settings: newSettings })
            .eq('id', libraryId);
            
        if (error) throw error;
    }
};