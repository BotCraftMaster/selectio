import { Badge } from "@selectio/ui";
import { ExternalLink } from "lucide-react";

interface VacancyHeaderProps {
  title: string;
  region: string | null;
  url: string | null;
  isActive: boolean | null;
}

export function VacancyHeader({
  title,
  region,
  url,
  isActive,
}: VacancyHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          {region && <p className="text-muted-foreground">{region}</p>}
        </div>
        <div className="flex gap-2">
          {isActive ? (
            <Badge variant="default">Активна</Badge>
          ) : (
            <Badge variant="secondary">Неактивна</Badge>
          )}
        </div>
      </div>

      {url && (
        <div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            Открыть на hh.ru
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
