import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024,
  },
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Grapher backend is running" });
});

app.post("/api/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบไฟล์รูปภาพ",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "ไฟล์ที่อัปโหลดไม่ใช่รูปภาพ",
      });
    }

    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are a math OCR system for a high-school graph analyzer.

Task:
1. Read the equation or graph information from the image.
2. Return only JSON that matches the schema.
3. If the image is unclear, low resolution, cropped, or lacks enough mathematical information, set success to false.
4. Prefer equation formats that this app can parse:
- y = mx + c
- y = ax^2 + bx + c
- y = a(x - h)^2 + k
- (x - h)^2 + (y - k)^2 = r^2
- y = a|x - h| + k
- y = a sin(bx) + k
- y = a cos(bx) + k

Important:
- Use ^2 for powers in the machineEquation.
- Use superscripts such as ² in displayEquation.
- Do not invent missing values.
- If it is only a graph without enough labels/scale/equation, return success false.
              `.trim(),
            },
            {
              type: "input_image",
              image_url: dataUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "graph_image_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              success: {
                type: "boolean",
              },
              machineEquation: {
                type: "string",
              },
              displayEquation: {
                type: "string",
              },
              confidence: {
                type: "number",
              },
              reason: {
                type: "string",
              },
            },
            required: [
              "success",
              "machineEquation",
              "displayEquation",
              "confidence",
              "reason",
            ],
          },
        },
      },
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    if (!parsed.success) {
      return res.json({
        success: false,
        message:
          parsed.reason ||
          "ไม่สามารถระบุข้อมูลจากรูปภาพได้ กรุณาอัปโหลดรูปที่ชัดเจนขึ้น หรือกรอกสมการด้วยตนเอง",
      });
    }

    return res.json({
      success: true,
      machineEquation: parsed.machineEquation,
      displayEquation: parsed.displayEquation,
      confidence: parsed.confidence,
      reason: parsed.reason,
    });
  } catch (error) {
    console.error("Image analysis error:", error);

    return res.status(500).json({
      success: false,
      message:
        "เกิดข้อผิดพลาดระหว่างวิเคราะห์รูปภาพ กรุณาตรวจสอบ API key หรือทดลองใหม่อีกครั้ง",
    });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Grapher backend running on http://localhost:${process.env.PORT || 3001}`);
});