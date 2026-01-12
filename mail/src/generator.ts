/**
 * LA CONSTELLATION - Système de Chaîne de Mail 2.0
 * 
 * 42 mails × 9 destinataires = 378 points d'entrée
 * Chaque mail = 1 vidéo YouTube
 * Réponses = commentaires YouTube
 * Tracking = Bluesky + analytics
 * 
 * "Il se réfugie derrière une constellation d'identités..."
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export const CONFIG = {
  // Expéditeur mystère
  sender: {
    email: 'noreply@constellation.void',
    name: '✧',
    signature: '— ✧',
  },
  
  // Liens publics
  links: {
    bluesky: 'https://bsky.app/profile/ouaisfi.eu',
    youtube: 'https://www.youtube.com/@ouaisfieu',
    website: 'https://ouaisfieu.github.io/constellation/',
  },
  
  // Structure
  totalWaves: 42,
  recipientsPerWave: 9,
  
  // Tracking
  tracking: {
    baseUrl: 'https://ouaisfieu.github.io/constellation/t/',
    // Chaque mail aura un code unique: /t/{waveId}-{recipientHash}
  },
};

// ============================================================================
// TYPES
// ============================================================================

export interface Recipient {
  email: string;
  name?: string;
  // Métadonnées pour personnalisation
  context?: string;      // "ancien collègue", "ami d'enfance", "contact pro"
  angle?: string;        // L'angle d'attaque personnalisé
  lastContact?: string;  // "2019", "jamais parlé", etc.
}

export interface Wave {
  id: number;           // 1-42
  theme: string;        // Thème de cette vague
  videoId: string;      // ID YouTube
  videoTitle: string;   // Titre de la vidéo
  recipients: Recipient[];
  customIntro?: string; // Intro spécifique à cette vague
  customHook?: string;  // Accroche spécifique
}

export interface GeneratedMail {
  waveId: number;
  recipientIndex: number;
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  trackingCode: string;
  videoUrl: string;
}

// ============================================================================
// THÈMES DES 42 VAGUES
// ============================================================================

export const WAVE_THEMES: Array<{
  id: number;
  theme: string;
  subject: string;
  hook: string;
  angle: string;
}> = [
  { id: 1, theme: 'L\'éveil', subject: 'Tu fais partie du système', hook: 'Et si tout ce qu\'on t\'a dit était faux ?', angle: 'prise de conscience' },
  { id: 2, theme: 'Les chiffres', subject: '975 243', hook: 'C\'est le nombre de personnes piégées. Tu en connais forcément.', angle: 'statistiques choc' },
  { id: 3, theme: 'Le piège fiscal', subject: '52,6%', hook: 'Le tax wedge le plus élevé de l\'OCDE. Félicitations.', angle: 'économique' },
  { id: 4, theme: 'L\'invalidité', subject: '527 000 invalides', hook: 'La Belgique fabrique des invalides. C\'est un business model.', angle: 'système de santé' },
  { id: 5, theme: 'Arizona', subject: '180 000 exclusions', hook: 'Arizona 2026. Ils arrivent pour toi aussi.', angle: 'réforme politique' },
  { id: 6, theme: 'Le silence', subject: 'Pourquoi personne n\'en parle ?', hook: 'Les médias regardent ailleurs. Toi non.', angle: 'médias' },
  { id: 7, theme: 'La honte', subject: 'On t\'a appris à te taire', hook: 'La précarité est honteuse. C\'est voulu.', angle: 'psychologique' },
  { id: 8, theme: 'Les mutuelles', subject: 'Tes 160€/mois financent quoi ?', hook: 'Spoiler: pas ta santé.', angle: 'mutuelles' },
  { id: 9, theme: 'L\'ONEM', subject: 'La machine à broyer', hook: 'Tu crois que c\'est pour t\'aider ?', angle: 'administration' },
  { id: 10, theme: 'Les contrôles', subject: 'Coupable jusqu\'à preuve du contraire', hook: 'Tu es suspect. Tu ne le savais pas ?', angle: 'contrôle social' },
  { id: 11, theme: 'La dépression', subject: 'Et si c\'était le système le problème ?', hook: 'Tu n\'es pas cassé. C\'est le système.', angle: 'santé mentale' },
  { id: 12, theme: 'L\'isolement', subject: 'Diviser pour régner', hook: 'Ils ont besoin que tu te sentes seul.', angle: 'atomisation' },
  { id: 13, theme: 'La dette', subject: 'Tu dois déjà 50 000€', hook: 'Ta part de la dette publique. Tu as signé où ?', angle: 'dette publique' },
  { id: 14, theme: 'Le travail', subject: 'Le piège de l\'emploi', hook: 'Travailler te coûte parfois plus cher que le chômage.', angle: 'pièges à l\'emploi' },
  { id: 15, theme: 'Les enfants', subject: 'Ils héritent du système', hook: 'Tes enfants paieront ta retraite. Et la leur ?', angle: 'générations' },
  { id: 16, theme: 'La colère', subject: 'Tu as le droit d\'être en colère', hook: 'Mais ils préfèrent que tu sois déprimé.', angle: 'émotions' },
  { id: 17, theme: 'L\'espoir', subject: '614 contacts', hook: 'Tu n\'es pas seul. Voici le réseau.', angle: 'solution' },
  { id: 18, theme: 'L\'action', subject: 'Que faire ?', hook: 'La question que tout le monde pose.', angle: 'action concrète' },
  { id: 19, theme: 'Le vote', subject: 'Voter ne suffit plus', hook: 'Ils comptent sur ton bulletin tous les 4 ans.', angle: 'démocratie' },
  { id: 20, theme: 'Les syndicats', subject: 'Où sont-ils ?', hook: 'Les piliers ont des fissures.', angle: 'syndicats' },
  { id: 21, theme: 'L\'Europe', subject: 'Bruxelles contre Bruxelles', hook: 'La capitale européenne est aussi la capitale de l\'absurde.', angle: 'Europe' },
  { id: 22, theme: 'Le CPAS', subject: 'Le dernier filet', hook: 'Qui a des trous de plus en plus grands.', angle: 'aide sociale' },
  { id: 23, theme: 'Le logement', subject: 'Locataire à vie', hook: 'L\'immobilier belge est un casino. Tu n\'as pas les jetons.', angle: 'logement' },
  { id: 24, theme: 'La santé', subject: 'Malade de travailler', hook: 'Ou malade de ne pas travailler. Tu choisis.', angle: 'santé au travail' },
  { id: 25, theme: 'Les femmes', subject: '70% des temps partiels', hook: 'Le piège a un genre.', angle: 'genre' },
  { id: 26, theme: 'Les jeunes', subject: 'Génération sacrifiée', hook: 'Ils l\'appellent "flexibilité".', angle: 'jeunesse' },
  { id: 27, theme: 'Les vieux', subject: 'La pension fantôme', hook: 'Tu cotises pour une retraite qui n\'existera peut-être plus.', angle: 'pensions' },
  { id: 28, theme: 'L\'énergie', subject: 'Chauffage ou nourriture', hook: 'Le dilemme de 2023 est devenu permanent.', angle: 'énergie' },
  { id: 29, theme: 'La bouffe', subject: 'Malbouffe obligatoire', hook: 'Manger sain coûte trop cher. C\'est calculé.', angle: 'alimentation' },
  { id: 30, theme: 'Les transports', subject: 'Prisonnier de ta voiture', hook: 'Ou prisonnier des retards SNCB. Tu choisis.', angle: 'mobilité' },
  { id: 31, theme: 'Le numérique', subject: 'La fracture invisible', hook: 'Tout est en ligne. Sauf 20% de la population.', angle: 'numérique' },
  { id: 32, theme: 'Les papiers', subject: 'Kafka était belge', hook: 'Tu as besoin du formulaire C4-Z7-bis. Bonne chance.', angle: 'bureaucratie' },
  { id: 33, theme: 'La langue', subject: 'Diviser par la langue', hook: 'Le fédéralisme coûte 5 milliards par an. Tu paies.', angle: 'communautaire' },
  { id: 34, theme: 'Les riches', subject: 'Pas de taxe sur la fortune', hook: 'Mais 52,6% sur ton travail. Logique ?', angle: 'inégalités' },
  { id: 35, theme: 'Les banques', subject: 'Too big to fail', hook: 'Tu les as sauvées. Elles te remercient comment ?', angle: 'finance' },
  { id: 36, theme: 'L\'éducation', subject: 'Former des travailleurs dociles', hook: 'L\'école ne t\'a pas appris à questionner.', angle: 'éducation' },
  { id: 37, theme: 'La culture', subject: 'Artiste = SDF', hook: 'Le statut d\'artiste est un mirage.', angle: 'culture' },
  { id: 38, theme: 'L\'écologie', subject: 'Écologie des riches', hook: 'La taxe carbone pèse plus sur les pauvres.', angle: 'écologie' },
  { id: 39, theme: 'La tech', subject: 'Automatisation = chômage', hook: 'Les robots arrivent. Ta protection sociale non.', angle: 'technologie' },
  { id: 40, theme: 'Le futur', subject: '2030', hook: 'Dans 4 ans, combien resteront debout ?', angle: 'prospective' },
  { id: 41, theme: 'Toi', subject: 'Pourquoi ce mail ?', hook: 'Tu n\'es pas là par hasard.', angle: 'personnel' },
  { id: 42, theme: 'Nous', subject: 'La Constellation', hook: 'Ensemble, on existe. Seul, on disparaît.', angle: 'collectif' },
];

// ============================================================================
// TEMPLATE DE MAIL
// ============================================================================

export function generateMailBody(wave: Wave, recipient: Recipient, trackingCode: string): { html: string; text: string } {
  const videoUrl = `https://www.youtube.com/watch?v=${wave.videoId}`;
  const trackingPixel = `${CONFIG.tracking.baseUrl}${trackingCode}.gif`;
  const waveTheme = WAVE_THEMES.find(t => t.id === wave.id)!;
  
  const text = `
${recipient.name ? `${recipient.name},` : ''}

${waveTheme.hook}

${wave.customIntro || `Ce mail fait partie d'une série de 42. Tu reçois le numéro ${wave.id}.`}

${recipient.angle ? `\n${recipient.angle}\n` : ''}

---

REGARDE CETTE VIDÉO :
${videoUrl}

${wave.videoTitle}

---

TU NE PEUX PAS RÉPONDRE À CE MAIL.

Si tu veux réagir, laisse un commentaire sous la vidéo.
Si tu veux partager, forward ce mail ou partage la vidéo.
Si tu veux ignorer, tu fais partie du problème.

---

Qui envoie ces mails ?
→ Tu ne le sauras probablement jamais.
→ L'auteur se réfugie derrière une constellation d'identités.
→ Réelles et fictives. Morales et physiques.
→ Bonne chance.

Tracking public :
→ Bluesky : ${CONFIG.links.bluesky}
→ YouTube : ${CONFIG.links.youtube}
→ Le Réseau : ${CONFIG.links.website}

---

975 243 personnes piégées.
614 contacts pour s'organiser.
42 messages envoyés.
378 destinataires.
1 question : Et toi ?

${CONFIG.sender.signature}

---
Mail ${wave.id}/42 • Code: ${trackingCode}
Ce mail a été envoyé à 9 personnes. Tu es l'une d'elles.
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${waveTheme.subject}</title>
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
    .intro { 
      color: #a1a1aa; 
      margin-bottom: 1.5rem; 
    }
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
    .video-title {
      color: #fff;
      font-size: 1.1rem;
      margin-top: 0.5rem;
    }
    .warning {
      background: #7f1d1d;
      color: #fecaca;
      padding: 1rem;
      border-radius: 4px;
      margin: 1.5rem 0;
    }
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
    .stat-value {
      font-size: 1.5rem;
      color: #5eead4;
      font-weight: bold;
    }
    .stat-label {
      color: #71717a;
      font-size: 0.875rem;
    }
    .footer {
      border-top: 1px solid #27272a;
      padding-top: 1rem;
      margin-top: 2rem;
      color: #52525b;
      font-size: 0.875rem;
    }
    .signature {
      font-size: 2rem;
      text-align: center;
      margin: 2rem 0;
      color: #5eead4;
    }
  </style>
</head>
<body>
  ${recipient.name ? `<p style="color: #71717a;">${recipient.name},</p>` : ''}
  
  <div class="hook">${waveTheme.hook}</div>
  
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
    Si tu veux réagir → <a href="${videoUrl}" style="color: #fecaca;">commente la vidéo</a>.<br>
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
    <a href="${CONFIG.links.bluesky}" target="_blank">Bluesky</a>
    <a href="${CONFIG.links.youtube}" target="_blank">YouTube</a>
    <a href="${CONFIG.links.website}" target="_blank">Le Réseau</a>
  </div>
  
  <div class="stats">
    <div class="stat">
      <div class="stat-value">975 243</div>
      <div class="stat-label">personnes piégées</div>
    </div>
    <div class="stat">
      <div class="stat-value">614</div>
      <div class="stat-label">contacts</div>
    </div>
    <div class="stat">
      <div class="stat-value">42</div>
      <div class="stat-label">messages</div>
    </div>
    <div class="stat">
      <div class="stat-value">378</div>
      <div class="stat-label">destinataires</div>
    </div>
  </div>
  
  <div style="text-align: center; font-size: 1.2rem; color: #a78bfa; margin: 2rem 0;">
    Et toi ?
  </div>
  
  <div class="signature">✧</div>
  
  <div class="footer">
    Mail ${wave.id}/42 • Code: ${trackingCode}<br>
    Ce mail a été envoyé à 9 personnes. Tu es l'une d'elles.
  </div>
  
  <img src="${trackingPixel}" alt="" width="1" height="1" style="display: none;">
</body>
</html>
`.trim();

  return { html, text };
}

// ============================================================================
// GÉNÉRATION DU CODE DE TRACKING
// ============================================================================

export function generateTrackingCode(waveId: number, recipientIndex: number): string {
  // Format: W{waveId}-R{recipientIndex}-{randomHash}
  const hash = Math.random().toString(36).substring(2, 8);
  return `W${waveId.toString().padStart(2, '0')}-R${recipientIndex}-${hash}`;
}

// ============================================================================
// GÉNÉRATEUR DE MAILS
// ============================================================================

export function generateAllMails(waves: Wave[]): GeneratedMail[] {
  const mails: GeneratedMail[] = [];
  
  for (const wave of waves) {
    const waveTheme = WAVE_THEMES.find(t => t.id === wave.id)!;
    
    wave.recipients.forEach((recipient, index) => {
      const trackingCode = generateTrackingCode(wave.id, index);
      const { html, text } = generateMailBody(wave, recipient, trackingCode);
      
      mails.push({
        waveId: wave.id,
        recipientIndex: index,
        to: recipient.email,
        subject: `${waveTheme.subject}`,
        bodyHtml: html,
        bodyText: text,
        trackingCode,
        videoUrl: `https://www.youtube.com/watch?v=${wave.videoId}`,
      });
    });
  }
  
  return mails;
}

// ============================================================================
// EXPORT CSV POUR IMPORT DANS UN MAILER
// ============================================================================

export function exportToCSV(mails: GeneratedMail[]): string {
  const headers = ['wave_id', 'recipient_index', 'to', 'subject', 'tracking_code', 'video_url'];
  const rows = mails.map(m => [
    m.waveId,
    m.recipientIndex,
    m.to,
    `"${m.subject.replace(/"/g, '""')}"`,
    m.trackingCode,
    m.videoUrl,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

// ============================================================================
// DESCRIPTION YOUTUBE (à copier pour chaque vidéo)
// ============================================================================

export function generateYouTubeDescription(wave: Wave): string {
  const waveTheme = WAVE_THEMES.find(t => t.id === wave.id)!;
  
  return `
${waveTheme.hook}

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
• Playlist complète : [LIEN PLAYLIST]

---

📧 À PROPOS DE CE MAIL

Si tu as reçu le mail #${wave.id}/42, tu fais partie des 9 personnes choisies pour cette vague.

Tu ne peux pas répondre au mail. 
L'auteur se réfugie derrière une constellation d'identités.
Réelles et fictives. Morales et physiques.

La seule façon de participer : commenter ici.

---

#LaConstellation #Belgique #ProtectionSociale #Arizona2026 #975243

---

Mail ${wave.id}/42 : "${waveTheme.theme}"
`.trim();
}
