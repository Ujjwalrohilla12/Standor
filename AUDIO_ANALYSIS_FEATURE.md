# Standor AI Audio Analysis & Email System - Complete Implementation Guide

## Overview

This document describes the complete implementation of the AI-powered meeting audio analysis, candidate performance evaluation, and automated email dispatch system for Standor.

## Feature Summary

The system provides:

1. **Real-time Audio Transcription**: Automatic capture and transcription of meeting audio using Gemini 1.5 Flash
2. **Meeting Summary Generation**: AI-generated comprehensive summaries of meeting discussion
3. **Candidate Performance Report**: Detailed evaluation with scores in multiple dimensions (0-100 scale)
4. **AI Code Review**: Analysis of submitted code for correctness, complexity, style, and potential issues
5. **Automatic Email Dispatch**: Host-only detailed report with performance metrics + Candidate generic thank-you email
6. **Meeting Data Persistence**: Complete transcript, analysis, and performance data stored in MongoDB

## Architecture

### Backend (Node.js + Express)

#### API Endpoints

##### Audio Upload & Transcription
```
POST /api/meetings/:code/audio
Body: {
  audioBase64: string (base64-encoded audio),
  mimeType: string (default: "audio/webm"),
  speaker: string (default: "candidate", can be "interviewer" or "candidate")
}
Response: {
  success: boolean,
  transcript: string,
  confidence: number (0-1),
  keyPoints: string[]
}
```

**Flow**: Audio chunk → Gemini transcription → Stored in Session.transcripts

##### Code Submission for Analysis
```
POST /api/meetings/:code/code-submission
Body: {
  code: string (source code),
  language: string (default: "javascript")
}
Response: {
  success: boolean,
  analysis: {
    timeComplexity: string,
    spaceComplexity: string,
    correctness: string,
    bugs: string[],
    suggestions: string[],
    testCases: string[],
    codeStyle: string,
    overallScore: number (0-100),
    summary: string,
    analyzedAt: Date
  }
}
```

**Flow**: Code → Gemini analysis → Stored in Session.analyses and Session.codeSnapshots

##### Add Transcript Entry (Manual)
```
POST /api/meetings/:code/transcript
Body: {
  speaker: string (default: "candidate"),
  text: string
}
Response: {
  success: boolean,
  transcriptCount: number
}
```

##### Retrieve Meeting Report (Host Only)
```
GET /api/meetings/:code/report
Headers: { Authorization: "Bearer <token>" }
Response: {
  meetingCode: string,
  status: string,
  problem: string,
  language: string,
  startedAt: Date,
  endedAt: Date,
  meetingSummary: string,
  performanceReport: {
    overallScore: number,
    problemSolving: number,
    technicalDepth: number,
    communication: number,
    codingQuality: number,
    strengths: string[],
    improvementAreas: string[],
    riskFlags: string[],
    decisionSuggestion: string
  },
  transcriptCount: number,
  codeAnalysisCount: number,
  hostNotified: boolean
}
```

#### Meeting Finalization Flow

When a meeting ends (via host disconnect or all participants leaving), the system:

1. **Triggers finalization** via Socket.io events in `lib/socket.js`
2. **Builds comprehensive report** using `meetingFinalize.js`:
   - Collects all transcripts
   - Aggregates all code analyses
   - Calls Gemini to generate summary and performance report
3. **Sends emails**:
   - **Host Email**: Detailed report with performance scores (via `buildHostEmailHtml`)
   - **Candidate Email**: Generic thank-you with 3-4 day timeline (via `buildCandidateGenericEmailHtml`)
4. **Marks session**: Sets `hostNotified = true` and `status = "COMPLETED"`

**Key Function**: `finalizeMeetingAndDispatch()` in `lib/meetingFinalize.js`
- Handles idempotency (uses `finalizeInFlight` Set to prevent duplicate processing)
- Retries logic built-in
- Sets `session.hostNotified` flag to prevent re-sending

#### Data Models

**Session Schema** includes:
```javascript
{
  transcripts: [{
    speaker: String,
    text: String,
    timestamp: Date
  }],
  analyses: [{  // Code analysis results
    timeComplexity: String,
    spaceComplexity: String,
    correctness: String,
    bugs: [String],
    suggestions: [String],
    testCases: [String],
    codeStyle: String,
    overallScore: Number,
    summary: String,
    analyzedAt: Date
  }],
  codeSnapshots: [{
    content: String,
    language: String,
    timestamp: Date
  }],
  meetingSummary: String,
  performanceReport: Object,  // Contains scores and assessment
  hostNotified: Boolean,
  startedAt: Date,
  endedAt: Date,
  hostEmail: String,
  candidateEmail: String
}
```

### Frontend (React + TypeScript)

#### API Methods (in `src/utils/api.ts`)

```typescript
meetingsApi.uploadAudioChunk(code, audioBase64, speaker)
meetingsApi.submitCodeForAnalysis(code, sourceCode, language)
meetingsApi.addTranscriptEntry(code, speaker, text)
meetingsApi.getMeetingReport(code)
```

#### Component Integration

**MeetingRoom Component** (`src/pages/MeetingRoom.tsx`):
- Real-time audio capture using `MediaRecorder` API
- Audio chunks captured every 15 seconds
- Automatic upload to backend via `sessionsApi.uploadAudioChunk()`
- Live transcript count display (shows `liveTranscriptCount`)

**Audio Capture Logic**:
```typescript
// Captures audio from local stream
recorder.ondataavailable = async (event) => {
  if (event.data.size < 2048) return;  // Minimum chunk size
  await sessionsApi.uploadAudioChunk(
    meetingInfo.id,
    event.data,
    isHost ? "interviewer" : "candidate",
  );
  setLiveTranscriptCount((prev) => prev + 1);
};
recorder.start(15000);  // Capture every 15 seconds
```

**Code Analysis**: Connected to existing `handleAnalyze()` function:
```typescript
const { aiAnalysis } = await roomsApi.analyze(meetingInfo.id, {
  code: editorCode,
  language: selectedLanguage,
});
```

## Email System

### Host Email
- **Recipient**: Meeting host/interviewer
- **Subject**: `Standor Interview Report - [Problem Name]`
- **Content**:
  - Overall score with color-coded bar (red < 60, amber 60-74, green >= 75)
  - Performance breakdown (Problem Solving, Technical Depth, Communication, Coding Quality)
  - Executive summary
  - Communication assessment
  - Strengths, improvement areas, and risk flags
  - Topics covered
- **Delivery**: Via Resend API (with SMTP fallback)
- **Timing**: Immediately after meeting ends

### Candidate Email
- **Recipient**: Meeting candidate
- **Subject**: `Thank you for interviewing with Standor`
- **Content**:
  - Professional thank you
  - Timeline: "Results within 3-4 working days"
  - Expected timeline visualization
  - Next steps information
  - Call-to-action
- **No Performance Data**: Candidate never sees scores or detailed evaluation
- **Delivery**: Via Resend API (with SMTP fallback)
- **Timing**: Immediately after meeting ends (same time as host email)

### Email Sending
```typescript
// Uses Resend API with SMTP fallback
sendMail({
  to: email,
  subject: subject,
  text: plaintext,
  html: htmlContent
})
```

## Integration Points

### Socket.io Events (in `lib/socket.js`)

**Meeting End Triggers**:
1. Host calls `end-meeting-for-all` → Triggers finalization with `trigger: "host_end_for_all"`
2. All participants disconnect → Triggers finalization with `trigger: "auto_room_empty_disconnect"`

**Implementation**:
```javascript
socket.on("end-meeting-for-all", async ({ code }) => {
  await finalizeMeetingByCode({
    code,
    trigger: "host_end_for_all",
  });
});

// On disconnect, if room empty:
finalizeMeetingByCode({
  code: meetingCode,
  trigger: "auto_room_empty_disconnect",
});
```

## Environment Variables

Required:
```
GEMINI_API_KEY=<Google Gemini API key>
RESEND_API_KEY=<Resend API key>
FROM_EMAIL=<Email address for sending>
```

Optional (SMTP Fallback):
```
SMTP_HOST=<SMTP server>
SMTP_PORT=<SMTP port, default 587>
SMTP_USER=<SMTP username>
SMTP_PASS=<SMTP password>
```

## Usage Workflow

### For Meeting Host

1. **Create Meeting**
   ```
   POST /api/meetings
   Body: { problem, language, difficulty }
   ```

2. **Start Meeting**
   - Share meeting link with candidate
   - Audio automatically captured and transcribed

3. **Analyze Code** (optional)
   - Candidate submits code
   - Host clicks "Analyze" button
   - AI analysis performed and displayed

4. **End Meeting**
   - Host disconnects or clicks "End Meeting for All"
   - System automatically:
     - Generates comprehensive report
     - Sends host detailed email with performance scores
     - Sends candidate generic thank-you email

5. **Review Report**
   - Host can retrieve report via `/api/meetings/:code/report`

### For Candidate

1. **Join Meeting**
   - Enter name (for guest) or use credentials
   - Audio captured automatically

2. **Interview**
   - Code editor available for live coding
   - Chat available for communication
   - Audio/video streaming

3. **Meeting Ends**
   - Receives professional thank-you email
   - No performance data in email
   - Timeline: results in 3-4 working days

## Data Flow Diagram

```
Meeting Start
    ↓
Audio Captured (15s intervals)
    ↓ (MediaRecorder)
    ├→ Transcript → Stored in Session
    └→ (Optional) Code Submitted → AI Analysis → Stored in Session
    ↓
Meeting Ends (Host disconnects)
    ↓
finalizeMeetingByCode() triggered
    ↓
buildMeetingSummaryAndPerformance()
    ├→ Collects all transcripts
    ├→ Collects all code analyses
    └→ Calls Gemini for comprehensive report
    ↓
Generate Emails
    ├→ Host: buildHostEmailHtml() → Detailed report with scores
    └→ Candidate: buildCandidateGenericEmailHtml() → Thank you email
    ↓
Send Emails (Resend API + SMTP fallback)
    ├→ sendMail(hostEmail)
    └→ sendMail(candidateEmail)
    ↓
Mark Session: hostNotified = true, status = "COMPLETED"
    ↓
Done
```

## Error Handling

### Backend
- Audio transcription failures → Logged, meeting continues
- Code analysis failures → Returns fallback analysis (still useful)
- Email sending failures → Retried, errors logged
- API errors → Proper HTTP status codes and error messages

### Frontend
- Audio upload failures → Toast warning, meeting continues
- Code analysis failures → User notified via toast
- Network errors → Standard error handling

## Testing Checklist

### Backend
- [ ] Audio transcription endpoint with base64 input
- [ ] Code submission endpoint with language support
- [ ] Transcript entry endpoint
- [ ] Meeting report retrieval (host-only)
- [ ] Meeting finalization trigger on host disconnect
- [ ] Meeting finalization trigger on all participants leave
- [ ] Email sending to host and candidate
- [ ] Idempotency check (no duplicate emails)

### Frontend
- [ ] Audio capture starts on join
- [ ] Audio uploads every 15 seconds
- [ ] Code analysis button available for host
- [ ] Meeting report retrievable after completion
- [ ] Proper error handling and toast notifications

### Integration
- [ ] Full meeting lifecycle: create → join → analyze code → end
- [ ] Email delivery to valid email addresses
- [ ] Email formatting and content correctness
- [ ] Performance metrics calculation accuracy

## Performance Considerations

- Audio chunks limited to 15-second intervals (balances latency vs. data size)
- Minimum chunk size: 2048 bytes (prevents empty chunks)
- Gemini API calls batched per meeting (not per chunk)
- Email sending is non-blocking (async)
- Finalization uses locks to prevent race conditions

## Future Enhancements

1. **Real-time Feedback**: Display AI insights during interview
2. **Multi-language Support**: Detect and handle multiple languages
3. **Advanced Metrics**: Time-based performance tracking
4. **Interview Recording**: Full video/audio recording with playback
5. **Comparative Analysis**: Compare candidate performance across cohorts
6. **Skill Assessment**: Extract specific skills evaluated
7. **Feedback Loop**: Track candidate improvement over multiple interviews

## Support & Troubleshooting

### Common Issues

**Transcription not working**
- Check GEMINI_API_KEY is set
- Verify audio chunk size > 2048 bytes
- Check network connectivity

**Emails not sending**
- Verify RESEND_API_KEY or SMTP credentials
- Check FROM_EMAIL format
- Verify recipient email addresses are valid

**Report not generating**
- Check MongoDB connection
- Verify session data was collected
- Check Gemini API quota

## References

- [Gemini API Documentation](https://ai.google.dev/)
- [Resend Email API](https://resend.com/)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Socket.io Documentation](https://socket.io/docs/)
