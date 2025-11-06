import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";

export default function AddNewPost() {
  const [showPopup, setShowPopup] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    caption: "",
    location: "",
    imageFile: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading post:", formData);
    // Upload logic goes here
  };

  return (
    <div className="">
    <button
  onClick={() => setShowPopup(true)}
  className="bg-[rgb(18,18,18)] border-4 border-gray-800 text-white xl:ml-[400px] m-[20px] cursor-pointer size-20 rounded-full shadow-lg text-3xl grid place-items-center"
>
  <FaPlus />
</button>
      {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-[#0d0d0d] text-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-3 right-3 text-gray-400 cursor-pointer hover:text-white text-xl"
      >
        <FaTimes />
      </button>
      <div className="max-w-md mx-auto mt-10 bg-[#0d0d0d] text-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">📸 Add New Post</h2>
      <label className="block mb-4 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="w-full h-64 bg-[#1a1a1a] border border-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-800 transition">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400">Click to upload image</span>
          )}
        </div>
      </label>
      <textarea
        placeholder="Write a caption..."
        value={formData.caption}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, caption: e.target.value }))
        }
        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 mb-4 resize-none"
        rows={3}
      />
      <input
        type="text"
        placeholder="Add location (optional)"
        value={formData.location}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, location: e.target.value }))
        }
        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 mb-6"
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3 rounded-lg font-semibold"
      >
        Share Post
      </button>
    </div>
    </div>
  </div>
)}
    </div>
  );
}
