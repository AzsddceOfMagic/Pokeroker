import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import CreditModal from "@/components/credit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Trophy, Calculator, Zap } from "lucide-react";

interface IcmScenario {
  id: number;
  title: string;
  description: string;
  situation: string;
  gameType: string;
  stackSizes: number[];
  payouts: number[];
  heroPosition: number;
  heroCards: string[];
  actions: Array<{ action: string; equity: number }>;
  optimalAction: string;
  difficulty: string;
  credits: number;
}

const mockIcmScenarios: IcmScenario[] = [
  {
    id: 1,
    title: "Final Table Bubble",
    description: "Critical decision at the final table bubble with short stack pressure",
    situation: "Final table of a $109 tournament. 10 players left, 9 get paid. You're 8th in chips with 12bb. UTG folds, you're in UTG+1 with A♠J♦. Action on you.",
    gameType: "MTT Final Table",
    stackSizes: [450000, 380000, 320000, 280000, 250000, 220000, 180000, 120000, 95000, 85000],
    payouts: [25000, 18500, 13500, 10000, 7500, 5500, 4000, 2800, 2000],
    heroPosition: 7,
    heroCards: ["A♠", "J♦"],
    actions: [
      { action: "Fold", equity: 1850 },
      { action: "Call", equity: 1820 },
      { action: "All-in", equity: 2100 }
    ],
    optimalAction: "All-in",
    difficulty: "intermediate",
    credits: 100
  },
  {
    id: 2,
    title: "Short Stack Push/Fold",
    description: "Push/fold decision with 8bb in late stage tournament",
    situation: "200-player tournament, 25 players left. Blinds 8000/16000. You have 8bb in the cutoff with K♣T♠. Folded to you.",
    gameType: "MTT Late Stage",
    stackSizes: [520000, 480000, 420000, 380000, 340000, 320000, 280000, 260000, 240000, 220000, 200000, 180000, 160000, 140000, 128000],
    payouts: [8500, 6200, 4800, 3600, 2800, 2200, 1800, 1500, 1300, 1100, 950, 850, 750, 680, 620],
    heroPosition: 2,
    heroCards: ["K♣", "T♠"],
    actions: [
      { action: "Fold", equity: 620 },
      { action: "All-in", equity: 720 }
    ],
    optimalAction: "All-in",
    difficulty: "beginner",
    credits: 100
  },
  {
    id: 3,
    title: "PKO Bounty Decision",
    description: "Progressive knockout tournament with bounty considerations",
    situation: "PKO tournament, final 15 players. You cover villain who has a $500 bounty. Medium stack with 25bb facing a shove from villain with 12bb.",
    gameType: "PKO Tournament",
    stackSizes: [680000, 620000, 580000, 520000, 480000, 450000, 420000, 380000, 350000, 320000, 300000, 250000, 220000, 200000, 180000],
    payouts: [15000, 11000, 8500, 6500, 5000, 3800, 2900, 2200, 1700, 1300, 1000, 800, 650, 550, 450],
    heroPosition: 5,
    heroCards: ["Q♥", "J♥"],
    actions: [
      { action: "Fold", equity: 3200 },
      { action: "Call", equity: 3450 }
    ],
    optimalAction: "Call",
    difficulty: "advanced",
    credits: 100
  }
];

export default function IcmTrainer() {
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<IcmScenario | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery({
    queryKey: ["/api/scenarios/icm"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const submitActionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      return apiRequest("POST", "/api/training/session", actionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  // Use mock scenarios if database is empty
  const displayScenarios = scenarios.length > 0 ? scenarios : mockIcmScenarios;

  const handleScenarioSelect = (scenario: IcmScenario) => {
    if (user && user.credits < scenario.credits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${scenario.credits} credits to play this scenario.`,
        variant: "destructive",
      });
      setShowCreditModal(true);
      return;
    }

    setCurrentScenario(scenario);
    setSelectedAction("");
    setShowResult(false);
  };

  const handleActionSubmit = async () => {
    if (!currentScenario || !selectedAction) return;

    const isCorrect = selectedAction === currentScenario.optimalAction;
    const selectedActionData = currentScenario.actions.find(a => a.action === selectedAction);
    const optimalActionData = currentScenario.actions.find(a => a.action === currentScenario.optimalAction);
    const equityDifference = selectedActionData && optimalActionData ? 
      selectedActionData.equity - optimalActionData.equity : 0;

    try {
      await submitActionMutation.mutateAsync({
        scenarioId: currentScenario.id,
        userAction: selectedAction,
        isCorrect,
        evDifference: equityDifference,
        timeSpent: 45, // Mock time spent
      });

      setShowResult(true);
      
      toast({
        title: isCorrect ? "Excellent!" : "Good Try",
        description: isCorrect ? 
          "You made the optimal ICM decision!" : 
          `The optimal play was ${currentScenario.optimalAction} for maximum tournament equity.`,
        variant: isCorrect ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (currentScenario) {
    return (
      <div className="min-h-screen bg-poker-dark-900 text-white">
        <Header onOpenCreditModal={() => setShowCreditModal(true)} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentScenario(null)}
                className="mb-4"
              >
                ← Back to Scenarios
              </Button>
              
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-noto font-bold">{currentScenario.title}</h1>
                <Badge className={getDifficultyColor(currentScenario.difficulty)}>
                  {currentScenario.difficulty}
                </Badge>
              </div>
            </div>

            {/* Scenario Info */}
            <Card className="bg-poker-dark-800 border-poker-green-700 mb-6">
              <CardHeader>
                <CardTitle>Tournament Situation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{currentScenario.situation}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-amber-400">Tournament Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Type: {currentScenario.gameType}</div>
                      <div>Players Left: {currentScenario.stackSizes.length}</div>
                      <div>Your Position: {currentScenario.heroPosition + 1}/{currentScenario.stackSizes.length}</div>
                      <div>Your Stack: {currentScenario.stackSizes[currentScenario.heroPosition].toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-amber-400">Your Hand</h4>
                    <div className="flex space-x-1 mb-4">
                      {currentScenario.heroCards.map((card, index) => (
                        <div
                          key={index}
                          className="w-10 h-14 bg-white rounded border border-gray-300 flex items-center justify-center text-black text-sm font-bold"
                        >
                          {card}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payout Structure */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2 text-amber-400">Payout Structure (Top 9)</h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                    {currentScenario.payouts.slice(0, 9).map((payout, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-center ${
                          index === currentScenario.heroPosition ? 'bg-amber-600' : 'bg-poker-dark-900'
                        }`}
                      >
                        <div>#{index + 1}</div>
                        <div>${payout.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Selection */}
            <Card className="bg-poker-dark-800 border-poker-green-700 mb-6">
              <CardHeader>
                <CardTitle>ICM Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {currentScenario.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={selectedAction === action.action ? "default" : "outline"}
                      onClick={() => setSelectedAction(action.action)}
                      className={`p-4 h-auto ${
                        selectedAction === action.action
                          ? "bg-amber-600 border-amber-500"
                          : "border-poker-green-700"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{action.action}</div>
                        {showResult && (
                          <div className="text-sm mt-1">
                            Equity: ${action.equity.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                {!showResult ? (
                  <Button
                    onClick={handleActionSubmit}
                    disabled={!selectedAction || submitActionMutation.isPending}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {submitActionMutation.isPending ? "Submitting..." : "Submit Decision"}
                  </Button>
                ) : (
                  <div className="bg-poker-dark-900 rounded-lg p-4 border border-poker-green-700">
                    <h4 className="font-semibold mb-2 text-amber-400">ICM Analysis</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Optimal decision: <span className="font-semibold text-amber-400">{currentScenario.optimalAction}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                      This decision maximizes your tournament equity considering the payout structure and stack distributions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <Header onOpenCreditModal={() => setShowCreditModal(true)} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-noto font-bold mb-4">
            ICM <span className="text-amber-400">Training</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master Independent Chip Model calculations for optimal tournament decisions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-400">142</div>
              <div className="text-sm text-gray-400">ICM Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">18</div>
              <div className="text-sm text-gray-400">Scenarios</div>
            </CardContent>
          </Card>
          
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Calculator className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">72%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">+$1,250</div>
              <div className="text-sm text-gray-400">Equity Gained</div>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayScenarios.map((scenario: IcmScenario, index: number) => (
            <Card
              key={scenario.id || index}
              className="bg-poker-dark-800 border-poker-green-700 hover:border-amber-500 transition-colors cursor-pointer"
              onClick={() => handleScenarioSelect(scenario)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <Badge className={getDifficultyColor(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{scenario.gameType}</span>
                  <span className="text-amber-400">{scenario.credits} credits</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4">{scenario.description}</p>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Start Scenario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
    </div>
  );
}
