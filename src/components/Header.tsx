import { Button } from "@/components/ui/button";
import { Menu, X, Star, Calendar } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-mystical-orange" />
            <div>
              <h1 className="text-xl font-bold text-mystical-purple">Renaissance By Steph</h1>
              <p className="text-sm text-muted-foreground">Voyance & Guérison</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-foreground hover:text-mystical-orange transition-colors">
              Accueil
            </a>
            <a href="#services" className="text-foreground hover:text-mystical-orange transition-colors">
              Services
            </a>
            <a href="#a-propos" className="text-foreground hover:text-mystical-orange transition-colors">
              À Propos
            </a>
            <a href="#blog" className="text-foreground hover:text-mystical-orange transition-colors">
              Blog
            </a>
            <a href="#contact" className="text-foreground hover:text-mystical-orange transition-colors">
              Contact
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Se connecter
            </Button>
            <Button className="bg-gradient-to-r from-mystical-purple to-mystical-orange text-white" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Prendre RDV
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-4">
              <a href="#accueil" className="text-foreground hover:text-mystical-orange transition-colors">
                Accueil
              </a>
              <a href="#services" className="text-foreground hover:text-mystical-orange transition-colors">
                Services
              </a>
              <a href="#a-propos" className="text-foreground hover:text-mystical-orange transition-colors">
                À Propos
              </a>
              <a href="#blog" className="text-foreground hover:text-mystical-orange transition-colors">
                Blog
              </a>
              <a href="#contact" className="text-foreground hover:text-mystical-orange transition-colors">
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" size="sm">
                  Se connecter
                </Button>
                <Button className="bg-gradient-to-r from-mystical-purple to-mystical-orange text-white" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prendre RDV
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;