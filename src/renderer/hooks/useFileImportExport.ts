import { useCallback } from 'react';
import { EIFParser } from '../../eif-parser';
import { ENFParser } from '../../enf-parser';
import { ECFParser } from '../../ecf-parser';
import { ESFParser } from '../../esf-parser';
import { parseInnFile, serializeInnFile, exportInnsToText, importInnsFromText } from '../../inn-parser';
import { recordToArray } from '../../utils/dataTransforms';

interface UseFileImportExportProps {
  eifData: { version: number; items: Record<number, any> };
  enfData: { version: number; npcs: Record<number, any> };
  ecfData: { version: number; classes: Record<number, any> };
  esfData: { version: number; skills: Record<number, any> };
  innData: { version: number; inns: any[] };
  dropsData: Map<number, any[]>;
  currentProject: string;
  setEifData: (data: any) => void;
  setEnfData: (data: any) => void;
  setEcfData: (data: any) => void;
  setEsfData: (data: any) => void;
  setInnData: (data: any) => void;
  setDropsData: (data: Map<number, any[]>) => void;
}

export const useFileImportExport = ({
  eifData,
  enfData,
  ecfData,
  esfData,
  innData,
  dropsData,
  currentProject,
  setEifData,
  setEnfData,
  setEcfData,
  setEsfData,
  setInnData,
  setDropsData
}: UseFileImportExportProps) => {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const exportItems = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.saveFile('dat001.eif', [
        { name: 'EIF Files', extensions: ['eif'] }
      ]);
      
      if (!result) return;
      
      const serializedData = EIFParser.serialize(eifData);
      const writeResult = await window.electronAPI.writeFile(result, serializedData);
      
      if (writeResult.success) {
        alert(`Items exported successfully to: ${result}`);
      } else {
        throw new Error(writeResult.error);
      }
    } catch (error) {
      console.error('Error exporting items:', error);
      alert('Error exporting items: ' + (error as Error).message);
    }
  }, [eifData]);

  const exportNpcs = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.saveFile('din001.enf', [
        { name: 'ENF Files', extensions: ['enf'] }
      ]);
      
      if (!result) return;
      
      const serializedData = ENFParser.serialize(enfData);
      const writeResult = await window.electronAPI.writeFile(result, serializedData);
      
      if (writeResult.success) {
        alert(`NPCs exported successfully to: ${result}`);
      } else {
        throw new Error(writeResult.error);
      }
    } catch (error) {
      console.error('Error exporting NPCs:', error);
      alert('Error exporting NPCs: ' + (error as Error).message);
    }
  }, [enfData]);

  const exportDrops = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.saveFile('drops.txt', [
        { name: 'Text Files', extensions: ['txt'] }
      ]);
      
      if (!result) return;
      
      let content = '# NPC Drop Table Configuration\n';
      content += '# Format: npc_id = item_id,min,max,percentage, item_id,min,max,percentage, ...\n';
      content += '# Percentage is 0-100 (supports decimals like 0.5)\n\n';
      
      const sortedNpcIds = Array.from(dropsData.keys()).sort((a, b) => a - b);
      
      for (const npcId of sortedNpcIds) {
        const drops = dropsData.get(npcId);
        if (!drops || drops.length === 0) continue;
        
        const dropStrs = drops.map(d => `${d.itemId},${d.min},${d.max},${d.percentage}`);
        content += `${npcId} = ${dropStrs.join(', ')}\n`;
      }
      
      const writeResult = await window.electronAPI.writeTextFile(result, content);
      
      if (writeResult.success) {
        alert(`Drops exported successfully to: ${result}`);
      } else {
        throw new Error(writeResult.error);
      }
    } catch (error) {
      console.error('Error exporting drops:', error);
      alert('Error exporting drops: ' + (error as Error).message);
    }
  }, [dropsData]);

  const importItems = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.openFile([
        { name: 'EIF Files', extensions: ['eif'] }
      ]);
      
      if (!result) return;
      
      const fileData = await window.electronAPI.readFile(result);
      if (fileData.success) {
        const eifArray = new Uint8Array(fileData.data);
        const parsedData = EIFParser.parse(eifArray.buffer);
        
        const items: Record<number, any> = {};
        for (const item of parsedData.records) {
          items[item.id] = item;
        }
        
        setEifData({ version: 1, items });
        
        // Save to project JSON
        if (currentProject) {
          const itemsArray = recordToArray(items);
          const itemsPath = `${currentProject}/items.json`;
          await window.electronAPI.writeTextFile(itemsPath, JSON.stringify(itemsArray, null, 2));
        }
        
        alert(`${Object.keys(items).length} items imported successfully!`);
      }
    } catch (error) {
      console.error('Error importing items:', error);
      alert('Error importing items: ' + (error as Error).message);
    }
  }, [currentProject, setEifData]);

  const importNpcs = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.openFile([
        { name: 'ENF Files', extensions: ['enf'] }
      ]);
      
      if (!result) return;
      
      const fileData = await window.electronAPI.readFile(result);
      if (fileData.success) {
        const enfArray = new Uint8Array(fileData.data);
        const parsedData = ENFParser.parse(enfArray.buffer);
        
        const npcs: Record<number, any> = {};
        for (const npc of parsedData.records) {
          npcs[npc.id] = npc;
        }
        
        setEnfData({ version: 1, npcs });
        
        // Save to project JSON
        if (currentProject) {
          const npcsArray = recordToArray(npcs);
          const npcsPath = `${currentProject}/npcs.json`;
          await window.electronAPI.writeTextFile(npcsPath, JSON.stringify(npcsArray, null, 2));
        }
        
        alert(`${Object.keys(npcs).length} NPCs imported successfully!`);
      }
    } catch (error) {
      console.error('Error importing NPCs:', error);
      alert('Error importing NPCs: ' + (error as Error).message);
    }
  }, [currentProject, setEnfData]);

  const importDrops = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.openFile([
        { name: 'Text Files', extensions: ['txt'] }
      ]);
      
      if (!result) return;
      
      const fileData = await window.electronAPI.readTextFile(result);
      if (fileData.success) {
        const content = fileData.data;
        const dropsMap = new Map();
        const lines = content.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          const parts = trimmed.split('=');
          if (parts.length !== 2) continue;
          
          const npcId = parseInt(parts[0].trim());
          if (isNaN(npcId)) continue;
          
          const dropItems = [];
          const itemsStr = parts[1].trim();
          const itemParts = itemsStr.split(',').map(s => s.trim());
          
          for (let i = 0; i + 3 < itemParts.length; i += 4) {
            const itemId = parseInt(itemParts[i]);
            const min = parseInt(itemParts[i + 1]);
            const max = parseInt(itemParts[i + 2]);
            const percentage = parseFloat(itemParts[i + 3]);
            
            if (!isNaN(itemId) && !isNaN(min) && !isNaN(max) && !isNaN(percentage)) {
              dropItems.push({ itemId, min, max, percentage });
            }
          }
          
          if (dropItems.length > 0) {
            dropsMap.set(npcId, dropItems);
          }
        }
        
        setDropsData(dropsMap);
        
        // Save to project JSON
        if (currentProject) {
          const dropsArray = Array.from(dropsMap.entries()).map(([npcId, drops]) => ({ npcId, drops }));
          const dropsPath = `${currentProject}/drops.json`;
          await window.electronAPI.writeTextFile(dropsPath, JSON.stringify(dropsArray, null, 2));
        }
        
        alert(`Drops imported successfully! ${dropsMap.size} NPCs have drop tables.`);
      }
    } catch (error) {
      console.error('Error importing drops:', error);
      alert('Error importing drops: ' + (error as Error).message);
    }
  }, [currentProject, setDropsData]);

  const exportClasses = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.saveFile('dat001.ecf', [
        { name: 'ECF Files', extensions: ['ecf'] }
      ]);
      
      if (!result) return;
      
      const serializedData = ECFParser.serialize(ecfData);
      const writeResult = await window.electronAPI.writeFile(result, serializedData);
      
      if (writeResult.success) {
        alert(`Classes exported successfully to: ${result}`);
      } else {
        throw new Error(writeResult.error);
      }
    } catch (error) {
      console.error('Error exporting classes:', error);
      alert('Error exporting classes: ' + (error as Error).message);
    }
  }, [ecfData]);

  const importClasses = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.openFile([
        { name: 'ECF Files', extensions: ['ecf'] }
      ]);
      
      if (!result) return;
      
      const fileData = await window.electronAPI.readFile(result);
      if (fileData.success) {
        const ecfArray = new Uint8Array(fileData.data);
        const parsedData = ECFParser.parse(ecfArray.buffer);
        
        const classes: Record<number, any> = {};
        for (const cls of parsedData.records) {
          classes[cls.id] = cls;
        }
        
        setEcfData({ version: 1, classes });
        
        // Save to project JSON
        if (currentProject) {
          const classesArray = recordToArray(classes);
          const classesPath = `${currentProject}/classes.json`;
          await window.electronAPI.writeTextFile(classesPath, JSON.stringify(classesArray, null, 2));
        }
        
        alert(`${Object.keys(classes).length} classes imported successfully!`);
      }
    } catch (error) {
      console.error('Error importing classes:', error);
      alert('Error importing classes: ' + (error as Error).message);
    }
  }, [currentProject, setEcfData]);

  const exportSkills = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.saveFile('dsl001.esf', [
        { name: 'ESF Files', extensions: ['esf'] }
      ]);
      
      if (!result) return;
      
      const serializedData = ESFParser.serialize(esfData);
      const writeResult = await window.electronAPI.writeFile(result, serializedData);
      
      if (writeResult.success) {
        alert(`Skills exported successfully to: ${result}`);
      } else {
        throw new Error(writeResult.error);
      }
    } catch (error) {
      console.error('Error exporting skills:', error);
      alert('Error exporting skills: ' + (error as Error).message);
    }
  }, [esfData]);

  const importSkills = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.openFile([
        { name: 'ESF Files', extensions: ['esf'] }
      ]);
      
      if (!result) return;
      
      const fileData = await window.electronAPI.readFile(result);
      if (fileData.success) {
        const esfArray = new Uint8Array(fileData.data);
        const parsedData = ESFParser.parse(esfArray.buffer);
        
        const skills: Record<number, any> = {};
        for (const skill of parsedData.records) {
          skills[skill.id] = skill;
        }
        
        setEsfData({ version: 1, skills });
        
        // Save to project JSON
        if (currentProject) {
          const skillsArray = recordToArray(skills);
          const skillsPath = `${currentProject}/skills.json`;
          await window.electronAPI.writeTextFile(skillsPath, JSON.stringify(skillsArray, null, 2));
        }
        
        alert(`${Object.keys(skills).length} skills imported successfully!`);
      }
    } catch (error) {
      console.error('Error importing skills:', error);
      alert('Error importing skills: ' + (error as Error).message);
    }
  }, [currentProject, setEsfData]);

  const exportInns = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.saveFile('inns.txt', [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]);
      
      if (!result) return;
      
      // Convert inn data to InnFile structure
      const innFile = { inns: innData.inns };
      const textData = exportInnsToText(innFile as any);
      const writeResult = await window.electronAPI.writeFile(result, Buffer.from(textData, 'utf-8'));
      
      if (writeResult) {
        alert('Inns exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting inns:', error);
      alert('Error exporting inns: ' + (error as Error).message);
    }
  }, [innData]);

  const importInns = useCallback(async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.openFile([
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]);
      
      if (!result) return;
      
      const fileData = await window.electronAPI.readTextFile(result);
      if (fileData.success) {
        const textData = fileData.data;
        const innFile = importInnsFromText(textData);
        
        setInnData({
          version: 1,
          inns: innFile.inns
        });
        
        // Save to project JSON
        if (currentProject) {
          const innsPath = `${currentProject}/inns.json`;
          await window.electronAPI.writeTextFile(innsPath, JSON.stringify(innFile.inns, null, 2));
        }
        
        alert(`Inns imported successfully! ${innFile.inns.length} inns loaded.`);
      } else {
        throw new Error(fileData.error);
      }
    } catch (error) {
      console.error('Error importing inns:', error);
      alert('Error importing inns: ' + (error as Error).message);
    }
  }, [currentProject, setInnData]);

  return {
    exportItems,
    exportNpcs,
    exportDrops,
    exportClasses,
    exportSkills,
    exportInns,
    importItems,
    importNpcs,
    importDrops,
    importClasses,
    importSkills,
    importInns
  };
};
