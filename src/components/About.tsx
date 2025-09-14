import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Sparkles, Award } from "lucide-react";

const About = () => {
  return (
    <section id="a-propos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-mystical-purple mb-4">
              À Propos de Stéphanie
            </h2>
            <p className="text-xl text-muted-foreground">
              Votre guide spirituelle dans votre quête de bien-être et de clarté
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-mystical-purple">
                  Un chemin vers la renaissance spirituelle
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Depuis plus de 5 ans, je vous accompagne dans votre développement personnel et spirituel. 
                  Passionnée par les arts divinatoires et les énergies de guérison, j'ai développé une approche 
                  bienveillante et intuitive pour vous aider à trouver vos réponses.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Formée aux techniques de Reiki et experte en tarologie, je mets mes dons au service de votre 
                  épanouissement. Chaque consultation est unique et personnalisée selon vos besoins.
                </p>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-mystical-orange">Formations & Certifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-mystical-orange" />
                    <span className="text-sm">Maître Reiki Usui certifiée</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-mystical-orange" />
                    <span className="text-sm">Formation en tarologie et oracle</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-mystical-orange" />
                    <span className="text-sm">Radiesthésie et pendule</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-mystical-orange" />
                    <span className="text-sm">Techniques de guérison holistique</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6 bg-gradient-to-br from-mystical-purple/10 to-mystical-orange/10 border-0">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-mystical-purple rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-mystical-purple mb-1">200+</div>
                    <div className="text-sm text-muted-foreground">Consultations</div>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 bg-gradient-to-br from-mystical-orange/10 to-mystical-purple/10 border-0">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-mystical-orange rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-mystical-orange mb-1">4.9/5</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 bg-gradient-to-br from-mystical-orange/10 to-mystical-purple/10 border-0">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-mystical-orange rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-mystical-orange mb-1">5+</div>
                    <div className="text-sm text-muted-foreground">Années d'expérience</div>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 bg-gradient-to-br from-mystical-purple/10 to-mystical-orange/10 border-0">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-mystical-purple rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-mystical-purple mb-1">95%</div>
                    <div className="text-sm text-muted-foreground">Retours positifs</div>
                  </CardContent>
                </Card>
              </div>

              {/* Mission */}
              <Card className="p-6 bg-gradient-to-r from-mystical-purple/5 to-mystical-orange/5 border-0">
                <CardContent className="p-0">
                  <h4 className="text-lg font-semibold text-mystical-purple mb-3">Ma Mission</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vous accompagner avec bienveillance dans votre quête de clarté et de bien-être. 
                    Chaque consultation est un moment privilégié pour explorer vos possibilités et 
                    trouver les réponses qui vous guideront vers votre renaissance personnelle.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;