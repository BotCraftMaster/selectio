"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@selectio/ui";
import { useEffect, useState } from "react";
import { createTriggerPublicToken } from "~/actions/trigger";
import type { VacancyResponse } from "~/types/vacancy";
import { ResponseRow } from "./response-row";

interface ResponseTableProps {
  responses: VacancyResponse[];
}

export function ResponseTable({ responses }: ResponseTableProps) {
  const [accessToken, setAccessToken] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    createTriggerPublicToken("screen-response").then((result) => {
      if (isMounted && result.success) {
        setAccessToken(result.token);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Кандидат</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Оценка</TableHead>
            <TableHead>Отбор HR</TableHead>
            <TableHead>Контакты</TableHead>
            <TableHead>Дата отклика</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-[200px]">
                <div className="flex items-center justify-center">
                  <p className="text-muted-foreground">Нет откликов</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            responses.map((response) => (
              <ResponseRow
                key={response.id}
                response={response}
                accessToken={accessToken}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
