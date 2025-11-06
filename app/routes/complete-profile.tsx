import React, { useState, useRef } from "react";
import { useAuth } from "~/context/authcontext";
import { useNavigate } from "react-router";
import supabase from "~/lib/supabase";

const AVATARS = [
  {
    id: 1,
    name: "Avatar 1",
    src: "https://th.bing.com/th/id/OIP.5iVyXqRtvCrgKhF5sYbAEAHaHs?w=175&h=181&c=7&r=0&o=7&pid=1.7&rm=3",
  },
  {
    id: 2,
    name: "Avatar 2",
    src: "https://th.bing.com/th/id/OIP.AuX7BFeY5TbRYoqQDpPDbQHaH5?w=170&h=181&c=7&r=0&o=7&pid=1.7&rm=3",
  },
  {
    id: 3,
    name: "Avatar 3",
    src: "https://th.bing.com/th/id/OIP.302zgzUHVpOuGmsmRZudiAHaHk?w=177&h=181&c=7&r=0&o=7&pid=1.7&rm=3",
  },
  {
    id: 4,
    name: "Avatar 4",
    src: "https://tse2.mm.bing.net/th/id/OIP.DYCjTPsFVCT90BuzShcfhAHaMR?pid=ImgDet&w=194&h=322&c=7&o=7&rm=3",
  },
];

export default function CompleteProfile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.user_metadata?.username || "",
    about: user?.user_metadata?.about || "",
    fullName: user?.user_metadata.fullName || "",
    image: user?.user_metadata.image || "",
    imageFile: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAvatarSelect = (avatarId: number) => {
    setSelectedAvatar(avatarId);
    setImagePreview(null);
    const avatar = AVATARS.find((a) => a.id === avatarId);
    if (avatar) {
      setFormData((prev) => ({
        ...prev,
        image: avatar.src,
        imageFile: null,
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 10MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setSelectedAvatar(null);
      setFormData((prev) => ({
        ...prev,
        image: result,       // ✅ Now inside the callback
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  }
};
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.about.trim()) {
      newErrors.about = "Description is required";
    }

    if (!formData.image) {
      newErrors.image = "Please select a profile image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = formData.image;

      // If user uploaded a custom image, upload it to Supabase storage
      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split(".").pop();
        const fileName = `${user?.id}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("instagram-complete-profile-bucket")
          .upload(filePath, formData.imageFile, {
            upsert: true,
            metadata: { username: formData.username },
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("instagram-complete-profile-bucket")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: dbError } = await supabase.from("user_profile").upsert(
        {
          auth_user: user?.id,
          username: formData.username,
          fullName: formData.fullName,
          about: formData.about,
          image: imageUrl,
        },
        { onConflict: "id" }
      );

      if (dbError) {
        throw dbError;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          fullName: formData.fullName,
          about: formData.about,
          image: imageUrl,
        },
      });

      if (error) {
        throw error;
      }

      if (user) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            username: formData.username,
            about: formData.about,
            fullName: formData.fullName,
            image: imageUrl,
          },
        };
        setUser(updatedUser);
      }

      navigate("/");
    } catch (error: any) {
      console.error("Profile update failed:", error);
      setErrors({
        general: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-black border border-[#262626] rounded-lg p-8 mb-4">
          <div className="flex justify-center mb-8">
            <svg
              aria-label="Instagram"
              className="x1lliihq x1n2onr6 x5n08af"
              fill="currentColor"
              height={51}
              role="img"
              viewBox="32 4 113 32"
              width={175}
            >
              <title>Instagram</title>
              <path
                clipRule="evenodd"
                d="M37.82 4.11c-2.32.97-4.86 3.7-5.66 7.13-1.02 4.34 3.21 6.17 3.56 5.57.4-.7-.76-.94-1-3.2-.3-2.9 1.05-6.16 2.75-7.58.32-.27.3.1.3.78l-.06 14.46c0 3.1-.13 4.07-.36 5.04-.23.98-.6 1.64-.33 1.9.32.28 1.68-.4 2.46-1.5a8.13 8.13 0 0 0 1.33-4.58c.07-2.06.06-5.33.07-7.19 0-1.7.03-6.71-.03-9.72-.02-.74-2.07-1.51-3.03-1.1Zm82.13 14.48a9.42 9.42 0 0 1-.88 3.75c-.85 1.72-2.63 2.25-3.39-.22-.4-1.34-.43-3.59-.13-5.47.3-1.9 1.14-3.35 2.53-3.22 1.38.13 2.02 1.9 1.87 5.16ZM96.8 28.57c-.02 2.67-.44 5.01-1.34 5.7-1.29.96-3 .23-2.65-1.72.31-1.72 1.8-3.48 4-5.64l-.01 1.66Zm-.35-10a10.56 10.56 0 0 1-.88 3.77c-.85 1.72-2.64 2.25-3.39-.22-.5-1.69-.38-3.87-.13-5.25.33-1.78 1.12-3.44 2.53-3.44 1.38 0 2.06 1.5 1.87 5.14Zm-13.41-.02a9.54 9.54 0 0 1-.87 3.8c-.88 1.7-2.63 2.24-3.4-.23-.55-1.77-.36-4.2-.13-5.5.34-1.95 1.2-3.32 2.53-3.2 1.38.14 2.04 1.9 1.87 5.13Zm61.45 1.81c-.33 0-.49.35-.61.93-.44 2.02-.9 2.48-1.5 2.48-.66 0-1.26-1-1.42-3-.12-1.58-.1-4.48.06-7.37.03-.59-.14-1.17-1.73-1.75-.68-.25-1.68-.62-2.17.58a29.65 29.65 0 0 0-2.08 7.14c0 .06-.08.07-.1-.06-.07-.87-.26-2.46-.28-5.79 0-.65-.14-1.2-.86-1.65-.47-.3-1.88-.81-2.4-.2-.43.5-.94 1.87-1.47 3.48l-.74 2.2.01-4.88c0-.5-.34-.67-.45-.7a9.54 9.54 0 0 0-1.8-.37c-.48 0-.6.27-.6.67 0 .05-.08 4.65-.08 7.87v.46c-.27 1.48-1.14 3.49-2.09 3.49s-1.4-.84-1.4-4.68c0-2.24.07-3.21.1-4.83.02-.94.06-1.65.06-1.81-.01-.5-.87-.75-1.27-.85-.4-.09-.76-.13-1.03-.11-.4.02-.67.27-.67.62v.55a3.71 3.71 0 0 0-1.83-1.49c-1.44-.43-2.94-.05-4.07 1.53a9.31 9.31 0 0 0-1.66 4.73c-.16 1.5-.1 3.01.17 4.3-.33 1.44-.96 2.04-1.64 2.04-.99 0-1.7-1.62-1.62-4.4.06-1.84.42-3.13.82-4.99.17-.8.04-1.2-.31-1.6-.32-.37-1-.56-1.99-.33-.7.16-1.7.34-2.6.47 0 0 .05-.21.1-.6.23-2.03-1.98-1.87-2.69-1.22-.42.39-.7.84-.82 1.67-.17 1.3.9 1.91.9 1.91a22.22 22.22 0 0 1-3.4 7.23v-.7c-.01-3.36.03-6 .05-6.95.02-.94.06-1.63.06-1.8 0-.36-.22-.5-.66-.67-.4-.16-.86-.26-1.34-.3-.6-.05-.97.27-.96.65v.52a3.7 3.7 0 0 0-1.84-1.49c-1.44-.43-2.94-.05-4.07 1.53a10.1 10.1 0 0 0-1.66 4.72c-.15 1.57-.13 2.9.09 4.04-.23 1.13-.89 2.3-1.63 2.3-.95 0-1.5-.83-1.5-4.67 0-2.24.07-3.21.1-4.83.02-.94.06-1.65.06-1.81 0-.5-.87-.75-1.27-.85-.42-.1-.79-.13-1.06-.1-.37.02-.63.35-.63.6v.56a3.7 3.7 0 0 0-1.84-1.49c-1.44-.43-2.93-.04-4.07 1.53-.75 1.03-1.35 2.17-1.66 4.7a15.8 15.8 0 0 0-.12 2.04c-.3 1.81-1.61 3.9-2.68 3.9-.63 0-1.23-1.21-1.23-3.8 0-3.45.22-8.36.25-8.83l1.62-.03c.68 0 1.29.01 2.19-.04.45-.02.88-1.64.42-1.84-.21-.09-1.7-.17-2.3-.18-.5-.01-1.88-.11-1.88-.11s.13-3.26.16-3.6c.02-.3-.35-.44-.57-.53a7.77 7.77 0 0 0-1.53-.44c-.76-.15-1.1 0-1.17.64-.1.97-.15 3.82-.15 3.82-.56 0-2.47-.11-3.02-.11-.52 0-1.08 2.22-.36 2.25l3.2.09-.03 6.53v.47c-.53 2.73-2.37 4.2-2.37 4.2.4-1.8-.42-3.15-1.87-4.3-.54-.42-1.6-1.22-2.79-2.1 0 0 .69-.68 1.3-2.04.43-.96.45-2.06-.61-2.3-1.75-.41-3.2.87-3.63 2.25a2.61 2.61 0 0 0 .5 2.66l.15.19c-.4.76-.94 1.78-1.4 2.58-1.27 2.2-2.24 3.95-2.97 3.95-.58 0-.57-1.77-.57-3.43 0-1.43.1-3.58.19-5.8.03-.74-.34-1.16-.96-1.54a4.33 4.33 0 0 0-1.64-.69c-.7 0-2.7.1-4.6 5.57-.23.69-.7 1.94-.7 1.94l.04-6.57c0-.16-.08-.3-.27-.4a4.68 4.68 0 0 0-1.93-.54c-.36 0-.54.17-.54.5l-.07 10.3c0 .78.02 1.69.1 2.09.08.4.2.72.36.91.15.2.33.34.62.4.28.06 1.78.25 1.86-.32.1-.69.1-1.43.89-4.2 1.22-4.31 2.82-6.42 3.58-7.16.13-.14.28-.14.27.07l-.22 5.32c-.2 5.37.78 6.36 2.17 6.36 1.07 0 2.58-1.06 4.2-3.74l2.7-4.5 1.58 1.46c1.28 1.2 1.7 2.36 1.42 3.45-.21.83-1.02 1.7-2.44.86-.42-.25-.6-.44-1.01-.71-.23-.15-.57-.2-.78-.04-.53.4-.84.92-1.01 1.55-.17.61.45.94 1.09 1.22.55.25 1.74.47 2.5.5 2.94.1 5.3-1.42 6.94-5.34.3 3.38 1.55 5.3 3.72 5.3 1.45 0 2.91-1.88 3.55-3.72.18.75.45 1.4.8 1.96 1.68 2.65 4.93 2.07 6.56-.18.5-.69.58-.94.58-.94a3.07 3.07 0 0 0 2.94 2.87c1.1 0 2.23-.52 3.03-2.31.09.2.2.38.3.56 1.68 2.65 4.93 2.07 6.56-.18l.2-.28.05 1.4-1.5 1.37c-2.52 2.3-4.44 4.05-4.58 6.09-.18 2.6 1.93 3.56 3.53 3.69a4.5 4.5 0 0 0 4.04-2.11c.78-1.15 1.3-3.63 1.26-6.08l-.06-3.56a28.55 28.55 0 0 0 5.42-9.44s.93.01 1.92-.05c.32-.02.41.04.35.27-.07.28-1.25 4.84-.17 7.88.74 2.08 2.4 2.75 3.4 2.75 1.15 0 2.26-.87 2.85-2.17l.23.42c1.68 2.65 4.92 2.07 6.56-.18.37-.5.58-.94.58-.94.36 2.2 2.07 2.88 3.05 2.88 1.02 0 2-.42 2.78-2.28.03.82.08 1.49.16 1.7.05.13.34.3.56.37.93.34 1.88.18 2.24.11.24-.05.43-.25.46-.75.07-1.33.03-3.56.43-5.21.67-2.79 1.3-3.87 1.6-4.4.17-.3.36-.35.37-.03.01.64.04 2.52.3 5.05.2 1.86.46 2.96.65 3.3.57 1 1.27 1.05 1.83 1.05.36 0 1.12-.1 1.05-.73-.03-.31.02-2.22.7-4.96.43-1.79 1.15-3.4 1.41-4 .1-.21.15-.04.15 0-.06 1.22-.18 5.25.32 7.46.68 2.98 2.65 3.32 3.34 3.32 1.47 0 2.67-1.12 3.07-4.05.1-.7-.05-1.25-.48-1.25Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-white text-xl font-semibold mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-400 text-sm">
              Add your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-3">
                Profile Picture
              </label>

              {(imagePreview || selectedAvatar) && (
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <img
                      src={
                        imagePreview ||
                        (selectedAvatar
                          ? AVATARS.find((a) => a.id === selectedAvatar)?.src
                          : "")
                      }
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedAvatar(null);
                        setFormData((prev) => ({
                          ...prev,
                          image: "",
                          imageFile: null,
                        }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-3">Choose an avatar:</p>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${
                        selectedAvatar === avatar.id
                          ? "border-blue-500"
                          : "border-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={avatar.src}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">
                  Or upload your own:
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile image"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-4 bg-gray-800 border border-gray-600 rounded-md text-white text-sm hover:bg-gray-700 transition-colors"
                >
                  Upload Image
                </button>
              </div>

              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none text-sm ${
                  errors.username
                    ? "border-red-500"
                    : "border-[#262626] focus:border-gray-400"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none text-sm ${
                  errors.fullName
                    ? "border-red-500"
                    : "border-[#262626] focus:border-gray-400"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="about"
                placeholder="Add bio"
                value={formData.about}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none text-sm ${
                  errors.About
                    ? "border-red-500"
                    : "border-[#262626] focus:border-gray-400"
                }`}
              />
              {errors.about && (
                <p className="text-red-500 text-xs mt-1">{errors.about}</p>
              )}
            </div>

            {errors.general && (
              <div className="text-red-500 text-sm text-center">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.username ||
                !formData.fullName ||
                !formData.about ||
                (!formData.image && !formData.imageFile)
              }
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Completing..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
