/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/contents/CharacterSheet/components/AssimilationsTab.tsx
 * DESCRIÇÃO: Aba de Assimilações - Versão Simplificada para Deploy
 * ========================================================================================= */

interface Props {
    characterId: string;
}

function AssimilationsTab({ characterId }: Props) {
    // Usamos o characterId no log apenas para o TypeScript não reclamar que a variável está ociosa
    console.log("Aba de assimilações preparada para o personagem:", characterId);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignSelf: 'center',
            padding: '40px',
            color: 'rgba(255,255,255,0.5)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            width: '100%',
            textAlign: 'center'
        }}>
            ~ assimilações em breve ~
        </div>
    );
}

export default AssimilationsTab;