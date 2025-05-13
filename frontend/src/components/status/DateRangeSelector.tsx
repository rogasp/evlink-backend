'use client';

import { format, subMonths, addMonths, isSameMonth, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';

interface DateRangeSelectorProps {
  fromDate: Date;
  toDate: Date;
  onChange: (from: Date, to: Date) => void;
}

export function DateRangeSelector({ fromDate, toDate, onChange }: DateRangeSelectorProps) {
  const handlePrev = () => {
    const newTo = subMonths(toDate, 3);
    const newFrom = subMonths(fromDate, 3);
    onChange(newFrom, newTo);
  };

  const handleNext = () => {
    const potentialTo = addMonths(toDate, 3);
    const today = new Date();

    if (isAfter(potentialTo, today)) return; // prevent going past today

    const newFrom = addMonths(fromDate, 3);
    onChange(newFrom, potentialTo);
  };

  const isNextDisabled = isSameMonth(toDate, new Date());

  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <Button variant="ghost" onClick={handlePrev} size="sm">
        &lt;
      </Button>
      <span className="text-sm text-muted-foreground">
        {format(fromDate, 'MMM yyyy')} - {format(toDate, 'MMM yyyy')}
      </span>
      <Button variant="ghost" onClick={handleNext} disabled={isNextDisabled} size="sm">
        &gt;
      </Button>
    </div>
  );
}
