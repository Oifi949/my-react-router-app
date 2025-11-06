import React, { useRef, useState, useEffect } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlinePhotograph } from "react-icons/hi";
import { PiRectangleDashedLight } from "react-icons/pi";
import { TbUserSquare } from "react-icons/tb";
import { IoChevronDown } from "react-icons/io5";
import { MdOutlineLocationOn } from "react-icons/md";
import { useAuth } from "~/context/authcontext";
import supabase from "~/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";

export default function MediaEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [collaboratorsInput, setCollaboratorsInput] = useState("");
  const [shareToFacebook, setShareToFacebook] = useState(true);
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const maxText = 2200;
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedSrc, setCroppedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 25,
    y: 25,
    width: 150,
    height: 50,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save file for later
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };
  function handleCrop(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!completedCrop || !imgRef.current) return resolve(null);

      const canvas = document.createElement("canvas");
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width!;
      canvas.height = completedCrop.height!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      ctx.drawImage(
        image,
        completedCrop.x! * scaleX,
        completedCrop.y! * scaleY,
        completedCrop.width! * scaleX,
        completedCrop.height! * scaleY,
        0,
        0,
        completedCrop.width!,
        completedCrop.height!
      );

      const base64Image = canvas.toDataURL("image/jpeg");
      setCroppedSrc(base64Image);
      resolve(base64Image);
    });
  }

  async function createPost(content: string) {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    if (!content.trim()) {
      console.warn("Post content is empty.");
      return;
    }

    if (content.length > maxText) {
      console.warn("Post exceeds maximum length.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      let imageUrl = uploadedImageUrl;
      let mediaType: "image" | "video" = "image";

      if (!hasUploaded) {
        const file = croppedSrc
          ? base64ToFile(croppedSrc, `cropped_${Date.now()}.jpg`)
          : selectedFile;

        if (!file) {
          alert("Please select a file before posting.");
          setLoading(false);
          return;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("instagram-clone-bucket")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("Upload failed.");
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("instagram-clone-bucket")
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrlData?.publicUrl ?? "";
        mediaType = file.type.startsWith("video") ? "video" : "image";

        setUploadedImageUrl(imageUrl);
        setHasUploaded(true);
      }

      const profilePayload = {
        auth_user: user.id,
        email: user.email,
        username: user.user_metadata.username,
        fullname: user.user_metadata.fullName,
        image: user.user_metadata.image,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("user_profile")
        .upsert(profilePayload, { onConflict: "auth_user" });
      const { error: insertError } = await supabase.from("post").insert([
        {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id,
          media_type: mediaType,
          media: imageUrl,
          description: content,
          advance_settings: {
            shareToFacebook,
            location: locationInput,
            collaborators: collaboratorsInput,
          },
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        toast.error("Failed to share post.");
      } else {
        toast.success("Post shared!");
        navigate("/", {});
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const [aspect, setAspect] = useState<number | undefined>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [filter, setFilter] = useState("none");

  const dragging = useRef(false);
  const rotating = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleClick = () => fileInputRef.current?.click();

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    rotating.current = e.shiftKey;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    if (rotating.current) {
      setRotation((prev) => prev + dx * 0.5);
    } else {
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleMouseUp = () => {
    dragging.current = false;
    rotating.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setScale((prev) => Math.max(0.5, Math.min(prev - e.deltaY * 0.001, 3)));
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex fixed flex-col backdrop-blur-sm justify-center w-dvw h-dvh z-40 mt-6 xl:mt-0 items-center space-y-6 text-white">
      {step === 1 && (
        <div className="text-center w-[800px]">
          <div className="bg-black w-full rounded-t-lg py-1 border-b border-b-gray-700">
            Create New Post
          </div>
          <div className="flex flex-col items-center justify-center rounded-b-xl border border-gray-800 bg-[#262626] shadow-2xl p-8 w-full h-[75vh]">
            <p className="">
              <svg
                aria-label="Icon to represent media such as images or videos"
                className="x1lliihq x1n2onr6 x5n08af"
                fill="currentColor"
                height="77"
                role="img"
                viewBox="0 0 97.6 77.3"
                width="96"
              >
                <title>Icon to represent media such as images or videos</title>
                <path
                  d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z"
                  fill="currentColor"
                ></path>
                <path
                  d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z"
                  fill="currentColor"
                ></path>
                <path
                  d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z"
                  fill="currentColor"
                ></path>
              </svg>
            </p>
            <p className="text-lg mb-4">
              Drag photos here or select from computer
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              id="upLoad"
              onChange={handleFileChange}
              accept="image/*, video/*"
            />
            <label
              htmlFor="upLoad"
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-md font-semibold"
            >
              Select from computer
            </label>
          </div>
        </div>
      )}
      {step === 2 && image && (
        <div className="relative flex flex-col items-center w-full max-w-[700px] max-h-[75vh] bg-[#262626] rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-black w-full py-2 border-b border-gray-700 rounded-t-lg">
            <div className="flex items-center justify-between px-4 text-white">
              <IoArrowBack
                onClick={() => setStep(1)}
                size={24}
                className="cursor-pointer"
              />
              <span className="font-semibold text-lg">Crop</span>
              <button
                className="text-purple-500 hover:text-purple-400 font-semibold transition"
                onClick={() => {
                  handleCrop();
                  setStep(3);
                }}
              >
                Next
              </button>
            </div>
          </div>

          {/* Crop Area */}
          <div
            className="w-full bg-black/40 border border-white/10 rounded-b-lg overflow-hidden"
            onWheel={handleWheel}
          >
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              ruleOfThirds
            >
              <img
                src={image}
                ref={imgRef}
                alt="Editable"
                onMouseDown={handleMouseDown}
                className="h-[500px] min-w-[700px] object-cover cursor-grab active:cursor-grabbing select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                  filter,
                  transition: dragging.current
                    ? "none"
                    : "transform 0.2s ease-out",
                }}
              />
            </ReactCrop>
          </div>

          {/* Aspect Ratio Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-3 bg-[#484848] text-white rounded-full absolute bottom-6 left-6 hover:bg-[#5a5a5a] transition"
            aria-label="Change Aspect Ratio"
          >
            <PiRectangleDashedLight size={24} />
          </button>

          {/* Aspect Ratio Modal */}
          {isOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="bg-neutral-900/90 border border-neutral-700 rounded-xl p-6 shadow-xl w-[300px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-white font-semibold text-lg border-b border-neutral-700 pb-3 mb-4">
                  <span>Aspect Ratio</span>
                  <HiOutlinePhotograph size={26} className="text-gray-300" />
                </div>

                <div className="space-y-2">
                  {[
                    { label: "1:1", value: 1 / 1 },
                    { label: "4:5", value: 4 / 5 },
                    { label: "16:9", value: 16 / 9 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setAspect(item.value);
                        setIsOpen(false);
                      }}
                      className="w-full py-2 px-4 rounded-lg text-gray-200 bg-neutral-800 hover:bg-neutral-700 hover:text-white transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {step === 3 && image && (
        <div className="w-full max-w-6xl mx-auto bg-[#262626] rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-[#262626] w-full py-2 border-b border-gray-700 rounded-t-lg">
            <div className="flex items-center justify-between px-4 text-white">
              <IoArrowBack
                onClick={() => setStep(2)}
                size={24}
                className="cursor-pointer"
              />
              <span className="font-semibold text-lg">Create New Post</span>
              <button
                onClick={() => createPost(content)}
                disabled={loading}
                type="submit"
                className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-auto lg:h-[75vh] bg-[#262626]">
            {/* Image Preview */}
            <div className="flex justify-center items-center p-4 w-full lg:w-2/3">
              <img
                src={croppedSrc ?? ""}
                className="w-full max-w-[700px] h-auto object-cover rounded-md"
                alt="Edited Preview"
              />
            </div>

            {/* Post Details */}
            <div className="w-full lg:w-1/3 p-4 bg-[#262626] rounded-br-lg shadow-inner border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user?.user_metadata.image}
                  className="w-10 h-10 object-cover rounded-full"
                  alt="User avatar"
                />
                <span className="font-semibold text-white">
                  {user?.user_metadata.username}
                </span>
              </div>

              {/* Caption */}
              <div className="mb-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a caption... (max 2200 words)"
                  className="w-full h-32 md:h-40 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-500 mt-1 text-right">
                  {wordCount}/{maxText} words
                </div>
              </div>

              {/* Location & Collaborators */}
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center justify-between border-b pb-2">
                  <input
                    type="text"
                    placeholder="Add Location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full text-sm p-2 bg-transparent focus:outline-none"
                  />
                  <MdOutlineLocationOn
                    size={22}
                    className="text-gray-500 ml-2"
                  />
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <input
                    type="text"
                    placeholder="Add Collaborators"
                    value={collaboratorsInput}
                    onChange={(e) => setCollaboratorsInput(e.target.value)}
                    className="w-full text-sm p-2 bg-transparent focus:outline-none"
                  />
                  <TbUserSquare size={22} className="text-gray-500 ml-2" />
                </div>

                {/* Share Toggle */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-400">Share to</p>
                    <p className="text-sm text-gray-500 hidden">
                      Oluwa Pelumi · Friends
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareToFacebook}
                      onChange={() => setShareToFacebook(!shareToFacebook)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />
                  </label>
                </div>

                {/* Expandable Options */}
                <button className="py-3 text-gray-500 flex justify-between w-full hover:text-gray-300">
                  <span>Accessibility</span>
                  <IoChevronDown size={20} />
                </button>
                <button className="py-3 text-gray-500 flex justify-between w-full hover:text-gray-300">
                  <span>Advanced Settings</span>
                  <IoChevronDown size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "text-sm sm:text-base px-4 py-3 rounded-md shadow-md",
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#4ade80", // green
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171", // red
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}
