# API Reference Guide - Standor AI Meeting Analysis

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Session Management

### Create New Session
```http
POST /api/sessions
Content-Type: application/json

{
  "problem": "Implement Binary Search",
  "difficulty": "MEDIUM",
  "language": "javascript"
}

Response (201):
{
  "_id": "session_id",
  "roomId": "abc-defg-hij",
  "callId": "xyz-abcde-fgh",
  "hostId": "user_id",
  "problem": "Implement Binary Search",
  "language": "javascript",
  "difficulty": "MEDIUM",
  "type": "INTERVIEW",
  "status": "ACTIVE",
  "startedAt": "2026-05-06T10:00:00Z",
  "transcripts": [],
  "analyses": [],
  "performanceReport": null,
  "hostNotified": false
}
```

### Get Session
```http
GET /api/sessions/:id

Response (200):
{
  "_id": "session_id",
  "roomId": "abc-defg-hij",
  "hostEmail": "interviewer@company.com",
  "candidateEmail": "candidate@email.com",
  "transcripts": [
    {
      "speaker": "interviewer",
      "text": "Tell me about your experience...",
      "timestamp": "2026-05-06T10:05:00Z"
    }
  ],
  "analyses": [...],
  "meetingSummary": "Comprehensive summary...",
  "performanceReport": {...},
  "status": "ACTIVE"
}
```

### Join Session
```http
POST /api/sessions/:id/join
Content-Type: application/json

{
  "hostEmail": "interviewer@company.com",
  "candidateEmail": "candidate@email.com"
}

Response (200):
{
  "joined": true
}
```

### Upload Audio Chunk (Real-Time)
```http
POST /api/sessions/:id/audio-chunk
Content-Type: multipart/form-data

Form Data:
- audio: <audio file> (webm, mp3, wav)
- speaker: "interviewer" or "candidate"

Response (200):
{
  "accepted": true,
  "transcript": "So we need to implement a binary search algorithm...",
  "confidence": 0.95,
  "transcriptCount": 5
}
```

### Finalize Meeting & Send Reports
```http
POST /api/sessions/:id/finalize-meeting

Response (200):
{
  "finalized": true,
  "hostEmailSent": true,
  "candidateEmailSent": true,
  "report": {
    "meetingSummary": {
      "executiveSummary": "...",
      "topicsCovered": ["Binary Search", "Time Complexity"],
      "technicalHighlights": ["..."],
      "communicationSummary": "...",
      "finalRecommendation": "..."
    },
    "candidatePerformance": {
      "overallScore": 78,
      "problemSolving": 80,
      "technicalDepth": 75,
      "communication": 78,
      "codingQuality": 76,
      "strengths": ["..."],
      "improvementAreas": ["..."],
      "riskFlags": [],
      "decisionSuggestion": "Hire"
    }
  }
}
```

### Get Meeting Report (Host Only)
```http
GET /api/sessions/:id/meeting-report

Response (200):
{
  "sessionId": "session_id",
  "meetingSummary": "Executive summary of meeting...",
  "performanceReport": {
    "overallScore": 78,
    "problemSolving": 80,
    "technicalDepth": 75,
    "communication": 78,
    "codingQuality": 76,
    "strengths": ["Quick problem understanding", "Clean code..."],
    "improvementAreas": ["Edge case handling", "..."],
    "riskFlags": []
  },
  "transcriptCount": 12,
  "endedAt": "2026-05-06T10:45:00Z"
}
```

### Analyze Code
```http
POST /api/sessions/:id/analyze
Content-Type: application/json

{
  "code": "function binarySearch(arr, target) { ... }",
  "language": "javascript"
}

Response (200):
{
  "aiAnalysis": {
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)",
    "correctness": "Correct implementation",
    "bugs": [],
    "suggestions": ["Consider edge case where array is empty"],
    "testCases": ["[1,3,5,7] target=3", "[1,3,5,7] target=0"],
    "codeStyle": "Good variable naming",
    "overallScore": 85,
    "summary": "...",
    "analyzedAt": "2026-05-06T10:15:00Z"
  },
  "feedbackReport": {
    "audience": "system",
    "summary": "...",
    "score": 85,
    "strengths": ["..."],
    "improvementAreas": ["..."]
  }
}
```

### End Session
```http
POST /api/sessions/:id/end

Response (200):
{
  "_id": "session_id",
  "status": "COMPLETED",
  "endedAt": "2026-05-06T10:45:00Z"
}
```

---

## Email Endpoints (Automatic - No Direct API)

### Host Email (Automatic on Finalize)
**Triggered:** `POST /api/sessions/:id/finalize-meeting`  
**Recipient:** `session.hostEmail`  
**Subject:** `Standor Interview Report - [Problem Name]`

**Contains:**
- Overall performance score (0-100)
- 5 performance metrics (Problem Solving, Technical Depth, Communication, Coding Quality)
- Executive summary
- Strengths and improvement areas
- Risk flags (if any)
- Topics covered
- Color-coded score bars

### Candidate Email (Automatic on Finalize)
**Triggered:** `POST /api/sessions/:id/finalize-meeting`  
**Recipient:** `session.candidateEmail`  
**Subject:** `Thank you for your interview at Standor`

**Contains:**
- Appreciation message
- Timeline: "Results within 3-4 working days"
- Next steps
- Encouragement
- No performance data

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Code is required",
  "status": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized - Invalid or missing token",
  "status": 401
}
```

### 403 Forbidden
```json
{
  "message": "Only the host can end the session",
  "status": 403
}
```

### 404 Not Found
```json
{
  "message": "Session not found",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal Server Error",
  "error": "Detailed error message"
}
```

---

## Audio Chunk Upload Details

### Supported Formats
- `audio/webm` (Recommended)
- `audio/mp3`
- `audio/wav`
- `audio/ogg`

### Size Limits
- Max: 10 MB per chunk
- Recommended: 500KB - 2MB per chunk
- Upload frequency: Every 5-10 seconds during meeting

### Processing
1. Chunk received (multipart form data)
2. Converted to base64
3. Sent to Gemini Speech Recognition API
4. Transcription extracted
5. Speaker label added
6. Stored in `session.transcripts` array
7. Response: Transcript text + confidence score

---

## Performance Report Scoring

### Calculation Formula
```
Overall Score = (
  problemSolving × 0.30 +
  technicalDepth × 0.25 +
  communication × 0.20 +
  codingQuality × 0.25
)
```

### Score Interpretation
| Range | Color | Interpretation |
|-------|-------|-----------------|
| 75-100 | 🟢 Green | Excellent, strong hire signal |
| 60-74 | 🟡 Amber | Good, meets expectations |
| 0-59 | 🔴 Red | Needs improvement, hold for now |

### Metrics Breakdown

**Problem Solving (30% weight)**
- Understanding of problem requirements
- Approach clarity and efficiency
- Algorithm selection

**Technical Depth (25% weight)**
- Knowledge of language/framework
- Use of best practices
- Advanced concepts application

**Communication (20% weight)**
- Clarity of explanation
- Discussion participation
- Collaboration effectiveness

**Coding Quality (25% weight)**
- Code correctness
- Edge case handling
- Code style and readability

---

## Session States

| Status | Meaning | Can Accept Audio | Can Finalize |
|--------|---------|------------------|--------------|
| ACTIVE | Meeting in progress | ✅ Yes | ❌ No |
| COMPLETED | Meeting ended | ❌ No | ✅ Yes (already done) |

---

## Webhook Events (Future)

```json
{
  "event": "session.finalized",
  "sessionId": "session_id",
  "hostEmail": "interviewer@company.com",
  "performanceReport": {...},
  "timestamp": "2026-05-06T10:45:00Z"
}
```

---

## Rate Limiting

- Audio Upload: 100 chunks per session
- Code Analysis: 50 analyses per session
- Email Sending: 2 per session (host + candidate)

---

## Example: Complete Meeting Flow

```bash
# 1. Create session
curl -X POST http://localhost:4000/api/sessions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"problem": "Binary Search", "language": "javascript"}'
# Returns: roomId = "abc-defg-hij"

# 2. Candidate joins
curl -X POST http://localhost:4000/api/sessions/SESSION_ID/join \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hostEmail": "interviewer@company.com",
    "candidateEmail": "candidate@email.com"
  }'

# 3. Upload audio chunks (repeated during meeting)
curl -X POST http://localhost:4000/api/sessions/SESSION_ID/audio-chunk \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@recording.webm" \
  -F "speaker=interviewer"

# 4. Analyze code submissions
curl -X POST http://localhost:4000/api/sessions/SESSION_ID/analyze \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function binarySearch(arr, target) {...}",
    "language": "javascript"
  }'

# 5. Finalize and send reports
curl -X POST http://localhost:4000/api/sessions/SESSION_ID/finalize-meeting \
  -H "Authorization: Bearer TOKEN"

# 6. Host retrieves report
curl -X GET http://localhost:4000/api/sessions/SESSION_ID/meeting-report \
  -H "Authorization: Bearer TOKEN"
```

---

## Environment Variables

```env
# AI Analysis
GEMINI_API_KEY=sk-...

# Email Service
RESEND_API_KEY=re_...
FROM_EMAIL=no-reply@standor.dev

# SMTP Fallback
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=user@ethereal.email
SMTP_PASS=password

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/standor

# Security
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key

# API
PORT=4000
NODE_ENV=production
```

---

**API Version:** 1.0  
**Last Updated:** May 6, 2026
