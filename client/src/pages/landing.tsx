import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spade, TrendingUp, Users, Zap, Star, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      {/* Header */}
      <header className="bg-poker-dark-800 border-b border-poker-green-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Spade className="text-white text-xl" />
              </div>
              <h1 className="text-xl font-noto font-bold text-white">PokerPro</h1>
            </div>
            <Button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="poker-felt py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-noto font-bold mb-6">
              Master Your <span className="text-emerald-400">Poker Game</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Professional GTO and ICM training platform with AI-powered analysis, 
              real-time feedback, and comprehensive poker strategy development.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg"
            >
              Start Training Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-poker-dark-800">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-noto font-bold text-center mb-12">
            Everything You Need to Improve
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-emerald-400 mb-4" />
                <CardTitle className="text-white">GTO Training</CardTitle>
                <CardDescription className="text-gray-400">
                  Master Game Theory Optimal play with pre-solved scenarios and real-time feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Pre-solved GTO scenarios</li>
                  <li>• Real-time EV analysis</li>
                  <li>• Range visualization</li>
                  <li>• Custom position training</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <Star className="w-12 h-12 text-amber-400 mb-4" />
                <CardTitle className="text-white">ICM Training</CardTitle>
                <CardDescription className="text-gray-400">
                  Learn Independent Chip Model calculations for tournament optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Tournament equity calculations</li>
                  <li>• Bubble play scenarios</li>
                  <li>• Final table optimization</li>
                  <li>• PKO strategy training</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <Zap className="w-12 h-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">Bot Practice</CardTitle>
                <CardDescription className="text-gray-400">
                  Practice against AI opponents with customizable playing styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Multiple difficulty levels</li>
                  <li>• Adaptive AI opponents</li>
                  <li>• Hand history analysis</li>
                  <li>• Custom bot personalities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <Users className="w-12 h-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Progress Tracking</CardTitle>
                <CardDescription className="text-gray-400">
                  Comprehensive analytics to track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Detailed performance metrics</li>
                  <li>• Skill progression charts</li>
                  <li>• Weakness identification</li>
                  <li>• Achievement system</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <Shield className="w-12 h-12 text-green-400 mb-4" />
                <CardTitle className="text-white">Demo Credits</CardTitle>
                <CardDescription className="text-gray-400">
                  Start with 1,000 credits and earn more daily to access premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• 1,000 starting credits</li>
                  <li>• Daily credit regeneration</li>
                  <li>• No real money required</li>
                  <li>• Educational focus</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-poker-dark-900 border-poker-green-700">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-red-400 mb-4" />
                <CardTitle className="text-white">Professional Tools</CardTitle>
                <CardDescription className="text-gray-400">
                  Industry-standard tools used by professional poker players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Hand range analysis</li>
                  <li>• Equity calculations</li>
                  <li>• Bet sizing optimization</li>
                  <li>• Multi-street planning</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="poker-felt py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-noto font-bold mb-6">
            Ready to Take Your Game to the Next Level?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players who have improved their poker skills with our comprehensive training platform.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg"
          >
            Get Started Free
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            No real money gambling • Educational use only
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-poker-dark-800 border-t border-poker-green-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Spade className="text-white" />
                </div>
                <h4 className="font-noto font-bold">PokerPro</h4>
              </div>
              <p className="text-sm text-gray-400">
                Professional poker training platform for serious players looking to improve their game.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Training</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>GTO Trainer</li>
                <li>ICM Trainer</li>
                <li>Bot Practice</li>
                <li>Hand Analysis</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Tutorials</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Responsible Gaming</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-poker-green-700 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 PokerPro Training Platform. Educational use only - No real money gambling.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
