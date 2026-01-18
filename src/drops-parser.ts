export interface DropItem {
  itemId: number;
  min: number;
  max: number;
  percentage: number;
}

export interface NpcDrops {
  npcId: number;
  drops: DropItem[];
}

export class DropsParser {
  static parse(content: string): Map<number, DropItem[]> {
    const drops = new Map<number, DropItem[]>();
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse line format: npc_id = item_id,min,max,percentage, ...
      const parts = trimmed.split('=');
      if (parts.length !== 2) {
        continue;
      }

      const npcId = parseInt(parts[0].trim());
      if (isNaN(npcId)) {
        continue;
      }

      const dropItems: DropItem[] = [];
      const itemsStr = parts[1].trim();
      const itemParts = itemsStr.split(',').map(s => s.trim());

      // Parse items in groups of 4 (itemId, min, max, percentage)
      for (let i = 0; i < itemParts.length; i += 4) {
        if (i + 3 >= itemParts.length) {
          break;
        }

        const itemId = parseInt(itemParts[i]);
        const min = parseInt(itemParts[i + 1]);
        const max = parseInt(itemParts[i + 2]);
        const percentage = parseFloat(itemParts[i + 3]);

        if (!isNaN(itemId) && !isNaN(min) && !isNaN(max) && !isNaN(percentage)) {
          dropItems.push({ itemId, min, max, percentage });
        }
      }

      if (dropItems.length > 0) {
        drops.set(npcId, dropItems);
      }
    }

    return drops;
  }

  static serialize(dropsData: Map<number, DropItem[]>): string {
    let content = '# NPC Drop Table Configuration\n';
    content += '# Format: npc_id = item_id,min,max,percentage, item_id,min,max,percentage, ...\n';
    content += '# Percentage is 0-100 (supports decimals like 0.5)\n\n';

    const sortedNpcIds = Array.from(dropsData.keys()).sort((a, b) => a - b);

    for (const npcId of sortedNpcIds) {
      const drops = dropsData.get(npcId);
      if (!drops || drops.length === 0) {
        continue;
      }

      const dropStrs = drops.map(d => `${d.itemId},${d.min},${d.max},${d.percentage}`);
      content += `${npcId} = ${dropStrs.join(', ')}\n`;
    }

    return content;
  }
}
