import { STATUS_COLORS, formatExpiryLabel } from '../../utils/dateUtils';
import { CATEGORY_ICONS } from '../../utils/constants';
import { Trash2, Edit3, Clock } from 'lucide-react';
import Badge from '../ui/Badge';

export default function PantryCard({ item, onEdit, onDelete }) {
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.fresh;
    const icon = CATEGORY_ICONS[item.category] || '📦';

    return (
        <div className={`bg-white rounded-2xl border ${status.border} p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}>
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${status.gradient}`} />

            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{item.item_name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={item.status === 'fresh' ? 'success' : item.status === 'expiring_soon' ? 'warning' : 'danger'}>
                                {status.label}
                            </Badge>
                            <span className="text-xs text-gray-400">
                                {item.quantity} {item.unit}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Expiry info */}
            <div className={`flex items-center gap-1.5 mt-3 text-sm ${status.text} font-medium`}>
                <Clock size={14} />
                <span>{formatExpiryLabel(item.daysLeft)}</span>
            </div>

            {item.notes && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.notes}</p>
            )}
        </div>
    );
}
