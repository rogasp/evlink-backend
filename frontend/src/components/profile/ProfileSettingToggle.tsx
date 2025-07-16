import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import TooltipInfo from '../TooltipInfo';

interface ProfileSettingToggleProps {
  id: string;
  label: string;
  tooltipContent: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  onToggle?: (checked: boolean) => void;
}

const ProfileSettingToggle = ({
  id,
  label,
  tooltipContent,
  checked,
  disabled,
  loading,
  onToggle,
}: ProfileSettingToggleProps) => {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onToggle || (() => {})}
        disabled={disabled || loading}
        className="cursor-pointer"
      />
      {loading && (
        <span className="ml-2">
          <svg
            className="animate-spin h-4 w-4 text-muted-foreground"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </span>
      )}
      <Label htmlFor={id}>{label}</Label>
      <TooltipInfo content={tooltipContent} className="ml-[-8px]" />
    </div>
  );
};

export default ProfileSettingToggle;
