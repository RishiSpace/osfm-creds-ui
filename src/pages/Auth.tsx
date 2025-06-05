import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Lock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadFromLocalStorage } from '../services/storage';
import { authenticateWebAuthnCredential } from '../utils/WebAuthn';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

const Auth: React.FC = () => {
  const { state, login, isInitialSetup } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [is2FAAttempted, setIs2FAAttempted] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  // 2FA-first login flow
  useEffect(() => {
    if (
      !isInitialSetup &&
      !showPasswordFallback &&
      !is2FAAttempted
    ) {
      const credentialIdB64 = localStorage.getItem('osfm-2fa-credentialId');
      if (credentialIdB64) {
        setIs2FAAttempted(true);
        (async () => {
          const credentialId = Uint8Array.from(atob(credentialIdB64), c => c.charCodeAt(0));
          const assertion = await authenticateWebAuthnCredential(credentialId.buffer);
          if (assertion) {
            // If 2FA succeeds, log in with a special flag (or you can use a dedicated 2FA login method)
            login('2fa-only');
            navigate('/');
          } else {
            setError('2FA authentication failed. Please enter your master password.');
            setShowPasswordFallback(true);
          }
        })();
      }
    }
  }, [isInitialSetup, showPasswordFallback, is2FAAttempted, login, navigate]);

  const handleLogin = async () => {
    try {
      loadFromLocalStorage(password);
      login(password);
      navigate('/');
    } catch (error) {
      setError('Invalid password');
    }
  };

  const handleSetup = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    login(password);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Key className="h-16 w-16 text-blue-600 dark:text-blue-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          OSFM Credentials Manager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          {isInitialSetup
            ? 'Create a master password to get started'
            : showPasswordFallback
              ? 'Enter your master password to unlock your credentials'
              : localStorage.getItem('osfm-2fa-credentialId')
                ? 'Authenticate with your device (2FA/Passkey/Biometrics)'
                : 'Enter your master password to unlock your credentials'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-4">
              <Alert
                variant="error"
                message={error}
                onClose={() => setError(null)}
              />
            </div>
          )}

          <div className="space-y-6">
            {isInitialSetup ? (
              <>
                <div>
                  <Input
                    label="Create Master Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    icon={<Lock className="h-5 w-5 text-gray-400" />}
                  />
                </div>

                <div>
                  <Input
                    label="Confirm Master Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    icon={<Lock className="h-5 w-5 text-gray-400" />}
                    error={
                      confirmPassword && password !== confirmPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your master password is used to encrypt all your credentials.
                        Make sure it's strong and unique. If you forget this password,
                        you will <span className="font-bold">not</span> be able to recover your data!
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Button
                    onClick={handleSetup}
                    disabled={!password || !confirmPassword || password !== confirmPassword}
                    fullWidth
                  >
                    Create Account
                  </Button>
                </div>
              </>
            ) : (
              <>
                {(showPasswordFallback || !localStorage.getItem('osfm-2fa-credentialId')) && (
                  <>
                    <div>
                      <Input
                        label="Master Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        icon={<Lock className="h-5 w-5 text-gray-400" />}
                      />
                    </div>

                    <div>
                      <Button
                        onClick={handleLogin}
                        disabled={!password}
                        fullWidth
                      >
                        Unlock
                      </Button>
                    </div>
                  </>
                )}
                {/* If 2FA is enabled and not fallback, show nothing (2FA handled by useEffect) */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;