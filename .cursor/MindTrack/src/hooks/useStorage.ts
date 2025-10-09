"use client";

import * as React from "react";
import { useStorage } from "@/hooks/useStorage";

interface StorageHookProps {
  userId: string;
}

export function useStorage({ userId }: StorageHookProps) {
  const [loading, setLoading] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>([]);

  // Upload file
  const uploadFile = React.useCallback(async (
    bucket: string,
    file: File,
    category: string,
    path?: string
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('userId', userId);
      formData.append('category', category);
      if (path) formData.append('path', path);

      const response = await fetch('/api/storage', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: 'Failed to upload file' };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Upload multiple files
  const uploadFiles = React.useCallback(async (
    bucket: string,
    files: File[],
    category: string
  ) => {
    setLoading(true);
    try {
      const uploadPromises = files.map(file => 
        uploadFile(bucket, file, category)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple file upload error:', error);
      return { success: false, error: 'Failed to upload files' };
    } finally {
      setLoading(false);
    }
  }, [uploadFile]);

  // Get files list
  const getFiles = React.useCallback(async (
    bucket: string,
    path?: string
  ) => {
    try {
      const url = `/api/storage?bucket=${bucket}&action=list${path ? `&path=${path}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setFiles(result.data);
      }
      
      return result;
    } catch (error) {
      console.error('Get files error:', error);
      return { success: false, error: 'Failed to get files' };
    }
  }, []);

  // Get signed URL
  const getSignedUrl = React.useCallback(async (
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ) => {
    try {
      const response = await fetch(
        `/api/storage?bucket=${bucket}&path=${path}&action=signed-url&expiresIn=${expiresIn}`
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get signed URL error:', error);
      return { success: false, error: 'Failed to get signed URL' };
    }
  }, []);

  // Get public URL
  const getPublicUrl = React.useCallback(async (
    bucket: string,
    path: string
  ) => {
    try {
      const response = await fetch(
        `/api/storage?bucket=${bucket}&path=${path}&action=public-url`
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get public URL error:', error);
      return { success: false, error: 'Failed to get public URL' };
    }
  }, []);

  // Delete file
  const deleteFile = React.useCallback(async (
    bucket: string,
    path: string
  ) => {
    try {
      const response = await fetch(
        `/api/storage?bucket=${bucket}&path=${path}`,
        { method: 'DELETE' }
      );
      const result = await response.json();
      
      if (result.success) {
        setFiles(prev => prev.filter(file => file.name !== path));
      }
      
      return result;
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }, []);

  return {
    loading,
    files,
    uploadFile,
    uploadFiles,
    getFiles,
    getSignedUrl,
    getPublicUrl,
    deleteFile
  };
}










