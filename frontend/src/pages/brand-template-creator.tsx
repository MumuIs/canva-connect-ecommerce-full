import { useEffect, useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useAppContext } from "src/context";
import { PageDescriptor } from "src/components";
import { createNavigateToCanvaUrl } from "src/services/canva-return";
import type { CorrelationState } from "src/models";
import { EditInCanvaPageOrigins } from "src/models";

export const BrandTemplateCreatorPage = (): JSX.Element => {
  const { services, addAlert, isAuthorized } = useAppContext();
  const [brandTemplates, setBrandTemplates] = useState<BrandTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [useApiMethod, setUseApiMethod] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      loadBrandTemplates();
    }
  }, [isAuthorized]);

  const loadBrandTemplates = async () => {
    try {
      setIsLoading(true);
      const templates = await services.brandTemplates.listBrandTemplates();
      setBrandTemplates(templates);
    } catch (error) {
      console.error("加载 brand templates 失败:", error);
      addAlert({
        title: "加载模板失败",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string, selected: boolean) => {
    if (selected) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    } else {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    }
  };

  const handleCreateDesigns = async () => {
    if (selectedTemplates.length === 0) {
      addAlert({
        title: "请至少选择一个模板",
        variant: "error",
      });
      return;
    }

    setIsCreating(true);
    setShowDialog(true);

    try {
      // 创建关联状态，用于 return navigation
      const correlationState: CorrelationState = {
        originPage: EditInCanvaPageOrigins.BRAND_TEMPLATE_CREATOR,
        timestamp: Date.now(),
        selectedTemplates: selectedTemplates,
      };

      if (useApiMethod) {
        // 使用 API 方法（创建空白设计，保留 return navigation）
        const promises = selectedTemplates.map(templateId =>
          services.brandTemplates.createDesignFromTemplateViaAPI(templateId, correlationState)
        );
        
        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        addAlert({
          title: `成功创建了 ${successCount} 个设计`,
          body: "注意：这是空白设计，用户需要手动应用模板",
          variant: "success",
          hideAfterMs: 5000,
        });
      } else {
        // 使用 create_url 方法（基于模板创建，但可能丢失 return navigation）
        const result = await services.brandTemplates.createMultipleDesignsFromTemplates(
          selectedTemplates,
          correlationState,
        );

        addAlert({
          title: `成功打开 ${result.designs.length} 个模板进行编辑`,
          body: "注意：新设计可能不会保留 return navigation 参数",
          variant: "warning",
          hideAfterMs: 5000,
        });
      }

    } catch (error) {
      console.error("创建设计失败:", error);
      addAlert({
        title: "创建设计失败",
        variant: "error",
      });
    } finally {
      setIsCreating(false);
      setShowDialog(false);
      setSelectedTemplates([]);
    }
  };

  if (!isAuthorized) {
    return (
      <Box padding={4}>
        <PageDescriptor
          title="Brand Template 创建器"
          description="请先连接 Canva 以使用此功能"
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
        title="Brand Template 创建器"
        description="选择 brand templates 并创建设计副本，支持 return navigation"
      />

      <Stack spacing={3}>
        {/* 方法选择 */}
        <Card>
          <CardContent>
            <FormControl component="fieldset">
              <FormLabel component="legend">创建方法选择</FormLabel>
              <RadioGroup
                value={useApiMethod}
                onChange={(e) => setUseApiMethod(e.target.value === 'true')}
              >
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">
                        使用 create_url 方法（推荐）
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        基于模板创建副本，但可能丢失 return navigation 参数
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">
                        使用 API 方法
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        创建空白设计，保留 return navigation，但需要手动应用模板
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* 操作区域 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            已选择 {selectedTemplates.length} 个模板
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateDesigns}
            disabled={selectedTemplates.length === 0 || isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            {isCreating ? "创建中..." : "创建设计副本"}
          </Button>
        </Box>

        {/* 模板列表 */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" padding={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {brandTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: "100%" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      template.thumbnail?.url ||
                      "https://placehold.co/400x200/000000/FFF?text=No+Image"
                    }
                    alt={template.title}
                    sx={{ objectFit: "contain" }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ID: {template.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      创建时间: {new Date(template.created_at * 1000).toLocaleDateString()}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedTemplates.includes(template.id)}
                          onChange={(e) => handleTemplateSelect(template.id, e.target.checked)}
                        />
                      }
                      label="选择此模板"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {brandTemplates.length === 0 && !isLoading && (
          <Alert severity="info">
            没有找到任何 brand templates。请确保你的 Canva 账户中有可用的品牌模板。
          </Alert>
        )}
      </Stack>

      {/* 创建确认对话框 */}
      <Dialog open={showDialog} onClose={() => {}}>
        <DialogTitle>正在创建设计副本</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>
              正在打开 {selectedTemplates.length} 个模板进行编辑...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
