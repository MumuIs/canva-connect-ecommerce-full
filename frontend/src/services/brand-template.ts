import type { BrandTemplate, Design } from "@canva/connect-api-ts/types.gen";
import type { Client } from "@hey-api/client-fetch";
import { BrandTemplateService as CanvaBrandTemplateService, DesignService } from "@canva/connect-api-ts";
import { createNavigateToCanvaUrl } from "./canva-return";
import type { CorrelationState } from "src/models";

export class BrandTemplateService {
  constructor(private client: Client) {}

  /**
   * 获取 brand template 的详细信息，包括 create_url
   */
  async getBrandTemplate(brandTemplateId: string): Promise<BrandTemplate> {
    const result = await CanvaBrandTemplateService.getBrandTemplate({
      client: this.client,
      path: {
        brandTemplateId,
      },
    });

    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }

    return result.data.brand_template;
  }

  /**
   * 使用 brand template 的 create_url 创建设计副本
   * @param brandTemplateId - brand template 的 ID
   * @param correlationState - 用于 return navigation 的关联状态
   * @returns 包含设计信息的 Promise
   */
  async createDesignFromTemplate(
    brandTemplateId: string,
    correlationState: CorrelationState,
  ): Promise<{
    design: Design;
    navigateUrl: string;
  }> {
    try {
      // 1. 获取 brand template 的详细信息
      const brandTemplate = await this.getBrandTemplate(brandTemplateId);

      // 2. 构建带有 return navigation 的 URL
      const navigateUrl = this.createBrandTemplateUrlWithReturnNav(
        brandTemplate.create_url,
        correlationState,
      );

      // 3. 打开新窗口导航到 Canva
      const canvaWindow = window.open(
        navigateUrl.toString(),
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes",
      );

      if (!canvaWindow) {
        throw new Error("无法打开 Canva 窗口，请检查浏览器弹窗设置");
      }

      // 4. 监听窗口关闭事件，用于处理用户取消的情况
      const checkClosed = setInterval(() => {
        if (canvaWindow.closed) {
          clearInterval(checkClosed);
          // 可以在这里添加用户取消的回调处理
        }
      }, 1000);

      // 返回导航 URL，用于后续的 return navigation 处理
      return {
        design: {} as Design, // 这里返回空设计对象，实际的设计会在 return navigation 中获取
        navigateUrl: navigateUrl.toString(),
      };
    } catch (error) {
      console.error("创建设计副本失败:", error);
      throw error;
    }
  }

  /**
   * 为 brand template create_url 添加 return navigation 参数
   * @param createUrl - brand template 的 create_url
   * @param correlationState - 关联状态
   * @returns 带有 return navigation 的 URL
   */
  private createBrandTemplateUrlWithReturnNav(
    createUrl: string,
    correlationState: CorrelationState,
  ): URL {
    const url = new URL(createUrl);
    
    // 添加 return navigation URL 参数
    const returnNavUrl = `${process.env.BACKEND_URL || 'http://127.0.0.1:3001'}/return-nav`;
    url.searchParams.append('return_nav_url', returnNavUrl);
    
    // 添加 correlation_state 参数
    const encodedCorrelationState = btoa(JSON.stringify(correlationState));
    url.searchParams.append('correlation_state', encodedCorrelationState);
    
    return url;
  }

  /**
   * 使用 Canva API 直接创建设计（替代 create_url 方法）
   * @param brandTemplateId - brand template 的 ID
   * @param correlationState - 关联状态
   * @returns 创建的设计和导航 URL
   */
  async createDesignFromTemplateViaAPI(
    brandTemplateId: string,
    correlationState: CorrelationState,
  ): Promise<{
    design: Design;
    navigateUrl: string;
  }> {
    try {
      // 注意：Canva API 目前不直接支持基于 brand template 创建设计
      // 这是一个替代方案，创建一个空白设计，然后引导用户使用模板
      
      // 1. 创建一个空白设计
      const result = await DesignService.createDesign({
        client: this.client,
        body: {
          title: `Brand Template Design - ${brandTemplateId}`,
          design_type: {
            type: "preset",
            name: "presentation",
          },
        },
      });

      if (result.error) {
        console.error(result.error);
        throw new Error(result.error.message);
      }

      const newDesign = result.data.design;

      // 2. 构建带有 return navigation 的编辑 URL
      const navigateUrl = this.createEditUrlWithReturnNav(
        newDesign.urls.edit_url,
        correlationState,
      );

      // 3. 打开新窗口导航到 Canva
      const canvaWindow = window.open(
        navigateUrl.toString(),
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes",
      );

      if (!canvaWindow) {
        throw new Error("无法打开 Canva 窗口，请检查浏览器弹窗设置");
      }

      return {
        design: newDesign,
        navigateUrl: navigateUrl.toString(),
      };
    } catch (error) {
      console.error("通过 API 创建设计失败:", error);
      throw error;
    }
  }

  /**
   * 为设计编辑 URL 添加 return navigation 参数
   * @param editUrl - 设计的编辑 URL
   * @param correlationState - 关联状态
   * @returns 带有 return navigation 的 URL
   */
  private createEditUrlWithReturnNav(
    editUrl: string,
    correlationState: CorrelationState,
  ): URL {
    const url = new URL(editUrl);
    
    // 添加 return navigation URL 参数
    const returnNavUrl = `${process.env.BACKEND_URL || 'http://127.0.0.1:3001'}/return-nav`;
    url.searchParams.append('return_nav_url', returnNavUrl);
    
    // 添加 correlation_state 参数
    const encodedCorrelationState = btoa(JSON.stringify(correlationState));
    url.searchParams.append('correlation_state', encodedCorrelationState);
    
    return url;
  }

  /**
   * 批量创建多个设计副本
   * @param brandTemplateIds - brand template ID 数组
   * @param correlationState - 用于 return navigation 的关联状态
   * @returns 包含所有设计信息的 Promise
   */
  async createMultipleDesignsFromTemplates(
    brandTemplateIds: string[],
    correlationState: CorrelationState,
  ): Promise<{
    designs: Array<{
      brandTemplateId: string;
      navigateUrl: string;
    }>;
  }> {
    const results = await Promise.allSettled(
      brandTemplateIds.map(async (brandTemplateId) => {
        // 获取模板信息
        const brandTemplate = await this.getBrandTemplate(brandTemplateId);
        
        // 构建带有 return navigation 的 URL
        const navigateUrl = this.createBrandTemplateUrlWithReturnNav(
          brandTemplate.create_url,
          correlationState,
        );
        
        // 打开新窗口
        const canvaWindow = window.open(
          navigateUrl.toString(),
          "_blank",
          "width=1200,height=800,scrollbars=yes,resizable=yes",
        );

        if (!canvaWindow) {
          throw new Error(`无法打开 Canva 窗口 (模板: ${brandTemplate.title})`);
        }

        return {
          brandTemplateId,
          navigateUrl: navigateUrl.toString(),
        };
      }),
    );

    const designs = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { designs };
  }

  /**
   * 处理 return navigation 返回的设计
   * @param designId - 从 return navigation 中获取的设计 ID
   * @returns 设计详情
   */
  async handleReturnNavigation(designId: string): Promise<Design> {
    try {
      const result = await DesignService.getDesign({
        client: this.client,
        path: { designId },
      });

      if (result.error) {
        console.error(result.error);
        throw new Error(result.error.message);
      }

      return result.data.design;
    } catch (error) {
      console.error("获取返回设计失败:", error);
      throw error;
    }
  }

  /**
   * 获取 brand template 列表（复用现有实现）
   */
  async listBrandTemplates(): Promise<BrandTemplate[]> {
    const result = await CanvaBrandTemplateService.listBrandTemplates({
      client: this.client,
    });

    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }

    let items = result.data.items;
    let continuation = result.data.continuation;

    while (continuation) {
      const nextResult = await CanvaBrandTemplateService.listBrandTemplates({
        client: this.client,
        query: {
          continuation,
        },
      });

      if (nextResult.error) {
        console.error(nextResult.error);
        throw new Error(nextResult.error.message);
      }

      items = items.concat(nextResult.data.items);
      continuation = nextResult.data.continuation;
    }

    return items;
  }
}
