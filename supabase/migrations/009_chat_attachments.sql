-- Add attachment columns to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_type text;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_name text;

-- Create storage bucket for chat attachments (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-attachments', 'chat-attachments', true, 52428800, ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage policy: students can upload to their own folder
CREATE POLICY IF NOT EXISTS "students_upload_chat_attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for chat attachments
CREATE POLICY IF NOT EXISTS "public_read_chat_attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-attachments');
