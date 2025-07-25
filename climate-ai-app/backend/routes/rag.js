const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Retrieve context files that match keywords in the question
function getRelevantContext(question) {
  const contextDir = path.join(__dirname, '../context_docs');
  // Normalize question: lowercase, remove punctuation
  const normalizedQuestion = question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const keywords = normalizedQuestion.split(/\s+/).filter(Boolean);

  let matchedFiles = [];
  fs.readdirSync(contextDir).forEach(file => {
    const content = fs.readFileSync(path.join(contextDir, file), 'utf-8').toLowerCase();
    if (keywords.some(kw => content.includes(kw))) {
      matchedFiles.push(content);
    }
  });

  // If the question is a comparison, include all files that mention any compared city
  if (
    matchedFiles.length < 2 &&
    (normalizedQuestion.includes('compare') || normalizedQuestion.includes(' and '))
  ) {
    fs.readdirSync(contextDir).forEach(file => {
      const content = fs.readFileSync(path.join(contextDir, file), 'utf-8').toLowerCase();
      if (keywords.some(kw => content.includes(kw))) {
        if (!matchedFiles.includes(content)) {
          matchedFiles.push(content);
        }
      }
    });
  }

  // If still no files match, fall back to all files
  if (matchedFiles.length === 0) {
    fs.readdirSync(contextDir).forEach(file => {
      matchedFiles.push(fs.readFileSync(path.join(contextDir, file), 'utf-8'));
    });
  }
  return matchedFiles.join('\n');
}

router.post('/green-policy', async (req, res) => {
  const { question } = req.body;
  const context = getRelevantContext(question);

  // Hybrid prompt: use context, but allow Gemini to use its own knowledge if context is insufficient
  const prompt = `You are a climate policy research assistant. Based on the following context and your own knowledge, answer the user's question in a clear, evidence-based manner. If the documents come from different sources, compare and contrast their key points. If you don’t know the answer based on the context, use your own knowledge to provide a helpful answer.\n\nContext:\n${context}\n\nQuestion:\n${question}`;

  try {
    const geminiRes = await axios.post('http://localhost:5001/ask_gemini', {
      context: '', // context is now embedded in the prompt
      question: prompt
    });
    res.json({ answer: geminiRes.data.answer });
  } catch (err) {
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
});

module.exports = router; 