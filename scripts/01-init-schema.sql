-- Create question_sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_hash TEXT NOT NULL,
  pdf_name TEXT NOT NULL,
  questions_text TEXT NOT NULL,
  questions_json JSONB,
  generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT DEFAULT 'English',
  difficulty TEXT DEFAULT 'Medium',
  question_counts JSONB,
  total_questions INTEGER,
  file_size INTEGER,
  pattern_used BOOLEAN DEFAULT FALSE,
  custom_instructions TEXT,
  exam_type TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_results table
CREATE TABLE IF NOT EXISTS exam_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id BIGINT REFERENCES question_sets(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  exam_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_questions INTEGER,
  total_marks INTEGER,
  marks_obtained REAL,
  percentage REAL,
  grade TEXT,
  time_taken INTEGER,
  answers_json JSONB,
  evaluation_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_question_sets_user_id ON question_sets(user_id);
CREATE INDEX idx_question_sets_pdf_hash ON question_sets(pdf_hash);
CREATE INDEX idx_question_sets_generation_date ON question_sets(generation_date DESC);
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX idx_exam_results_exam_date ON exam_results(exam_date DESC);
CREATE INDEX idx_exam_results_question_set_id ON exam_results(question_set_id);

-- Enable RLS
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_sets
CREATE POLICY "Users can view their own question sets"
  ON question_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question sets"
  ON question_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question sets"
  ON question_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question sets"
  ON question_sets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exam_results
CREATE POLICY "Users can view their own exam results"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam results"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam results"
  ON exam_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam results"
  ON exam_results FOR DELETE
  USING (auth.uid() = user_id);
