import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import PokerTable from "@/components/poker-table";
import CreditModal from "@/components/credit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Users, Zap, Target, Play, Settings } from "lucide-react";

interface BotSession {
  id?: number;
  botType: string;
  difficulty: string;
  handsPlayed: number;
  handsWon: number;
  totalProfit: number;
  creditsSpent: number;
}

const botTypes = [
  {
    id: "gto",
    name: "GTO Bot",
    description: "Plays optimal Game Theory strategy",
    difficulty: "Expert",
    color: "bg-red-500",
    icon: Target,
  },
  {
    id: "lag",
    name: "LAG Bot",
    description: "Loose Aggressive playing style",
    difficulty: "Advanced",
    color: "bg-yellow-500",
    icon: Zap,
  },
  {
    id: "tag",
    name: "TAG Bot",
    description: "Tight Aggressive playing style",
    difficulty: "Beginner",
    color: "bg-green-500",
    icon: Users,
  },
];

export default function BotPractice() {
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("medium");
  const [currentSession, setCurrentSession] = useState<BotSession | null>(null);
  const [gameState, setGameState] = useState<"setup" | "playing" | "finished">("setup");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: previousSessions = [] } = useQuery({
    queryKey: ["/api/bot/sessions"],
  });

  const startSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return apiRequest("POST", "/api/bot/session", sessionData);
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      setGameState("playing");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PUT", `/api/bot/session/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/sessions"] });
    },
  });

  const handleStartSession = async () => {
    if (!selectedBot) {
      toast({
        title: "Select a Bot",
        description: "Please choose a bot to practice against.",
        variant: "destructive",
      });
      return;
    }

    if (user && user.credits < 25) {
      toast({
        title: "Insufficient Credits",
        description: "You need 25 credits to start a bot practice session.",
        variant: "destructive",
      });
      setShowCreditModal(true);
      return;
    }

    try {
      await startSessionMutation.mutateAsync({
        botType: selectedBot,
        difficulty: selectedDifficulty,
        handsPlayed: 0,
        handsWon: 0,
        totalProfit: 0,
      });

      toast({
        title: "Session Started",
        description: `Started practice session against ${getBotName(selectedBot)} bot.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start bot session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async () => {
    if (!currentSession?.id) return;

    try {
      await updateSessionMutation.mutateAsync({
        id: currentSession.id,
        updates: {
          endedAt: new Date(),
          handsPlayed: currentSession.handsPlayed,
          handsWon: currentSession.handsWon,
          totalProfit: currentSession.totalProfit,
        },
      });

      setGameState("finished");
      toast({
        title: "Session Completed",
        description: `Played ${currentSession.handsPlayed} hands with ${currentSession.handsWon} wins.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session.",
        variant: "destructive",
      });
    }
  };

  const getBotName = (botId: string) => {
    const bot = botTypes.find(b => b.id === botId);
    return bot ? bot.name : botId;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
      case "easy":
        return "text-green-400";
      case "intermediate":
      case "medium":
        return "text-yellow-400";
      case "advanced":
      case "expert":
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (gameState === "playing" && currentSession) {
    return (
      <div className="min-h-screen bg-poker-dark-900 text-white">
        <Header onOpenCreditModal={() => setShowCreditModal(true)} />
        
        <div className="container mx-auto px-4 py-8">
          {/* Session Info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-noto font-bold">
                Practice vs {getBotName(currentSession.botType)}
              </h1>
              <p className="text-gray-400">
                Difficulty: <span className={getDifficultyColor(currentSession.difficulty)}>
                  {currentSession.difficulty}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Hands</div>
                <div className="font-bold">{currentSession.handsPlayed}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Won</div>
                <div className="font-bold text-emerald-400">{currentSession.handsWon}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Profit</div>
                <div className={`font-bold ${currentSession.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentSession.totalProfit >= 0 ? '+' : ''}{currentSession.totalProfit.toFixed(2)} bb
                </div>
              </div>
              <Button
                onClick={handleEndSession}
                variant="outline"
                disabled={updateSessionMutation.isPending}
              >
                End Session
              </Button>
            </div>
          </div>

          {/* Poker Table */}
          <PokerTable 
            botType={currentSession.botType}
            onHandComplete={(won: boolean, profit: number) => {
              setCurrentSession(prev => prev ? {
                ...prev,
                handsPlayed: prev.handsPlayed + 1,
                handsWon: prev.handsWon + (won ? 1 : 0),
                totalProfit: prev.totalProfit + profit,
              } : null);
            }}
          />
        </div>

        <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-poker-dark-900 text-white">
        <Header onOpenCreditModal={() => setShowCreditModal(true)} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-noto font-bold mb-6">Session Complete!</h1>
            
            <Card className="bg-poker-dark-800 border-poker-green-700 mb-6">
              <CardHeader>
                <CardTitle>Session Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{currentSession?.handsPlayed}</div>
                    <div className="text-sm text-gray-400">Hands Played</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{currentSession?.handsWon}</div>
                    <div className="text-sm text-gray-400">Hands Won</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${(currentSession?.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(currentSession?.totalProfit || 0) >= 0 ? '+' : ''}{(currentSession?.totalProfit || 0).toFixed(2)} bb
                    </div>
                    <div className="text-sm text-gray-400">Total Profit</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  setGameState("setup");
                  setCurrentSession(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Start New Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <Header onOpenCreditModal={() => setShowCreditModal(true)} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-noto font-bold mb-4">
            Bot <span className="text-blue-400">Practice</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Practice against AI opponents with customizable playing styles and difficulty levels
          </p>
        </div>

        {/* Bot Selection */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-poker-dark-800 border-poker-green-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-6 h-6" />
                <span>Setup Practice Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Select Bot Opponent</label>
                  <div className="grid gap-3">
                    {botTypes.map((bot) => (
                      <div
                        key={bot.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedBot === bot.id
                            ? "border-blue-500 bg-blue-900/20"
                            : "border-poker-green-700 hover:border-blue-400"
                        }`}
                        onClick={() => setSelectedBot(bot.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <bot.icon className="w-6 h-6 text-blue-400" />
                            <div>
                              <div className="font-medium">{bot.name}</div>
                              <div className="text-sm text-gray-400">{bot.description}</div>
                            </div>
                          </div>
                          <Badge className={`${bot.color} text-white`}>
                            {bot.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Game Settings</label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Difficulty Level</label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="bg-poker-dark-900 border-poker-green-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-poker-dark-900 rounded-lg border border-poker-green-700">
                      <h4 className="font-medium mb-2 text-blue-400">Session Cost</h4>
                      <div className="text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Cost per session:</span>
                          <span className="text-blue-400">25 credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hands included:</span>
                          <span>Up to 50 hands</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartSession}
                disabled={!selectedBot || startSessionMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {startSessionMutation.isPending ? (
                  "Starting Session..."
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice Session (25 Credits)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Previous Sessions */}
        {previousSessions.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-noto font-bold mb-6">Recent Sessions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previousSessions.slice(0, 6).map((session: any, index: number) => (
                <Card key={index} className="bg-poker-dark-800 border-poker-green-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{getBotName(session.botType)}</span>
                      <Badge className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Hands</div>
                        <div className="font-medium">{session.handsPlayed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Won</div>
                        <div className="font-medium text-emerald-400">{session.handsWon}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Profit</div>
                        <div className={`font-medium ${session.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {session.totalProfit >= 0 ? '+' : ''}{Number(session.totalProfit).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
    </div>
  );
}
