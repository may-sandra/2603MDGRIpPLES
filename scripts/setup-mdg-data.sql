-- Create MDG Records table
CREATE TABLE IF NOT EXISTS mdg_records (
  id BIGSERIAL PRIMARY KEY,
  administration TEXT NOT NULL,
  category TEXT,
  theme TEXT,
  sector TEXT,
  description TEXT,
  capacity TEXT,
  unit_of_measure TEXT,
  status_of_exploitation TEXT,
  location TEXT,
  area TEXT,
  scenario TEXT,
  inep_source TEXT,
  cep_reference TEXT,
  year_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_mdg_administration ON mdg_records(administration);
CREATE INDEX IF NOT EXISTS idx_mdg_category ON mdg_records(category);
CREATE INDEX IF NOT EXISTS idx_mdg_theme ON mdg_records(theme);
CREATE INDEX IF NOT EXISTS idx_mdg_sector ON mdg_records(sector);

-- Enable RLS (Row Level Security)
ALTER TABLE mdg_records ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access" ON mdg_records
  FOR SELECT USING (true);
