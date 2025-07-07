// src/components/profile/UserInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TooltipInfo from "../TooltipInfo";

type Props = {
  userId: string;
  email: string;
  name: string;
  tier: string;
  smsCredits: number;
  notifyOffline: boolean;
  notifyLoading: boolean;
  isSubscribed: boolean;
  subscribeLoading: boolean;
  onNameSave?: (name: string) => void;
  onToggleNotify?: (checked: boolean) => void;
  onToggleSubscribe?: (checked: boolean) => void;
  avatarUrl?: string | null;
};

export default function UserInfoCard({
  email,
  name,
  tier,
  smsCredits,
  notifyOffline,
  notifyLoading,
  isSubscribed,
  subscribeLoading,
  onToggleNotify,
  onToggleSubscribe,
  avatarUrl,
}: Props) {
  return (
    <Card className="mb-6">
      <CardContent className="flex items-center gap-4 py-6">
        {/* Avatar */}
        <Avatar className="h-14 w-14">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name || "User avatar"} />
          ) : (
            <AvatarFallback>
              {name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Main info + settings */}
        <div className="flex-1 space-y-3">
          <div className="font-semibold text-lg">{name}</div>
          <div className="text-muted-foreground text-sm">{email}</div>
          <div className="text-muted-foreground text-xs">
            {tier && tier[0].toUpperCase() + tier.slice(1)} User
          </div>
          <div className="text-muted-foreground text-xs">
            SMS credits: <span className="font-medium">{smsCredits}</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {/* Notify offline */}
            <div className="flex items-center gap-3">
              <Switch
                checked={notifyOffline}
                onCheckedChange={onToggleNotify}
                disabled={tier?.toLowerCase() === "free"}
                id="notify-offline"
              />
              {notifyLoading && (
                <span className="ml-2">
                  <svg className="animate-spin h-4 w-4 text-muted-foreground" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </span>
              )}
              <Label htmlFor="notify-offline">Email when vehicle goes offline</Label>
              <TooltipInfo
                content={
                  <>
                    <strong>Offline notification</strong>
                    <br />
                    Only available for paying users.<br />
                    Enable this to get an email if your vehicle goes offline.
                  </>
                }
                className="ml-[-8px]"
              />
            </div>
            {/* Newsletter */}
            <div className="flex items-center gap-3">
              <Switch
                checked={isSubscribed}
                onCheckedChange={onToggleSubscribe}
                disabled={subscribeLoading}
              />
              {subscribeLoading && (
                <span className="ml-2">
                  <svg className="animate-spin h-4 w-4 text-muted-foreground" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </span>
              )}
              <Label htmlFor="newsletter">Subscribed to newsletter</Label>
              <TooltipInfo
                content={
                  <>
                    <strong>Newsletter subscription</strong>
                    <br />
                    Get occasional news and feature updates by email.<br />
                    Unsubscribe at any time.<br />
                    <span className="text-xs text-muted-foreground">No spam. You control your preferences.</span>
                  </>
                }
                className="ml-[-8px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
