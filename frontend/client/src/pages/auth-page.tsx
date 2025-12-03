import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import bgImage from "@assets/generated_images/Subtle_islamic_geometric_pattern_background_0586174c.png";

export default function AuthPage() {
  const { login, isLoading } = useAuth();

  const handleGoogleLogin = () => {
    login();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Aya share</h1>
          <p className="text-muted-foreground text-lg font-arabic">Transform your recitation into art</p>
        </div>

        <Card className="border-none shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-serif">Welcome</CardTitle>
            <CardDescription>Sign in to start creating videos</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base relative overflow-hidden group hover:border-primary hover:text-primary transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              data-testid="button-google-login"
            >
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              {isLoading ? "Connecting..." : "Continue with Google"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
