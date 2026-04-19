const axios = require('axios');

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  go: "1.16.2",
  rust: "1.68.2"
};

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.executeCode = async (req, res) => {
  try {
    const { language, sourceCode } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ message: "Code is required." });
    }

    if (language !== 'javascript' && language !== 'python') {
        return res.status(400).json({ message: `Language ${language} is not supported locally yet. Only JavaScript and Python are available.` });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filename = `code_${Date.now()}.${language === 'javascript' ? 'js' : 'py'}`;
    const filePath = path.join(tempDir, filename);

    fs.writeFileSync(filePath, sourceCode);

    const command = language === 'javascript' ? `node "${filePath}"` : `python "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
      // Clean up file
      try { fs.unlinkSync(filePath); } catch (e) {}

      res.json({
        output: stdout + stderr,
        stdout: stdout,
        error: stderr
      });
    });
  } catch (error) {
    console.error("Execution error:", error.message);
    res.status(500).json({ message: "Failed to execute code locally. Please try again." });
  }
};
