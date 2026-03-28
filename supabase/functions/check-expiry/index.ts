import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
    try {
        // Get all pantry items expiring within 2 days
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        const { data: items, error } = await supabase
            .from('pantry_items')
            .select('id, user_id, item_name, expiry_date')
            .lte('expiry_date', twoDaysFromNow.toISOString().split('T')[0])
            .gte('expiry_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        const today = new Date().toISOString().split('T')[0];
        let created = 0;

        for (const item of items || []) {
            // Check if notification already exists today
            const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('user_id', item.user_id)
                .eq('item_id', item.id)
                .gte('created_at', today)
                .single();

            if (!existing) {
                const daysLeft = Math.ceil(
                    (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );

                const message = daysLeft <= 0
                    ? `🚨 ${item.item_name} expires TODAY!`
                    : `⚠️ ${item.item_name} expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;

                await supabase.from('notifications').insert({
                    user_id: item.user_id,
                    message,
                    type: 'expiry',
                    item_id: item.id,
                    status: 'unread',
                });
                created++;
            }
        }

        return new Response(
            JSON.stringify({ success: true, notifications_created: created }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
