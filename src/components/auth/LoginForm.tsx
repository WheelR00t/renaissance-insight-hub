import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData, GuestData } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone: z.string().optional(),
});

const guestSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, register, loginAsGuest } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', phone: '' }
  });

  const guestForm = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' }
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      onSuccess?.();
    } catch (error) {
      // Erreur gérée par le contexte
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      await register(data as RegisterData);
      onSuccess?.();
    } catch (error) {
      // Erreur gérée par le contexte
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async (data: z.infer<typeof guestSchema>) => {
    setLoading(true);
    try {
      await loginAsGuest(data as GuestData);
      onSuccess?.();
    } catch (error) {
      // Erreur gérée par le contexte
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Accès à votre espace</CardTitle>
        <CardDescription>
          Connectez-vous ou créez un compte pour réserver vos consultations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
            <TabsTrigger value="guest">Invité</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">Prénom</Label>
                  <Input
                    id="register-firstName"
                    {...registerForm.register('firstName')}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Nom</Label>
                  <Input
                    id="register-lastName"
                    {...registerForm.register('lastName')}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe</Label>
                <Input
                  id="register-password"
                  type="password"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone">Téléphone (optionnel)</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  {...registerForm.register('phone')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="guest">
            <form onSubmit={guestForm.handleSubmit(handleGuest)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-firstName">Prénom</Label>
                  <Input
                    id="guest-firstName"
                    {...guestForm.register('firstName')}
                  />
                  {guestForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {guestForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-lastName">Nom</Label>
                  <Input
                    id="guest-lastName"
                    {...guestForm.register('lastName')}
                  />
                  {guestForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {guestForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-email">Email</Label>
                <Input
                  id="guest-email"
                  type="email"
                  {...guestForm.register('email')}
                />
                {guestForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {guestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-phone">Téléphone (optionnel)</Label>
                <Input
                  id="guest-phone"
                  type="tel"
                  {...guestForm.register('phone')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création...' : 'Continuer en tant qu\'invité'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};