/**
 * ENF (Endless NPC File) Parser
 * Simplified wrapper around eolib
 */

import { Enf, EnfRecord, EoReader, EoWriter } from 'eolib';

/**
 * Convert eolib EnfRecord to application format
 * Maps eolib field names to application field names for consistency with JSON serialization
 */
function convertEnfRecord(enfRecord: EnfRecord, id: number) {
  return {
    id,
    name: enfRecord.name || '',
    graphic: enfRecord.graphicId || 0,
    race: enfRecord.race || 0,
    boss: enfRecord.boss || false,
    child: enfRecord.child || false,
    type: enfRecord.type || 0,
    behaviorId: enfRecord.behaviorId || 0,
    hp: enfRecord.hp || 0,
    tp: enfRecord.tp || 0,
    minDamage: enfRecord.minDamage || 0,
    maxDamage: enfRecord.maxDamage || 0,
    accuracy: enfRecord.accuracy || 0,
    evade: enfRecord.evade || 0,
    armor: enfRecord.armor || 0,
    returnDamage: enfRecord.returnDamage || 0,
    element: enfRecord.element || 0,
    elementDamage: enfRecord.elementDamage || 0,
    elementWeakness: enfRecord.elementWeakness || 0,
    elementWeaknessDamage: enfRecord.elementWeaknessDamage || 0,
    level: enfRecord.level || 0,
    exp: enfRecord.experience || 0
  };
}

class ENFParser {
  static parse(fileData: ArrayBuffer) {
    try {
      const data = new Uint8Array(fileData);
      const reader = new EoReader(data);
      
      // Use eolib's built-in deserializer
      const enf = Enf.deserialize(reader);
      
      // Convert to application format, filtering out EOF markers
      const records = enf.npcs
        .filter(npc => npc.name.toLowerCase() !== 'eof')
        .map((npc, index) => convertEnfRecord(npc, index + 1));
      
      return {
        fileType: 'ENF',
        totalLength: enf.totalNpcsCount,
        version: enf.version,
        records
      };
    } catch (error: any) {
      console.error('Failed to parse ENF file:', error);
      throw new Error(`Invalid ENF file: ${error.message}`);
    }
  }
  
  static serialize(data: any) {
    try {
      const writer = new EoWriter();
      
      // Create Enf object
      const enf = new Enf();
      enf.totalNpcsCount = data.records.length;
      enf.version = data.version || 1;
      
      // Convert records back to EnfRecord format
      enf.npcs = data.records.map((record: any) => {
        const enfRecord = new EnfRecord();
        enfRecord.name = record.name || '';
        enfRecord.graphicId = record.graphic || 0;
        enfRecord.race = record.race || 0;
        enfRecord.boss = record.boss || false;
        enfRecord.child = record.child || false;
        enfRecord.type = record.type || 0;
        enfRecord.behaviorId = record.behaviorId || 0;
        enfRecord.hp = record.hp || 0;
        enfRecord.tp = record.tp || 0;
        enfRecord.minDamage = record.minDamage || 0;
        enfRecord.maxDamage = record.maxDamage || 0;
        enfRecord.accuracy = record.accuracy || 0;
        enfRecord.evade = record.evade || 0;
        enfRecord.armor = record.armor || 0;
        enfRecord.returnDamage = record.returnDamage || 0;
        enfRecord.element = record.element || 0;
        enfRecord.elementDamage = record.elementDamage || 0;
        enfRecord.elementWeakness = record.elementWeakness || 0;
        enfRecord.elementWeaknessDamage = record.elementWeaknessDamage || 0;
        enfRecord.level = record.level || 0;
        enfRecord.experience = record.exp || 0;
        return enfRecord;
      });
      
      // Use eolib's built-in serializer
      Enf.serialize(writer, enf);
      
      return writer.toByteArray();
    } catch (error: any) {
      console.error('Failed to serialize ENF data:', error);
      throw new Error(`Failed to serialize ENF: ${error.message}`);
    }
  }
}

export { ENFParser };
