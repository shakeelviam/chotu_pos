"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { POSOpeningEntry, OpeningEntryData } from "@/components/pos/opening-entry";
import { useToast } from "@/components/ui/use-toast";

export default function OpeningPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and session status
    const checkAuthAndSession = async () => {
      try {
        const user = await window.electron.getCurrentUser();
        if (!user) {
          router.push("/");
          return;
        }

        // Check if there's an active session
        const session = await window.electron.getCurrentSession();
        if (!session) {
          // Create a new session if none exists
          const newSession = await window.electron.openSession();
          if (!newSession.success) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to create new session",
            });
            router.push("/");
            return;
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Auth/Session check failed:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize session",
        });
        router.push("/");
      }
    };

    checkAuthAndSession();
  }, [router, toast]);

  const handleOpeningEntry = async (data: OpeningEntryData) => {
    console.log("Opening entry data:", data);
    try {
      // First check if there's already an opening balance
      const currentSession = await window.electron.getCurrentSession();
      if (currentSession?.opening_balance !== null) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Opening balance already set for this session",
        });
        router.push("/dashboard");
        return;
      }

      const result = await window.electron.createPOSOpening(data);
      console.log("POS Opening result:", result);

      if (result.success) {
        toast({
          title: "Success",
          description: "POS Opening created successfully",
        });
        router.push("/pos"); // Redirect to POS interface after successful opening
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create POS opening",
        });
      }
    } catch (error) {
      console.error("Failed to create POS opening:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create POS opening. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Initializing session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <POSOpeningEntry onSubmit={handleOpeningEntry} />
    </div>
  );
}
