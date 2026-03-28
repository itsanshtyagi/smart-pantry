import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
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

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    useEffect(() => { fetchNotifications(); }, [user]);

    return {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
    };
}
