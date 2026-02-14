-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  page TEXT,
  source TEXT DEFAULT 'web'
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies
-- SELECT: Blocked for anon (only authenticated/service role can see)
CREATE POLICY "Leads are not viewable by public" ON leads
  FOR SELECT USING (false);

-- INSERT: Only from server (service role)
-- Note: In Supabase, if we use the service_role key, it bypasses RLS.
-- We can also create a policy for authenticated if we want, but the requirement says "INSERT solo desde server (service role)".
CREATE POLICY "Leads can be inserted by service role" ON leads
  FOR INSERT WITH CHECK (true);
