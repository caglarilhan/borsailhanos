"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, File, Image, FileText, X, CheckCircle, AlertCircle, Loader2, Download, Trash2 } from "lucide-react";

interface FileUploadProps {
  userId: string;
  onUploadComplete?: (result: any) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  publicUrl: string;
  uploadedAt: Date;
}

const STORAGE_BUCKETS = {
  'patient-documents': 'Patient Documents',
  'medical-images': 'Medical Images',
  'lab-reports': 'Lab Reports',
  'prescriptions': 'Prescriptions',
  'profile-photos': 'Profile Photos',
  'temp-uploads': 'Temporary Uploads'
};

const FILE_CATEGORIES = {
  'medical-record': 'Medical Record',
  'lab-result': 'Lab Result',
  'prescription': 'Prescription',
  'image': 'Image',
  'document': 'Document',
  'other': 'Other'
};

export default function FileUpload({ userId, onUploadComplete }: FileUploadProps) {
  const [selectedBucket, setSelectedBucket] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load existing files on mount
  React.useEffect(() => {
    loadFiles();
  }, [selectedBucket]);

  const loadFiles = async () => {
    if (!selectedBucket) return;

    try {
      const response = await fetch(`/api/storage?bucket=${selectedBucket}&action=list`);
      const result = await response.json();
      
      if (result.success) {
        const files: UploadedFile[] = result.data.map((file: any) => ({
          id: file.id || file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'unknown',
          path: file.name,
          publicUrl: '',
          uploadedAt: new Date(file.created_at)
        }));
        setUploadedFiles(files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError('');
    uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    if (!selectedBucket || !selectedCategory) {
      setError('Please select a bucket and category');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', selectedBucket);
        formData.append('userId', userId);
        formData.append('category', selectedCategory);

        const response = await fetch('/api/storage', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        // Update progress
        setUploadProgress(((index + 1) / files.length) * 100);

        if (result.success) {
          const uploadedFile: UploadedFile = {
            id: result.data.path,
            name: result.data.name,
            size: result.data.size,
            type: result.data.type,
            path: result.data.path,
            publicUrl: result.data.publicUrl,
            uploadedAt: new Date()
          };

          setUploadedFiles(prev => [uploadedFile, ...prev]);
          
          if (onUploadComplete) {
            onUploadComplete(result);
          }
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      });

      await Promise.all(uploadPromises);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      const response = await fetch(`/api/storage?bucket=${selectedBucket}&path=${filePath}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.path !== filePath));
      } else {
        setError(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Delete failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
          <CardDescription>
            Upload and manage files in Supabase storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bucket Selection */}
          <div className="space-y-2">
            <Label htmlFor="bucket">Storage Bucket</Label>
            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
              <SelectTrigger>
                <SelectValue placeholder="Select a storage bucket" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STORAGE_BUCKETS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">File Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select file category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILE_CATEGORIES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports images, PDFs, and documents up to 10MB
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selectedBucket || !selectedCategory}
              className="mb-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Files</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.publicUrl, '_blank')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFile(file.path)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



