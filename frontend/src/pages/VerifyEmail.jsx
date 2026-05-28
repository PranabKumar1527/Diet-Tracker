import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('waiting');
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/goals'), 3000);
      })
      .catch(() => {
        setStatus('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">

        {status === 'waiting' && (
          <>
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400">We sent a verification link to your email. Click it to verify your account.</p>
          </>
        )}

        {status === 'verifying' && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white">Verifying...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Email Verified!</h2>
            <p className="text-gray-400">Redirecting you to set up your goals...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-4">The link may have expired. Please register again.</p>
            <button onClick={() => navigate('/')}
              className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-400 transition-all">
              Back to Register
            </button>
          </>
        )}

      </div>
    </div>
  );
}