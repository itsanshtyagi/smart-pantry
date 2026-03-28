import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES, UNITS } from '../utils/constants';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { Plus, ShoppingCart, Trash2, Check, X } from 'lucide-react';

export default function GroceryPlanner() {
    const { user } = useAuthStore();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ item_name: '', quantity: 1, unit: 'units', category: 'Other' });

    const fetchItems = async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase
            .from('grocery_list')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setItems(data);
        setLoading(false);
    };

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.item_name.trim()) return;
        const { data } = await supabase
            .from('grocery_list')
            .insert([{ ...newItem, user_id: user.id }])
            .select()
            .single();
        if (data) setItems(prev => [data, ...prev]);
        setNewItem({ item_name: '', quantity: 1, unit: 'units', category: 'Other' });
        setShowForm(false);
    };

    const togglePurchased = async (id, current) => {
        const { data } = await supabase
            .from('grocery_list')
            .update({ is_purchased: !current })
            .eq('id', id)
            .select()
            .single();
        if (data) setItems(prev => prev.map(i => i.id === id ? data : i));
    };

    const deleteItem = async (id) => {
        await supabase.from('grocery_list').delete().eq('id', id);
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearPurchased = async () => {
        const purchased = items.filter(i => i.is_purchased);
        for (const item of purchased) {
            await supabase.from('grocery_list').delete().eq('id', item.id);
        }
        setItems(prev => prev.filter(i => !i.is_purchased));
    };

    useEffect(() => { fetchItems(); }, [user]);

    const unpurchased = items.filter(i => !i.is_purchased);
    const purchased = items.filter(i => i.is_purchased);

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
                            <ShoppingCart size={20} className="text-white" />
                        </div>
                        Grocery List
                    </h1>
                    <p className="text-gray-500 mt-1">{unpurchased.length} items to buy</p>
                </div>
                <div className="flex gap-3">
                    {purchased.length > 0 && (
                        <Button variant="ghost" onClick={clearPurchased} size="sm">
                            <Trash2 size={16} />
                            Clear Purchased
                        </Button>
                    )}
                    <Button onClick={() => setShowForm(true)} size="sm">
                        <Plus size={16} />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={addItem} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Item name"
                                value={newItem.item_name}
                                onChange={(e) => setNewItem(prev => ({ ...prev, item_name: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                                min="1"
                                className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400"
                            />
                            <select
                                value={newItem.unit}
                                onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400"
                            >
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" className="flex-1">Add</Button>
                            <button type="button" onClick={() => setShowForm(false)} className="p-2.5 rounded-xl hover:bg-gray-100">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Items List */}
            {unpurchased.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">To Buy</h2>
                    {unpurchased.map(item => (
                        <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 hover:shadow-sm transition-all group">
                            <button
                                onClick={() => togglePurchased(item.id, item.is_purchased)}
                                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-emerald-500 flex items-center justify-center transition-colors flex-shrink-0"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-gray-800">{item.item_name}</span>
                                <span className="text-sm text-gray-400 ml-2">{item.quantity} {item.unit}</span>
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {purchased.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Purchased</h2>
                    {purchased.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3 group">
                            <button
                                onClick={() => togglePurchased(item.id, item.is_purchased)}
                                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                            >
                                <Check size={14} className="text-white" />
                            </button>
                            <div className="flex-1">
                                <span className="font-medium text-gray-400 line-through">{item.item_name}</span>
                                <span className="text-sm text-gray-300 ml-2">{item.quantity} {item.unit}</span>
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {items.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your grocery list is empty</h3>
                    <p className="text-gray-500 mb-6">Add items you need to buy at the store.</p>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        Add First Item
                    </Button>
                </div>
            )}
        </div>
    );
}
