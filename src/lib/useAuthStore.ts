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
  isGuest: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  initialize: () => void;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const GUEST_PROFILE: UserProfile = {
  id: 'guest',
  full_name: 'Khách (Guest)',
  avatar_url: '',
  email: 'guest@local',
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isGuest: false,
  isLoading: true,

  loginWithGoogle: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('next_todo_guest_mode');
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  continueAsGuest: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('next_todo_guest_mode', 'true');
    }
    set({
      isGuest: true,
      session: null,
      profile: GUEST_PROFILE,
      isLoading: false,
    });
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('next_todo_guest_mode');
    }
    await supabase.auth.signOut();
    set({ session: null, profile: null, isGuest: false });
  },

  initialize: () => {
    const state = useAuthStore.getState() as any;
    if (state._initialized) return;
    useAuthStore.setState({ _initialized: true } as any);

    // Check if guest mode was enabled previously
    const storedGuest = typeof window !== 'undefined' && localStorage.getItem('next_todo_guest_mode') === 'true';

    // Check active sessions and sets up a listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('next_todo_guest_mode');
        }
        verifySessionWithBackend(session);
      } else if (storedGuest) {
        set({
          isGuest: true,
          session: null,
          profile: GUEST_PROFILE,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (session) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('next_todo_guest_mode');
        }
        if (event === 'SIGNED_IN') {
          verifySessionWithBackend(session);
        } else {
          // For TOKEN_REFRESHED, USER_UPDATED, etc, just update the session object silently
          set({ session, isGuest: false });
        }
      } else {
        const stillGuest = typeof window !== 'undefined' && localStorage.getItem('next_todo_guest_mode') === 'true';
        if (stillGuest) {
          set({ isGuest: true, session: null, profile: GUEST_PROFILE, isLoading: false });
        } else {
          set({ session: null, profile: null, isGuest: false, isLoading: false });
        }
      }
    });
  },

  updateProfile: async (updates) => {
    const { session } = useAuthStore.getState();
    if (!session) throw new Error('Not authenticated');

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
