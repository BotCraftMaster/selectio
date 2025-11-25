import { Mail, Phone } from "lucide-react";

interface ContactInfoProps {
  contacts: unknown;
  size?: "sm" | "md";
}

export function ContactInfo({ contacts, size = "md" }: ContactInfoProps) {
  if (!contacts || typeof contacts !== "object") {
    return <span className="text-sm text-muted-foreground">Не указаны</span>;
  }

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-sm" : "text-sm";

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(contacts as Record<string, unknown>).map(
        ([key, value]) => {
          // Handle objects (like phone number objects with formatted, raw, etc.)
          const displayValue =
            typeof value === "object" && value !== null
              ? (value as Record<string, unknown>).formatted ||
                (value as Record<string, unknown>).raw ||
                JSON.stringify(value)
              : String(value);

          return (
            <div key={key} className={`flex items-center gap-1 ${textSize}`}>
              {key.toLowerCase().includes("email") ||
              key.toLowerCase().includes("почта") ? (
                <Mail className={`${iconSize} text-muted-foreground`} />
              ) : key.toLowerCase().includes("phone") ||
                key.toLowerCase().includes("телефон") ? (
                <Phone className={`${iconSize} text-muted-foreground`} />
              ) : null}
              <span className="text-muted-foreground">{displayValue}</span>
            </div>
          );
        }
      )}
    </div>
  );
}
