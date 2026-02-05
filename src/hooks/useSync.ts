import { useState } from 'react';
import { syncService } from '@/services/sync';
import { useAuth } from '@/context/AuthContext';
import * as Network from 'expo-network';

export const useSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check network status
  const checkNetworkStatus = async () => {
    const networkState = await Network.getNetworkStateAsync();
    const online = networkState.isConnected && networkState.isInternetReachable || false;
    setIsOnline(online);
    return online;
  };

  // Full sync
  const performSync = async () => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const online = await checkNetworkStatus();
    if (!online) {
      throw new Error('No internet connection');
    }

    setIsSyncing(true);
    try {
      const result = await syncService.fullSync(user.id);
      setLastSyncTime(new Date());
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload only
  const uploadChanges = async () => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const online = await checkNetworkStatus();
    if (!online) {
      throw new Error('No internet connection');
    }

    setIsSyncing(true);
    try {
      const result = await syncService.uploadChanges(user.id);
      setLastSyncTime(new Date());
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  // Download only
  const downloadChanges = async () => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    const online = await checkNetworkStatus();
    if (!online) {
      throw new Error('No internet connection');
    }

    setIsSyncing(true);
    try {
      const result = await syncService.downloadChanges(user.id);
      setLastSyncTime(new Date());
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  // Process sync queue
  const processQueue = async () => {
    if (!user?.id) {
      throw new Error('Not authenticated');
    }

    await syncService.processQueue(user.id);
  };

  return {
    isSyncing,
    isOnline,
    lastSyncTime,
    performSync,
    uploadChanges,
    downloadChanges,
    processQueue,
    checkNetworkStatus,
  };
};

