import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, Job, Invoice, Territory, CRMCustomer } from '@/src/types';
import { DEMO_USERS, DEMO_JOBS, DEMO_INVOICES, DEMO_TERRITORIES } from '@/src/constants/demoData';

interface AppState {
  // User state
  currentUser: User | null;
  isDemoMode: boolean;
  users: User[];
  
  // Data state
  jobs: Job[];
  invoices: Invoice[];
  territories: Territory[];
  crmCustomers: CRMCustomer[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setDemoMode: (isDemoMode: boolean) => void;
  login: (user: User) => void;
  demoLogin: (role: 'homeowner' | 'contractor' | 'operator') => void;
  logout: () => void;
  signup: (userData: Omit<User, 'id' | 'createdAt' | 'isPro' | 'performanceScore' | 'bidAccuracy' | 'isOperator' | 'referralEarnings' | 'contractorInviteCount'>) => User;
  
  // Job actions
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  addBidToJob: (jobId: string, bid: Job['bids'][0]) => void;
  
  // Invoice actions
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  
  // CRM actions
  addCRMCustomer: (customer: CRMCustomer) => void;
  
  // Territory actions
  claimTerritory: (territoryId: number, operatorId: string, operatorName: string) => void;
  
  // Persistence
  loadPersistedState: () => Promise<void>;
  persistState: () => Promise<void>;
}

const STORAGE_KEY = 'fairtradeworker_state';

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  isDemoMode: false,
  users: [],
  jobs: DEMO_JOBS.slice(0, 5),
  invoices: DEMO_INVOICES,
  territories: DEMO_TERRITORIES,
  crmCustomers: [],
  isLoading: false,
  
  // User actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  
  login: (user) => {
    set({ currentUser: user, isDemoMode: false });
    get().persistState();
  },
  
  demoLogin: (role) => {
    const demoUser = DEMO_USERS[role];
    set({ currentUser: demoUser, isDemoMode: true });
  },
  
  logout: () => {
    set({ currentUser: null, isDemoMode: false });
    get().persistState();
  },
  
  signup: (userData) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      isPro: false,
      performanceScore: 0,
      bidAccuracy: 0,
      isOperator: false,
      referralEarnings: 0,
      contractorInviteCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      users: [...state.users, newUser],
      currentUser: newUser,
      isDemoMode: false,
    }));
    
    get().persistState();
    return newUser;
  },
  
  // Job actions
  addJob: (job) => {
    set((state) => ({ jobs: [...state.jobs, job] }));
    get().persistState();
  },
  
  updateJob: (jobId, updates) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...updates } : job
      ),
    }));
    get().persistState();
  },
  
  addBidToJob: (jobId, bid) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, bids: [...job.bids, bid] } : job
      ),
    }));
    get().persistState();
  },
  
  // Invoice actions
  addInvoice: (invoice) => {
    set((state) => ({ invoices: [...state.invoices, invoice] }));
    get().persistState();
  },
  
  updateInvoice: (invoiceId, updates) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, ...updates } : invoice
      ),
    }));
    get().persistState();
  },
  
  // CRM actions
  addCRMCustomer: (customer) => {
    set((state) => ({ crmCustomers: [...state.crmCustomers, customer] }));
    get().persistState();
  },
  
  // Territory actions
  claimTerritory: (territoryId, operatorId, operatorName) => {
    set((state) => ({
      territories: state.territories.map((territory) =>
        territory.id === territoryId
          ? { ...territory, operatorId, operatorName, status: 'claimed' as const }
          : territory
      ),
    }));
    get().persistState();
  },
  
  // Persistence
  loadPersistedState: async () => {
    try {
      set({ isLoading: true });
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          currentUser: parsed.currentUser || null,
          users: parsed.users || [],
          jobs: parsed.jobs || DEMO_JOBS.slice(0, 5),
          invoices: parsed.invoices || DEMO_INVOICES,
          territories: parsed.territories || DEMO_TERRITORIES,
          crmCustomers: parsed.crmCustomers || [],
        });
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  persistState: async () => {
    try {
      const state = get();
      const toStore = {
        currentUser: state.currentUser,
        users: state.users,
        jobs: state.jobs,
        invoices: state.invoices,
        territories: state.territories,
        crmCustomers: state.crmCustomers,
      };
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  },
}));
