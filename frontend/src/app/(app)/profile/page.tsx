'use client';

import { useEffect, useState, useCallback } from "react";
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
import EditableField from "@/components/EditableField";
import { authFetch } from "@/lib/authFetch";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react"; // används tillfälligt för redirect

export default function ProfilePage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchApiKey = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    const { data, error } = await authFetch(`/users/${user.id}/apikey`, {
      method: "GET",
      accessToken,
    });

    if (error) {
      toast.error("Failed to fetch API key");
      return;
    }

    setApiKey(data.api_key_masked || null);
    setCreatedAt(data.created_at || null);
  }, [user, accessToken]);

  const createApiKey = async () => {
    if (!user?.id || !accessToken) {
      toast.error("Missing user ID or access token");
      return;
    }

    setLoading(true);

    const { data, error } = await authFetch(`/users/${user.id}/apikey`, {
      method: "POST",
      accessToken,
    });

    if (error) {
      toast.error("Failed to create new API key");
    } else {
      setApiKey(data.api_key || null);
      setCreatedAt(new Date().toISOString());
      setJustCreated(true);
      toast.success("New API key created!");
    }

    setLoading(false);
  };

  const saveEmail = async (newEmail: string) => {
    if (!newEmail.trim() || !user?.id || !accessToken) {
      toast.error("Invalid data");
      return;
    }

    const { error } = await authFetch(`/users/${user.id}/email`, {
      method: "POST",
      accessToken,
      body: JSON.stringify({ email: newEmail }),
    });

    if (error) {
      toast.error("Failed to update email");
    } else {
      toast.success("Email updated! Please log in again.");
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
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

  useEffect(() => {
    if (accessToken && user?.id) {
      fetchApiKey();
    }
  }, [accessToken, user, fetchApiKey]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-10 p-6 bg-white shadow rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
        </Avatar>
        <div>
          <EditableField
            label="Email"
            value={user?.email || ""}
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
