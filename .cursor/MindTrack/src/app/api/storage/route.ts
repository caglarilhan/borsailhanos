import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getPublicUrl, getSignedUrl, deleteFile, listFiles, createBucket, validateFile, generateFilePath, STORAGE_BUCKETS, FILE_CONFIG } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string;
    const userId = formData.get('userId') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!bucket || !STORAGE_BUCKETS[bucket as keyof typeof STORAGE_BUCKETS]) {
      return NextResponse.json(
        { error: 'Invalid bucket name' },
        { status: 400 }
      );
    }

    // Validate file
    const allowedTypes = bucket === 'medical-images' 
      ? FILE_CONFIG.ALLOWED_MEDICAL_TYPES
      : bucket === 'patient-documents'
      ? FILE_CONFIG.ALLOWED_DOCUMENT_TYPES
      : FILE_CONFIG.ALLOWED_IMAGE_TYPES;

    const validation = validateFile(file, allowedTypes);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate file path if not provided
    const filePath = path || generateFilePath(userId || 'anonymous', category || 'uploads', file.name);

    // Upload file
    const result = await uploadFile(bucket, file, filePath);

    if (result.success) {
      const publicUrl = getPublicUrl(bucket, filePath);
      
      return NextResponse.json({
        success: true,
        data: {
          path: filePath,
          publicUrl,
          size: file.size,
          type: file.type,
          name: file.name
        }
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const path = searchParams.get('path');
    const action = searchParams.get('action');

    if (!bucket || !STORAGE_BUCKETS[bucket as keyof typeof STORAGE_BUCKETS]) {
      return NextResponse.json(
        { error: 'Invalid bucket name' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'list':
        const listResult = await listFiles(bucket, path || undefined);
        if (listResult.success) {
          return NextResponse.json({
            success: true,
            data: listResult.data
          });
        } else {
          return NextResponse.json(
            { error: listResult.error },
            { status: 500 }
          );
        }

      case 'signed-url':
        if (!path) {
          return NextResponse.json(
            { error: 'Path is required for signed URL' },
            { status: 400 }
          );
        }
        const signedUrlResult = await getSignedUrl(bucket, path);
        if (signedUrlResult.success) {
          return NextResponse.json({
            success: true,
            url: signedUrlResult.url
          });
        } else {
          return NextResponse.json(
            { error: signedUrlResult.error },
            { status: 500 }
          );
        }

      case 'public-url':
        if (!path) {
          return NextResponse.json(
            { error: 'Path is required for public URL' },
            { status: 400 }
          );
        }
        const publicUrl = getPublicUrl(bucket, path);
        return NextResponse.json({
          success: true,
          url: publicUrl
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const path = searchParams.get('path');

    if (!bucket || !STORAGE_BUCKETS[bucket as keyof typeof STORAGE_BUCKETS]) {
      return NextResponse.json(
        { error: 'Invalid bucket name' },
        { status: 400 }
      );
    }

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    const result = await deleteFile(bucket, path);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


