import React from 'react';

const RoommateSplitter = () => {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', color: '#364C4F', fontFamily: "'Oswald', sans-serif", fontWeight: '500' }}>ROOMMATE BILL MATRIX</h2>
        <p style={{ color: '#A7A7A7', fontSize: '0.9rem' }}>Track communal hosteling cost pools, flat shares, and balances</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ background: '#F2F5F5', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ color: '#364C4F', fontWeight: '500' }}>Active Pool Balance Sheets</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#fff', borderRadius: '6px' }}>
              <span style={{ color: '#364C4F' }}>Aman Sharma (Flat D)</span>
              <span style={{ color: '#364C4F', fontWeight: '600' }}>Owes You ₹1,420</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#fff', borderRadius: '6px' }}>
              <span style={{ color: '#364C4F' }}>Rohan Verma</span>
              <span style={{ color: '#A7A7A7', fontWeight: '600' }}>You Owe ₹450</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#F2F5F5', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ color: '#364C4F', fontWeight: '500' }}>Log Shared Outing Expenses</h3>
          <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#A7A7A7', marginBottom: '5px' }}>Bill Title</label>
              <input type="text" placeholder="e.g., Wi-Fi Setup / Food Joint" style={{ width: '100%', padding: '12px', border: '1px solid #A7A7A7', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#A7A7A7', marginBottom: '5px' }}>Gross Amount Pool (₹)</label>
              <input type="number" placeholder="0.00" style={{ width: '100%', padding: '12px', border: '1px solid #A7A7A7', borderRadius: '4px' }} />
            </div>
            <button type="submit" style={{ background: '#364C4F', color: '#fff', border: 'none', padding: '14px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>COMPUTE SPLIT</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoommateSplitter;