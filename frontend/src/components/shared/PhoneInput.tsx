"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { US, SE, DK, NO, NL, DE, IT, FR, ES } from 'country-flag-icons/react/3x2';

const COUNTRIES = [
  { code: "+45", name: "Denmark", component: DK },
  { code: "+33", name: "France", component: FR },
  { code: "+49", name: "Germany", component: DE },
  { code: "+39", name: "Italy", component: IT },
  { code: "+31", name: "Netherlands", component: NL },
  { code: "+47", name: "Norway", component: NO },
  { code: "+34", name: "Spain", component: ES },
  { code: "+46", name: "Sweden", component: SE },
  { code: "+1", name: "United States", component: US },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInput({ value, onChange, placeholder = "Phone number", className }: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [countryCode, setCountryCode] = useState("+46")
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery)
    )
  }, [searchQuery])
  
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[7]
  
  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setOpen(false)
    setSearchQuery("")
  }
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, "")
    onChange(`${countryCode}${phone}`)
  }
  
  const phoneNumber = value.replace(countryCode, "")
  
  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-3">
                {selectedCountry.component && <selectedCountry.component className="w-full h-full" />}
              </span>
              <span className="text-sm">{selectedCountry.code}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start" sideOffset={5}>
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="p-1">
              {filteredCountries.map((country) => {
                const FlagComponent = country.component
                return (
                  <button
                    key={country.code}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md",
                      countryCode === country.code && "bg-accent"
                    )}
                    onClick={() => handleCountrySelect(country.code)}
                  >
                    {FlagComponent && (
                      <span className="w-6 h-4">
                        <FlagComponent className="w-full h-full" />
                      </span>
                    )}
                    {!FlagComponent && (
                      <span className="w-6 h-4 flex items-center justify-center text-xs font-bold">
                        {country.code.replace('+', '')}
                      </span>
                    )}
                    <span className="flex-1 text-left">{country.name}</span>
                    <span className="text-muted-foreground">{country.code}</span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        className="flex-1"
      />
    </div>
  )
}