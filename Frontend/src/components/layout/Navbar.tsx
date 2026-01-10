import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cloud, Menu, X, User, Settings } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-glass-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-2 bg-gradient-primary rounded-xl">
                <Cloud className="w-5 h-5 text-primary-foreground" />
              </div>
            </motion.div>
            <span className="font-bold text-lg">
              Cloud<span className="gradient-text">Architect</span>
            </span>
          </Link>
          
          {/* Right Side */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-glass/50 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <GradientButton variant="ghost" size="sm">
                  Sign In
                </GradientButton>
              </Link>
              <Link to="/signup">
                <GradientButton size="sm">
                  Get Started
                </GradientButton>
              </Link>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-background/95 backdrop-blur-xl border-b border-glass-border"
        >
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-glass/50 transition-all">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  Profile
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                  <GradientButton variant="ghost" size="sm" className="w-full">
                    Sign In
                  </GradientButton>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block">
                  <GradientButton size="sm" className="w-full">
                    Get Started
                  </GradientButton>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
