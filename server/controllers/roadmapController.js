const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── PDF Text Extraction using pdfjs-dist ──────────────────────────────────────
async function extractTextFromPDF(filePath) {
  // Dynamically import pdfjs-dist (ESM compatible via require)
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array, useSystemFonts: true });
  const pdfDocument = await loadingTask.promise;
  
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

// ─── NLP Pre-processing ────────────────────────────────────────────────────────
function preprocessText(rawText) {
  // 1. Normalize whitespace and remove non-readable control characters
  let text = rawText.replace(/[\r\n\t]+/g, ' ');
  // 2. Remove non-ASCII garbage (common in PDFs)
  text = text.replace(/[^\x20-\x7E]/g, ' ');
  // 3. Collapse multiple spaces
  text = text.replace(/\s+/g, ' ').trim();
  // 4. Lowercase for keyword matching
  const lower = text.toLowerCase();

  // 5. Skill keyword extraction
  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
    'react', 'reactjs', 'angular', 'vue', 'vuejs', 'nextjs', 'next.js', 'nodejs', 'node.js',
    'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'dynamodb', 'cassandra',
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform',
    'ci/cd', 'jenkins', 'github actions', 'gitlab ci',
    'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'scikit-learn', 'keras',
    'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'git', 'github',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'figma', 'linux', 'bash',
    'data structures', 'algorithms', 'system design', 'sql', 'nosql',
    'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin',
    'selenium', 'cypress', 'jest', 'mocha', 'unit testing',
  ];

  const foundSkills = [...new Set(techKeywords.filter(k => lower.includes(k)))];

  // 6. Strip PII
  const cleaned = text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]')
    .replace(/(\+?\d[\d\s\-]{8,}\d)/g, '[PHONE]')
    .replace(/https?:\/\/[^\s]+/g, '[URL]');

  return { cleanedText: cleaned, detectedSkills: foundSkills };
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
exports.generateRoadmap = async (req, res) => {
  const resumeFile = req.file;

  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job Description is required." });
    }
    if (!resumeFile) {
      return res.status(400).json({ message: "Resume PDF is required." });
    }

    // ── 1. Extract text from PDF ──────────────────────────────────────────────
    let rawResumeText = '';
    try {
      rawResumeText = await extractTextFromPDF(resumeFile.path);
      console.log(`✅ PDF extracted. Length: ${rawResumeText.length} chars`);
    } catch (parseErr) {
      console.error("PDF Extraction error:", parseErr.message);
      return res.status(500).json({
        message: "Failed to read your PDF. Please ensure it is a text-based PDF (not a scanned image)."
      });
    } finally {
      // Always clean up the temp file
      try { fs.unlinkSync(resumeFile.path); } catch (_) {}
    }

    if (!rawResumeText || rawResumeText.length < 50) {
      return res.status(400).json({
        message: "Could not extract text from your PDF. It may be a scanned/image-based PDF. Please use a text-based PDF."
      });
    }

    // ── 2. NLP Pre-processing ─────────────────────────────────────────────────
    const { cleanedText, detectedSkills } = preprocessText(rawResumeText);
    console.log(`✅ NLP done. Skills detected: ${detectedSkills.join(', ') || 'none'}`);

    // ── 3. Build Gemini Prompt ────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are an expert career coach and senior technical recruiter.

## Job Description (JD):
${jobDescription}

## Candidate Resume (NLP Pre-processed):
${cleanedText.substring(0, 6000)}

## Auto-Detected Technical Skills in Resume:
${detectedSkills.length > 0 ? detectedSkills.join(', ') : 'None detected'}

---

Analyze the candidate's resume STRICTLY against the Job Description above.
Output a high-impact, short, and crisp response in clean markdown:

### Match Summary
Max 30 words. Include Match %.

### Missing Skills
Bulleted list of missing core technical skills/tools ONLY. (No explanations).

### Learning Roadmap
Max 4 numbered steps. Format each as: **Skill Name** | Resource Type | Time. (Max 1 sentence description).

### Quick Wins
Max 2 high-impact bullets. (Max 15 words each).

STRICT RULES: 
1. DO NOT use any emojis.
2. Use bullet points. 
3. No long sentences. 
4. No filler words. 
5. No paragraphs.
    `;

    // ── 4. Call Gemini ────────────────────────────────────────────────────────
    let roadmap = "Could not generate roadmap. Please try again.";
    try {
      const result = await model.generateContent(prompt);
      roadmap = result.response.text() || roadmap;
    } catch (aiErr) {
      console.error("❌ Gemini API error:", aiErr.message);
      return res.status(500).json({ message: "AI generation failed. Please check your Gemini API key." });
    }

    return res.json({ roadmap, detectedSkills });

  } catch (error) {
    console.error("❌ Roadmap generation failed:", error.message);
    // Clean up temp file if it still exists
    if (resumeFile?.path) {
      try { fs.unlinkSync(resumeFile.path); } catch (_) {}
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};
