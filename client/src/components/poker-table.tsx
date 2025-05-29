import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateRandomHand, evaluatePokerHand, calculatePotOdds } from "@/lib/poker-logic";

interface PokerTableProps {
  botType?: string;
  onHandComplete?: (won: boolean, profit: number) => void;
}

interface GameState {
  heroCards: string[];
  boardCards: string[];
  potSize: number;
  currentBet: number;
  heroStack: number;
  villainStack: number;
  phase: "preflop" | "flop" | "turn" | "river" | "showdown";
  action: "check" | "bet" | "call" | "raise" | "fold" | null;
  handHistory: string[];
}

export default function PokerTable({ botType = "tag", onHandComplete }: PokerTableProps) {
  const [gameState, setGameState] = useState<GameState>({
    heroCards: [],
    boardCards: [],
    potSize: 30, // Blinds 10/20
    currentBet: 20,
    heroStack: 1500,
    villainStack: 1200,
    phase: "preflop",
    action: null,
    handHistory: [],
  });

  const [showdown, setShowdown] = useState(false);
  const [handResult, setHandResult] = useState<{ winner: string; heroWon: boolean; profit: number } | null>(null);

  useEffect(() => {
    startNewHand();
  }, []);

  const startNewHand = () => {
    const newHand = generateRandomHand();
    setGameState({
      heroCards: newHand.heroCards,
      boardCards: [],
      potSize: 30,
      currentBet: 20,
      heroStack: gameState.heroStack,
      villainStack: gameState.villainStack,
      phase: "preflop",
      action: null,
      handHistory: [`New hand started. Hero: ${newHand.heroCards.join('')}, Villain: ${newHand.villainCards.join('')}`],
    });
    setShowdown(false);
    setHandResult(null);
  };

  const handlePlayerAction = (action: "fold" | "call" | "raise") => {
    const newHistory = [...gameState.handHistory];
    let newPotSize = gameState.potSize;
    let newHeroStack = gameState.heroStack;
    let newPhase = gameState.phase;
    let newBoardCards = [...gameState.boardCards];
    let newCurrentBet = gameState.currentBet;

    switch (action) {
      case "fold":
        newHistory.push("Hero folds");
        const foldProfit = -20; // Lost big blind
        setHandResult({
          winner: "Villain",
          heroWon: false,
          profit: foldProfit,
        });
        onHandComplete?.(false, foldProfit);
        break;

      case "call":
        newHistory.push(`Hero calls ${gameState.currentBet}`);
        newPotSize += gameState.currentBet;
        newHeroStack -= gameState.currentBet;
        newCurrentBet = 0;
        
        // Advance to next phase
        if (newPhase === "preflop") {
          newPhase = "flop";
          newBoardCards = generateRandomHand().boardCards.slice(0, 3);
        } else if (newPhase === "flop") {
          newPhase = "turn";
          newBoardCards.push(generateRandomHand().boardCards[3]);
        } else if (newPhase === "turn") {
          newPhase = "river";
          newBoardCards.push(generateRandomHand().boardCards[4]);
        } else {
          // Go to showdown
          goToShowdown(newPotSize, newHistory);
          return;
        }
        break;

      case "raise":
        const raiseAmount = gameState.currentBet * 2.5;
        newHistory.push(`Hero raises to ${raiseAmount}`);
        newPotSize += raiseAmount;
        newHeroStack -= raiseAmount;
        
        // Bot decision (simplified)
        const botCall = Math.random() > 0.4; // 60% chance bot calls
        if (botCall) {
          newHistory.push(`Villain calls ${raiseAmount}`);
          newPotSize += raiseAmount;
          newCurrentBet = 0;
          
          // Advance phase
          if (newPhase === "preflop") {
            newPhase = "flop";
            newBoardCards = generateRandomHand().boardCards.slice(0, 3);
          } else {
            goToShowdown(newPotSize, newHistory);
            return;
          }
        } else {
          newHistory.push("Villain folds");
          const winProfit = newPotSize - 20; // Won pot minus big blind
          setHandResult({
            winner: "Hero",
            heroWon: true,
            profit: winProfit,
          });
          onHandComplete?.(true, winProfit);
        }
        break;
    }

    setGameState({
      ...gameState,
      potSize: newPotSize,
      heroStack: newHeroStack,
      phase: newPhase,
      boardCards: newBoardCards,
      currentBet: newCurrentBet,
      handHistory: newHistory,
      action: action,
    });
  };

  const goToShowdown = (potSize: number, history: string[]) => {
    setShowdown(true);
    
    // Simple hand evaluation (mock)
    const heroWins = Math.random() > 0.5; // 50/50 for simplicity
    const profit = heroWins ? potSize - 20 : -20;
    
    const newHistory = [...history];
    newHistory.push(heroWins ? "Hero wins at showdown!" : "Villain wins at showdown");
    
    setHandResult({
      winner: heroWins ? "Hero" : "Villain",
      heroWon: heroWins,
      profit,
    });
    
    onHandComplete?.(heroWins, profit);
    
    setGameState(prev => ({
      ...prev,
      handHistory: newHistory,
    }));
  };

  const getBetSizeText = () => {
    if (gameState.currentBet === 0) return "Check";
    return `Call ${gameState.currentBet}`;
  };

  const getRaiseText = () => {
    const raiseAmount = Math.max(gameState.currentBet * 2.5, 40);
    return `Raise to ${raiseAmount}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Poker Table */}
      <div className="relative bg-poker-green-700 rounded-full p-8 mx-auto mb-8" style={{ width: "800px", height: "400px" }}>
        {/* Table felt pattern */}
        <div className="absolute inset-4 border-4 border-poker-green-600 rounded-full"></div>
        
        {/* Villain Position - Top */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="bg-poker-dark-800 rounded-lg p-3 border border-poker-green-600 text-center min-w-[120px]">
            <div className="text-xs text-gray-400 mb-1">
              {botType?.toUpperCase()} Bot
            </div>
            <div className="flex justify-center space-x-1 mb-2">
              <div className="w-8 h-12 card-back rounded border border-blue-300"></div>
              <div className="w-8 h-12 card-back rounded border border-blue-300"></div>
            </div>
            <div className="text-sm font-medium">${gameState.villainStack}</div>
          </div>
        </div>

        {/* Hero Position - Bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-2">
          <div className="bg-emerald-700 rounded-lg p-3 border border-emerald-500 text-center min-w-[120px] animate-glow">
            <div className="text-xs text-emerald-200 mb-1">You</div>
            <div className="flex justify-center space-x-1 mb-2">
              {gameState.heroCards.map((card, index) => (
                <div
                  key={index}
                  className="w-8 h-12 bg-white rounded border border-gray-300 flex items-center justify-center text-black text-xs font-bold"
                >
                  {card}
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-white">${gameState.heroStack}</div>
          </div>
        </div>

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`w-12 h-16 rounded border-2 flex items-center justify-center text-sm font-bold ${
                  gameState.boardCards[index]
                    ? "bg-white border-gray-300 text-black"
                    : "bg-poker-dark-700 border-dashed border-poker-green-400"
                }`}
              >
                {gameState.boardCards[index] || ""}
              </div>
            ))}
          </div>
        </div>

        {/* Pot */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-poker-dark-900 rounded-lg px-4 py-2 border border-yellow-500">
            <div className="text-xs text-yellow-400 text-center mb-1">Pot</div>
            <div className="text-lg font-bold text-yellow-400">${gameState.potSize}</div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="absolute top-6 right-6">
          <div className="bg-poker-dark-900 rounded-lg px-3 py-1 border border-poker-green-700">
            <div className="text-xs text-emerald-400 capitalize">{gameState.phase}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!handResult && (
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={() => handlePlayerAction("fold")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
          >
            Fold
          </Button>
          <Button
            onClick={() => handlePlayerAction("call")}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"
          >
            {getBetSizeText()}
          </Button>
          <Button
            onClick={() => handlePlayerAction("raise")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
          >
            {getRaiseText()}
          </Button>
        </div>
      )}

      {/* Hand Result */}
      {handResult && (
        <div className="text-center mb-8">
          <Card className="bg-poker-dark-800 border-poker-green-700 max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">
                {handResult.heroWon ? "You Win!" : "You Lose"}
              </h3>
              <p className="text-lg mb-4">
                Profit: <span className={handResult.profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {handResult.profit >= 0 ? "+" : ""}{handResult.profit} bb
                </span>
              </p>
              <Button
                onClick={startNewHand}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Next Hand
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hand History */}
      <Card className="bg-poker-dark-800 border-poker-green-700">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 text-emerald-400">Hand History</h4>
          <div className="space-y-1 text-sm text-gray-300 max-h-40 overflow-y-auto">
            {gameState.handHistory.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
