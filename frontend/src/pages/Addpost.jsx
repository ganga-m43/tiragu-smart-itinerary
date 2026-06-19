import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Normalize API base and ensure it includes the /api/itinerary prefix once
const RAW_API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
const API_PREFIX = RAW_API_BASE.endsWith("/api/itinerary")
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api/itinerary`;

const Addpost = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // Cloudinary URLs returned by backend
  const [isPublic, setIsPublic] = useState(false);

  // Local files for preview before upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create/revoke object URLs for previews
  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFilePreviews(previews);
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [selectedFiles]);

  const onDrop = useCallback((acceptedFiles) => {
    // Validate file size (15MB max per image)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
    const validFiles = [];
    const invalidFiles = [];

    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    // Show error for files that exceed size limit
    if (invalidFiles.length > 0) {
      setUploadError(
        `These files exceed 15MB limit: ${invalidFiles.join(", ")}`
      );
    } else {
      setUploadError("");
    }

    // Append valid files (limit to 12 like your backend)
    setSelectedFiles((prev) => {
      const next = [...prev, ...validFiles];
      return next.slice(0, 12);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    maxFiles: 12,
    maxSize: 15 * 1024 * 1024, // 15MB max per file
  });

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadSelected = async () => {
    if (!selectedFiles.length) return;
    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("images", f));

      const res = await axios.post(
        `${API_PREFIX}/stories/upload`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const urls = res?.data?.images || [];
      setImages((prev) => [...prev, ...urls]);
      setSelectedFiles([]); // clear local selections after successful upload
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !destination || !content) {
      alert("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image first");
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_PREFIX}/stories`,
        { title, destination, content, isPublic, images }
      );
      
      // Clear form
      setTitle("");
      setDestination("");
      setContent("");
      setIsPublic(false);
      setImages([]);

      // Navigate to stories page
      navigate("/stories");
    } catch (err) {
      console.error("Create story failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to create story");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 mt-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Share Your Journey
          </h1>
          <p className="text-gray-600">
            Craft your travel story and inspire others.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Trip Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter trip title"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter location"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Travel Story
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Share your experience..."
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Post Visibility
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Public</span>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    !isPublic ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      !isPublic ? "translate-x-6" : ""
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Private</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {submitting ? "Publishing..." : "Publish Your Story"}
            </button>
          </div>

          {/* Right Section - Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Images
            </label>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-700">
                {isDragActive
                  ? "Drop images here..."
                  : "Drag & drop images here, or click to select"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Up to 12 images. Max 15MB per image. JPG/PNG/WebP recommended.
              </p>
            </div>



            {/* Local previews before upload */}
            {filePreviews.length > 0 && (
              <div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filePreviews.map((p, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={p.preview}
                        alt={`preview-${idx}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={uploadSelected}
                    disabled={uploading}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {uploading ? (
                      <span className="loading loading-ring loading-md"></span>
                    ) : (
                      `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`
                    )}
                  </button>
                  {uploadError && (
                    <span className="text-red-600 text-sm">{uploadError}</span>
                  )}
                </div>
              </div>
            )}

            {/* Already uploaded images (Cloudinary URLs) */}
            {images.length > 0 && (
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Uploaded: {images.length} image{images.length > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`uploaded-${idx}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addpost;
