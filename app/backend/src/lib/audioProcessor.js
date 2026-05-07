import fs from 'fs';
import path from 'path';
import { SpeechClient } from '@google-cloud/speech';
import dotenv from 'dotenv';
import geminiAnalyzer from './geminiAnalyzer.js';
import nodemailer from 'nodemailer';

dotenv.config();

const speechClient = new SpeechClient();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

export async function saveAudioChunk(file) {
  // file: { path, originalname }
  const dest = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
  await fs.promises.copyFile(file.path, dest);
  return dest;
}

export async function transcribeAudioFile(filePath, encoding = 'LINEAR16', sampleRateHertz = 16000, languageCode = 'en-US') {
  const audioBytes = await fs.promises.readFile(filePath).then(b => b.toString('base64'));

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding,
      sampleRateHertz,
      languageCode,
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
    },
  };

  const [response] = await speechClient.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  return { transcription, raw: response };
}

export async function generateMeetingReports(fullTranscript, session) {
  // Use geminiAnalyzer to create summary and performance
  const summaryPrompt = `You are an expert interviewer analyst. Given the following full meeting transcript, produce a JSON with keys: meetingSummary (concise), timelineHighlights (array), candidatePerformance (detailed assessment with strengths and weaknesses), actionItems (array), score (0-100).\nTranscript:\n${fullTranscript}`;

  // leverage gemini analyzer generateContent via analyzeCodeWithGemini wrapper by passing prompt
  // geminiAnalyzer.analyzeCodeWithGemini expects code; we'll call model directly using that helper pattern
  const aiAnalysis = await geminiAnalyzer.analyzeCodeWithGemini(summaryPrompt, 'transcript');

  // build reports
  const meetingSummary = aiAnalysis.summary || aiAnalysis.meetingSummary || 'Summary not available';
  const performance = aiAnalysis.candidatePerformance || aiAnalysis.analysis || {};

  return { meetingSummary, performance, raw: aiAnalysis };
}

export async function sendEmails({ hostEmail, candidateEmail, meetingSummary, performance, session }) {
  // Send detailed email to host, generic email to candidate
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const hostHtml = `
    <h2>Meeting Summary for session: ${session?.problem || session?.title || session?._id}</h2>
    <p>${meetingSummary}</p>
    <h3>Candidate Performance</h3>
    <pre>${JSON.stringify(performance, null, 2)}</pre>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: hostEmail,
    subject: `Interview Summary & Performance - ${session?.problem || session?.title || ''}`,
    html: hostHtml,
  });

  const candidateHtml = `
    <p>Dear Candidate,</p>
    <p>Thank you for attending the interview. We appreciate your time. We will get back to you regarding the outcome within 3-4 working days.</p>
    <p>Best regards,<br/>Standor Team</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: candidateEmail,
    subject: `Thank you for your interview at Standor`,
    html: candidateHtml,
  });

  return true;
}

export default { saveAudioChunk, transcribeAudioFile, generateMeetingReports, sendEmails };
