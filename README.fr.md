# StryDash

Un tableau de bord Next.js moderne pour visualiser vos activités de course Stryd depuis une base de données SQLite.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

### 🏃 Gestion des activités
- **Liste d'activités** - Parcourez toutes vos activités avec les statistiques clés (distance, durée, allure, puissance, fréquence cardiaque)
- **Vue détaillée** - Analyse complète de l'activité avec toutes les métriques et statistiques
- **Filtrage en un clic** - Cliquez directement sur les types d'activité ou tags pour filtrer instantanément
- **Barre de filtres actifs** - Affichage visuel des filtres actifs avec suppression facile
- **Filtre par plage de dates** - Filtrez les activités à partir d'une date de début dans Paramètres des données
- **Vue calendrier** - Calendrier hebdomadaire affichant les activités avec navigation pour plusieurs activités par jour

### 📊 Visualisation des données
- **Graphiques interactifs** - Visualisation des séries temporelles pour la puissance, FC, vitesse, cadence, longueur de foulée et élévation
- **Zones de puissance** - Distribution visuelle des zones de puissance
- **Filtrage par split/lap** - Zoomez sur des segments spécifiques de votre activité
- **Affichage du parcours GPS** - Visualisez votre parcours sur une carte interactive avec gradient de couleur basé sur la puissance

### 🤖 StrAId - Assistant IA
- **Chat intelligent** - Posez des questions sur vos données d'entraînement et obtenez des insights
- **Contexte adaptatif** - L'IA comprend votre historique d'activités et fournit des conseils personnalisés
- **Propulsé par Ollama** - Intégration LLM locale (Mistral) pour des interactions IA respectueuses de la vie privée
- **Analyse d'entraînement** - Obtenez des recommandations, analysez des modèles et comprenez vos performances

### 📈 Tendances & Analyses
- **Statistiques cumulées sur 7 jours** - Suivez la distance et la durée cumulées sur des périodes de 7 jours
- **Statistiques cumulées sur 10 jours** - Vue étendue avec métriques cumulées sur 10 jours
- **Tendances de performance** - Visualisez votre progression au fil du temps avec graphiques interactifs
- **Comparaison historique** - Suivez les améliorations et identifiez les modèles
- **Filtrage par date** - Appliquez des filtres de plage de dates pour vous concentrer sur des périodes d'entraînement spécifiques

### 🗺️ Cartes
- **Deux fournisseurs de cartes** - Choisissez entre OpenStreetMap (Leaflet) ou MapLibre GL JS
- **Gradient de puissance** - Parcours coloré selon la puissance (vert → jaune → rouge)
- **Marqueurs départ/arrivée** - Indicateurs visuels clairs pour le début et la fin du parcours

### 🌐 Internationalisation
- **Support multi-langues** - Traductions complètes en anglais et français
- **Changement de langue facile** - Changez de langue depuis la page des paramètres

### 🎨 Personnalisation
- **Mode sombre** - Basculez entre les thèmes clair et sombre
- **Barre latérale repliable** - Minimisez la navigation pour plus d'espace de contenu
- **Design responsive** - Optimisé pour desktop et mobile
- **Interface moderne** - Design épuré avec dégradés et animations fluides
- **Paramètres des données** - Contrôlez quelles activités afficher avec filtrage par date

## 🛠️ Technologies

- **[Next.js 16.1.1](https://nextjs.org/)** - Framework React avec App Router et Server Components
- **[React 19.0.0](https://react.dev/)** - Bibliothèque UI
- **[TypeScript 5.7.3](https://www.typescriptlang.org/)** - JavaScript typé
- **[Tailwind CSS 3.4.15](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** - Base de données SQLite synchrone
- **[Recharts 2.13.3](https://recharts.org/)** - Bibliothèque de graphiques
- **[Leaflet 1.9.4](https://leafletjs.com/)** - Cartes interactives (OpenStreetMap)
- **[MapLibre GL JS 5.15.0](https://maplibre.org/)** - Rendu de cartes vectorielles
- **[Lucide React](https://lucide.dev/)** - Ensemble d'icônes élégantes
- **[Ollama](https://ollama.ai/)** - Intégration LLM locale pour les fonctionnalités IA

## 📦 Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/gitjpk/strydash.git
cd strydash
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Générer la base de données**
   - La base de données SQLite n'est pas incluse dans le dépôt
   - Utilisez [strydcmd](https://github.com/gitjpk/strydcmd) pour la générer à partir de vos données Stryd
   - Déplacez le fichier de base de données généré à la racine du projet :
   ```bash
   cp /chemin/vers/stryd_activities.db ./stryd_activities.db
   ```

4. **Configurer Ollama (optionnel, pour les fonctionnalités IA)**
   - Installez [Ollama](https://ollama.ai/)
   - Téléchargez le modèle Mistral : `ollama pull mistral`
   - Assurez-vous qu'Ollama est en cours d'exécution : `ollama serve`

5. **Démarrer le serveur de développement**
```bash
pnpm dev
```

6. **Ouvrir votre navigateur**
   - Accédez à [http://localhost:3000](http://localhost:3000)

## 🗄️ Schéma de base de données

Le projet s'attend aux tables SQLite suivantes :

- **`activities`** - Informations générales sur les activités (nom, date, distance, durée, type, tags, etc.)
- **`gps_data`** - Coordonnées GPS avec horodatages et valeurs de puissance
- **`timeseries_power`** - Données de puissance au fil du temps
- **`timeseries_cardio`** - Données de fréquence cardiaque
- **`timeseries_kinematics`** - Vitesse, cadence, longueur de foulée
- **`timeseries_elevation`** - Données d'élévation
- **`laps`** - Splits/tours des activités

## 📁 Structure du projet

```
strydash/
├── app/
│   ├── activities/[id]/
│   │   └── page.tsx           # Page de détail d'activité
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts       # Endpoint API chat IA
│   │   └── models/
│   │       └── route.ts       # Endpoint API modèles Ollama
│   ├── calendar/
│   │   └── page.tsx           # Page vue calendrier
│   ├── overview/
│   │   └── page.tsx           # Page vue d'ensemble/tableau de bord
│   ├── settings/
│   │   └── page.tsx           # Page des paramètres
│   ├── straid/
│   │   └── page.tsx           # Page assistant IA StrAId
│   ├── trends/
│   │   └── page.tsx           # Page tendances et analyses
│   ├── layout.tsx             # Layout racine avec provider de thème
│   ├── page.tsx               # Page d'accueil (liste d'activités)
│   └── globals.css            # Styles globaux
│
├── components/
│   ├── ActivityDetailClient.tsx  # Détail d'activité côté client
│   ├── ActivityList.tsx          # Liste d'activités avec stats
│   ├── CalendarClient.tsx        # Vue calendrier hebdomadaire
│   ├── ChatButton.tsx            # Bouton interface chat IA
│   ├── FilterBar.tsx             # Interface de filtrage
│   ├── HomeClient.tsx            # Wrapper client page d'accueil
│   ├── MapLibreMap.tsx           # Implémentation MapLibre GL JS
│   ├── PowerZones.tsx            # Visualisation zones de puissance
│   ├── PreferencesProvider.tsx   # Contexte préférences utilisateur
│   ├── RouteMap.tsx              # Affichage parcours GPS
│   ├── Sidebar.tsx               # Barre latérale de navigation
│   ├── TimeseriesChart.tsx       # Graphique séries temporelles
│   └── TrendsClient.tsx          # Composant client page tendances
│
├── lib/
│   ├── db.ts                  # Fonctions base de données SQLite
│   ├── preferences.ts         # Gestion préférences utilisateur
│   └── translations.ts        # Traductions i18n (EN/FR)
│
├── stryd_activities.db        # Base de données SQLite (pas dans le repo)
└── package.json               # Dépendances du projet
```

## 🎯 Utilisation

### Liste d'activités
- Visualisez toutes les activités avec les métriques clés
- Cliquez sur les **badges de type d'activité** pour filtrer par ce type
- Cliquez sur les **tags** pour les ajouter aux filtres
- Les filtres actifs sont affichés dans une barre dédiée avec suppression facile
- Cliquez sur n'importe quelle carte d'activité pour voir les détails

### Détail d'activité
- Statistiques détaillées complètes
- Graphique de séries temporelles interactif avec sélection de métriques
- Distribution des zones de puissance
- Parcours GPS avec gradient de couleur basé sur la puissance
- Filtrage par tours/splits pour se concentrer sur des segments spécifiques

### Vue calendrier
- Disposition hebdomadaire (lundi à dimanche)
- Activités affichées par jour avec nom, type, distance et durée
- Résumé hebdomadaire montrant la distance totale et le temps total
- Navigation entre plusieurs activités le même jour

### Paramètres
- **Paramètres des données**
  - Filtrer les activités à partir d'une date spécifique
  - Contrôler quelles données sont affichées sur toutes les pages
- **Langue** - Basculez entre anglais et français
- **Thème** - Basculez entre mode clair et mode sombre
- **Fournisseur de carte** - Choisissez entre Leaflet (OpenStreetMap) ou MapLibre GL JS
- **Modèle IA** - Sélectionnez parmi plusieurs modèles Ollama (Mistral, Llama 3.1, Phi-3, Gemma 2, Qwen 2.5)

### StrAId (Assistant IA)
- Posez des questions sur votre entraînement en langage naturel
- Obtenez des insights et recommandations personnalisés
- Analysez les patterns dans vos données d'activités
- Nécessite Ollama avec le modèle Mistral installé et en cours d'exécution

### Tendances
- Visualisez la distance et la durée cumulées sur 7 jours glissants
- Visualisez la distance et la durée cumulées sur 10 jours glissants
- Suivez la progression de la charge d'entraînement au fil du temps
- Graphiques interactifs avec détails au survol
- Respecte le filtre de date des Paramètres des données

## 🚀 Build pour la production

```bash
# Créer un build de production optimisé
pnpm build

# Démarrer le serveur de production
pnpm start
```

## ⚙️ Configuration

### Préférences utilisateur
Les préférences sont stockées dans localStorage et incluent :
- **Langue** (`en` | `fr`)
- **Thème** (`light` | `dark`)
- **Fournisseur de carte** (`leaflet` | `maplibre`)
- **Modèle IA** (plusieurs options disponibles)
- **Date de début** - Filtre de date optionnel pour les activités

### Environnement
L'application utilise Node.js avec Corepack activé. Assurez-vous que votre PATH inclut :
```bash
export PATH="/usr/share/nodejs/corepack/shims:$PATH"
```

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

---

**Note** : Ce projet nécessite une base de données d'activités Stryd (`stryd_activities.db`). La base de données n'est pas incluse dans le dépôt. Générez-la en utilisant [strydcmd](https://github.com/gitjpk/strydcmd) et placez-la dans le répertoire racine du projet.
