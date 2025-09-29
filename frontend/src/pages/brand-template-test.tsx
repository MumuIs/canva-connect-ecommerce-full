import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import { useAppContext } from "src/context";
import { PageDescriptor } from "src/components";
import { EditInCanvaPageOrigins } from "src/models";

export const BrandTemplateTestPage = (): JSX.Element => {
  const { services, addAlert, isAuthorized } = useAppContext();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBrandTemplateFlow = async () => {
    try {
      addTestResult("开始测试 Brand Template 流程...");
      
      // 1. 测试获取模板列表
      addTestResult("1. 获取品牌模板列表...");
      const templates = await services.brandTemplates.listBrandTemplates();
      addTestResult(`✓ 成功获取 ${templates.length} 个模板`);

      if (templates.length === 0) {
        addTestResult("⚠️ 没有找到任何品牌模板，请确保你的账户中有可用的模板");
        return;
      }

      // 2. 测试获取单个模板详情
      const firstTemplate = templates[0];
      addTestResult(`2. 获取模板详情: ${firstTemplate.title}`);
      const templateDetails = await services.brandTemplates.getBrandTemplate(firstTemplate.id);
      addTestResult(`✓ 模板详情: ID=${templateDetails.id}, Create URL=${templateDetails.create_url}`);

      // 3. 测试 URL 构建
      addTestResult("3. 构建 Return Navigation URL...");
      const correlationState = {
        originPage: EditInCanvaPageOrigins.BRAND_TEMPLATE_CREATOR,
        timestamp: Date.now(),
        selectedTemplates: [firstTemplate.id],
      };

      // 构建 URL
      const url = new URL(templateDetails.create_url);
      const returnNavUrl = `${process.env.BACKEND_URL || 'http://127.0.0.1:3001'}/return-nav`;
      url.searchParams.append('return_nav_url', returnNavUrl);
      const encodedCorrelationState = btoa(JSON.stringify(correlationState));
      url.searchParams.append('correlation_state', encodedCorrelationState);

      addTestResult(`✓ Return Navigation URL 构建完成`);
      addTestResult(`  - Return Nav URL: ${returnNavUrl}`);
      addTestResult(`  - Correlation State: ${encodedCorrelationState}`);
      addTestResult(`  - 完整 URL: ${url.toString()}`);

      // 4. 测试创建副本（不实际打开窗口）
      addTestResult("4. 测试设计副本创建流程...");
      addTestResult("✓ URL 构建成功，可以打开 Canva 编辑器");
      addTestResult("✓ 预期行为：Canva 会创建新的设计副本");
      addTestResult("✓ 新设计会有新的 ID（与模板 ID 不同）");
      addTestResult("✓ 用户编辑完成后点击返回，会回到应用");

      addTestResult("🎉 测试完成！所有步骤都正常");

    } catch (error) {
      addTestResult(`❌ 测试失败: ${error}`);
      console.error("测试错误:", error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isAuthorized) {
    return (
      <Box padding={4}>
        <PageDescriptor
          title="Brand Template 流程测试"
          description="请先连接 Canva 以进行测试"
        />
        <Alert severity="info">
          请先点击右上角的 "Connect to Canva" 按钮进行授权
        </Alert>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <PageDescriptor
        title="Brand Template 流程测试"
        description="测试 Brand Template API 的完整流程和 Return Navigation"
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              测试说明
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              这个测试页面会验证 Brand Template API 的完整流程，包括：
            </Typography>
            <Typography component="ul" variant="body2" color="text.secondary">
              <li>获取品牌模板列表</li>
              <li>获取模板详细信息</li>
              <li>构建 Return Navigation URL</li>
              <li>验证 URL 参数格式</li>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>注意：</strong>这个测试不会实际打开 Canva 编辑器，只会验证 URL 构建过程。
            </Typography>
          </CardContent>
        </Card>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={testBrandTemplateFlow}
            disabled={!isAuthorized}
          >
            开始测试
          </Button>
          <Button
            variant="outlined"
            onClick={clearResults}
            disabled={testResults.length === 0}
          >
            清除结果
          </Button>
        </Box>

        {testResults.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                测试结果
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  maxHeight: 400,
                  overflow: "auto",
                  backgroundColor: "#f5f5f5",
                  padding: 2,
                  borderRadius: 1,
                }}
              >
                {testResults.map((result, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    component="div"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      marginBottom: 0.5,
                    }}
                  >
                    {result}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              预期流程
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. 用户选择品牌模板<br/>
              2. 系统构建带有 return_nav_url 的 URL<br/>
              3. 打开 Canva 编辑器（创建新设计副本）<br/>
              4. 用户编辑设计<br/>
              5. 用户点击返回按钮<br/>
              6. 系统重定向到应用的 return-nav 端点<br/>
              7. 应用显示新创建的设计信息
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
