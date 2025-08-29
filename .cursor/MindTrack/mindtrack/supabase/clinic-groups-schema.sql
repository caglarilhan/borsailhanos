-- Clinic Groups & Teams Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups table
CREATE TABLE IF NOT EXISTS clinic_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    group_type TEXT NOT NULL DEFAULT 'team' CHECK (group_type IN ('team','discipline','cohort','custom')),
    privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private','internal','public')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(clinic_id, name)
);

-- Group members table
CREATE TABLE IF NOT EXISTS clinic_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES clinic_groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES clinic_members(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, member_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_groups_clinic ON clinic_groups(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_group_members_group ON clinic_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_clinic_group_members_member ON clinic_group_members(member_id);


