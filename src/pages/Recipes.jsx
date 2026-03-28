import { useState } from 'react';
import { usePantry } from '../hooks/usePantry';
import { generateRecipes } from '../services/openai';
import { useAuthStore } from '../store/authStore';
import RecipeCard from '../components/recipes/RecipeCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { Sparkles, ChefHat, AlertTriangle } from 'lucide-react';

export default function Recipes() {
    const { items } = usePantry();
    const { user } = useAuthStore();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (items.length === 0 || !user) return;
        setLoading(true);
        setError(null);
        try {
            const result = await generateRecipes(items, user.id);
            setRecipes(result);
        } catch (err) {
            setError('Failed to generate recipes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const expiringSoon = items.filter(i => i.status === 'expiring_soon');

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                        <ChefHat size={20} className="text-white" />
                    </div>
                    AI Recipe Suggestions
                </h1>
                <p className="text-gray-500 mt-2">Smart recipes based on what's in your pantry.</p>
            </div>

            {/* Expiring items notice */}
            {expiringSoon.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            You have <strong>{expiringSoon.length} items expiring soon</strong>
                        </p>
                        <p className="text-sm text-amber-600 mt-1">AI will prioritize these in recipe suggestions.</p>
                    </div>
                </div>
            )}

            {/* Generate button */}
            <Button
                onClick={handleGenerate}
                disabled={loading || items.length === 0}
                size="lg"
            >
                {loading ? (
                    <><Spinner size="sm" className="border-white border-t-transparent" /> Generating...</>
                ) : (
                    <><Sparkles size={20} /> Generate Recipes</>
                )}
            </Button>

            {items.length === 0 && (
                <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-500">
                    ℹ️ Add some items to your pantry first to generate recipes.
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
                    {error}
                </div>
            )}

            {/* Recipe Grid */}
            {recipes.length > 0 && (
                <div className="grid md:grid-cols-2 gap-5">
                    {recipes.map((recipe, i) => (
                        <RecipeCard key={i} recipe={recipe} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {recipes.length === 0 && !loading && (
                <div className="text-center py-16">
                    <div className="text-7xl mb-4">🍽️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No recipes yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Click "Generate Recipes" to get AI-powered recipe suggestions based on your pantry items.
                    </p>
                </div>
            )}
        </div>
    );
}
