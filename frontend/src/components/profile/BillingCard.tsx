'use client';
// src/components/profile/BillingCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrialButton } from '@/components/TrialButton'
import TooltipInfo from '../TooltipInfo';

interface Invoice {
  invoice_id: string
  receipt_number: string
  created_at: string
  amount_due: number
  currency: string
  status: string
  pdf_url?: string
  hosted_invoice_url?: string
}

interface BillingCardProps {
  subscriptionPlan: string
  price: string
  nextBillingDate?: string
  current_period_start?: string
  current_period_end?: string
  invoices: Invoice[]
  onManageClick?: () => void
}

export default function BillingCard({
  subscriptionPlan,
  price,
  nextBillingDate,
  current_period_start,
  current_period_end,
  onManageClick,
}: BillingCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-6 py-6">
        <TrialButton />
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-semibold">Current Plan</span>
              <TooltipInfo
                content={
                  <>
                    <strong>Current Subscription Plan</strong>
                    <br />
                    Your active plan, determining features and limits.
                  </>
                }
                className="ml-1"
              />
            </div>
            <Button size="sm" variant="secondary" onClick={onManageClick} className="cursor-pointer">
              Manage
            </Button>
          </div>
          <div className="mt-1 text-lg">{subscriptionPlan}</div>
          <div className="text-muted-foreground text-sm flex items-center">
            {price}
            <TooltipInfo
              content={
                <>
                  <strong>Monthly Price</strong>
                  <br />
                  The recurring cost of your current plan. May not be applicable for free plans.
                </>
              }
              className="ml-1"
            />
          </div>
            {current_period_start && current_period_end && (
                <div className="text-xs mt-2 text-muted-foreground flex items-center">
                Current period: {new Date(current_period_start).toLocaleDateString()} - {new Date(current_period_end).toLocaleDateString()}
                <TooltipInfo
                  content={
                    <>
                      <strong>Current Billing Period</strong>
                      <br />
                      The active period for your subscription.
                    </>
                  }
                  className="ml-1"
                />
                </div>
            )}
          {nextBillingDate && (
            <div className="text-xs mt-2 text-muted-foreground flex items-center">
              Next billing: {nextBillingDate}
              <TooltipInfo
                content={
                  <>
                    <strong>Next Billing Date</strong>
                    <br />
                    The date your next subscription payment is due.
                  </>
                }
                className="ml-1"
              />
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  )
}
