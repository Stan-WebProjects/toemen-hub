import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, TENANT_ID } from '@/integrations/supabase/client';

export type HubRole = 'superadmin' | 'admin' | 'agent' | 'monteur' | 'customer' | 'readonly';

interface HubProfile {
  id: string;
  tenant_id: string;
  role: HubRole;
  display_name: string | null;
  email: string | null;
  is_available: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<HubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('hub_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as HubProfile);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    if (!error && data.user) {
      await supabase.from('hub_profiles').insert({
        id: data.user.id,
        tenant_id: TENANT_ID,
        role: 'customer',
        display_name: displayName || email.split('@')[0],
        email,
      });
    }
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setProfile(null);
    return { error };
  }, []);

  return {
    user, session, profile, loading, signIn, signUp, signOut,
    isAuthenticated: !!session,
    role: profile?.role || null,
    isStaff: profile?.role ? ['superadmin', 'admin', 'agent'].includes(profile.role) : false,
    isAdmin: profile?.role ? ['superadmin', 'admin'].includes(profile.role) : false,
    isSuperAdmin: profile?.role === 'superadmin',
  };
};
