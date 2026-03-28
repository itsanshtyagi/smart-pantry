import { Bell, Menu, Search } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
    const { unreadCount } = useNotifications();

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <Menu size={22} className="text-gray-600" />
                    </button>

                    <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-80">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search pantry items..."
                            className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/notifications"
                        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <Bell size={20} className="text-gray-600" />
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
