import { Router, Request, Response } from "express";

export const debugRouter = Router();

debugRouter.get("/brand-templates", async (req: Request, res: Response) => {
  try {
    // 仅在 handler 内读取，而不是文件顶层
    const envToken = process.env.CANVA_TOKEN;
    const headerToken = (req.headers["x-canva-token"] as string) || "";
    const token = envToken || headerToken;

    if (!token) {
      return res.status(401).json({ error: "no-token", hint: "set CANVA_TOKEN or send x-canva-token header" });
    }

    const resp = await fetch("https://api.canva.cn/v1/brand-templates", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const text = await resp.text();
    if (!resp.ok) return res.status(resp.status).send(text);
    res.type("application/json").send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});
export default debugRouter;