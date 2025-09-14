# Renaissance By Steph - Backend API

API backend complète pour le site de voyance Renaissance By Steph.

## 🚀 Fonctionnalités

- **Authentification** : JWT, comptes utilisateurs et invités
- **Services** : Gestion des services de voyance (tarots, reiki, pendule, guérison)
- **Rendez-vous** : Système de réservation avec calendrier et disponibilités
- **Paiements** : Intégration Stripe et PayPal
- **Blog** : Système de blog complet avec commentaires
- **Administration** : Interface admin complète
- **Upload** : Gestion des fichiers et images

## 📋 Prérequis

- Node.js 18+
- MongoDB 6.0+
- (Optionnel) Docker et Docker Compose

## ⚡ Installation Rapide

### 1. Installation traditionnelle

```bash
# Cloner le projet
git clone <votre-repo>
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Modifier les variables dans .env

# Lancer MongoDB (si installé localement)
mongod

# Configuration initiale de la base
npm run setup

# Démarrer en développement
npm run dev

# Ou en production
npm start
```

### 2. Installation avec Docker

```bash
# Cloner le projet
git clone <votre-repo>
cd backend

# Configurer l'environnement
cp .env.example .env
# Modifier les variables dans .env

# Lancer avec Docker Compose
docker-compose up -d

# Configuration initiale
docker-compose exec app npm run setup
```

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Serveur
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Base de données
MONGODB_URI=mongodb://localhost:27017/renaissance-by-steph

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Paiements
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Admin par défaut
ADMIN_EMAIL=stephanie@renaissance-by-steph.fr
ADMIN_PASSWORD=ChangeThisPassword123!
```

## 📁 Structure du Projet

```
backend/
├── models/           # Modèles MongoDB (User, Service, Appointment, BlogPost)
├── routes/           # Routes API
│   ├── auth.js       # Authentification
│   ├── users.js      # Gestion utilisateurs
│   ├── services.js   # Services de voyance
│   ├── appointments.js # Rendez-vous
│   ├── blog.js       # Blog et articles
│   ├── payments.js   # Paiements Stripe/PayPal
│   └── admin.js      # Administration
├── middleware/       # Middlewares (auth, admin, etc.)
├── scripts/          # Scripts d'installation et maintenance
├── uploads/          # Fichiers uploadés
├── server.js         # Point d'entrée principal
├── package.json      # Dépendances et scripts
├── Dockerfile        # Configuration Docker
├── docker-compose.yml # Orchestration Docker
└── README.md         # Documentation
```

## 🔗 API Endpoints

### Authentification (`/api/auth`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `POST /guest` - Session invité
- `GET /me` - Profil utilisateur
- `POST /logout` - Déconnexion

### Services (`/api/services`)
- `GET /` - Liste des services
- `GET /:id` - Détail d'un service
- `GET /category/:category` - Services par catégorie
- `POST /` (Admin) - Créer un service
- `PUT /:id` (Admin) - Modifier un service
- `DELETE /:id` (Admin) - Supprimer un service

### Rendez-vous (`/api/appointments`)
- `GET /availability/:serviceId` - Créneaux disponibles
- `POST /` - Réserver un RDV
- `GET /my` - Mes RDV
- `GET /:id` - Détail d'un RDV
- `PUT /:id/cancel` - Annuler un RDV

### Paiements (`/api/payments`)
- `POST /create-payment-intent` - Créer un paiement
- `POST /confirm-payment` - Confirmer un paiement
- `POST /webhook/stripe` - Webhook Stripe
- `GET /history` - Historique des paiements

### Blog (`/api/blog`)
- `GET /` - Liste des articles
- `GET /categories` - Catégories
- `GET /tags` - Tags populaires
- `GET /:slug` - Article par slug
- `POST /` (Admin) - Créer un article
- `PUT /:id` (Admin) - Modifier un article
- `DELETE /:id` (Admin) - Supprimer un article
- `POST /:id/comment` - Ajouter un commentaire

### Administration (`/api/admin`)
- `GET /dashboard` - Statistiques
- `GET /users` - Gestion utilisateurs
- `GET /appointments` - Gestion RDV
- `PUT /appointments/:id` - Modifier un RDV
- `POST /upload` - Upload de fichiers
- `GET /blog` - Gestion articles

### Utilisateurs (`/api/users`)
- `GET /profile` - Profil utilisateur
- `PUT /profile` - Modifier le profil
- `PUT /password` - Changer le mot de passe
- `DELETE /account` - Supprimer le compte
- `POST /convert-guest` - Convertir compte invité

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev          # Démarrer avec nodemon
npm run setup        # Configuration initiale DB

# Production
npm start           # Démarrer en production

# Docker
docker-compose up -d              # Lancer les services
docker-compose logs -f app        # Voir les logs
docker-compose exec app npm run setup  # Setup DB
docker-compose down               # Arrêter les services
```

## 🔐 Sécurité

- JWT pour l'authentification
- Hashage bcrypt des mots de passe
- Validation des données avec express-validator
- Rate limiting
- Headers de sécurité avec helmet
- CORS configuré
- Upload sécurisé des fichiers

## 📊 Monitoring

- Logs détaillés pour le debugging
- Health check endpoint (`/api/health`)
- Statistiques d'utilisation dans l'admin

## 🚀 Déploiement sur Raspberry Pi

### 1. Préparation du Raspberry Pi

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer MongoDB
sudo apt install mongodb

# Installer Git
sudo apt install git

# (Optionnel) Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Déploiement

```bash
# Cloner le projet
git clone <votre-repo>
cd backend

# Option 1: Installation traditionnelle
npm install --production
cp .env.example .env
# Configurer .env
npm run setup
npm start

# Option 2: Avec Docker
docker-compose up -d
docker-compose exec app npm run setup
```

### 3. Configuration du service systemd (optionnel)

```bash
# Créer le service
sudo nano /etc/systemd/system/renaissance-api.service

# Contenu du fichier:
[Unit]
Description=Renaissance By Steph API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/backend
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# Activer le service
sudo systemctl enable renaissance-api
sudo systemctl start renaissance-api
```

## 🆘 Dépannage

### Problèmes courants

1. **Erreur de connexion MongoDB**
   ```bash
   # Vérifier que MongoDB est démarré
   sudo systemctl status mongodb
   sudo systemctl start mongodb
   ```

2. **Port déjà utilisé**
   ```bash
   # Changer le port dans .env
   PORT=5001
   ```

3. **Problème d'upload**
   ```bash
   # Vérifier les permissions
   chmod 755 uploads/
   ```

## 📞 Support

Pour toute question ou problème :
- Vérifiez les logs : `docker-compose logs -f app`
- Consultez la documentation des APIs
- Vérifiez la configuration `.env`

---

**Renaissance By Steph** - Voyance & Guérison Spirituelle
API backend complète et sécurisée pour Raspberry Pi