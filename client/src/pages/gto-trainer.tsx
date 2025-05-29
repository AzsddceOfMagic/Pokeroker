import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import CreditModal from "@/components/credit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getGtoScenarios } from "@/lib/gto-scenarios";
import { evaluateGtoAction } from "@/lib/poker-logic";
import { TrendingUp, Clock, Target, Award } from "lucide-react";

interface GtoScenario {
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

export default function GtoTrainer() {
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<GtoScenario | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery({
    queryKey: ["/api/scenarios/gto"],
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

  // Load default scenarios if database is empty
  const displayScenarios = scenarios.length > 0 ? scenarios : getGtoScenarios();

  const handleScenarioSelect = (scenario: GtoScenario) => {
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
    const evaluation = evaluateGtoAction(selectedAction, currentScenario);

    try {
      await submitActionMutation.mutateAsync({
        scenarioId: currentScenario.id,
        userAction: selectedAction,
        isCorrect,
        evDifference: evaluation.evDifference,
        timeSpent: 30, // Mock time spent
      });

      setShowResult(true);
      
      toast({
        title: isCorrect ? "Excellent!" : "Good Try",
        description: evaluation.feedback,
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
                <CardTitle>Situation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{currentScenario.situation}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-emerald-400">Game Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Game Type: {currentScenario.gameType}</div>
                      <div>Position: {currentScenario.position}</div>
                      <div>Pot Size: ${currentScenario.potSize}</div>
                      <div>Current Bet: ${currentScenario.betSize}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-emerald-400">Cards</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Your Hand:</span>
                        <div className="flex space-x-1">
                          {currentScenario.heroCards.map((card, index) => (
                            <div
                              key={index}
                              className="w-8 h-12 bg-white rounded border border-gray-300 flex items-center justify-center text-black text-xs font-bold"
                            >
                              {card}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {currentScenario.boardCards.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Board:</span>
                          <div className="flex space-x-1">
                            {currentScenario.boardCards.map((card, index) => (
                              <div
                                key={index}
                                className="w-8 h-12 bg-white rounded border border-gray-300 flex items-center justify-center text-black text-xs font-bold"
                              >
                                {card}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Selection */}
            <Card className="bg-poker-dark-800 border-poker-green-700 mb-6">
              <CardHeader>
                <CardTitle>Choose Your Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {currentScenario.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={selectedAction === action.action ? "default" : "outline"}
                      onClick={() => setSelectedAction(action.action)}
                      className={`p-4 h-auto ${
                        selectedAction === action.action
                          ? "bg-emerald-600 border-emerald-500"
                          : "border-poker-green-700"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{action.action}</div>
                        {showResult && (
                          <div className="text-sm mt-1">
                            EV: {action.ev > 0 ? "+" : ""}{action.ev.toFixed(2)}
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitActionMutation.isPending ? "Submitting..." : "Submit Action"}
                  </Button>
                ) : (
                  <div className="bg-poker-dark-900 rounded-lg p-4 border border-poker-green-700">
                    <h4 className="font-semibold mb-2 text-emerald-400">Analysis</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Optimal action: <span className="font-semibold text-emerald-400">{currentScenario.optimalAction}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                      {evaluateGtoAction(selectedAction, currentScenario).feedback}
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
            GTO <span className="text-emerald-400">Training</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master Game Theory Optimal play with pre-solved scenarios and real-time feedback
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-400">87%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">24</div>
              <div className="text-sm text-gray-400">Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">+12.5</div>
              <div className="text-sm text-gray-400">Avg EV</div>
            </CardContent>
          </Card>
          
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">Gold</div>
              <div className="text-sm text-gray-400">Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayScenarios.map((scenario: GtoScenario, index: number) => (
            <Card
              key={scenario.id || index}
              className="bg-poker-dark-800 border-poker-green-700 hover:border-emerald-500 transition-colors cursor-pointer"
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
                  <span>{scenario.gameType} • {scenario.position}</span>
                  <span className="text-emerald-400">{scenario.credits} credits</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4">{scenario.description}</p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
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
