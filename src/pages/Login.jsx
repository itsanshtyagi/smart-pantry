import { supabase } from '../services/supabase';
import { Leaf } from 'lucide-react';

export default function Login() {
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) console.error('Login error:', error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-100/50 p-12 max-w-md w-full mx-4 border border-white/50">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Leaf className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">Smart Pantry</h1>
                <p className="text-gray-500 text-center mb-2">AI-Powered Food Management</p>
                <p className="text-sm text-gray-400 text-center mb-8">Reduce waste. Eat smart. Live better.</p>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 
                     rounded-xl py-3.5 px-6 font-semibold text-gray-700 hover:bg-gray-50 
                     hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50
                     transition-all duration-300 group"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="group-hover:text-emerald-700 transition-colors">Continue with Google</span>
                </button>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        By signing in, you agree to our Terms of Service
                    </p>
                </div>

                {/* Feature highlights */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                        { icon: '📷', label: 'Barcode Scan' },
                        { icon: '🤖', label: 'AI Recipes' },
                        { icon: '📊', label: 'Analytics' },
                    ].map(feat => (
                        <div key={feat.label} className="text-center p-3 rounded-xl bg-gray-50/50">
                            <div className="text-xl mb-1">{feat.icon}</div>
                            <div className="text-xs text-gray-500 font-medium">{feat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
