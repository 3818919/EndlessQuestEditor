/**
 * EIF (Endless Item File) Parser
 * Simplified wrapper around eolib
 */

import { Eif, EifRecord, EoReader, EoWriter } from 'eolib';

/**
 * Convert eolib EifRecord to application format
 * Maps eolib field names to application field names for consistency with JSON serialization
 */
function convertEifRecord(eifRecord: EifRecord, id: number) {
  return {
    id,
    name: eifRecord.name || '',
    graphic: eifRecord.graphicId || 0,
    type: eifRecord.type || 0,
    subType: eifRecord.subtype || 0,
    special: eifRecord.special || 0,
    hp: eifRecord.hp || 0,
    tp: eifRecord.tp || 0,
    minDamage: eifRecord.minDamage || 0,
    maxDamage: eifRecord.maxDamage || 0,
    accuracy: eifRecord.accuracy || 0,
    evade: eifRecord.evade || 0,
    armor: eifRecord.armor || 0,
    str: eifRecord.str || 0,
    int: eifRecord.intl || 0,  // eolib uses 'intl' not 'int'
    wis: eifRecord.wis || 0,
    agi: eifRecord.agi || 0,
    con: eifRecord.con || 0,
    cha: eifRecord.cha || 0,
    dollGraphic: eifRecord.spec1 || 0,  // spec1 stores dollGraphic for equipment
    gender: eifRecord.spec2 || 0,       // spec2 stores gender for equipment
    levelReq: eifRecord.levelRequirement || 0,
    classReq: eifRecord.classRequirement || 0,
    strReq: eifRecord.strRequirement || 0,
    intReq: eifRecord.intRequirement || 0,
    wisReq: eifRecord.wisRequirement || 0,
    agiReq: eifRecord.agiRequirement || 0,
    conReq: eifRecord.conRequirement || 0,
    chaReq: eifRecord.chaRequirement || 0,
    weight: eifRecord.weight || 0,
    size: eifRecord.size || 0
  };
}

class EIFParser {
  static parse(fileData: ArrayBuffer) {
    try {
      const data = new Uint8Array(fileData);
      const reader = new EoReader(data);
      
      // Use eolib's built-in deserializer
      const eif = Eif.deserialize(reader);
      
      // Convert to application format, filtering out EOF markers
      const records = eif.items
        .filter(item => item.name.toLowerCase() !== 'eof')
        .map((item, index) => convertEifRecord(item, index + 1));
      
      return {
        fileType: 'EIF',
        totalLength: eif.totalItemsCount,
        version: eif.version,
        records
      };
    } catch (error: any) {
      console.error('Failed to parse EIF file:', error);
      throw new Error(`Invalid EIF file: ${error.message}`);
    }
  }
  
  static serialize(data: any) {
    try {
      const writer = new EoWriter();
      
      // Handle both formats: { records: [] } and { items: {} }
      let recordsArray: any[];
      if (data.records && Array.isArray(data.records)) {
        recordsArray = data.records;
      } else if (data.items) {
        // Convert items object to array
        recordsArray = Object.values(data.items);
      } else {
        throw new Error('Invalid data format: missing records or items');
      }
      
      // Create Eif object
      const eif = new Eif();
      eif.totalItemsCount = recordsArray.length;
      eif.version = data.version || 1;
      eif.rid = [recordsArray.length, recordsArray.length]; // Required by eolib for tracking
      
      // Sort records by ID to ensure correct ordering
      const sortedRecords = [...recordsArray].sort((a, b) => (a.id || 0) - (b.id || 0));
      
      console.log('First record to serialize:', sortedRecords[0]);
      
      // Convert records back to EifRecord format
      // Create actual EifRecord instances
      eif.items = sortedRecords.map((record: any, index: number) => {
        const eifRecord = new EifRecord();
        
        // Set all properties
        eifRecord.name = record.name || '';
        eifRecord.graphicId = record.graphic || 0;
        eifRecord.type = record.type || 0;
        eifRecord.subtype = record.subType || 0;
        eifRecord.special = record.special || 0;
        eifRecord.hp = record.hp || 0;
        eifRecord.tp = record.tp || 0;
        eifRecord.minDamage = record.minDamage || 0;
        eifRecord.maxDamage = record.maxDamage || 0;
        eifRecord.accuracy = record.accuracy || 0;
        eifRecord.evade = record.evade || 0;
        eifRecord.armor = record.armor || 0;
        eifRecord.returnDamage = 0;  // Not used in this version
        eifRecord.str = record.str || 0;
        eifRecord.intl = record.int || 0;
        eifRecord.wis = record.wis || 0;
        eifRecord.agi = record.agi || 0;
        eifRecord.con = record.con || 0;
        eifRecord.cha = record.cha || 0;
        eifRecord.lightResistance = 0;
        eifRecord.darkResistance = 0;
        eifRecord.earthResistance = 0;
        eifRecord.airResistance = 0;
        eifRecord.waterResistance = 0;
        eifRecord.fireResistance = 0;
        eifRecord.spec1 = record.dollGraphic || 0;
        eifRecord.spec2 = record.gender || 0;
        eifRecord.spec3 = 0;  // scroll_y, not used in this version
        eifRecord.levelRequirement = record.levelReq || 0;
        eifRecord.classRequirement = record.classReq || 0;
        eifRecord.strRequirement = record.strReq || 0;
        eifRecord.intRequirement = record.intReq || 0;
        eifRecord.wisRequirement = record.wisReq || 0;
        eifRecord.agiRequirement = record.agiReq || 0;
        eifRecord.conRequirement = record.conReq || 0;
        eifRecord.chaRequirement = record.chaReq || 0;
        eifRecord.element = 0;  // Element enum, 0 = none
        eifRecord.elementDamage = 0;
        eifRecord.weight = record.weight || 0;
        eifRecord.size = record.size || 0;  // ItemSize enum, 0 = size1x1
        
        // Set rid using Object.defineProperty
        Object.defineProperty(eifRecord, 'rid', {
          value: index + 1,
          writable: true,
          enumerable: true,
          configurable: true
        });
        
        return eifRecord;
      });
      
      console.log('First EifRecord after mapping:', eif.items[0]);
      console.log('First EifRecord rid:', (eif.items[0] as any).rid);
      
      // Check if any records are missing rid
      const missingRid = eif.items.find((item: any, idx: number) => !item.rid);
      if (missingRid) {
        console.error('Found record with missing rid:', missingRid);
      }
      console.log('Total items:', eif.items.length);
      console.log('Items with rid:', eif.items.filter((item: any) => item.rid).length);
      
      // Use eolib's built-in serializer
      Eif.serialize(writer, eif);
      
      return writer.toByteArray();
    } catch (error: any) {
      console.error('Failed to serialize EIF data:', error);
      throw new Error(`Failed to serialize EIF: ${error.message}`);
    }
  }
}

export { EIFParser };
