import { supabase } from './supabase';
import { getDaysUntilExpiry } from '../utils/dateUtils';

export async function checkAndCreateExpiryNotifications(userId, pantryItems) {
    const toNotify = pantryItems.filter(item => {
        const days = getDaysUntilExpiry(item.expiry_date);
        return days <= 2 && days >= 0;
    });

    for (const item of toNotify) {
        const days = getDaysUntilExpiry(item.expiry_date);
        const message = days === 0
            ? `🚨 ${item.item_name} expires TODAY!`
            : `⚠️ ${item.item_name} expires in ${days} day${days > 1 ? 's' : ''}.`;

        // Check if notification already exists for this item today
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', item.id)
            .gte('created_at', today)
            .single();

        if (!existing) {
            await supabase.from('notifications').insert({
                user_id: userId,
                message,
                type: 'expiry',
                item_id: item.id,
                status: 'unread',
            });
        }
    }
}
