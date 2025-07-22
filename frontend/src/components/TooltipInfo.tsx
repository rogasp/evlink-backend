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
  size = 10,
}: TooltipInfoProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`
            inline-flex items-center justify-center 
            h-[16px] w-[16px] rounded-full bg-transparent cursor-pointer
            border border-blue-300/50 
            ml-1
            ${className}
          `}
          style={{ position: "relative", top: "-1px" }}
          tabIndex={0}
        >
          <HelpCircle size={size} className="text-gray-300" />
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
