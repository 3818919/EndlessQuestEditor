import { useState, useCallback } from 'react';
import { InnRecord, InnQuestionRecord } from 'eolib';

interface InnData {
  version: number;
  inns: InnRecord[];
}

export const useInnData = (initialData?: InnData) => {
  const [innData, setInnData] = useState<InnData>(initialData || {
    version: 1,
    inns: []
  });

  const addInn = useCallback(() => {
    const newInn = Object.assign(new InnRecord(), {
      name: `New Inn ${innData.inns.length + 1}`,
      behaviorId: 0,
      spawnMap: 0,
      spawnX: 0,
      spawnY: 0,
      sleepMap: 0,
      sleepX: 0,
      sleepY: 0,
      alternateSpawnEnabled: false,
      alternateSpawnMap: 0,
      alternateSpawnX: 0,
      alternateSpawnY: 0,
      questions: [
        Object.assign(new InnQuestionRecord(), { question: '', answer: '' }),
        Object.assign(new InnQuestionRecord(), { question: '', answer: '' }),
        Object.assign(new InnQuestionRecord(), { question: '', answer: '' })
      ]
    });

    setInnData(prev => ({
      ...prev,
      inns: [...prev.inns, newInn]
    }));

    return innData.inns.length; // Return the index of the new inn
  }, [innData.inns.length]);

  const updateInn = useCallback((index: number, updates: Partial<InnRecord>) => {
    setInnData(prev => ({
      ...prev,
      inns: prev.inns.map((inn, i) => i === index ? { ...inn, ...updates } : inn)
    }));
  }, []);

  const deleteInn = useCallback((index: number) => {
    setInnData(prev => ({
      ...prev,
      inns: prev.inns.filter((_, i) => i !== index)
    }));
  }, []);

  const duplicateInn = useCallback((index: number) => {
    const innToDuplicate = innData.inns[index];
    if (!innToDuplicate) return;

    const duplicatedInn = Object.assign(new InnRecord(), {
      ...innToDuplicate,
      name: `${innToDuplicate.name} (Copy)`,
      questions: innToDuplicate.questions?.map(q => 
        Object.assign(new InnQuestionRecord(), { ...q })
      ) || []
    });

    setInnData(prev => ({
      ...prev,
      inns: [...prev.inns, duplicatedInn]
    }));

    return innData.inns.length; // Return the index of the duplicated inn
  }, [innData.inns]);

  return {
    innData,
    setInnData,
    addInn,
    updateInn,
    deleteInn,
    duplicateInn
  };
};
