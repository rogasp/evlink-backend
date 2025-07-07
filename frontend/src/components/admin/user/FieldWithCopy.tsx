import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  label: string;
  value: string;
  className?: string;
};

export function FieldWithCopy({ label, value, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className={`relative ${className ?? "w-full max-w-100"}`}>
        <Input
          value={value}
          disabled
          className="font-mono pr-10 text-xs"
          readOnly
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="absolute right-1 top-1/2 -translate-y-1/2"
          tabIndex={-1}
        >
          <Copy className={`w-4 h-4 ${copied ? "text-green-500" : "text-gray-400"}`} />
        </Button>
      </div>
    </div>
  );
}
