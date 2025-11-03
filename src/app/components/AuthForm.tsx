import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../system/supabase/client';
import { useUserStore } from '../../system/store/userStore';
import { useFeedback } from '../../hooks/useFeedback';
import GlassCard from '../../ui/cards/GlassCard';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import TwinForgeLogo from '../../ui/components/branding/TwinForgeLogo';
import logger from '../../lib/utils/logger';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSession, fetchProfile } = useUserStore();
  const { formSubmit, error: errorSound, click, success } = useFeedback();
  const navigate = useNavigate();
  const { mode } = usePerformanceMode();

  // Performance-aware styles
  const authCardStyles = useMemo(() => {
    const isHighPerf = mode === 'high-performance';
    const isBalanced = mode === 'balanced';

    return {
      // Blur: 32px → 8px → 0px selon le mode
      backdropFilter: isHighPerf ? 'none' : isBalanced ? 'blur(8px) saturate(140%)' : 'blur(32px) saturate(180%)',
      // Gradients: simplifiés en high-perf, complets en quality
      background: isHighPerf
        ? 'rgba(255, 255, 255, 0.08)'
        : isBalanced
        ? `
            radial-gradient(circle at 30% 20%, rgba(255, 107, 53, 0.12) 0%, transparent 60%),
            rgba(255, 255, 255, 0.07)
          `
        : `
            radial-gradient(circle at 30% 20%, rgba(255, 107, 53, 0.14) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(253, 200, 48, 0.10) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(247, 147, 30, 0.08) 0%, transparent 70%),
            rgba(255, 255, 255, 0.06)
          `,
      // Shadows: 6 ombres → 3 ombres → 1 ombre
      boxShadow: isHighPerf
        ? '0 16px 48px rgba(0, 0, 0, 0.4)'
        : isBalanced
        ? `
            0 20px 56px rgba(0, 0, 0, 0.45),
            0 0 32px rgba(255, 107, 53, 0.20),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `
        : `
            0 24px 64px rgba(0, 0, 0, 0.5),
            0 0 48px rgba(255, 107, 53, 0.25),
            0 0 96px rgba(253, 200, 48, 0.15),
            0 0 120px rgba(247, 147, 30, 0.10),
            inset 0 2px 0 rgba(255, 255, 255, 0.25),
            inset 0 -2px 0 rgba(0, 0, 0, 0.15)
          `,
      borderColor: isHighPerf
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 107, 53, 0.35)',
    };
  }, [mode]);

  const buttonBackdropFilter = useMemo(() => {
    return mode === 'high-performance' ? 'none' : mode === 'balanced' ? 'blur(12px) saturate(140%)' : 'blur(20px) saturate(160%)';
  }, [mode]);

  const errorCardBackdrop = useMemo(() => {
    return mode === 'high-performance' ? 'none' : mode === 'balanced' ? 'blur(8px) saturate(120%)' : 'blur(12px) saturate(130%)';
  }, [mode]);

  const animationDuration = useMemo(() => {
    return mode === 'high-performance' ? 0.3 : mode === 'balanced' ? 0.5 : 0.8;
  }, [mode]);

  const shouldAnimate = mode !== 'high-performance';

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    
    click();

    try {
      logger.info('AUTH', 'Starting Google OAuth flow', {
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }

      logger.info('AUTH', 'Google OAuth redirect initiated', {
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('AUTH', 'Google authentication error', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
      errorSound();
      setError(error.message || 'Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    formSubmit();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          logger.info('AUTH', 'User signed up successfully', { userId: data.session.user.id });
          setSession(data.session);
          await fetchProfile();
          success();
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
          
          onSuccess?.();
        } else {
          setError('Veuillez vérifier votre email (pensez à vérifier vos spams) pour confirmer votre compte');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        logger.info('AUTH', 'User signed in successfully', { userId: data.session.user.id });
        setSession(data.session);
        await fetchProfile();
        success();
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
        
        onSuccess?.();
      }
    } catch (error: any) {
      logger.error('AUTH', 'Authentication error', { error: error.message });
      errorSound();
      setError(error.message || 'Erreur lors de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    click();
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-twinforge-visionos relative overflow-hidden"
      style={{
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate',
        background: `
          radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(253, 200, 48, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(247, 147, 30, 0.06) 0%, transparent 60%),
          linear-gradient(180deg, #0B0E17 0%, #0F1219 50%, #0B0E17 100%)
        `
      }}
    >
      {/* Particules désactivées - maintenant gérées par BackgroundManager */}

      {/* Conteneur Principal - Centré */}
      <div
        className="w-full max-w-md mx-auto px-4 auth-form-wrapper"
        style={{
          position: 'relative',
          zIndex: 100,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          pointerEvents: 'auto'
        }}
      >
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 30, scale: 0.95 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: animationDuration,
            ease: "easeOut"
          }}
          style={{
            position: 'relative',
            zIndex: 101,
            isolation: 'isolate',
            transform: 'translateZ(0)',
            pointerEvents: 'auto'
          }}
        >
          <GlassCard
            className="p-6 relative w-full auth-form-card"
            style={{
              position: 'relative',
              zIndex: 102,
              isolation: 'isolate',
              transform: 'translateZ(0)',
              pointerEvents: 'auto',
              ...authCardStyles
            }}
          >
            {/* Logo TwinForge */}
            <motion.div
              className="flex flex-col items-center justify-center mb-6"
              initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animationDuration * 0.75, delay: shouldAnimate ? 0.15 : 0 }}
              style={{
                position: 'relative',
                zIndex: 103,
                pointerEvents: 'auto'
              }}
            >
              {/* Texte TWINFORGE */}
              <motion.div
                initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: animationDuration * 0.875, delay: shouldAnimate ? 0.2 : 0, ease: "easeOut" }}
                style={{
                  filter: mode === 'quality' ? 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.4)) drop-shadow(0 0 12px rgba(253, 200, 48, 0.3))' : 'drop-shadow(0 0 12px rgba(255, 107, 53, 0.35))',
                  transform: 'scale(1.3)'
                }}
              >
                <TwinForgeLogo variant="desktop" isHovered={false} />
              </motion.div>
            </motion.div>

            <div style={{ position: 'relative', zIndex: 103, pointerEvents: 'auto' }}>
              <h1 className="text-xl font-bold text-white mb-2 text-center">
                {isSignUp ? 'Créez votre Forgerie' : 'Connexion à la Forgerie'}
              </h1>
              <p className="text-white/70 text-sm text-center mb-4">
                {isSignUp ? 'Entrez dans la Forge' : 'Accédez à votre Forge'}
              </p>
            </div>

            {/* Formulaire */}
            <form 
              onSubmit={handleSubmit} 
              className="auth-form-interactive"
              style={{
                position: 'relative',
                zIndex: 104,
                isolation: 'isolate',
                transform: 'translateZ(0)',
                pointerEvents: 'auto'
              }}
            >
              <motion.div
                initial={shouldAnimate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: animationDuration * 0.75, delay: shouldAnimate ? 0.3 : 0 }}
                style={{
                  position: 'relative',
                  zIndex: 105,
                  pointerEvents: 'auto'
                }}
              >
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="displayName"
                      className="mb-4"
                      initial={shouldAnimate ? { opacity: 0, height: 0, y: -10 } : false}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={shouldAnimate ? { opacity: 0, height: 0, y: -10 } : undefined}
                      transition={{ duration: animationDuration * 0.375 }}
                      style={{
                        position: 'relative',
                        zIndex: 106,
                        pointerEvents: 'auto'
                      }}
                    >
                      <label htmlFor="displayName" className="block text-white/90 text-sm font-medium mb-1">
                        Nom d'affichage
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="glass-input w-full auth-input"
                        placeholder="Votre nom dans la forge"
                        required={isSignUp}
                        style={{
                          position: 'relative',
                          zIndex: 107,
                          pointerEvents: 'auto',
                          cursor: 'text',
                          userSelect: 'auto',
                          WebkitUserSelect: 'auto'
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                  className="mb-4"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto'
                  }}
                >
                  <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-1">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full auth-input"
                    placeholder="votre@email.com"
                    required
                    style={{
                      position: 'relative',
                      zIndex: 107,
                      pointerEvents: 'auto',
                      cursor: 'text',
                      userSelect: 'auto',
                      WebkitUserSelect: 'auto'
                    }}
                  />
                </div>

                <div 
                  className="mb-4"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto'
                  }}
                >
                  <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-1">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full auth-input"
                    placeholder="Votre mot de passe sécurisé"
                    required
                    minLength={6}
                    style={{
                      position: 'relative',
                      zIndex: 107,
                      pointerEvents: 'auto',
                      cursor: 'text',
                      userSelect: 'auto',
                      WebkitUserSelect: 'auto'
                    }}
                  />
                </div>

                {/* Message d'Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mb-4"
                      initial={shouldAnimate ? { opacity: 0, y: -10, scale: 0.95 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={shouldAnimate ? { opacity: 0, y: -10, scale: 0.95 } : undefined}
                      transition={{ duration: animationDuration * 0.375 }}
                      style={{
                        position: 'relative',
                        zIndex: 106,
                        pointerEvents: 'auto'
                      }}
                    >
                      <GlassCard
                        className="p-3"
                        style={{
                          background: 'rgba(255, 152, 67, 0.12)',
                          borderColor: 'rgba(255, 152, 67, 0.30)',
                          backdropFilter: errorCardBackdrop,
                          boxShadow: mode === 'high-performance' ? '0 0 12px rgba(255, 152, 67, 0.20)' : '0 0 20px rgba(255, 152, 67, 0.25)',
                          position: 'relative',
                          zIndex: 107,
                          pointerEvents: 'auto'
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <SpatialIcon
                            Icon={ICONS.AlertTriangle}
                            size={14}
                            className="mt-0.5"
                            style={{ color: '#FFB366' }}
                          />
                          <p className="text-sm leading-relaxed" style={{ color: '#FFD9B3' }}>{error}</p>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton Principal */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full auth-submit-button mb-4"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    background: `
                      linear-gradient(135deg,
                        rgba(255, 107, 53, 0.95),
                        rgba(247, 147, 30, 0.90),
                        rgba(253, 200, 48, 0.85)
                      )
                    `,
                    backdropFilter: buttonBackdropFilter,
                    boxShadow: mode === 'high-performance'
                      ? '0 8px 24px rgba(255, 107, 53, 0.35), inset 0 2px 0 rgba(255,255,255,0.3)'
                      : mode === 'balanced'
                      ? `
                          0 10px 32px rgba(255, 107, 53, 0.40),
                          0 0 48px rgba(253, 200, 48, 0.25),
                          inset 0 2px 0 rgba(255,255,255,0.35)
                        `
                      : `
                          0 12px 40px rgba(255, 107, 53, 0.45),
                          0 0 60px rgba(247, 147, 30, 0.35),
                          0 0 100px rgba(253, 200, 48, 0.25),
                          inset 0 3px 0 rgba(255,255,255,0.4)
                        `,
                    border: '2px solid rgba(255, 107, 53, 0.60)',
                    borderRadius: '999px',
                    padding: '0.75rem 1.5rem',
                    minHeight: '48px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !googleLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    {loading ? (
                      <SpatialIcon 
                        Icon={ICONS.Loader2} 
                        size={18} 
                        className="text-white animate-spin"
                      />
                    ) : (
                      <SpatialIcon 
                        Icon={isSignUp ? ICONS.UserPlus : ICONS.LogIn} 
                        size={18} 
                        className="text-white"
                      />
                    )}
                    <span>
                      {loading || googleLoading ? 'Forge en cours...' : (isSignUp ? 'Créer ma Forge' : 'Accéder à ma Forge')}
                    </span>
                  </div>
                </button>

                {/* Séparateur */}
                <div 
                  className="flex items-center gap-4 my-4"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto'
                  }}
                >
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-white/50 text-sm">ou</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                {/* Bouton Google Auth */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading || loading}
                  className="w-full auth-google-button mb-4"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    background: `
                      linear-gradient(135deg,
                        rgba(255, 255, 255, 0.95),
                        rgba(248, 250, 252, 0.9)
                      )
                    `,
                    backdropFilter: buttonBackdropFilter,
                    boxShadow: mode === 'high-performance'
                      ? '0 6px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
                      : mode === 'balanced'
                      ? '0 7px 28px rgba(0, 0, 0, 0.135), 0 0 32px rgba(255, 255, 255, 0.08), inset 0 1.5px 0 rgba(255,255,255,0.75)'
                      : `
                          0 8px 32px rgba(0, 0, 0, 0.15),
                          0 0 40px rgba(255, 255, 255, 0.1),
                          inset 0 2px 0 rgba(255,255,255,0.8)
                        `,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '999px',
                    padding: '0.75rem 1.5rem',
                    minHeight: '48px',
                    color: '#1f2937',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !googleLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    {googleLoading ? (
                      <SpatialIcon 
                        Icon={ICONS.Loader2} 
                        size={18} 
                        style={{ color: '#1f2937' }}
                        className="animate-spin"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    <span>
                      {googleLoading ? 'Redirection...' : 
                       isSignUp ? 'Créer un compte avec Google' : 'Se connecter avec Google'}
                    </span>
                  </div>
                </button>

                {/* Bouton Apple Auth */}
                <button
                  type="button"
                  onClick={() => {
                    click();
                    alert('Connexion avec Apple - Fonctionnalité en cours de configuration');
                  }}
                  disabled={googleLoading || loading}
                  className="w-full auth-apple-button mb-4"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    background: `
                      linear-gradient(135deg,
                        rgba(0, 0, 0, 0.95),
                        rgba(20, 20, 20, 0.90)
                      )
                    `,
                    backdropFilter: buttonBackdropFilter,
                    boxShadow: mode === 'high-performance'
                      ? '0 6px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
                      : mode === 'balanced'
                      ? '0 7px 28px rgba(0, 0, 0, 0.45), 0 0 32px rgba(255, 255, 255, 0.05), inset 0 1.5px 0 rgba(255,255,255,0.18)'
                      : `
                          0 8px 32px rgba(0, 0, 0, 0.5),
                          0 0 40px rgba(255, 255, 255, 0.08),
                          inset 0 2px 0 rgba(255,255,255,0.2)
                        `,
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '999px',
                    padding: '0.75rem 1.5rem',
                    minHeight: '48px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !googleLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span>
                      {isSignUp ? 'Créer un compte avec Apple' : 'Se connecter avec Apple'}
                    </span>
                  </div>
                </button>

                {/* Bascule de Mode */}
                <div 
                  className="text-center"
                  style={{
                    position: 'relative',
                    zIndex: 106,
                    pointerEvents: 'auto'
                  }}
                >
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    disabled={loading || googleLoading}
                    className="text-white/70 hover:text-white text-sm transition-colors auth-toggle-button"
                    style={{
                      position: 'relative',
                      zIndex: 107,
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: '0.5rem'
                    }}
                  >
                    {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
                  </button>
                </div>
              </motion.div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};