
import { createClient } from '@supabase/supabase-js';

// بيانات الاتصال الجديدة لـ Supabase - وكالة الشويع للقات
const supabaseUrl = 'https://xmuhxplikeohlutvmntf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdWh4cGxpa2VvaGx1dHZtbnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTIwNDQsImV4cCI6MjA4MjgyODA0NH0.K94qX1Qy8g40CjMkIXFuUkCckGYh-dffN970zFBAiw8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
