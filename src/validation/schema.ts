import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import configSchema from "../../orchestrator.config.schema.json";
import type { OrchestratorConfig } from "../config/types";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

export const validateOrchestratorConfig: ValidateFunction<OrchestratorConfig> = ajv.compile<OrchestratorConfig>(configSchema);

export function formatSchemaErrors(errors: readonly ErrorObject[] | null | undefined): string {
  return (errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`).join("; ");
}
