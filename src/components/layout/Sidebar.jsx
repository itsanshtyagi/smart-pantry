import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import {
    LayoutDashboard, UtensilsCrossed, ChefHat, Bell, BarChart3,
    ShoppingCart, User, Info, LogOut, X, Leaf
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pantry', label: 'My Pantry', icon: UtensilsCrossed },
    { to: '/recipes', label: 'AI Recipes', icon: ChefHat },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/grocery', label: 'Grocery List', icon: ShoppingCart },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/about', label: 'About', icon: Info },
];

export default function Sidebar({ isOpen, onClose }) {
    const { user, signOut } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}

            <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-xl lg:shadow-none
      `}>
                {/* Logo */}
                <div className="px-6 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">Smart Pantry</h1>
                                <p className="text-xs text-gray-400">AI Food Manager</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`
                            }
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            <span className="flex-1">{label}</span>
                            {label === 'Notifications' && unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar"
                                className="w-10 h-10 rounded-full border-2 border-emerald-200" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <User size={20} className="text-emerald-600" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {user?.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
