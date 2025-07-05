// src/components/ui/TooltipInfo.tsx
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TooltipInfoProps {
  content: React.ReactNode;
  className?: string;
  size?: number; // kan ange ikonstorlek, default 14px
}

export default function TooltipInfo({
  content,
  className = "",
  size = 14,
}: TooltipInfoProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`
            inline-flex items-center justify-center 
            h-[22px] w-[22px] rounded-full bg-[#0A2245] cursor-pointer
            border border-[#1fa2ff] shadow 
            ml-2
            ${className}
          `}
          style={{ position: "relative", top: "-8px" }}
          tabIndex={0}
        >
          <HelpCircle size={size} className="text-white" />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="max-w-xs text-sm"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
