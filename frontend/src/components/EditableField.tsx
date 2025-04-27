'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // <- snygg spinner ikon från lucide

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  type?: "text" | "email" | "password";
}

export default function EditableField({
  label,
  value,
  onSave,
  type = "text",
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (newValue.trim() === "") return;

    setLoading(true);
    try {
      await onSave(newValue);
      setEditing(false);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-gray-600 text-sm mb-1">{label}</label>
      {editing ? (
        <div className="flex items-center space-x-2">
          <input
            type={type}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="border p-2 rounded text-gray-700"
            disabled={loading}
          />
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Save"
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditing(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="text-lg font-semibold cursor-pointer hover:underline"
        >
          {value || "Unknown"}
        </div>
      )}
    </div>
  );
}
