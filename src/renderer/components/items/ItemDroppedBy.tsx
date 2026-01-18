import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface DropInfo {
  npcId: number;
  npcName: string;
  min: number;
  max: number;
  percentage: number;
}

interface ItemDroppedByProps {
  itemId: number;
  dropsData: Map<number, any[]>;
  npcs: Record<number, any>;
  onNavigateToNpc: (npcId: number) => void;
  onAddToNpcDrops: (npcId: number) => void;
}

const ItemDroppedBy: React.FC<ItemDroppedByProps> = ({
  itemId,
  dropsData,
  npcs,
  onNavigateToNpc,
  onAddToNpcDrops
}) => {
  // Find all NPCs that drop this item
  const npcsThatDropItem: DropInfo[] = [];
  
  console.log('ItemDroppedBy - itemId:', itemId);
  console.log('ItemDroppedBy - dropsData:', dropsData);
  console.log('ItemDroppedBy - dropsData size:', dropsData.size);
  console.log('ItemDroppedBy - npcs count:', Object.keys(npcs).length);
  
  dropsData.forEach((drops, npcId) => {
    const itemDrop = drops.find(d => d.itemId === itemId);
    if (itemDrop) {
      const npc = npcs[npcId];
      npcsThatDropItem.push({
        npcId,
        npcName: npc ? npc.name : `Unknown NPC #${npcId}`,
        min: itemDrop.min,
        max: itemDrop.max,
        percentage: itemDrop.percentage
      });
    }
  });
  
  console.log('ItemDroppedBy - npcsThatDropItem:', npcsThatDropItem);

  return (
    <div className="item-dropped-by">
      <div className="dropped-by-header">
        <h4>Dropped By</h4>
      </div>

      <div className="dropped-by-list">
        {npcsThatDropItem.length === 0 ? (
          <p className="empty-message">This item is not dropped by any NPCs.</p>
        ) : (
          npcsThatDropItem.map((drop) => (
            <div key={drop.npcId} className="dropped-by-item">
              <div className="dropped-by-item-header">
                <span className="dropped-by-item-name">{drop.npcName}</span>
                <button
                  className="btn btn-small"
                  onClick={() => onNavigateToNpc(drop.npcId)}
                  title="View NPC in NPCs tab"
                >
                  <OpenInNewIcon style={{ fontSize: '14px' }} />
                </button>
              </div>
              <div className="dropped-by-item-info">
                <span>Amount: {drop.min}-{drop.max}</span>
                <span>Drop Rate: {drop.percentage}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="dropped-by-footer">
        <p className="text-muted" style={{ fontSize: '11px', marginBottom: '10px' }}>
          Add this item to an NPC&apos;s drop table:
        </p>
        <select
          className="form-input"
          onChange={(e) => {
            const npcId = parseInt(e.target.value);
            if (!isNaN(npcId)) {
              onAddToNpcDrops(npcId);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Select NPC...</option>
          {Object.values(npcs)
            .sort((a: any, b: any) => a.id - b.id)
            .map((npc: any) => (
              <option key={npc.id} value={npc.id}>
                #{npc.id} - {npc.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default ItemDroppedBy;
