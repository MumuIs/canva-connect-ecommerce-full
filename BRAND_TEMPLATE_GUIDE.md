# Brand Template API 使用指南

本文档介绍如何通过 Brand Template API 获取模板信息，使用 create URL 创建模板副本，并实现 return navigation 效果。

## 功能概述

新增的 Brand Template 功能包括：

1. **获取 Brand Template 列表** - 列出用户可访问的所有品牌模板
2. **获取模板详细信息** - 包括 `create_url` 等关键信息
3. **创建设计副本** - 使用 `create_url` 打开 Canva 编辑器创建副本
4. **Return Navigation** - 用户编辑完成后自动返回应用

## 配置要求

### 1. Canva Developer Portal 配置

在 Canva Developer Portal 中，确保你的应用具有以下权限：

- `brandtemplate:content:read` - 读取品牌模板内容
- `brandtemplate:meta:read` - 读取品牌模板元数据
- `design:content:read` - 读取设计内容
- `design:meta:read` - 读取设计元数据

### 2. Return Navigation 配置

在 Developer Portal 的 "Return navigation" 部分：

- 启用 "Enable return navigation"
- 设置 Return URL 为：`http://127.0.0.1:3001/return-nav`

### 3. Authentication 配置

在 "Authentication" 部分：

- 设置 Redirect URL 为：`http://127.0.0.1:3001/oauth/redirect`

## 使用方法

### 1. 访问 Brand Template Creator 页面

启动应用后，访问：http://127.0.0.1:3000/brand-template-creator

### 2. 选择模板

1. 页面会自动加载你的品牌模板列表
2. 选择你想要创建副本的模板（可以多选）
3. 点击 "创建设计副本" 按钮

### 3. 编辑和返回

1. 系统会为每个选中的模板打开新的 Canva 编辑器窗口
2. 在 Canva 中编辑你的设计
3. 完成后，Canva 会自动将你重定向回应用
4. 应用会显示成功消息并更新状态

## 代码实现

### 服务层

```typescript
// services/brand-template.ts
export class BrandTemplateService {
  // 获取模板列表
  async listBrandTemplates(): Promise<BrandTemplate[]>
  
  // 获取单个模板详情
  async getBrandTemplate(brandTemplateId: string): Promise<BrandTemplate>
  
  // 创建设计副本
  async createDesignFromTemplate(
    brandTemplateId: string,
    correlationState: CorrelationState,
  ): Promise<{ design: Design; navigateUrl: string }>
  
  // 处理 return navigation
  async handleReturnNavigation(designId: string): Promise<Design>
}
```

### 组件使用

```typescript
// 在组件中使用
const { services } = useAppContext();

// 获取模板列表
const templates = await services.brandTemplates.listBrandTemplates();

// 创建关联状态
const correlationState: CorrelationState = {
  originPage: EditInCanvaPageOrigins.BRAND_TEMPLATE_CREATOR,
  selectedTemplates: selectedTemplateIds,
  timestamp: Date.now(),
};

// 创建设计副本
const result = await services.brandTemplates.createDesignFromTemplate(
  templateId,
  correlationState
);
```

### Return Navigation 处理

```typescript
// return-nav.tsx 中的处理逻辑
case EditInCanvaPageOrigins.BRAND_TEMPLATE_CREATOR: {
  addAlert({
    title: `成功创建了设计副本: ${design.title}!`,
    variant: "success",
    hideAfterMs: 6000,
  });
  break;
}
```

## API 端点

### 获取 Brand Templates

```http
GET /v1/brand-templates
Authorization: Bearer <access_token>
```

### 获取单个 Brand Template

```http
GET /v1/brand-templates/{brandTemplateId}
Authorization: Bearer <access_token>
```

### Return Navigation

```http
GET /return-nav?correlation_jwt=<jwt_token>
```

## 数据结构

### BrandTemplate

```typescript
type BrandTemplate = {
  id: string;
  title: string;
  view_url: string;
  create_url: string;  // 关键字段：用于创建副本的 URL
  thumbnail?: Thumbnail;
  created_at: number;
  updated_at: number;
};
```

### CorrelationState

```typescript
type CorrelationState = {
  originPage: EditInCanvaPageOrigins;
  originProductId?: number;
  originMarketingMultiDesignIds?: string[];
  selectedTemplates?: string[];
  timestamp?: number;
};
```

## 错误处理

### 常见错误

1. **权限不足** - 确保应用有正确的 scope 权限
2. **模板不存在** - 检查模板 ID 是否正确
3. **网络错误** - 检查网络连接和 API 端点

### 错误处理示例

```typescript
try {
  const templates = await services.brandTemplates.listBrandTemplates();
} catch (error) {
  addAlert({
    title: "加载模板失败",
    variant: "error",
  });
  console.error("Error:", error);
}
```

## 最佳实践

1. **批量操作** - 可以同时选择多个模板创建副本
2. **用户体验** - 提供加载状态和进度反馈
3. **错误处理** - 优雅处理各种错误情况
4. **状态管理** - 合理管理应用状态和用户选择

## 故障排除

### 问题：无法加载模板列表

**解决方案：**
1. 检查是否已授权连接 Canva
2. 确认应用有正确的 scope 权限
3. 检查网络连接

### 问题：Return Navigation 不工作

**解决方案：**
1. 确认 Developer Portal 中已启用 Return Navigation
2. 检查 Return URL 配置是否正确：`http://127.0.0.1:3001/return-nav`
3. 确认 correlation_state 参数正确传递
4. **重要**：确保在 brand template create_url 中添加了 `return_nav_url` 参数

### 问题：打开设计后没有返回选项

**解决方案：**
1. 检查 URL 是否包含 `return_nav_url` 参数
2. 确认 return navigation URL 格式正确
3. 验证 correlation_state 参数是否正确编码
4. 检查 Developer Portal 中的 Return Navigation 配置

### 问题：无法创建设计副本

**解决方案：**
1. 检查 create_url 是否有效
2. 确认用户有权限访问该模板
3. 检查浏览器弹窗设置

## Return Navigation URL 格式

正确的 brand template create URL 应该包含以下参数：

```
https://www.canva.com/design/DAXXXXXXX/template?return_nav_url=http%3A%2F%2F127.0.0.1%3A3001%2Freturn-nav&correlation_state=<base64_encoded_correlation_state>
```

其中：
- `return_nav_url`: 应用的后端 return navigation 端点
- `correlation_state`: Base64 编码的关联状态信息

## 扩展功能

### 自定义模板选择

可以扩展模板选择界面，添加筛选、搜索等功能：

```typescript
// 按创建时间筛选
const recentTemplates = templates.filter(
  t => Date.now() - t.created_at * 1000 < 30 * 24 * 60 * 60 * 1000 // 30天内
);

// 按标题搜索
const filteredTemplates = templates.filter(
  t => t.title.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 模板预览

可以添加模板预览功能：

```typescript
// 使用 view_url 显示模板预览
const previewUrl = template.view_url;
```

这个实现提供了完整的 Brand Template API 集成，支持创建副本和 return navigation，为用户提供了流畅的设计创建体验。
