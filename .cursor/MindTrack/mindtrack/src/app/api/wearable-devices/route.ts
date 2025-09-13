import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve wearable devices
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const deviceType = searchParams.get('device_type');
    const manufacturer = searchParams.get('manufacturer');
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('wearable_devices')
      .select('*')
      .order('device_name', { ascending: true });

    if (deviceType) {
      query = query.eq('device_type', deviceType);
    }
    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer);
    }
    if (platform) {
      query = query.eq('platform', platform);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wearable devices' }, { status: 500 });
  }
}

// POST - Create wearable device
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      device_id,
      device_name,
      device_type,
      manufacturer,
      model,
      platform,
      supported_metrics,
      data_types,
      connectivity,
      battery_life_hours,
      water_resistance,
      price_range,
      is_active
    } = body;

    // Validate required fields
    if (!device_id || !device_name || !device_type || !manufacturer || !model || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('wearable_devices')
      .insert({
        device_id,
        device_name,
        device_type,
        manufacturer,
        model,
        platform,
        supported_metrics,
        data_types,
        connectivity,
        battery_life_hours,
        water_resistance,
        price_range,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create wearable device' }, { status: 500 });
  }
}

// PUT - Update wearable device
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Wearable device ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('wearable_devices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update wearable device' }, { status: 500 });
  }
}

// DELETE - Delete wearable device
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Wearable device ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wearable_devices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Wearable device deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wearable device' }, { status: 500 });
  }
}

