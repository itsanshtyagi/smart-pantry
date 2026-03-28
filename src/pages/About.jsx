import { Leaf, Heart, Zap, Shield, BarChart3, Camera } from 'lucide-react';

const features = [
    { icon: <Camera size={24} />, title: 'Barcode Scanner', desc: 'Scan product barcodes to auto-fill item details using Open Food Facts.' },
    { icon: <Zap size={24} />, title: 'AI-Powered Recipes', desc: 'Get recipe suggestions from GPT-4o-mini based on your pantry items.' },
    { icon: <Shield size={24} />, title: 'Expiry Tracking', desc: 'Color-coded status indicators and notifications for expiring items.' },
    { icon: <BarChart3 size={24} />, title: 'Analytics', desc: 'Track food waste patterns and optimize your consumption habits.' },
];

export default function About() {
    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-200 mb-6">
                    <Leaf className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Smart Pantry</h1>
                <p className="text-lg text-gray-500 max-w-lg mx-auto">
                    An AI-powered food management system that helps you reduce waste, eat smarter, and live better.
                </p>
                <p className="text-sm text-gray-400 mt-2">Version 1.0.0</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {features.map(f => (
                    <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">{f.icon}</div>
                        <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-500">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 text-center border border-emerald-100">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Tech Stack</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {['React', 'Vite', 'Supabase', 'TailwindCSS', 'OpenAI', 'Recharts', 'Zustand'].map(tech => (
                        <span key={tech} className="bg-white px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            <div className="text-center py-4 text-sm text-gray-400">
                <p className="flex items-center justify-center gap-1">Built with <Heart size={14} className="text-red-400" /> for a better planet</p>
                <p className="mt-1">Smart Pantry © {new Date().getFullYear()}</p>
            </div>
        </div>
    );
}
