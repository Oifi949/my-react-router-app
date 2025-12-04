import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "~/context/authcontext";
import { useNavigate, useLocation } from "react-router";
import type { post } from "~/../src/types";
import { cn } from "../lib/utilis";
import { FaCircleChevronRight } from "react-icons/fa6";
import PostCard from "~/components/postCard";
import supabase from "~/lib/supabase";
import { TbLoader3 } from "react-icons/tb";
import toast from "react-hot-toast";
import SkeletonLoader from "../components/skeletonLoader";

export function meta() {
  return [
    { title: "Instagram | Clone" },
    {
      name: "description",
      content:
        "A responsive Instagram-like page built with React Router and Tailwind CSS.",
    },
  ];
}

const userStories = [...Array(20)];

export default function Home() {
  const { user, handleLogout, isAuthLoading } = useAuth();
  const userStoriesRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setshowLeftArrow] = useState(false);
  const [showRightArrow, setshowRightArrow] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(33);
  const [posts, setPosts] = useState<post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostAvailable, setNewPostAvailable] = useState(false);
  const [refectingPost, setRefectingPost] = useState(false);
  const location = useLocation();
  // const state = (location && (location as any).state) || {};

  // If a new post was passed via navigation state, show it at the top
  const state = (location && (location as any).state) || {};
  const newPost: post | undefined = state?.newPost;
  const navSuccess: string | undefined = state?.successMessage;
  const [flashMessage, setFlashMessage] = useState<string | undefined>(
    navSuccess
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("post")
          .select("*, user_profile(*)")
          .order("created_at", { ascending: false });
          

        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }

        if (data) {
          // If newPost exists and isn't in the fetched list, prepend it
          const mergedPosts = newPost
            ? [newPost, ...data.filter((p) => p.id !== newPost.id)]
            : data;

          setPosts(mergedPosts);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [newPost]);

  const reFetchPosts = async () => {
    setRefectingPost(true);
    try {
      const { data, error } = await supabase
        .from("post")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error refetching posts:", error);
        return;
      }

      if (data) {
        const mergedPosts = newPost
          ? [newPost, ...data.filter((p) => p.id !== newPost.id)]
          : data;

        setPosts(mergedPosts);
        setNewPostAvailable(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setRefectingPost(false);
    }
  };

  useEffect(() => {
    if (navSuccess) {
      toast.success(navSuccess);
      const t = setTimeout(() => setFlashMessage(undefined), 4000);
      return () => clearTimeout(t);
    }
  }, [navSuccess]);

  const handleScrollLeft = () => {
    const userStories = userStoriesRef.current;
    if (userStories && userStories.scrollLeft) userStories.scrollLeft -= 356;
  };

  const handleScrollRight = () => {
    const userStories = document.getElementById("user-stories");
    if (userStories) userStories.scrollLeft += 356;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  useEffect(() => {
    const handleScroll = () => {
      const element = userStoriesRef.current;
      if (element) {
        setshowLeftArrow(element.scrollLeft > 0);
        setshowRightArrow(
          element.scrollLeft !== element.scrollWidth - element.clientWidth
        );
      }
    };

    const element = userStoriesRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <img
          src="/images/instagram-logo.png"
          alt="Instagram Logo"
          className="w-20 h-20 mb-6"
        />
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] border-opacity-50"></div>
        <p className="mt-4 text-gray-500 text-sm">Loading Instagram Clone...</p>
      </div>
    );
  }

  if (!user) {
    return;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      {flashMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow">
            {flashMessage}
          </div>
        </div>
      )}
      <main className="xl:ml-[312px] md:ml-[80px] pt-[20px] px-2 md:px-0">
        <section className="flex flex-col xl:flex-row justify-center xl:items-start items-center gap-8 xl:gap-[120px]">
          <div className="w-full md:w-auto mt-[50px] xl:mt-0">
            <div className="max-w-[750px] w-full mt-4">
              <div className="relative group mb-6 w-full">
                <div
                  ref={userStoriesRef}
                  id="user-stories"
                  className="w-full py-2 px-3 flex items-center gap-4 max-w-[750px] justify-center mx-auto overflow-x-auto scroll-smooth scrollbar-hide"
                >
                  {userStories.map((_, index) => (
                    <div
                      className="flex flex-col justify-center items-center min-w-[100px] sm:min-w-[110px]"
                      key={index}
                    >
                      <div className="w-[112px] h-[112px] sm:w-[120px] sm:h-[115px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-1 select-none">
                        <img
                          src={
                            (index + 1) % 2 === 0
                              ? "https://th.bing.com/th/id/OIP.RjBTD5bWL2drUxJpfRUGfAAAAA?w=183&h=183&c=7&r=0&o=7&pid=1.7&rm=3"
                              : "https://tse2.mm.bing.net/th/id/OIP.4X5isn6ic0SMVjyaznsnzgHaNK?pid=ImgDet&w=188&h=333&c=7&o=7&rm=3"
                          }
                          alt="ssssangha"
                          className="w-full p-0.5 h-full rounded-full bg-black border-2 border-black object-cover"
                        />
                      </div>
                      <p className="text-sm sm:text-[14px] font-bold text-center mt-2">
                        {(index + 1) % 2 === 0 ? "ceeMee" : "Oifijo2"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Left Arrow */}
                <div
                  className={cn(
                    "absolute left-3 top-[35%] rotate-180 cursor-pointer select-none transition-all duration-300",
                    showLeftArrow
                      ? "group-hover:opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                  onClick={handleScrollLeft}
                >
                  <FaCircleChevronRight size={28} />
                </div>

                {/* Right Arrow */}
                <div
                  className={cn(
                    "absolute right-2 sm:right-3 top-[35%] cursor-pointer select-none transition-all duration-300 z-10",
                    showRightArrow
                      ? "group-hover:opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                  onClick={handleScrollRight}
                >
                  <FaCircleChevronRight size={28} />
                </div>
              </div>
            </div>

            <div className="max-w-[600px] mx-auto text-white rounded-xl shadow-lg overflow-hidden mt-8">
              {newPostAvailable && (
                <div
                  className="absolute top-[150px] left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full"
                  onClick={reFetchPosts}
                >
                  {refectingPost ? (
                    <div className="flex items-center gap-2">
                      Refecting Post...{" "}
                      <TbLoader3 size={16} className="animate-spin" />
                    </div>
                  ) : (
                    "New Post Available"
                  )}
                </div>
              )}

              <div className="space-y-4">
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <SkeletonLoader key={index} />
                    ))
                  : posts.map((post, index) => (
                      <PostCard
                        key={post.id || index}
                        post={post}
                        index={index}
                      />
                    ))}
              </div>
            </div>
          </div>
          <div className="hidden mt-[10px] xl:block">
            <div className="flex">
              <div className="size-[55px]">
                <img
                  src={user.user_metadata.image}
                  className="size-[44px] rounded-full"
                />
              </div>
              <div className="w-[183.53px]">
                <b>{user.user_metadata.username}</b>
                <br />
                <div className="text-[12px] text-gray-400">
                  {user.user_metadata.about}
                </div>
              </div>
              <div className="text-[12px] text-blue-500 cursor-pointer">
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
            <div className="flex">
              <div className="text-gray-400 w-[250.08px] text-[14px]">
                Suggested for you
              </div>
              <div className="">
                <b>See All</b>
              </div>
            </div>
            <div className="flex h-[60px] mt-[15px]">
              <div className="size-[55px]">
                <img
                  src="https://tse2.mm.bing.net/th/id/OIP.DYCjTPsFVCT90BuzShcfhAHaMR?pid=ImgDet&w=194&h=322&c=7&o=7&rm=3"
                  className="size-[44px] rounded-full"
                />
              </div>
              <div className="w-[183.53px]">
                <b>owolabifeolami</b>
                <br />
                <div className="text-[12px] text-gray-400">Oluwa Pelumi</div>
              </div>
              <div className="text-[12px] text-blue-500">
                <a href="#">Switch</a>
              </div>
            </div>
            <div className="flex mt-[15px]">
              <div className="size-[55px]">
                <img
                  src="https://th.bing.com/th/id/OIP.5iVyXqRtvCrgKhF5sYbAEAHaHs?w=175&h=181&c=7&r=0&o=7&pid=1.7&rm=3"
                  className="size-[44px] rounded-full"
                />
              </div>
              <div className="w-[183.53px]">
                <b>owolabifeolami</b>
                <br />
                <div className="text-[12px] text-gray-400">Oluwa Pelumi</div>
              </div>
              <div className="text-[12px] text-blue-500">
                <a href="#">Switch</a>
              </div>
            </div>
            <div className="flex mt-[15px]">
              <div className="size-[55px]">
                <img
                  src="https://th.bing.com/th/id/OIP.302zgzUHVpOuGmsmRZudiAHaHk?w=177&h=181&c=7&r=0&o=7&pid=1.7&rm=3"
                  className="size-[44px] rounded-full"
                />
              </div>
              <div className="w-[183.53px]">
                <b>owolabifeolami</b>
                <br />
                <div className="text-[12px] text-gray-400">Oluwa Pelumi</div>
              </div>
              <div className="text-[12px] text-blue-500">
                <a href="#">Switch</a>
              </div>
            </div>
            <div className="flex mt-[15px]">
              <div className="size-[55px]">
                <img
                  src="https://th.bing.com/th/id/OIP.RjBTD5bWL2drUxJpfRUGfAAAAA?w=183&h=183&c=7&r=0&o=7&pid=1.7&rm=3"
                  className="size-[44px] rounded-full"
                />
              </div>
              <div className="w-[183.53px]">
                <b>owolabifeolami</b>
                <br />
                <div className="text-[12px] text-gray-400">Oluwa Pelumi</div>
              </div>
              <div className="text-[12px] text-blue-500">
                <a href="#">Switch</a>
              </div>
            </div>

            <div className="">
              <div className="text-gray-400 text-[12px]">
                About.Help.Press.API.Jobs.Privacy.Terms.Locations.
                <br />
                Language.Meta Verified
              </div>
              <div className="">
                <span className="flex gap-1 mt-[24px] text-gray-400 text-[12px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-copyright-icon lucide-copyright"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
                  </svg>
                  <p className="">by Qwolabiy in 2025</p>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    
  );
}
