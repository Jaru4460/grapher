import React, { useRef, useState } from "react";

const KEYBOARD_ROWS = [
  ["x", "y", "²", "³", "√(", "| |"],
  ["(", ")", "+", "-", "×", "/"],
  ["sin(", "cos(", "ln(", "log(", "π", "="],
];

const EMPTY_CHECKLIST = {
  shape: "",
  direction: "",
  closedShape: "",
  domainLimit: "",
  rangeLimit: "",
  asymptote: "",
  periodic: "",
  symmetry: "",
};

export default function GraphAnalyzer({ goHome, goMenu, sendToStudio }) {
  const [inputMode, setInputMode] = useState("equation");
  const [equation, setEquation] = useState("y = x^2 - 4x + 3");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [checklist, setChecklist] = useState(EMPTY_CHECKLIST);

  const inputRef = useRef(null);

  function insertToken(token) {
    const input = inputRef.current;

    const cleanToken =
      token === "| |"
        ? "||"
        : token === "×"
          ? "*"
          : token === "π"
            ? "pi"
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

  function updateChecklist(key, value) {
    setChecklist((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function runAnalyzer(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      setStatus("กำลังวิเคราะห์...");

      const analyzed =
        inputMode === "equation"
          ? analyzeEquation(equation)
          : analyzeChecklist(checklist);

      setResult(analyzed);
      setStatus("วิเคราะห์สำเร็จ");

      setTimeout(() => {
        const resultCard = document.querySelector(".analyzer-result-card");
        if (resultCard) {
          resultCard.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 120);
    } catch (error) {
      console.error("Graph Analyzer Error:", error);
      setResult({
        status: "error",
        message:
          "เกิดข้อผิดพลาดระหว่างวิเคราะห์ กรุณาตรวจสอบรูปแบบสมการ หรือเปิด Console ดู error เพิ่มเติม",
      });
      setStatus("เกิดข้อผิดพลาด");
    }
  }

  return (
    <>
      <header className="analyzer-header">
        <button type="button" className="logo" onClick={goHome}>
          Graph<span>er</span>
        </button>

        <div className="header-title">Graph Analyzer</div>
      </header>

      <section className="analyzer-page">
        <div className="analyzer-top">
          <div>
            <button type="button" className="back-button" onClick={goMenu}>
              ← กลับไปเลือกกราฟ
            </button>

            <h1>วิเคราะห์กราฟจากสมการหรือลักษณะกราฟ</h1>
            <p>
              เลือกว่าจะวิเคราะห์จากสมการโดยตรง หรือใช้ Visual Checklist
              เพื่อช่วยเดาชนิดกราฟจากลักษณะสำคัญ
            </p>
          </div>

          <div className="mode-switch">
            <button
              type="button"
              className={inputMode === "equation" ? "mode-button active" : "mode-button"}
              onClick={() => {
                setInputMode("equation");
                setResult(null);
                setStatus("");
              }}
            >
              Equation Input
            </button>

            <button
              type="button"
              className={inputMode === "checklist" ? "mode-button active" : "mode-button"}
              onClick={() => {
                setInputMode("checklist");
                setResult(null);
                setStatus("");
              }}
            >
              Visual Checklist
            </button>
          </div>
        </div>

        <div className="analyzer-layout">
          <div className="analyzer-input-card">
            {inputMode === "equation" && (
              <>
                <h2>กรอกสมการ</h2>
                <p className="muted">
                  ตัวอย่าง: y = 2x + 3, y = x^2 - 4x + 3, (x - 1)^2 + (y + 2)^2 = 16
                </p>

                <textarea
                  ref={inputRef}
                  className="equation-box"
                  value={equation}
                  onChange={(event) => {
                    setEquation(event.target.value);
                    setStatus("");
                  }}
                  placeholder="พิมพ์สมการที่นี่..."
                />

                <div className="math-keyboard">
                  {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div className="keyboard-row" key={rowIndex}>
                      {row.map((key) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => insertToken(key)}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="analyze-button"
                  onClick={runAnalyzer}
                >
                  Analyze Graph
                </button>

                {status && <div className="analyzer-status">{status}</div>}
              </>
            )}

            {inputMode === "checklist" && (
              <>
                <h2>ตอบคำถามลักษณะกราฟ</h2>
                <p className="muted">
                  ใช้ในกรณีที่เห็นรูปกราฟ แต่ยังไม่รู้สมการ ระบบจะช่วยคาดเดาชนิดกราฟจากลักษณะสำคัญ
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
                      ["slowCurve", "โค้งเพิ่ม/ลดช้า มีเส้นกำกับแนวตั้ง"],
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
                      ["none", "ไม่แน่ใจ"],
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
                      ["unknown", "ไม่แน่ใจ"],
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
                      ["unknown", "ไม่แน่ใจ"],
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
                      ["unknown", "ไม่แน่ใจ"],
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
                      ["both", "มีทั้งแนวตั้งและแนวนอน"],
                      ["none", "ไม่มี"],
                      ["unknown", "ไม่แน่ใจ"],
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
                      ["unknown", "ไม่แน่ใจ"],
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
                      ["unknown", "ไม่แน่ใจ"],
                    ]}
                  />
                </div>

                <button
                  type="button"
                  className="analyze-button"
                  onClick={runAnalyzer}
                >
                  Analyze from Checklist
                </button>

                {status && <div className="analyzer-status">{status}</div>}
              </>
            )}
          </div>

          <div className="analyzer-result-card">
            <h2>ผลการวิเคราะห์</h2>

            {!result && (
              <div className="empty-result">
                กรอกสมการหรือเลือกคำตอบใน Visual Checklist แล้วกด Analyze เพื่อดูผลการวิเคราะห์
              </div>
            )}

            {result?.status === "error" && (
              <div className="error-result">
                <h3>ไม่สามารถวิเคราะห์ได้</h3>
                <p>{result.message}</p>
              </div>
            )}

            {result?.status === "success" && (
              <>
                <div className="result-summary-grid">
                  <ResultItem title="ชนิดกราฟ" value={result.graphType} />
                  <ResultItem title="สมการโดยทั่วไป" value={prettyEquation(result.equation)} />
                  <ResultItem title="เป็นฟังก์ชันหรือไม่" value={result.isFunction} />
                  <ResultItem title="โดเมน / เรนจ์" value={result.domainRange} />
                </div>

                <div className="result-detail">
                  <h3>ค่าที่วิเคราะห์ได้</h3>
                  <ul>
                    {result.values.map((item, index) => (
                      <li key={index}>• {prettyEquation(item)}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-detail">
                  <h3>คำอธิบาย</h3>
                  <ul>
                    {result.details.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className="send-studio-button"
                  disabled={!result.studioType}
                  onClick={() => sendToStudio(result.studioType, result.studioParams)}
                >
                  {result.studioType
                    ? "Send to Graph Studio"
                    : "กราฟชนิดนี้ยังไม่เชื่อมกับ Graph Studio"}
                </button>
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
      <select value={value} onChange={(event) => onChange(event.target.value)}>
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
      message: "กรุณากรอกสมการก่อนวิเคราะห์",
    };
  }

  const eq = normalizeEquation(original);

  const analyzers = [
    analyzeHorizontalLine,
    analyzeVerticalLine,
    analyzeLinear,
    analyzeQuadraticVertex,
    analyzeQuadraticStandard,
    analyzeCircle,
    analyzeEllipse,
    analyzeHyperbola,
    analyzeAbsolute,
    analyzeExponential,
    analyzeLogarithmic,
    analyzeTrig,
  ];

  for (const analyzer of analyzers) {
    const result = analyzer(eq);
    if (result) return result;
  }

  return {
    status: "error",
    message:
      "ระบบยังไม่รองรับรูปแบบสมการนี้ หรือรูปแบบสมการยังไม่ตรงตามที่ระบบอ่านได้ ลองใช้ Visual Checklist ช่วยวิเคราะห์แทน",
  };
}

function analyzeChecklist(data) {
  if (!data.shape) {
    return {
      status: "error",
      message: "กรุณาเลือกลักษณะโดยรวมของกราฟก่อนวิเคราะห์",
    };
  }

  const map = {
    straight: {
      graphType: "Linear Graph",
      equation: "y = mx + c",
      isFunction: "เป็นฟังก์ชัน ยกเว้นเส้นตรงแนวตั้ง",
      domainRange: "Domain: จำนวนจริง, Range: จำนวนจริง",
      studioType: "linear",
      studioParams: { x1: -2, y1: -1, x2: 2, y2: 3 },
    },
    parabola: {
      graphType: "Quadratic Graph",
      equation: "y = a(x − h)² + k",
      isFunction: data.direction === "leftRight" ? "ไม่เป็นฟังก์ชัน" : "เป็นฟังก์ชัน",
      domainRange: "Domain: จำนวนจริง, Range มีขอบเขตบนหรือล่าง",
      studioType: "quadratic",
      studioParams: {
        h: 0,
        k: -2,
        a: 0.5,
        opening: data.direction === "down" ? "down" : "up",
      },
    },
    vshape: {
      graphType: "Absolute Value Graph",
      equation: "y = a|x − h| + k",
      isFunction: "เป็นฟังก์ชัน หากเปิดขึ้นหรือลง",
      domainRange: "Domain: จำนวนจริง, Range มีขอบเขตบนหรือล่าง",
      studioType: "absolute",
      studioParams: {
        h: 0,
        k: -1,
        a: 1,
        opening: data.direction === "down" ? "down" : "up",
      },
    },
    circle: {
      graphType: "Circle Graph",
      equation: "(x − h)² + (y − k)² = r²",
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange: "Domain และ Range เป็นช่วงจำกัด",
      studioType: "circle",
      studioParams: { h: 0, k: 0, r: 4 },
    },
    ellipse: {
      graphType: "Ellipse Graph",
      equation: "(x − h)²/a² + (y − k)²/b² = 1",
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange: "Domain และ Range เป็นช่วงจำกัด",
      studioType: "ellipse",
      studioParams: { h: 0, k: 0, rx: 5, ry: 3 },
    },
    twoBranches: {
      graphType: "Hyperbola Graph",
      equation: "(x − h)²/a² − (y − k)²/b² = 1",
      isFunction: "โดยทั่วไปไฮเพอร์โบลาเต็มรูปไม่เป็นฟังก์ชันของ x",
      domainRange: "Domain อาจเป็นสองช่วงแยกกัน",
      studioType: "hyperbola",
      studioParams: {
        h: 0,
        k: 0,
        a: 3,
        b: 2,
        orientation: data.direction === "upDown" ? "vertical" : "horizontal",
      },
    },
    wave: {
      graphType: "Sine / Cosine Graph",
      equation: "y = a sin(bx) + k หรือ y = a cos(bx) + k",
      isFunction: "เป็นฟังก์ชัน",
      domainRange: "Domain: จำนวนจริง, Range เป็นช่วงจำกัด",
      studioType: null,
      studioParams: null,
    },
    rapidCurve: {
      graphType: "Exponential Graph",
      equation: "y = a · bˣ + k",
      isFunction: "เป็นฟังก์ชัน",
      domainRange: "Domain: จำนวนจริง, Range ขึ้นอยู่กับค่า k",
      studioType: "exponential",
      studioParams: { h: 0, k: 0, a: 1, base: 2 },
    },
    slowCurve: {
      graphType: "Logarithmic Graph",
      equation: "y = a ln(x − h) + k",
      isFunction: "เป็นฟังก์ชัน",
      domainRange: "Domain: x > h, Range: จำนวนจริง",
      studioType: "logarithmic",
      studioParams: { h: -3, k: 0, a: 1 },
    },
  };

  const selected = map[data.shape];

  if (!selected) {
    return {
      status: "error",
      message: "ข้อมูลจาก checklist ยังไม่เพียงพอที่จะระบุชนิดกราฟได้",
    };
  }

  return {
    status: "success",
    ...selected,
    values: [
      `ลักษณะหลัก: ${data.shape}`,
      data.direction ? `ทิศทาง/แนวโน้ม: ${data.direction}` : "ยังไม่ได้ระบุทิศทาง",
      data.domainLimit ? `ลักษณะ Domain: ${data.domainLimit}` : "ยังไม่ได้ระบุ Domain",
      data.rangeLimit ? `ลักษณะ Range: ${data.rangeLimit}` : "ยังไม่ได้ระบุ Range",
      data.asymptote ? `เส้นกำกับ: ${data.asymptote}` : "ยังไม่ได้ระบุเส้นกำกับ",
    ],
    details: [
      `ระบบคาดว่าเป็น ${selected.graphType}`,
      "ผลนี้เป็นการคาดเดาจากลักษณะกราฟ ไม่ใช่การหาสมการที่แน่นอน",
      "ถ้าต้องการสมการที่แม่นยำ ควรระบุจุดสำคัญ เช่น จุดยอด จุดตัดแกน จุดศูนย์กลาง หรือเส้นกำกับ",
    ],
  };
}

function analyzeHorizontalLine(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d+)$/);
  if (!match) return null;

  const c = Number(match[1]);

  return successResult({
    graphType: "Horizontal Line",
    equation: `y = ${fmt(c)}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: y = ${fmt(c)}`,
    values: [`เส้นตรงแนวนอน`, `ความชัน m = 0`, `จุดตัดแกน y = (0, ${fmt(c)})`],
    details: ["ค่า x ทุกค่าจะให้ค่า y เท่าเดิม", "ผ่าน Vertical Line Test"],
    studioType: "linear",
    studioParams: { x1: -3, y1: c, x2: 3, y2: c },
  });
}

function analyzeVerticalLine(eq) {
  const match = eq.match(/^x=([+-]?\d*\.?\d+)$/);
  if (!match) return null;

  const c = Number(match[1]);

  return successResult({
    graphType: "Vertical Line",
    equation: `x = ${fmt(c)}`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange: `Domain: x = ${fmt(c)}, Range: จำนวนจริง`,
    values: [`เส้นตรงแนวตั้ง`, `ผ่านค่า x = ${fmt(c)}`, "ไม่ผ่าน Vertical Line Test"],
    details: ["ค่า x หนึ่งค่าให้ค่า y ได้หลายค่า", "จึงไม่เป็นฟังก์ชันของ x"],
    studioType: "linear",
    studioParams: { x1: c, y1: -3, x2: c, y2: 3 },
  });
}

function analyzeLinear(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\*?x([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const m = parseCoefficient(match[1]);
  const c = match[2] ? Number(match[2]) : 0;

  return successResult({
    graphType: "Linear Graph",
    equation: `y = ${fmt(m)}x ${c >= 0 ? "+" : "-"} ${fmt(Math.abs(c))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: "Domain: จำนวนจริง, Range: จำนวนจริง",
    values: [`ความชัน m = ${fmt(m)}`, `จุดตัดแกน y = (0, ${fmt(c)})`],
    details: ["กราฟเป็นเส้นตรง", "ค่า x หนึ่งค่าจะให้ค่า y เพียงค่าเดียว"],
    studioType: "linear",
    studioParams: { x1: 0, y1: c, x2: 1, y2: m + c },
  });
}

function analyzeQuadraticStandard(eq) {
  if (!eq.startsWith("y=") || !eq.includes("x^2")) return null;

  const expr = eq.slice(2);

  if (expr.includes("(")) return null;

  const { a, b, c } = parseQuadraticExpression(expr);

  if (!Number.isFinite(a) || a === 0) return null;

  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const discriminant = b * b - 4 * a * c;

  return successResult({
    graphType: "Quadratic Graph",
    equation: `y = ${fmt(a)}x² ${b >= 0 ? "+" : "-"} ${fmt(Math.abs(b))}x ${c >= 0 ? "+" : "-"} ${fmt(Math.abs(c))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: a > 0 ? `Domain: จำนวนจริง, Range: y ≥ ${fmt(k)}` : `Domain: จำนวนจริง, Range: y ≤ ${fmt(k)}`,
    values: [
      `จุดยอด = (${fmt(h)}, ${fmt(k)})`,
      `แกนสมมาตร = x = ${fmt(h)}`,
      `Discriminant = ${fmt(discriminant)}`,
    ],
    details: [
      a > 0 ? "กราฟพาราโบลาเปิดขึ้น" : "กราฟพาราโบลาเปิดลง",
      "เป็นกราฟฟังก์ชันกำลังสอง",
    ],
    studioType: "quadratic",
    studioParams: { h, k, a: Math.abs(a), opening: a > 0 ? "up" : "down" },
  });
}

function analyzeQuadraticVertex(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\*?\(x([+-]\d*\.?\d+)\)\^2([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const h = -Number(match[2]);
  const k = match[3] ? Number(match[3]) : 0;

  return successResult({
    graphType: "Quadratic Graph",
    equation: `y = ${fmt(a)}(x - ${fmt(h)})² ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: a > 0 ? `Domain: จำนวนจริง, Range: y ≥ ${fmt(k)}` : `Domain: จำนวนจริง, Range: y ≤ ${fmt(k)}`,
    values: [`จุดยอด = (${fmt(h)}, ${fmt(k)})`, `แกนสมมาตร = x = ${fmt(h)}`],
    details: ["สมการอยู่ในรูปจุดยอดของพาราโบลา"],
    studioType: "quadratic",
    studioParams: { h, k, a: Math.abs(a), opening: a > 0 ? "up" : "down" },
  });
}

function analyzeCircle(eq) {
  let match = eq.match(/^x\^2\+y\^2=([+-]?\d*\.?\d+)$/);

  if (match) {
    return buildCircleResult(0, 0, Number(match[1]));
  }

  match = eq.match(/^\(x([+-]\d*\.?\d+)?\)\^2\+\(y([+-]\d*\.?\d+)?\)\^2=([+-]?\d*\.?\d+)$/);

  if (!match) return null;

  const h = match[1] ? -Number(match[1]) : 0;
  const k = match[2] ? -Number(match[2]) : 0;
  const rSquared = Number(match[3]);

  return buildCircleResult(h, k, rSquared);
}

function buildCircleResult(h, k, rSquared) {
  if (rSquared <= 0) {
    return {
      status: "error",
      message: "ค่า r² ต้องมากกว่า 0",
    };
  }

  const r = Math.sqrt(rSquared);

  return successResult({
    graphType: "Circle Graph",
    equation: `(x - ${fmt(h)})² + (y - ${fmt(k)})² = ${fmt(rSquared)}`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange: `Domain: ${fmt(h - r)} ≤ x ≤ ${fmt(h + r)}, Range: ${fmt(k - r)} ≤ y ≤ ${fmt(k + r)}`,
    values: [`จุดศูนย์กลาง = (${fmt(h)}, ${fmt(k)})`, `รัศมี = ${fmt(r)}`],
    details: ["กราฟเป็นวงกลม", "วงกลมเต็มรูปไม่ผ่าน Vertical Line Test"],
    studioType: "circle",
    studioParams: { h, k, r },
  });
}

function analyzeEllipse(eq) {
  let match = eq.match(/^x\^2\/([+-]?\d*\.?\d+)\+y\^2\/([+-]?\d*\.?\d+)=1$/);

  if (match) {
    return buildEllipseResult(0, 0, Number(match[1]), Number(match[2]));
  }

  match = eq.match(/^\(x([+-]\d*\.?\d+)?\)\^2\/([+-]?\d*\.?\d+)\+\(y([+-]\d*\.?\d+)?\)\^2\/([+-]?\d*\.?\d+)=1$/);

  if (!match) return null;

  const h = match[1] ? -Number(match[1]) : 0;
  const rxSquared = Number(match[2]);
  const k = match[3] ? -Number(match[3]) : 0;
  const rySquared = Number(match[4]);

  return buildEllipseResult(h, k, rxSquared, rySquared);
}

function buildEllipseResult(h, k, rxSquared, rySquared) {
  if (rxSquared <= 0 || rySquared <= 0) return null;

  const rx = Math.sqrt(rxSquared);
  const ry = Math.sqrt(rySquared);

  return successResult({
    graphType: "Ellipse Graph",
    equation: `(x - ${fmt(h)})²/${fmt(rxSquared)} + (y - ${fmt(k)})²/${fmt(rySquared)} = 1`,
    isFunction: "ไม่เป็นฟังก์ชัน",
    domainRange: `Domain: ${fmt(h - rx)} ≤ x ≤ ${fmt(h + rx)}, Range: ${fmt(k - ry)} ≤ y ≤ ${fmt(k + ry)}`,
    values: [`จุดศูนย์กลาง = (${fmt(h)}, ${fmt(k)})`, `รัศมีแนวนอน = ${fmt(rx)}`, `รัศมีแนวตั้ง = ${fmt(ry)}`],
    details: ["กราฟเป็นวงรี", "เป็นรูปปิดและไม่เป็นฟังก์ชันเต็มรูป"],
    studioType: "ellipse",
    studioParams: { h, k, rx, ry },
  });
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
  if (aSquared <= 0 || bSquared <= 0) return null;

  const a = Math.sqrt(aSquared);
  const b = Math.sqrt(bSquared);

  return successResult({
    graphType: "Hyperbola Graph",
    equation:
      orientation === "horizontal"
        ? `(x - ${fmt(h)})²/${fmt(aSquared)} − (y - ${fmt(k)})²/${fmt(bSquared)} = 1`
        : `(y - ${fmt(k)})²/${fmt(aSquared)} − (x - ${fmt(h)})²/${fmt(bSquared)} = 1`,
    isFunction: "โดยทั่วไปไม่เป็นฟังก์ชัน",
    domainRange: orientation === "horizontal" ? `x ≤ ${fmt(h - a)} หรือ x ≥ ${fmt(h + a)}` : "Domain: จำนวนจริง",
    values: [`จุดศูนย์กลาง = (${fmt(h)}, ${fmt(k)})`, `a = ${fmt(a)}`, `b = ${fmt(b)}`],
    details: ["กราฟมี 2 แขน", "มีเส้นกำกับ"],
    studioType: "hyperbola",
    studioParams: { h, k, a, b, orientation },
  });
}

function analyzeAbsolute(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\*?\|x([+-]\d*\.?\d+)?\|([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const h = match[2] ? -Number(match[2]) : 0;
  const k = match[3] ? Number(match[3]) : 0;

  return successResult({
    graphType: "Absolute Value Graph",
    equation: `y = ${fmt(a)}|x - ${fmt(h)}| ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: a > 0 ? `Domain: จำนวนจริง, Range: y ≥ ${fmt(k)}` : `Domain: จำนวนจริง, Range: y ≤ ${fmt(k)}`,
    values: [`จุดยอด = (${fmt(h)}, ${fmt(k)})`, `เปิด${a > 0 ? "ขึ้น" : "ลง"}`],
    details: ["กราฟเป็นรูปตัว V"],
    studioType: "absolute",
    studioParams: { h, k, a: Math.abs(a), opening: a > 0 ? "up" : "down" },
  });
}

function analyzeExponential(eq) {
  if (!eq.startsWith("y=") || !eq.includes("^x")) return null;

  const expr = eq.slice(2);
  const match = expr.match(/^(.+)\^x([+-]\d*\.?\d+)?$/);

  if (!match) return null;

  let left = match[1];
  const k = match[2] ? Number(match[2]) : 0;

  let a = 1;
  let baseText = left;

  if (left.includes("*")) {
    const parts = left.split("*");
    a = parseCoefficient(parts[0]);
    baseText = parts[1];
  } else if (left.startsWith("-") && left.length > 1) {
    a = -1;
    baseText = left.slice(1);
  }

  const base = baseText === "e" ? Math.E : Number(baseText);

  if (!Number.isFinite(base) || base <= 0 || base === 1) return null;

  return successResult({
    graphType: "Exponential Graph",
    equation: `y = ${fmt(a)}(${baseText})^x ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: a > 0 ? `Domain: จำนวนจริง, Range: y > ${fmt(k)}` : `Domain: จำนวนจริง, Range: y < ${fmt(k)}`,
    values: [`ฐาน b = ${baseText}`, `เส้นกำกับแนวนอน y = ${fmt(k)}`],
    details: [base > 1 ? "กราฟมีแนวโน้มเพิ่มขึ้น" : "กราฟมีแนวโน้มลดลง"],
    studioType: "exponential",
    studioParams: { h: 0, k, a, base },
  });
}

function analyzeLogarithmic(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\*?(ln|log)\(x([+-]\d*\.?\d+)?\)([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const h = match[3] ? -Number(match[3]) : 0;
  const k = match[4] ? Number(match[4]) : 0;

  return successResult({
    graphType: "Logarithmic Graph",
    equation: `y = ${fmt(a)}${match[2]}(x - ${fmt(h)}) ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: x > ${fmt(h)}, Range: จำนวนจริง`,
    values: [`เส้นกำกับแนวตั้ง x = ${fmt(h)}`, `เลื่อนแนวตั้ง k = ${fmt(k)}`],
    details: ["ค่าภายใน log ต้องมากกว่า 0"],
    studioType: "logarithmic",
    studioParams: { h, k, a },
  });
}

function analyzeTrig(eq) {
  const match = eq.match(/^y=([+-]?\d*\.?\d*)\*?(sin|cos)\(([+-]?\d*\.?\d*)\*?x\)([+-]\d*\.?\d+)?$/);
  if (!match) return null;

  const a = parseCoefficient(match[1]);
  const trigType = match[2];
  const b = parseCoefficient(match[3]);
  const k = match[4] ? Number(match[4]) : 0;

  const amplitude = Math.abs(a);
  const period = b !== 0 ? (2 * Math.PI) / Math.abs(b) : 0;

  return successResult({
    graphType: trigType === "sin" ? "Sine Graph" : "Cosine Graph",
    equation: `y = ${fmt(a)}${trigType}(${fmt(b)}x) ${k >= 0 ? "+" : "-"} ${fmt(Math.abs(k))}`,
    isFunction: "เป็นฟังก์ชัน",
    domainRange: `Domain: จำนวนจริง, Range: ${fmt(k - amplitude)} ≤ y ≤ ${fmt(k + amplitude)}`,
    values: [`Amplitude = ${fmt(amplitude)}`, `Period = ${fmt(period)}`, `เส้นกึ่งกลาง y = ${fmt(k)}`],
    details: ["กราฟเป็นคาบ", "ยังไม่เชื่อมส่งไป Graph Studio"],
    studioType: null,
    studioParams: null,
  });
}

function parseQuadraticExpression(expr) {
  const normalized = expr.replaceAll("-", "+-");
  const terms = normalized.split("+").filter(Boolean);

  let a = 0;
  let b = 0;
  let c = 0;

  for (const term of terms) {
    if (term.includes("x^2")) {
      const coeff = term.replace("x^2", "").replace("*", "");
      a += parseCoefficient(coeff);
    } else if (term.includes("x")) {
      const coeff = term.replace("x", "").replace("*", "");
      b += parseCoefficient(coeff);
    } else {
      c += Number(term);
    }
  }

  return { a, b, c };
}

function successResult(data) {
  return {
    status: "success",
    ...data,
  };
}

function normalizeEquation(text) {
  return String(text)
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("²", "^2")
    .replaceAll("³", "^3")
    .replaceAll("⁴", "^4")
    .replaceAll("−", "-")
    .replaceAll("–", "-")
    .replaceAll("×", "*")
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt")
    .replaceAll("**", "^");
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
    .replaceAll("^4", "⁴")
    .replaceAll("sqrt", "√")
    .replaceAll("pi", "π")
    .replaceAll("*", "×");
}