import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api, getMediaUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string | null;
  onPhotoUpdated?: (newUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentAvatarUrl,
  onPhotoUpdated,
  size = 'md',
  shape = 'circle',
}) => {
  const { user, refreshUserProfile } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileSelected = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Format validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload JPG, JPEG, PNG, or WEBP image format.');
      return;
    }

    // 2. Max 5MB validation
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg('Profile photo must be 5 MB or smaller.');
      return;
    }

    // Client-side instant preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/auth/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newAvatarUrl = response.data.avatarUrl;
      setPreviewUrl(newAvatarUrl);
      setSuccessMsg('Profile photo updated successfully!');
      if (onPhotoUpdated) onPhotoUpdated(newAvatarUrl);
      if (refreshUserProfile) await refreshUserProfile();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to upload profile photo. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setIsUploading(true);
      await api.delete('/auth/profile-photo');
      setPreviewUrl(null);
      setSuccessMsg('Profile photo removed.');
      if (onPhotoUpdated) onPhotoUpdated(null);
      if (refreshUserProfile) await refreshUserProfile();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to remove photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Photo Preview & Dropzone */}
      <div
        className={`relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-all ${
          shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
        } ${sizeClasses[size]} overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 shadow-inner`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        title="Click or drag image to upload (Max 5MB)"
      >
        {previewUrl ? (
          <img
            src={getMediaUrl(previewUrl)}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2 text-center">
            <Camera className="w-6 h-6 mb-1 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
            <span className="text-[10px] font-medium leading-tight">Upload Photo</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
          {isUploading ? (
            <RefreshCw className="w-5 h-5 animate-spin text-white" />
          ) : (
            <>
              <Upload className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Change</span>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
          }
        }}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />

      {/* Action Buttons & Guidance */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={isUploading}
            className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium rounded-lg transition flex items-center space-x-1"
            title="Remove photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
        JPG, PNG, or WEBP • Max 5 MB
      </p>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="flex items-center space-x-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
