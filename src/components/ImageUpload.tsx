"use client";

import { useState, useRef, useEffect } from 'react';

type ImageUploadProps = {
    onImageSelected: (base64: string | null) => void;
    initialImage?: string | null;
    label?: string;
};

export function ImageUpload({ onImageSelected, initialImage, label = "Project Image" }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(initialImage || null);
    }, [initialImage]);

    const handleFile = (file: File) => {
        setError(null);

        // Validate type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setError('Only JPEG and PNG images are allowed.');
            return;
        }

        // Validate size (optional, say 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            onImageSelected(base64);
        };
        reader.readAsDataURL(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onImageSelected(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1">{label} (Optional)</label>
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'
                    } ${error ? 'border-red-300 bg-red-50' : ''}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />

                {preview ? (
                    <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                ) : (
                    <div className="py-4">
                        <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Click or drag image to upload</p>
                        <p className="text-xs text-slate-400 mt-1">PNG or JPG (max 5MB)</p>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
