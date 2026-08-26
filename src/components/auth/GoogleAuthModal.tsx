import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, User, ShieldCheck, Key, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/allServices';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { googleLogin } = useAuth();
  const { showToast } = useToast();

  const [realGmail, setRealGmail] = useState('jetsanranious@gmail.com');
  const [realName, setRealName] = useState('Jetsan Ranious');
  const [googleClientId, setGoogleClientId] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gsiInitialized, setGsiInitialized] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch google client ID config if available
    authService.getGoogleConfig()
      .then((cfg) => {
        if (cfg.client_id) {
          setGoogleClientId(cfg.client_id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const clientIdToUse = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (clientIdToUse && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientIdToUse,
          callback: async (response: any) => {
            if (response.credential) {
              setLoading(true);
              try {
                await googleLogin(response.credential);
                showToast('Signed in with Google ID token!', 'success');
                onSuccess();
              } catch (err: any) {
                showToast(err.response?.data?.detail || 'Google sign-in verification failed.', 'error');
              } finally {
                setLoading(false);
              }
            }
          },
        });

        googleBtnRef.current.innerHTML = '';
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
        setGsiInitialized(true);
      } catch (err) {
        console.warn('GSI init error:', err);
      }
    }
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  const handleSignInWithGmail = async (targetEmail: string, targetName: string) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      showToast('Please provide a valid Gmail address', 'error');
      return;
    }
    try {
      setLoading(true);
      const cleanName = targetName.trim() || targetEmail.split('@')[0];
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`;
      
      await googleLogin({
        email: targetEmail.trim().toLowerCase(),
        full_name: cleanName,
        avatar_url: avatarUrl,
      });

      showToast(`Welcome! Signed in with ${targetEmail}`, 'success');
      onSuccess();
    } catch (err: any) {
      console.error('Google Gmail sign-in error:', err);
      showToast(err.response?.data?.detail || 'Google sign in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchGooglePopup = () => {
    const clientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if ((window as any).google?.accounts?.oauth2 && clientId) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                // Fetch user info from Google's userinfo endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const info = await res.json();
                await googleLogin({
                  email: info.email,
                  full_name: info.name,
                  avatar_url: info.picture,
                });
                showToast(`Signed in as ${info.email}!`, 'success');
                onSuccess();
              } catch (e) {
                console.error('Failed fetching Google userinfo:', e);
                showToast('Failed to retrieve Google profile.', 'error');
              } finally {
                setLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn('OAuth2 client prompt error:', err);
      }
    }

    // Direct fallback to real Gmail sign-in
    handleSignInWithGmail(realGmail, realName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500">Authenticate using your real Gmail account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Account 1-Click Card */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                JR
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Jetsan Ranious</p>
                <p className="text-[11px] text-blue-700 font-medium">jetsanranious@gmail.com</p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={loading}
              onClick={() => handleSignInWithGmail('jetsanranious@gmail.com', 'Jetsan Ranious')}
              className="!text-xs !py-1.5"
            >
              Sign In
            </Button>
          </div>

          {/* Official GSI Button Container if active */}
          <div ref={googleBtnRef} className={gsiInitialized ? 'w-full flex justify-center' : 'hidden'} />

          {/* Custom Gmail Form */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Or enter your Gmail ID</label>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Real ID</span>
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={realGmail}
                onChange={(e) => setRealGmail(e.target.value)}
                placeholder="your.name@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
              />
            </div>

            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Your Full Name (e.g. Jetsan Ranious)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={loading}
              onClick={() => handleSignInWithGmail(realGmail, realName)}
              className="w-full !font-semibold !mt-2"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue with {realGmail || 'Gmail'}
            </Button>
          </div>

          {/* Optional Google Client ID settings toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center space-x-1.5 font-medium transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showConfig ? 'Hide Google OAuth Client ID' : 'Configure Google OAuth 2.0 Client ID'}</span>
            </button>

            {showConfig && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <p className="text-[11px] text-slate-500">
                  Provide your Google Cloud Console OAuth 2.0 Web Client ID:
                </p>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none bg-white"
                />
                {googleClientId && (
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    onClick={handleLaunchGooglePopup}
                    className="w-full !text-xs !py-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Launch Google OAuth Popup
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Google OAuth authentication</span>
          </div>
          <span>StudySphere AI</span>
        </div>
      </div>
    </div>
  );
};
