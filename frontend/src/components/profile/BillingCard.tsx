'use client';
// src/components/profile/BillingCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrialButton } from '@/components/TrialButton'

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
  invoices,
  onManageClick,
}: BillingCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-6 py-6">
        <TrialButton />
        <div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Current Plan</span>
            <Button size="sm" variant="secondary" onClick={onManageClick}>
              Manage
            </Button>
          </div>
          <div className="mt-1 text-lg">{subscriptionPlan}</div>
          <div className="text-muted-foreground text-sm">{price}</div>
            {current_period_start && current_period_end && (
                <div className="text-xs mt-2 text-muted-foreground">
                Current period: {new Date(current_period_start).toLocaleDateString()} - {new Date(current_period_end).toLocaleDateString()}
                </div>
            )}
          {nextBillingDate && (
            <div className="text-xs mt-2 text-muted-foreground">
              Next billing: {nextBillingDate}
            </div>
          )}
        </div>
        <div>
          <span className="font-semibold">Invoices</span>
          <ul className="mt-2 space-y-2">
            {invoices.length === 0 && (
              <li className="text-sm text-muted-foreground">No invoices found.</li>
            )}
            {invoices.map((inv) => (
              <li key={inv.receipt_number} className="flex items-center justify-between">
                <span>
                  <span className="font-mono text-xs">{inv.receipt_number}</span>
                  {' — '}
                  {new Date(inv.created_at).toLocaleDateString()} | {inv.amount_due / 100} {inv.currency.toUpperCase()} | {inv.status}
                </span>
                {inv.hosted_invoice_url && (
                  <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs ml-4">
                    PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
