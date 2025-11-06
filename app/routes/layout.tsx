import React, { useState } from "react";
import { useRef } from "react";
import { GoHomeFill } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { useAuth } from "~/context/authcontext";
import { useNavigate } from "react-router";
import { PiInstagramLogoBold } from "react-icons/pi";
import { Link } from "react-router";
import { HiHome } from "react-icons/hi";
import { FaRegCompass } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { FaRegSquarePlus } from "react-icons/fa6";
import { LuCassetteTape } from "react-icons/lu";
import { Outlet } from "react-router";
import { FaPhotoVideo } from "react-icons/fa";
import { HiOutlineSquaresPlus } from "react-icons/hi2";
import Create from "../components/create";
import { RiCloseLargeFill } from "react-icons/ri";

export default function Layout() {
  const { user, handleLogout, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const dropdownRef = useRef(null);

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-black px-4">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-10 max-w-sm w-full text-center shadow-2xl">
          <h2 className="text-white text-3xl font-bold mb-4 tracking-tight">
            User Not Found
          </h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            We couldn’t locate an account with that information. You might want
            to double-check or return to the login page.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 ease-in-out"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-black text-white shadow-md z-50 xl:hidden">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          <img
            src="https://i1.wp.com/www.christinasandsengen.com/wp-content/uploads/2014/09/instagram-logo-black-on-white.png?fit=978%2C373"
            alt="Instagram Logo"
            className="w-24 md:hidden"
          />

          <div className="flex-1 mx-4 max-w-lg">
            <input
              type="search"
              className="w-full h-10 px-4 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Search users worldwide"
            />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 xl:hidden flex right-0 bg-black text-white rounded-2xl shadow-md z-50">
        <ul className="flex justify-between items-center w-full px-5 h-16">
          <Link to={"/"}>
            <li className="flex flex-col items-center">
              <HiHome className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </li>
          </Link>
          <li className="flex flex-col items-center">
            <FaRegCompass className="h-6 w-6" />
            <span className="text-xs">Search</span>
          </li>
          <li className="flex flex-col items-center">
            <LuCassetteTape className="h-6 w-6" />
            <span className="text-xs">Reel</span>
          </li>
          <li
            className="flex flex-col cursor-pointer items-center"
            onClick={() => setShowUploadImage(true)}
          >
            <FaRegSquarePlus className="h-6 w-6" />
            <span className="text-xs">Create</span>
          </li>
          <li className="flex flex-col items-center">
            <RiMessengerLine className="h-6 w-6" />
            <span className="text-xs">Messenger</span>
          </li>
          <Link to={"/profile"}>
            <li className="flex flex-col items-center">
              <img
                src={user.user_metadata.image}
                alt="Profile"
                className="h-6 w-6 rounded-3xl"
              />
              <span className="text-xs">Profile</span>
            </li>
          </Link>
        </ul>
      </nav>
      <div className="flex-col justify-between 3xl:pl-5 xl:w-[311px] bg-black w-[70px] border-r-gray-900 h-[100vh] hidden lg:flex z-10 border-r-[1px] fixed ">
        <div className="">
          <div className="rounded-full mx-3 h-[92px] flex items-center">
            <img
              src="https://i1.wp.com/www.christinasandsengen.com/wp-content/uploads/2014/09/instagram-logo-black-on-white.png?fit=978%2C373"
              className="w-[103px] xl:flex hidden"
              alt=""
            />
            <PiInstagramLogoBold className="text-[25px] xl:hidden" />
          </div>
          <div className="">
            <ul className="text-[16px] grid gap-[20px]">
              <Link to={"/"} className="cursor-pointer">
                <li className="flex h-[48px] rounded-lg p-4 xl:mx-3 hover:bg-gray-800 items-center gap-[16px]">
                  <span className="text-[25px]">
                    <GoHomeFill />
                  </span>
                  <span className="xl:flex hidden">Home</span>
                </li>
              </Link>
              <li className="flex h-[48px] items-center gap-4 rounded-lg p-4 xl:mx-3 hover:bg-gray-800">
                <span className="text-[25px]">
                  <IoSearch />
                </span>

                <span className="xl:flex hidden">Search</span>
              </li>
              <li className="flex h-[48px] items-center gap-4 rounded-lg xl:p-4 mx-3 hover:bg-gray-800">
                <span className="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-compass-icon lucide-compass"
                  >
                    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                <span className="xl:flex hidden">Explore</span>
              </li>
              <li className="flex h-[48px] rounded-lg p-4 xl:mx-3 hover:bg-gray-800 items-center gap-4">
                <span className="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-cassette-tape-icon lucide-cassette-tape"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <circle cx="8" cy="10" r="2" />
                    <path d="M8 12h8" />
                    <circle cx="16" cy="10" r="2" />
                    <path d="m6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1l.7 3" />
                  </svg>
                </span>

                <span className="xl:flex hidden">Reels</span>
              </li>
              <li className="flex rounded-lg p-4 xl:mx-3 hover:bg-gray-800 h-[48px] items-center gap-4">
                <span className="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-message-circle-code-icon lucide-message-circle-code"
                  >
                    <path d="m10 9-3 3 3 3" />
                    <path d="m14 15 3-3-3-3" />
                    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                  </svg>
                </span>

                <span className="xl:flex hidden">Messages</span>
              </li>
              <li className="flex h-[48px] items-center gap-4 rounded-lg p-4 xl:mx-3 hover:bg-gray-800">
                <span className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-heart-icon lucide-heart"
                  >
                    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                  </svg>
                  <span className="w-[12px] absolute bottom-[13px] left-[17px] bg-red-700 h-[12px] rounded-full"></span>
                </span>
                <span className="xl:flex hidden">Notification</span>
              </li>
              <li
                className="flex relative p-4 h-[48px] rounded-lg xl:mx-3 hover:bg-gray-800 items-center gap-4"
                tabIndex={0}
                onBlur={() => setShowDropdown(false)}
                onClick={() => setShowDropdown(true)}
              >
                <span className="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-square-plus-icon lucide-square-plus"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </span>
                <span className="xl:flex hidden">Create</span>

                {/* Dropdown Panel */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute mt-2 right-0 top-9 text-white shadow-xl w-72 p-4 z-50 animate-fade-in"
                  >
                    <div className="bg-gray-800 rounded-md">
                      <div
                        className=""
                        onBlur={() => setShowUploadImage(false)}
                        tabIndex={0}
                      >
                        <Link to={"/create"}>
                        <button
                          className="w-full flex justify-between items-center hover:bg-gray-600 px-4 py-2 rounded-md"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <span>Post</span>
                          <FaPhotoVideo />
                        </button>
                        </Link>
                      </div>
                      <button className="w-full flex justify-between items-center hover:bg-gray-600 px-4 py-2 rounded-md">
                        <span>AI</span>
                        <HiOutlineSquaresPlus />
                      </button>
                    </div>
                  </div>
                )}
              </li>
              <Link to={"/profile"} className="cursor-pointer">
                <li className="flex rounded-lg p-4 xl:mx-3 hover:bg-gray-800 h-[48px] items-center gap-4">
                  <span className="">
                    <img
                      src={user.user_metadata.image}
                      className="w-[24px] h-[24px] rounded-full"
                      alt=""
                    />
                  </span>
                  <span className="xl:flex hidden">Profile</span>
                </li>
              </Link>
            </ul>
          </div>
        </div>
        <div className="">
          <div className="h-[64px] flex rounded-lg p-4 mx-3 hover:bg-gray-800 items-center gap-4">
            <span className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-menu-icon lucide-menu"
              >
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            </span>
            <span className="xl:flex hidden">More</span>
          </div>
          <div className="h-[64px] flex rounded-lg p-4 mx-3 hover:bg-gray-800 items-center gap-4">
            <span className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-boxes-icon lucide-boxes"
              >
                <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
                <path d="m7 16.5-4.74-2.85" />
                <path d="m7 16.5 5-3" />
                <path d="M7 16.5v5.17" />
                <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
                <path d="m17 16.5-5-3" />
                <path d="m17 16.5 4.74-2.85" />
                <path d="M17 16.5v5.17" />
                <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
                <path d="M12 8 7.26 5.15" />
                <path d="m12 8 4.74-2.85" />
                <path d="M12 13.5V8" />
              </svg>
            </span>
            <span className="xl:flex hidden">Also from Meta</span>
          </div>
        </div>
      </div>
      <div className="">
        {showUploadImage && (
          <div className="" onMouseDown={(e) => e.preventDefault()}>
            <button
              onClick={() => setShowUploadImage(false)}
              className="text-white z-50 fixed xl:right-24 right-2 top-2.5 hover:opacity-60 transition-all duration-500 cursor-pointer xl:top-12"
            >
              <RiCloseLargeFill size={26} />
            </button>
            <Create />
          </div>
        )}
      </div>

      <Outlet />
    </>
  );
}
