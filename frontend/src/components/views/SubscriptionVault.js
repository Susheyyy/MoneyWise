import React from 'react';

const SubscriptionVault = () => {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', color: '#364C4F', fontFamily: "'Oswald', sans-serif", fontWeight: '500' }}>RECURRING SYSTEM COMMITMENTS</h2>
        <p style={{ color: '#A7A7A7', fontSize: '0.9rem' }}>Monitor ongoing student plan cycles and service renewals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ background: '#F2F5F5', padding: '20px', borderRadius: '8px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎵</span>
            <span style={{ background: '#364C4F', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>STUDENT PLAN</span>
          </div>
          <h4 style={{ fontSize: '1.1rem', color: '#364C4F', fontWeight: '600' }}>Spotify Premium</h4>
          <p style={{ color: '#A7A7A7', fontSize: '0.8rem', marginTop: '4px' }}>Renews: June 15, 2026</p>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#364C4F', marginTop: '15px' }}>₹59 / mon</div>
        </div>

        <div style={{ background: '#F2F5F5', padding: '20px', borderRadius: '8px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontSize: '1.5rem' }}>🍿</span>
            <span style={{ background: 'rgba(54,76,79,0.1)', color: '#364C4F', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>SHARED SHARES</span>
          </div>
          <h4 style={{ fontSize: '1.1rem', color: '#364C4F', fontWeight: '600' }}>Netflix Mobile</h4>
          <p style={{ color: '#A7A7A7', fontSize: '0.8rem', marginTop: '4px' }}>Renews: June 28, 2026</p>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#364C4F', marginTop: '15px' }}>₹149 / mon</div>
        </div>

        <div style={{ border: '2px dashed #A7A7A7', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', minHeight: '160px' }}>
          <span style={{ fontSize: '1.5rem', color: '#364C4F' }}>+</span>
          <span style={{ fontSize: '0.85rem', color: '#A7A7A7', fontWeight: '600', marginTop: '5px' }}>Add Subscription</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionVault;