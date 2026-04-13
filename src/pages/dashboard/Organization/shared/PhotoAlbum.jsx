import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Loader2, ZoomIn } from "lucide-react";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../../utils/uploadToCloudinary";
import API from "../../../../utils/api";

const PhotoAlbum = ({ organizationId, photos = [], onPhotosUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const savePhotoAlbum = async (updatedPhotos) => {
    const response = await API.patch(`/organizations/${organizationId}/field`, {
      field: "organization.photoAlbum",
      value: updatedPhotos,
    });

    if (!response?.success) {
      throw new Error(response?.message || "Failed to save photo album");
    }

    return response;
  };

  const handlePhotoUpload = async (files) => {
    try {
      setUploading(true);
      const uploadToast = toast.loading("Uploading photos...");

      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select valid image files");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          continue;
        }

        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
          uploadedUrls.push({
            url: imageUrl,
            caption: "",
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      if (uploadedUrls.length > 0) {
        const updatedPhotos = [...photos, ...uploadedUrls];

        await savePhotoAlbum(updatedPhotos);
        onPhotosUpdate(updatedPhotos);
        toast.success(`Uploaded ${uploadedUrls.length} photos successfully`, {
          id: uploadToast,
        });
      } else {
        toast.dismiss(uploadToast);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error(typeof error === "string" ? error : "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handlePhotoUpload(files);
    }
    e.target.value = "";
  };

  const removePhoto = async (index) => {
    try {
      const updatedPhotos = photos.filter((_, i) => i !== index);

      await savePhotoAlbum(updatedPhotos);
      onPhotosUpdate(updatedPhotos);
      toast.success("Photo removed successfully");
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error(typeof error === "string" ? error : "Failed to remove photo");
    }
  };

  const updateCaption = async (index, caption) => {
    try {
      const updatedPhotos = photos.map((photo, i) =>
        i === index ? { ...photo, caption } : photo
      );

      await savePhotoAlbum(updatedPhotos);
      onPhotosUpdate(updatedPhotos);
    } catch (error) {
      console.error("Error updating caption:", error);
      toast.error(typeof error === "string" ? error : "Failed to update caption");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Photo Gallery</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? "Uploading..." : "Add Photos"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <p className="text-sm text-gray-500">
          Upload multiple photos to showcase your organization's activities and
          events
        </p>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedImage(photo)}
                />
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setSelectedImage(photo)}
                  className="p-2 bg-white/90 rounded-full m-1 hover:bg-white transition-all"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => removePhoto(index)}
                  className="p-2 bg-white/90 rounded-full m-1 hover:bg-red-50 text-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Caption Input */}
              <div className="p-3">
                <input
                  type="text"
                  value={photo.caption || ""}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Add caption..."
                  className="w-full text-sm border-none outline-none bg-transparent placeholder-gray-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-500 mb-4">
            Upload photos to showcase your organization's activities
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Upload First Photo
          </button>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                  <p className="text-center">{selectedImage.caption}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoAlbum;
