'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice } from '@/hooks/useBillingInfo';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

type Props = {
  invoices: Invoice[];
};

export default function InvoicesList({ invoices }: Props) {
  if (invoices.length === 0) {
    return null; // Don't render anything if there are no invoices
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice_id}>
                <TableCell>{format(new Date(invoice.created_at), 'PPP')}</TableCell>
                <TableCell>
                  {(invoice.amount_due / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                </TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  {invoice.pdf_url && (
                    <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
