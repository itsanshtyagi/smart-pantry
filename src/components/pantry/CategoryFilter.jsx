import { CATEGORIES, CATEGORY_ICONS } from '../../utils/constants';

export default function CategoryFilter({ selected, onSelect }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
            ${selected === cat
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                        }`}
                >
                    {cat !== 'All' && <span>{CATEGORY_ICONS[cat] || '📦'}</span>}
                    {cat}
                </button>
            ))}
        </div>
    );
}
