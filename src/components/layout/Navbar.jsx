import { Bell, Menu, Search, Sun, Moon } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
    const { unreadCount } = useNotifications();
    const { isDark, toggle } = useTheme();

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Menu size={22} className="text-gray-600 dark:text-gray-300" />
                    </button>

                    <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 w-80 transition-colors duration-300">
                        <Search size={18} className="text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search pantry items..."
                            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 w-full placeholder-gray-400 dark:placeholder-gray-600"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggle}
                        id="dark-mode-toggle"
                        aria-label="Toggle dark mode"
                        className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <div className="relative w-5 h-5">
                            <Sun
                                size={20}
                                className={`absolute inset-0 text-amber-500 transition-all duration-300 ${
                                    isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                                }`}
                            />
                            <Moon
                                size={20}
                                className={`absolute inset-0 text-gray-600 dark:text-gray-300 transition-all duration-300 ${
                                    isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                                }`}
                            />
                        </div>
                    </button>

                    {/* Notifications */}
                    <Link
                        to="/notifications"
                        className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
