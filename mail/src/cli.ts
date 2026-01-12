#!/usr/bin/env node
/**
 * LA CONSTELLATION - Chain Mail Generator CLI
 * 
 * Génère 42 mails HTML personnalisés à partir des données waves.json
 * 
 * Usage:
 *   npm run generate              # Génère tous les mails
 *   npm run generate -- --wave 1  # Génère seulement la vague 1
 *   npm run preview -- --wave 1   # Ouvre un preview de la vague 1
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Types
interface Recipient {
  email: string;
  name?: string | null;
  context?: string | null;
  angle?: string | null;
}

interface Wave {
  id: number;
  theme: string;
  subject: string;
  videoId: string;
  videoTitle: string;
  customIntro?: string | null;
  recipients: Recipient[];
}

interface WavesData {
  sender: {
    email: string;
    name: string;
  };
  tracking: {
    bluesky: string;
    youtube: string;
    website: string;
  };
  waves: Wave[];
}

// Thèmes des 42 vagues
const WAVE_THEMES: Record<number, { hook: string }> = {
  1: { hook: "Et si tout ce qu'on t'a dit était faux ?" },
  2: { hook: "C'est le nombre de personnes piégées. Tu en connais forcément." },
  3: { hook: "Le tax wedge le plus élevé de l'OCDE. Félicitations." },
  4: { hook: "La Belgique fabrique des invalides. C'est un business model." },
  5: { hook: "Arizona 2026. Ils arrivent pour toi aussi." },
  6: { hook: "Les médias regardent ailleurs. Toi non." },
  7: { hook: "La précarité est honteuse. C'est voulu." },
  8: { hook: "Spoiler: pas ta santé." },
  9: { hook: "Tu crois que c'est pour t'aider ?" },
  10: { hook: "Tu es suspect. Tu ne le savais pas ?" },
  11: { hook: "Tu n'es pas cassé. C'est le système." },
  12: { hook: "Ils ont besoin que tu te sentes seul." },
  13: { hook: "Ta part de la dette publique. Tu as signé où ?" },
  14: { hook: "Travailler te coûte parfois plus cher que le chômage." },
  15: { hook: "Tes enfants paieront ta retraite. Et la leur ?" },
  16: { hook: "Mais ils préfèrent que tu sois déprimé." },
  17: { hook: "Tu n'es pas seul. Voici le réseau." },
  18: { hook: "La question que tout le monde pose." },
  19: { hook: "Ils comptent sur ton bulletin tous les 4 ans." },
  20: { hook: "Les piliers ont des fissures." },
  21: { hook: "La capitale européenne est aussi la capitale de l'absurde." },
  22: { hook: "Qui a des trous de plus en plus grands." },
  23: { hook: "L'immobilier belge est un casino. Tu n'as pas les jetons." },
  24: { hook: "Ou malade de ne pas travailler. Tu choisis." },
  25: { hook: "Le piège a un genre." },
  26: { hook: "Ils l'appellent 'flexibilité'." },
  27: { hook: "Tu cotises pour une retraite qui n'existera peut-être plus." },
  28: { hook: "Le dilemme de 2023 est devenu permanent." },
  29: { hook: "Manger sain coûte trop cher. C'est calculé." },
  30: { hook: "Ou prisonnier des retards SNCB. Tu choisis." },
  31: { hook: "Tout est en ligne. Sauf 20% de la population." },
  32: { hook: "Tu as besoin du formulaire C4-Z7-bis. Bonne chance." },
  33: { hook: "Le fédéralisme coûte 5 milliards par an. Tu paies." },
  34: { hook: "Mais 52,6% sur ton travail. Logique ?" },
  35: { hook: "Tu les as sauvées. Elles te remercient comment ?" },
  36: { hook: "L'école ne t'a pas appris à questionner." },
  37: { hook: "Le statut d'artiste est un mirage." },
  38: { hook: "La taxe carbone pèse plus sur les pauvres." },
  39: { hook: "Les robots arrivent. Ta protection sociale non." },
  40: { hook: "Dans 4 ans, combien resteront debout ?" },
  41: { hook: "Tu n'es pas là par hasard." },
  42: { hook: "Ensemble, on existe. Seul, on disparaît." },
};

// Génère un code de tracking
function generateTrackingCode(waveId: number, recipientIndex: number): string {
  const hash = Math.random().toString(36).substring(2, 8);
  return `W${waveId.toString().padStart(2, '0')}-R${recipientIndex}-${hash}`;
}

// Génère le HTML du mail
function generateMailHTML(
  wave: Wave, 
  recipient: Recipient, 
  trackingCode: string,
  config: WavesData
): string {
  const videoUrl = `https://www.youtube.com/watch?v=${wave.videoId}`;
  const hook = WAVE_THEMES[wave.id]?.hook || wave.subject;
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${wave.subject}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0b; 
      color: #e5e5e5; 
      padding: 2rem;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }
    .hook { 
      font-size: 1.5rem; 
      color: #5eead4; 
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    .intro { color: #a1a1aa; margin-bottom: 1.5rem; }
    .personal {
      background: #18181b;
      border-left: 3px solid #a78bfa;
      padding: 1rem;
      margin: 1.5rem 0;
    }
    .video-block {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid #5eead4;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: center;
    }
    .video-block a {
      color: #5eead4;
      font-size: 1.2rem;
      text-decoration: none;
      display: block;
      margin-top: 1rem;
    }
    .video-title { color: #fff; font-size: 1.1rem; margin-top: 0.5rem; }
    .warning {
      background: #7f1d1d;
      color: #fecaca;
      padding: 1rem;
      border-radius: 4px;
      margin: 1.5rem 0;
    }
    .warning a { color: #fecaca; }
    .mystery {
      background: #1e1b4b;
      color: #c4b5fd;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
      font-style: italic;
    }
    .links {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin: 1.5rem 0;
    }
    .links a {
      background: #27272a;
      color: #5eead4;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .stat {
      background: #18181b;
      padding: 1rem;
      text-align: center;
      border-radius: 4px;
    }
    .stat-value { font-size: 1.5rem; color: #5eead4; font-weight: bold; }
    .stat-label { color: #71717a; font-size: 0.875rem; }
    .footer {
      border-top: 1px solid #27272a;
      padding-top: 1rem;
      margin-top: 2rem;
      color: #52525b;
      font-size: 0.875rem;
    }
    .signature { font-size: 2rem; text-align: center; margin: 2rem 0; color: #5eead4; }
  </style>
</head>
<body>
  ${recipient.name ? `<p style="color: #71717a;">${recipient.name},</p>` : ''}
  
  <div class="hook">${hook}</div>
  
  <div class="intro">
    ${wave.customIntro || `Ce mail fait partie d'une série de 42. Tu reçois le numéro <strong>${wave.id}</strong>.`}
  </div>
  
  ${recipient.angle ? `<div class="personal">${recipient.angle}</div>` : ''}
  
  <div class="video-block">
    <div style="color: #71717a; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em;">Regarde cette vidéo</div>
    <a href="${videoUrl}" target="_blank">▶ OUVRIR SUR YOUTUBE</a>
    <div class="video-title">${wave.videoTitle}</div>
  </div>
  
  <div class="warning">
    <strong>⚠️ TU NE PEUX PAS RÉPONDRE À CE MAIL.</strong><br>
    Si tu veux réagir → <a href="${videoUrl}">commente la vidéo</a>.<br>
    Si tu veux partager → forward ce mail ou partage la vidéo.<br>
    Si tu veux ignorer → tu fais partie du problème.
  </div>
  
  <div class="mystery">
    <strong>Qui envoie ces mails ?</strong><br><br>
    Tu ne le sauras probablement jamais.<br>
    L'auteur se réfugie derrière une constellation d'identités.<br>
    Réelles et fictives. Morales et physiques.<br><br>
    <strong>Bonne chance.</strong>
  </div>
  
  <div style="color: #71717a; margin-bottom: 1rem;">Tracking public :</div>
  <div class="links">
    <a href="${config.tracking.bluesky}" target="_blank">Bluesky</a>
    <a href="${config.tracking.youtube}" target="_blank">YouTube</a>
    <a href="${config.tracking.website}" target="_blank">Le Réseau</a>
  </div>
  
  <div class="stats">
    <div class="stat"><div class="stat-value">975 243</div><div class="stat-label">personnes piégées</div></div>
    <div class="stat"><div class="stat-value">614</div><div class="stat-label">contacts</div></div>
    <div class="stat"><div class="stat-value">42</div><div class="stat-label">messages</div></div>
    <div class="stat"><div class="stat-value">378</div><div class="stat-label">destinataires</div></div>
  </div>
  
  <div style="text-align: center; font-size: 1.2rem; color: #a78bfa; margin: 2rem 0;">Et toi ?</div>
  
  <div class="signature">✧</div>
  
  <div class="footer">
    Mail ${wave.id}/42 • Code: ${trackingCode}<br>
    Ce mail a été envoyé à 9 personnes. Tu es l'une d'elles.
  </div>
</body>
</html>`;
}

// Génère la description YouTube
function generateYouTubeDescription(wave: Wave): string {
  const hook = WAVE_THEMES[wave.id]?.hook || wave.subject;
  
  return `${hook}

---

Ce message fait partie de LA CONSTELLATION.
42 mails. 378 destinataires. 1 question.

Tu as reçu ce mail ? Laisse ton commentaire ici.
Tu veux comprendre ? Regarde les 42 vidéos.
Tu veux agir ? Partage.

---

📊 LES CHIFFRES
• 975 243 personnes piégées dans le système belge
• 52,6% de tax wedge (record OCDE)
• 527 000 invalides officiels
• 180 000 exclusions Arizona 2026
• 614 contacts pour s'organiser

---

🔗 LIENS
• Le Réseau : https://ouaisfieu.github.io/constellation/
• Bluesky : https://bsky.app/profile/ouaisfi.eu

---

#LaConstellation #Belgique #ProtectionSociale #Arizona2026 #975243

---

Mail ${wave.id}/42 : "${wave.theme}"
`;
}

// Main
function main() {
  const args = process.argv.slice(2);
  const waveArg = args.find(a => a.startsWith('--wave='));
  const targetWave = waveArg ? parseInt(waveArg.split('=')[1]) : null;
  
  // Charger les données
  const dataPath = join(process.cwd(), 'data', 'waves.json');
  
  if (!existsSync(dataPath)) {
    console.log('❌ Fichier data/waves.json non trouvé.');
    console.log('   Copie data/waves-template.json vers data/waves.json et remplis-le.');
    process.exit(1);
  }
  
  const data: WavesData = JSON.parse(readFileSync(dataPath, 'utf-8'));
  
  // Créer les dossiers de sortie
  const outputDir = join(process.cwd(), 'output');
  const mailsDir = join(outputDir, 'mails');
  const youtubeDir = join(outputDir, 'youtube-descriptions');
  
  mkdirSync(mailsDir, { recursive: true });
  mkdirSync(youtubeDir, { recursive: true });
  
  // Stats
  let totalMails = 0;
  const trackingCodes: Array<{wave: number, recipient: number, code: string, email: string}> = [];
  
  // Générer les mails
  const wavesToProcess = targetWave 
    ? data.waves.filter(w => w.id === targetWave)
    : data.waves;
  
  for (const wave of wavesToProcess) {
    console.log(`\n📧 Vague ${wave.id}: ${wave.theme}`);
    
    const waveDir = join(mailsDir, `wave-${wave.id.toString().padStart(2, '0')}`);
    mkdirSync(waveDir, { recursive: true });
    
    // Générer chaque mail
    wave.recipients.forEach((recipient, index) => {
      if (recipient.email === 'TODO') {
        console.log(`   ⚠️  Destinataire ${index + 1}: TODO`);
        return;
      }
      
      const trackingCode = generateTrackingCode(wave.id, index);
      const html = generateMailHTML(wave, recipient, trackingCode, data);
      
      const filename = `mail-${index + 1}-${recipient.email.replace(/@/g, '_at_').replace(/\./g, '_')}.html`;
      writeFileSync(join(waveDir, filename), html);
      
      trackingCodes.push({
        wave: wave.id,
        recipient: index + 1,
        code: trackingCode,
        email: recipient.email,
      });
      
      totalMails++;
      console.log(`   ✓ ${recipient.email} (${trackingCode})`);
    });
    
    // Générer la description YouTube
    const ytDesc = generateYouTubeDescription(wave);
    writeFileSync(
      join(youtubeDir, `video-${wave.id.toString().padStart(2, '0')}-description.txt`),
      ytDesc
    );
  }
  
  // Export des codes de tracking
  const trackingCSV = [
    'wave,recipient,code,email',
    ...trackingCodes.map(t => `${t.wave},${t.recipient},${t.code},${t.email}`)
  ].join('\n');
  
  writeFileSync(join(outputDir, 'tracking-codes.csv'), trackingCSV);
  
  // Résumé
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    GÉNÉRATION TERMINÉE                       ║
╠══════════════════════════════════════════════════════════════╣
║  Mails générés:        ${totalMails.toString().padStart(3)}                                ║
║  Vagues traitées:      ${wavesToProcess.length.toString().padStart(3)}                                ║
║  Descriptions YouTube: ${wavesToProcess.length.toString().padStart(3)}                                ║
╠══════════════════════════════════════════════════════════════╣
║  Sortie: ./output/                                           ║
║  ├── mails/wave-XX/         (HTML des mails)                ║
║  ├── youtube-descriptions/  (descriptions à copier)         ║
║  └── tracking-codes.csv     (codes de suivi)                ║
╚══════════════════════════════════════════════════════════════╝
`);
}

main();
