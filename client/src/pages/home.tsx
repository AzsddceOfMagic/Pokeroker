import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import PokerTable from "@/components/poker-table";
import CreditModal from "@/components/credit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Zap, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [showCreditModal, setShowCreditModal] = useState(false);

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: recentSessions } = useQuery({
    queryKey: ["/api/training/sessions"],
  });

  const stats = [
    {
      label: "Hands Played",
      value: progress?.totalHandsPlayed || 0,
      icon: Clock,
      color: "text-emerald-400",
    },
    {
      label: "GTO Accuracy",
      value: `${Math.round(Number(progress?.gtoAccuracy || 0))}%`,
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      label: "ICM Score",
      value: Math.round(Number(progress?.icmScore || 0)),
      icon: Star,
      color: "text-emerald-400",
    },
    {
      label: "Win Rate",
      value: `+${Number(progress?.winRate || 0).toFixed(1)}`,
      icon: Zap,
      color: "text-emerald-400",
    },
  ];

  const trainingModules = [
    {
      title: "GTO Training",
      description: "Master Game Theory Optimal play with pre-solved scenarios and real-time feedback",
      credits: 50,
      color: "emerald",
      link: "/gto-trainer",
      scenarios: [
        { name: "Button vs BB 3-bet", status: "completed" },
        { name: "SB vs BB postflop", status: "in-progress" },
        { name: "4-bet pots OOP", status: "locked" },
      ],
    },
    {
      title: "ICM Training",
      description: "Learn Independent Chip Model calculations for tournament optimization",
      credits: 100,
      color: "amber",
      link: "/icm-trainer",
      scenarios: [
        { name: "Final Table Bubble", status: "completed" },
        { name: "Short Stack Push/Fold", status: "available" },
        { name: "PKO Calculations", status: "premium" },
      ],
    },
    {
      title: "Bot Practice",
      description: "Practice against AI opponents with customizable playing styles and difficulty",
      credits: 25,
      color: "blue",
      link: "/bot-practice",
      scenarios: [
        { name: "GTO Bot (Expert)", status: "hard" },
        { name: "LAG Bot (Advanced)", status: "medium" },
        { name: "TAG Bot (Beginner)", status: "easy" },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400";
      case "in-progress":
        return "text-yellow-400";
      case "available":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "easy":
        return "text-emerald-400";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <Header onOpenCreditModal={() => setShowCreditModal(true)} />

      {/* Hero Section */}
      <section className="poker-felt py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-noto font-bold mb-4">
              Master Your <span className="text-emerald-400">Poker Game</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional GTO and ICM training platform with AI-powered analysis and real-time feedback
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-poker-dark-800/50 backdrop-blur rounded-xl p-4 text-center border border-poker-green-700/30"
              >
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Modules */}
      <section className="py-12 bg-poker-dark-800">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-noto font-bold text-center mb-12">Training Modules</h3>

          <div className="grid lg:grid-cols-3 gap-8">
            {trainingModules.map((module, index) => (
              <Card
                key={index}
                className="bg-poker-dark-900 border-poker-green-700 hover:border-emerald-500 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl font-noto font-semibold text-white">
                      {module.title}
                    </CardTitle>
                    <div className={`bg-${module.color}-500 text-white px-2 py-1 rounded text-xs font-medium`}>
                      {module.credits} Credits
                    </div>
                  </div>
                  <p className="text-gray-400 mb-6">{module.description}</p>

                  {/* Sample Scenarios */}
                  <div className="space-y-3 mb-6">
                    {module.scenarios.map((scenario, scenarioIndex) => (
                      <div
                        key={scenarioIndex}
                        className="bg-poker-dark-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-sm">{scenario.name}</span>
                        <span className={`text-xs ${getStatusColor(scenario.status)} capitalize`}>
                          {scenario.status.replace("-", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={module.link}>
                    <Button
                      className={`w-full bg-${module.color}-600 hover:bg-${module.color}-700 text-white py-3 rounded-lg font-medium transition-colors`}
                    >
                      Start Training
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Poker Table */}
      <section className="py-12 poker-felt">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-noto font-bold text-center mb-12">Live Training Session</h3>
          <PokerTable />
        </div>
      </section>

      {/* Progress Dashboard */}
      <section className="py-12 bg-poker-dark-800">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-noto font-bold text-center mb-12">Your Progress</h3>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills Chart */}
            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <CardTitle className="text-xl font-noto font-semibold text-white">
                  Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Preflop GTO", value: Number(progress?.preflopAccuracy || 0), color: "emerald" },
                    { name: "Postflop Play", value: Number(progress?.postflopAccuracy || 0), color: "yellow" },
                    { name: "ICM Understanding", value: Number(progress?.icmScore || 0), color: "blue" },
                    { name: "Bet Sizing", value: Number(progress?.bettingSizeAccuracy || 0), color: "purple" },
                  ].map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className={`text-sm text-${skill.color}-400`}>{Math.round(skill.value)}%</span>
                      </div>
                      <Progress value={skill.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <CardTitle className="text-xl font-noto font-semibold text-white">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions?.slice(0, 3).map((session: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-poker-dark-800 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm">Training Session #{session.id}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${session.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {session.isCorrect ? '+EV' : '-EV'}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-400 py-8">
                      No training sessions yet. Start your first session above!
                    </div>
                  )}
                </div>

                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
    </div>
  );
}
