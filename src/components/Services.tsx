import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Compass, Zap } from "lucide-react";
import tarotImage from "@/assets/tarot-cards.jpg";
import reikiImage from "@/assets/reiki-healing.jpg";
import penduleImage from "@/assets/pendule.jpg";

const Services = () => {
  const services = [
    {
      title: "Tirage de Cartes",
      description: "Guidance et clarté à travers la lecture des cartes de tarot et d'oracle",
      price: "À partir de 45€",
      duration: "30-60 min",
      icon: Sparkles,
      image: tarotImage,
      features: [
        "Lecture personnalisée",
        "Guidance sur l'avenir",
        "Conseils pratiques",
        "Support émotionnel"
      ]
    },
    {
      title: "Reiki",
      description: "Séance de guérison énergétique pour harmoniser corps et esprit",
      price: "À partir de 60€",
      duration: "45-90 min",
      icon: Heart,
      image: reikiImage,
      features: [
        "Rééquilibrage énergétique",
        "Détente profonde",
        "Libération des blocages",
        "Bien-être global"
      ]
    },
    {
      title: "Pendule",
      description: "Consultation par radiesthésie pour répondre à vos questions précises",
      price: "À partir de 35€",
      duration: "20-45 min",
      icon: Compass,
      image: penduleImage,
      features: [
        "Réponses précises",
        "Recherche d'objets",
        "Guidance décisionnelle",
        "Clarification"
      ]
    },
    {
      title: "Guérison",
      description: "Séance de guérison holistique combinant plusieurs approches",
      price: "À partir de 80€",
      duration: "60-120 min",
      icon: Zap,
      image: reikiImage,
      features: [
        "Approche holistique",
        "Techniques combinées",
        "Guérison profonde",
        "Transformation"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-mystical-purple mb-4">
            Mes Services de Guidance Spirituelle
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez mes différentes approches pour vous accompagner sur votre chemin de développement personnel et spirituel
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mystical-purple/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 bg-mystical-orange rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-mystical-purple text-xl">{service.title}</CardTitle>
                      <CardDescription className="mt-2">{service.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                    <span className="font-semibold text-mystical-orange text-lg">{service.price}</span>
                    <span>{service.duration}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 bg-mystical-orange rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-mystical-purple to-mystical-orange text-white hover:opacity-90 transition-opacity"
                  >
                    Réserver ce service
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Card className="inline-block p-6 bg-gradient-to-r from-mystical-purple/10 to-mystical-orange/10 border-0">
            <h3 className="text-lg font-semibold text-mystical-purple mb-2">
              Besoin d'un conseil personnalisé ?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contactez-moi pour discuter de vos besoins spécifiques
            </p>
            <Button variant="outline" className="border-mystical-purple text-mystical-purple hover:bg-mystical-purple hover:text-white">
              Consultation gratuite
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;