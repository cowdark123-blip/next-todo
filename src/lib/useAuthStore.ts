import { create } from 'zustand';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isLoading: true,

  loginWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  initialize: () => {
    // Check active sessions and sets up a listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        verifySessionWithBackend(session);
      } else {
        set({ isLoading: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        verifySessionWithBackend(session);
      } else {
        set({ session: null, profile: null, isLoading: false });
      }
    });
  },

  updateProfile: async (updates) => {
    const { session, profile } = useAuthStore.getState();
    if (!session || !profile) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }

    const { profile: updatedProfile } = await res.json();
    set({ profile: updatedProfile });
  },
}));

async function verifySessionWithBackend(session: Session) {
  const isFirstLoad = !useAuthStore.getState().profile;
  if (isFirstLoad) {
    useAuthStore.setState({ isLoading: true });
  }

  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: session.access_token }),
    });

    if (res.ok) {
      const data = await res.json();
      useAuthStore.setState({ session, profile: data.profile, isLoading: false });
      
      if (isFirstLoad) {
        // Fetch initial sync data
        const syncRes = await fetch(`${API_URL}/sync`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          require('@/store/useTaskStore').useTaskStore.getState().setFromBackend(syncData);
        }
      }
    } else {
      console.error('Failed to verify session with backend');
      useAuthStore.setState({ session: null, profile: null, isLoading: false });
    }
  } catch (error) {
    console.error('Error contacting backend:', error);
    useAuthStore.setState({ session: null, profile: null, isLoading: false });
  }
}
