import { EventSchemas, Inngest } from "inngest";
import {
  responseScreenDataSchema,
  vacancyRequirementsExtractDataSchema,
  vacancyResponsesRefreshDataSchema,
  vacancyUpdateActiveDataSchema,
} from "./types";

// Create Inngest client with Zod schemas for type-safe events
export const inngest = new Inngest({
  id: "selectio",
  name: "Selectio Jobs",
  schemas: new EventSchemas().fromSchema({
    "vacancy/requirements.extract": vacancyRequirementsExtractDataSchema,
    "response/screen": responseScreenDataSchema,
    "vacancy/update.active": vacancyUpdateActiveDataSchema,
    "vacancy/responses.refresh": vacancyResponsesRefreshDataSchema,
  }),
});
