import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { Bell, Check, CheckCheck, Trash2, BellOff, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
    expiry_warning: {
        label: 'Expiring Soon',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: '⚠️',
    },
    expired: {
        label: 'Expired',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🗑️',
    },
    // Fallback for old 'expiry' type notifications
    expiry: {
        label: 'Expiry',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: '⚠️',
    },
};

export default function Notifications() {
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Bell size={20} className="text-white" />
                        </div>
                        Notifications
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button variant="secondary" onClick={markAllAsRead} size="sm">
                            <CheckCheck size={16} />
                            Mark All Read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={deleteAllNotifications}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                            <XCircle size={16} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            {notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map(notification => {
                        const config = typeConfig[notification.type] || typeConfig.expiry;
                        return (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-2xl p-5 border transition-all duration-300 hover:shadow-md
                    ${notification.status === 'unread'
                                        ? `${config.borderColor} ${config.bgColor}/30 shadow-sm`
                                        : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {notification.status === 'unread' && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            )}
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
                                                <span>{config.icon}</span>
                                                {config.label}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 font-medium">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {notification.status === 'unread' && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BellOff size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up! We'll notify you when items are expiring.</p>
                </div>
            )}
        </div>
    );
}
