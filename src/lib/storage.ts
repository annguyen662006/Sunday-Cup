import { supabase } from './supabase';

export const uploadImage = async (file: Blob, path: string): Promise<string | null> => {
  try {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
};

export const deleteImage = async (publicUrl: string): Promise<boolean> => {
  try {
    if (!publicUrl) return false;
    
    // Extract the file path from the public URL
    // Public URL format: https://[PROJECT_ID].supabase.co/storage/v1/object/public/images/path/to/file.jpg
    const urlParts = publicUrl.split('/public/images/');
    if (urlParts.length !== 2) {
      return false;
    }
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting image:', error);
    return false;
  }
};
