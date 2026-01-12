#!/usr/bin/env node
/**
 * LA CONSTELLATION - Mail Sender
 * 
 * Envoie les mails générés via SMTP
 * 
 * Configuration requise dans .env:
 *   SMTP_HOST=smtp.example.com
 *   SMTP_PORT=587
 *   SMTP_USER=noreply@example.com
 *   SMTP_PASS=xxx
 *   SMTP_FROM=✧ <noreply@example.com>
 * 
 * Usage:
 *   npm run send:test          # Envoie à ton email de test
 *   npm run send:wave -- 1     # Envoie la vague 1
 *   npm run send               # Envoie tout (ATTENTION!)
 */

import { createTransport } from 'nodemailer';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Configuration SMTP
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

const FROM = process.env.SMTP_FROM || '✧ <noreply@constellation.void>';
const TEST_EMAIL = process.env.TEST_EMAIL || '';

// Délai entre les mails (évite le spam filter)
const DELAY_BETWEEN_MAILS = 5000; // 5 secondes
const DELAY_BETWEEN_WAVES = 60000; // 1 minute entre les vagues

interface MailFile {
  path: string;
  waveId: number;
  recipientIndex: number;
  email: string;
  subject: string;
  html: string;
}

// Parse les fichiers de mails générés
function parseMailFiles(outputDir: string): MailFile[] {
  const mailsDir = join(outputDir, 'mails');
  const mails: MailFile[] = [];
  
  if (!existsSync(mailsDir)) {
    console.error('❌ Dossier output/mails non trouvé. Lance d\'abord: npm run generate');
    process.exit(1);
  }
  
  const waveDirs = readdirSync(mailsDir).filter(d => d.startsWith('wave-'));
  
  for (const waveDir of waveDirs) {
    const waveId = parseInt(waveDir.split('-')[1]);
    const wavePath = join(mailsDir, waveDir);
    const files = readdirSync(wavePath).filter(f => f.endsWith('.html'));
    
    for (const file of files) {
      const html = readFileSync(join(wavePath, file), 'utf-8');
      
      // Extraire le sujet du HTML
      const subjectMatch = html.match(/<title>([^<]+)<\/title>/);
      const subject = subjectMatch ? subjectMatch[1] : `La Constellation #${waveId}`;
      
      // Extraire l'email du nom de fichier
      const emailMatch = file.match(/mail-(\d+)-(.+)\.html/);
      if (!emailMatch) continue;
      
      const recipientIndex = parseInt(emailMatch[1]);
      const email = emailMatch[2].replace(/_at_/g, '@').replace(/_/g, '.');
      
      mails.push({
        path: join(wavePath, file),
        waveId,
        recipientIndex,
        email,
        subject,
        html,
      });
    }
  }
  
  return mails.sort((a, b) => a.waveId - b.waveId || a.recipientIndex - b.recipientIndex);
}

// Envoie un mail
async function sendMail(
  transporter: ReturnType<typeof createTransport>,
  mail: MailFile,
  testMode: boolean
): Promise<boolean> {
  const to = testMode ? TEST_EMAIL : mail.email;
  
  if (!to) {
    console.error('❌ Email destinataire manquant');
    return false;
  }
  
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: mail.subject,
      html: mail.html,
      headers: {
        'X-Constellation-Wave': mail.waveId.toString(),
        'X-Constellation-Recipient': mail.recipientIndex.toString(),
        'X-No-Reply': 'true',
      },
    });
    
    console.log(`✓ [W${mail.waveId}-R${mail.recipientIndex}] → ${to}`);
    return true;
  } catch (error) {
    console.error(`✗ [W${mail.waveId}-R${mail.recipientIndex}] → ${to}: ${error}`);
    return false;
  }
}

// Délai
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const waveArg = args.find(a => a.startsWith('--wave'));
  const targetWave = waveArg ? parseInt(args[args.indexOf(waveArg) + 1] || args[args.indexOf('--wave') + 1]) : null;
  
  // Vérifier la config
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    console.error('❌ Configuration SMTP manquante.');
    console.log('   Configure les variables d\'environnement:');
    console.log('   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    process.exit(1);
  }
  
  if (testMode && !TEST_EMAIL) {
    console.error('❌ TEST_EMAIL non configuré.');
    process.exit(1);
  }
  
  // Charger les mails
  const outputDir = join(process.cwd(), 'output');
  let mails = parseMailFiles(outputDir);
  
  if (targetWave) {
    mails = mails.filter(m => m.waveId === targetWave);
  }
  
  if (mails.length === 0) {
    console.error('❌ Aucun mail à envoyer.');
    process.exit(1);
  }
  
  // Afficher le résumé
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              LA CONSTELLATION - MAIL SENDER                  ║
╠══════════════════════════════════════════════════════════════╣
║  Mode:         ${testMode ? 'TEST (tous vers ' + TEST_EMAIL + ')' : 'PRODUCTION'}
║  Mails:        ${mails.length}
║  Vagues:       ${targetWave || 'Toutes'}
║  Délai:        ${DELAY_BETWEEN_MAILS / 1000}s entre mails
╚══════════════════════════════════════════════════════════════╝
`);
  
  if (!testMode) {
    console.log('⚠️  MODE PRODUCTION - Les mails seront envoyés aux vrais destinataires!');
    console.log('   Appuie sur Ctrl+C dans les 10 secondes pour annuler...\n');
    await delay(10000);
  }
  
  // Créer le transporteur
  const transporter = createTransport(SMTP_CONFIG);
  
  // Vérifier la connexion
  try {
    await transporter.verify();
    console.log('✓ Connexion SMTP établie\n');
  } catch (error) {
    console.error('❌ Connexion SMTP échouée:', error);
    process.exit(1);
  }
  
  // Envoyer les mails
  let sent = 0;
  let failed = 0;
  let currentWave = 0;
  
  for (const mail of mails) {
    // Pause entre les vagues
    if (mail.waveId !== currentWave) {
      if (currentWave > 0) {
        console.log(`\n⏳ Pause entre vagues (${DELAY_BETWEEN_WAVES / 1000}s)...\n`);
        await delay(DELAY_BETWEEN_WAVES);
      }
      currentWave = mail.waveId;
      console.log(`\n📧 VAGUE ${mail.waveId}`);
    }
    
    const success = await sendMail(transporter, mail, testMode);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Délai entre les mails
    await delay(DELAY_BETWEEN_MAILS);
  }
  
  // Résumé final
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                      ENVOI TERMINÉ                           ║
╠══════════════════════════════════════════════════════════════╣
║  Envoyés:   ${sent.toString().padStart(3)}                                           ║
║  Échoués:   ${failed.toString().padStart(3)}                                           ║
║  Total:     ${(sent + failed).toString().padStart(3)}                                           ║
╚══════════════════════════════════════════════════════════════╝

Prochaines étapes:
1. Vérifie les logs pour les erreurs
2. Surveille Bluesky: ${process.env.BLUESKY_URL || 'https://bsky.app/profile/ouaisfi.eu'}
3. Surveille YouTube: ${process.env.YOUTUBE_URL || 'https://www.youtube.com/@ouaisfieu'}
`);
}

main();
