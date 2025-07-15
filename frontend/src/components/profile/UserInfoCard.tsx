// src/components/profile/UserInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TooltipInfo from "../TooltipInfo";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { useUserContext } from "@/contexts/UserContext";
import ProfileSettingToggle from './ProfileSettingToggle';

type ApiUsageStats = {
  current_calls: number;
  max_calls: number;
  max_linked_vehicles: number;
  linked_vehicle_count: number;
  tier: string;
};

type Props = {
  userId: string;
  email: string;
  name: string;
  tier: string;
  smsCredits: number;
  purchasedApiTokens: number; // NEW: User's balance of purchased API tokens
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
  userId,
  email,
  name,
  tier,
  smsCredits,
  purchasedApiTokens,
  notifyOffline,
  notifyLoading,
  isSubscribed,
  subscribeLoading,
  onToggleNotify,
  onToggleSubscribe,
  avatarUrl,
}: Props) {
  const { accessToken } = useUserContext();
  const [apiUsage, setApiUsage] = useState<ApiUsageStats | null>(null);

  useEffect(() => {
    const fetchApiUsage = async () => {
      if (!accessToken) return; // Don't fetch if no access token
      try {
        const response = await authFetch("/me/api-usage", { accessToken });
        if (response.data) {
          setApiUsage(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch API usage stats:", error);
      }
    };

    fetchApiUsage();
  }, [accessToken]);

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
          <div className="text-xs text-gray-500 -mt-2">ID: {userId}</div>
          <div className="text-muted-foreground text-sm">
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
          </div>
          <div className="text-muted-foreground text-xs flex items-center">
            {tier && tier[0].toUpperCase() + tier.slice(1)} User
            <TooltipInfo
              content={
                <>
                  <strong>User Tier</strong>
                  <br />
                  Your current subscription tier, determining available features and API limits.
                </>
              }
              className="ml-1"
            />
          </div>
          <div className="text-muted-foreground text-xs flex items-center">
            SMS credits: <span className="font-medium">{smsCredits}</span>
            <TooltipInfo
              content={
                <>
                  <strong>SMS Credits</strong>
                  <br />
                  Remaining SMS credits for notifications.
                </>
              }
              className="ml-1"
            />
          </div>
          <div className="text-muted-foreground text-xs flex items-center">
            API Tokens: <span className="font-medium">{purchasedApiTokens}</span>
            <TooltipInfo
              content={
                <>
                  <strong>API Tokens</strong>
                  <br />
                  Additional API calls purchased beyond your monthly allowance.
                </>
              }
              className="ml-1"
            />
          </div>
          {apiUsage && (
            <div className="text-muted-foreground text-xs flex items-center">
              API Calls: <span className="font-medium">{apiUsage.current_calls}</span> / <span className="font-medium">{apiUsage.max_calls}</span> (Used/Included Monthly)
              <TooltipInfo
                content={
                  <>
                    <strong>API Call Usage</strong>
                    <br />
                    Your current API calls this month versus your plan's included limit.
                  </>
                }
                className="ml-1"
              />
            </div>
          )}
          {apiUsage && apiUsage.tier !== "free" && (
            <div className="text-muted-foreground text-xs flex items-center">
              Linked Vehicles: <span className="font-medium">{apiUsage.linked_vehicle_count}</span> / <span className="font-medium">{apiUsage.max_linked_vehicles}</span> (Used/Included)
              <TooltipInfo
                content={
                  <>
                    <strong>Linked Vehicles</strong>
                    <br />
                    The number of vehicles currently linked to your account versus the maximum allowed by your plan.
                  </>
                }
                className="ml-1"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <ProfileSettingToggle
              id="notify-offline"
              label="Email when vehicle goes offline"
              tooltipContent={
                <>
                  <strong>Offline notification</strong>
                  <br />
                  Only available for paying users.
                  <br />
                  Enable this to get an email if your vehicle goes offline.
                </>
              }
              checked={notifyOffline}
              disabled={tier?.toLowerCase() === 'free'}
              loading={notifyLoading}
              onToggle={onToggleNotify}
            />
            <ProfileSettingToggle
              id="newsletter"
              label="Subscribed to newsletter"
              tooltipContent={
                <>
                  <strong>Newsletter subscription</strong>
                  <br />
                  Get occasional news and feature updates by email.
                  <br />
                  Unsubscribe at any time.
                  <br />
                  <span className="text-xs text-muted-foreground">
                    No spam. You control your preferences.
                  </span>
                </>
              }
              checked={isSubscribed}
              disabled={false}
              loading={subscribeLoading}
              onToggle={onToggleSubscribe}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
