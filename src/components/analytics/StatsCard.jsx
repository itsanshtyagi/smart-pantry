export default function StatsCard({ icon, label, value, color = 'emerald', subtitle = '' }) {
    const colors = {
        emerald: 'from-emerald-400 to-green-500 shadow-emerald-200 dark:shadow-emerald-900/40',
        yellow: 'from-yellow-400 to-amber-500 shadow-yellow-200 dark:shadow-yellow-900/40',
        red: 'from-red-400 to-rose-500 shadow-red-200 dark:shadow-red-900/40',
        blue: 'from-blue-400 to-indigo-500 shadow-blue-200 dark:shadow-blue-900/40',
        purple: 'from-purple-400 to-violet-500 shadow-purple-200 dark:shadow-purple-900/40',
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    );
}
