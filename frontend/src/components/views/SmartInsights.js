import React from 'react';
import { useGetIntelligenceStatsQuery } from '../../features/transactions/transactionApi';

const SmartInsights = () => {
  
  const { data: intelligence, isLoading, error } = useGetIntelligenceStatsQuery();

  if (isLoading) {
    return (
      <div style={{ background: '#F0FAF6', borderRadius: '12px', padding: '16px', border: '1px solid #9FE1CB' }}>
        <span style={{ fontSize: '12px', color: '#0F6E56', fontWeight: 500 }}>Syncing intelligence vectors...</span>
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <div style={{ background: '#FAFCFC', borderRadius: '12px', padding: '16px', border: '1px solid #E0E8E8' }}>
        <span style={{ fontSize: '12px', color: '#9BB5B8' }}>No actionable insights compiled for this ledger cycle.</span>
      </div>
    );
  }

  
  const hasAnomalies = intelligence.anomalies && intelligence.anomalies.length > 0;
  const primaryRecommendation = intelligence.recommendations?.[0] || "Review transaction burn rates to establish optimized category limit paths.";

  return (
    <div style={{ background: '#E1F5EE', borderRadius: '12px', padding: '16px', border: '1px solid #9FE1CB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0F6E56' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#085041', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Smart Intelligence Dashboard
          </span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F6E56', background: '#FFFFFF', padding: '2px 8px', borderRadius: '10px' }}>
          Score: {intelligence.healthScore}/100
        </span>
      </div>

      <div style={{ fontSize: '12px', color: '#085041', lineHeight: '1.5', fontWeight: 500 }}>
        {}
        "{primaryRecommendation}"
      </div>

      {hasAnomalies && (
        <div style={{ background: 'rgba(163, 45, 45, 0.05)', borderLeft: '3px solid #A32D2D', padding: '8px 12px', borderRadius: '4px', marginTop: '4px' }}>
          <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#A32D2D', textTransform: 'uppercase' }}>
            Anomaly Alert Detected by Engine
          </span>
          <span style={{ fontSize: '11px', color: '#1E3336' }}>
            Spike spotted in "{intelligence.anomalies[0].description}" allocation row values.
          </span>
        </div>
      )}

    </div>
  );
};

export default SmartInsights;