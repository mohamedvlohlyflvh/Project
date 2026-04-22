"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-32">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
          <h1 className="text-3xl font-headline italic mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-[#5c605d] text-sm text-center mb-8">
            Sign in to continue reading and writing
          </p>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                header: "hidden",
                footer: "hidden",
                formButtonPrimary:
                  "bg-[#545f6c] hover:bg-[#485460] text-white text-xs uppercase tracking-widest font-semibold",
                socialButtonsBlockButton:
                  "border border-[#afb3b0]/30 hover:bg-[#f3f4f1] transition-colors",
                formFieldInput:
                  "border border-[#afb3b0]/30 rounded-lg focus:ring-2 focus:ring-[#545f6c] focus:border-transparent",
                dividerLine: "bg-[#afb3b0]/30",
                dividerText: "text-[#5c605d] text-xs",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}