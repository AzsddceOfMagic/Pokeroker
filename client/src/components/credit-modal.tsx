import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Clock, Zap, Star, Users, X } from "lucide-react";

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreditModal({ isOpen, onClose }: CreditModalProps) {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const credits = user?.credits || 0;
  const maxCredits = 1000;
  const creditsPercentage = (credits / maxCredits) * 100;

  const handleSubscribe = () => {
    // In a real app, this would redirect to a subscription page
    window.open("/subscribe", "_blank");
  };

  const creditUsage = [
    {
      icon: Zap,
      name: "GTO Drills",
      cost: 50,
      color: "text-emerald-400",
      description: "Per scenario",
    },
    {
      icon: Star,
      name: "ICM Scenarios",
      cost: 100,
      color: "text-amber-400",
      description: "Per scenario",
    },
    {
      icon: Users,
      name: "Bot Practice",
      cost: 25,
      color: "text-blue-400",
      description: "Per 50 hands",
    },
  ];

  const nextRegenTime = () => {
    const lastRegen = user?.lastCreditRegeneration ? new Date(user.lastCreditRegeneration) : new Date();
    const nextRegen = new Date(lastRegen.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (nextRegen <= now) {
      return "Available now";
    }
    
    const diff = nextRegen.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-poker-dark-900 border-poker-green-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-noto font-semibold">
              Manage Credits
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-400">
            Track your credit balance and usage
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Coins className="w-8 h-8 text-yellow-400" />
            <div className="text-3xl font-bold text-yellow-400">{credits}</div>
          </div>
          <div className="text-sm text-gray-400 mb-4">Current Balance</div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to max</span>
              <span>{credits}/{maxCredits}</span>
            </div>
            <Progress value={creditsPercentage} className="h-2" />
          </div>
        </div>

        {/* Regeneration Info */}
        <Card className="bg-poker-dark-800 border-poker-green-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-medium text-sm">Daily Regeneration</div>
                <div className="text-xs text-gray-400">+100 credits every 24 hours</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Next regeneration:</span>
              <span className="text-emerald-400 font-medium">{nextRegenTime()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Credit Usage */}
        <Card className="bg-poker-dark-800 border-poker-green-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Credit Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creditUsage.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${item.color}`}>
                    {item.cost} credits
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Credit Warning */}
        {credits < 100 && (
          <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-400 font-medium text-sm">Low Credit Warning</span>
            </div>
            <p className="text-xs text-gray-300">
              You're running low on credits. Consider upgrading to unlimited access or wait for daily regeneration.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubscribe}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
          >
            Upgrade to Unlimited Access
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Or wait for daily credit regeneration
            </p>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-4 p-3 bg-poker-dark-800 rounded-lg border border-poker-green-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="font-medium text-emerald-400 mb-2">💡 Credit Tips:</div>
            <div>• Start with easier scenarios to maximize learning</div>
            <div>• Practice multiple scenarios to improve accuracy</div>
            <div>• Check back daily for free credit regeneration</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
