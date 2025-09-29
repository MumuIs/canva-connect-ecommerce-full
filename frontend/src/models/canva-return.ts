export enum EditInCanvaPageOrigins {
  PRODUCT = "/products",
  MARKETING_MULTI = "/marketing/multiple-designs",
  MARKETING_SINGLE = "/marketing/single-design",
  BRAND_TEMPLATE_CREATOR = "/brand-template-creator",
}

export type CorrelationState = {
  originPage: EditInCanvaPageOrigins;
  originProductId?: number;
  originMarketingMultiDesignIds?: string[];
  selectedTemplates?: string[];
  timestamp?: number;
};
