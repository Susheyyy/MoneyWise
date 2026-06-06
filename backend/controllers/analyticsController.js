const { spawn } = require('child_process');
const path = require('path');
const Transaction = require('../models/Transaction'); 

const { GoogleGenAI } = require('@google/generative-ai'); 

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.generateIntelligenceMetrics = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).lean();
    const pythonScriptPath = path.join(__dirname, '../analytics/engine.py');
    const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(transactions)]);

    let pythonDataString = '';
    for await (const chunk of pythonProcess.stdout) {
      pythonDataString += chunk;
    }

    const calculatedMetrics = JSON.parse(pythonDataString.trim());

    if (calculatedMetrics.error) {
      throw new Error(calculatedMetrics.error);
    }

    const textModel = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const dynamicAiPrompt = `
      You are an expert AI financial advisor. Analyze these raw numeric metrics processed from a user's transaction ledger:
      ${JSON.stringify(calculatedMetrics)}
      
      Provide exactly 3 concise, highly actionable bullet point recommendations for their budget optimization.
      Include a statement indicating any category deviations if applicable, for example: "Food expenses increased by 23% compared to the previous month."
      Keep your recommendations strictly text-based, direct, short, and remove any emoji markup.
    `;

    const aiResponseWrapper = await textModel.generateContent({ 
      contents: [{ role: 'user', parts: [{ text: dynamicAiPrompt }] }] 
    });
    const generatedRecommendationsText = aiResponseWrapper.response.text();

    const structuredRecommendations = generatedRecommendationsText
      .split('\n')
      .map(line => line.replace(/^[*\-\s]+/, '').trim())
      .filter(Boolean);

    res.status(200).json({
      healthScore: calculatedMetrics.healthScore,
      anomalies: calculatedMetrics.anomalies,
      forecast: calculatedMetrics.forecast,
      trends: calculatedMetrics.trends,
      recommendations: structuredRecommendations
    });

  } catch (err) {
    console.error('AI Processing Fault Layer Exception:', err.message);
    res.status(500).json({ message: 'Failed to process financial metrics models pipelines.' });
  }
};