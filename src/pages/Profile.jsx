import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { DIET_PREFERENCES } from '../utils/constants';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { User, Mail, Save, Leaf } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!user) return;
        (async () => {
            const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
            if (data) setProfile(data);
            setLoading(false);
        })();
    }, [user]);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        await supabase.from('users').update({ name: profile.name, diet_pref: profile.diet_pref }).eq('id', user.id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-500 mt-1">Manage your account settings</p>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-center text-white">
                {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-24 h-24 rounded-full mx-auto border-4 border-white/30 shadow-xl" />
                ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-white/20 flex items-center justify-center"><User size={40} /></div>
                )}
                <h2 className="text-xl font-bold mt-4">{profile?.name || 'User'}</h2>
                <p className="text-emerald-100 text-sm">{user?.email}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</label>
                    <input type="text" value={profile?.name || ''} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diet Preference</label>
                    <select value={profile?.diet_pref || 'all'} onChange={(e) => setProfile(p => ({ ...p, diet_pref: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400">
                        {DIET_PREFERENCES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : saved ? '✓ Saved!' : <><Save size={16} /> Save Changes</>}
                </Button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Info</h3>
                <div className="space-y-2 text-sm text-gray-500">
                    <p>Account ID: <span className="font-mono text-gray-400">{user?.id?.slice(0, 8)}...</span></p>
                    <p>Signed in via: Google OAuth</p>
                    <p>Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}
