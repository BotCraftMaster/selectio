import { Mail, Phone } from "lucide-react";

interface Contact {
  raw: string;
  city?: string;
  type?: string;
  number?: string;
  comment?: string;
  country?: string;
  verified?: boolean;
  formatted?: string;
  needVerification?: boolean;
}

interface ContactsData {
  phone?: Contact[];
  email?: Contact[];
  [key: string]: Contact[] | undefined;
}

interface ContactInfoProps {
  contacts: ContactsData | unknown;
  size?: "sm" | "md";
}

export function ContactInfo({ contacts, size = "md" }: ContactInfoProps) {
  if (!contacts || typeof contacts !== "object") {
    return <span className="text-sm text-muted-foreground">Не указаны</span>;
  }

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  const contactsData = contacts as ContactsData;
  const allContacts: Array<{ contact: Contact; contactType: string }> = [];

  // Collect all contacts from different types
  Object.entries(contactsData).forEach(([key, items]) => {
    if (Array.isArray(items)) {
      items.forEach((contact) => {
        allContacts.push({ contact, contactType: key });
      });
    }
  });

  if (allContacts.length === 0) {
    return <span className="text-sm text-muted-foreground">Не указаны</span>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {allContacts.map(({ contact, contactType }, index) => {
        const displayValue = contact.formatted || contact.raw;
        const isPhone =
          contactType === "phone" ||
          contact.type === "cell" ||
          contact.type === "phone";

        return (
          <div
            key={`${contactType}-${contact.raw}-${index}`}
            className="flex flex-col gap-0.5"
          >
            <div className={`flex items-center gap-1.5 ${textSize}`}>
              {isPhone ? (
                <Phone
                  className={`${iconSize} text-muted-foreground shrink-0`}
                />
              ) : (
                <Mail
                  className={`${iconSize} text-muted-foreground shrink-0`}
                />
              )}
              <span className="text-foreground font-medium">
                {displayValue}
              </span>
            </div>
            {contact.comment && (
              <span className={`${textSize} text-muted-foreground ml-5`}>
                {contact.comment}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
