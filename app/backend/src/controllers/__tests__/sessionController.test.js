import { beforeEach, describe, expect, test, jest } from '@jest/globals';

const saveMock = jest.fn();
const sessionDoc = {
  _id: 'session-1',
  roomId: 'room-1',
  type: 'INTERVIEW',
  language: 'javascript',
  hostId: { toString: () => 'host-1' },
  participantId: null,
  status: 'ACTIVE',
  analyses: [],
  feedbackReports: [],
  codeSnapshots: [],
  lastActivityAt: null,
  save: saveMock,
};

const SessionMock = {
  findById: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
};

await jest.unstable_mockModule('../../models/Session.js', () => ({
  default: SessionMock,
}));

const { analyzeCode, saveSnapshot, getReport } = await import('../sessionController.js');

function createRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

describe('sessionController analysis persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionDoc.analyses = [];
    sessionDoc.feedbackReports = [];
    sessionDoc.codeSnapshots = [];
    SessionMock.findById.mockResolvedValue(sessionDoc);
    SessionMock.findOne.mockResolvedValue(sessionDoc);
  });

  test('analyzeCode stores analysis and feedback report', async () => {
    const req = {
      params: { id: 'room-1' },
      body: { code: 'function sum(a, b) { return a + b; }', language: 'javascript' },
    };
    const res = createRes();

    await analyzeCode(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload.aiAnalysis).toBeDefined();
    expect(res.payload.feedbackReport).toBeDefined();
    expect(sessionDoc.analyses).toHaveLength(1);
    expect(sessionDoc.feedbackReports).toHaveLength(1);
    expect(sessionDoc.feedbackReports[0].summary).toContain('Analyzed');
  });

  test('saveSnapshot persists snapshot state', async () => {
    const req = {
      params: { id: 'room-1' },
      body: { content: 'console.log(1);', language: 'javascript' },
    };
    const res = createRes();

    await saveSnapshot(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload.saved).toBe(true);
    expect(sessionDoc.codeSnapshots).toHaveLength(1);
    expect(sessionDoc.codeSnapshots[0].content).toBe('console.log(1);');
  });

  test('getReport returns the latest feedback report', async () => {
    sessionDoc.feedbackReports.push({ summary: 'Latest report', score: 90, audience: 'interviewer' });
    const req = { params: { id: 'room-1' } };
    const res = createRes();

    await getReport(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload.report.summary).toBe('Latest report');
  });
});
