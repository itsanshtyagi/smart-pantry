import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
    const { user, setUser } = useAuthStore();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, [setUser]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return { user, signOut };
}
