export type AdvanceSettings = {
  shareToFacebook?: boolean;
  location?: string;
  collaborators?: string;
};

export type post = {
  id: string;
  user_id: string;
  caption: string;
  media?: string | null;
  media_type?: string | null;
  description?: string | null;
  advance_settings?: AdvanceSettings | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  user_profile: {
    id: string;
    created_at: string;
    updated_at: string;
    email: string;
    username: string;
    fullName: string;
    image: string;
    auth_user: string;

  };
};

export type UserMetadata = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
  username: string;
  fullName: string;
  image: string;
  updated_at: Date;
};