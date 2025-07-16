// src/components/profile/UserInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TooltipInfo from "../TooltipInfo";
import ProfileSettingToggle from './ProfileSettingToggle';

import ApiUsageDisplay from "./ApiUsageDisplay"; // IMPORT a new component

type Props = {
  userId: string;
  email: string;
  name: string;
  tier: string;
  smsCredits: number;
  purchasedApiTokens: number;
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

          

          {/* Real-time API Usage Display */}
          <ApiUsageDisplay
            initialPurchasedApiTokens={purchasedApiTokens}
            userId={userId}
          />

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
