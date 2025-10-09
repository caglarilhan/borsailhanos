-- Forms V2 Schema - Template Gallery, Publish/Version Workflows

-- Enhance form_templates table
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS published_by uuid REFERENCES auth.users(id);
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS submission_count integer DEFAULT 0;
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS average_completion_time integer DEFAULT 0;
ALTER TABLE public.form_templates ADD COLUMN IF NOT EXISTS completion_rate decimal(5,2) DEFAULT 0;

-- Create form_template_versions table
CREATE TABLE IF NOT EXISTS public.form_template_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_template_id uuid NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  version integer NOT NULL,
  schema jsonb NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  published_by uuid REFERENCES auth.users(id),
  change_log text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.form_template_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_template_versions
CREATE POLICY "Enable read access for clinic members" ON public.form_template_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    JOIN public.user_profiles up ON ft.clinic_id = up.clinic_id
    WHERE ft.id = form_template_versions.form_template_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for clinic members" ON public.form_template_versions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    JOIN public.user_profiles up ON ft.clinic_id = up.clinic_id
    WHERE ft.id = form_template_versions.form_template_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for clinic members" ON public.form_template_versions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    JOIN public.user_profiles up ON ft.clinic_id = up.clinic_id
    WHERE ft.id = form_template_versions.form_template_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for clinic admins" ON public.form_template_versions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    JOIN public.clinic_members cm ON ft.clinic_id = cm.clinic_id
    WHERE ft.id = form_template_versions.form_template_id 
    AND cm.user_id = auth.uid() 
    AND cm.role = 'admin'
  )
);

-- Create form_template_gallery table for shared templates
CREATE TABLE IF NOT EXISTS public.form_template_gallery (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  download_count integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.form_template_gallery ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_template_gallery
CREATE POLICY "Enable read access for all authenticated users" ON public.form_template_gallery FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for template owners" ON public.form_template_gallery FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    WHERE ft.id = form_template_gallery.template_id AND ft.created_by = auth.uid()
  )
);

CREATE POLICY "Enable update for template owners" ON public.form_template_gallery FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    WHERE ft.id = form_template_gallery.template_id AND ft.created_by = auth.uid()
  )
);

CREATE POLICY "Enable delete for template owners" ON public.form_template_gallery FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.form_templates ft
    WHERE ft.id = form_template_gallery.template_id AND ft.created_by = auth.uid()
  )
);

-- Create form_template_reviews table
CREATE TABLE IF NOT EXISTS public.form_template_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id uuid NOT NULL REFERENCES public.form_template_gallery(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.form_template_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_template_reviews
CREATE POLICY "Enable read access for all authenticated users" ON public.form_template_reviews FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.form_template_reviews FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND user_id = auth.uid()
);

CREATE POLICY "Enable update for review authors" ON public.form_template_reviews FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Enable delete for review authors" ON public.form_template_reviews FOR DELETE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_templates_clinic_id ON public.form_templates (clinic_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_published_at ON public.form_templates (published_at);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON public.form_templates (category);
CREATE INDEX IF NOT EXISTS idx_form_templates_is_published ON public.form_templates (is_published);
CREATE INDEX IF NOT EXISTS idx_form_templates_created_by ON public.form_templates (created_by);
CREATE INDEX IF NOT EXISTS idx_form_template_versions_template_id ON public.form_template_versions (form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_template_versions_version ON public.form_template_versions (version);
CREATE INDEX IF NOT EXISTS idx_form_template_gallery_category ON public.form_template_gallery (category);
CREATE INDEX IF NOT EXISTS idx_form_template_gallery_is_featured ON public.form_template_gallery (is_featured);
CREATE INDEX IF NOT EXISTS idx_form_template_gallery_rating ON public.form_template_gallery (rating);
CREATE INDEX IF NOT EXISTS idx_form_template_reviews_gallery_id ON public.form_template_reviews (gallery_id);
CREATE INDEX IF NOT EXISTS idx_form_template_reviews_user_id ON public.form_template_reviews (user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_template_gallery_updated_at BEFORE UPDATE ON public.form_template_gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_template_reviews_updated_at BEFORE UPDATE ON public.form_template_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update template statistics
CREATE OR REPLACE FUNCTION update_form_template_stats(p_template_id uuid)
RETURNS void AS $$
DECLARE
  submission_count integer;
  avg_completion_time integer;
  completion_rate decimal(5,2);
BEGIN
  -- Calculate submission count
  SELECT COUNT(*)
  INTO submission_count
  FROM public.form_submissions
  WHERE form_template_id = p_template_id;
  
  -- Calculate average completion time (simplified)
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - created_at))), 0)
  INTO avg_completion_time
  FROM public.form_submissions
  WHERE form_template_id = p_template_id;
  
  -- Calculate completion rate (simplified - assume all submissions are completed)
  completion_rate := CASE 
    WHEN submission_count > 0 THEN 100.0
    ELSE 0.0
  END;
  
  -- Update template statistics
  UPDATE public.form_templates
  SET 
    submission_count = submission_count,
    average_completion_time = avg_completion_time,
    completion_rate = completion_rate,
    updated_at = now()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update gallery rating
CREATE OR REPLACE FUNCTION update_gallery_rating(p_gallery_id uuid)
RETURNS void AS $$
DECLARE
  avg_rating decimal(3,2);
  review_count integer;
BEGIN
  -- Calculate average rating and review count
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.form_template_reviews
  WHERE gallery_id = p_gallery_id;
  
  -- Update gallery rating
  UPDATE public.form_template_gallery
  SET 
    rating = avg_rating,
    review_count = review_count,
    updated_at = now()
  WHERE id = p_gallery_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update template stats when submission is created
CREATE OR REPLACE FUNCTION trigger_update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_form_template_stats(NEW.form_template_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_stats_after_submission
  AFTER INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_template_stats();

-- Create trigger to update gallery rating when review is created/updated
CREATE OR REPLACE FUNCTION trigger_update_gallery_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_gallery_rating(NEW.gallery_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_gallery_rating(OLD.gallery_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_rating_after_review
  AFTER INSERT OR UPDATE OR DELETE ON public.form_template_reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_gallery_rating();

-- Create function to get template gallery with stats
CREATE OR REPLACE FUNCTION get_template_gallery(
  p_category text DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  tags text[],
  is_featured boolean,
  download_count integer,
  rating decimal(3,2),
  review_count integer,
  created_at timestamp with time zone,
  template_name text,
  template_description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ftg.id,
    ftg.title,
    ftg.description,
    ftg.category,
    ftg.tags,
    ftg.is_featured,
    ftg.download_count,
    ftg.rating,
    ftg.review_count,
    ftg.created_at,
    ft.name as template_name,
    ft.description as template_description
  FROM public.form_template_gallery ftg
  JOIN public.form_templates ft ON ftg.template_id = ft.id
  WHERE 
    (p_category IS NULL OR ftg.category = p_category)
    AND (p_search_query IS NULL OR 
         ftg.title ILIKE '%' || p_search_query || '%' OR 
         ftg.description ILIKE '%' || p_search_query || '%' OR
         ft.name ILIKE '%' || p_search_query || '%')
  ORDER BY ftg.is_featured DESC, ftg.rating DESC, ftg.download_count DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create function to publish template version
CREATE OR REPLACE FUNCTION publish_template_version(
  p_template_id uuid,
  p_version_id uuid,
  p_user_id uuid
)
RETURNS void AS $$
DECLARE
  version_data record;
BEGIN
  -- Get version data
  SELECT schema, change_log
  INTO version_data
  FROM public.form_template_versions
  WHERE id = p_version_id AND form_template_id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found';
  END IF;
  
  -- Update template with version data
  UPDATE public.form_templates
  SET 
    schema = version_data.schema,
    is_published = true,
    published_at = now(),
    published_by = p_user_id,
    updated_at = now()
  WHERE id = p_template_id;
  
  -- Mark version as published
  UPDATE public.form_template_versions
  SET 
    is_published = true,
    published_at = now(),
    published_by = p_user_id
  WHERE id = p_version_id;
  
  -- Mark other versions as unpublished
  UPDATE public.form_template_versions
  SET is_published = false
  WHERE form_template_id = p_template_id AND id != p_version_id;
END;
$$ LANGUAGE plpgsql;
