import type { AuthUser, Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import supabase from "~/lib/supabase";

type UserMetadata = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
  username: string;
  fullName: string;
  image: string;
  updated_at: Date;
};

type IAuthContext = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isAuthLoading: boolean;
  handleLogout: () => void;
};
export const defaultProvider: IAuthContext = {
  user: null,
  setUser: () => null,
  isAuthLoading: false,
  handleLogout: () => {},
};

export const AuthContext = createContext<IAuthContext | undefined>(
  defaultProvider
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setIsAuthLoading(false);
      setSession(session);
      console.log("[AuthPLoadingult:", session);
      if (!session) {
        setUser(null);
        if (window.location.pathname !== "/login") navigate("/login");
      } else {
        setUser(session.user);
        // Check profile completeness
        const meta = session.user.user_metadata || {};
        if (!meta.username || !meta.fullName || !meta.image) {
          if (window.location.pathname !== "/complete-profile") {
            navigate("/complete-profile");
          }
        } else {
          if (window.location.pathname !== "/") {
            return
          }
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {   
      console.log("_event", _event);
      console.log("session", session);
      
      setSession(session);
      if (!session) {
        setUser(null);
        if (window.location.pathname !== "/login") navigate("/login");
      } else {
        setUser(session.user);
        const meta = session.user.user_metadata || {};
        switch (_event) {
          case "SIGNED_IN":
            if (!meta.username || !meta.fullName || !meta.image) {
              if (window.location.pathname !== "/complete-profile") {
                navigate("/complete-profile");
              }
            } else {
              if (window.location.pathname !== "/") {
                navigate("/");
              }
            }
            break;
          case "SIGNED_OUT":
            setUser(null);
            if (window.location.pathname !== "/login") navigate("/login");
            break;
          case "USER_UPDATED":
            setUser(session.user);
            break;
          default:
            break;
        }
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  var value = {
    user,
    setUser,
    isAuthLoading,
    handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
