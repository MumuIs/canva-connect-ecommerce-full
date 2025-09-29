import { createClient } from "@hey-api/client-fetch";
import { Assets } from "./asset";
import { Autofill } from "./autofill";
import { BrandTemplateService as BrandTemplateServiceClass } from "./brand-template";
import { Designs } from "./design";
import { Exports } from "./export";
import { Users } from "./user";

export * from "./api";
export * from "./auth";

export type Services = {
  assets: Assets;
  autofill: Autofill;
  brandTemplates: BrandTemplateServiceClass;
  designs: Designs;
  exports: Exports;
  users: Users;
};

export function getUserClient(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const localClient = createClient({
    headers,
    baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
  });

  localClient.interceptors.response.use((res) => {
    const requestId = res.headers.get("x-request-id");
    if (res.status >= 400) {
      console.warn(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}}`,
      );
    } else {
      console.log(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}`,
      );
    }
    return res;
  });

  return localClient;
}

export const installServices = (token?: string): Services => {
  const client = getUserClient(token);
  const assets = new Assets(client);
  const autofill = new Autofill(client, assets);
  const brandTemplates = new BrandTemplateServiceClass(client);
  const designs = new Designs(client, assets);
  const exports = new Exports(client);
  const users = new Users(client);

  return {
    assets,
    autofill,
    brandTemplates,
    designs,
    exports,
    users,
  };
};
