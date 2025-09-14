import { Button } from "@/components/ui/button";
import { Calendar, Star, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-voyance.jpg";

const Hero = () => {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-mystical-purple/5 via-background to-mystical-orange/5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-mystical-orange" />
                <span className="text-mystical-orange font-medium">Guidance Spirituelle</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-mystical-purple">Renaissance</span>
                <br />
                <span className="bg-gradient-to-r from-mystical-purple to-mystical-orange bg-clip-text text-transparent">
                  By Steph
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Découvrez votre chemin de vie à travers la voyance, le reiki et les énergies spirituelles. 
                Je vous accompagne dans votre quête de bien-être et de clarté.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-mystical-orange fill-current" />
                <Star className="h-5 w-5 text-mystical-orange fill-current" />
                <Star className="h-5 w-5 text-mystical-orange fill-current" />
                <Star className="h-5 w-5 text-mystical-orange fill-current" />
                <Star className="h-5 w-5 text-mystical-orange fill-current" />
              </div>
              <span className="text-sm text-muted-foreground">+200 consultations réalisées</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-mystical-purple to-mystical-orange text-white hover:opacity-90 transition-opacity shadow-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Prendre Rendez-vous
              </Button>
              <Button variant="outline" size="lg" className="border-mystical-purple text-mystical-purple hover:bg-mystical-purple hover:text-white">
                Découvrir mes services
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-mystical-purple">5+</div>
                <div className="text-sm text-muted-foreground">Années d'expérience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mystical-orange">200+</div>
                <div className="text-sm text-muted-foreground">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mystical-purple">4.9/5</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Voyance et guidance spirituelle Renaissance By Steph"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mystical-purple/20 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-mystical-orange rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-mystical-purple rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;