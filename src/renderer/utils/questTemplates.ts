// Quest Templates for common quest patterns
import { QuestData } from '../../eqf-parser';

export const QUEST_TEMPLATES: Record<string, Omit<QuestData, 'id'>> = {
  'Fetch Quest': {
    questName: 'New Fetch Quest',
    version: 1,
    states: [
      {
        name: 'Begin',
        description: 'Talk to NPC',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Greetings! I need your help with a task.'],
            rawText: 'AddNpcText(1, "Greetings! I need your help with a task.");'
          },
          {
            type: 'AddNpcText',
            params: [1, 'Can you fetch me some items? I need 5 of item #100.'],
            rawText: 'AddNpcText(1, "Can you fetch me some items? I need 5 of item #100.");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 1, 'Sure, I can help!'],
            rawText: 'AddNpcInput(1, 1, "Sure, I can help!");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 2, 'No, sorry.'],
            rawText: 'AddNpcInput(1, 2, "No, sorry.");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'CollectItems',
            rawText: 'InputNpc(1) goto CollectItems'
          },
          {
            type: 'InputNpc',
            params: [2],
            gotoState: 'Begin',
            rawText: 'InputNpc(2) goto Begin'
          }
        ]
      },
      {
        name: 'CollectItems',
        description: 'Collect 5 of Item #100',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Go collect the items and return to me when you have them.'],
            rawText: 'AddNpcText(1, "Go collect the items and return to me when you have them.");'
          }
        ],
        rules: [
          {
            type: 'GotItems',
            params: [100, 5],
            gotoState: 'ReturnToNPC',
            rawText: 'GotItems(100, 5) goto ReturnToNPC'
          }
        ]
      },
      {
        name: 'ReturnToNPC',
        description: 'Return to NPC',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Excellent! You have the items. Here is your reward.'],
            rawText: 'AddNpcText(1, "Excellent! You have the items. Here is your reward.");'
          },
          {
            type: 'RemoveItem',
            params: [100, 5],
            rawText: 'RemoveItem(100, 5);'
          }
        ],
        rules: [
          {
            type: 'TalkedToNpc',
            params: [1],
            gotoState: 'Reward',
            rawText: 'TalkedToNpc(1) goto Reward'
          }
        ]
      },
      {
        name: 'Reward',
        description: '',
        actions: [
          {
            type: 'GiveExp',
            params: [1000],
            rawText: 'GiveExp(1000);'
          },
          {
            type: 'GiveItem',
            params: [1, 500],
            rawText: 'GiveItem(1, 500);'
          },
          {
            type: 'End',
            params: [],
            rawText: 'End();'
          }
        ],
        rules: []
      }
    ],
    randomBlocks: []
  },

  'Kill Quest': {
    questName: 'New Kill Quest',
    version: 1,
    states: [
      {
        name: 'Begin',
        description: 'Talk to NPC',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'The monsters are getting out of control!'],
            rawText: 'AddNpcText(1, "The monsters are getting out of control!");'
          },
          {
            type: 'AddNpcText',
            params: [1, 'Can you help me by killing 10 of NPC #2?'],
            rawText: 'AddNpcText(1, "Can you help me by killing 10 of NPC #2?");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 1, 'I will do it!'],
            rawText: 'AddNpcInput(1, 1, "I will do it!");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 2, 'Not interested.'],
            rawText: 'AddNpcInput(1, 2, "Not interested.");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'KillMonsters',
            rawText: 'InputNpc(1) goto KillMonsters'
          },
          {
            type: 'InputNpc',
            params: [2],
            gotoState: 'Begin',
            rawText: 'InputNpc(2) goto Begin'
          }
        ]
      },
      {
        name: 'KillMonsters',
        description: 'Kill 10 of NPC #2',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Go kill the monsters and report back to me when you are done.'],
            rawText: 'AddNpcText(1, "Go kill the monsters and report back to me when you are done.");'
          }
        ],
        rules: [
          {
            type: 'KilledNpcs',
            params: [2, 10],
            gotoState: 'ReturnToNPC',
            rawText: 'KilledNpcs(2, 10) goto ReturnToNPC'
          }
        ]
      },
      {
        name: 'ReturnToNPC',
        description: 'Return to NPC for reward',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Well done! You have done a great service. Here is your reward.'],
            rawText: 'AddNpcText(1, "Well done! You have done a great service. Here is your reward.");'
          }
        ],
        rules: [
          {
            type: 'TalkedToNpc',
            params: [1],
            gotoState: 'Reward',
            rawText: 'TalkedToNpc(1) goto Reward'
          }
        ]
      },
      {
        name: 'Reward',
        description: '',
        actions: [
          {
            type: 'GiveExp',
            params: [2000],
            rawText: 'GiveExp(2000);'
          },
          {
            type: 'GiveItem',
            params: [1, 1000],
            rawText: 'GiveItem(1, 1000);'
          },
          {
            type: 'End',
            params: [],
            rawText: 'End();'
          }
        ],
        rules: []
      }
    ],
    randomBlocks: []
  },

  'Delivery Quest': {
    questName: 'New Delivery Quest',
    version: 1,
    states: [
      {
        name: 'Begin',
        description: 'Talk to NPC #1',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'I need you to deliver this package to someone.'],
            rawText: 'AddNpcText(1, "I need you to deliver this package to someone.");'
          },
          {
            type: 'AddNpcText',
            params: [1, 'Can you take it to NPC #2 for me?'],
            rawText: 'AddNpcText(1, "Can you take it to NPC #2 for me?");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 1, 'Yes, I can deliver it.'],
            rawText: 'AddNpcInput(1, 1, "Yes, I can deliver it.");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 2, 'No thanks.'],
            rawText: 'AddNpcInput(1, 2, "No thanks.");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'GotPackage',
            rawText: 'InputNpc(1) goto GotPackage'
          },
          {
            type: 'InputNpc',
            params: [2],
            gotoState: 'Begin',
            rawText: 'InputNpc(2) goto Begin'
          }
        ]
      },
      {
        name: 'GotPackage',
        description: 'Deliver package to NPC #2',
        actions: [
          {
            type: 'GiveItem',
            params: [200, 1],
            rawText: 'GiveItem(200, 1);'
          },
          {
            type: 'AddNpcText',
            params: [1, 'Thank you! Please deliver this to NPC #2.'],
            rawText: 'AddNpcText(1, "Thank you! Please deliver this to NPC #2.");'
          }
        ],
        rules: [
          {
            type: 'TalkedToNpc',
            params: [1],
            gotoState: 'DeliverPackage',
            rawText: 'TalkedToNpc(1) goto DeliverPackage'
          }
        ]
      },
      {
        name: 'DeliverPackage',
        description: 'Talk to NPC #2',
        actions: [
          {
            type: 'AddNpcText',
            params: [2, 'Oh, you have a delivery for me?'],
            rawText: 'AddNpcText(2, "Oh, you have a delivery for me?");'
          },
          {
            type: 'AddNpcInput',
            params: [2, 1, 'Yes, here it is.'],
            rawText: 'AddNpcInput(2, 1, "Yes, here it is.");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'ReturnToSender',
            rawText: 'InputNpc(1) goto ReturnToSender'
          },
          {
            type: 'LostItems',
            params: [200, 1],
            gotoState: 'Begin',
            rawText: 'LostItems(200, 1) goto Begin'
          }
        ]
      },
      {
        name: 'ReturnToSender',
        description: 'Return to NPC #1',
        actions: [
          {
            type: 'RemoveItem',
            params: [200, 1],
            rawText: 'RemoveItem(200, 1);'
          },
          {
            type: 'AddNpcText',
            params: [2, 'Thank you! Please tell the sender I received it.'],
            rawText: 'AddNpcText(2, "Thank you! Please tell the sender I received it.");'
          }
        ],
        rules: [
          {
            type: 'TalkedToNpc',
            params: [2],
            gotoState: 'CompleteDelivery',
            rawText: 'TalkedToNpc(2) goto CompleteDelivery'
          }
        ]
      },
      {
        name: 'CompleteDelivery',
        description: 'Talk to NPC #1',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Excellent work! Here is your reward.'],
            rawText: 'AddNpcText(1, "Excellent work! Here is your reward.");'
          }
        ],
        rules: [
          {
            type: 'TalkedToNpc',
            params: [1],
            gotoState: 'Reward',
            rawText: 'TalkedToNpc(1) goto Reward'
          }
        ]
      },
      {
        name: 'Reward',
        description: '',
        actions: [
          {
            type: 'GiveExp',
            params: [500],
            rawText: 'GiveExp(500);'
          },
          {
            type: 'GiveItem',
            params: [1, 250],
            rawText: 'GiveItem(1, 250);'
          },
          {
            type: 'End',
            params: [],
            rawText: 'End();'
          }
        ],
        rules: []
      }
    ],
    randomBlocks: []
  },

  'Collection Quest': {
    questName: 'New Collection Quest',
    version: 1,
    states: [
      {
        name: 'Begin',
        description: 'Talk to NPC',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'I am looking for rare items. Can you help me collect them?'],
            rawText: 'AddNpcText(1, "I am looking for rare items. Can you help me collect them?");'
          },
          {
            type: 'AddNpcText',
            params: [1, 'I need 3 of item #101, 5 of item #102, and 2 of item #103.'],
            rawText: 'AddNpcText(1, "I need 3 of item #101, 5 of item #102, and 2 of item #103.");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 1, 'I will find them.'],
            rawText: 'AddNpcInput(1, 1, "I will find them.");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 2, 'Maybe later.'],
            rawText: 'AddNpcInput(1, 2, "Maybe later.");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'CollectItems',
            rawText: 'InputNpc(1) goto CollectItems'
          },
          {
            type: 'InputNpc',
            params: [2],
            gotoState: 'Begin',
            rawText: 'InputNpc(2) goto Begin'
          }
        ]
      },
      {
        name: 'CollectItems',
        description: 'Collect items',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Let me know when you have all the items.'],
            rawText: 'AddNpcText(1, "Let me know when you have all the items.");'
          }
        ],
        rules: [
          {
            type: 'GotItems',
            params: [101, 3],
            gotoState: 'CheckItems2',
            rawText: 'GotItems(101, 3) goto CheckItems2'
          }
        ]
      },
      {
        name: 'CheckItems2',
        description: 'Collect items',
        actions: [],
        rules: [
          {
            type: 'GotItems',
            params: [102, 5],
            gotoState: 'CheckItems3',
            rawText: 'GotItems(102, 5) goto CheckItems3'
          },
          {
            type: 'LostItems',
            params: [101, 3],
            gotoState: 'CollectItems',
            rawText: 'LostItems(101, 3) goto CollectItems'
          }
        ]
      },
      {
        name: 'CheckItems3',
        description: 'Collect items',
        actions: [],
        rules: [
          {
            type: 'GotItems',
            params: [103, 2],
            gotoState: 'ReturnToNPC',
            rawText: 'GotItems(103, 2) goto ReturnToNPC'
          },
          {
            type: 'LostItems',
            params: [102, 5],
            gotoState: 'CheckItems2',
            rawText: 'LostItems(102, 5) goto CheckItems2'
          }
        ]
      },
      {
        name: 'ReturnToNPC',
        description: 'Return to NPC',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Perfect! You have all the items. Thank you so much!'],
            rawText: 'AddNpcText(1, "Perfect! You have all the items. Thank you so much!");'
          },
          {
            type: 'RemoveItem',
            params: [101, 3],
            rawText: 'RemoveItem(101, 3);'
          },
          {
            type: 'RemoveItem',
            params: [102, 5],
            rawText: 'RemoveItem(102, 5);'
          },
          {
            type: 'RemoveItem',
            params: [103, 2],
            rawText: 'RemoveItem(103, 2);'
          }
        ],
        rules: [
          {
            type: 'TalkedToNpc',
            params: [1],
            gotoState: 'Reward',
            rawText: 'TalkedToNpc(1) goto Reward'
          }
        ]
      },
      {
        name: 'Reward',
        description: '',
        actions: [
          {
            type: 'GiveExp',
            params: [3000],
            rawText: 'GiveExp(3000);'
          },
          {
            type: 'GiveItem',
            params: [1, 2000],
            rawText: 'GiveItem(1, 2000);'
          },
          {
            type: 'End',
            params: [],
            rawText: 'End();'
          }
        ],
        rules: []
      }
    ],
    randomBlocks: []
  },

  'Class Change Quest': {
    questName: 'New Class Change Quest',
    version: 1,
    minLevel: 10,
    states: [
      {
        name: 'Begin',
        description: 'Talk to NPC',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'You have grown strong. Are you ready to advance your class?'],
            rawText: 'AddNpcText(1, "You have grown strong. Are you ready to advance your class?");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 1, 'Yes, I am ready.'],
            rawText: 'AddNpcInput(1, 1, "Yes, I am ready.");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 2, 'Not yet.'],
            rawText: 'AddNpcInput(1, 2, "Not yet.");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'ClassMenu',
            rawText: 'InputNpc(1) goto ClassMenu'
          },
          {
            type: 'InputNpc',
            params: [2],
            gotoState: 'Begin',
            rawText: 'InputNpc(2) goto Begin'
          }
        ]
      },
      {
        name: 'ClassMenu',
        description: 'Choose your class',
        actions: [
          {
            type: 'AddNpcText',
            params: [1, 'Choose your new class:'],
            rawText: 'AddNpcText(1, "Choose your new class:");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 1, 'Warrior'],
            rawText: 'AddNpcInput(1, 1, "Warrior");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 2, 'Mage'],
            rawText: 'AddNpcInput(1, 2, "Mage");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 3, 'Archer'],
            rawText: 'AddNpcInput(1, 3, "Archer");'
          },
          {
            type: 'AddNpcInput',
            params: [1, 4, 'Rogue'],
            rawText: 'AddNpcInput(1, 4, "Rogue");'
          }
        ],
        rules: [
          {
            type: 'InputNpc',
            params: [1],
            gotoState: 'Warrior',
            rawText: 'InputNpc(1) goto Warrior'
          },
          {
            type: 'InputNpc',
            params: [2],
            gotoState: 'Mage',
            rawText: 'InputNpc(2) goto Mage'
          },
          {
            type: 'InputNpc',
            params: [3],
            gotoState: 'Archer',
            rawText: 'InputNpc(3) goto Archer'
          },
          {
            type: 'InputNpc',
            params: [4],
            gotoState: 'Rogue',
            rawText: 'InputNpc(4) goto Rogue'
          }
        ]
      },
      {
        name: 'Warrior',
        description: '',
        actions: [
          {
            type: 'SetClass',
            params: [1],
            rawText: 'SetClass(1);'
          },
          {
            type: 'SetState',
            params: ['ClassMenu'],
            rawText: 'SetState("ClassMenu");'
          }
        ],
        rules: []
      },
      {
        name: 'Mage',
        description: '',
        actions: [
          {
            type: 'SetClass',
            params: [2],
            rawText: 'SetClass(2);'
          },
          {
            type: 'SetState',
            params: ['ClassMenu'],
            rawText: 'SetState("ClassMenu");'
          }
        ],
        rules: []
      },
      {
        name: 'Archer',
        description: '',
        actions: [
          {
            type: 'SetClass',
            params: [3],
            rawText: 'SetClass(3);'
          },
          {
            type: 'SetState',
            params: ['ClassMenu'],
            rawText: 'SetState("ClassMenu");'
          }
        ],
        rules: []
      },
      {
        name: 'Rogue',
        description: '',
        actions: [
          {
            type: 'SetClass',
            params: [4],
            rawText: 'SetClass(4);'
          },
          {
            type: 'SetState',
            params: ['ClassMenu'],
            rawText: 'SetState("ClassMenu");'
          }
        ],
        rules: []
      }
    ],
    randomBlocks: []
  }
};

export const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  'Fetch Quest': 'Simple quest where player collects items and returns to NPC for a reward.',
  'Kill Quest': 'Combat-focused quest where player must defeat a certain number of monsters.',
  'Delivery Quest': 'Multi-stage quest involving picking up and delivering items between NPCs.',
  'Collection Quest': 'Complex quest requiring multiple different items with validation checks.',
  'Class Change Quest': 'Repeatable quest allowing players to change their class freely.'
};
