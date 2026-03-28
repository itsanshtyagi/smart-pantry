import { differenceInDays, parseISO } from 'date-fns';

export function getDaysUntilExpiry(expiryDate) {
    const date = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    return differenceInDays(date, new Date());
}

export function getExpiryStatus(expiryDate) {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'expired';
    if (days <= 3) return 'expiring_soon';
    return 'fresh';
}

export const STATUS_COLORS = {
    fresh: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
        dot: 'bg-green-500',
        label: 'Fresh',
        gradient: 'from-green-400 to-emerald-500',
    },
    expiring_soon: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        dot: 'bg-yellow-500',
        label: 'Expiring Soon',
        gradient: 'from-yellow-400 to-amber-500',
    },
    expired: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
        dot: 'bg-red-500',
        label: 'Expired',
        gradient: 'from-red-400 to-rose-500',
    },
};

export function formatExpiryLabel(daysLeft) {
    if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)}d ago`;
    if (daysLeft === 0) return 'Expires today!';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days left`;
}
