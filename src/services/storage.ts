import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET || 'contact-images';

export const storageService = {
  // Request image picker permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  },

  // Pick and compress image
  async pickImage(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permission to access media library is required');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    // Compress image
    const manipulatedImage = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    return manipulatedImage.uri;
  },

  // Upload image to Supabase Storage
  async uploadImage(localUri: string, contactId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const fileName = `${user.id}/${contactId}-${Date.now()}.jpg`;
    const fileData = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileBuffer = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  // Delete image from storage
  async deleteImage(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/').pop()?.split('?')[0];
    if (!fileName) return;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) throw error;
  },
};

