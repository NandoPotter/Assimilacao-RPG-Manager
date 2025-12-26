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

  // 5. CRIAR PERSONAGEM
  async createCharacter(charData: Partial<Character>): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .insert([charData])
      .select()
      .single();

    if (error) throw error;
    return data as Character;
  },

  // 6. ATUALIZAR PERSONAGEM
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

  // 7. BUSCAR CARACTERÍSTICAS POR LISTA DE IDS
  async getCharacteristicsByIds(ids: number[]) {
    if (!ids || ids.length === 0) return [];
    
    const { data, error } = await supabase
      .from('characteristics')
      .select('*')
      .in('id', ids); 

    if (error) throw error;
    return data;
  },

  // 8. BUSCAR TODAS AS CARACTERÍSTICAS (PARA O EDITOR)
  async getAllCharacteristics() {
      const { data, error } = await supabase
      .from('characteristics')
      .select('*')
      .order('name', { ascending: true });

      if (error) throw error;
      return data;
  },

  // =================================================================
  //  FUNÇÕES DE INVENTÁRIO (CORE)
  // =================================================================

  // 8. POPULAR INVENTÁRIO (KITS INICIAIS)
  async populateInventoryFromKit(characterId: string, kitName: string): Promise<void> {
    const { data: kitData, error: kitError } = await supabase
      .from('starting_kits')
      .select('items_list')
      .eq('name', kitName)
      .single();

    if (kitError || !kitData) {
      console.error("Erro ao buscar kit:", kitError);
      return; 
    }

    const kitItems = (kitData.items_list as any[]).map((item: any) => ({
      character_id: characterId,
      item_id: item.id,     
      quantity: item.qty,   
      location: 'BACKPACK',
      is_dropped: false,
      is_visible: true
    }));

    const defaultBackpack = {
      character_id: characterId,
      item_id: 'I00034',    // ID Mochila Simples
      quantity: 1,
      location: 'EQUIPPED',
      is_dropped: false,
      is_visible: true
    };

    const finalItemsToInsert = [...kitItems, defaultBackpack];

    const { error: insertError } = await supabase
      .from('character_inventory')
      .insert(finalItemsToInsert);

    if (insertError) {
      console.error("Erro ao inserir itens:", insertError);
      throw new Error("Falha ao entregar os itens iniciais.");
    }
  },

  // 9. BUSCAR INVENTÁRIO DO PERSONAGEM
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

    return data.map((row: any) => ({
      inventory_id: row.id,
      character_id: row.character_id,
      location: row.location,
      quantity: row.quantity,
      notes: row.notes,
      is_dropped: row.is_dropped, 
      is_visible: row.is_visible,
      
      item_id: row.items.id,
      name: row.items.name,
      description: row.items.description,
      category: row.items.category,
      slots: row.items.slots || 1, 
      traits: row.items.traits || {} 
    }));
  },

  // 10. UPDATE GENÉRICO (STATUS, VISIBILIDADE)
  async updateGenericInventory(inventoryId: string, updates: any) {
    const { error } = await supabase
      .from('character_inventory')
      .update(updates)
      .eq('id', inventoryId);

    if (error) throw error;
  },

  // 11. MOVER ITEM SIMPLES (LEGADO - PREFERIR TRANSFERITEM)
  async updateItemLocation(inventoryId: string, newLocation: string) {
    const { error } = await supabase
      .from('character_inventory')
      .update({ location: newLocation })
      .eq('id', inventoryId);

    if (error) throw error;
  },

  // 12. TRANSFERÊNCIA INTELIGENTE (MOVE + SPLIT + STACK)
  async transferItem(
    inventoryId: string, 
    qtyToMove: number, 
    targetLocation: string
  ): Promise<void> {
    
    // A. Busca Origem
    const { data: sourceItem, error: sourceError } = await supabase
      .from('character_inventory')
      .select('*')
      .eq('id', inventoryId)
      .single();

    if (sourceError || !sourceItem) throw new Error("Item de origem não encontrado.");
    if (sourceItem.quantity < qtyToMove) throw new Error("Quantidade insuficiente.");

    // B. Busca Destino (Para empilhar)
    const { data: existingStack } = await supabase
      .from('character_inventory')
      .select('*')
      .eq('character_id', sourceItem.character_id)
      .eq('item_id', sourceItem.item_id)
      .eq('location', targetLocation)
      .eq('is_dropped', false) 
      .maybeSingle();

    // C. CENÁRIO 1: EMPILHAR (MERGE)
    if (existingStack) {
      // Soma no destino
      const newStackQty = existingStack.quantity + qtyToMove;
      const { error: updateStackError } = await supabase
        .from('character_inventory')
        .update({ quantity: newStackQty })
        .eq('id', existingStack.id);
      
      if (updateStackError) throw updateStackError;

      // Subtrai ou Deleta da Origem
      if (sourceItem.quantity === qtyToMove) {
        await supabase.from('character_inventory').delete().eq('id', inventoryId);
      } else {
        await supabase
          .from('character_inventory')
          .update({ quantity: sourceItem.quantity - qtyToMove })
          .eq('id', inventoryId);
      }
    } 
    // D. CENÁRIO 2: MOVER/CRIAR NOVO (MOVE/SPLIT)
    else {
      // Mover Tudo
      if (sourceItem.quantity === qtyToMove) {
        const { error: moveError } = await supabase
          .from('character_inventory')
          .update({ location: targetLocation })
          .eq('id', inventoryId);
        
        if (moveError) throw moveError;
      } 
      // Mover Parcial (Split)
      else {
        // Reduz origem
        await supabase
          .from('character_inventory')
          .update({ quantity: sourceItem.quantity - qtyToMove })
          .eq('id', inventoryId);

        // Cria novo
        const newItemData = {
          character_id: sourceItem.character_id,
          item_id: sourceItem.item_id,
          quantity: qtyToMove,
          location: targetLocation,
          is_dropped: false,
          is_visible: true,
          notes: sourceItem.notes
        };

        const { error: insertError } = await supabase
          .from('character_inventory')
          .insert([newItemData]);
        
        if (insertError) throw insertError;
      }
    }
  }

};