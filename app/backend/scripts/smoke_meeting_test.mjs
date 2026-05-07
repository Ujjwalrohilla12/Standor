import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import Session from '../src/models/Session.js';
import path from 'path';
import { buildMeetingSummaryAndPerformance, buildHostEmailHtml, buildCandidateGenericEmailHtml } from '../src/lib/meetingInsights.js';
import nodemailer from 'nodemailer';
import { ENV } from '../src/lib/env.js';

async function main() {
  const mongo = process.env.MONGO_URI || process.env.DB_URL || process.env.DB_URL;
  if (!mongo) {
    console.error('No MONGO_URI found in env');
    process.exit(1);
  }

  await mongoose.connect(mongo, { dbName: 'standor' });
  console.log('Connected to MongoDB');

  // Create or find a test host user
  let host = await User.findOne({ email: 'dev-host@local' });
  if (!host) {
    host = await User.create({ email: 'dev-host@local', name: 'Dev Host' });
    console.log('Created host user', host._id);
  } else {
    console.log('Found host user', host._id);
  }

  // Create a session
  const session = await Session.create({
    hostId: host._id,
    title: 'Smoke Test Interview',
    problem: 'Two-sum variant',
    language: 'javascript',
    createdAt: new Date(),
  });
  console.log('Created session', session._id.toString());

  // Prepare fake transcripts and codeAnalyses
  const transcripts = [
    { speaker: 'Interviewer', text: 'Please explain your approach.' },
    { speaker: 'Candidate', text: 'I would use a hashmap to get O(n) time.' },
    { speaker: 'Candidate', text: 'Edge cases include duplicates and negatives.' },
  ];

  const codeAnalyses = [
    { overallScore: 70, summary: 'Solution is correct but edge cases need tests.' },
  ];

  // Generate report (will fallback if Gemini key missing)
  const report = await buildMeetingSummaryAndPerformance({
    problem: session.problem,
    language: session.language,
    transcripts,
    codeAnalyses,
  });

  session.meetingSummary = JSON.stringify(report.meetingSummary || {});
  session.performanceReport = report.candidatePerformance || {};
  await session.save();
  console.log('Saved report to session');

  // Send emails via SMTP in .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const hostHtml = buildHostEmailHtml({ session, hostName: host.name, candidateName: 'Test Candidate', report });
  const candidateHtml = buildCandidateGenericEmailHtml({ candidateName: 'Test Candidate' });

  const hostRes = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: 'dev-host@local',
    subject: `Interview Summary - ${session.problem}`,
    html: hostHtml,
  });
  console.log('Host email sent, messageId=', hostRes.messageId);

  const candRes = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: 'candidate-test@local',
    subject: 'Thank you for interviewing',
    html: candidateHtml,
  });
  console.log('Candidate email sent, messageId=', candRes.messageId);

  console.log('Smoke test complete. Session ID:', session._id.toString());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});