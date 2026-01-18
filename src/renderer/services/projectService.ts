import { recordToArray } from '../../utils/dataTransforms';
import { InnRecord, InnQuestionRecord } from 'eolib';

interface SaveProjectOptions {
  currentProject: string; // Full path to project directory
  eifData: any;
  enfData: any;
  ecfData: any;
  esfData: any;
  innData: any;
  dropsData: Map<number, any[]>;
  equippedItems: Record<string, any>;
  appearance: {
    gender: number;
    hairStyle: number;
    hairColor: number;
    skinTone: number;
  };
}

/**
 * Serializes an InnQuestionRecord to a plain object with only the public properties
 */
function serializeInnQuestion(question: InnQuestionRecord) {
  return {
    question: question.question || '',
    answer: question.answer || ''
  };
}

/**
 * Serializes an InnRecord to a plain object with only the public properties
 */
function serializeInn(inn: InnRecord) {
  return {
    behaviorId: inn.behaviorId || 0,
    name: inn.name || '',
    spawnMap: inn.spawnMap || 0,
    spawnX: inn.spawnX || 0,
    spawnY: inn.spawnY || 0,
    sleepMap: inn.sleepMap || 0,
    sleepX: inn.sleepX || 0,
    sleepY: inn.sleepY || 0,
    alternateSpawnEnabled: inn.alternateSpawnEnabled || false,
    alternateSpawnMap: inn.alternateSpawnMap || 0,
    alternateSpawnX: inn.alternateSpawnX || 0,
    alternateSpawnY: inn.alternateSpawnY || 0,
    questions: inn.questions?.map(serializeInnQuestion) || []
  };
}

interface ProjectData {
  items?: Record<number, any>;
  npcs?: Record<number, any>;
  classes?: Record<number, any>;
  skills?: Record<number, any>;
  inns?: any[];
  drops?: Map<number, any[]>;
  equipment?: {
    equippedItems: Record<string, any>;
    appearance: {
      gender: number;
      hairStyle: number;
      hairColor: number;
      skinTone: number;
    };
  };
}

/**
 * Service for managing project data persistence
 */
export class ProjectService {
  /**
   * Saves all project data (items, npcs, drops, equipment) to JSON files
   */
  static async saveProject(options: SaveProjectOptions): Promise<void> {
    const {
      currentProject,
      eifData,
      enfData,
      ecfData,
      esfData,
      innData,
      dropsData,
      equippedItems,
      appearance
    } = options;

    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    // Ensure project directory exists
    await window.electronAPI.ensureDir(currentProject);

    // Update config with last modified time
    const configPath = `${currentProject}/config.json`;
    const configResult = await window.electronAPI.readTextFile(configPath);
    if (configResult.success) {
      const config = JSON.parse(configResult.data);
      config.lastModified = new Date().toISOString();
      await window.electronAPI.writeTextFile(configPath, JSON.stringify(config, null, 2));
    }

    // Save items.json
    const itemsArray = recordToArray(eifData.items);
    const itemsPath = `${currentProject}/items.json`;
    let result = await window.electronAPI.writeTextFile(itemsPath, JSON.stringify(itemsArray, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save items.json: ${result.error}`);
    }
    console.log('items.json saved successfully');

    // Save npcs.json
    const npcsArray = recordToArray(enfData.npcs);
    const npcsPath = `${currentProject}/npcs.json`;
    result = await window.electronAPI.writeTextFile(npcsPath, JSON.stringify(npcsArray, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save npcs.json: ${result.error}`);
    }
    console.log('npcs.json saved successfully');

    // Save classes.json
    const classesArray = recordToArray(ecfData.classes);
    const classesPath = `${currentProject}/classes.json`;
    result = await window.electronAPI.writeTextFile(classesPath, JSON.stringify(classesArray, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save classes.json: ${result.error}`);
    }
    console.log('classes.json saved successfully');

    // Save skills.json
    const skillsArray = recordToArray(esfData.skills);
    const skillsPath = `${currentProject}/skills.json`;
    result = await window.electronAPI.writeTextFile(skillsPath, JSON.stringify(skillsArray, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save skills.json: ${result.error}`);
    }
    console.log('skills.json saved successfully');

    // Save inns.json
    const innsArray = (innData.inns || []).map(serializeInn);
    const innsPath = `${currentProject}/inns.json`;
    result = await window.electronAPI.writeTextFile(innsPath, JSON.stringify(innsArray, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save inns.json: ${result.error}`);
    }
    console.log('inns.json saved successfully');

    // Save drops.json
    const dropsArray = Array.from(dropsData.entries()).map(([npcId, drops]) => ({ npcId, drops }));
    const dropsPath = `${currentProject}/drops.json`;
    result = await window.electronAPI.writeTextFile(dropsPath, JSON.stringify(dropsArray, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save drops.json: ${result.error}`);
    }
    console.log('drops.json saved successfully');

    // Save equipment.json with currently equipped items and appearance
    const equipmentData = {
      equippedItems,
      appearance
    };
    const equipmentPath = `${currentProject}/equipment.json`;
    result = await window.electronAPI.writeTextFile(equipmentPath, JSON.stringify(equipmentData, null, 2));
    if (!result.success) {
      throw new Error(`Failed to save equipment.json: ${result.error}`);
    }
    console.log('equipment.json saved successfully');
  }

  /**
   * Restores project state from loaded project data
   */
  static restoreProjectState(
    projectData: ProjectData,
    callbacks: {
      setEifData: (data: any) => void;
      setEnfData: (data: any) => void;
      setEcfData: (data: any) => void;
      setEsfData: (data: any) => void;
      setInnData: (data: any) => void;
      setDropsData: (data: Map<number, any[]>) => void;
      restoreEquipment: (equipment: Record<string, any>) => void;
      setGender: (gender: number) => void;
      setHairStyle: (style: number) => void;
      setHairColor: (color: number) => void;
      setSkinTone: (tone: number) => void;
    }
  ): void {
    const {
      setEifData,
      setEnfData,
      setEcfData,
      setEsfData,
      setInnData,
      setDropsData,
      restoreEquipment,
      setGender,
      setHairStyle,
      setHairColor,
      setSkinTone
    } = callbacks;

    if (projectData.items) {
      setEifData({ version: 1, items: projectData.items });
    }
    
    if (projectData.npcs) {
      setEnfData({ version: 1, npcs: projectData.npcs });
    }
    
    if (projectData.classes) {
      setEcfData({ version: 1, classes: projectData.classes });
    }
    
    if (projectData.skills) {
      setEsfData({ version: 1, skills: projectData.skills });
    }
    
    if (projectData.inns) {
      setInnData({ inns: projectData.inns });
    }
    
    if (projectData.drops) {
      setDropsData(projectData.drops);
    }

    // Restore equipment and appearance if available
    if (projectData.equipment) {
      if (projectData.equipment.equippedItems) {
        restoreEquipment(projectData.equipment.equippedItems);
      }
      if (projectData.equipment.appearance) {
        const { gender, hairStyle, hairColor, skinTone } = projectData.equipment.appearance;
        if (gender !== undefined) setGender(gender);
        if (hairStyle !== undefined) setHairStyle(hairStyle);
        if (hairColor !== undefined) setHairColor(hairColor);
        if (skinTone !== undefined) setSkinTone(skinTone);
      }
    }
  }
}
