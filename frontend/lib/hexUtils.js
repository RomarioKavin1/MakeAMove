"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHexGrid = exports.getPossibleAttackTargets = exports.getPlacementPositions = exports.getPossibleMoves = exports.getHexDistance = exports.isInBounds = exports.getNeighbors = exports.calculateHexPosition = void 0;
// Calculate pixel position from hex coordinates
// Using axial coordinates for perfect hexagon tiling
const calculateHexPosition = (position, size) => {
    // Constants for perfect hexagon tiling
    // Width of a hexagon is 2*size
    // Height of a hexagon is sqrt(3)*size
    const width = size * 2;
    const height = size * Math.sqrt(3);
    // For flat-topped hexagons that perfectly share edges:
    const x = position.q * ((width * 3) / 4); // Each column is offset by 3/4 of the width
    const y = position.r * height + (position.q % 2) * (height / 2); // Odd columns are offset vertically
    return { x, y };
};
exports.calculateHexPosition = calculateHexPosition;
// Get all neighboring hex positions
const getNeighbors = (position) => {
    // Different neighbor patterns for even and odd columns
    const directions = position.q % 2 === 0
        ? // Even q
            [
                { q: 1, r: 0 }, // right
                { q: 0, r: 1 }, // bottom right
                { q: -1, r: 1 }, // bottom left
                { q: -1, r: 0 }, // left
                { q: -1, r: -1 }, // top left
                { q: 0, r: -1 }, // top right
            ]
        : // Odd q
            [
                { q: 1, r: 0 }, // right
                { q: 1, r: 1 }, // bottom right
                { q: 0, r: 1 }, // bottom left
                { q: -1, r: 0 }, // left
                { q: 0, r: -1 }, // top left
                { q: 1, r: -1 }, // top right
            ];
    return directions.map((dir) => ({
        q: position.q + dir.q,
        r: position.r + dir.r,
    }));
};
exports.getNeighbors = getNeighbors;
// Check if position is within grid bounds
const isInBounds = (position, gridSize) => {
    // For a 10x10 grid centered around 0,0
    return (position.q >= -5 &&
        position.q <= 4 && // 10 columns (-5 to 4)
        position.r >= -5 &&
        position.r <= 4); // 10 rows (-5 to 4)
};
exports.isInBounds = isInBounds;
// Get the distance between two hex positions
const getHexDistance = (a, b) => {
    // Use cube coordinates distance formula
    const ac = axialToCube(a);
    const bc = axialToCube(b);
    return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
};
exports.getHexDistance = getHexDistance;
// Find all possible move positions for a unit
// Fix for the hexUtils.ts file to allow movement into enemy territory
const getPossibleMoves = (unit, tiles, gridSize) => {
    if (!unit.position)
        return [];
    // Use the unit's movement range
    const movementRange = unit.movementRange || 1;
    console.log(`Calculating moves for unit at ${unit.position.q},${unit.position.r} with ${movementRange} move range`);
    const possibleMoves = [];
    const visited = new Set();
    const queue = [
        { pos: unit.position, moveCost: 0 },
    ];
    // BFS to find all tiles within movement range
    while (queue.length > 0) {
        const { pos, moveCost } = queue.shift();
        const key = `${pos.q},${pos.r}`;
        // Skip if we've visited this tile or if it's outside the unit's movement range
        if (visited.has(key) || moveCost > movementRange)
            continue;
        visited.add(key);
        // If this isn't the starting position, it's a possible move
        if (moveCost > 0) {
            possibleMoves.push(pos);
        }
        // Get all adjacent tiles
        const neighbors = getAdjacentPositions(pos);
        // Check each neighbor
        for (const neighbor of neighbors) {
            // Skip out-of-bounds positions
            if (neighbor.q < -gridSize ||
                neighbor.q > gridSize ||
                neighbor.r < -gridSize ||
                neighbor.r > gridSize) {
                continue;
            }
            const neighborKey = `${neighbor.q},${neighbor.r}`;
            if (visited.has(neighborKey))
                continue;
            // Check if this tile is valid (exists and is not occupied)
            const tile = tiles.find((t) => t.position.q === neighbor.q && t.position.r === neighbor.r);
            if (!tile)
                continue; // Skip if tile doesn't exist
            // Skip if tile is occupied by another unit or a fortress
            if (tile.unit && tile.unit.instanceId !== unit.instanceId)
                continue;
            if (tile.fortress)
                continue;
            // Account for terrain movement cost
            const additionalCost = 1;
            const newMoveCost = moveCost + additionalCost;
            // If within movement range, add to queue
            if (newMoveCost <= movementRange) {
                queue.push({ pos: neighbor, moveCost: newMoveCost });
            }
        }
    }
    console.log(`Found ${possibleMoves.length} possible moves`);
    return possibleMoves;
};
exports.getPossibleMoves = getPossibleMoves;
// Find placement positions for deploying new units (for player)
// Corrected getPlacementPositions function that only allows placement adjacent to player fortresses
const getPlacementPositions = (tiles) => {
    // Get all empty tiles that are adjacent to friendly fortresses
    const placementPositions = [];
    // Step 1: Find all player fortresses
    const playerFortressPositions = tiles
        .filter((tile) => tile.fortress && tile.fortress.owner === "player")
        .map((tile) => tile.position);
    // Step 2: Get all adjacent tiles to player fortresses
    const adjacentPositions = new Set();
    for (const position of playerFortressPositions) {
        // Add all adjacent positions
        const neighbors = getAdjacentPositions(position);
        for (const neighbor of neighbors) {
            adjacentPositions.add(`${neighbor.q},${neighbor.r}`);
        }
    }
    // Step 3: Filter to only include tiles that exist and are empty
    for (const posKey of adjacentPositions) {
        const [q, r] = posKey.split(",").map(Number);
        // Find this tile
        const tile = tiles.find((t) => t.position.q === q && t.position.r === r);
        // If tile exists and is empty (no unit or fortress), it's a valid placement
        if (tile && !tile.unit && !tile.fortress) {
            placementPositions.push({ q, r });
        }
    }
    return placementPositions;
};
exports.getPlacementPositions = getPlacementPositions;
// Helper function to get adjacent positions
function getAdjacentPositions(position) {
    const { q, r } = position;
    // The 6 directions in a hex grid
    const directions = [
        { q: 1, r: 0 }, // Right
        { q: 1, r: -1 }, // Top Right
        { q: 0, r: -1 }, // Top Left
        { q: -1, r: 0 }, // Left
        { q: -1, r: 1 }, // Bottom Left
        { q: 0, r: 1 }, // Bottom Right
    ];
    return directions.map((dir) => ({
        q: q + dir.q,
        r: r + dir.r,
    }));
}
// Find all possible attack targets for a unit
const getPossibleAttackTargets = (unit, tiles, gridSize) => {
    if (!unit.position)
        return [];
    // Use the unit's range property - crucial for attack range calculation
    const attackRange = unit.range || 1; // Default to 1 if not specified
    console.log(`Calculating attack targets for unit at ${unit.position.q},${unit.position.r} with range ${attackRange}`);
    const targets = [];
    // Check each tile to see if it's within attack range
    for (const tile of tiles) {
        // Skip if this is the unit's own position
        if (tile.position.q === unit.position.q &&
            tile.position.r === unit.position.r) {
            continue;
        }
        // Calculate distance using hex grid distance formula
        const distance = (0, exports.getHexDistance)(unit.position, tile.position);
        console.log(`Distance to (${tile.position.q}, ${tile.position.r}): ${distance}`);
        // If within attack range, check if there's a valid target
        if (distance <= attackRange) {
            // Check if tile has an enemy unit or fortress
            const hasEnemyUnit = tile.unit && tile.unit.owner !== unit.owner;
            const hasEnemyFortress = tile.fortress && tile.fortress.owner !== unit.owner;
            // Add to targets if there's an enemy unit or fortress
            if (hasEnemyUnit || hasEnemyFortress) {
                targets.push(tile.position);
                if (hasEnemyUnit) {
                    console.log(`Found enemy unit at (${tile.position.q}, ${tile.position.r})`);
                }
                else {
                    console.log(`Found enemy fortress at (${tile.position.q}, ${tile.position.r})`);
                }
            }
        }
    }
    console.log(`Found ${targets.length} possible attack targets`);
    return targets;
};
exports.getPossibleAttackTargets = getPossibleAttackTargets;
// Make sure you have this function to calculate hex distance
// Helper to convert axial to cube coordinates
const axialToCube = (axial) => {
    const x = axial.q;
    const z = axial.r;
    const y = -x - z;
    return { x, y, z };
};
// Helper function to check if a unit is an enemy
const isEnemy = (unit1, unit2) => {
    // For this simple version, we'll determine ownership by position (q value)
    // Player units have negative q, AI units have positive q
    const isUnit1Player = unit1.position.q < 0;
    const isUnit2Player = unit2.position.q < 0;
    return isUnit1Player !== isUnit2Player;
};
// Helper function to check if a fortress is an enemy fortress
const isEnemyFortress = (unit, fortress) => {
    // Player units should attack AI fortresses and vice versa
    const isUnitPlayer = unit.position.q < 0;
    return isUnitPlayer ? fortress.owner === "ai" : fortress.owner === "player";
};
// Create terrain types with biome regions for a 10x10 grid
const generateHexGrid = (gridSize) => {
    const tiles = [];
    const terrainTypes = [
        "plains",
        "forest",
        "mountain",
        "water",
        "desert",
        "swamp",
    ];
    // Define terrain properties
    const terrainProperties = {
        plains: {
            movementCost: 1,
            defenseBonus: 0,
            attackBonus: 0,
            isPassable: true,
            imageUrl: "/assets/terrains/plains.png",
        },
        forest: {
            movementCost: 2,
            defenseBonus: 1,
            attackBonus: 0,
            isPassable: true,
            imageUrl: "/assets/terrains/forest.png",
        },
        mountain: {
            movementCost: 3,
            defenseBonus: 2,
            attackBonus: 1,
            isPassable: true,
            imageUrl: "/assets/terrains/mountain.png",
        },
        water: {
            movementCost: 2,
            defenseBonus: 0,
            attackBonus: 0,
            isPassable: false,
            imageUrl: "/assets/terrains/water.png",
        },
        desert: {
            movementCost: 2,
            defenseBonus: 0,
            attackBonus: 0,
            isPassable: true,
            imageUrl: "/assets/terrains/desert.png",
        },
        swamp: {
            movementCost: 3,
            defenseBonus: 1,
            attackBonus: -1,
            isPassable: true,
            imageUrl: "/assets/terrains/swamp.png",
        },
        healing: {
            movementCost: 1,
            defenseBonus: 0,
            attackBonus: 0,
            isPassable: true,
            healAmount: 2,
            imageUrl: "/assets/terrains/healing.png",
        },
    };
    // Create the terrain with biome regions
    // Use simplex noise or other methods to create coherent terrain patterns
    for (let q = -5; q <= 4; q++) {
        for (let r = -5; r <= 4; r++) {
            // Create a new tile at this position
            const position = { q, r };
            // Generate terrain based on position (creating biome regions)
            let terrainType;
            // Simple biome regions
            // Player side (forest/plains biome)
            if (q < -2) {
                terrainType = Math.random() > 0.65 ? "forest" : "plains";
            }
            // Middle contested area (mixed terrain)
            else if (q >= -2 && q <= 1) {
                const rand = Math.random();
                if (rand < 0.5) {
                    terrainType = "plains";
                }
                else if (rand < 0.7) {
                    terrainType = "forest";
                }
                else if (rand < 0.8) {
                    terrainType = "mountain";
                }
                else if (rand < 0.9) {
                    terrainType = "water";
                }
                else {
                    terrainType = "swamp";
                }
            }
            // AI side (desert/mountain biome)
            else {
                terrainType = Math.random() > 0.65 ? "desert" : "plains";
            }
            // Create a small river across the middle
            if ((q === 0 || q === -1) && r >= -3 && r <= 2 && Math.random() > 0.5) {
                terrainType = "water";
            }
            // Add healing tiles (one per side in strategic locations)
            if ((q === -4 && r === 0) || (q === 3 && r === 0)) {
                terrainType = "healing";
            }
            // Create the tile
            tiles.push({
                position,
                terrain: {
                    type: terrainType,
                    ...terrainProperties[terrainType],
                },
            });
        }
    }
    return tiles;
};
exports.generateHexGrid = generateHexGrid;
