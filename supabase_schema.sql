-- Create teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create players table
CREATE TABLE players (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  birth_year INTEGER,
  avatar TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create matches table
CREATE TABLE matches (
  id BIGINT PRIMARY KEY,
  home_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  away_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  round TEXT,
  date TEXT,
  events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public read access on images bucket" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Allow public insert access on images bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Allow public update access on images bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Allow public delete access on images bucket" ON storage.objects FOR DELETE USING (bucket_id = 'images');

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all operations for now, since there's no auth)
CREATE POLICY "Allow public read access on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on players" ON players FOR DELETE USING (true);

CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on matches" ON matches FOR DELETE USING (true);
