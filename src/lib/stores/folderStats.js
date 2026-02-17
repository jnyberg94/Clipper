import { writable } from 'svelte/store';
import { getFolderStats } from '$lib/utils/getFolderStats';

function createFolderStatsStore() {
  const { subscribe, set } = writable({
    count: 0,
    formattedSize: '0 Bytes',
    loading: false
  });

  return {
    subscribe,
    refresh: async () => {
      set({ count: 0, formattedSize: '0 Bytes', loading: true });
      try {
        const stats = await getFolderStats();
        set({ ...stats, loading: false });
      } catch (error) {
        console.error('Error loading folder stats:', error);
        set({ count: 0, formattedSize: '0 Bytes', loading: false });
      }
    }
  };
}

export const folderStats = createFolderStatsStore();