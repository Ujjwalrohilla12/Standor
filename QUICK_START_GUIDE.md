# Quick Start Guide: Audio Analysis & Email System

## Prerequisites
- Node.js v18+
- MongoDB running
- Gemini API key
- Resend API key (for email testing)

## Setup

### 1. Backend Configuration
```bash
cd app/backend

# Ensure .env has:
GEMINI_API_KEY=<your-gemini-api-key>
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@standor.dev
MONGO_URI=mongodb://localhost:27017/standor
JWT_SECRET=your-secret-key
```

### 2. Start Backend
```bash
npm install
npm run dev
# Backend runs on http://localhost:4000
```

### 3. Frontend Setup
```bash
cd app/frontend

npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## Testing the Feature

### Scenario 1: Basic Meeting with Audio Capture

1. **Create Meeting**
   - Navigate to localhost:5173
   - Click "Create Meeting" or use API:
   ```bash
   curl -X POST http://localhost:4000/api/meetings \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"problem":"Two Sum","language":"javascript","difficulty":"MEDIUM"}'
   ```

2. **Share Meeting Link**
   - Copy the meeting link (e.g., `join/abc-defg-hij`)
   - Open in second browser/window as candidate

3. **Host Join**
   - Click "Join" as host
   - Admit candidate from waiting room

4. **Allow Permissions**
   - Grant microphone and camera access
   - Audio capture automatically starts (15-second intervals)

5. **Verify Audio Upload**
   - Check backend console for transcription messages:
   ```
   [Audio] Added transcript for abc-defg-hij: Hello, I...
   ```

6. **Submit Code** (Optional)
   - Write some code in editor
   - Click "Analyze" button
   - Wait for AI analysis
   - Should see analysis results

7. **End Meeting**
   - Host clicks "End Meeting" or disconnects
   - Backend should show finalization:
   ```
   [Finalization] Meeting abc-defg-hij: emails sending
   [Email] Host email sent to xxx@example.com
   [Email] Candidate email sent to yyy@example.com
   ```

### Scenario 2: Test Emails Directly

#### Test Host Email
```bash
curl -X GET http://localhost:4000/api/meetings/abc-defg-hij/report \
  -H "Authorization: Bearer <host-token>"
```

#### Trigger Manual Finalization
```bash
curl -X POST http://localhost:4000/api/meetings/abc-defg-hij/finalize \
  -H "Authorization: Bearer <admin-token>"
```

### Scenario 3: Audio Upload Directly
```bash
# Record a 10-second audio file or use sample
ffmpeg -f lavfi -i sine=frequency=1000:duration=10 test.wav
# Convert to webm
ffmpeg -i test.wav -c:a libopus test.webm

# Upload as base64
BASE64=$(base64 -w0 test.webm)
curl -X POST http://localhost:4000/api/meetings/abc-defg-hij/audio \
  -H "Content-Type: application/json" \
  -d "{\"audioBase64\":\"$BASE64\",\"speaker\":\"candidate\"}"
```

## Expected Results

### After Meeting Ends

#### Console Output (Backend)
```
[Finalization] Building report for session...
[Audio] Transcribed 5 chunks
[AI] Generated summary: "Interview covered..."
[AI] Candidate score: 75/100
[Email] Sending to host: interviewer@company.com
[Email] Sending to candidate: candidate@gmail.com
[DB] Session marked COMPLETED
```

#### Database (MongoDB)
```javascript
db.sessions.findOne({callId: "abc-defg-hij"})
// Shows:
{
  status: "COMPLETED",
  hostNotified: true,
  transcripts: [{speaker: "candidate", text: "...", timestamp: Date}...],
  analyses: [{...scoring and analysis...}],
  meetingSummary: "...",
  performanceReport: {
    overallScore: 75,
    problemSolving: 78,
    technicalDepth: 72,
    communication: 76,
    codingQuality: 74,
    strengths: [...],
    improvementAreas: [...]
  }
}
```

#### Email to Host (Resend Test)
- Check Resend dashboard or test email service
- Should contain:
  - Color-coded performance bars
  - 4 dimension scores
  - Executive summary
  - Topics covered
  - Strengths and improvement areas

#### Email to Candidate
- Should contain:
  - Thank you message
  - No performance data
  - Timeline: "3-4 working days"
  - Professional footer

## Troubleshooting

### Audio Not Being Transcribed
1. Check `GEMINI_API_KEY` is set
2. Verify audio chunk size > 2048 bytes
3. Check network tab for successful uploads
4. Look for errors in backend console

### Emails Not Sending
1. Verify `RESEND_API_KEY` is valid
2. Check `FROM_EMAIL` format
3. Ensure recipient emails are valid
4. Check Resend dashboard for API usage
5. Look for error in backend console

### Meeting Not Finalizing
1. Ensure host actually disconnects
2. Check Socket.io connection status
3. Verify database is accessible
4. Look for errors in backend console
5. Check `sessions.hostNotified` flag

### API Errors
1. Verify all required fields in request body
2. Check authorization tokens are valid
3. Ensure meeting exists with correct code
4. Verify database connection
5. Check for rate limiting (Gemini API)

## API Response Examples

### Audio Upload Response
```json
{
  "success": true,
  "transcript": "So I would approach this problem using a hash map",
  "confidence": 0.92,
  "keyPoints": ["hash map", "approach"]
}
```

### Code Analysis Response
```json
{
  "success": true,
  "analysis": {
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "correctness": "Solution correctly solves the problem",
    "bugs": [],
    "suggestions": ["Add input validation", "Consider edge cases"],
    "testCases": ["Empty array", "Single element", "Duplicates"],
    "codeStyle": "Clean and readable",
    "overallScore": 82,
    "summary": "Strong solution with good approach"
  }
}
```

### Meeting Report Response
```json
{
  "meetingCode": "abc-defg-hij",
  "status": "COMPLETED",
  "problem": "Two Sum",
  "language": "javascript",
  "startedAt": "2026-05-06T10:00:00Z",
  "endedAt": "2026-05-06T10:15:00Z",
  "meetingSummary": "Candidate demonstrated good problem-solving skills...",
  "performanceReport": {
    "overallScore": 75,
    "problemSolving": 78,
    "technicalDepth": 72,
    "communication": 76,
    "codingQuality": 74,
    "strengths": ["Clear approach", "Good communication"],
    "improvementAreas": ["Edge case handling", "Testing"],
    "riskFlags": [],
    "decisionSuggestion": "Hire"
  },
  "transcriptCount": 5,
  "codeAnalysisCount": 2,
  "hostNotified": true
}
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "API Error: 401" | Check authorization token is valid |
| "Meeting not found" | Ensure meeting code is correct |
| "Empty transcript" | Audio chunk too small or silent |
| "Analysis timeout" | Gemini API slow, try again |
| "Email not received" | Check spam, verify recipient email |
| "Port 4000 in use" | Kill process: `lsof -ti:4000 \| xargs kill -9` |

## Next Steps

1. **Validate Feature**: Run full workflow end-to-end
2. **Customize Emails**: Modify templates in `meetingInsights.js`
3. **Add Webhooks**: Integrate with external systems
4. **Monitor Metrics**: Track performance and errors
5. **Production Deploy**: Follow deployment guidelines

## Support Resources

- Full Documentation: `AUDIO_ANALYSIS_FEATURE.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- Backend API: `app/backend/src/controllers/meetingController.js`
- Frontend API: `app/frontend/src/utils/api.ts`

---

**Last Updated**: May 6, 2026
**Status**: Ready for Testing
