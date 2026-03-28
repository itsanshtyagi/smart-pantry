import { usePantry } from '../hooks/usePantry';
import WasteChart from '../components/analytics/WasteChart';
import StatsCard from '../components/analytics/StatsCard';
import Spinner from '../components/ui/Spinner';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function Analytics() {
    const { items, loading } = usePantry();

    const fresh = items.filter(i => i.status === 'fresh').length;
    const expiring = items.filter(i => i.status === 'expiring_soon').length;
    const expired = items.filter(i => i.status === 'expired').length;

    // Category breakdown
    const categoryMap = {};
    items.forEach(item => {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

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
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    Analytics
                </h1>
                <p className="text-gray-500 mt-2">Track your food consumption and waste patterns.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard icon="✅" label="Fresh Items" value={fresh} color="emerald" />
                <StatsCard icon="⚠️" label="Expiring Soon" value={expiring} color="yellow" />
                <StatsCard icon="🗑️" label="Expired / Wasted" value={expired} color="red" />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Status Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Pantry Status</h2>
                    <WasteChart fresh={fresh} expiring={expiring} expired={expired} />
                </div>

                {/* Category Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Items by Category</h2>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={120} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No data to display
                        </div>
                    )}
                </div>
            </div>

            {/* Insights */}
            {items.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <h2 className="text-lg font-bold text-emerald-800 mb-3">💡 Insights</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/60 rounded-xl p-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-emerald-700">
                                    {items.length > 0 ? ((fresh / items.length) * 100).toFixed(0) : 0}%
                                </span> of your items are still fresh
                            </p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4">
                            <p className="text-sm text-gray-600">
                                Most stocked category:{' '}
                                <span className="font-semibold text-emerald-700">
                                    {categoryData[0]?.category || 'N/A'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
