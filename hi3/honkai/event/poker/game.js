
// A Fool's Hand - Complete Game Implementation

// Game Constants
const SUITS = {
    SWORD: 'sword',
    TROPHY: 'trophy',
    SCEPTER: 'scepter',
    STAR: 'star'
};

const RANKS = {
    TWO: '2', THREE: '3', FOUR: '4', FIVE: '5',
    SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9',
    TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A'
};

const HAND_TYPES = {
    HIGH_CARD: 'high_card',
    ONE_PAIR: 'one_pair',
    TWO_PAIR: 'two_pair',
    THREE_KIND: 'three_kind',
    STRAIGHT: 'straight',
    FLUSH: 'flush',
    FULL_HOUSE: 'full_house',
    FOUR_KIND: 'four_kind',
    STRAIGHT_FLUSH: 'straight_flush',
    ROYAL_FLUSH: 'royal_flush'
};

// Card value mapping
const CARD_VALUES = {
    [RANKS.TWO]: 2, [RANKS.THREE]: 3, [RANKS.FOUR]: 4, [RANKS.FIVE]: 5,
    [RANKS.SIX]: 6, [RANKS.SEVEN]: 7, [RANKS.EIGHT]: 8, [RANKS.NINE]: 9,
    [RANKS.TEN]: 10, [RANKS.JACK]: 10, [RANKS.QUEEN]: 10, [RANKS.KING]: 10,
    [RANKS.ACE]: 11
};

// Suit symbols and colors
const SUIT_SYMBOLS = {
    [SUITS.SWORD]: '\u2694\ufe0f',
    [SUITS.TROPHY]: '\ud83c\udfc6',
    [SUITS.SCEPTER]: '\ud83d\udc51',
    [SUITS.STAR]: '\u2b50'
};

const SUIT_COLORS = {
    [SUITS.SWORD]: '#4a90e2',
    [SUITS.TROPHY]: '#e74c3c',
    [SUITS.SCEPTER]: '#27ae60',
    [SUITS.STAR]: '#f39c12'
};

// Hand type points
const HAND_POINTS = {
    [HAND_TYPES.HIGH_CARD]: 0,
    [HAND_TYPES.ONE_PAIR]: 5,
    [HAND_TYPES.TWO_PAIR]: 10,
    [HAND_TYPES.THREE_KIND]: 15,
    [HAND_TYPES.STRAIGHT]: 20,
    [HAND_TYPES.FLUSH]: 25,
    [HAND_TYPES.FULL_HOUSE]: 30,
    [HAND_TYPES.FOUR_KIND]: 40,
    [HAND_TYPES.STRAIGHT_FLUSH]: 50,
    [HAND_TYPES.ROYAL_FLUSH]: 75
};

// Game State
let gameState = {
    players: [],
    currentRound: 1,
    currentPlayer: 'player1',
    fields: [],
    deck: [],
    discardPile: [],
    gameStatus: 'in_progress',
    selectedCards: [],
    selectedField: null
};

// Default field effects
const FIELD_EFFECTS = [
    {
        id: 'sword_mastery',
        name: 'Sword Mastery',
        description: '+5 points per Sword card',
        type: 'suit',
        trigger: 'placement',
        value: 5
    },
    {
        id: 'trophy_triumph',
        name: 'Trophy Triumph',
        description: '+3 points per Trophy card',
        type: 'suit',
        trigger: 'placement',
        value: 3
    },
    {
        id: 'scepter_power',
        name: 'Scepter Power',
        description: 'Green cards can change suit',
        type: 'suit',
        trigger: 'placement'
    },
    {
        id: 'star_alignment',
        name: 'Star Alignment',
        description: 'Yellow cards can be any rank for straights',
        type: 'pattern',
        trigger: 'placement'
    }
];

// Game Functions
function createDeck() {
    const deck = [];
    const suits = Object.values(SUITS);
    const ranks = Object.values(RANKS);

    for (const suit of suits) {
        for (const rank of ranks) {
            const id = `${rank}${suit[0].toUpperCase()}`;
            deck.push({
                id,
                suit,
                rank,
                value: CARD_VALUES[rank],
                display: `${rank}${SUIT_SYMBOLS[suit]}`
            });
        }
    }

    return deck;
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function dealCards(deck, count) {
    return {
        cards: deck.slice(0, count),
        remainingDeck: deck.slice(count)
    };
}

function getBestHand(cards) {
    if (cards.length <= 5) return cards;

    let bestHand = [];
    let bestType = HAND_TYPES.HIGH_CARD;
    let bestPoints = 0;

    const combinations = getCombinations(cards, 5);

    for (const combo of combinations) {
        const handType = determineHandType(combo);
        const points = HAND_POINTS[handType];

        if (points > bestPoints) {
            bestPoints = points;
            bestType = handType;
            bestHand = combo;
        }
    }

    return bestHand;
}

function getCombinations(array, n) {
    if (n === 1) return array.map(item => [item]);
    if (n === array.length) return [array];

    const combinations = [];

    for (let i = 0; i <= array.length - n; i++) {
        const head = array[i];
        const tail = array.slice(i + 1);
        const tailCombinations = getCombinations(tail, n - 1);

        for (const tailCombo of tailCombinations) {
            combinations.push([head, ...tailCombo]);
        }
    }

    return combinations;
}

function determineHandType(cards) {
    const ranks = cards.map(c => c.rank);
    const suits = cards.map(c => c.suit);

    const rankCounts = getRankCounts(ranks);
    const suitCounts = getSuitCounts(suits);

    const isFlush = Object.values(suitCounts).some(count => count === 5);
    const isStraight = checkStraight(ranks);

    const rankValues = Object.values(rankCounts).sort((a, b) => b - a);

    // Royal Flush
    if (isFlush && isStraight && hasRoyalRanks(ranks)) {
        return HAND_TYPES.ROYAL_FLUSH;
    }

    // Straight Flush
    if (isFlush && isStraight) {
        return HAND_TYPES.STRAIGHT_FLUSH;
    }

    // Four of a Kind
    if (rankValues[0] === 4) {
        return HAND_TYPES.FOUR_KIND;
    }

    // Full House
    if (rankValues[0] === 3 && rankValues[1] === 2) {
        return HAND_TYPES.FULL_HOUSE;
    }

    // Flush
    if (isFlush) {
        return HAND_TYPES.FLUSH;
    }

    // Straight
    if (isStraight) {
        return HAND_TYPES.STRAIGHT;
    }

    // Three of a Kind
    if (rankValues[0] === 3) {
        return HAND_TYPES.THREE_KIND;
    }

    // Two Pair
    if (rankValues[0] === 2 && rankValues[1] === 2) {
        return HAND_TYPES.TWO_PAIR;
    }

    // One Pair
    if (rankValues[0] === 2) {
        return HAND_TYPES.ONE_PAIR;
    }

    return HAND_TYPES.HIGH_CARD;
}

function getRankCounts(ranks) {
    const counts = {};
    for (const rank of ranks) {
        counts[rank] = (counts[rank] || 0) + 1;
    }
    return counts;
}

function getSuitCounts(suits) {
    const counts = {};
    for (const suit of suits) {
        counts[suit] = (counts[suit] || 0) + 1;
    }
    return counts;
}

function checkStraight(ranks) {
    const rankOrder = Object.values(RANKS);
    const indices = ranks.map(rank => rankOrder.indexOf(rank)).sort((a, b) => a - b);

    // Check for standard straight
    for (let i = 0; i < indices.length - 1; i++) {
        if (indices[i + 1] - indices[i] !== 1) {
            break;
        }
        if (i === indices.length - 2) return true;
    }

    // Check for A-2-3-4-5 straight
    const uniqueIndices = Array.from(new Set(indices));
    if (uniqueIndices.includes(12) && uniqueIndices.includes(0) &&
        uniqueIndices.includes(1) && uniqueIndices.includes(2) &&
        uniqueIndices.includes(3)) {
        return true;
    }

    return false;
}

function hasRoyalRanks(ranks) {
    const royalRanks = [RANKS.ACE, RANKS.KING, RANKS.QUEEN, RANKS.JACK, RANKS.TEN];
    return royalRanks.every(royal => ranks.includes(royal));
}

function evaluateHand(cards) {
    const bestHand = getBestHand(cards);
    const handType = determineHandType(bestHand);
    return {
        type: handType,
        cards: bestHand,
        points: HAND_POINTS[handType]
    };
}

function calculateSkillPoints(cards) {
    return cards.reduce((sum, card) => sum + card.value, 0);
}

function calculateFieldScore(cards, effect) {
    const evaluation = evaluateHand(cards);
    const skillPoints = calculateSkillPoints(cards);
    let bonusPoints = 0;

    // Apply field effect bonuses
    if (effect && effect.type === 'suit' && effect.value) {
        const suitCards = cards.filter(c => c.suit === SUITS.SWORD);
        bonusPoints += suitCards.length * effect.value;
    }

    return evaluation.points + skillPoints + bonusPoints;
}

// AI Player Class
class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }

    makeMove(gameState, playerId) {
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return { action: 'pass' };

        // Decide whether to place cards or use switch
        const shouldSwitch = this.shouldUseSwitch(player.hand, gameState);

        if (shouldSwitch && player.switchChances > 0) {
            const cardToSwitch = this.getWorstCard(player.hand);
            return {
                action: 'switch',
                cardToSwitch
            };
        }

        const bestMove = this.getBestPlacement(player.hand, gameState.fields, playerId);
        if (bestMove.cards && bestMove.cards.length > 0) {
            return {
                action: 'place',
                cards: bestMove.cards,
                fieldId: bestMove.fieldId
            };
        }

        return { action: 'pass' };
    }

    shouldUseSwitch(hand, gameState) {
        if (this.difficulty === 'easy') {
            return Math.random() < 0.3;
        }

        const avgHandStrength = this.evaluateHandStrength(hand);
        return avgHandStrength < 15 ? Math.random() < 0.7 : Math.random() < 0.2;
    }

    getWorstCard(hand) {
        return hand.reduce((worst, card) => card.value < worst.value ? card : worst);
    }

    getBestPlacement(hand, fields, playerId) {
        let bestMove = { cards: [], fieldId: 0, score: 0 };
        const maxCards = gameState.currentRound <= 2 ? 2 : 3;

        for (const field of fields) {
            const currentCards = field.playerCards[playerId] || [];
            const availableSlots = maxCards - currentCards.length;

            if (availableSlots <= 0) continue;

            const possibleCards = this.getBestCardsForField(hand, field, availableSlots);

            if (possibleCards.length > 0) {
                const allCards = [...field.publicCards, ...currentCards, ...possibleCards];
                const evaluation = evaluateHand(allCards);
                const skillPoints = calculateSkillPoints(allCards);
                const totalScore = evaluation.points + skillPoints;

                if (totalScore > bestMove.score) {
                    bestMove = {
                        cards: possibleCards,
                        fieldId: field.id,
                        score: totalScore
                    };
                }
            }
        }

        // Fallback to random placement
        if (bestMove.cards.length === 0 && hand.length > 0) {
            const availableField = fields.find(f => {
                const currentCards = f.playerCards[playerId] || [];
                return currentCards.length < maxCards;
            });

            if (availableField) {
                const currentCards = availableField.playerCards[playerId] || [];
                const availableSlots = maxCards - currentCards.length;

                bestMove = {
                    cards: hand.slice(0, Math.min(availableSlots, hand.length)),
                    fieldId: availableField.id,
                    score: 0
                };
            }
        }

        return bestMove;
    }

    getBestCardsForField(hand, field, slots) {
        if (this.difficulty === 'easy') {
            return hand.slice(0, Math.min(slots, hand.length));
        }

        let bestCards = [];
        let bestScore = 0;

        const combinations = this.getCombinations(hand, slots);

        for (const combo of combinations) {
            const allCards = [...field.publicCards, ...(field.playerCards['ai'] || []), ...combo];
            const evaluation = evaluateHand(allCards);
            const skillPoints = calculateSkillPoints(allCards);
            const totalScore = evaluation.points + skillPoints;

            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestCards = combo;
            }
        }

        return bestCards;
    }

    getCombinations(array, n) {
        if (n === 1) return array.map(item => [item]);
        if (n === array.length) return [array];

        const combinations = [];

        for (let i = 0; i <= array.length - n; i++) {
            const head = array[i];
            const tail = array.slice(i + 1);
            const tailCombinations = this.getCombinations(tail, n - 1);

            for (const tailCombo of tailCombinations) {
                combinations.push([head, ...tailCombo]);
            }
        }

        return combinations;
    }

    evaluateHandStrength(hand) {
        if (hand.length < 2) return 0;

        const avgValue = hand.reduce((sum, card) => sum + card.value, 0) / hand.length;
        const ranks = hand.map(c => c.rank);
        const uniqueRanks = new Set(ranks);
        const pairBonus = (hand.length - uniqueRanks.size) * 5;

        return avgValue + pairBonus;
    }
}

// UI Functions
function createCardElement(card, isSelected = false, isClickable = true) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${isSelected ? 'selected' : ''}`;
    cardDiv.style.cursor = isClickable ? 'pointer' : 'default';

    cardDiv.innerHTML = `
        <div class="card-rank ${card.suit}">${card.rank}</div>
        <div class="card-suit ${card.suit}">${SUIT_SYMBOLS[card.suit]}</div>
        <div class="card-rank card-bottom ${card.suit}">${card.rank}</div>
    `;

    if (isClickable) {
        cardDiv.addEventListener('click', () => handleCardClick(card));
    }

    return cardDiv;
}

function renderGame() {
    renderGameInfo();
    renderFields();
    renderPlayerHand();
    renderFieldSelection();
    renderGameControls();
    renderGameOver();
}

function renderGameInfo() {
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('current-player').textContent =
        gameState.currentPlayer === 'player1' ? 'Player 1' : 'AI';

    const player1 = gameState.players.find(p => p.id === 'player1');
    const player2 = gameState.players.find(p => p.id === 'player2');

    document.getElementById('player1-score').textContent = player1 ? player1.score : 0;
    document.getElementById('player2-score').textContent = player2 ? player2.score : 0;
}

function renderFields() {
    const container = document.getElementById('fields-container');
    container.innerHTML = '';

    gameState.fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field';

        const player1Cards = field.playerCards['player1'] || [];
        const player2Cards = field.playerCards['player2'] || [];
        const maxCards = gameState.currentRound <= 2 ? 2 : 3;

        fieldDiv.innerHTML = `
            <h3>Field ${field.id} - ${field.effect.name}</h3>
            <div class="field-effect">${field.effect.description}</div>

            <div class="cards-container">
                <strong>Public Cards:</strong>
                ${field.publicCards.map(card => createCardElement(card).outerHTML).join('')}
            </div>

            <div class="cards-container">
                <strong>Your Cards:</strong>
                ${player1Cards.map(card => createCardElement(card).outerHTML).join('')}
                ${Array.from({length: maxCards - player1Cards.length}).map(() =>
                    '<div class="empty-slot">+</div>'
                ).join('')}
            </div>

            <div class="score-display">
                Score: ${field.scores['player1'] || 0}
            </div>
        `;

        container.appendChild(fieldDiv);
    });
}

function renderPlayerHand() {
    const player1 = gameState.players.find(p => p.id === 'player1');
    if (!player1) return;

    document.getElementById('switch-chances').textContent = player1.switchChances;
    document.getElementById('card-count').textContent = player1.hand.length;

    const container = document.getElementById('player-cards');
    container.innerHTML = '';

    player1.hand.forEach(card => {
        const isSelected = gameState.selectedCards.some(c => c.id === card.id);
        const isClickable = gameState.currentPlayer === 'player1';
        const cardElement = createCardElement(card, isSelected, isClickable);
        container.appendChild(cardElement);
    });

    // Update switch button
    const switchBtn = document.getElementById('switch-btn');
    switchBtn.disabled = gameState.selectedCards.length !== 1 || player1.switchChances <= 0;
}

function renderFieldSelection() {
    const container = document.getElementById('field-selection');
    const buttonsContainer = document.getElementById('field-buttons');

    if (gameState.currentPlayer !== 'player1') {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    buttonsContainer.innerHTML = '';

    gameState.fields.forEach(field => {
        const button = document.createElement('button');
        button.className = 'field-button';
        button.textContent = `Field ${field.id}`;

        if (gameState.selectedField === field.id) {
            button.classList.add('selected');
        }

        button.addEventListener('click', () => {
            gameState.selectedField = field.id;
            renderFieldSelection();
        });

        buttonsContainer.appendChild(button);
    });
}

function renderGameControls() {
    const placeBtn = document.getElementById('place-cards-btn');
    const hasSelection = gameState.selectedCards.length > 0;
    const hasField = gameState.selectedField !== null;

    placeBtn.disabled = !hasSelection || !hasField;
    placeBtn.textContent = `Place Cards (${gameState.selectedCards.length})`;
}

function renderGameOver() {
    const gameOverDiv = document.getElementById('game-over');

    if (gameState.gameStatus !== 'game_end') {
        gameOverDiv.style.display = 'none';
        return;
    }

    gameOverDiv.style.display = 'block';

    const player1 = gameState.players.find(p => p.id === 'player1');
    const player2 = gameState.players.find(p => p.id === 'player2');

    const winner = (player1?.score || 0) > (player2?.score || 0) ? 'Player 1' : 'AI';
    document.getElementById('winner-text').textContent = `Winner: ${winner}`;

    document.getElementById('final-scores').innerHTML = `
        <div class="score-display">Player 1: ${player1?.score || 0}</div>
        <div class="score-display">AI: ${player2?.score || 0}</div>
    `;
}

// Event Handlers
function handleCardClick(card) {
    if (gameState.currentPlayer !== 'player1') return;

    const isSelected = gameState.selectedCards.some(c => c.id === card.id);

    if (isSelected) {
        gameState.selectedCards = gameState.selectedCards.filter(c => c.id !== card.id);
    } else {
        gameState.selectedCards.push(card);
    }

    renderGame();
}

function handlePlaceCards() {
    if (gameState.selectedCards.length === 0 || gameState.selectedField === null) return;

    const player1 = gameState.players.find(p => p.id === 'player1');
    const field = gameState.fields.find(f => f.id === gameState.selectedField);

    if (!player1 || !field) return;

    const maxCards = gameState.currentRound <= 2 ? 2 : 3;
    const currentCards = field.playerCards['player1'] || [];

    if (currentCards.length + gameState.selectedCards.length <= maxCards) {
        // Place cards in field
        field.playerCards['player1'] = [...currentCards, ...gameState.selectedCards];

        // Remove from player's hand
        player1.hand = player1.hand.filter(card =>
            !gameState.selectedCards.some(placed => placed.id === card.id)
        );

        // Switch to AI player
        gameState.currentPlayer = 'player2';
        gameState.selectedCards = [];
        gameState.selectedField = null;

        renderGame();
    }
}

function handleSwitchCard() {
    if (gameState.selectedCards.length !== 1) return;

    const player1 = gameState.players.find(p => p.id === 'player1');
    if (!player1 || player1.switchChances <= 0 || gameState.deck.length === 0) return;

    const cardToSwitch = gameState.selectedCards[0];

    // Deal new card
    const result = dealCards(gameState.deck, 1);
    const newCard = result.cards[0];

    // Update player's hand
    player1.hand = player1.hand.filter(c => c.id !== cardToSwitch.id);
    player1.hand.push(newCard);
    player1.switchChances -= 1;

    // Update game state
    gameState.deck = result.remainingDeck;
    gameState.discardPile.push(cardToSwitch);
    gameState.selectedCards = [];

    renderGame();
}

function handleEndRound() {
    // AI turn first if it's AI's turn
    if (gameState.currentPlayer === 'player2') {
        performAITurn();
    }

    // Calculate scores for all fields
    gameState.fields.forEach(field => {
        gameState.players.forEach(player => {
            const allCards = [...field.publicCards, ...(field.playerCards[player.id] || [])];
            if (allCards.length >= 5) {
                const score = calculateFieldScore(allCards, field.effect);
                field.scores[player.id] = score;
            } else {
                field.scores[player.id] = 0;
            }
        });
    });

    // Update player scores
    gameState.players.forEach(player => {
        const roundScore = gameState.fields.reduce((sum, field) =>
            sum + (field.scores[player.id] || 0), 0
        );
        player.score += roundScore;
    });

    // Draw new cards for next round
    gameState.players.forEach(player => {
        const result = dealCards(gameState.deck, 2);
        player.hand = result.cards;
        player.switchChances += 1;
        gameState.deck = result.remainingDeck;
    });

    gameState.currentRound += 1;
    gameState.currentPlayer = 'player1';

    if (gameState.currentRound > 4) {
        gameState.gameStatus = 'game_end';
    }

    renderGame();
}

function performAITurn() {
    const ai = new AIPlayer('medium');
    const aiPlayer = gameState.players.find(p => p.isAI);
    if (!aiPlayer) return;

    const aiMove = ai.makeMove(gameState, aiPlayer.id);

    if (aiMove.action === 'switch' && aiMove.cardToSwitch) {
        // AI uses switch
        const result = dealCards(gameState.deck, 1);
        aiPlayer.hand = aiPlayer.hand.filter(c => c.id !== aiMove.cardToSwitch.id);
        aiPlayer.hand.push(result.cards[0]);
        aiPlayer.switchChances -= 1;
        gameState.deck = result.remainingDeck;
        gameState.discardPile.push(aiMove.cardToSwitch);
    } else if (aiMove.action === 'place' && aiMove.cards && aiMove.fieldId) {
        // AI places cards
        const field = gameState.fields.find(f => f.id === aiMove.fieldId);
        if (field) {
            const currentCards = field.playerCards[aiPlayer.id] || [];
            field.playerCards[aiPlayer.id] = [...currentCards, ...aiMove.cards];
            aiPlayer.hand = aiPlayer.hand.filter(card =>
                !aiMove.cards.some(placed => placed.id === card.id)
            );
        }
    }
}

function handleResetGame() {
    initializeGame();
    renderGame();
}

// Game Initialization
function initializeGame() {
    const deck = shuffleDeck(createDeck());

    // Deal initial hands
    const player1Result = dealCards(deck, 5);
    const player2Result = dealCards(player1Result.remainingDeck, 5);

    // Create fields with public cards
    const fields = [];
    let currentDeck = player2Result.remainingDeck;

    for (let i = 0; i < 4; i++) {
        const publicResult = dealCards(currentDeck, 2);
        fields.push({
            id: i + 1,
            publicCards: publicResult.cards,
            playerCards: {},
            effect: FIELD_EFFECTS[i % FIELD_EFFECTS.length],
            revealed: true,
            scores: {}
        });
        currentDeck = publicResult.remainingDeck;
    }

    gameState = {
        players: [
            { id: 'player1', name: 'Player 1', isAI: false, hand: player1Result.cards, switchChances: 5, score: 0 },
            { id: 'player2', name: 'AI', isAI: true, hand: player2Result.cards, switchChances: 5, score: 0 }
        ],
        currentRound: 1,
        currentPlayer: 'player1',
        fields: fields,
        deck: currentDeck,
        discardPile: [],
        gameStatus: 'in_progress',
        selectedCards: [],
        selectedField: null
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    renderGame();

    // Button event listeners
    document.getElementById('switch-btn').addEventListener('click', handleSwitchCard);
    document.getElementById('place-cards-btn').addEventListener('click', handlePlaceCards);
    document.getElementById('end-round-btn').addEventListener('click', handleEndRound);
    document.getElementById('reset-game-btn').addEventListener('click', handleResetGame);
});
