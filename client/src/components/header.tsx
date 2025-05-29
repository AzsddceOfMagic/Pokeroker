import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spade, Menu, X, User, LogOut, Coins } from "lucide-react";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  onOpenCreditModal: () => void;
}

export default function Header({ onOpenCreditModal }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigation = [
    { name: "Home", href: "/", current: location === "/" },
    { name: "GTO Trainer", href: "/gto-trainer", current: location === "/gto-trainer" },
    { name: "ICM Trainer", href: "/icm-trainer", current: location === "/icm-trainer" },
    { name: "Bot Practice", href: "/bot-practice", current: location === "/bot-practice" },
    { name: "Coaching", href: "#", current: false },
    { name: "Community", href: "#", current: false },
  ];

  const credits = userData?.credits || 0;
  const maxCredits = 1000;
  const creditsPercentage = (credits / maxCredits) * 100;

  return (
    <header className="bg-poker-dark-800 border-b border-poker-green-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Spade className="text-white text-xl" />
              </div>
              <h1 className="text-xl font-noto font-bold text-white">PokerPro</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`text-white hover:text-emerald-400 transition-colors font-medium ${
                    item.current ? "text-emerald-400" : ""
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          {/* Credits & Profile */}
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div
              className="bg-poker-dark-900 rounded-lg px-4 py-2 border border-poker-green-700 cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={onOpenCreditModal}
            >
              <div className="flex items-center space-x-2">
                <Coins className="text-yellow-400 w-4 h-4" />
                <span className="text-sm font-medium">{credits}</span>
                <span className="text-xs text-gray-400">/ {maxCredits}</span>
              </div>
              <div className="w-20 h-1 bg-poker-dark-800 rounded-full mt-1">
                <div
                  className="h-1 bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${creditsPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="text-white hover:text-emerald-400 p-2"
              >
                {userData?.profileImageUrl ? (
                  <img
                    src={userData.profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </Button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-poker-dark-800 border border-poker-green-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3 border-b border-poker-green-700">
                  <div className="text-sm font-medium text-white">
                    {userData?.firstName || userData?.email || "User"}
                  </div>
                  <div className="text-xs text-gray-400">{userData?.email}</div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-poker-dark-900 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="lg:hidden text-white hover:text-emerald-400 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-poker-green-700">
            <nav className="flex flex-col space-y-2 mt-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`block px-3 py-2 text-white hover:text-emerald-400 hover:bg-poker-dark-900 rounded transition-colors ${
                      item.current ? "text-emerald-400 bg-poker-dark-900" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
