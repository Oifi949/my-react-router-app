import { useState } from "react";
import AddNewPost from "../app/routes/add-new-post-profile";
import ProfilePage from "../app/routes/profile";
import type { post } from "./types";

export default function App() {
  const [posts, setPosts] = useState<post[]>([]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* <AddNewPost posts={posts} setPosts={setPosts} />
      <ProfilePage posts={posts} /> */}
    </div>
  );
}