const Transaction = require('../models/Transaction');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function getMetrics(user) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const transactions = await Transaction.find({ user, date: { $gte: start, $lte: now } })
    .select('date description amount type category -_id')
    .populate('category', 'name')
    .lean();
  const response = await fetch(`${process.env.FLASK_URL || 'http://127.0.0.1:5001'}/api/intelligence/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify(transactions.map(transaction => ({
      ...transaction,
      category: transaction.category?.name || 'Uncategorized',
    }))),
  });

  if (!response.ok) throw new Error(`Analytics service returned ${response.status}.`);
  const metrics = await response.json();
  if (metrics.error) throw new Error(metrics.error);
  return metrics;
}

function suggestions(metrics) {
  const result = [];
  if (metrics.percentageSpentIncrease > 0) {
    result.push(`Food spending is up ${metrics.percentageSpentIncrease}% compared with last month.`);
  }
  if (metrics.anomalies.length) {
    result.push(`Review ${metrics.anomalies.length} unusually large expenses in the last six months.`);
  }
  if (metrics.forecast != null) {
    result.push('Compare the next-month forecast with your monthly budget.');
  }
  return result.length ? result : ['Add expenses across several months to see spending trends.'];
}

exports.generateIntelligenceMetrics = async (req, res) => {
  try {
    const metrics = await getMetrics(req.user.id);
    res.json({
      healthScore: metrics.healthScore,
      anomalies: metrics.anomalies,
      forecast: metrics.forecast,
      trends: metrics.trends,
      recommendations: suggestions(metrics),
      aiAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL),
    });
  } catch (err) {
    console.error('Analytics service failed:', err.message);
    res.status(503).json({ message: 'Spending analysis is temporarily unavailable.' });
  }
};

exports.generateRecommendations = async (req, res) => {
  const { GEMINI_API_KEY, GEMINI_MODEL } = process.env;
  if (!GEMINI_API_KEY || !GEMINI_MODEL) {
    return res.status(503).json({ message: 'AI recommendations are unavailable.' });
  }
  try {
    const metrics = await getMetrics(req.user.id);
    const aggregate = {
      forecast: metrics.forecast,
      healthScore: metrics.healthScore,
      unusualExpenseCount: metrics.anomalies.length,
      foodSpendingIncreasePercent: metrics.percentageSpentIncrease,
    };
    const model = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(
      `Suggest up to three brief budgeting actions based on these aggregate metrics: ${JSON.stringify(aggregate)}`,
      { timeout: 8000 }
    );
    const recommendations = result.response.text().split('\n').map(line => line.replace(/^[*\-\s]+/, '').trim()).filter(Boolean);
    res.json({ recommendations: recommendations.slice(0, 3) });
  } catch (err) {
    console.error('AI recommendations failed:', err.message);
    res.status(503).json({ message: 'AI recommendations are temporarily unavailable.' });
  }
};
