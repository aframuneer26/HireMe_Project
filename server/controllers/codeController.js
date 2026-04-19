const axios = require('axios');

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  go: "1.16.2",
  rust: "1.68.2"
};

exports.executeCode = async (req, res) => {
  try {
    const { language, sourceCode } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ message: "Code is required." });
    }

    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: language,
      version: LANGUAGE_VERSIONS[language] || "*",
      files: [
        {
          content: sourceCode,
        },
      ],
    });

    res.json({
      output: response.data.run.output,
      error: response.data.run.stderr,
      stdout: response.data.run.stdout
    });
  } catch (error) {
    console.error("Execution error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to execute code. Please try again." });
  }
};
