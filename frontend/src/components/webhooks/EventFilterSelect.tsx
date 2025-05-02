'use client'

import { ENODE_EVENT_LABELS } from "@/constants/enodeEvents"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  selected: string
  onChange: (value: string) => void
}

export function EventFilterSelect({ selected, onChange }: Props) {
  const events = Object.entries(ENODE_EVENT_LABELS)

  return (
    <div className="mb-4 w-80">
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by event" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All events</SelectItem>
          {events.map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
