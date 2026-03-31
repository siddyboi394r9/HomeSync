'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const AppContext = createContext(null);

const defaultData = {
  currentUser: null,
  household: null,
  members: [],
  groceryLists: [],
  events: [],
  bills: [],
  budgets: [],
  expenses: [],
  keyDates: [],
  recipes: [],
  mealPlan: {},
  messages: [],
  chores: [],
  notifications: [],
};

export function AppProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async (householdId) => {
    if (!householdId) return;
    
    try {
      // Fetch everything in parallel
      const [
        { data: groceryItems },
        { data: chores },
        { data: events },
        { data: bills },
        { data: expenses },
        { data: members }
      ] = await Promise.all([
        supabase.from('grocery_items').select('*').eq('household_id', householdId),
        supabase.from('chores').select('*').eq('household_id', householdId),
        supabase.from('events').select('*').eq('household_id', householdId),
        supabase.from('bills').select('*').eq('household_id', householdId),
        supabase.from('expenses').select('*').eq('household_id', householdId),
        supabase.from('profiles').select('*').eq('household_id', householdId)
      ]);

      setData(prev => ({
        ...prev,
        groceryLists: [{ id: 'main', name: 'Household Groceries', items: groceryItems || [] }],
        chores: chores || [],
        events: events || [],
        bills: bills || [],
        expenses: expenses || [],
        members: members || []
      }));
    } catch (error) {
      console.error('Error fetching household data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, households(*)')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (profile) {
        setData(prev => ({
          ...prev,
          currentUser: profile,
          household: profile.households
        }));
        if (profile.household_id) {
          await fetchAllData(profile.household_id);
        } else {
          setIsLoading(false);
        }
      } else {
        // No profile yet, user needs to set up account
        setData(prev => ({ ...prev, currentUser: { id: userId } }));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsLoading(false);
    }
  }, [fetchAllData]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setData(defaultData);
        setIsLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, [fetchProfile]);

  const loginWithGoogle = useCallback(async () => {
    const getURL = () => {
      let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in Vercel Env Vars
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
        'http://localhost:3000/';
      // Make sure to include `https://` when not localhost.
      url = url.includes('http') ? url : `https://${url}`;
      // Make sure to include a trailing `/`.
      url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
      return url;
    };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    });
    if (error) throw error;
  }, []);

  // SET UP REALTIME SUBSCRIPTIONS
  useEffect(() => {
    if (!data.household?.id) return;

    const channel = supabase.channel(`household:${data.household.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', filter: `household_id=eq.${data.household.id}` }, (payload) => {
        const { table, eventType, new: newItem, old: oldItem } = payload;
        
        setData(prev => {
          const keyMap = {
            'grocery_items': 'groceryLists',
            'chores': 'chores',
            'events': 'events',
            'bills': 'bills',
            'expenses': 'expenses',
            'profiles': 'members'
          };
          const key = keyMap[table];
          if (!key) return prev;

          // SPECIAL HANDLING FOR GROCERY LIST (Nested)
          if (key === 'groceryLists') {
            const list = prev.groceryLists[0] || { id: 'main', name: 'Household Groceries', items: [] };
            let newItems = [...(list.items || [])];
            if (eventType === 'INSERT') newItems.push(newItem);
            if (eventType === 'UPDATE') newItems = newItems.map(i => i.id === newItem.id ? newItem : i);
            if (eventType === 'DELETE') newItems = newItems.filter(i => i.id !== oldItem.id);
            
            return {
              ...prev,
              groceryLists: [{ ...list, items: newItems }]
            };
          }

          // GENERAL HANDLING FOR OTHER ARRAYS
          let newArray = [...prev[key]];
          if (eventType === 'INSERT') newArray.push(newItem);
          if (eventType === 'UPDATE') newArray = newArray.map(i => i.id === newItem.id ? newItem : i);
          if (eventType === 'DELETE') newArray = newArray.filter(i => i.id !== oldItem.id);
          
          return { ...prev, [key]: newArray };
        });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [data.household?.id]);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email, password, fullName) => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: fullName } }
    });
    if (signUpError) throw signUpError;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setData(defaultData);
  }, []);

  const createHousehold = useCallback(async (name) => {
    if (!session?.user) return;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert([{ name, invite_code: inviteCode }])
        .select()
        .single();

      if (householdError) throw householdError;

      // Ensure profile exists and has the household_id (handles OAuth users)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id, 
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          household_id: household.id 
        });

      if (profileError) throw profileError;

      setData(prev => ({ ...prev, household }));
      fetchAllData(household.id);
    } catch (error) {
      console.error('Error creating household:', error);
      throw error;
    }
  }, [session, fetchAllData]);

  const joinHousehold = useCallback(async (inviteCode) => {
    if (!session?.user) return;
    
    try {
      const { data: household, error: findError } = await supabase
        .rpc('get_household_by_invite', { code: inviteCode.toUpperCase() })
        .single();

      if (findError) throw new Error('Invite code not found');

      // Ensure profile exists and has the household_id (handles OAuth users)
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id, 
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          household_id: household.id 
        });

      if (updateError) throw updateError;

      setData(prev => ({ ...prev, household }));
      fetchAllData(household.id);
    } catch (error) {
      console.error('Error joining household:', error);
      throw error;
    }
  }, [session, fetchAllData]);

  const updateData = useCallback((key, value) => {
    setData(prev => ({ ...prev, [key]: typeof value === 'function' ? value(prev[key]) : value }));
  }, []);

  const addItem = useCallback(async (key, item) => {
    if (!data.household?.id) return;

    const tableMap = {
      groceryLists: 'grocery_items',
      chores: 'chores',
      events: 'events',
      bills: 'bills',
      expenses: 'expenses'
    };

    const tableName = tableMap[key];
    if (!tableName) return;

    const creatorMap = {
      groceryLists: 'added_by',
      events: 'created_by',
      expenses: 'paid_by',
      chores: 'assigned_to',
    };

    const creatorCol = creatorMap[key];
    const payload = { ...item, household_id: data.household.id };
    if (creatorCol && session?.user?.id) {
      payload[creatorCol] = session.user.id;
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .insert([payload]);

      if (error) throw error;
      // Note: Data UI update will be handled by Realtime Postgres changes
    } catch (error) {
      console.error(`Error adding item to ${tableName}:`, error);
    }
  }, [data.household?.id, session]);

  const removeItem = useCallback(async (key, id) => {
    const tableMap = {
      groceryLists: 'grocery_items',
      chores: 'chores',
      events: 'events',
      bills: 'bills',
      expenses: 'expenses'
    };

    const tableName = tableMap[key];
    if (!tableName) return;

    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error(`Error removing item from ${tableName}:`, error);
    }
  }, []);

  const updateItem = useCallback(async (key, id, updates) => {
    const tableMap = {
      groceryLists: 'grocery_items',
      chores: 'chores',
      events: 'events',
      bills: 'bills',
      expenses: 'expenses'
    };

    const tableName = tableMap[key];
    if (!tableName) return;

    try {
      const { error } = await supabase.from(tableName).update(updates).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      ...data, isAuthenticated: !!session, isLoading,
      login, signup, logout, loginWithGoogle, createHousehold, joinHousehold, updateData, addItem, removeItem, updateItem, setData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

