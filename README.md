# La Constellation ⬡

> **975 243 personnes piégées par le système belge.**  
> **180 000 exclusions programmées (Arizona 2026).**  
> **614 contacts pour s'organiser.**

Réseau social **FHIR-first** pour la coordination des soins et l'action collective en Belgique.

[![FHIR R4](https://img.shields.io/badge/FHIR-R4-blue)](https://hl7.org/fhir/R4/)
[![ActivityPub](https://img.shields.io/badge/ActivityPub-Fediverse-purple)](https://activitypub.rocks/)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

---

## 🌐 Démo

**[→ ouaisfieu.github.io/constellation](https://ouaisfieu.github.io/constellation/)**

---

## 📊 Le contexte

| Métrique | Valeur | Source |
|----------|--------|--------|
| Personnes dans le système | **975 243** | ONEM + INAMI + CPAS |
| Coin fiscal belge | **52.6%** | OCDE (#1 mondial) |
| Invalides INAMI | **527 000** | INAMI 2024 |
| Santé mentale | **37.5%** des invalidités | INAMI |
| Exclusions Arizona 2026 | **180 000** | Estimation |
| Contacts vérifiés | **614** | Ce projet |

---

## 🏗️ Architecture

```
La Constellation
├── 🌐 Frontend (SPA vanilla)
│   └── Recherche full-text, 614 contacts
├── 🔗 FHIR R4 Gateway
│   ├── Organization (614 ressources)
│   ├── HealthcareService
│   └── Endpoint (multiprotocole)
├── 🦣 ActivityPub
│   └── Fédération Fediverse
└── 🦋 AT Protocol (prévu)
    └── Intégration Bluesky
```

### Pourquoi FHIR en priorité ?

- **527 000 personnes en invalidité** = données de santé
- **37.5% de santé mentale** = coordination des soins critique
- **Interopérabilité belge** = eHealth, MyCareNet, CoZo, Vitalink

---

## 🚀 Installation

```bash
# Clone
git clone https://github.com/ouaisfieu/constellation.git
cd constellation

# Serveur local
python3 -m http.server 8000
# ou
npx serve .

# Ouvrir http://localhost:8000
```

---

## 📁 Structure

```
constellation/
├── index.html          # Application principale
├── contacts.json       # 614 contacts (JSON)
├── actor.json          # Acteur ActivityPub
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── robots.txt
├── sitemap.xml
│
├── .well-known/
│   ├── fhir.json       # FHIR discovery
│   ├── webfinger       # ActivityPub discovery
│   └── nodeinfo        # NodeInfo 2.1
│
├── fhir/
│   ├── metadata.json   # CapabilityStatement
│   └── Organization/
│       ├── index.json  # Bundle (614 orgs)
│       └── {id}.json   # Ressources individuelles
│
├── scripts/
│   └── convert_to_fhir.py
│
└── docs/
    └── ARCHITECTURE.md
```

---

## 🔗 API FHIR

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /fhir/metadata` | CapabilityStatement |
| `GET /fhir/Organization` | Bundle de 614 organisations |
| `GET /fhir/Organization/{id}` | Organisation spécifique |

### Exemple

```bash
# CapabilityStatement
curl https://ouaisfieu.github.io/constellation/fhir/metadata

# Toutes les organisations
curl https://ouaisfieu.github.io/constellation/fhir/Organization/index.json

# Une organisation
curl https://ouaisfieu.github.io/constellation/fhir/Organization/143.json
```

### Ressource FHIR exemple

```json
{
  "resourceType": "Organization",
  "id": "143",
  "meta": {
    "profile": ["https://www.ehealth.fgov.be/standards/fhir/StructureDefinition/be-organization"]
  },
  "active": true,
  "type": [{
    "coding": [{
      "system": "https://ouaisfieu.github.io/constellation/CodeSystem/organization-type",
      "code": "education-permanente",
      "display": "Éducation Permanente (Décret 2003)"
    }]
  }],
  "name": "Soralia (ex-FPS)",
  "telecom": [{
    "system": "url",
    "value": "https://www.soralia.be"
  }],
  "address": [{
    "text": "Wallonie et Bruxelles",
    "country": "BE"
  }]
}
```

---

## 🦣 ActivityPub

La Constellation est fédérable via ActivityPub :

```bash
# Webfinger
curl https://ouaisfieu.github.io/constellation/.well-known/webfinger?resource=acct:constellation@ouaisfieu.github.io

# Actor
curl -H "Accept: application/activity+json" https://ouaisfieu.github.io/constellation/actor
```

---

## 📊 Sources de données

| Source | Contacts | Description |
|--------|----------|-------------|
| `medias` | 96 | Médias militants, revues |
| `international` | 44 | Kurdistan, Palestine, Québec, Europe |
| `organisations` | 34 | Mutuelles, syndicats, ONEM, INAMI |
| `decret` | 274 | Éducation permanente (Décret 2003) |
| `arretes` | 166 | Arrêtés royaux (culture, patrimoine) |

---

## 🧠 Projets liés

- **[NYXO](https://nyxo.brussels)** — Plateforme santé mentale
- **KERN** — Navigateur du système (à venir)

---

## 🛠️ Développement

### Régénérer les ressources FHIR

```bash
python3 scripts/convert_to_fhir.py
```

### Valider FHIR

```bash
npm install -g fhir-validator
fhir-validator fhir/Organization/index.json
```

### Tests

```bash
# Vérifier les liens
npx linkinator https://ouaisfieu.github.io/constellation/

# Lighthouse
npx lighthouse https://ouaisfieu.github.io/constellation/ --view
```

---

## 🗺️ Roadmap

### Phase 1 (Q1 2026) ✅
- [x] Site statique avec 614 contacts
- [x] SEO optimisé
- [x] PWA ready
- [x] Structure FHIR documentée
- [x] Export FHIR Bundle

### Phase 2 (Q2 2026)
- [ ] API FHIR dynamique (serveur)
- [ ] Recherche FHIR ($search)
- [ ] ActivityPub fédération
- [ ] Tests eHealth

### Phase 3 (Q3 2026)
- [ ] Comptes utilisateurs
- [ ] Fédération complète
- [ ] Chat Matrix
- [ ] Notifications push

### Phase 4 (Q4 2026)
- [ ] Authentification eID/itsme
- [ ] Intégration MyCareNet
- [ ] Care Plans FHIR
- [ ] AT Protocol

---

## 📜 Licence

**CC BY-NC 4.0** — Creative Commons Attribution - Pas d'Utilisation Commerciale

---

## 🤝 Contribuer

1. Fork le repo
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

---

<div align="center">

**⬡ La Constellation**

*On ne demande pas la permission de construire ce qui manque.*

</div>
