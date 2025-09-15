import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI, paymentsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Euro, MapPin, Video, User, CreditCard, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: appointmentsAPI.getMy,
    enabled: !!user,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: paymentsAPI.getHistory,
    enabled: !!user,
  });

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du profil */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.email}
                      {user.isGuest && <Badge variant="outline">Compte invité</Badge>}
                      {user.isAdmin && <Badge variant="secondary">Administrateur</Badge>}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments">Mes rendez-vous</TabsTrigger>
              <TabsTrigger value="payments">Historique des paiements</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mes consultations</h2>
                <Button onClick={() => window.location.href = '/'}>
                  Réserver une consultation
                </Button>
              </div>

              {appointmentsLoading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : appointments?.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <Card key={appointment._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {typeof appointment.service === 'object' 
                                ? appointment.service.name 
                                : 'Service supprimé'
                              }
                            </CardTitle>
                            <CardDescription>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.startTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  {appointment.type === 'online' ? (
                                    <Video className="h-4 w-4" />
                                  ) : (
                                    <MapPin className="h-4 w-4" />
                                  )}
                                  {appointment.type === 'online' ? 'En ligne' : 'En cabinet'}
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              {appointment.price}€
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      {appointment.notes && (
                        <CardContent>
                          <div className="text-sm">
                            <strong>Notes :</strong> {appointment.notes}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun rendez-vous</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore de consultation prévue.
                    </p>
                    <Button onClick={() => window.location.href = '/'}>
                      Réserver ma première consultation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <h2 className="text-xl font-semibold">Historique des paiements</h2>

              {paymentsLoading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : payments?.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment: any) => (
                    <Card key={payment._id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">
                              {typeof payment.appointment === 'object' && payment.appointment.service
                                ? (typeof payment.appointment.service === 'object' 
                                    ? payment.appointment.service.name 
                                    : 'Service')
                                : 'Paiement'
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(payment.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge className={getPaymentStatusColor(payment.status)}>
                                {getPaymentStatusText(payment.status)}
                              </Badge>
                            </div>
                            <div className="text-lg font-semibold flex items-center gap-1">
                              <Euro className="h-4 w-4" />
                              {payment.amount}€
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun paiement</h3>
                    <p className="text-muted-foreground">
                      Aucun paiement n'a été effectué pour le moment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}