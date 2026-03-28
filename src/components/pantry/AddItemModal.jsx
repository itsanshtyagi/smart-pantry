import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CATEGORIES, UNITS } from '../../utils/constants';
import { Camera } from 'lucide-react';

export default function AddItemModal({ isOpen, onClose, onSubmit, initialData = null, onOpenScanner }) {
    const [formData, setFormData] = useState(initialData || {
        item_name: '',
        category: 'Other',
        quantity: 1,
        unit: 'units',
        expiry_date: '',
        barcode: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.item_name || !formData.expiry_date) return;
        setSubmitting(true);
        await onSubmit(formData);
        setSubmitting(false);
        onClose();
        setFormData({
            item_name: '',
            category: 'Other',
            quantity: 1,
            unit: 'units',
            expiry_date: '',
            barcode: '',
            notes: '',
        });
    };

    const inputClasses = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm';
    const labelClasses = 'block text-sm font-semibold text-gray-700 mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Item' : 'Add Pantry Item'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Barcode scanner button */}
                {!initialData && onOpenScanner && (
                    <button
                        type="button"
                        onClick={onOpenScanner}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors font-medium text-sm"
                    >
                        <Camera size={20} />
                        Scan Barcode to Auto-Fill
                    </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Item Name *</label>
                        <input
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            placeholder="e.g., Whole Milk"
                            className={inputClasses}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Expiry Date *</label>
                        <input
                            type="date"
                            name="expiry_date"
                            value={formData.expiry_date}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0.1"
                            step="0.1"
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Unit</label>
                        <select name="unit" value={formData.unit} onChange={handleChange} className={inputClasses}>
                            {UNITS.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClasses}>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional notes..."
                            rows={2}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={submitting || !formData.item_name || !formData.expiry_date}>
                        {submitting ? 'Saving...' : (initialData ? 'Update Item' : 'Add Item')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
