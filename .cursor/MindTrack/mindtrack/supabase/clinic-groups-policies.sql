-- RLS Policies for clinic groups

ALTER TABLE clinic_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_group_members ENABLE ROW LEVEL SECURITY;

-- Helper: current user's active clinic_id
CREATE OR REPLACE FUNCTION current_user_active_clinic() RETURNS UUID AS $$
DECLARE
  v_clinic UUID;
BEGIN
  SELECT cm.clinic_id INTO v_clinic
  FROM clinic_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  LIMIT 1;
  RETURN v_clinic;
END;
$$ LANGUAGE plpgsql STABLE;

-- clinic_groups policies
CREATE POLICY clinic_groups_select ON clinic_groups
  FOR SELECT USING (
    clinic_id = current_user_active_clinic()
  );

CREATE POLICY clinic_groups_insert ON clinic_groups
  FOR INSERT WITH CHECK (
    clinic_id = current_user_active_clinic()
  );

CREATE POLICY clinic_groups_update ON clinic_groups
  FOR UPDATE USING (
    clinic_id = current_user_active_clinic()
  ) WITH CHECK (
    clinic_id = current_user_active_clinic()
  );

CREATE POLICY clinic_groups_delete ON clinic_groups
  FOR DELETE USING (
    clinic_id = current_user_active_clinic()
  );

-- clinic_group_members policies
CREATE POLICY clinic_group_members_select ON clinic_group_members
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM clinic_groups WHERE clinic_id = current_user_active_clinic()
    )
  );

CREATE POLICY clinic_group_members_insert ON clinic_group_members
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT id FROM clinic_groups WHERE clinic_id = current_user_active_clinic()
    )
  );

CREATE POLICY clinic_group_members_update ON clinic_group_members
  FOR UPDATE USING (
    group_id IN (
      SELECT id FROM clinic_groups WHERE clinic_id = current_user_active_clinic()
    )
  ) WITH CHECK (
    group_id IN (
      SELECT id FROM clinic_groups WHERE clinic_id = current_user_active_clinic()
    )
  );

CREATE POLICY clinic_group_members_delete ON clinic_group_members
  FOR DELETE USING (
    group_id IN (
      SELECT id FROM clinic_groups WHERE clinic_id = current_user_active_clinic()
    )
  );


