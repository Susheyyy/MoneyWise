import React from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useGetAiRecommendationsMutation, useGetIntelligenceStatsQuery, useGetMonthlySummaryQuery } from '../../features/transactions/transactionApi';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(...registerables);

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

const AiAnalysis = () => {
  const { colors } = useTheme();
  const { data: metrics, isLoading, isError, refetch } = useGetIntelligenceStatsQuery();
  const [getRecommendations, ai] = useGetAiRecommendationsMutation();
  const { data: monthlySummary, isLoading: historyLoading, isError: historyError } = useGetMonthlySummaryQuery();

  const uiColors = {
    tealDark: colors.textDark,
    border: colors.border,
    white: colors.white,
    accentGreen: colors.green,
    textMuted: colors.textMuted,
    redText: colors.red,
    bgLight: colors.bgLight
  };

  if (isLoading) return <p style={{ padding: '32px' }}>Loading analysis…</p>;
  if (isError || !metrics) {
    return <div role="alert" style={{ padding: '32px' }}>Analysis is unavailable. <button onClick={refetch}>Try again</button></div>;
  }

  const monthlyExpenses = new Map();
  for (const { _id: { year, month, type }, total } of monthlySummary || []) {
    const key = year * 12 + month - 1;
    monthlyExpenses.set(key, (monthlyExpenses.get(key) || 0) + (type === 'expense' ? total : 0));
  }
  const months = Array.from(monthlyExpenses.keys()).sort((a, b) => a - b);
  const history = months.length
    ? Array.from({ length: months[months.length - 1] - months[0] + 1 }, (_, index) => months[0] + index)
    : [];
  const trends = Object.entries(metrics.trends);
  const barData = {
    labels: trends.map(([name]) => name),
    datasets: [{
      data: trends.map(([, total]) => total),
      backgroundColor: colors.tealPrimary,
      borderRadius: 6
    }]
  };
  const lineData = {
    labels: history.map(month => monthFormat.format(new Date(Date.UTC(Math.floor(month / 12), month % 12, 1)))),
    datasets: [{
      label: 'Recorded expenses',
      data: history.map(month => monthlyExpenses.get(month) || 0),
      borderColor: colors.tealPrimary,
      tension: 0.2
    }]
  };

  return (
    <div style={{ background: colors.background, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', flex: 1, minHeight: '100%' }}>
      
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', letterSpacing: '0.8px', borderLeft: '3px solid #1D9E75', paddingLeft: '12px', marginBottom: '4px' }}>AI Predictive Engine</h3>
        <div style={{ fontSize: '12px', color: uiColors.textMuted }}>Spending history, trends, and a forecast based on up to three completed months.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', background: uiColors.bgLight }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>Financial Health Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.4rem', fontWeight: 600, color: uiColors.tealDark }}>{metrics.healthScore}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: uiColors.accentGreen }}>/ 100</span>
          </div>
        </div>

        <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', background: uiColors.bgLight }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>Next-month spending forecast</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.4rem', fontWeight: 600, color: uiColors.tealDark, marginTop: '8px' }}>
            {metrics.forecast == null ? 'Insufficient history' : `₹${metrics.forecast.toLocaleString('en-IN')}`}
          </div>
        </div>

        <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', background: uiColors.bgLight }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>Spike Anomalies Recognized</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.4rem', fontWeight: 600, color: metrics.anomalies.length > 0 ? uiColors.redText : uiColors.tealDark, marginTop: '8px' }}>
            {metrics.anomalies.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', height: '280px', position: 'relative' }}>
          {trends.length ? <Bar data={barData} options={chartOptions} /> : <p>No recorded expenses by category.</p>}
        </div>
        <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', height: '280px', position: 'relative' }}>
          {historyLoading && <p>Loading spending history…</p>}
          {historyError && <p>Spending history is unavailable.</p>}
          {!historyLoading && !historyError && (
            history.length ? <Line data={lineData} options={chartOptions} /> : <p>No spending history yet.</p>
          )}
        </div>
      </div>

      <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '24px', background: uiColors.bgLight }}>
        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Budgeting suggestions</span>
        {metrics.aiAvailable && (
          <button type="button" disabled={ai.isLoading} onClick={() => getRecommendations()}>
            {ai.isLoading ? 'Generating…' : 'Generate AI suggestions'}
          </button>
        )}
        {ai.isError && <p role="status">AI suggestions are temporarily unavailable.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(ai.data?.recommendations?.length ? ai.data.recommendations : metrics.recommendations).map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: uiColors.tealDark, lineHeight: '1.4' }}>
              <div style={{ marginTop: '5px', width: '6px', height: '6px', borderRadius: '50%', background: uiColors.accentGreen, flexShrink: 0 }} />
              <div>{rec}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AiAnalysis;
