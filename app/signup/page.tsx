"use client";
import { Suspense } from "react";
import AuthCard from "@/components/AuthCard";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
