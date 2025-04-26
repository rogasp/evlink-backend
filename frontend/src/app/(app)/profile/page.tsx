'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EditableField
 from "@/components/EditableField";
export default function ProfilePage() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.accessToken && (session?.user as { id: string }).id) {
      fetchApiKey((session.user as { id: string }).id, session.accessToken);
    }
  }, [session]);

  const fetchApiKey = async (userId: string, accessToken: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/apikey`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch API key");
      }

      const data = await res.json();
      setApiKey(data.api_key_masked || null);
      setCreatedAt(data.created_at || null);
    } catch (error) {
      console.error("Failed to fetch API key", error);
      toast.error("Failed to fetch API key");
    }
  };

  const createApiKey = async () => {
    if (!session?.accessToken || !(session?.user && 'id' in session.user)) {
      toast.error("Missing user ID or access token");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/users/${(session.user as { id: string }).id}/apikey`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to create API key");
      }

      const data = await res.json();
      setApiKey(data.api_key || null);
      setJustCreated(true);
      setCreatedAt(new Date().toISOString());
      toast.success("New API key created!");
    } catch (error) {
      console.error("Failed to create API key", error);
      toast.error("Failed to create new API key");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (apiKey && justCreated) {
      await navigator.clipboard.writeText(apiKey);
      toast.success("API key copied to clipboard!");
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const saveEmail = async (newEmail: string) => {
    if (!newEmail.trim() || !session?.accessToken || !(session?.user && 'id' in session.user)) {
      toast.error("Invalid data");
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:8000/api/users/${(session.user as { id: string }).id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update email");
      }
  
      toast.success("Email updated! Please log in again.");

      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
  
    } catch (error) {
      console.error(error);
      toast.error("Failed to update email");
    }
  };
  
  

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-10 p-6 bg-white shadow rounded-lg">
        <Avatar className="h-16 w-16">
            <AvatarFallback>{getInitials(session?.user?.email ?? undefined)}</AvatarFallback>
        </Avatar>
        <div>
        <EditableField
        label="Email"
        value={session?.user?.email || ""}
        onSave={saveEmail}
        type="email"
        />
          <p className="text-gray-500">Manage your API keys and settings</p>
        </div>
      </div>

      {/* API Key Section */}
      {apiKey ? (
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">API Key</label>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full border rounded p-2 text-gray-700 bg-gray-100"
              />
              <Button
                onClick={copyToClipboard}
                variant={justCreated ? "default" : "secondary"}
                disabled={!justCreated}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {createdAt && (
              <p>Created at: {new Date(createdAt).toLocaleString()}</p>
            )}
            {!justCreated && (
              <p className="text-red-500 mt-1">
                Note: The full API key cannot be retrieved again. If you forgot it, you must create a new one.
              </p>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                {loading ? "Creating..." : "Create New API Key"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create new API Key</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate your previous API keys. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={createApiKey}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="space-y-4 text-center text-gray-600">
          <p>No API key found for your account.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" disabled={loading}>
                {loading ? "Creating..." : "Create API Key"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create new API Key</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new API key linked to your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={createApiKey}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
