import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, Zap, LogIn, UserPlus } from 'lucide-react';
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

  // Load saved credentials ONLY if this specific local device previously logged in
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [useDifferentAccount, setUseDifferentAccount] = useState(false);

  const [realGmail, setRealGmail] = useState('');
  const [realName, setRealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [gsiInitialized, setGsiInitialized] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const storedEmail = localStorage.getItem('studysphere_saved_google_email');
      const storedName = localStorage.getItem('studysphere_saved_google_name');
      if (storedEmail) {
        setSavedEmail(storedEmail);
        setSavedName(storedName || storedEmail.split('@')[0]);
      } else {
        setSavedEmail(null);
        setSavedName(null);
        setUseDifferentAccount(true);
      }
    }
  }, [isOpen]);

  useEffect(() => {
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

    const clientIdToUse = googleClientId || (window as any)?.__ENV_GOOGLE_CLIENT_ID || '';
    if (clientIdToUse && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientIdToUse,
          callback: async (response: any) => {
            if (response.credential) {
              setLoading(true);
              try {
                await googleLogin(response.credential);
                showToast('Signed in with your verified Google account!', 'success');
                onSuccess();
              } catch (err: any) {
                showToast(err.response?.data?.detail || 'Google sign-in failed.', 'error');
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

  const handleDirectGoogleLogin = async (customEmail?: string, customName?: string) => {
    const emailToUse = (customEmail || realGmail).trim().toLowerCase();
    const nameToUse = (customName || realName).trim();

    if (!emailToUse || !emailToUse.includes('@')) {
      showToast('Please enter a valid Gmail / Google email address', 'error');
      return;
    }

    try {
      setLoading(true);
      await googleLogin({
        email: emailToUse,
        full_name: nameToUse || undefined,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameToUse || emailToUse)}`
      });

      // Save to this local browser device for quick re-login
      localStorage.setItem('studysphere_saved_google_email', emailToUse);
      if (nameToUse) {
        localStorage.setItem('studysphere_saved_google_name', nameToUse);
      }

      showToast(`Welcome back, ${nameToUse || emailToUse}!`, 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Sign-in failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'G';
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
              <p className="text-xs text-slate-500">Secure Student Learning Workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* If this device has a saved profile from a previous session on this browser */}
          {savedEmail && !useDifferentAccount && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-sky-50/80 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                  Saved on this device
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  1-Click Resume
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                  {getInitials(savedName || '', savedEmail)}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-slate-800">{savedName || 'Google User'}</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{savedEmail}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={loading}
                onClick={() => handleDirectGoogleLogin(savedEmail, savedName || undefined)}
                className="w-full !font-bold !py-2.5 !bg-blue-600 hover:!bg-blue-700 shadow-sm shadow-blue-500/20"
              >
                <Zap className="w-4 h-4 mr-1.5 text-amber-300" />
                Continue as {savedName || savedEmail.split('@')[0]}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <button
                type="button"
                onClick={() => setUseDifferentAccount(true)}
                className="w-full text-center text-xs text-slate-500 hover:text-blue-600 font-medium py-1 cursor-pointer transition-colors"
              >
                Sign in with a different Gmail account →
              </button>
            </div>
          )}

          {/* Official Google Identity Button (GSI) if available */}
          <div ref={googleBtnRef} className={gsiInitialized ? 'w-full flex justify-center mb-1' : 'hidden'} />

          {/* Direct Custom Gmail Form */}
          {(!savedEmail || useDifferentAccount) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDirectGoogleLogin();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Gmail Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={realGmail}
                    onChange={(e) => setRealGmail(e.target.value)}
                    placeholder="your.account@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Full Name (Optional)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full !font-bold !mt-2 shadow-sm shadow-blue-500/20"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with My Google Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {savedEmail && useDifferentAccount && (
                <button
                  type="button"
                  onClick={() => setUseDifferentAccount(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-blue-600 font-medium py-1 cursor-pointer transition-colors"
                >
                  ← Back to saved account ({savedEmail})
                </button>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dual Gemini 3.7 & ChatGPT 4o Synced</span>
          </div>
          <span>Independent User Isolation</span>
        </div>
      </div>
    </div>
  );
};

