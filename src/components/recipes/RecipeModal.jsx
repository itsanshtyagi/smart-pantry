import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Clock, Users, ChefHat, Flame } from 'lucide-react';

export default function RecipeModal({ recipe, isOpen, onClose }) {
    if (!recipe) return null;

    const difficultyColor = {
        Easy: 'success',
        Medium: 'warning',
        Hard: 'danger',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={recipe.name} size="2xl">
            <div className="space-y-6">
                <p className="text-gray-600">{recipe.description}</p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-emerald-500" />
                        {recipe.cooking_time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-emerald-500" />
                        {recipe.servings} servings
                    </div>
                    <Badge variant={difficultyColor[recipe.difficulty] || 'default'}>
                        {recipe.difficulty}
                    </Badge>
                </div>

                {/* Expiring items */}
                {recipe.expiring_used?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                            <Flame size={16} />
                            Prioritized Expiring Items
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recipe.expiring_used.map((item, i) => (
                                <Badge key={i} variant="warning">{item}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ingredients */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <ChefHat size={16} />
                        Ingredients
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {recipe.ingredients?.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ing.using_from_pantry ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className="text-gray-700">{ing.amount} {ing.name}</span>
                                {ing.using_from_pantry && (
                                    <Badge variant="success">pantry</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Steps */}
                {recipe.steps && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Instructions</h3>
                        <ol className="space-y-3">
                            {recipe.steps.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600">
                                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span className="pt-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </Modal>
    );
}
