'use client';

import GlobalStats from "@/components/insights/GlobalStats";
import { useUserContext } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import PersonalStatsCard from "@/components/insights/PersonalStatsCard";

export default function InsightsPage() {
  const { mergedUser, loading } = useUserContext();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Hardcoded string */}
        <h2 className="text-2xl font-semibold">EVLinkHA Insights</h2>
        {/* Hardcoded string */}
        <div>Loading insights...</div>
      </div>
    );
  }

  const isProUser = mergedUser?.tier === "pro";

  return (
    <div className="space-y-6">
      {/* Hardcoded string */}
      <h2 className="text-2xl font-semibold">EVLinkHA Insights</h2>
      <GlobalStats />

      {isProUser ? (
        <PersonalStatsCard />
      ) : (
        <Card className="p-4 text-center">
          <CardHeader className="px-0 pt-0">
            {/* Hardcoded string */}
            <CardTitle>Unlock Personal Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {/* Hardcoded string */}
            <p className="text-muted-foreground">Want to see your personal charging statistics and compare them with the community average?</p>
            <Button asChild>
              {/* Hardcoded string */}
              <Link href="/billing">Go Pro!</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
