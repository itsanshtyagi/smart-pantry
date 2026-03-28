import { useState } from 'react';
import { usePantry } from '../hooks/usePantry';
import { usePantryStore } from '../store/pantryStore';
import PantryCard from '../components/pantry/PantryCard';
import AddItemModal from '../components/pantry/AddItemModal';
import BarcodeScanner from '../components/pantry/BarcodeScanner';
import CategoryFilter from '../components/pantry/CategoryFilter';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { getSortFunction } from '../utils/sortUtils';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

export default function Pantry() {
    const { items, loading, addItem, updateItem, deleteItem } = usePantry();
    const { selectedCategory, searchQuery, sortBy, setSelectedCategory, setSearchQuery, setSortBy } = usePantryStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);

    // Filter & sort
    const filtered = items
        .filter(item => {
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch = !searchQuery || item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort(getSortFunction(sortBy));

    const handleAddSubmit = async (formData) => {
        await addItem(formData);
        setScannedProduct(null);
    };

    const handleEditSubmit = async (formData) => {
        if (editingItem) {
            await updateItem(editingItem.id, formData);
            setEditingItem(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this item from your pantry?')) {
            await deleteItem(id);
        }
    };

    const handleProductScanned = (product) => {
        setScannedProduct(product);
        setShowScanner(false);
        setShowAddModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Pantry</h1>
                    <p className="text-gray-500 mt-1">{items.length} items tracked</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="expiry">Sort by Expiry</option>
                        <option value="name">Sort by Name</option>
                        <option value="category">Sort by Category</option>
                        <option value="date_added">Sort by Date Added</option>
                    </select>
                </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

            {/* Items Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <PantryCard
                            key={item.id}
                            item={item}
                            onEdit={(item) => {
                                setEditingItem(item);
                            }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {searchQuery || selectedCategory !== 'All' ? 'No matching items' : 'Your pantry is empty'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery || selectedCategory !== 'All'
                            ? 'Try adjusting your filters'
                            : 'Add your first item to get started!'}
                    </p>
                    {!searchQuery && selectedCategory === 'All' && (
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus size={18} />
                            Add Your First Item
                        </Button>
                    )}
                </div>
            )}

            {/* Add Item Modal */}
            <AddItemModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setScannedProduct(null); }}
                onSubmit={handleAddSubmit}
                initialData={scannedProduct}
                onOpenScanner={() => { setShowAddModal(false); setShowScanner(true); }}
            />

            {/* Edit Item Modal */}
            {editingItem && (
                <AddItemModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onSubmit={handleEditSubmit}
                    initialData={editingItem}
                />
            )}

            {/* Barcode Scanner */}
            {showScanner && (
                <BarcodeScanner
                    onProductFound={handleProductScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
