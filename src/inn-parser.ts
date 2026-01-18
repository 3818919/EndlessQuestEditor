import { EoReader, EoWriter, InnFile, InnRecord, InnQuestionRecord } from 'eolib';

export function parseInnFile(buffer: Buffer): InnFile {
  const reader = new EoReader(new Uint8Array(buffer));
  return InnFile.deserialize(reader);
}

export function serializeInnFile(innFile: InnFile): Buffer {
  const writer = new EoWriter();
  InnFile.serialize(writer, innFile);
  return Buffer.from(writer.toByteArray());
}

/**
 * Converts inn data to the text format used by EOSERV
 * Format:
 *   name.name = Name
 *   name.location = map,x,y
 *   name.innkeeper = npcid (optional)
 *   name.question1 = question (optional)
 *   name.answer1 = answer (optional)
 *   level.x = name
 */
export function exportInnsToText(innFile: InnFile): string {
  const lines: string[] = [
    '# Innkeeper/spawn point information',
    '#',
    '# Spawn Point Format:',
    '#  name.name = name',
    '#  name.location = map, x,y',
    '#  name.innkeeper = npcid (optional)',
    '#  name.question[1-3] = question (optional)',
    '#  name.answer[1-3] = answer (optional)',
    '#',
    '# Level Tier Spawn Format:',
    '#  level.x = name',
    '#',
    '# Example:',
    '#  newbland.name = Wanderer',
    '#  newbland.location = 1, 3,4',
    '#  level.0 = newbland',
    '#',
    '# Creates a spawn point at 3,4 on map 1 called Wanderer for vagabonds.',
    '# Questions and answers are only needed if the innkeeper id is set.',
    '',
    ''
  ];

  innFile.inns.forEach((inn, index) => {
    // Generate a key from the name (lowercase, no spaces)
    const key = inn.name.toLowerCase().replace(/\s+/g, '');
    
    lines.push(`${key}.name = ${inn.name}`);
    lines.push(`${key}.location = ${inn.spawnMap},${inn.spawnX},${inn.spawnY}`);
    
    if (inn.behaviorId > 0) {
      lines.push(`${key}.innkeeper = ${inn.behaviorId}`);
      
      // Add questions and answers if innkeeper is set
      inn.questions.forEach((q, qIndex) => {
        if (q.question && q.question.trim()) {
          lines.push(`${key}.question${qIndex + 1} = ${q.question}`);
        }
        if (q.answer && q.answer.trim()) {
          lines.push(`${key}.answer${qIndex + 1} = ${q.answer}`);
        }
      });
    }
    
    // Add level tier mapping
    lines.push(`level.${index} = ${inn.name}`);
    lines.push('');
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Parses the text format and converts it to InnFile structure
 */
export function importInnsFromText(text: string): InnFile {
  const lines = text.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  });

  const innMap = new Map<string, Partial<InnRecord>>();
  const levelMap = new Map<number, string>();

  lines.forEach(line => {
    const match = line.match(/^(\w+)\.(\w+)\s*=\s*(.+)$/);
    if (!match) return;

    const [, key, property, value] = match;
    const trimmedValue = value.trim();

    if (key === 'level') {
      levelMap.set(parseInt(property), trimmedValue);
      return;
    }

    if (!innMap.has(key)) {
      innMap.set(key, {});
    }

    const inn = innMap.get(key)!;

    switch (property) {
      case 'name':
        inn.name = trimmedValue;
        break;
      case 'location': {
        const [map, x, y] = trimmedValue.split(',').map(s => parseInt(s.trim()));
        inn.spawnMap = map;
        inn.spawnX = x;
        inn.spawnY = y;
        // Set sleep location same as spawn by default
        inn.sleepMap = map;
        inn.sleepX = x;
        inn.sleepY = y;
        break;
      }
      case 'innkeeper':
        inn.behaviorId = parseInt(trimmedValue);
        break;
      case 'question1':
      case 'question2':
      case 'question3': {
        if (!inn.questions) {
          inn.questions = [
            { question: '', answer: '' } as InnQuestionRecord,
            { question: '', answer: '' } as InnQuestionRecord,
            { question: '', answer: '' } as InnQuestionRecord
          ];
        }
        const qIndex = parseInt(property.slice(-1)) - 1;
        inn.questions[qIndex].question = trimmedValue;
        break;
      }
      case 'answer1':
      case 'answer2':
      case 'answer3': {
        if (!inn.questions) {
          inn.questions = [
            { question: '', answer: '' } as InnQuestionRecord,
            { question: '', answer: '' } as InnQuestionRecord,
            { question: '', answer: '' } as InnQuestionRecord
          ];
        }
        const aIndex = parseInt(property.slice(-1)) - 1;
        inn.questions[aIndex].answer = trimmedValue;
        break;
      }
    }
  });

  // Convert map to array, ordered by level mappings first, then unmapped inns
  const inns: InnRecord[] = [];
  const processedKeys = new Set<string>();
  
  // First, add inns that have level mappings (in level order)
  Array.from(levelMap.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([, innKey]) => {
      // The level map points to the key, not the name
      if (innMap.has(innKey)) {
        const innData = innMap.get(innKey)!;
        const inn = new InnRecord();
        inn.name = innData.name || '';
        inn.behaviorId = innData.behaviorId || 0;
        inn.spawnMap = innData.spawnMap || 0;
        inn.spawnX = innData.spawnX || 0;
        inn.spawnY = innData.spawnY || 0;
        inn.sleepMap = innData.sleepMap || innData.spawnMap || 0;
        inn.sleepX = innData.sleepX || innData.spawnX || 0;
        inn.sleepY = innData.sleepY || innData.spawnY || 0;
        inn.alternateSpawnEnabled = false;
        inn.alternateSpawnMap = 0;
        inn.alternateSpawnX = 0;
        inn.alternateSpawnY = 0;
        inn.questions = innData.questions || [
          Object.assign(new InnQuestionRecord(), { question: '', answer: '' }),
          Object.assign(new InnQuestionRecord(), { question: '', answer: '' }),
          Object.assign(new InnQuestionRecord(), { question: '', answer: '' })
        ];
        inns.push(inn);
        processedKeys.add(innKey);
      }
    });
  
  // Then add all other inns that don't have level mappings (optional spawn points)
  Array.from(innMap.keys()).forEach(innKey => {
    if (!processedKeys.has(innKey)) {
      const innData = innMap.get(innKey)!;
      const inn = new InnRecord();
      inn.name = innData.name || '';
      inn.behaviorId = innData.behaviorId || 0;
      inn.spawnMap = innData.spawnMap || 0;
      inn.spawnX = innData.spawnX || 0;
      inn.spawnY = innData.spawnY || 0;
      inn.sleepMap = innData.sleepMap || innData.spawnMap || 0;
      inn.sleepX = innData.sleepX || innData.spawnX || 0;
      inn.sleepY = innData.sleepY || innData.spawnY || 0;
      inn.alternateSpawnEnabled = false;
      inn.alternateSpawnMap = 0;
      inn.alternateSpawnX = 0;
      inn.alternateSpawnY = 0;
      inn.questions = innData.questions || [
        Object.assign(new InnQuestionRecord(), { question: '', answer: '' }),
        Object.assign(new InnQuestionRecord(), { question: '', answer: '' }),
        Object.assign(new InnQuestionRecord(), { question: '', answer: '' })
      ];
      inns.push(inn);
    }
  });

  const innFile = new InnFile();
  innFile.inns = inns;
  return innFile;
}
