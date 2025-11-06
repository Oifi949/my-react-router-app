("use client");
import { Link } from "react-router";
import { useAuth } from "~/context/authcontext";
import AddNewPost from "./add-new-post-profile";
import Layout from "./layout";


export function meta() {
  return [
    { title: "Instagram | Clone | Profile" },
    {
      name: "description",
      content:
        "A responsive Instagram-like page built with React Router and Tailwind CSS.",
    },
  ];
}

export default function InstagramProfile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="bg-black w-full h-4dvh text-white">
      <Layout/>
      <main className="pt-24 sm:pt-36 md:pt-16 xl:pt-0 bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] min-h-screen text-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:gap-10 gap-6 mb-10">
            <img
              src={user.user_metadata.image}
              alt="Profile"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#2e2e2e] shadow-xl transition-transform hover:scale-105"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                @{user.user_metadata.username}
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md italic">
                {user.user_metadata.about ||
                  "This user hasn't added a bio yet."}
              </p>
              <div className="flex justify-center sm:justify-start gap-6 mt-4 text-sm text-gray-300">
                <span>
                  <strong className="text-white">54</strong> posts
                </span>
                <span>
                  <strong className="text-white">1.2k</strong> followers
                </span>
                <span>
                  <strong className="text-white">300</strong> following
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/complete-profile"
              className="bg-[#25292E] hover:bg-[#3a3f45] transition-colors duration-300 ease-in-out py-3 px-6 rounded-xl w-full sm:w-1/2 text-center font-semibold shadow-md hover:shadow-lg"
            >
              ✏️ Edit Profile
            </Link>
            <button className="bg-[#25292E] hover:bg-[#3a3f45] transition-colors duration-300 ease-in-out py-3 px-6 rounded-xl w-full sm:w-1/2 text-center font-semibold shadow-md hover:shadow-lg">
              🗂️ View Archive
            </button>
          </div>
        </div>
        <AddNewPost></AddNewPost>
      </main>
    </div>
  );
}
