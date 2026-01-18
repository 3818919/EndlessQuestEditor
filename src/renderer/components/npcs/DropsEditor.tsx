import React, { useState } from 'react';
import { DropItem } from '../../../drops-parser';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface DropsEditorProps {
  npcId: number;
  drops: DropItem[];
  onUpdateDrops: (npcId: number, drops: DropItem[]) => void;
  items: Record<number, any>;
  onNavigateToItem?: (itemId: number) => void;
}

const DropsEditor: React.FC<DropsEditorProps> = ({ npcId, drops, onUpdateDrops, items, onNavigateToItem }) => {
  const [editingDrops, setEditingDrops] = useState<DropItem[]>(drops);

  const handleAddDrop = () => {
    const newDrop: DropItem = {
      itemId: 1,
      min: 1,
      max: 1,
      percentage: 10
    };
    const updated = [...editingDrops, newDrop];
    setEditingDrops(updated);
    onUpdateDrops(npcId, updated);
  };

  const handleRemoveDrop = (index: number) => {
    const updated = editingDrops.filter((_, i) => i !== index);
    setEditingDrops(updated);
    onUpdateDrops(npcId, updated);
  };

  const handleUpdateDrop = (index: number, field: keyof DropItem, value: number) => {
    const updated = [...editingDrops];
    updated[index] = { ...updated[index], [field]: value };
    setEditingDrops(updated);
    onUpdateDrops(npcId, updated);
  };

  // Keep local state in sync with props
  React.useEffect(() => {
    setEditingDrops(drops);
  }, [drops, npcId]);

  return (
    <div className="drops-editor">
      <div className="drops-header">
        <h4>Drop Table</h4>
        <button className="btn btn-small btn-success" onClick={handleAddDrop}>
          + Add Drop
        </button>
      </div>

      <div className="drops-list">
        {editingDrops.length === 0 && (
          <p className="empty-message">No drops configured. Click &quot;Add Drop&quot; to start.</p>
        )}

        {editingDrops.map((drop, index) => {
          const item = items[drop.itemId];
          const itemName = item ? item.name : `Unknown (${drop.itemId})`;

          return (
            <div key={index} className="drop-item">
              <div className="drop-item-header">
                <span className="drop-item-name">{itemName}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {onNavigateToItem && (
                    <button
                      className="btn btn-small"
                      onClick={() => onNavigateToItem(drop.itemId)}
                      title="View item in Items tab"
                    >
                      <OpenInNewIcon style={{ fontSize: '14px' }} />
                    </button>
                  )}
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleRemoveDrop(index)}
                    title="Remove drop"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="drop-item-fields">
                <div className="form-group form-group-inline">
                  <label>Item ID</label>
                  <input
                    type="number"
                    value={drop.itemId}
                    onChange={(e) => handleUpdateDrop(index, 'itemId', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                  />
                </div>

                <div className="form-group form-group-inline">
                  <label>Min</label>
                  <input
                    type="number"
                    value={drop.min}
                    onChange={(e) => handleUpdateDrop(index, 'min', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                  />
                </div>

                <div className="form-group form-group-inline">
                  <label>Max</label>
                  <input
                    type="number"
                    value={drop.max}
                    onChange={(e) => handleUpdateDrop(index, 'max', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                  />
                </div>

                <div className="form-group form-group-inline">
                  <label>Drop %</label>
                  <input
                    type="number"
                    value={drop.percentage}
                    onChange={(e) => handleUpdateDrop(index, 'percentage', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropsEditor;
