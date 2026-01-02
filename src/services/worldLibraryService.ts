/** ============================================================
 * ARQUIVO: src/services/worldLibraryService.ts
 * ============================================================ */

import { supabase } from './supabaseClient';
import type { WorldLibrary, Region, Refuge } from '../interfaces/World';

export const worldLibraryService = {

    // --- BIBLIOTECAS (MEUS MUNDOS) ---

    async getMyLibraries() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('world_libraries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as WorldLibrary[];
    },

    // --- FAVORITOS ---
    async getMyFavorites() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // 1. Favoritos Manuais
        const { data, error } = await supabase
            .from('world_user_favorite_libraries')
            .select('library_id, world_libraries(*)')
            .eq('user_id', user.id);
        
        if (error) {
            console.warn("Erro ao buscar favoritos:", error.message);
            return [];
        }

        // @ts-ignore
        const manualFavorites = data.map(item => item.world_libraries).filter(Boolean);
        
        return manualFavorites as unknown as WorldLibrary[];
    },

    // --- COMUNIDADE (CORRIGIDO IGUAL AO ITEM SERVICE) ---

    async getPublicLibraries() {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Busca: (É público OU É oficial) E (NÃO é meu)
        // Isso evita que meus próprios mundos apareçam duplicados na comunidade
        const { data, error } = await supabase
            .from('world_libraries')
            .select('*') // Se tiver profiles, adicione: '*, profiles(username)'
            .or('is_public.eq.true,is_official.eq.true')
            .neq('user_id', user?.id || '') 
            .order('is_official', { ascending: false }) // Oficiais primeiro
            .order('name', { ascending: true }); // Depois alfabético

        if (error) throw error;
        return data as WorldLibrary[];
    },

    // --- AÇÕES ---

    async toggleFavorite(libraryId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: existing } = await supabase
            .from('world_user_favorite_libraries')
            .select('id')
            .eq('user_id', user.id)
            .eq('library_id', libraryId)
            .single();

        if (existing) {
            await supabase.from('world_user_favorite_libraries').delete().eq('id', existing.id);
            return false;
        } else {
            await supabase.from('world_user_favorite_libraries').insert({ user_id: user.id, library_id: libraryId });
            return true;
        }
    },

    async createLibrary(payload: { name: string; description: string; is_public: boolean }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão inválida.");

        // Seed da Oficial
        const { data: officialLib } = await supabase
            .from('world_libraries')
            .select('settings')
            .eq('is_official', true)
            .single();

        const initialSettings = officialLib?.settings || { biomes: [], archetypes: [], constructions: [] };

        const { data, error } = await supabase.from('world_libraries').insert({
            user_id: user.id,
            name: payload.name,
            description: payload.description,
            is_public: payload.is_public,
            settings: initialSettings
        }).select().single();

        if (error) throw new Error(error.message);
        return data as WorldLibrary;
    },

    async updateLibrary(id: string, updates: Partial<WorldLibrary>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { error } = await supabase
            .from('world_libraries')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id); 

        if (error) throw error;
    },

    async deleteLibrary(id: string) {
        const { error } = await supabase.from('world_libraries').delete().eq('id', id);
        if (error) throw error;
    },

    async cloneLibrary(originalLibId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");

        const { data: sourceLib } = await supabase.from('world_libraries').select('*').eq('id', originalLibId).single();
        if (!sourceLib) throw new Error("Erro ao clonar");

        const { data: newLib } = await supabase.from('world_libraries').insert({
            user_id: user.id,
            name: `${sourceLib.name} (Cópia)`,
            description: sourceLib.description,
            is_public: false,
            is_official: false,
            settings: sourceLib.settings
        }).select().single();

        if(!newLib) throw new Error("Erro ao criar cópia");

        // Copiar Regiões
        const { data: regions } = await supabase.from('world_regions').select('*').eq('library_id', originalLibId);
        if(regions && regions.length > 0) {
            const regs = regions.map(r => ({ ...r, id: undefined, library_id: newLib.id }));
            await supabase.from('world_regions').insert(regs);
        }

        // Copiar Refúgios
        const { data: refuges } = await supabase.from('world_refuges').select('*').eq('library_id', originalLibId);
        if(refuges && refuges.length > 0) {
            const refs = refuges.map(r => ({ ...r, id: undefined, library_id: newLib.id }));
            await supabase.from('world_refuges').insert(refs);
        }

        return newLib;
    },

    // --- SUB-ENTIDADES ---

    async getRegions(libraryId: string) {
        const { data } = await supabase.from('world_regions').select('*').eq('library_id', libraryId).order('name');
        return data as Region[];
    },
    async saveRegion(region: Region) {
        const payload = { ...region };
        const id = payload.id; delete payload.id;
        if(id) await supabase.from('world_regions').update(payload).eq('id', id);
        else await supabase.from('world_regions').insert(payload);
    },
    async deleteRegion(id: string) {
        await supabase.from('world_regions').delete().eq('id', id);
    },
    async getRefuges(libraryId: string) {
        const { data } = await supabase.from('world_refuges').select('*').eq('library_id', libraryId).order('name');
        return data as Refuge[];
    },
    async saveRefuge(refuge: Refuge) {
        const payload = { ...refuge };
        const id = payload.id; delete payload.id;
        if(id) await supabase.from('world_refuges').update(payload).eq('id', id);
        else await supabase.from('world_refuges').insert(payload);
    },
    async deleteRefuge(id: string) {
        await supabase.from('world_refuges').delete().eq('id', id);
    },
    async updateLibrarySettings(libraryId: string, newSettings: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Mantém a trava de segurança SOMENTE para evitar sobrescrever o original
        const { error } = await supabase
            .from('world_libraries')
            .update({ settings: newSettings })
            .eq('id', libraryId)
            .eq('user_id', user.id); 

        if (error) throw error;
    }
};