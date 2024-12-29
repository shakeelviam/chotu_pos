"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both username and password",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log the payload for debugging
      console.log('Attempting login with:', { username, password });
      
      const response = await window.electron.login({ 
        username: username.trim(), 
        password: password.trim() 
      });

      console.log('Login response:', response);

      if (response.success) {
        router.push("/pos");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="relative">
        {/* Background Text */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <h1 className="text-9xl font-bold text-muted/5">Chotu POS</h1>
        </div>

        {/* Login Card */}
        <Card className="w-[400px] p-8 backdrop-blur-sm bg-card/50 gradient-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 text-primary-foreground"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
