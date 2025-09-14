import { Star, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-mystical-purple text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-mystical-orange" />
                <div>
                  <h3 className="text-xl font-bold">Renaissance By Steph</h3>
                  <p className="text-sm text-mystical-orange">Voyance & Guérison</p>
                </div>
              </div>
              <p className="text-sm text-purple-200 leading-relaxed">
                Votre guide spirituelle pour un accompagnement bienveillant vers la clarté et le bien-être.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" className="bg-mystical-orange hover:bg-mystical-orange-light text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prendre RDV
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-mystical-orange">Services</h4>
              <nav className="space-y-2">
                <a href="#services" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Tirage de Cartes
                </a>
                <a href="#services" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Reiki
                </a>
                <a href="#services" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Pendule
                </a>
                <a href="#services" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Guérison Holistique
                </a>
              </nav>
            </div>

            {/* Navigation */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-mystical-orange">Navigation</h4>
              <nav className="space-y-2">
                <a href="#accueil" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Accueil
                </a>
                <a href="#services" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Services
                </a>
                <a href="#a-propos" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  À Propos
                </a>
                <a href="#blog" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Blog
                </a>
                <a href="#contact" className="block text-sm text-purple-200 hover:text-mystical-orange transition-colors">
                  Contact
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-mystical-orange">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-mystical-orange" />
                  <span className="text-sm text-purple-200">contact@renaissancebysteph.fr</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-mystical-orange" />
                  <span className="text-sm text-purple-200">06 XX XX XX XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-mystical-orange" />
                  <span className="text-sm text-purple-200">Consultations en ligne</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-mystical-orange">Horaires</h5>
                <p className="text-xs text-purple-200">Lundi - Vendredi: 9h - 19h</p>
                <p className="text-xs text-purple-200">Samedi: 10h - 16h</p>
                <p className="text-xs text-purple-200">Dimanche: Sur rendez-vous</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-400/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-purple-200">
              © 2024 Renaissance By Steph. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-xs text-purple-200 hover:text-mystical-orange transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-xs text-purple-200 hover:text-mystical-orange transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-xs text-purple-200 hover:text-mystical-orange transition-colors">
                CGV
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;