import { contactsService } from './contacts';
import { contactRepository } from '@/db/contacts';
import { syncQueueRepository } from '@/db/syncQueue';
import { Contact } from '@/types';
import * as Network from 'expo-network';

export const syncService = {
  // Check if online
  async isOnline(): Promise<boolean> {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected && networkState.isInternetReachable;
  },

  // Get unsynced contacts from local DB
  async getUnsyncedContacts(userId: string): Promise<Contact[]> {
    const allContacts = await contactRepository.getAll(userId);
    return allContacts.filter(
      (contact) => !contact.synced_at || contact.local_updated_at > contact.synced_at
    );
  },

  // Upload local changes to cloud
  async uploadChanges(userId: string): Promise<{ uploaded: number; errors: number }> {
    const isOnline = await this.isOnline();
    if (!isOnline) {
      throw new Error('No internet connection');
    }

    const unsynced = await this.getUnsyncedContacts(userId);
    let uploaded = 0;
    let errors = 0;

    for (const contact of unsynced) {
      try {
        if (!contact.id) {
          // New contact
          const created = await contactsService.create(contact);
          // Update local with cloud ID and synced_at
          await contactRepository.update({
            ...contact,
            id: created.id,
            synced_at: created.synced_at,
          });
        } else {
          // Check if exists in cloud
          const cloudContact = await contactsService.getById(contact.id);
          if (!cloudContact) {
            // Create in cloud
            const created = await contactsService.create(contact);
            await contactRepository.update({
              ...contact,
              synced_at: created.synced_at,
            });
          } else {
            // Resolve conflict: last-updated wins
            const localTime = new Date(contact.local_updated_at || 0).getTime();
            const cloudTime = new Date(cloudContact.local_updated_at || 0).getTime();

            if (localTime > cloudTime) {
              // Local is newer, upload
              await contactsService.update(contact);
              await contactRepository.update({
                ...contact,
                synced_at: new Date().toISOString(),
              });
            } else {
              // Cloud is newer, download
              await contactRepository.update({
                ...cloudContact,
                synced_at: cloudContact.synced_at,
              });
            }
          }
        }
        uploaded++;
      } catch (error) {
        console.error('Error uploading contact:', error);
        errors++;
      }
    }

    // Handle deletions
    const deletedContacts = await contactRepository.getAll(userId, true);
    for (const contact of deletedContacts) {
      if (contact.deleted && contact.synced_at) {
        try {
          await contactsService.delete(contact.id!);
          await contactRepository.hardDelete(contact.id!);
        } catch (error) {
          console.error('Error syncing deletion:', error);
        }
      }
    }

    return { uploaded, errors };
  },

  // Download cloud changes
  async downloadChanges(userId: string): Promise<{ downloaded: number; errors: number }> {
    const isOnline = await this.isOnline();
    if (!isOnline) {
      throw new Error('No internet connection');
    }

    const cloudContacts = await contactsService.getAll(userId);
    let downloaded = 0;
    let errors = 0;

    for (const cloudContact of cloudContacts) {
      try {
        const localContact = cloudContact.id
          ? await contactRepository.getById(cloudContact.id)
          : null;

        if (!localContact) {
          // New contact from cloud
          await contactRepository.create(cloudContact);
          downloaded++;
        } else {
          // Resolve conflict: last-updated wins
          const localTime = new Date(localContact.local_updated_at || 0).getTime();
          const cloudTime = new Date(cloudContact.local_updated_at || 0).getTime();

          if (cloudTime > localTime && localContact.synced_at) {
            // Cloud is newer, update local
            await contactRepository.update({
              ...cloudContact,
              synced_at: cloudContact.synced_at,
            });
            downloaded++;
          }
        }
      } catch (error) {
        console.error('Error downloading contact:', error);
        errors++;
      }
    }

    return { downloaded, errors };
  },

  // Full sync (upload + download)
  async fullSync(userId: string): Promise<{
    uploaded: number;
    downloaded: number;
    errors: number;
  }> {
    const isOnline = await this.isOnline();
    if (!isOnline) {
      throw new Error('No internet connection');
    }

    const uploadResult = await this.uploadChanges(userId);
    const downloadResult = await this.downloadChanges(userId);

    return {
      uploaded: uploadResult.uploaded,
      downloaded: downloadResult.downloaded,
      errors: uploadResult.errors + downloadResult.errors,
    };
  },

  // Process sync queue
  async processQueue(userId: string): Promise<void> {
    const queue = await syncQueueRepository.getAll();
    const isOnline = await this.isOnline();

    if (!isOnline) {
      return; // Queue will be processed when online
    }

    for (const item of queue) {
      try {
        if (item.operation === 'create' && item.data) {
          await contactsService.create(item.data);
        } else if (item.operation === 'update' && item.data) {
          await contactsService.update(item.data);
        } else if (item.operation === 'delete') {
          await contactsService.delete(item.contact_id);
        }
        await syncQueueRepository.remove(item.id!);
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
    }
  },
};

