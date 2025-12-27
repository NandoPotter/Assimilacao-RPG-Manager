/** ============================================================
 * ARQUIVO: src/services/itemLibraryService.ts
 * DESCRIÇÃO: Gestão de Bibliotecas de Itens e Itens
 * ============================================================ */

import { supabase } from './supabaseClient';

export interface ItemLibrary {
    id: string;
    user_id: string;
    name: string;
    description: string;
    is_public: boolean;
    is_official: boolean;
    created_at: string;
}

export interface Item {
    id?: string;
    library_id: string;
    name: string;
    description: string;
    slots: number;
    category: string;
    traits: any; // JSONB
    created_by?: string;
}

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
        // Busca oficiais OU públicas que não sejam minhas (para não duplicar na visualização)
        const { data, error } = await supabase
            .from('item_libraries')
            .select('*, profiles(username)') // Se quiser mostrar o autor
            .or(`is_public.eq.true,is_official.eq.true`)
            .neq('user_id', user?.id || '') 
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createLibrary(library: Partial<ItemLibrary>) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error("ERRO: Tentativa de criar biblioteca sem usuário logado.");
            throw new Error("Usuário não logado");
        }

        // --- DEBUG LOG (Pode remover depois de funcionar) ---
        console.log("Enviando para o Supabase:", {
            ...library,
            user_id: user.id // Verifique no console se este ID aparece corretamente
        });
        // ----------------------------------------------------

        const { data, error } = await supabase
            .from('item_libraries')
            .insert([{ ...library, user_id: user.id }])
            .select()
            .single();

        if (error) {
            console.error("Erro Supabase:", error); // Isso vai mostrar o detalhe do 403 se persistir
            throw error;
        }
        return data as ItemLibrary;
    },

    async updateLibrary(id: string, updates: Partial<ItemLibrary>) {
        const { error } = await supabase
            .from('item_libraries')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteLibrary(id: string) {
        const { error } = await supabase
            .from('item_libraries')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- ITENS ---

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
        
        // Remove ID se vier vazio para o banco gerar
        const payload = { ...item, created_by: user?.id };
        if (!payload.id) delete payload.id; 

        const { data, error } = await supabase
            .from('items')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateItem(id: string, updates: Partial<Item>) {
        const { error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    async deleteItem(id: string) {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};