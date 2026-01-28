import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { googleLogin } from '../store/slices/authSlice';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

const GoogleSignInButton = ({ onSuccess, onError, className = '' }: GoogleSignInButtonProps) => {
  const dispatch = useAppDispatch();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Google Identity Services
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonRef.current.offsetWidth || 300,
          });
        }
      }
    };

    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      await dispatch(googleLogin(response.credential)).unwrap();
      onSuccess?.();
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomButtonClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Invisible Google button for proper functionality */}
      <div
        ref={buttonRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />

      {/* Custom styled button */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={isLoading}
        className="w-full h-10 border border-border/50 bg-card hover:bg-card/80 text-foreground font-medium rounded-[9px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
            Signing in...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </div>
        )}
      </button>
    </div>
  );
};

export default GoogleSignInButton;