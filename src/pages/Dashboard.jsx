import { usePantry } from '../hooks/usePantry';
import { useNotifications } from '../hooks/useNotifications';
import { formatExpiryLabel } from '../utils/dateUtils';
import { Link } from 'react-router-dom';
import StatsCard from '../components/analytics/StatsCard';
import Spinner from '../components/ui/Spinner';
import { Plus, ChefHat, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const { items, loading } = usePantry();
    const { unreadCount } = useNotifications();

    const expiringSoon = items.filter(i => i.status === 'expiring_soon');
    const expired = items.filter(i => i.status === 'expired');
    const fresh = items.filter(i => i.status === 'fresh');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's your pantry overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon="📦" label="Total Items" value={items.length} color="blue" />
                <StatsCard icon="✅" label="Fresh" value={fresh.length} color="emerald" />
                <StatsCard icon="⚠️" label="Expiring Soon" value={expiringSoon.length} color="yellow" />
                <StatsCard icon="🚨" label="Expired" value={expired.length} color="red" />
            </div>

            {/* Notification banner */}
            {unreadCount > 0 && (
                <Link to="/notifications" className="block">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white flex items-center justify-between hover:shadow-lg hover:shadow-blue-200 transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">🔔</div>
                            <div>
                                <p className="font-semibold">You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                                <p className="text-sm text-blue-100">Tap to view details</p>
                            </div>
                        </div>
                        <span className="text-2xl">→</span>
                    </div>
                </Link>
            )}

            {/* Expiring Soon Alert */}
            {expiringSoon.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-amber-600" size={22} />
                        <h2 className="text-lg font-bold text-amber-800">Expiring Soon</h2>
                    </div>
                    <div className="grid gap-2">
                        {expiringSoon.slice(0, 5).map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-white rounded-xl p-3 shadow-sm border border-amber-100">
                                <span className="font-medium text-gray-800">{item.item_name}</span>
                                <span className="text-sm text-amber-700 font-semibold bg-amber-100 px-3 py-1 rounded-full">
                                    {formatExpiryLabel(item.daysLeft)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link to="/recipes" className="mt-4 inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-semibold transition-colors">
                        <ChefHat size={16} />
                        Get recipes using these items →
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Add Item', icon: <Plus size={24} />, to: '/pantry', color: 'from-emerald-400 to-green-500' },
                        { label: 'AI Recipes', icon: <ChefHat size={24} />, to: '/recipes', color: 'from-purple-400 to-violet-500' },
                        { label: 'Grocery List', icon: <ShoppingCart size={24} />, to: '/grocery', color: 'from-blue-400 to-indigo-500' },
                        { label: 'Analytics', icon: <TrendingUp size={24} />, to: '/analytics', color: 'from-orange-400 to-amber-500' },
                    ].map(action => (
                        <Link key={action.label} to={action.to}
                            className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                                {action.icon}
                            </div>
                            <span className="font-semibold text-gray-700 text-sm">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🥦</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your pantry is empty</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first item!</p>
                    <Link to="/pantry" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                        <Plus size={20} />
                        Add Your First Item
                    </Link>
                </div>
            )}
        </div>
    );
}
