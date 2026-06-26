import React, { useRef, useState } from "react";

const KEYBOARD_ROWS = [
  ["x", "y", "²", "³", "√(", "| |"],
  ["(", ")", "+", "-", "×", "/"],
  ["sin(", "cos(", "tan(", "ln(", "π", "="],
];

export default function GraphAnalyzer({ goHome, goMenu, sendToStudio }) {
  const [inputMode, setInputMode] = useState("equation");
  const [equation, setEquation] = useState("y = x^2 - 4x + 3");
  const [result, setResult] = useState(null);
  const [checklist, setChecklist] = useState({
    shape: "",
    direction: "",
    closedShape: "",
    domainLimit: "",
    rangeLimit: "",
    asymptote: "",
    periodic: "",
    symmetry: ""
  });
  
  const [imagePreview, setImagePreview] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [ocrEquation, setOcrEquation] = useState("");
  const inputRef = useRef(null);

  function insertToken(token) {
    const input = inputRef.current;

    const cleanToken =
      token === "| |"
        ? "||"
        : token === "√("
          ? "√("
          : token === "×"
            ? "*"
            : token;

    if (!input) {
      setEquation((prev) => prev + cleanToken);
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const before = equation.slice(0, start);
    const after = equation.slice(end);

    let next = before + cleanToken + after;
    let cursor = start + cleanToken.length;

    if (token === "| |") {
      next = before + "|" + after + "|";
      cursor = start + 1;
    }

    setEquation(next);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(cursor, cursor);
    }, 0);
  }

  function handleAnalyzeEquation() {
    try {
      const analyzed = analyzeEquation(equation);
      setResult(analyzed);
    } catch (error) {
      console.error("Analyze equation error:", error);
      setResult({
        status: "error",
        message: "เกิดข้อผิดพลาดระหว่างวิเคราะห์สมการ กรุณาตรวจสอบรูปแบบสมการ หรือดู Console เพื่อตรวจ error"
      });
    }
  }

  function updateChecklist(key, value) {
  setChecklist((prev) => ({
    ...prev,
    [key]: value
  }));
}

  function handleAnalyzeChecklist() {
    try {
      const analyzed = analyzeChecklist(checklist);
      setResult(analyzed);
    } catch (error) {
      console.error("Analyze checklist error:", error);
      setResult({
        status: "error",
        message: "เกิดข้อผิดพลาดระหว่างวิเคราะห์ checklist กรุณาตรวจสอบว่า function analyzeChecklist ถูกเพิ่มไว้ครบแล้ว"
      });
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    setResult(null);
    setImageMessage("");
    setOcrEquation("");
    setImageLoading(false);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImagePreview("");
      setImageMessage("ไฟล์ที่อัปโหลดไม่ใช่รูปภาพ กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    const img = new Image();

    img.onload = async () => {
      if (img.width < 500 || img.height < 250) {
        setImageMessage(
          "ไม่สามารถระบุข้อมูลจากรูปภาพได้ เนื่องจากรูปภาพมีความละเอียดต่ำ กรุณาอัปโหลดรูปที่ชัดเจนขึ้น หรือกรอกสมการด้วยตนเอง"
        );
        return;
      }

      try {
        setImageLoading(true);
        setImageMessage("กำลังวิเคราะห์รูปภาพ กรุณารอสักครู่...");

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("http://localhost:3001/api/analyze-image", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setImageMessage(
            data.message ||
              "ไม่สามารถระบุข้อมูลจากรูปภาพได้ กรุณาอัปโหลดรูปที่ชัดเจนขึ้น หรือกรอกสมการด้วยตนเอง"
          );
          return;
        }

        const machineEquation = data.machineEquation || "";
        const displayEquation = data.displayEquation || machineEquation;

        setOcrEquation(displayEquation);
        setEquation(machineEquation);

        const analyzed = analyzeEquation(machineEquation);
        setResult(analyzed);

        setImageMessage(
          `อ่านสมการจากรูปภาพได้: ${displayEquation} | Confidence: ${Math.round(
            (data.confidence || 0) * 100
          )}%`
        );
      } catch (error) {
        console.error(error);
        setImageMessage(
          "เชื่อมต่อ backend ไม่สำเร็จ กรุณาตรวจสอบว่าได้รัน npm run server แล้ว"
        );
      } finally {
        setImageLoading(false);
      }
    };

    img.onerror = () => {
      setImageMessage("ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาอัปโหลดรูปภาพใหม่");
    };

    img.src = url;
  }

  return (
    <>
      <header className="analyzer-header">
        <button className="logo" onClick={goHome}>
          Graph<span>er</span>
        </button>
        <div className="header-title">Graph Analyzer</div>
      </header>

      <section className="analyzer-page">
        <div className="analyzer-top">
          <div>
            <button className="back-button" onClick={goMenu}>
              ← กลับไปเลือกกราฟ
            </button>

            <h1>วิเคราะห์กราฟจากสมการหรือรูปภาพ</h1>
            <p>
              เลือกรูปแบบการป้อนข้อมูล จากนั้นให้ระบบวิเคราะห์ชนิดกราฟ จุดสำคัญ
              โดเมน เรนจ์ และการเป็นฟังก์ชัน
            </p>
          </div>

          <div className="mode-switch">
            <button
              type="button"
              className={inputMode === "equation" ? "mode-button active" : "mode-button"}
              onClick={() => setInputMode("equation")}
            >
              Equation Input
            </button>
            <button
              type="button"
              className={inputMode === "checklist" ? "mode-button active" : "mode-button"}
              onClick={() => setInputMode("checklist")}
            >
              Visual Checklist
            </button>
          </div>
        </div>

        <div className="analyzer-layout">
          <div className="analyzer-input-card">
            {inputMode === "equation" ? (
              <>
                <h2>กรอกสมการ</h2>
                <p className="muted">
                  ตัวอย่าง: y = 2x + 3, y = x^2 - 4x + 3, (x - 1)^2 + (y + 2)^2 = 16
                </p>

                <textarea
                  ref={inputRef}
                  className="equation-box"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder="พิมพ์สมการที่นี่..."
                />

                <div className="math-keyboard">
                  {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div className="keyboard-row" key={rowIndex}>
                      {row.map((key) => (
                        <button key={key} onClick={() => insertToken(key)}>
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <button type="button" className="analyze-button" onClick={handleAnalyzeEquation}>
                  Analyze Graph
                </button>
              </>
            ) : (
              <>
                <>
               <h2>ตอบคำถามลักษณะกราฟ</h2>
                <p className="muted">
                ใช้ในกรณีที่ผู้ใช้เห็นกราฟจากรูปหรือโจทย์ แต่ยังไม่รู้สมการ ระบบจะช่วยเดาชนิดกราฟจากลักษณะสำคัญ
                </p>

              <div className="checklist-grid">
                    <ChecklistSelect
                      label="ลักษณะโดยรวมของกราฟ"
                      value={checklist.shape}
                      onChange={(value) => updateChecklist("shape", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["straight", "เป็นเส้นตรง"],
                        ["parabola", "เป็นเส้นโค้งรูปพาราโบลา"],
                        ["vshape", "เป็นรูปตัว V"],
                        ["circle", "เป็นวงกลม"],
                        ["ellipse", "เป็นวงรี"],
                        ["twoBranches", "มี 2 แขนแยกจากกัน"],
                        ["wave", "เป็นคลื่นซ้ำ ๆ"],
                        ["rapidCurve", "โค้งเพิ่ม/ลดเร็วมาก"],
                        ["slowCurve", "โค้งเพิ่ม/ลดช้า มีเส้นกำกับแนวตั้ง"]
                      ]}
                    />

                    <ChecklistSelect
                      label="ทิศทางการเปิด/แนวโน้ม"
                      value={checklist.direction}
                      onChange={(value) => updateChecklist("direction", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["up", "เปิดขึ้น"],
                        ["down", "เปิดลง"],
                        ["leftRight", "เปิดซ้าย-ขวา"],
                        ["upDown", "เปิดขึ้น-ลง"],
                        ["increasing", "เพิ่มขึ้น"],
                        ["decreasing", "ลดลง"],
                        ["none", "ไม่แน่ใจ"]
                      ]}
                    />

                    <ChecklistSelect
                      label="กราฟเป็นรูปปิดหรือไม่"
                      value={checklist.closedShape}
                      onChange={(value) => updateChecklist("closedShape", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["yes", "เป็นรูปปิด"],
                        ["no", "ไม่เป็นรูปปิด"],
                        ["unknown", "ไม่แน่ใจ"]
                      ]}
                    />

                    <ChecklistSelect
                      label="Domain เป็นช่วงจำกัดไหม"
                      value={checklist.domainLimit}
                      onChange={(value) => updateChecklist("domainLimit", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["limited", "จำกัด"],
                        ["allReal", "จำนวนจริงทั้งหมด"],
                        ["partial", "มีเงื่อนไขบางช่วง"],
                        ["unknown", "ไม่แน่ใจ"]
                      ]}
                    />

                    <ChecklistSelect
                      label="Range เป็นช่วงจำกัดไหม"
                      value={checklist.rangeLimit}
                      onChange={(value) => updateChecklist("rangeLimit", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["limited", "จำกัด"],
                        ["allReal", "จำนวนจริงทั้งหมด"],
                        ["lowerBound", "มีค่าต่ำสุด"],
                        ["upperBound", "มีค่าสูงสุด"],
                        ["unknown", "ไม่แน่ใจ"]
                      ]}
                    />

                    <ChecklistSelect
                      label="มีเส้นกำกับหรือไม่"
                      value={checklist.asymptote}
                      onChange={(value) => updateChecklist("asymptote", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["vertical", "มีเส้นกำกับแนวตั้ง"],
                        ["horizontal", "มีเส้นกำกับแนวนอน"],
                        ["both", "มีทั้งแนวตั้งและแนวนอน/เฉียง"],
                        ["none", "ไม่มี"],
                        ["unknown", "ไม่แน่ใจ"]
                      ]}
                    />

                    <ChecklistSelect
                      label="กราฟเป็นคาบหรือไม่"
                      value={checklist.periodic}
                      onChange={(value) => updateChecklist("periodic", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["yes", "เป็นคาบ/ซ้ำไปเรื่อย ๆ"],
                        ["no", "ไม่เป็นคาบ"],
                        ["unknown", "ไม่แน่ใจ"]
                      ]}
                    />

                    <ChecklistSelect
                      label="สมมาตรของกราฟ"
                      value={checklist.symmetry}
                      onChange={(value) => updateChecklist("symmetry", value)}
                      options={[
                        ["", "เลือกคำตอบ"],
                        ["yAxis", "สมมาตรกับแกน y"],
                        ["xAxis", "สมมาตรกับแกน x"],
                        ["origin", "สมมาตรกับจุดกำเนิด"],
                        ["center", "สมมาตรกับจุดศูนย์กลาง"],
                        ["none", "ไม่เห็นสมมาตรชัดเจน"],
                        ["unknown", "ไม่แน่ใจ"]
                      ]}
                    />
                  </div>

                  <button type="button" className="analyze-button" onClick={handleAnalyzeChecklist}>
                    Analyze from Checklist
                  </button>
                </>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ChecklistSelect({ label, value, onChange, options }) {
  return (
    <label className="checklist-select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultItem({ title, value }) {
  return (
    <div className="result-item">
      <small>{title}</small>
      <strong className="math-display">{value}</strong>
    </div>
  );
}

function analyzeEquation(rawEquation) {
  const original = rawEquation.trim();

  if (!original) {
    return {
      status: "error",
      message: "กรุณากรอกสมการก่อนวิเคราะห์"
    };
  }

  const eq = normalizeEquation(original);

  const horizontalLine = analyzeHorizontalLine(eq);
  if (horizontalLine) return horizontalLine;

  const verticalLine = analyzeVerticalLine(eq);
  if (verticalLine) return verticalLine;

  const linear = analyzeLinear(eq);
  if (linear) return linear;

  const quadraticStandard = analyzeQuadraticStandard(eq);
  if (quadraticStandard) return quadraticStandard;

  const quadraticVertex = analyzeQuadraticVertex(eq);
  if (quadraticVertex) return quadraticVertex;

  const circle = analyzeCircle(eq);
  if (circle) return circle;

  const ellipse = analyzeEllipse(eq);
  if (ellipse) return ellipse;

  const hyperbola = analyzeHyperbola(eq);
  if (hyperbola) return hyperbola;

  const absolute = analyzeAbsolute(eq);
  if (absolute) return absolute;

  const exponential = analyzeExponential(eq);
  if (exponential) return exponential;

  const logarithmic = analyzeLogarithmic(eq);
  if (logarithmic) return logarithmic;

  const trig = analyzeTrig(eq);
  if (trig) return trig;

  return {
    status: "error",
    message:
      "ระบบยังไม่สามารถวิเคราะห์สมการนี้ได้ กรุณาตรวจรูปแบบสมการ หรือใช้ Visual Checklist เพื่อช่วยระบุชนิดกราฟ"
  };
}

function normalizeEquation(text) {
  return text
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("²", "^2")
    .replaceAll("³", "^3")
    .replaceAll("−", "-")
    .replaceAll("×", "*")
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt")
    .replaceAll("**", "^");
}

function analyzeLinear(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)x([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const m = parseCoefficient(match[1]);
  const c = match[2] ? Number(match[2]) : 0;

  return {
    status: "success",
    graphType: "Linear Graph",
    equation: `y = ${fmt(m)}x ${c >= 0 ? "+" : "-"} ${fmt(Math.abs(c))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: "Domain: จำนวนจริง, Range: จำนวนจริง",
    values: [
      `ความชัน m = ${fmt(m)}`,
      `จุดตัดแกน y = (0, ${fmt(c)})`,
      `ตัวอย่างจุดบนกราฟ: (1, ${fmt(m + c)})`,
    ],
    details: [
      "กราฟเป็นเส้นตรง",
      "ค่า x หนึ่งค่าจะให้ค่า y เพียงค่าเดียว จึงเป็นฟังก์ชัน",
      "ความชันบอกทิศทางและความชันของเส้นตรง",
    ],
    studioType: "linear",
    studioParams: {
      x1: 0,
      y1: c,
      x2: 1,
      y2: m + c,
    },
  };
}

function analyzeQuadraticStandard(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const b = parseCoefficient(match[2]);
  const c = match[3] ? Number(match[3]) : 0;

  if (a === 0) return null;

  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const discriminant = b * b - 4 * a * c;

  const xIntercepts =
    discriminant > 0
      ? [
          (-b + Math.sqrt(discriminant)) / (2 * a),
          (-b - Math.sqrt(discriminant)) / (2 * a),
        ]
      : discriminant === 0
        ? [-b / (2 * a)]
        : [];

  return {
    status: "success",
    graphType: "Quadratic Graph",
    equation: `y = ${fmt(a)}x² ${b >= 0 ? "+" : "-"} ${fmt(Math.abs(b))}x ${c >= 0 ? "+" : "-"} ${fmt(Math.abs(c))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: ${a > 0 ? `y ≥ ${fmt(k)}` : `y ≤ ${fmt(k)}`}`,
    values: [
      `a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}`,
      `จุดยอด = (${fmt(h)}, ${fmt(k)})`,
      `แกนสมมาตร = x = ${fmt(h)}`,
      xIntercepts.length > 0
        ? `จุดตัดแกน x = ${xIntercepts.map((x) => `(${fmt(x)}, 0)`).join(", ")}`
        : "ไม่มีจุดตัดแกน x จริง",
      `จุดตัดแกน y = (0, ${fmt(c)})`,
    ],
    details: [
      a > 0 ? "กราฟพาราโบลาเปิดขึ้น" : "กราฟพาราโบลาเปิดลง",
      "กราฟพาราโบลาแนวตั้งเป็นฟังก์ชันของ x",
      "จุดยอดเป็นค่าต่ำสุดหรือค่าสูงสุดของกราฟ",
    ],
    studioType: "quadratic",
    studioParams: {
      h,
      k,
      a: Math.abs(a),
      opening: a > 0 ? "up" : "down",
    },
  };
}

function analyzeQuadraticVertex(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\(x([+-]\d*\.?\d+)\)\^2([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const h = -Number(match[2]);
  const k = match[3] ? Number(match[3]) : 0;

  return {
    status: "success",
    graphType: "Quadratic Graph",
    equation: `y = ${fmt(a)}(x - ${fmt(h)})² ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: ${a > 0 ? `y ≥ ${fmt(k)}` : `y ≤ ${fmt(k)}`}`,
    values: [
      `จุดยอด = (${fmt(h)}, ${fmt(k)})`,
      `แกนสมมาตร = x = ${fmt(h)}`,
      `ค่าความกว้างของกราฟ a = ${fmt(a)}`,
    ],
    details: [
      a > 0 ? "กราฟเปิดขึ้น" : "กราฟเปิดลง",
      "สมการนี้อยู่ในรูปจุดยอดของพาราโบลา",
      "สามารถอ่านจุดยอดได้โดยตรงจากรูป y = a(x - h)² + k",
    ],
    studioType: "quadratic",
    studioParams: {
      h,
      k,
      a: Math.abs(a),
      opening: a > 0 ? "up" : "down",
    },
  };
}

function analyzeCircle(eq) {
  let match = eq.match(/^\(x([+-]\d*\.?\d+)\)\^2\+\(y([+-]\d*\.?\d+)\)\^2=([+-]?\d*\.?\d+)$/);

  if (match) {
    const h = -Number(match[1]);
    const k = -Number(match[2]);
    const rSquared = Number(match[3]);
    return buildCircleResult(h, k, rSquared);
  }

  match = eq.match(/^x\^2\+y\^2=([+-]?\d*\.?\d+)$/);

  if (match) {
    return buildCircleResult(0, 0, Number(match[1]));
  }

  return null;
}

function buildCircleResult(h, k, rSquared) {
  if (rSquared <= 0) {
    return {
      status: "error",
      message: "ค่า r² ต้องมากกว่า 0 จึงจะเป็นวงกลมที่มีรัศมีจริง",
    };
  }

  const r = Math.sqrt(rSquared);

  return {
    status: "success",
    graphType: "Circle Graph",
    equation: `(x - ${fmt(h)})² + (y - ${fmt(k)})² = ${fmt(rSquared)}`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange: `Domain: ${fmt(h - r)} ≤ x ≤ ${fmt(h + r)}, Range: ${fmt(k - r)} ≤ y ≤ ${fmt(k + r)}`,
    values: [
      `จุดศูนย์กลาง = (${fmt(h)}, ${fmt(k)})`,
      `รัศมี r = ${fmt(r)}`,
      `r² = ${fmt(rSquared)}`,
    ],
    details: [
      "กราฟเป็นวงกลม",
      "วงกลมเต็มรูปไม่ผ่าน Vertical Line Test",
      "ค่า x บางค่าอาจให้ค่า y ได้ 2 ค่า จึงไม่เป็นฟังก์ชัน",
    ],
    studioType: "circle",
    studioParams: {
      h,
      k,
      r,
    },
  };
}

function analyzeAbsolute(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\|x([+-]\d*\.?\d+)\|([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const h = -Number(match[2]);
  const k = match[3] ? Number(match[3]) : 0;

  return {
    status: "success",
    graphType: "Absolute Value Graph",
    equation: `y = ${fmt(a)}|x - ${fmt(h)}| ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: ${a > 0 ? `y ≥ ${fmt(k)}` : `y ≤ ${fmt(k)}`}`,
    values: [
      `จุดยอด = (${fmt(h)}, ${fmt(k)})`,
      `ค่าความชันของแขนกราฟ = ${fmt(Math.abs(a))}`,
      `กราฟเปิด${a > 0 ? "ขึ้น" : "ลง"}`,
    ],
    details: [
      "กราฟค่าสัมบูรณ์มีลักษณะเป็นรูปตัว V",
      "กราฟแนวตั้งเป็นฟังก์ชันของ x",
      "จุดยอดเป็นจุดเปลี่ยนทิศทางของกราฟ",
    ],
    studioType: "absolute",
    studioParams: {
      h,
      k,
      a: Math.abs(a),
      opening: a > 0 ? "up" : "down",
    },
  };
}

function analyzeTrig(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)(sin|cos)\(([+-]?\d*\.?\d*)x\)([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const trigType = match[2];
  const b = parseCoefficient(match[3]);
  const k = match[4] ? Number(match[4]) : 0;

  const amplitude = Math.abs(a);
  const period = b !== 0 ? (2 * Math.PI) / Math.abs(b) : null;

  return {
    status: "success",
    graphType: trigType === "sin" ? "Sine Graph" : "Cosine Graph",
    equation: `y = ${fmt(a)}${trigType}(${fmt(b)}x) ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: ${fmt(k - amplitude)} ≤ y ≤ ${fmt(k + amplitude)}`,
    values: [
      `Amplitude = ${fmt(amplitude)}`,
      period ? `Period = ${fmt(period)}` : "ไม่สามารถหาคาบได้ เพราะ b = 0",
      `เส้นกึ่งกลาง = y = ${fmt(k)}`,
    ],
    details: [
      trigType === "sin" ? "กราฟเป็นฟังก์ชันไซน์" : "กราฟเป็นฟังก์ชันคอส",
      "กราฟตรีโกณมิติเป็นกราฟคาบ",
      "เวอร์ชันนี้ยังไม่เชื่อมกราฟไซน์/คอสเข้ากับ Graph Studio",
    ],
    studioType: null,
    studioParams: null,
  };
}

function parseCoefficient(value) {
  if (value === "" || value === "+") return 1;
  if (value === "-") return -1;
  return Number(value);
}

function fmt(num) {
  const value = Number(num);
  if (!Number.isFinite(value)) return "-";
  if (Math.abs(value) < 0.000001) return "0";
  return Number(value.toFixed(3)).toString();
}

function prettyEquation(text) {
  return String(text)
    .replaceAll("^2", "²")
    .replaceAll("^3", "³")
    .replaceAll("sqrt", "√")
    .replaceAll("pi", "π")
    .replaceAll("*", "×");
}

function updateChecklist(key, value) {
  setChecklist((prev) => ({
    ...prev,
    [key]: value
  }));
}

function handleAnalyzeChecklist() {
  const analyzed = analyzeChecklist(checklist);
  setResult(analyzed);
}

function analyzeChecklist(data) {
  if (!data.shape) {
    return {
      status: "error",
      message: "กรุณาเลือกลักษณะโดยรวมของกราฟก่อนวิเคราะห์"
    };
  }

  if (data.periodic === "yes" || data.shape === "wave") {
    return {
      status: "success",
      graphType: "Sine / Cosine Graph",
      equation: "y = a sin(bx) + k หรือ y = a cos(bx) + k",
      isFunction: "มักเป็นฟังก์ชัน หากเป็นกราฟคลื่นแนวตั้ง",
      domainRange: "Domain: จำนวนจริง, Range: จำกัดอยู่ระหว่างค่าสูงสุดและต่ำสุด",
      values: [
        "ลักษณะสำคัญ: กราฟเป็นคาบ",
        "มีค่าสูงสุดและค่าต่ำสุดซ้ำ ๆ",
        "ควรวิเคราะห์ amplitude, period และเส้นกึ่งกลางเพิ่มเติม"
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟตรีโกณมิติ เช่น sine หรือ cosine",
        "ต้องทราบจุดสูงสุด จุดต่ำสุด หรือคาบของกราฟเพื่อเขียนสมการที่แน่นอนได้",
        "ถ้ากราฟซ้ำเป็นช่วง ๆ อย่างสม่ำเสมอ มักเป็นกราฟประเภท periodic function"
      ],
      studioType: null,
      studioParams: null
    };
  }

  if (data.shape === "straight") {
    return {
      status: "success",
      graphType: "Linear Graph",
      equation: "y = mx + c",
      isFunction: "เป็นฟังก์ชัน ยกเว้นกรณีเส้นตรงแนวตั้ง x = a",
      domainRange: "โดยทั่วไป Domain: จำนวนจริง, Range: จำนวนจริง",
      values: [
        "ลักษณะสำคัญ: เป็นเส้นตรง",
        "ต้องใช้จุดอย่างน้อย 2 จุดเพื่อหาความชัน",
        "ความชัน m = (y₂ − y₁)/(x₂ − x₁)"
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟเส้นตรง",
        "หากเส้นตรงไม่ตั้งฉากกับแกน x จะเป็นฟังก์ชันของ x",
        "ควรระบุจุด 2 จุดบนกราฟเพื่อเขียนสมการได้แม่นยำ"
      ],
      studioType: "linear",
      studioParams: {
        x1: -2,
        y1: -1,
        x2: 2,
        y2: 3
      }
    };
  }

  if (data.shape === "parabola") {
    const opening = data.direction === "down" ? "down" : "up";

    return {
      status: "success",
      graphType: "Quadratic Graph",
      equation: "y = a(x − h)² + k",
      isFunction:
        data.direction === "leftRight"
          ? "ไม่เป็นฟังก์ชัน หากเปิดซ้ายหรือขวา"
          : "เป็นฟังก์ชัน หากเปิดขึ้นหรือลง",
      domainRange:
        opening === "up"
          ? "Domain: จำนวนจริง, Range: y ≥ k"
          : "Domain: จำนวนจริง, Range: y ≤ k",
      values: [
        "ลักษณะสำคัญ: มีจุดยอด",
        "มีแกนสมมาตรผ่านจุดยอด",
        `ทิศทางที่คาดว่าเปิด: ${opening === "up" ? "ขึ้น" : "ลง"}`
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟพาราโบลา",
        "ต้องรู้จุดยอดและจุดบนกราฟอีกหนึ่งจุดเพื่อหาสมการที่แน่นอน",
        "ถ้าเปิดขึ้นหรือลง จะเป็นฟังก์ชันของ x"
      ],
      studioType: "quadratic",
      studioParams: {
        h: 0,
        k: -2,
        a: 0.5,
        opening
      }
    };
  }

  if (data.shape === "vshape") {
    const opening = data.direction === "down" ? "down" : "up";

    return {
      status: "success",
      graphType: "Absolute Value Graph",
      equation: "y = a|x − h| + k",
      isFunction:
        data.direction === "leftRight"
          ? "ไม่เป็นฟังก์ชัน หากเปิดซ้ายหรือขวา"
          : "เป็นฟังก์ชัน หากเปิดขึ้นหรือลง",
      domainRange:
        opening === "up"
          ? "Domain: จำนวนจริง, Range: y ≥ k"
          : "Domain: จำนวนจริง, Range: y ≤ k",
      values: [
        "ลักษณะสำคัญ: เป็นรูปตัว V",
        "มีจุดยอดเป็นจุดหักมุม",
        `ทิศทางที่คาดว่าเปิด: ${opening === "up" ? "ขึ้น" : "ลง"}`
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟค่าสัมบูรณ์",
        "ต้องรู้จุดยอดและความชันของแขนกราฟเพื่อเขียนสมการ",
        "กราฟรูปตัว V แนวตั้งเป็นฟังก์ชันของ x"
      ],
      studioType: "absolute",
      studioParams: {
        h: 0,
        k: -1,
        a: 1,
        opening
      }
    };
  }

  if (data.shape === "circle" || (data.closedShape === "yes" && data.symmetry === "center")) {
    return {
      status: "success",
      graphType: "Circle Graph",
      equation: "(x − h)² + (y − k)² = r²",
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange: "Domain และ Range เป็นช่วงจำกัด",
      values: [
        "ลักษณะสำคัญ: เป็นรูปปิด",
        "มีจุดศูนย์กลาง",
        "ระยะจากจุดศูนย์กลางถึงขอบวงกลมเท่ากันทุกทิศทาง"
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟวงกลม",
        "วงกลมเต็มรูปไม่ผ่าน Vertical Line Test",
        "ต้องรู้จุดศูนย์กลางและรัศมีเพื่อเขียนสมการ"
      ],
      studioType: "circle",
      studioParams: {
        h: 0,
        k: 0,
        r: 4
      }
    };
  }

  if (data.shape === "ellipse" || (data.closedShape === "yes" && data.domainLimit === "limited" && data.rangeLimit === "limited")) {
    return {
      status: "success",
      graphType: "Ellipse Graph",
      equation: "(x − h)²/a² + (y − k)²/b² = 1",
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange: "Domain และ Range เป็นช่วงจำกัด",
      values: [
        "ลักษณะสำคัญ: เป็นรูปปิดคล้ายวงกลมแต่ยืดออก",
        "มีแกนเอกและแกนโท",
        "มีจุดศูนย์กลาง"
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟวงรี",
        "วงรีเต็มรูปไม่เป็นฟังก์ชันของ x",
        "ต้องรู้จุดศูนย์กลางและความยาวแกนเพื่อเขียนสมการ"
      ],
      studioType: "ellipse",
      studioParams: {
        h: 0,
        k: 0,
        rx: 5,
        ry: 3
      }
    };
  }

  if (data.shape === "twoBranches" || data.asymptote === "both") {
    const orientation = data.direction === "upDown" ? "vertical" : "horizontal";

    return {
      status: "success",
      graphType: "Hyperbola Graph",
      equation:
        orientation === "horizontal"
          ? "(x − h)²/a² − (y − k)²/b² = 1"
          : "(y − k)²/a² − (x − h)²/b² = 1",
      isFunction: "โดยทั่วไปไฮเพอร์โบลาเต็มรูปไม่เป็นฟังก์ชันของ x",
      domainRange:
        orientation === "horizontal"
          ? "Domain เป็นสองช่วงแยกกัน"
          : "Domain เป็นจำนวนจริง",
      values: [
        "ลักษณะสำคัญ: มี 2 แขน",
        "มีเส้นกำกับ",
        `ทิศทางที่คาดว่าเปิด: ${orientation === "horizontal" ? "ซ้าย-ขวา" : "ขึ้น-ลง"}`
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟไฮเพอร์โบลา",
        "ต้องรู้จุดศูนย์กลาง ค่า a, b และเส้นกำกับเพื่อเขียนสมการ",
        "กราฟมีลักษณะเข้าใกล้เส้นกำกับแต่ไม่ตัดเส้นกำกับ"
      ],
      studioType: "hyperbola",
      studioParams: {
        h: 0,
        k: 0,
        a: 3,
        b: 2,
        orientation
      }
    };
  }

  if (data.shape === "rapidCurve" || data.asymptote === "horizontal") {
    return {
      status: "success",
      graphType: "Exponential Graph",
      equation: "y = a · b^(x − h) + k",
      isFunction: "เป็นฟังก์ชัน",
      domainRange: "Domain: จำนวนจริง, Range ขึ้นอยู่กับค่า a และ k",
      values: [
        "ลักษณะสำคัญ: เพิ่มหรือลดเร็วมาก",
        "มักมีเส้นกำกับแนวนอน",
        "ค่าของกราฟเปลี่ยนเร็วเมื่อ x เพิ่มขึ้น"
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟเอ็กซ์โพเนนเชียล",
        "ต้องรู้ฐาน b และจุดอ้างอิงเพื่อเขียนสมการ",
        "กราฟประเภทนี้มักใช้กับการเติบโตหรือการลดลงแบบทวีคูณ"
      ],
      studioType: "exponential",
      studioParams: {
        h: 0,
        k: 0,
        a: 1,
        base: 2
      }
    };
  }

  if (data.shape === "slowCurve" || data.asymptote === "vertical") {
    return {
      status: "success",
      graphType: "Logarithmic Graph",
      equation: "y = a ln(x − h) + k",
      isFunction: "เป็นฟังก์ชัน",
      domainRange: "Domain: x > h, Range: จำนวนจริง",
      values: [
        "ลักษณะสำคัญ: มีเส้นกำกับแนวตั้ง",
        "กราฟเพิ่มหรือลดช้าลงเรื่อย ๆ",
        "มีข้อจำกัดของ Domain"
      ],
      details: [
        "ระบบคาดว่าเป็นกราฟลอการิทึม",
        "ต้องรู้ตำแหน่งเส้นกำกับแนวตั้งเพื่อเขียนสมการ",
        "ค่าในลอการิทึมต้องมากกว่า 0 เสมอ"
      ],
      studioType: "logarithmic",
      studioParams: {
        h: -3,
        k: 0,
        a: 1
      }
    };
  }

  return {
    status: "error",
    message:
      "ข้อมูลจาก checklist ยังไม่เพียงพอที่จะระบุชนิดกราฟได้อย่างมั่นใจ กรุณาเลือกข้อมูลเพิ่มเติม เช่น รูปร่างโดยรวม เส้นกำกับ Domain/Range หรือสมมาตรของกราฟ"
  };
}

function analyzeHorizontalLine(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d+)$/);
  if (!match) return null;

  const c = Number(match[1]);

  return {
    status: "success",
    graphType: "Horizontal Line",
    equation: `y = ${fmt(c)}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: y = ${fmt(c)}`,
    values: [
      `เป็นเส้นตรงแนวนอน`,
      `จุดตัดแกน y = (0, ${fmt(c)})`,
      `ความชัน m = 0`
    ],
    details: [
      "กราฟเป็นเส้นตรงแนวนอน",
      "ค่า x ทุกค่าจะให้ค่า y เท่ากัน",
      "ผ่าน Vertical Line Test จึงเป็นฟังก์ชัน"
    ],
    studioType: "linear",
    studioParams: {
      x1: -3,
      y1: c,
      x2: 3,
      y2: c
    }
  };
}

function analyzeVerticalLine(eq) {
  const match = eq.match(/^x=([+-]?\d*\.?\d+)$/);
  if (!match) return null;

  const c = Number(match[1]);

  return {
    status: "success",
    graphType: "Vertical Line",
    equation: `x = ${fmt(c)}`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange: `Domain: x = ${fmt(c)}, Range: จำนวนจริง`,
    values: [
      `เป็นเส้นตรงแนวตั้ง`,
      `ผ่านค่า x = ${fmt(c)}`,
      "ไม่สามารถเขียนเป็น y = f(x) แบบปกติได้"
    ],
    details: [
      "กราฟเป็นเส้นตรงแนวตั้ง",
      "ไม่ผ่าน Vertical Line Test",
      "ค่า x หนึ่งค่าให้ค่า y ได้หลายค่า จึงไม่เป็นฟังก์ชัน"
    ],
    studioType: "linear",
    studioParams: {
      x1: c,
      y1: -3,
      x2: c,
      y2: 3
    }
  };
}

function analyzeExponential(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\*?\(?([+-]?\d*\.?\d+|e)\)?\^x([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const base = match[2] === "e" ? Math.E : Number(match[2]);
  const k = match[3] ? Number(match[3]) : 0;

  if (base <= 0 || base === 1) {
    return {
      status: "error",
      message: "ฐานของกราฟเอ็กซ์โพเนนเชียลต้องมากกว่า 0 และไม่เท่ากับ 1"
    };
  }

  return {
    status: "success",
    graphType: "Exponential Graph",
    equation: `y = ${fmt(a)}(${match[2]})^x ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: ${a >= 0 ? `y > ${fmt(k)}` : `y < ${fmt(k)}`}`,
    values: [
      `ค่าเริ่มต้น a = ${fmt(a)}`,
      `ฐาน b = ${match[2]}`,
      `เส้นกำกับแนวนอนคือ y = ${fmt(k)}`
    ],
    details: [
      "กราฟเอ็กซ์โพเนนเชียลเป็นฟังก์ชันของ x",
      base > 1 ? "กราฟมีแนวโน้มเพิ่มขึ้น" : "กราฟมีแนวโน้มลดลง",
      "กราฟมีเส้นกำกับแนวนอน"
    ],
    studioType: "exponential",
    studioParams: {
      h: 0,
      k,
      a,
      base
    }
  };
}

function analyzeLogarithmic(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)(ln|log)\(x([+-]\d*\.?\d+)?\)([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const h = match[3] ? -Number(match[3]) : 0;
  const k = match[4] ? Number(match[4]) : 0;

  return {
    status: "success",
    graphType: "Logarithmic Graph",
    equation: `y = ${fmt(a)}${match[2]}(x - ${fmt(h)}) ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: x > ${fmt(h)}, Range: จำนวนจริง`,
    values: [
      `เส้นกำกับแนวตั้งคือ x = ${fmt(h)}`,
      `เลื่อนกราฟแนวตั้ง k = ${fmt(k)}`,
      `ค่าความชัน/การยืด a = ${fmt(a)}`
    ],
    details: [
      "กราฟลอการิทึมเป็นฟังก์ชันของ x",
      "มีข้อจำกัดว่า x − h ต้องมากกว่า 0",
      "กราฟมีเส้นกำกับแนวตั้ง"
    ],
    studioType: "logarithmic",
    studioParams: {
      h,
      k,
      a
    }
  };
}

function analyzeEllipse(eq) {
  let match = eq.match(/^x\^2\/([+-]?\d*\.?\d+)\+y\^2\/([+-]?\d*\.?\d+)=1$/);

  if (match) {
    return buildEllipseResult(0, 0, Number(match[1]), Number(match[2]));
  }

  match = eq.match(/^\(x([+-]\d*\.?\d+)?\)\^2\/([+-]?\d*\.?\d+)\+\(y([+-]\d*\.?\d+)?\)\^2\/([+-]?\d*\.?\d+)=1$/);

  if (match) {
    const h = match[1] ? -Number(match[1]) : 0;
    const rxSquared = Number(match[2]);
    const k = match[3] ? -Number(match[3]) : 0;
    const rySquared = Number(match[4]);

    return buildEllipseResult(h, k, rxSquared, rySquared);
  }

  return null;
}

function buildEllipseResult(h, k, rxSquared, rySquared) {
  if (rxSquared <= 0 || rySquared <= 0) {
    return {
      status: "error",
      message: "ตัวส่วนของสมการวงรีต้องเป็นจำนวนบวก"
    };
  }

  const rx = Math.sqrt(rxSquared);
  const ry = Math.sqrt(rySquared);

  return {
    status: "success",
    graphType: "Ellipse Graph",
    equation: `(x - ${fmt(h)})²/${fmt(rxSquared)} + (y - ${fmt(k)})²/${fmt(rySquared)} = 1`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange: `Domain: ${fmt(h - rx)} ≤ x ≤ ${fmt(h + rx)}, Range: ${fmt(k - ry)} ≤ y ≤ ${fmt(k + ry)}`,
    values: [
      `จุดศูนย์กลาง = (${fmt(h)}, ${fmt(k)})`,
      `รัศมีแนวนอน = ${fmt(rx)}`,
      `รัศมีแนวตั้ง = ${fmt(ry)}`
    ],
    details: [
      "กราฟเป็นวงรี",
      "วงรีเป็นรูปปิดและมีจุดศูนย์กลาง",
      "วงรีเต็มรูปไม่ผ่าน Vertical Line Test จึงไม่เป็นฟังก์ชัน"
    ],
    studioType: "ellipse",
    studioParams: {
      h,
      k,
      rx,
      ry
    }
  };
}

function analyzeHyperbola(eq) {
  let match = eq.match(/^x\^2\/([+-]?\d*\.?\d+)-y\^2\/([+-]?\d*\.?\d+)=1$/);

  if (match) {
    return buildHyperbolaResult(0, 0, Number(match[1]), Number(match[2]), "horizontal");
  }

  match = eq.match(/^y\^2\/([+-]?\d*\.?\d+)-x\^2\/([+-]?\d*\.?\d+)=1$/);

  if (match) {
    return buildHyperbolaResult(0, 0, Number(match[1]), Number(match[2]), "vertical");
  }

  return null;
}

function buildHyperbolaResult(h, k, aSquared, bSquared, orientation) {
  if (aSquared <= 0 || bSquared <= 0) {
    return {
      status: "error",
      message: "ตัวส่วนของสมการไฮเพอร์โบลาต้องเป็นจำนวนบวก"
    };
  }

  const a = Math.sqrt(aSquared);
  const b = Math.sqrt(bSquared);

  return {
    status: "success",
    graphType: "Hyperbola Graph",
    equation:
      orientation === "horizontal"
        ? `(x - ${fmt(h)})²/${fmt(aSquared)} − (y - ${fmt(k)})²/${fmt(bSquared)} = 1`
        : `(y - ${fmt(k)})²/${fmt(aSquared)} − (x - ${fmt(h)})²/${fmt(bSquared)} = 1`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange:
      orientation === "horizontal"
        ? `Domain: x ≤ ${fmt(h - a)} หรือ x ≥ ${fmt(h + a)}`
        : "Domain: จำนวนจริง",
    values: [
      `จุดศูนย์กลาง = (${fmt(h)}, ${fmt(k)})`,
      `ค่า a = ${fmt(a)}`,
      `ค่า b = ${fmt(b)}`,
      `ทิศทางการเปิด = ${orientation === "horizontal" ? "ซ้าย-ขวา" : "ขึ้น-ลง"}`
    ],
    details: [
      "กราฟเป็นไฮเพอร์โบลา",
      "มี 2 แขนและมีเส้นกำกับ",
      "ไฮเพอร์โบลาเต็มรูปโดยทั่วไปไม่เป็นฟังก์ชันของ x"
    ],
    studioType: "hyperbola",
    studioParams: {
      h,
      k,
      a,
      b,
      orientation
    }
  };
}