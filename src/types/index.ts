export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_blocked: boolean;
  created_at: string;
}

export interface Translation {
  id: string;
  user_id: string;
  original_filename: string;
  source_language: string;
  target_language: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  file_url: string;
  translated_file_url: string | null;
  progress: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_users: number;
  total_translations: number;
  total_tokens: number;
  total_cost_usd: number;
  users_stats: UserStats[];
}

export interface UserStats {
  user_id: string;
  email: string;
  translations_count: number;
  total_tokens: number;
  total_cost_usd: number;
}
