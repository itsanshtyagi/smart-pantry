import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { getDaysUntilExpiry, getExpiryStatus } from '../utils/dateUtils';

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
            setItems(data.map(enrichItem));
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
        if (!error) setItems(prev => prev.filter(i => i.id !== id));
        return { error };
    };

    useEffect(() => { fetchItems(); }, [user]);

    return { items, loading, addItem, updateItem, deleteItem, refetch: fetchItems };
}
