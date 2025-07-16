import { Input } from '@/components/ui/input';

interface WebhookInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (value: string) => void;
}

const WebhookInput = ({ id, label, value, onChange, onSave }: WebhookInputProps) => {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        onBlur={(e) => onSave(e.target.value)}
        className="w-full"
        autoComplete="off"
      />
    </div>
  );
};

export default WebhookInput;
