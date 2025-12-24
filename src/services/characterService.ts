/** ============================================================
 * ARQUIVO: src/services/characterService.ts
 * DESCRIÇÃO: Serviços de personagem
 * ============================================================ */

import { supabase } from './supabaseClient';
import { type Character } from '../interfaces/Gameplay';

export const characterService = {
  
  // 1. LISTAR PERSONAGENS
  async listMyCharacters(): Promise<Character[]> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Character[];
  },

  // 2. BUSCAR UM ÚNICO PERSONAGEM
  async getCharacterById(id: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Character;
  },

  // 3. DELETAR PERSONAGEM
  async deleteCharacter(id: string): Promise<void> {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) throw error;
  },

  // 4. UPLOAD DE AVATAR
  async uploadAvatar(file: File, userId: string): Promise<string> {
    if (file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 2MB.');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('character-avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('character-avatars').getPublicUrl(filePath);
    return data.publicUrl;
  },

  // 5. CRIAR PERSONAGEM (INSERT)
  async createCharacter(charData: Partial<Character>): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .insert([charData])
      .select()
      .single();

    if (error) throw error;
    return data as Character;
  },

  // 6. ATUALIZAR PERSONAGEM (UPDATE)
  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Character;
  },

  // =================================================================
  // 7. POPULAR INVENTÁRIO (ATUALIZADO: KIT + MOCHILA PADRÃO)
  // =================================================================
  async populateInventoryFromKit(characterId: string, kitName: string): Promise<void> {
    // A. Busca a "receita" do kit
    const { data: kitData, error: kitError } = await supabase
      .from('starting_kits')
      .select('items_list')
      .eq('name', kitName)
      .single();

    if (kitError || !kitData) {
      console.error("Erro ao buscar kit:", kitError);
      return; 
    }

    // B. Prepara os itens do KIT (Vão para a MOCHILA)
    const kitItems = (kitData.items_list as any[]).map((item: any) => ({
      character_id: characterId,
      item_id: item.id,     
      quantity: item.qty,   
      location: 'BACKPACK', // Itens do kit ficam guardados
      is_dropped: false,
      is_visible: true
    }));

    // C. Prepara a MOCHILA SIMPLES OBRIGATÓRIA (Vai EQUIPADA)
    const defaultBackpack = {
      character_id: characterId,
      item_id: 'I00034',    // ID Fixo da Mochila Simples
      quantity: 1,
      location: 'EQUIPPED', // Nas costas do personagem
      is_dropped: false,
      is_visible: true
    };

    // D. Junta tudo para inserir de uma vez
    const finalItemsToInsert = [...kitItems, defaultBackpack];

    // E. Executa a inserção
    const { error: insertError } = await supabase
      .from('character_inventory')
      .insert(finalItemsToInsert);

    if (insertError) {
      console.error("Erro ao inserir itens no inventário:", insertError);
      throw new Error("Falha ao entregar os itens iniciais.");
    }
  },

  // 8. BUSCAR CARACTERÍSTICAS POR LISTA DE IDS
  async getCharacteristicsByIds(ids: number[]) {
    if (!ids || ids.length === 0) return [];
    
    const { data, error } = await supabase
      .from('characteristics')
      .select('*')
      .in('id', ids); // Busca apenas os IDs que estão no array

    if (error) throw error;
    return data;
  },

  // 9. BUSCAR ITENS NO INVENTÁRIO DO USUARIO
  async getCharacterInventory(characterId: string) {

        const { data, error } = await supabase
            .from('character_inventory')
            .select(`
                *,
                items (
                    id,
                    name,
                    description,
                    category,
                    slots,
                    traits
                )
            `)
            .eq('character_id', characterId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Mapeamos para ficar 'plano' (flat) facilitando o uso no componente
        return data.map((row: any) => ({
            inventory_id: row.id,
            character_id: row.character_id,
            location: row.location,
            quantity: row.quantity,
            notes: row.notes,
            
            // Dados vindos da tabela 'items' (JOIN)
            item_id: row.items.id,
            name: row.items.name,
            description: row.items.description,
            category: row.items.category,
            slots: row.items.slots || 1, // Garante padrão 1 se nulo
            traits: row.items.traits || {} // Garante objeto vazio se nulo
        }));
    },

    // 10. UPDATE DE INVENTÁRIO
    async updateGenericInventory(inventoryId: string, updates: any) {
        const { error } = await supabase
            .from('character_inventory')
            .update(updates)
            .eq('id', inventoryId);

        if (error) throw error;
    },

    // 11. MOVER ITEM (ATUALIZAR LOCATION)
    async updateItemLocation(inventoryId: string, newLocation: string) {
        const { error } = await supabase
            .from('character_inventory')
            .update({ location: newLocation })
            .eq('id', inventoryId);

        if (error) throw error;
    },

    // 12. BUSCAR TODAS AS CARACTERÍSTICAS (PARA O EDITOR)
  async getAllCharacteristics() {
    const { data, error } = await supabase
      .from('characteristics')
      .select('*')
      .order('name', { ascending: true }); // Ordenar alfabeticamente ajuda na busca

    if (error) throw error;
    return data;
  }
  
};