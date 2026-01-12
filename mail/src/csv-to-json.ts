#!/usr/bin/env node
/**
 * Convertit contacts.csv en waves.json
 * 
 * Usage: npx tsx src/csv-to-json.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CSVRow {
  wave_id: string;
  recipient_index: string;
  email: string;
  name: string;
  context: string;
  angle: string;
  video_id: string;
}

const WAVE_THEMES: Record<number, { theme: string; subject: string }> = {
  1: { theme: "L'éveil", subject: "Tu fais partie du système" },
  2: { theme: "Les chiffres", subject: "975 243" },
  3: { theme: "Le piège fiscal", subject: "52,6%" },
  4: { theme: "L'invalidité", subject: "527 000 invalides" },
  5: { theme: "Arizona", subject: "180 000 exclusions" },
  6: { theme: "Le silence", subject: "Pourquoi personne n'en parle ?" },
  7: { theme: "La honte", subject: "On t'a appris à te taire" },
  8: { theme: "Les mutuelles", subject: "Tes 160€/mois financent quoi ?" },
  9: { theme: "L'ONEM", subject: "La machine à broyer" },
  10: { theme: "Les contrôles", subject: "Coupable jusqu'à preuve du contraire" },
  11: { theme: "La dépression", subject: "Et si c'était le système le problème ?" },
  12: { theme: "L'isolement", subject: "Diviser pour régner" },
  13: { theme: "La dette", subject: "Tu dois déjà 50 000€" },
  14: { theme: "Le travail", subject: "Le piège de l'emploi" },
  15: { theme: "Les enfants", subject: "Ils héritent du système" },
  16: { theme: "La colère", subject: "Tu as le droit d'être en colère" },
  17: { theme: "L'espoir", subject: "614 contacts" },
  18: { theme: "L'action", subject: "Que faire ?" },
  19: { theme: "Le vote", subject: "Voter ne suffit plus" },
  20: { theme: "Les syndicats", subject: "Où sont-ils ?" },
  21: { theme: "L'Europe", subject: "Bruxelles contre Bruxelles" },
  22: { theme: "Le CPAS", subject: "Le dernier filet" },
  23: { theme: "Le logement", subject: "Locataire à vie" },
  24: { theme: "La santé", subject: "Malade de travailler" },
  25: { theme: "Les femmes", subject: "70% des temps partiels" },
  26: { theme: "Les jeunes", subject: "Génération sacrifiée" },
  27: { theme: "Les vieux", subject: "La pension fantôme" },
  28: { theme: "L'énergie", subject: "Chauffage ou nourriture" },
  29: { theme: "La bouffe", subject: "Malbouffe obligatoire" },
  30: { theme: "Les transports", subject: "Prisonnier de ta voiture" },
  31: { theme: "Le numérique", subject: "La fracture invisible" },
  32: { theme: "Les papiers", subject: "Kafka était belge" },
  33: { theme: "La langue", subject: "Diviser par la langue" },
  34: { theme: "Les riches", subject: "Pas de taxe sur la fortune" },
  35: { theme: "Les banques", subject: "Too big to fail" },
  36: { theme: "L'éducation", subject: "Former des travailleurs dociles" },
  37: { theme: "La culture", subject: "Artiste = SDF" },
  38: { theme: "L'écologie", subject: "Écologie des riches" },
  39: { theme: "La tech", subject: "Automatisation = chômage" },
  40: { theme: "Le futur", subject: "2030" },
  41: { theme: "Toi", subject: "Pourquoi ce mail ?" },
  42: { theme: "Nous", subject: "La Constellation" },
};

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    
    return row as CSVRow;
  });
}

function main() {
  const csvPath = join(process.cwd(), 'data', 'contacts.csv');
  const jsonPath = join(process.cwd(), 'data', 'waves.json');
  
  if (!existsSync(csvPath)) {
    console.error('❌ Fichier data/contacts.csv non trouvé.');
    console.log('   Copie data/contacts-template.csv vers data/contacts.csv et remplis-le.');
    process.exit(1);
  }
  
  const csv = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csv);
  
  // Grouper par vague
  const waveMap = new Map<number, CSVRow[]>();
  
  for (const row of rows) {
    const waveId = parseInt(row.wave_id);
    if (!waveMap.has(waveId)) {
      waveMap.set(waveId, []);
    }
    waveMap.get(waveId)!.push(row);
  }
  
  // Construire le JSON
  const waves = Array.from(waveMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([waveId, recipients]) => {
      const theme = WAVE_THEMES[waveId] || { theme: `Vague ${waveId}`, subject: `Message ${waveId}` };
      const videoId = recipients[0]?.video_id || `VIDEO_ID_${waveId}`;
      
      return {
        id: waveId,
        theme: theme.theme,
        subject: theme.subject,
        videoId,
        videoTitle: `LA CONSTELLATION #${waveId} — ${theme.theme}`,
        customIntro: null,
        recipients: recipients
          .sort((a, b) => parseInt(a.recipient_index) - parseInt(b.recipient_index))
          .map(r => ({
            email: r.email,
            name: r.name || null,
            context: r.context || null,
            angle: r.angle || null,
          })),
      };
    });
  
  const output = {
    sender: {
      email: 'noreply@constellation.void',
      name: '✧',
    },
    tracking: {
      bluesky: 'https://bsky.app/profile/ouaisfi.eu',
      youtube: 'https://www.youtube.com/@ouaisfieu',
      website: 'https://ouaisfieu.github.io/constellation/',
    },
    waves,
  };
  
  writeFileSync(jsonPath, JSON.stringify(output, null, 2));
  
  // Stats
  const totalRecipients = waves.reduce((sum, w) => sum + w.recipients.length, 0);
  const todoCount = waves.reduce((sum, w) => 
    sum + w.recipients.filter(r => r.email === 'TODO').length, 0
  );
  
  console.log(`
✓ Conversion terminée!

  Vagues:        ${waves.length}
  Destinataires: ${totalRecipients}
  À compléter:   ${todoCount}
  
  Fichier: ${jsonPath}

Prochaine étape: npm run generate
`);
}

main();
