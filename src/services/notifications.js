import { supabase } from './supabase';
import { getDaysUntilExpiry } from '../utils/dateUtils';

export async function checkAndCreateExpiryNotifications(userId, pantryItems) {
    // Items expiring within 2 days (warnings)
    const expiringItems = pantryItems.filter(item => {
        const days = getDaysUntilExpiry(item.expiry_date);
        return days <= 2 && days >= 0;
    });

    // Items already expired (up to 7 days ago, to avoid spamming very old items)
    const expiredItems = pantryItems.filter(item => {
        const days = getDaysUntilExpiry(item.expiry_date);
        return days < 0 && days >= -7;
    });

    const today = new Date().toISOString().split('T')[0];

    // Create expiry_warning notifications
    for (const item of expiringItems) {
        const days = getDaysUntilExpiry(item.expiry_date);
        const message = days === 0
            ? `🚨 ${item.item_name} expires TODAY!`
            : `⚠️ ${item.item_name} expires in ${days} day${days > 1 ? 's' : ''}.`;

        // Check if notification already exists for this item today
        const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', item.id)
            .eq('type', 'expiry_warning')
            .gte('created_at', today)
            .single();

        if (!existing) {
            await supabase.from('notifications').insert({
                user_id: userId,
                message,
                type: 'expiry_warning',
                item_id: item.id,
                status: 'unread',
            });
        }
    }

    // Create expired notifications
    for (const item of expiredItems) {
        const days = Math.abs(getDaysUntilExpiry(item.expiry_date));
        const message = days === 1
            ? `🗑️ ${item.item_name} expired yesterday.`
            : `🗑️ ${item.item_name} expired ${days} days ago.`;

        // Check if an expired notification already exists for this item today
        const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', item.id)
            .eq('type', 'expired')
            .gte('created_at', today)
            .single();

        if (!existing) {
            await supabase.from('notifications').insert({
                user_id: userId,
                message,
                type: 'expired',
                item_id: item.id,
                status: 'unread',
            });
        }
    }
}

// Delete all notifications linked to a specific pantry item
export async function deleteNotificationsByItemId(userId, itemId) {
    await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
}
