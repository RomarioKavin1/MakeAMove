module make_a_move_addr::make_a_move {
    use std::error;
    use std::signer;
    use std::string::String;
    use std::vector;
    use std::option::{Self, Option};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    
    const ENOT_INITIALIZED: u64 = 1;
    const ENOT_OWNER: u64 = 2;
    const EINVALID_PLAYER: u64 = 3;
    const EGAME_ALREADY_FINISHED: u64 = 4;
    const EGAME_NOT_FOUND: u64 = 5;
    const EINVALID_UNIT_ID: u64 = 6;
    const EINVALID_FORTRESS_ID: u64 = 7;

    struct Position has store, copy, drop {
        q: u8,
        r: u8,
    }

    struct Unit has store, copy, drop {
        id: u64,
        unit_type: String,
        position: Position,
        health: u64,
        attack: u64,
        owner: address,
    }

    struct Fortress has store, copy, drop {
        id: u64,
        position: Position,
        health: u64,
        owner: address,
    }

    struct GameState has store, copy, drop {
        units: vector<Unit>,
        fortresses: vector<Fortress>,
        player_turn: address,
        turn_number: u64,
        finished: bool,
        winner: address,
    }

    struct Game has store {
        id: u64,
        player: address,
        ai_agent: address,
        initial_state: GameState,
        current_state: GameState,
        final_state: Option<GameState>,
    }

    struct GameStore has key {
        games: vector<Game>,
        next_game_id: u64,
    }

    #[event]
    struct GameCreated has drop, store {
        game_id: u64,
        player: address,
        ai_agent: address,
        timestamp: u64,
    }

    #[event]
    struct GameFinished has drop, store {
        game_id: u64,
        winner: address,
        timestamp: u64,
    }

    fun init_module(creator: &signer) {
        move_to(creator, GameStore {
            games: vector::empty<Game>(),
            next_game_id: 1,
        });
    }

    public entry fun create_game(
        creator: &signer,
        ai_agent: address,
        player_starts: bool
    ) acquires GameStore {
        let creator_addr = signer::address_of(creator);
        
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        
        let first_player = if (player_starts) { creator_addr } else { ai_agent };
        
        let initial_state = GameState {
            units: vector::empty<Unit>(),
            fortresses: vector::empty<Fortress>(),
            player_turn: first_player,
            turn_number: 1,
            finished: false,
            winner: @0x0,
        };
        
        let game_id = game_store.next_game_id;
        let game = Game {
            id: game_id,
            player: creator_addr,
            ai_agent,
            initial_state: initial_state,
            current_state: initial_state,
            final_state: option::none(),
        };
        
        // Store the game
        vector::push_back(&mut game_store.games, game);
        
        // Increment next game id
        game_store.next_game_id = game_store.next_game_id + 1;
        
        // Emit game created event
        event::emit(GameCreated {
            game_id,
            player: creator_addr,
            ai_agent,
            timestamp: timestamp::now_seconds(),
        });
    }

    public entry fun add_unit(
        player: &signer,
        game_id: u64,
        unit_id: u64,
        unit_type: String,
        position_q: u8,
        position_r: u8,
        health: u64,
        attack: u64
    ) acquires GameStore {
        let player_addr = signer::address_of(player);
        
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        // Get the game
        let game = vector::borrow_mut(&mut game_store.games, game_idx);
        
        // Check if caller is either the player or the AI agent
        assert!(
            player_addr == game.player || player_addr == game.ai_agent,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Check game is not finished
        assert!(option::is_none(&game.final_state), error::invalid_state(EGAME_ALREADY_FINISHED));
        
        // Check if we're in the initial setup phase (turn 1)
        let is_initial_phase = game.current_state.turn_number == 1;
        
        // Create unit
        let unit = Unit {
            id: unit_id,
            unit_type,
            position: Position { q: position_q, r: position_r },
            health,
            attack,
            owner: player_addr,
        };
        
        // Add to current state
        vector::push_back(&mut game.current_state.units, unit);
        
        // Also add to initial state if we're still in setup phase
        if (is_initial_phase) {
            // Need to reconstruct the unit because we can't use it twice
            let initial_unit = Unit {
                id: unit_id,
                unit_type,
                position: Position { q: position_q, r: position_r },
                health,
                attack,
                owner: player_addr,
            };
            vector::push_back(&mut game.initial_state.units, initial_unit);
        }
    }

    // ===== Add a fortress to the game =====
    public entry fun add_fortress(
        player: &signer,
        game_id: u64,
        fortress_id: u64,
        position_q: u8,
        position_r: u8,
        health: u64
    ) acquires GameStore {
        let player_addr = signer::address_of(player);
        
        // Get the game store
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        
        // Find the game
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        // Get the game
        let game = vector::borrow_mut(&mut game_store.games, game_idx);
        
        // Check if caller is either the player or the AI agent
        assert!(
            player_addr == game.player || player_addr == game.ai_agent,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Check game is not finished
        assert!(option::is_none(&game.final_state), error::invalid_state(EGAME_ALREADY_FINISHED));
        
        // Check if we're in the initial setup phase (turn 1)
        let is_initial_phase = game.current_state.turn_number == 1;
        
        // Create fortress
        let fortress = Fortress {
            id: fortress_id,
            position: Position { q: position_q, r: position_r },
            health,
            owner: player_addr,
        };
        
        // Add to current state
        vector::push_back(&mut game.current_state.fortresses, fortress);
        
        // Also add to initial state if we're still in setup phase
        if (is_initial_phase) {
            // Need to reconstruct the fortress because we can't use it twice
            let initial_fortress = Fortress {
                id: fortress_id,
                position: Position { q: position_q, r: position_r },
                health,
                owner: player_addr,
            };
            vector::push_back(&mut game.initial_state.fortresses, initial_fortress);
        }
    }

    // ===== Update a unit in the game =====
    public entry fun update_unit(
        player: &signer,
        game_id: u64,
        unit_id: u64,
        new_position_q: u8,
        new_position_r: u8,
        new_health: u64
    ) acquires GameStore {
        let player_addr = signer::address_of(player);
        
        // Get the game store
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        
        // Find the game
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        // Get the game
        let game = vector::borrow_mut(&mut game_store.games, game_idx);
        
        // Check if caller is either the player or the AI agent
        assert!(
            player_addr == game.player || player_addr == game.ai_agent,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Check game is not finished
        assert!(option::is_none(&game.final_state), error::invalid_state(EGAME_ALREADY_FINISHED));
        
        // Find and update the unit
        let units_len = vector::length(&game.current_state.units);
        let unit_idx = 0;
        let found = false;
        
        let i = 0;
        while (i < units_len) {
            let unit = vector::borrow(&game.current_state.units, i);
            if (unit.id == unit_id) {
                unit_idx = i;
                found = true;
                break
            };
            i = i + 1;
        };
        
        assert!(found, error::invalid_argument(EINVALID_UNIT_ID));
        
        let unit = vector::borrow_mut(&mut game.current_state.units, unit_idx);
        unit.position.q = new_position_q;
        unit.position.r = new_position_r;
        unit.health = new_health;
    }

    // ===== Update a fortress in the game =====
    public entry fun update_fortress(
        player: &signer,
        game_id: u64,
        fortress_id: u64,
        new_health: u64
    ) acquires GameStore {
        let player_addr = signer::address_of(player);
        
        // Get the game store
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        
        // Find the game
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        // Get the game
        let game = vector::borrow_mut(&mut game_store.games, game_idx);
        
        // Check if caller is either the player or the AI agent
        assert!(
            player_addr == game.player || player_addr == game.ai_agent,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Check game is not finished
        assert!(option::is_none(&game.final_state), error::invalid_state(EGAME_ALREADY_FINISHED));
        
        // Find and update the fortress
        let fortresses_len = vector::length(&game.current_state.fortresses);
        let fortress_idx = 0;
        let found = false;
        
        let i = 0;
        while (i < fortresses_len) {
            let fortress = vector::borrow(&game.current_state.fortresses, i);
            if (fortress.id == fortress_id) {
                fortress_idx = i;
                found = true;
                break
            };
            i = i + 1;
        };
        
        assert!(found, error::invalid_argument(EINVALID_FORTRESS_ID));
        
        let fortress = vector::borrow_mut(&mut game.current_state.fortresses, fortress_idx);
        fortress.health = new_health;
    }

    // ===== Complete a game turn =====
    public entry fun complete_turn(
        player: &signer,
        game_id: u64
    ) acquires GameStore {
        let player_addr = signer::address_of(player);
        
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        let game = vector::borrow_mut(&mut game_store.games, game_idx);
        
        // Check if caller is the current player
        assert!(
            player_addr == game.current_state.player_turn,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        assert!(option::is_none(&game.final_state), error::invalid_state(EGAME_ALREADY_FINISHED));
        
        // Switch player turn
        if (game.current_state.player_turn == game.player) {
            game.current_state.player_turn = game.ai_agent;
        } else {
            game.current_state.player_turn = game.player;
            // Increment turn counter when AI ends turn
            game.current_state.turn_number = game.current_state.turn_number + 1;
        }
    }

    public entry fun finish_game(
        player: &signer,
        game_id: u64,
        winner: address
    ) acquires GameStore {
        let player_addr = signer::address_of(player);
        
        // Get the game store
        let game_store = borrow_global_mut<GameStore>(@make_a_move_addr);
        
        // Find the game
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        // Get the game
        let game = vector::borrow_mut(&mut game_store.games, game_idx);
        
        // Check if caller is either the player or the AI agent
        assert!(
            player_addr == game.player || player_addr == game.ai_agent,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Check if game isn't already finished
        assert!(option::is_none(&game.final_state), error::invalid_state(EGAME_ALREADY_FINISHED));
        
        let mut_final_state = game.current_state;
        mut_final_state.finished = true;
        mut_final_state.winner = winner;
        mut_final_state.player_turn = @0x0; // No more turns
        
        game.final_state = option::some(mut_final_state);
        
        event::emit(GameFinished {
            game_id,
            winner,
            timestamp: timestamp::now_seconds(),
        });
    }

    fun find_game_by_id(game_store: &GameStore, game_id: u64): (bool, u64) {
        let games_len = vector::length(&game_store.games);
        let i = 0;
        
        while (i < games_len) {
            let game = vector::borrow(&game_store.games, i);
            if (game.id == game_id) {
                return (true, i)
            };
            i = i + 1;
        };
        
        (false, 0)
    }

    #[view]
    public fun get_game(game_id: u64): (address, address, u64, address, bool, address) acquires GameStore {
        let game_store = borrow_global<GameStore>(@make_a_move_addr);
        
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        let game = vector::borrow(&game_store.games, game_idx);
        
        (
            game.player,
            game.ai_agent,
            game.current_state.turn_number,
            game.current_state.player_turn,
            option::is_some(&game.final_state),
            if (option::is_some(&game.final_state)) {
                option::borrow(&game.final_state).winner
            } else {
                @0x0
            }
        )
    }

    #[view]
    public fun get_player_games(player: address): vector<u64> acquires GameStore {
        let game_store = borrow_global<GameStore>(@make_a_move_addr);
        let game_ids = vector::empty<u64>();
        
        let games_len = vector::length(&game_store.games);
        let i = 0;
        
        while (i < games_len) {
            let game = vector::borrow(&game_store.games, i);
            if (game.player == player || game.ai_agent == player) {
                vector::push_back(&mut game_ids, game.id);
            };
            i = i + 1;
        };
        
        game_ids
    }

    #[view]
    public fun get_game_units(game_id: u64): vector<Unit> acquires GameStore {
        let game_store = borrow_global<GameStore>(@make_a_move_addr);
        
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        let game = vector::borrow(&game_store.games, game_idx);
        
        game.current_state.units
    }

    #[view]
    public fun get_game_fortresses(game_id: u64): vector<Fortress> acquires GameStore {
        let game_store = borrow_global<GameStore>(@make_a_move_addr);
        
        let (found, game_idx) = find_game_by_id(game_store, game_id);
        assert!(found, error::not_found(EGAME_NOT_FOUND));
        
        let game = vector::borrow(&game_store.games, game_idx);
        
        game.current_state.fortresses
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}