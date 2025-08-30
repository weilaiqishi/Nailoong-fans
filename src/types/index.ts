// src/types/index.ts

/**
 * Supabase 'stickers' table row
 */
export interface Sticker {
  id: string; // UUID
  created_at: string; // Timestamptz
  image_url: string;
  title: string | null;
  description: string | null;
}
