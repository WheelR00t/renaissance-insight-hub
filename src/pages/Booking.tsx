import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { servicesAPI, appointmentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Service } from '@/types';
import { toast } from 'sonner';
import { Clock, MapPin, Video, Euro, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const bookingSchema = z.object({
  date: z.date({ required_error: 'Veuillez sélectionner une date' }),
  startTime: z.string().min(1, 'Veuillez sélectionner un créneau'),
  type: z.enum(['online', 'in-person'], { required_error: 'Veuillez choisir le type de consultation' }),
  notes: z.string().optional(),
});

export default function Booking() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesAPI.getById(serviceId!),
    enabled: !!serviceId,
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', serviceId, selectedDate],
    queryFn: () => appointmentsAPI.getAvailability(
      serviceId!,
      selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
    ),
    enabled: !!serviceId && !!selectedDate,
  });

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: 'online',
      notes: '',
    },
  });

  const bookingMutation = useMutation({
    mutationFn: appointmentsAPI.book,
    onSuccess: (data) => {
      toast.success('Rendez-vous réservé avec succès !');
      navigate(`/appointment/${data.appointment._id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la réservation');
    },
  });

  const handleSubmit = async (data: z.infer<typeof bookingSchema>) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const bookingData = {
      serviceId: serviceId!,
      date: format(data.date, 'yyyy-MM-dd'),
      startTime: data.startTime,
      type: data.type,
      notes: data.notes,
    };

    bookingMutation.mutate(bookingData);
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Service non trouvé</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Réserver votre consultation</h1>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {service.name}
                  <Badge variant="secondary">{service.price}€</Badge>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      {service.isOnline && <Video className="h-4 w-4" />}
                      {service.isInPerson && <MapPin className="h-4 w-4" />}
                      {service.isOnline && service.isInPerson 
                        ? 'En ligne ou en cabinet'
                        : service.isOnline 
                        ? 'En ligne uniquement'
                        : 'En cabinet uniquement'
                      }
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Ce qui est inclus :</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sélection de la date */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Choisissez une date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      form.setValue('date', date!);
                    }}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                    locale={fr}
                    className="rounded-md border"
                  />
                  {form.formState.errors.date && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Sélection du créneau */}
              <Card>
                <CardHeader>
                  <CardTitle>2. Choisissez un créneau</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    availabilityLoading ? (
                      <div className="text-center py-4">Chargement des créneaux...</div>
                    ) : availability?.slots?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availability.slots.map((slot: string) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={form.watch('startTime') === slot ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => form.setValue('startTime', slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Aucun créneau disponible pour cette date
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Sélectionnez d'abord une date
                    </div>
                  )}
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.startTime.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Type de consultation */}
            {(service.isOnline && service.isInPerson) && (
              <Card>
                <CardHeader>
                  <CardTitle>3. Type de consultation</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.watch('type')}
                    onValueChange={(value) => form.setValue('type', value as 'online' | 'in-person')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Consultation en ligne (visioconférence)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label htmlFor="in-person" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Consultation en cabinet
                      </Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.type && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes additionnelles */}
            <Card>
              <CardHeader>
                <CardTitle>4. Notes (optionnel)</CardTitle>
                <CardDescription>
                  Partagez vos questions ou préoccupations pour personnaliser votre consultation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Décrivez brièvement ce que vous aimeriez aborder lors de la consultation..."
                  {...form.register('notes')}
                />
              </CardContent>
            </Card>

            {/* Récapitulatif et réservation */}
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Service :</span>
                  <span>{service.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Date :</span>
                  <span>
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Non sélectionnée'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Heure :</span>
                  <span>{form.watch('startTime') || 'Non sélectionnée'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Type :</span>
                  <span>
                    {form.watch('type') === 'online' ? 'En ligne' : 'En cabinet'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total :</span>
                  <span className="flex items-center gap-1">
                    <Euro className="h-4 w-4" />
                    {service.price}€
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending
                    ? 'Réservation en cours...'
                    : user
                    ? 'Confirmer la réservation'
                    : 'Se connecter et réserver'
                  }
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>

      {/* Dialog de connexion */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
          </DialogHeader>
          <LoginForm onSuccess={() => setShowLoginDialog(false)} />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}