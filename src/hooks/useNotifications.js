import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auto-cleanup: delete read notifications older than 48 hours
    const cleanupOldReadNotifications = async () => {
        if (!user) return;
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id)
            .eq('status', 'read')
            .lt('created_at', cutoff);
    };

    // Auto-cleanup: delete expiry_warning notifications where the item has expired + 1 day
    const cleanupExpiredWarnings = async () => {
        if (!user) return;
        // Get all expiry_warning notifications for this user
        const { data: warnings } = await supabase
            .from('notifications')
            .select('id, item_id')
            .eq('user_id', user.id)
            .eq('type', 'expiry_warning');

        if (!warnings || warnings.length === 0) return;

        // Get the linked pantry items to check their expiry dates
        const itemIds = [...new Set(warnings.map(w => w.item_id).filter(Boolean))];
        if (itemIds.length === 0) return;

        const { data: items } = await supabase
            .from('pantry_items')
            .select('id, expiry_date')
            .in('id', itemIds);

        if (!items) return;

        // Find items that expired more than 1 day ago
        const now = new Date();
        const expiredItemIds = items
            .filter(item => {
                const expiryDate = new Date(item.expiry_date);
                const daysSinceExpiry = (now - expiryDate) / (1000 * 60 * 60 * 24);
                return daysSinceExpiry > 1;
            })
            .map(item => item.id);

        if (expiredItemIds.length === 0) return;

        // Delete the expiry_warning notifications for those items
        const warningIdsToDelete = warnings
            .filter(w => expiredItemIds.includes(w.item_id))
            .map(w => w.id);

        if (warningIdsToDelete.length > 0) {
            await supabase
                .from('notifications')
                .delete()
                .in('id', warningIdsToDelete);
        }
    };

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);

        // Run cleanup before fetching
        await cleanupOldReadNotifications();
        await cleanupExpiredWarnings();

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) setNotifications(data);
        setLoading(false);
    };

    const markAsRead = async (id) => {
        const { error } = await supabase
            .from('notifications')
            .update({ status: 'read' })
            .eq('id', id);
        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, status: 'read' } : n)
            );
        }
    };

    const markAllAsRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ status: 'read' })
            .eq('user_id', user.id)
            .eq('status', 'unread');
        if (!error) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, status: 'read' }))
            );
        }
    };

    const deleteNotification = async (id) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const deleteAllNotifications = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id);
        if (!error) {
            setNotifications([]);
        }
    };

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    useEffect(() => { fetchNotifications(); }, [user]);

    return {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refetch: fetchNotifications,
    };
}
