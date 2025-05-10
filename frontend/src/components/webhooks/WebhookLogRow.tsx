"use client";

import { useState } from "react";
import { WebhookPayloadModal } from "./WebhookPayloadModal";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// Typ för loggposten (payload är en JSON-sträng eller redan ett objekt/array)
export type WebhookLog = {
  id: string;
  created_at: string;
  user_id?: string;
  vehicle_id?: string;
  event: string;
  version?: string;
  payload: string | Record<string, unknown> | Record<string, unknown>[];
};

// Typ för ett enskilt eventobjekt i payloaden
type ParsedPayload = Record<string, unknown>;

// 🔐 Hjälpfunktion: hämtar en sträng om möjligt
function getStringField(obj: ParsedPayload, key: string): string {
  const value = obj?.[key];
  return typeof value === "string" ? value : "-";
}

export function WebhookLogRow({ log }: { log: WebhookLog }) {
  const [open, setOpen] = useState(false);

  // 👉 Parsar payload
  let parsed: ParsedPayload | ParsedPayload[] = {};
  if (typeof log.payload === "string") {
    try {
      parsed = JSON.parse(log.payload);
    } catch (e) {
      console.warn("⚠️ Failed to parse payload JSON:", e);
      parsed = {};
    }
  } else {
    parsed = log.payload;
  }

  // 🔁 Om payload är array: plocka första elementet
  const first: ParsedPayload =
    Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : (!Array.isArray(parsed) ? parsed : {});

  return (
    <>
      <tr className="border-t">
        <td className="p-2">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
        <td className="p-2">{getStringField(first, "version")}</td>
        <td className="p-2">{getStringField(first, "event")}</td>
        <td className="p-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Eye className="w-4 h-4" />
          </Button>
        </td>
      </tr>
      <WebhookPayloadModal open={open} setOpen={setOpen} payload={parsed} />
    </>
  );
}
