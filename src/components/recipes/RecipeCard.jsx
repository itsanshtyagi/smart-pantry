import { useState } from 'react';
import { Clock, Users, ChefHat, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RecipeCard({ recipe }) {
    const [expanded, setExpanded] = useState(false);

    const difficultyColor = {
        Easy: 'success',
        Medium: 'warning',
        Hard: 'danger',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5">
                <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
                <p className="text-emerald-100 text-sm mt-1">{recipe.description}</p>
            </div>

            <div className="p-5">
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock size={15} className="text-gray-400" />
                        {recipe.cooking_time}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users size={15} className="text-gray-400" />
                        {recipe.servings} servings
                    </div>
                    <Badge variant={difficultyColor[recipe.difficulty] || 'default'}>
                        {recipe.difficulty}
                    </Badge>
                </div>

                {/* Expiring items used */}
                {recipe.expiring_used && recipe.expiring_used.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 mb-1">
                            <Flame size={14} />
                            Uses expiring items:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {recipe.expiring_used.map((item, i) => (
                                <Badge key={i} variant="warning">{item}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ingredients */}
                <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                        <ChefHat size={15} />
                        Ingredients ({recipe.ingredients?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                        {recipe.ingredients?.slice(0, expanded ? undefined : 4).map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ing.using_from_pantry ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span>{ing.amount} {ing.name}</span>
                                {ing.using_from_pantry && (
                                    <span className="text-xs text-emerald-600 font-medium">(from pantry)</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expand/Collapse */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                    {expanded ? (
                        <><ChevronUp size={16} /> Show Less</>
                    ) : (
                        <><ChevronDown size={16} /> View Steps & More</>
                    )}
                </button>

                {/* Steps (expandable) */}
                {expanded && recipe.steps && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Steps</h4>
                        <ol className="space-y-2">
                            {recipe.steps.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
