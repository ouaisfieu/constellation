# LA CONSTELLATION — Système de Chaîne de Mail 2.0

> 42 mails × 9 destinataires = 378 points d'entrée
> Chaque mail = 1 vidéo YouTube
> Réponses = commentaires YouTube
> Tracking = Bluesky + YouTube Analytics

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     "Il se réfugie derrière une constellation d'identités.   ║
║      Réelles et fictives. Morales et physiques.              ║
║      Bonne chance."                                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## 🎯 Concept

Tu envoies 42 mails mystérieux depuis une adresse noreply.
Chaque mail correspond à une vidéo YouTube.
Les destinataires ne peuvent pas répondre par email.
S'ils veulent réagir, ils doivent commenter la vidéo.
Tu tracks la viralité sur Bluesky avec #LaConstellation.

**Le destinataire a 4 options :**
1. **Ignorer** → Il fait partie du problème
2. **Consulter** → Il regarde la vidéo
3. **Partager** → Il forward le mail ou partage la vidéo
4. **Répondre** → Il commente sur YouTube

## 📁 Structure

```
chain-mail/
├── data/
│   ├── contacts-template.csv   # Template à remplir (plus facile)
│   ├── contacts.csv            # Tes 378 contacts (à créer)
│   └── waves.json              # Généré automatiquement
├── output/
│   ├── mails/
│   │   ├── wave-01/
│   │   │   ├── mail-1-contact1_at_example_com.html
│   │   │   └── ...
│   │   └── wave-42/
│   ├── youtube-descriptions/
│   │   ├── video-01-description.txt
│   │   └── ...
│   └── tracking-codes.csv
└── src/
    ├── generator.ts            # Types et templates
    ├── cli.ts                  # Générateur de mails
    ├── sender.ts               # Envoi SMTP
    └── csv-to-json.ts          # Conversion CSV → JSON
```

## 🚀 Guide Rapide

### 1. Prépare tes contacts

```bash
# Copie le template
cp data/contacts-template.csv data/contacts.csv

# Édite avec Excel/Google Sheets
# 42 vagues × 9 destinataires = 378 lignes
```

Format CSV:
```csv
wave_id,recipient_index,email,name,context,angle,video_id
1,1,jean@example.com,Jean,ancien collègue,Tu as vu les licenciements.,dQw4w9WgXcQ
1,2,marie@example.com,,,VIDEO_ID_1
...
```

### 2. Convertis en JSON

```bash
npx tsx src/csv-to-json.ts
```

### 3. Génère les mails

```bash
# Tous les mails
npm run generate

# Une seule vague
npm run generate -- --wave=1
```

### 4. Vérifie les mails

Ouvre un fichier HTML dans ton navigateur:
```
output/mails/wave-01/mail-1-jean_at_example_com.html
```

### 5. Configure l'envoi

Crée `.env`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=ton_mot_de_passe
SMTP_FROM=✧ <noreply@example.com>
TEST_EMAIL=ton_email_test@example.com
```

### 6. Teste l'envoi

```bash
# Envoie tout à ton email de test
npm run send:test
```

### 7. Envoie pour de vrai

```bash
# Une vague à la fois (recommandé)
npm run send:wave 1

# Tout d'un coup (ATTENTION!)
npm run send
```

## 📧 L'Email Type

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Et si tout ce qu'on t'a dit était faux ?                  │
│                                                             │
│  Ce mail fait partie d'une série de 42.                    │
│  Tu reçois le numéro 1.                                    │
│                                                             │
│  [Tu travaillais dans les RH. Tu as vu les licenciements.] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         ▶ OUVRIR SUR YOUTUBE                        │   │
│  │         LA CONSTELLATION #1 — L'éveil               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ TU NE PEUX PAS RÉPONDRE À CE MAIL.                     │
│  Si tu veux réagir → commente la vidéo.                    │
│  Si tu veux partager → forward ce mail.                    │
│  Si tu veux ignorer → tu fais partie du problème.          │
│                                                             │
│  Qui envoie ces mails ?                                    │
│  Tu ne le sauras probablement jamais.                      │
│  L'auteur se réfugie derrière une constellation            │
│  d'identités. Réelles et fictives. Morales et physiques.   │
│  Bonne chance.                                              │
│                                                             │
│  [Bluesky] [YouTube] [Le Réseau]                           │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 975 243  │ │   614    │ │    42    │ │   378    │      │
│  │ piégés   │ │ contacts │ │ messages │ │ destina. │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│                       Et toi ?                              │
│                                                             │
│                         ✧                                   │
│                                                             │
│  Mail 1/42 • Code: W01-R1-abc123                           │
│  Ce mail a été envoyé à 9 personnes. Tu es l'une d'elles.  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📺 YouTube

Chaque vidéo utilise la description générée dans `output/youtube-descriptions/`.

Copie-colle la description correspondante quand tu uploades ta vidéo.

## 📊 Tracking

### Bluesky
- Poste avec #LaConstellation
- Surveille les mentions de @ouaisfi.eu
- Track les partages de tes vidéos

### YouTube
- Surveille les commentaires
- Analytics: d'où viennent les vues?
- Quelles vidéos sont les plus commentées?

### Codes de tracking
Chaque mail a un code unique: `W01-R1-abc123`
- W01 = Vague 1
- R1 = Destinataire 1
- abc123 = Hash unique

Tu peux demander aux gens de citer leur code dans les commentaires.

## 🎭 Les 42 Thèmes

| # | Thème | Sujet |
|---|-------|-------|
| 1 | L'éveil | Tu fais partie du système |
| 2 | Les chiffres | 975 243 |
| 3 | Le piège fiscal | 52,6% |
| 4 | L'invalidité | 527 000 invalides |
| 5 | Arizona | 180 000 exclusions |
| ... | ... | ... |
| 41 | Toi | Pourquoi ce mail ? |
| 42 | Nous | La Constellation |

Voir `src/generator.ts` pour la liste complète.

## 🛡️ Anonymat

L'adresse email `noreply@...` doit être:
- Sur un domaine que tu contrôles
- Ou via un service email anonyme
- Ou via un alias email

**Services possibles:**
- ProtonMail (compte gratuit)
- Tutanota
- SimpleLogin (aliases)
- AnonAddy

## ⚠️ Anti-Spam

Pour éviter les filtres spam:
1. **Envoie par vagues** (9 mails max à la fois)
2. **Attends entre les vagues** (1 minute minimum)
3. **Varie les heures d'envoi**
4. **Utilise un vrai domaine** (pas gmail/outlook)
5. **Configure SPF/DKIM** sur ton domaine

## 📜 Légalité

- Tu envoies à **tes propres contacts**
- C'est du **marketing personnel**, pas commercial
- Tu donnes une option de **consultation/ignore**
- Tu ne collectes **aucune donnée** (pas de tracking pixels)

## 🔗 Liens

- **Bluesky**: https://bsky.app/profile/ouaisfi.eu
- **YouTube**: https://www.youtube.com/@ouaisfieu
- **Le Réseau**: https://ouaisfieu.github.io/constellation/

---

```
975 243 personnes piégées.
614 contacts pour s'organiser.
42 messages envoyés.
378 destinataires.
1 question: Et toi ?

✧
```
