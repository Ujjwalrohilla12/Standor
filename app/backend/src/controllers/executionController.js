// Language ID mappings for Judge0 CE API
const LANGUAGE_MAP = {
  javascript: { id: 93, name: "JavaScript (Node.js 18.15.0)", version: "18.15.0" },
  typescript: { id: 94, name: "TypeScript (5.0.3)", version: "5.0.3" },
  python:     { id: 100, name: "Python (3.12.5)", version: "3.12.5" },
  java:       { id: 91, name: "Java (JDK 17.0.6)", version: "17.0.6" },
  cpp:        { id: 105, name: "C++ (GCC 14.1.0)", version: "14.1.0" },
  "c++":      { id: 105, name: "C++ (GCC 14.1.0)", version: "14.1.0" },
  go:         { id: 107, name: "Go (1.23.5)", version: "1.23.5" },
  rust:       { id: 108, name: "Rust (1.85.0)", version: "1.85.0" },
};

const JUDGE0_API = "https://ce.judge0.com";

export async function getLanguages(req, res) {
  try {
    const seen = new Set();
    const languages = Object.entries(LANGUAGE_MAP)
      .filter(([key]) => { if (seen.has(key)) return false; seen.add(key); return true; })
      .map(([key, val]) => ({
        language: key,
        version: val.version,
      }));
    res.status(200).json(languages);
  } catch (error) {
    console.log("Error in getLanguages:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function executeCode(req, res) {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Language and code are required" });
    }

    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!langConfig) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    // Encode source code and stdin as base64
    const sourceBase64 = Buffer.from(code).toString("base64");
    const stdinBase64 = stdin ? Buffer.from(stdin).toString("base64") : "";

    const response = await fetch(
      `${JUDGE0_API}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,compile_output,status,time,memory`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id: langConfig.id,
          source_code: sourceBase64,
          stdin: stdinBase64,
          base64_encoded: true,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.log("Judge0 API error:", response.status, errText);
      return res.status(502).json({ message: "Code execution service unavailable" });
    }

    const data = await response.json();

    // Decode base64 fields
    const decode = (b64) => b64 ? Buffer.from(b64, "base64").toString("utf-8") : "";
    const stdout = decode(data.stdout);
    const stderr = decode(data.stderr);
    const compileOutput = decode(data.compile_output);

    // Judge0 status: id 3 = Accepted, 6 = Compilation Error, 5 = Time Limit, 11+ = Runtime Error
    const statusId = data.status?.id ?? 0;
    const isCompileError = statusId === 6;
    const isSuccess = statusId === 3;

    res.status(200).json({
      run: {
        stdout: stdout,
        stderr: isCompileError ? "" : stderr,
        code: isSuccess ? 0 : 1,
        signal: null,
      },
      compile: (isCompileError || compileOutput)
        ? {
            stdout: "",
            stderr: isCompileError ? compileOutput : "",
            code: isCompileError ? 1 : 0,
          }
        : undefined,
      language: language,
      version: langConfig.version,
    });
  } catch (error) {
    console.log("Error in executeCode:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
