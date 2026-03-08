import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function LoginPage() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
  } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0f14] text-gray-200 grid place-items-center">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  const signup = () =>
    login({ authorizationParams: { screen_hint: 'signup' } });

  return (
    <div className="min-h-screen bg-[#0c0f14] text-gray-200 grid place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#10131a] p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-2">Welcome to UrbanFlow</h1>
        <p className="text-sm text-gray-400 mb-6">
          Log in to submit reports and personalize your experience.
        </p>

        {error && (
          <p className="text-sm text-red-400 mb-4">
            Error: {error.message}
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={signup}
            className="w-full py-2.5 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 transition-colors"
          >
            Sign up
          </button>
          <button
            onClick={() => login()}
            className="w-full py-2.5 rounded-md text-sm font-medium text-gray-200 bg-white/[0.08] hover:bg-white/[0.12] transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
