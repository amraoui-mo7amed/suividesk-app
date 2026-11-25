# SuiviDesk Mobile (Expo & React Native) — CNAS

Application mobile native Android officielle de la **CNAS** (Caisse Nationale des Assurances Sociales des Travailleurs Salariés) pour le suivi des collaborateurs et la gestion des courriers administratifs.

Développée avec **Expo SDK 58**, **React Native 0.88**, **TypeScript**, **AsyncStorage** et **Expo Crypto**.

---

## 📱 Fonctionnalités Principales

1. **Tableau de Bord Institutionnel**
   - 4 indicateurs clés (Total tâches, Traités, En cours, Non traités).
   - Calcul automatique du taux de complétion et du délai moyen de traitement en jours.
   - Barres de progression de distribution d'état.
   - Top des Wilayas les plus fréquentes.
   - Charge de travail par collaborateur (accès direct à la fiche en 1 tap).

2. **Tableau de Suivi des Collaborateurs**
   - Liste des employés avec avatars aux initiales et badges civilité.
   - 3 pastilles de synthèse par agent : Traités, En cours, Non traités.
   - Recherche instantanée par nom ou civilité, filtres par genre.
   - Ajout, modification et suppression sécurisée des collaborateurs.

3. **Fiche Collaborateur & Tâches Assignées**
   - Vue détaillée de l'agent et liste de ses courriers administratifs.
   - Badges d'état (Traité, En cours, Non traité) et de priorité (Urgente, Haute, Moyenne, Basse).
   - Affichage des références de dossier, destinataires, wilayas et dates (courrier, distribution, début, finale).
   - Durée de traitement calculée automatiquement.

4. **Synchronisation Décentralisée Wi-Fi (Mobile ↔ PC SuiviDesk)**
   - Fonctionne sur le réseau local Wi-Fi sans accès internet requis.
   - Connectivité directe avec le serveur SuiviDesk Desktop (port `4850`).
   - Aperçu avant synchronisation (*Pre-Sync Diff*) : détection des collaborateurs et tâches à envoyer ou recevoir.
   - Fusion intelligente *Last-Write-Wins* (LWW) avec préservation des identifiants `sync_uuid`.
   - Mémorisation de la dernière adresse IP connectée.

5. **Sécurité & Verrouillage (App Lock)**
   - Mot de passe maître / Code PIN sécurisé par hachage SHA-256 avec sel aléatoire.
   - Écran de verrouillage institutionnel CNAS avec boutons de bascule d'affichage du mot de passe.
   - Verrouillage instantané et verrouillage automatique par inactivité (5 min, 15 min, 30 min).

---

## 🛠️ Stack Technique

- **Framework** : Expo ~58.0, React Native 0.88
- **Langage** : TypeScript
- **Persistance** : `@react-native-async-storage/async-storage`
- **Sécurité** : `expo-crypto` (SHA-256)
- **Icônes** : `lucide-react-native`
- **Design System** : Charte CNAS (Bleu `#003A6B` / `#005A9E`, fond `#EEF6FC`, bordures `#C6DDF2`)

---

## 🚀 Démarrage & Développement

### Prérequis
- Node.js >= 20
- npm ou yarn

### Installation
```bash
git clone https://github.com/amraoui-mo7amed/suividesk-app.git
cd suividesk-app
npm install
```

### Lancer l'application en développement
```bash
npx expo start
```
- Tapez `a` pour ouvrir sur émulateur ou appareil Android connecté.
- Scannez le QR code avec l'application **Expo Go** sur votre smartphone.

### Générer le projet natif Android
```bash
npx expo prebuild --platform android --clean
```

### Compiler l'APK localement
```bash
cd android
./gradlew assembleDebug
```
L'APK sera généré dans `android/app/build/outputs/apk/debug/app-debug.apk`.
