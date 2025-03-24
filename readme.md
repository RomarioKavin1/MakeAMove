# MakeAMove: Tactical Blockchain Battles

MakeAMove is a strategic turn-based hexagonal grid game built on the Aptos blockchain. Players can deploy units, engage in tactical combat, and compete against an AI opponent powered by Claude AI.

## Game Overview

In MakeAMove, players engage in tactical turn-based battles on a hexagonal grid. The game combines elements of strategy board games with blockchain technology, allowing players to:

- Deploy different types of units with unique abilities
- Control fortress structures for strategic advantage
- Execute tactical movements and attacks
- Compete against an advanced AI opponent

The game features pixel art visuals and a retro arcade aesthetic while leveraging modern blockchain technology for verification and persistence of game results.

## Technical Architecture

### Smart Contracts

The game's core logic is implemented as a Move smart contract on the Aptos blockchain. The contract handles:

- Game state management
- Unit and fortress tracking
- Turn validation
- Win condition verification
- On-chain event recording

### Contract Deployments

- **Core Contract**: 0x11e2d0c73089ef8d8a5758bd85c5a00101ab43b97123eae32e2dc8309cf880e4 (https://explorer.aptoslabs.com/txn/0x0861ca9efda18b0b66b47332dddb5eb4c035f1cad811a901d90df7c470b27ccd?network=testnet)
- **Network**: Aptos Testnet

### Game Mechanics

1. **Setup Phase**: Players and AI deploy units on the board
2. **Battle Phase**: Players take turns moving units and attacking enemies
3. **Win Conditions**: Destroy all enemy fortresses or units

### Core Components

#### Units

Units are the main combatants in the game with properties including:

- Health and attack power
- Movement range
- Unit type (infantry, artillery, etc.)
- Special abilities

#### Fortresses

Fortresses serve as critical strategic points that:

- Provide deployment zones
- Must be defended to prevent defeat
- Can be captured for strategic advantage

#### Terrain

The hexagonal grid features various terrain types that affect gameplay:

- Movement costs
- Defensive bonuses
- Attack modifiers
- Special effects (healing, damage, etc.)

### AI Agent

The game features a sophisticated AI opponent powered by Claude AI through the LangChain framework. The AI:

- Analyzes the current game state to make strategic decisions
- Prioritizes actions based on unit health, positioning, and terrain
- Executes complex tactical maneuvers
- Records game results on the blockchain

The AI agent implements a multi-step decision process:

1. Analyze the current board state
2. Prioritize high-value targets
3. Determine optimal movements and attacks
4. Execute the chosen action

## Frontend

The game's frontend is built with Next.js and features:

- Interactive hexagonal grid system
- Animated unit combat
- Wallet integration with Petra Wallet
- Real-time game state visualization
- Responsive design for different devices

## Blockchain Integration

MakeAMove leverages the Aptos blockchain for:

- Verifiable game results
- Transaction history
- Smart contract-based game logic
- On-chain event tracking

Key smart contract events:

- `GameCreated`: Records new game creation with parameters
- `GameFinished`: Records final game state and results

## Future Development

Future plans for MakeAMove include:

- Player vs. player modes
- Tournaments with prizes
- Additional unit types and abilities
- Customizable decks and strategies
- Enhanced AI capabilities

---
