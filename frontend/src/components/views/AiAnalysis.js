import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const AiAnalysis = () => {
  const { theme, colors } = useTheme();
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    healthScore: 100,
    anomalies: [],
    forecast: 0,
    trends: {},
    recommendations: []
  });

  const uiColors = {
    tealDark: colors.textDark,
    border: colors.border,
    white: colors.white,
    accentGreen: colors.green,
    textMuted: colors.textMuted,
    redText: colors.red,
    bgLight: colors.bgLight
  };

  useEffect(() => {
    let barInstance = null;
    let lineInstance = null;

    const fetchServerAnalyticsPipeline = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const response = await axios.get('http://localhost:5000/api/analytics/ai-insights', config);
        const data = response.data;

        setMetrics(data);
        setLoading(false);

        if (barChartRef.current) {
          const ctx = barChartRef.current.getContext('2d');
          barInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: Object.keys(data.trends).length > 0 ? Object.keys(data.trends) : ['Shopping', 'Food', 'Transport'],
              datasets: [{
                data: Object.keys(data.trends).length > 0 ? Object.values(data.trends) : [0, 0, 0],
                backgroundColor: ['#1D9E75', '#364C4F', '#EF9F27', '#534AB7', '#E24B4A'],
                borderRadius: 6
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
          });
        }

        if (lineChartRef.current) {
          const ctx = lineChartRef.current.getContext('2d');
          lineInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['May 2026', 'Jun 2026 (Live)', 'Jul 2026 (AI Forecast)'],
              datasets: [{
                data: [data.forecast * 0.9, data.forecast * 0.95, data.forecast],
                borderColor: '#1D9E75',
                backgroundColor: 'rgba(29, 158, 117, 0.04)',
                fill: true,
                tension: 0.2
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
          });
        }

      } catch (err) {
        console.error('Error tracking view pipeline analytics sync:', err);
        setLoading(false);
      }
    };

    fetchServerAnalyticsPipeline();

    return () => {
      if (barInstance) barInstance.destroy();
      if (lineInstance) lineInstance.destroy();
    };
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: uiColors.tealDark, fontWeight: 600 }}>Executing data frame calculations vector routines...</div>;
  }

  return (
    <div style={{ background: colors.background, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', flex: 1, minHeight: '100%' }}>
      
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', letterSpacing: '0.8px', borderLeft: '3px solid #1D9E75', paddingLeft: '12px', marginBottom: '4px' }}>AI Predictive Engine</h3>
        <div style={{ fontSize: '12px', color: uiColors.textMuted }}>NumPy, Pandas, and Gemini API analytical tracking loop output context</div>
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
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>Next-Cycle Predicted Spending</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.4rem', fontWeight: 600, color: uiColors.tealDark, marginTop: '8px' }}>
            ₹{metrics.forecast.toLocaleString('en-IN')}
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
          <canvas ref={barChartRef} />
        </div>
        <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', height: '280px', position: 'relative' }}>
          <canvas ref={lineChartRef} />
        </div>
      </div>

      <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '24px', background: uiColors.bgLight }}>
        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Gemini AI Context Insights</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {metrics.recommendations.map((rec, i) => (
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