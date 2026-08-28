import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJoinGroupViaLinkMutation } from '../../features/groups/groupApi';
import { getErrorMessage } from '../../utils/errorHandler';

const JoinGroupLanding = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [joinGroup, { isLoading }] = useJoinGroupViaLinkMutation();
  const [status, setStatus] = useState({ type: 'loading', message: 'Validating your group invitation...' });

  useEffect(() => {
    const executeJoin = async () => {
      try {
        const response = await joinGroup(token).unwrap();
        setStatus({ type: 'success', message: response.message || 'Successfully joined the group workspace!' });
        setTimeout(() => {
          navigate('/roommate-matrix'); 
        }, 2000);
      } catch (err) {
        setStatus({ 
          type: 'error', 
          message: getErrorMessage(err, 'This invite link is invalid, broken, or has expired.') 
        });
      }
    };
    executeJoin();
  }, [token, joinGroup, navigate]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #E3ECEC', width: '400px', textAlign: 'center', boxShadow: '0 8px 24px rgba(30,51,54,0.06)' }}>
        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.5rem', color: '#1E3336', textTransform: 'uppercase' }}>
          {status.type === 'success' ? '🎉 Welcome aboard' : status.type === 'error' ? '✕ Link Refused' : '⏳ Syncing Matrix'}
        </h3>
        <p style={{ color: '#364C4F', fontSize: '0.9rem', marginTop: '12px', lineHeight: '1.5' }}>{status.message}</p>
        
        {status.type === 'error' && (
          <button 
            onClick={() => navigate('/')} 
            style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#1E3336', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinGroupLanding;