// Poker hand evaluation and game logic

export interface PokerHand {
  heroCards: string[];
  villainCards?: string[];
  boardCards: string[];
}

export interface HandEvaluation {
  rank: number;
  name: string;
  kickers: string[];
}

export interface GtoAction {
  action: string;
  ev: number;
  frequency?: number;
}

export interface ActionEvaluation {
  isOptimal: boolean;
  evDifference: number;
  feedback: string;
  recommendedAction: string;
}

// Card suits and ranks
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// Hand rankings
export const HAND_RANKINGS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

/**
 * Generate a random poker hand for practice
 */
export function generateRandomHand(): PokerHand {
  const deck = generateDeck();
  const shuffled = shuffleDeck(deck);
  
  return {
    heroCards: [shuffled[0], shuffled[1]],
    villainCards: [shuffled[2], shuffled[3]],
    boardCards: shuffled.slice(4, 9), // 5 community cards
  };
}

/**
 * Generate a standard 52-card deck
 */
function generateDeck(): string[] {
  const deck: string[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(rank + suit);
    }
  }
  return deck;
}

/**
 * Shuffle deck using Fisher-Yates algorithm
 */
function shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Parse card string to get rank and suit
 */
function parseCard(card: string): { rank: string; suit: string; value: number } {
  const rank = card[0];
  const suit = card[1];
  return {
    rank,
    suit,
    value: RANK_VALUES[rank]
  };
}

/**
 * Evaluate poker hand strength
 */
export function evaluatePokerHand(holeCards: string[], boardCards: string[]): HandEvaluation {
  const allCards = [...holeCards, ...boardCards];
  const parsedCards = allCards.map(parseCard);
  
  // Sort by value (descending)
  parsedCards.sort((a, b) => b.value - a.value);
  
  // Check for each hand type (simplified evaluation)
  const ranks = parsedCards.map(c => c.rank);
  const suits = parsedCards.map(c => c.suit);
  
  // Count rank frequencies
  const rankCounts: { [key: string]: number } = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const pairs = Object.entries(rankCounts).filter(([_, count]) => count >= 2);
  
  // Check for flush
  const suitCounts: { [key: string]: number } = {};
  suits.forEach(suit => {
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  });
  const hasFlush = Object.values(suitCounts).some(count => count >= 5);
  
  // Check for straight (simplified)
  const uniqueValues = [...new Set(parsedCards.map(c => c.value))].sort((a, b) => b - a);
  const hasStraight = isConsecutive(uniqueValues.slice(0, 5));
  
  // Determine hand ranking
  if (hasStraight && hasFlush) {
    if (uniqueValues[0] === 14) { // Ace high straight flush
      return { rank: HAND_RANKINGS.ROYAL_FLUSH, name: "Royal Flush", kickers: [] };
    }
    return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, name: "Straight Flush", kickers: [] };
  }
  
  if (counts[0] === 4) {
    return { rank: HAND_RANKINGS.FOUR_KIND, name: "Four of a Kind", kickers: [] };
  }
  
  if (counts[0] === 3 && counts[1] === 2) {
    return { rank: HAND_RANKINGS.FULL_HOUSE, name: "Full House", kickers: [] };
  }
  
  if (hasFlush) {
    return { rank: HAND_RANKINGS.FLUSH, name: "Flush", kickers: [] };
  }
  
  if (hasStraight) {
    return { rank: HAND_RANKINGS.STRAIGHT, name: "Straight", kickers: [] };
  }
  
  if (counts[0] === 3) {
    return { rank: HAND_RANKINGS.THREE_KIND, name: "Three of a Kind", kickers: [] };
  }
  
  if (pairs.length >= 2) {
    return { rank: HAND_RANKINGS.TWO_PAIR, name: "Two Pair", kickers: [] };
  }
  
  if (pairs.length === 1) {
    return { rank: HAND_RANKINGS.PAIR, name: "Pair", kickers: [] };
  }
  
  return { rank: HAND_RANKINGS.HIGH_CARD, name: "High Card", kickers: ranks.slice(0, 5) };
}

/**
 * Check if values are consecutive
 */
function isConsecutive(values: number[]): boolean {
  if (values.length < 5) return false;
  
  for (let i = 0; i < 4; i++) {
    if (values[i] - values[i + 1] !== 1) {
      // Check for A-2-3-4-5 straight (wheel)
      if (i === 0 && values[0] === 14 && values[1] === 5) {
        continue;
      }
      return false;
    }
  }
  return true;
}

/**
 * Calculate pot odds
 */
export function calculatePotOdds(potSize: number, betSize: number): number {
  return betSize / (potSize + betSize);
}

/**
 * Calculate hand equity (simplified)
 */
export function calculateEquity(heroCards: string[], villainRange: string[], board: string[]): number {
  // Simplified equity calculation
  // In a real implementation, this would use Monte Carlo simulation
  const heroHand = evaluatePokerHand(heroCards, board);
  
  // Mock equity based on hand strength
  const baseEquity = Math.min(heroHand.rank * 10, 90);
  return baseEquity + Math.random() * 10; // Add some variance
}

/**
 * Evaluate GTO action for training scenarios
 */
export function evaluateGtoAction(userAction: string, scenario: any): ActionEvaluation {
  const optimalAction = scenario.optimalAction;
  const isOptimal = userAction === optimalAction;
  
  const userActionData = scenario.actions.find((a: any) => a.action === userAction);
  const optimalActionData = scenario.actions.find((a: any) => a.action === optimalAction);
  
  const evDifference = userActionData && optimalActionData ? 
    userActionData.ev - optimalActionData.ev : 0;
  
  let feedback = "";
  
  if (isOptimal) {
    feedback = `Excellent! ${userAction} is the optimal play with an EV of +${optimalActionData?.ev.toFixed(2)}.`;
  } else {
    feedback = `${userAction} loses ${Math.abs(evDifference).toFixed(2)} EV compared to the optimal ${optimalAction}. `;
    
    if (userAction === "Fold" && optimalAction !== "Fold") {
      feedback += "You're folding a profitable spot. Consider the pot odds and your equity.";
    } else if (userAction === "Call" && optimalAction === "Raise") {
      feedback += "Raising would be more profitable here to build the pot with your strong hand.";
    } else if (userAction === "Raise" && optimalAction === "Call") {
      feedback += "Your hand is strong enough to call but raising might fold out worse hands.";
    }
  }
  
  return {
    isOptimal,
    evDifference,
    feedback,
    recommendedAction: optimalAction
  };
}

/**
 * Get hand strength description
 */
export function getHandStrength(heroCards: string[]): string {
  const card1 = parseCard(heroCards[0]);
  const card2 = parseCard(heroCards[1]);
  
  if (card1.rank === card2.rank) {
    return "Pocket Pair";
  }
  
  if (card1.suit === card2.suit) {
    return "Suited";
  }
  
  if (Math.abs(card1.value - card2.value) === 1) {
    return "Connected";
  }
  
  if (card1.value >= 11 || card2.value >= 11) { // Face cards
    return "High Cards";
  }
  
  return "Offsuit";
}

/**
 * Get position-based strategy advice
 */
export function getPositionAdvice(position: string, action: string): string {
  const positionStrategies: { [key: string]: { [key: string]: string } } = {
    "UTG": {
      "Raise": "UTG raises should be with premium hands only. Your range is tight.",
      "Call": "Calling UTG is generally not recommended. Consider raising or folding.",
      "Fold": "Tight is right from UTG. Folding marginal hands is correct."
    },
    "BTN": {
      "Raise": "Button raises can be wider. Use your position advantage.",
      "Call": "Button calls can be profitable with position and good odds.",
      "Fold": "Don't fold too tight on the button. Use your position."
    },
    "BB": {
      "Raise": "BB 3-bets should be polarized - very strong or bluff hands.",
      "Call": "BB calls are common with good odds and position disadvantage.",
      "Fold": "Don't defend too wide from BB without proper odds."
    }
  };
  
  return positionStrategies[position]?.[action] || "Consider the position and adjust your strategy accordingly.";
}

/**
 * Generate random scenario for practice
 */
export function generateRandomScenario() {
  const positions = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
  const gameTypes = ["6-max", "9-max", "HU"];
  const actions = [
    { action: "Fold", ev: -1.0 },
    { action: "Call", ev: 0.5 },
    { action: "Raise", ev: 2.1 }
  ];
  
  const hand = generateRandomHand();
  const position = positions[Math.floor(Math.random() * positions.length)];
  const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
  
  return {
    id: Math.floor(Math.random() * 1000),
    title: `${position} Decision in ${gameType}`,
    description: `Make the optimal decision from ${position} position`,
    situation: `${gameType} cash game, you're in ${position} with ${hand.heroCards.join('')}. Action is on you.`,
    gameType,
    position,
    heroCards: hand.heroCards,
    boardCards: hand.boardCards.slice(0, 3), // Flop only
    potSize: 25,
    betSize: 15,
    actions,
    optimalAction: "Raise", // Simplified - always raise for demo
    difficulty: "intermediate",
    credits: 50
  };
}
