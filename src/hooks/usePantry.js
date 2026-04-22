import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { getDaysUntilExpiry, getExpiryStatus } from '../utils/dateUtils';
import { checkAndCreateExpiryNotifications, deleteNotificationsByItemId } from '../services/notifications';

export function usePantry() {
    const { user } = useAuthStore();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const enrichItem = (item) => ({
        ...item,
        daysLeft: getDaysUntilExpiry(item.expiry_date),
        status: getExpiryStatus(item.expiry_date),
    });

    const fetchItems = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('pantry_items')
            .select('*')
            .eq('user_id', user.id)
            .order('expiry_date', { ascending: true });

        if (!error && data) {
            const enrichedItems = data.map(enrichItem);
            setItems(enrichedItems);

            // Trigger expiry notification checks after loading items
            checkAndCreateExpiryNotifications(user.id, enrichedItems).catch(console.error);
        }
        setLoading(false);
    };

    const addItem = async (item) => {
        const { data, error } = await supabase
            .from('pantry_items')
            .insert([{ ...item, user_id: user.id }])
            .select()
            .single();
        if (!error) setItems(prev => [...prev, enrichItem(data)]);
        return { data, error };
    };

    const updateItem = async (id, updates) => {
        const { data, error } = await supabase
            .from('pantry_items')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (!error) setItems(prev => prev.map(i => i.id === id ? enrichItem(data) : i));
        return { data, error };
    };

    const deleteItem = async (id) => {
        const { error } = await supabase.from('pantry_items').delete().eq('id', id);
        if (!error) {
            setItems(prev => prev.filter(i => i.id !== id));
            // Auto-dismiss any notifications linked to this item
            deleteNotificationsByItemId(user.id, id).catch(console.error);
        }
        return { error };
    };

    useEffect(() => { fetchItems(); }, [user]);

    return { items, loading, addItem, updateItem, deleteItem, refetch: fetchItems };
}
