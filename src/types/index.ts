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
  status: 'uploading' | 'extracting' | 'translating' | 'generating' | 'completed' | 'error';
  progress: number;
  status_message: string;
  original_file_path: string;
  translated_pdf_path: string | null;
  translated_epub_path: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  pages_count: number;
  created_at: string;
  completed_at: string | null;
  user_email?: string;
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
