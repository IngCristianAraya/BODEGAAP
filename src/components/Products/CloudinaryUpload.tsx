"use client";
import React, { useRef, useState } from 'react';

// Cambia por tu cloud_name de Cloudinary
const CLOUDINARY_CLOUD_NAME = "dyhgwvz8b"; // TU CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = "BODEGAPP"; // TU UPLOAD_PRESET

export default function CloudinaryUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        onUpload(data.secure_url);
      } else {
        setError("Error al subir imagen");
      }
    } catch (err) {
      setError("Error de red o Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Subiendo imagen..." : "Subir Imagen"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
