const { spawn } = require('child_process');
const path = require('path');
const Transaction = require('../models/Transaction'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateIntelligenceMetrics = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).lean();
    const flaskResponse = await fetch('http://127.0.0.1:5001/api/intelligence/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions)
    });

    if (!flaskResponse.ok) {
      throw new Error(`Flask service returned status ${flaskResponse.status}`);
    }

    let calculatedMetrics;
    try {
      calculatedMetrics = await flaskResponse.json();
    } catch (e) {
      throw new Error('Flask service returned invalid JSON. Possible server crash.');
    }

    if (calculatedMetrics.error) {
      throw new Error(calculatedMetrics.error);
    }

    let structuredRecommendations = [];

    try {
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

      structuredRecommendations = generatedRecommendationsText
        .split('\n')
        .map(line => line.replace(/^[*\-\s]+/, '').trim())
        .filter(Boolean);

    } catch (aiError) {
      console.warn('Gemini Pipeline down (503/Quota Spike). Falling back to rule-based analysis:', aiError.message);
      
      structuredRecommendations = [
        `Financial Health score is currently running stable at ${calculatedMetrics.healthScore}/100 based on active transaction burn cycles.`,
        calculatedMetrics.percentageSpentIncrease > 0 
          ? `Food expenses increased by ${calculatedMetrics.percentageSpentIncrease}% compared to the previous month. Consider optimizing micro-orders.`
          : "Your regular category spending trends map out cleanly inside standard limit boundaries.",
        calculatedMetrics.anomalies.length > 0
          ? `Warning: Detected ${calculatedMetrics.anomalies.length} irregular spike outflows exceeding standard baseline deviation limits.`
          : "No unusual transaction spike anomalies recognized across current ledger entries."
      ];
    }

    res.status(200).json({
      healthScore: calculatedMetrics.healthScore,
      anomalies: calculatedMetrics.anomalies,
      forecast: calculatedMetrics.forecast,
      trends: calculatedMetrics.trends,
      recommendations: structuredRecommendations
    });

  } catch (err) {
    console.error('Fatal Analytics Pipeline Fault:', err.message);
    res.status(500).json({ message: 'Failed to process financial metrics models pipelines.' });
  }
};