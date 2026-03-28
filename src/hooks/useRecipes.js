import { useState } from 'react';
import { generateRecipes } from '../services/openai';
import { useAuthStore } from '../store/authStore';

export function useRecipes() {
    const { user } = useAuthStore();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generate = async (pantryItems, dietPref = 'all') => {
        if (!user || pantryItems.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const result = await generateRecipes(pantryItems, user.id, dietPref);
            setRecipes(result);
        } catch (err) {
            setError('Failed to generate recipes. Please try again.');
            console.error('Recipe generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { recipes, loading, error, generate };
}
