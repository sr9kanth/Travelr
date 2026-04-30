import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProvider, ProviderStatus } from '@/lib/ai';

interface AIStore {
  selectedProvider: AIProvider | null;
  providers: ProviderStatus[];
  defaultProvider: AIProvider;
  loaded: boolean;
  setProvider: (provider: AIProvider) => void;
  setProviders: (providers: ProviderStatus[], defaultProvider: AIProvider) => void;
  markRateLimited: (provider: AIProvider) => void;
  getActiveProvider: () => AIProvider;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      selectedProvider: null,
      providers: [],
      defaultProvider: 'mock',
      loaded: false,

      setProvider: (provider) => set({ selectedProvider: provider }),

      setProviders: (providers, defaultProvider) =>
        set({ providers, defaultProvider, loaded: true }),

      markRateLimited: (provider) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === provider ? { ...p, rateLimited: true, available: false } : p,
          ),
        })),

      getActiveProvider: () => {
        const { selectedProvider, defaultProvider } = get();
        return selectedProvider ?? defaultProvider;
      },
    }),
    {
      name: 'travelr-ai-provider',
      partialize: (state) => ({ selectedProvider: state.selectedProvider }),
    },
  ),
);
