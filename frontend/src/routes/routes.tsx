import type { RouteObject } from "react-router-dom";
import { CampaignContextProvider } from "src/context";
import {
  BrandTemplateCreatorPage,
  BrandTemplateTestPage,
  ErrorBoundaryPage,
  HomePage,
  MarketingPage,
  MultipleDesignsGeneratorPage,
  ProductsPage,
  ReturnNavPage,
  SingleDesignGeneratorPage,
} from "src/pages";
import { App } from "../app";

export enum Paths {
  HOME = "/",
  RETURN_NAV = "/return-nav",
  MARKETING = "/marketing",
  MULTIPLE_DESIGNS_GENERATOR = "/marketing/multiple-designs",
  PRODUCTS = "/products",
  SINGLE_DESIGN_GENERATOR = "/marketing/single-design",
  BRAND_TEMPLATE_CREATOR = "/brand-template-creator",
  BRAND_TEMPLATE_TEST = "/brand-template-test",
}

export const routes: RouteObject[] = [
  {
    path: Paths.HOME,
    element: <App />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: Paths.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: Paths.MARKETING,
        element: <MarketingPage />,
      },
      {
        path: Paths.SINGLE_DESIGN_GENERATOR,
        element: (
          <CampaignContextProvider>
            <SingleDesignGeneratorPage />
          </CampaignContextProvider>
        ),
      },
      {
        path: Paths.MULTIPLE_DESIGNS_GENERATOR,
        element: (
          <CampaignContextProvider>
            <MultipleDesignsGeneratorPage />
          </CampaignContextProvider>
        ),
      },
      {
        path: Paths.BRAND_TEMPLATE_CREATOR,
        element: <BrandTemplateCreatorPage />,
      },
      {
        path: Paths.BRAND_TEMPLATE_TEST,
        element: <BrandTemplateTestPage />,
      },
    ],
  },
  {
    path: Paths.RETURN_NAV,
    errorElement: <ErrorBoundaryPage />,
    element: <ReturnNavPage />,
  },
];
