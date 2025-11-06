import React, { Suspense } from "react";
import supabase from "~/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function meta() {
  return [
    { title: "Login - Instagram Clone" },
    { name: "description", content: "Login to your account." }
  ];
}

export default function Login() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="py-10 px-8 mx-2 bg-neutral-900 border border-neutral-700 rounded-md shadow-sm">
          <div className="grid place-items-center">
          <img
            src="/images/insta-logo.png"
            alt="Instagram Logo"
            className="w-[200px]"
          />
          </div>
          <p className="text-white text-center mb-8 font-semibold max-w-xs">
            Sign up to see photos and videos from your friends.
          </p>
          <Suspense fallback={<div>Loading...</div>}>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#3897f0",
                      brandAccent: "#3897f0",
                      inputText: "#ffffff",
                      inputBackground: "#1f1f1f",
                      inputBorder: "#333333",
                      messageText: "#ffffff"
                    },
                    fonts: {
                      bodyFontFamily: "Helvetica, Arial, sans-serif"
                    }
                  }
                }
              }}
              providers={["google", "facebook"]}
              redirectTo="/"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}