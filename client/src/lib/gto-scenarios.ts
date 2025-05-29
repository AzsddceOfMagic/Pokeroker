// Pre-built GTO training scenarios

export interface GtoScenario {
  id: number;
  title: string;
  description: string;
  situation: string;
  gameType: string;
  position: string;
  heroCards: string[];
  boardCards: string[];
  potSize: number;
  betSize: number;
  actions: Array<{ action: string; ev: number }>;
  optimalAction: string;
  difficulty: string;
  credits: number;
}

export const gtoScenarios: GtoScenario[] = [
  {
    id: 1,
    title: "Button vs BB 3-bet",
    description: "Defending against a big blind 3-bet from the button with a strong hand",
    situation: "6-max cash game, $1/$2 blinds. You open raise to $6 from the button with A♠K♠. Big blind 3-bets to $20. Action is on you.",
    gameType: "6-max",
    position: "BTN",
    heroCards: ["A♠", "K♠"],
    boardCards: [],
    potSize: 27, // $1 SB + $6 raise + $20 3-bet
    betSize: 14, // $20 - $6 = $14 to call
    actions: [
      { action: "Fold", ev: -6.00 },
      { action: "Call", ev: 1.25 },
      { action: "4-bet to $55", ev: 3.47 }
    ],
    optimalAction: "4-bet to $55",
    difficulty: "intermediate",
    credits: 50
  },
  {
    id: 2,
    title: "SB vs BB Postflop",
    description: "Small blind continuation betting on a coordinated flop",
    situation: "Heads-up from the blinds. You raised to $6 from SB, BB called. Flop: A♦7♥5♣. Pot: $12. BB checks to you.",
    gameType: "6-max",
    position: "SB",
    heroCards: ["K♣", "Q♣"],
    boardCards: ["A♦", "7♥", "5♣"],
    potSize: 12,
    betSize: 0, // Can check or bet
    actions: [
      { action: "Check", ev: -0.85 },
      { action: "Bet $8", ev: 1.20 },
      { action: "Bet $12", ev: 0.95 }
    ],
    optimalAction: "Bet $8",
    difficulty: "beginner",
    credits: 50
  },
  {
    id: 3,
    title: "4-bet Pot OOP",
    description: "Playing out of position in a 4-bet pot with a premium hand",
    situation: "You 4-bet to $55 from UTG with A♠A♣, button calls. Flop: K♠9♦2♣. Pot: $112. Action is on you.",
    gameType: "6-max",
    position: "UTG",
    heroCards: ["A♠", "A♣"],
    boardCards: ["K♠", "9♦", "2♣"],
    potSize: 112,
    betSize: 0, // Can check or bet
    actions: [
      { action: "Check", ev: 2.15 },
      { action: "Bet $35", ev: 4.80 },
      { action: "Bet $70", ev: 3.95 }
    ],
    optimalAction: "Bet $35",
    difficulty: "advanced",
    credits: 50
  },
  {
    id: 4,
    title: "Cutoff Open vs UTG 3-bet",
    description: "Responding to a 3-bet when opening from the cutoff",
    situation: "You open to $6 from cutoff with T♠T♣. UTG 3-bets to $20. Folded back to you.",
    gameType: "6-max",
    position: "CO",
    heroCards: ["T♠", "T♣"],
    boardCards: [],
    potSize: 27,
    betSize: 14,
    actions: [
      { action: "Fold", ev: -6.00 },
      { action: "Call", ev: 0.85 },
      { action: "4-bet to $50", ev: -1.20 }
    ],
    optimalAction: "Call",
    difficulty: "intermediate",
    credits: 50
  },
  {
    id: 5,
    title: "BB Squeeze Spot",
    description: "3-betting from the big blind when facing a raise and call",
    situation: "UTG raises to $6, cutoff calls. You're in BB with A♥Q♦. Action is on you.",
    gameType: "6-max",
    position: "BB",
    heroCards: ["A♥", "Q♦"],
    boardCards: [],
    potSize: 15, // $6 + $6 + $1 SB + $2 BB
    betSize: 4, // $6 - $2 BB = $4 to call
    actions: [
      { action: "Fold", ev: -2.00 },
      { action: "Call", ev: -0.45 },
      { action: "3-bet to $24", ev: 1.65 }
    ],
    optimalAction: "3-bet to $24",
    difficulty: "advanced",
    credits: 50
  },
  {
    id: 6,
    title: "MP vs BTN Single Raised Pot",
    description: "Middle position facing a button raise with a marginal hand",
    situation: "Button raises to $6. You're in MP with 9♠8♠. Action is on you.",
    gameType: "6-max",
    position: "MP",
    heroCards: ["9♠", "8♠"],
    boardCards: [],
    potSize: 9, // $6 + $1 SB + $2 BB
    betSize: 6,
    actions: [
      { action: "Fold", ev: 0.00 },
      { action: "Call", ev: -0.85 },
      { action: "3-bet to $20", ev: -2.10 }
    ],
    optimalAction: "Fold",
    difficulty: "beginner",
    credits: 50
  },
  {
    id: 7,
    title: "Hijack vs CO 3-bet with AK",
    description: "Playing AK against a 3-bet from in position",
    situation: "You raise to $6 from HJ with A♣K♦. CO 3-bets to $20. Folded back to you.",
    gameType: "6-max",
    position: "HJ",
    heroCards: ["A♣", "K♦"],
    boardCards: [],
    potSize: 27,
    betSize: 14,
    actions: [
      { action: "Fold", ev: -6.00 },
      { action: "Call", ev: 0.95 },
      { action: "4-bet to $55", ev: 2.80 }
    ],
    optimalAction: "4-bet to $55",
    difficulty: "intermediate",
    credits: 50
  },
  {
    id: 8,
    title: "Paired Board C-bet",
    description: "Continuation betting on a paired flop as the preflop aggressor",
    situation: "You raised BTN, BB called. Flop: 8♠8♥3♦. BB checks. Pot: $13. You have A♦Q♠.",
    gameType: "6-max",
    position: "BTN",
    heroCards: ["A♦", "Q♠"],
    boardCards: ["8♠", "8♥", "3♦"],
    potSize: 13,
    betSize: 0,
    actions: [
      { action: "Check", ev: 0.25 },
      { action: "Bet $6", ev: 1.15 },
      { action: "Bet $10", ev: 0.85 }
    ],
    optimalAction: "Bet $6",
    difficulty: "intermediate",
    credits: 50
  },
  {
    id: 9,
    title: "Turn Barrel Decision",
    description: "Deciding whether to continue betting on the turn",
    situation: "You c-bet flop Q♣7♦2♠ with A♠K♣, got called. Turn: 5♥. Pot: $25. BB checks.",
    gameType: "6-max",
    position: "BTN",
    heroCards: ["A♠", "K♣"],
    boardCards: ["Q♣", "7♦", "2♠", "5♥"],
    potSize: 25,
    betSize: 0,
    actions: [
      { action: "Check", ev: 1.20 },
      { action: "Bet $15", ev: 0.85 },
      { action: "Bet $25", ev: -0.45 }
    ],
    optimalAction: "Check",
    difficulty: "advanced",
    credits: 50
  },
  {
    id: 10,
    title: "River Bluff Spot",
    description: "Deciding whether to bluff on a river that completes draws",
    situation: "Turn checked through with K♣Q♣ on Q♦7♠4♣8♠. River: 6♥. Pot: $20. BB checks.",
    gameType: "6-max",
    position: "BTN",
    heroCards: ["K♣", "Q♣"],
    boardCards: ["Q♦", "7♠", "4♣", "8♠", "6♥"],
    potSize: 20,
    betSize: 0,
    actions: [
      { action: "Check", ev: 2.85 },
      { action: "Bet $12", ev: 3.25 },
      { action: "Bet $20", ev: 2.95 }
    ],
    optimalAction: "Bet $12",
    difficulty: "advanced",
    credits: 50
  }
];

/**
 * Get all GTO scenarios
 */
export function getGtoScenarios(): GtoScenario[] {
  return gtoScenarios;
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty: string): GtoScenario[] {
  return gtoScenarios.filter(scenario => scenario.difficulty === difficulty);
}

/**
 * Get scenarios by position
 */
export function getScenariosByPosition(position: string): GtoScenario[] {
  return gtoScenarios.filter(scenario => scenario.position === position);
}

/**
 * Get scenarios by game type
 */
export function getScenariosByGameType(gameType: string): GtoScenario[] {
  return gtoScenarios.filter(scenario => scenario.gameType === gameType);
}

/**
 * Get random scenario
 */
export function getRandomScenario(): GtoScenario {
  const randomIndex = Math.floor(Math.random() * gtoScenarios.length);
  return gtoScenarios[randomIndex];
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: number): GtoScenario | undefined {
  return gtoScenarios.find(scenario => scenario.id === id);
}

/**
 * Get beginner scenarios (recommended for new players)
 */
export function getBeginnerScenarios(): GtoScenario[] {
  return getScenariosByDifficulty("beginner");
}

/**
 * Get advanced scenarios for experienced players
 */
export function getAdvancedScenarios(): GtoScenario[] {
  return getScenariosByDifficulty("advanced");
}
