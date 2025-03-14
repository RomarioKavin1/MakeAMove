// src/lib/cardUtils.ts
import { Card, CardType } from "@/types/Card";
import { TerrainType } from "@/types/Terrain";

// Export the card database so it can be used by other components
export // Create a sample card database
const cardDatabase: Card[] = [
  // Warrior Cards
  {
    id: "warrior-1",
    name: "Elite Guardian",
    type: "warrior",
    description: "A stalwart defender with enhanced capabilities in mountains.",
    imageUrl: "/assets/cards/warrior-1.png",
    rarity: "rare",
    attack: 4,
    health: 8,
    maxHealth: 8,
    range: 1,
    movementRange: 1,
    terrainEffects: [
      { type: "mountain", defenseBonus: 2, attackBonus: 1 },
      { type: "water", movementPenalty: 1 },
    ],
    targetBonuses: [{ targetType: "archer", attackBonus: 1 }],
    specialAbility: {
      name: "Shield Wall",
      description: "Gains +2 defense for one turn",
      cooldown: 3,
      currentCooldown: 0,
    },
  },
  {
    id: "warrior-2",
    name: "Berserker",
    type: "warrior",
    description: "A fierce warrior that excels in forest combat.",
    imageUrl: "/assets/cards/warrior-2.png",
    rarity: "uncommon",
    attack: 5,
    health: 6,
    maxHealth: 6,
    range: 1,
    movementRange: 2,
    terrainEffects: [
      { type: "forest", attackBonus: 2 },
      { type: "desert", movementPenalty: 1 },
    ],
    targetBonuses: [{ targetType: "mage", attackBonus: 2 }],
  },

  // Archer Cards
  {
    id: "archer-1",
    name: "Elven Sharpshooter",
    type: "archer",
    description: "A precise archer with extended range and forest affinity.",
    imageUrl: "/assets/cards/archer-1.png",
    rarity: "rare",
    attack: 3,
    health: 4,
    maxHealth: 4,
    range: 3,
    movementRange: 1,
    terrainEffects: [
      { type: "forest", attackBonus: 1 },
      { type: "mountain", attackBonus: 1 },
    ],
    targetBonuses: [{ targetType: "warrior", attackBonus: 1 }],
  },
  {
    id: "archer-2",
    name: "Desert Sniper",
    type: "archer",
    description: "A skilled archer adapted to desert environments.",
    imageUrl: "/assets/cards/archer-2.png",
    rarity: "uncommon",
    attack: 4,
    health: 3,
    maxHealth: 3,
    range: 2,
    movementRange: 1,
    terrainEffects: [
      { type: "desert", attackBonus: 2, defenseBonus: 1 },
      { type: "forest", movementPenalty: 1 },
    ],
    targetBonuses: [{ targetType: "fortress", attackBonus: 1 }],
  },

  // Healer Cards
  {
    id: "healer-1",
    name: "Divine Cleric",
    type: "healer",
    description: "A holy healer who can restore health to nearby allies.",
    imageUrl: "/assets/cards/healer-1.png",
    rarity: "rare",
    attack: 1,
    health: 5,
    maxHealth: 5,
    range: 1,
    movementRange: 1,
    terrainEffects: [{ type: "healing", defenseBonus: 1 }],
    targetBonuses: [],
    specialAbility: {
      name: "Heal",
      description: "Restore 2 health to an adjacent ally",
      cooldown: 2,
      currentCooldown: 0,
    },
  },

  // Tank Cards
  {
    id: "tank-1",
    name: "Mountain Guardian",
    type: "tank",
    description:
      "A heavily armored defender that excels in mountainous terrain.",
    imageUrl: "/assets/cards/tank-1.png",
    rarity: "legendary",
    attack: 2,
    health: 10,
    maxHealth: 10,
    range: 1,
    movementRange: 1,
    terrainEffects: [
      { type: "mountain", defenseBonus: 3 },
      { type: "swamp", movementPenalty: 1 },
    ],
    targetBonuses: [{ targetType: "fortress", attackBonus: 2 }],
    specialAbility: {
      name: "Bulwark",
      description: "Becomes immovable and gains +3 defense for one turn",
      cooldown: 4,
      currentCooldown: 0,
    },
  },

  // Mage Cards
  {
    id: "mage-1",
    name: "Arcane Pyromancer",
    type: "mage",
    description: "A powerful fire mage with area damage capabilities.",
    imageUrl: "/assets/cards/mage-1.png",
    rarity: "legendary",
    attack: 5,
    health: 3,
    maxHealth: 3,
    range: 2,
    movementRange: 1,
    terrainEffects: [
      { type: "desert", attackBonus: 1 },
      { type: "water", movementPenalty: 1 },
    ],
    targetBonuses: [
      { targetType: "archer", attackBonus: 1 },
      { targetType: "tank", attackBonus: 2 },
    ],
    specialAbility: {
      name: "Fireball",
      description: "Deal 3 damage to all enemies in a 1-hex radius",
      cooldown: 3,
      currentCooldown: 0,
    },
  },
  {
    id: "mage-2",
    name: "Swamp Witch",
    type: "mage",
    description: "A cunning spell caster who thrives in swampy terrain.",
    imageUrl: "/assets/cards/mage-2.png",
    rarity: "rare",
    attack: 4,
    health: 4,
    maxHealth: 4,
    range: 2,
    movementRange: 1,
    terrainEffects: [
      { type: "swamp", attackBonus: 2, defenseBonus: 1 },
      { type: "desert", movementPenalty: 1 },
    ],
    targetBonuses: [{ targetType: "warrior", attackBonus: 1 }],
  },

  // Scout Cards
  {
    id: "scout-1",
    name: "Swift Pathfinder",
    type: "scout",
    description: "A nimble scout with enhanced movement capabilities.",
    imageUrl: "/assets/cards/scout-1.png",
    rarity: "uncommon",
    attack: 2,
    health: 4,
    maxHealth: 4,
    range: 1,
    movementRange: 3,
    terrainEffects: [
      { type: "forest", movementPenalty: -1 }, // Negative penalty = bonus
      { type: "mountain", movementPenalty: 0 }, // No mountain penalty
    ],
    targetBonuses: [{ targetType: "mage", attackBonus: 1 }],
  },
  {
    id: "scout-2",
    name: "Desert Nomad",
    type: "scout",
    description: "A resourceful scout adapted to desert travel.",
    imageUrl: "/assets/cards/scout-2.png",
    rarity: "common",
    attack: 3,
    health: 3,
    maxHealth: 3,
    range: 1,
    movementRange: 2,
    terrainEffects: [
      { type: "desert", movementPenalty: -1 }, // Move faster in desert
      { type: "swamp", movementPenalty: 1 },
    ],
    targetBonuses: [],
  },
];

// Function to get a random selection of cards
export const sampleCards = (count: number): Card[] => {
  // Shuffle the card database
  const shuffled = [...cardDatabase].sort(() => 0.5 - Math.random());

  // Return the specified number of cards
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Function to get a card by ID
export const getCardById = (id: string): Card | undefined => {
  return cardDatabase.find((card) => card.id === id);
};

// Function to get all cards of a specific type
export const getCardsByType = (type: CardType): Card[] => {
  return cardDatabase.filter((card) => card.type === type);
};

// Function to get all cards with an advantage on a specific terrain
export const getCardsByTerrainAdvantage = (terrain: TerrainType): Card[] => {
  return cardDatabase.filter((card) =>
    card.terrainEffects.some(
      (effect) =>
        effect.type === terrain &&
        (effect.attackBonus! > 0 ||
          effect.defenseBonus! > 0 ||
          effect.movementPenalty! < 0)
    )
  );
};

// Function to get all cards with a target bonus against a specific type
export const getCardsByTargetAdvantage = (
  targetType: CardType | "fortress"
): Card[] => {
  return cardDatabase.filter((card) =>
    card.targetBonuses.some(
      (bonus) => bonus.targetType === targetType && bonus.attackBonus > 0
    )
  );
};

// Function to create placeholder card images for missing assets during development
export function getPlaceholderCardImageUrl(cardType: CardType): string {
  const colors: Record<CardType, string> = {
    warrior: "red",
    archer: "green",
    healer: "white",
    tank: "blue",
    mage: "purple",
    scout: "yellow",
  };

  const color = colors[cardType] || "gray";
  return `https://via.placeholder.com/120x160/${color}/000000?text=${cardType}`;
}
