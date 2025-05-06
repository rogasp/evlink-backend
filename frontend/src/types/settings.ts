export type AdminSetting = {
  id: string;
  name: string;
  label: string;
  value: string;
  type: 'text' | 'boolean' | 'select';
  group_name: string;
  icon?: string;
  options?: { value: string; label: string }[];
};
