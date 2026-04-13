import templateData from "./defaultTemplate.json";

export const defaultTemplate = templateData;

export function buildDefaultTemplate() {
  return JSON.parse(JSON.stringify(templateData));
}
