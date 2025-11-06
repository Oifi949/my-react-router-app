import React, { useEffect, useState } from "react";
import { IoEllipsisHorizontal } from "react-icons/io5";
import type { post } from "~/../src/types";
import type { UserProfile } from "~/../src/types";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaRegBookmark,
  FaBookmark,
  FaUser,
} from "react-icons/fa";
import supabase from "~/lib/supabase";
import { useAuth } from "~/context/authcontext";
import moment from "moment";

type Like = {
  user_id: string;
  post_id: string;
  id: number;
};

type Comment = {
  id: number;
  user_id: string;
  post_id: string;
  text: string;
  created_at?: string;
  updated_at?: string;
  comment_id?: string;
};

type PostWithProfile = post & {
  user_profile: UserProfile;
};

type PostCardProps = {
  post: PostWithProfile;
  index: number;
  isNew?: boolean;
};

export default function PostCard({ post, index, isNew }: PostCardProps) {
  const { user } = useAuth();
  const { user_profile } = post;

  const [videoDurations, setVideoDurations] = useState<{
    [key: string]: string;
  }>({});
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isComment, setIsComment] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(!!isNew);
  const [newComment, setNewComment] = useState("");
  const [input, setInput] = useState(false);

  useEffect(() => {
    if (isNew) {
      const timeout = setTimeout(() => setIsHighlighted(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isNew]);

  const handleSubmitComment = async () => {
    if (!user) return alert("Please login to comment on this post");

    try {
      if (isComment) {
        console.log("comment post:", post.id);
        await supabase
          .from("post_comments")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
      } else {
        console.log("Comment post:", post.id);
        const { error } = await supabase.from("post_comments").insert({
          post_id: post.id,
          user_id: user.id,
          text: newComment.trim(),
        });
        if (error) {
          console.error("Insert error:", error.message);
        }
      }

      await fetchCommentCount();
    } catch (error) {
      console.error("handlecomment error:", error);
    }

    setNewComment("");
  };
  const fetchLikeCount = async () => {
    if (!post?.id) return;
    const { count, error } = await supabase
      .from("post_likes")
      .select("*", { count: "exact" })
      .eq("post_id", post.id);
    if (error) {
      console.error("Supabase fetch error:", error.message);
      return;
    }
    setLikesCount(count ?? 0);
  };
  const fetchCommentCount = async () => {
    if (!post?.id) return;
    const { count, error } = await supabase
      .from("post_comments")
      .select("*", { count: "exact" })
      .eq("post_id", post.id);
    if (error) {
      console.error("Supabase fetch error:", error.message);
      return;
    }
    setCommentCount(count ?? 0);
  };

  useEffect(() => {
    if (!post?.id || !user) return;
    let isMounted = true;

    (async () => {
      try {
        const { data, count, error } = await supabase
          .from("post_likes")
          .select("*", { count: "exact" })
          .eq("post_id", post.id);

        if (error) throw error;

        if (data?.find((like) => like.user_id === user.id)) {
          setIsLiked(true);
        }

        if (isMounted) {
          setLikesCount(count ?? 0);
          setLikes(data || []);
        }
      } catch (err) {
        console.error("likes count error:", err);
      }
    })();

    const channel = supabase
      .channel(`post_likes_${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${post.id}`,
        },
        (_payload) => {
          setLikesCount((prev) => prev + 1);
          setLikes((prev) =>
            prev.find((l) => l.id === _payload.new?.id)
              ? prev
              : [...prev, _payload.new as Like]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_likes" },
        async (payload) => {
          setLikes((prev) =>
            prev.filter((like) => like.id !== payload.old?.id)
          );
          await fetchLikeCount();
        }
      );

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [post.id]);
  useEffect(() => {
    if (!post?.id || !user) return;
    let isMounted = true;

    (async () => {
      try {
        const { data, count, error } = await supabase
          .from("post_comments")
          .select("*", { count: "exact" })
          .eq("post_id", post.id);

        if (error) throw error;

        if (isMounted) {
          setCommentCount(count ?? 0);
          setComments(data || []);
        }
      } catch (err) {
        console.error("likes count error:", err);
      }
    })();

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, user_id, post_id, text, created_at") // ✅ include text here
        .eq("post_id", post.id);

      if (error) {
        console.error("Error fetching comments:", error.message);
        return;
      }

      setComments(data || []);
    };

    const channel = supabase
      .channel(`post_comments_${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${post.id}`,
        },
        (_payload) => {
          setCommentCount((prev) => prev + 1);
          setComments((prev) =>
            prev.find((l) => l.id === _payload.new?.id)
              ? prev
              : [...prev, _payload.new as Comment]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_comments" },
        async (payload) => {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== payload.old?.id)
          );
          await fetchCommentCount();
        }
      );

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [post.id]);

  const handleVideoLoadedMetadata = (
    postId: string,
    video: HTMLVideoElement
  ) => {
    const duration = formatDuration(video.duration);
    setVideoDurations((prev) => ({ ...prev, [postId]: duration }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleLike = async () => {
    if (!user) return alert("Please login to like this post");

    try {
      if (isLiked) {
        console.log("Unliking post:", post.id);
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
      } else {
        console.log("Liking post:", post.id);
        const { error } = await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: user.id,
        });
        if (error) {
          console.error("Insert error:", error.message);
        }
      }

      await fetchLikeCount();
    } catch (error) {
      console.error("handleLike error:", error);
    }

    setIsLiked(!isLiked);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  // const handleSubmitComment = () => {
  //   if (newComment.trim()) {
  //     setComments([
  //       ...comments,
  //       {
  //         user: user?.user_metadata.username || "you",
  //         text: newComment,
  //         replies: [],
  //       },
  //     ]);
  //     setNewComment("");
  //   }
  // };

  return (
    <div className="group relative w-full max-w-4xl mx-auto rounded-xl transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={user_profile?.image}
            alt={user_profile?.username}
            className="w-10 h-10 rounded-full object-cover border border-[#222]"
          />
          <div className="text-white">
            <h3 className="text-sm font-semibold">{user_profile?.username}</h3>
            <p className="text-xs text-gray-500">
              {moment(post.created_at).fromNow()}
            </p>
          </div>
        </div>
        <button className="text-white hover:text-gray-300 transition">
          <IoEllipsisHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="relative w-full aspect-square bg-black">
        {post.media_type === "video" ? (
          <video
            src={post.media ?? ""}
            className="w-full h-full object-cover group-hover:brightness-90 transition duration-300"
            preload="metadata"
            loop
            muted
            playsInline
            // onLoadedMetadata={(e) => post.handleVideoLoadedMetadata(post.id, e.currentTarget)}
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.paused
                ? e.currentTarget.play()
                : e.currentTarget.pause();
            }}
          />
        ) : (
          <img
            src={post.media ?? ""}
            alt="Post content"
            className="w-full h-full object-cover group-hover:brightness-90 transition duration-300"
            loading="lazy"
          />
        )}

        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping">
              <FaHeart size={80} className="text-white drop-shadow-lg" />
            </div>
          </div>
        )}

        {post.media_type === "video" && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {videoDurations[post.id] || "0:00"}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pt-3 pb-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className="transition transform hover:scale-110 active:scale-95 focus:outline-none"
            >
              {isLiked ? (
                <FaHeart
                  size={20}
                  className="text-red-500 animate-like-bounce"
                />
              ) : (
                <FaRegHeart
                  size={20}
                  className="text-white hover:text-gray-300 transition-colors"
                />
              )}
            </button>
            <FaRegComment
              size={20}
              className="hover:text-gray-300 transition transform hover:scale-110 active:scale-95 cursor-pointer"
              onClick={() => setInput(true)}
            />
            <FaRegPaperPlane
              size={20}
              className="hover:text-gray-300 transition transform hover:scale-110 active:scale-95"
            />
          </div>
          <button
            onClick={handleSave}
            className="transition transform hover:scale-110 active:scale-95"
          >
            {isSaved ? (
              <FaBookmark size={20} />
            ) : (
              <FaRegBookmark size={20} className="hover:text-gray-300" />
            )}
          </button>
        </div>

        <p className="text-sm font-semibold mb-1">{likesCount} likes</p>
        <p className="text-sm mb-2">
          <span className="font-extrabold">{user_profile?.username}</span>{" "}
          {post?.description}
        </p>

        <button className="text-sm text-gray-400 hover:text-gray-300 mb-2">
          View all {commentCount} comments
        </button>

        <div className="flex items-center gap-2 border-t border-[#1a1a1a] pt-2">
          <img
            src={user?.user_metadata.image || "/default-avatar.png"}
            alt={user?.user_metadata?.username}
            className="w-6 h-6 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            // value={newComment}
            // onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            value={newComment}
            onClick={handleSubmitComment}
            className="mx-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>

      {/* Modal */}
      {input && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex w-full max-w-[60vw] h-[80vh] bg-[#262626] rounded-lg overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setInput(false)}
              className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
            >
              &times;
            </button>

            {/* Media Section */}
            <div className="w-full lg:w-2/3 bg-black flex items-center justify-center">
              {post.media_type === "video" ? (
                <video
                  src={post.media ?? ""}
                  className="w-full object-contain h-[80vh]"
                  preload="metadata"
                  loop
                  muted
                  playsInline
                  // onLoadedMetadata={(e) => post.handleVideoLoadedMetadata(post.id, e.currentTarget)}
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.paused
                      ? e.currentTarget.play()
                      : e.currentTarget.pause();
                  }}
                />
              ) : (
                <img
                  src={post.media ?? ""}
                  alt="Post content"
                  className=" h-[80vh] object-contain"
                  loading="lazy"
                />
              )}
            </div>

            {/* Comment Panel */}
            <div className="w-full lg:w-1/3 flex flex-col bg-[#262626] text-white border-l border-gray-700">
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 text-sm">
                {/* Post Caption Styled Like a Comment */}
                <div className="flex items-center mt-8 gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden">
                      <img
                        src={user_profile?.image}
                        alt={user_profile?.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p>
                      <span className="font-semibold mr-2">
                        {user_profile?.username}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden">
                      <img
                        src={user_profile?.image}
                        alt={user_profile?.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p>
                      <span className="font-semibold mr-2">
                        {post.description}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Comments */}
                {comments.map((comment, idx) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden">
                        <img
                          src={user_profile?.image}
                          alt={user_profile?.username}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p>
                        
                        {comment.text}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {moment(comment.created_at).fromNow()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="px-4 py-3 border-t border-gray-700">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full bg-transparent text-sm text-white placeholder-gray-400 border-none focus:ring-0 resize-none"
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  value={newComment}
                  onClick={handleSubmitComment}
                  className="text-blue-500 font-semibold text-sm cursor-pointer hover:opacity-80"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
