import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const TOKEN_KEY = "aya-share-token";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
