import React, { useEffect, useMemo, useRef, useState } from "react";
import GraphAnalyzer from "./components/GraphAnalyzer.jsx";
import PracticeZone from "./components/PracticeZone.jsx";

const GRAPH_TYPES = [
  { id: "linear", thai: "กราฟเส้นตรง", eng: "Linear Graph" },
  { id: "quadratic", thai: "กราฟพาราโบลา", eng: "Quadratic Graph" },
  { id: "hyperbola", thai: "กราฟไฮเพอร์โบลา", eng: "Hyperbola Graph" },
  { id: "absolute", thai: "กราฟค่าสัมบูรณ์", eng: "Absolute Value Graph" },
  { id: "logarithmic", thai: "กราฟลอการิทึม", eng: "Logarithmic Graph" },
  { id: "exponential", thai: "กราฟเอ็กซ์โพเนนเชียล", eng: "Exponential Graph" },
  { id: "circle", thai: "กราฟวงกลม", eng: "Circle Graph" },
  { id: "ellipse", thai: "กราฟวงรี", eng: "Ellipse Graph" },
];

const DEFAULT_PARAMS = {
  linear: { x1: -4, y1: -2, x2: 4, y2: 3 },
  quadratic: { h: 0, k: -2, a: 0.5, opening: "up" },
  hyperbola: { h: 0, k: 0, a: 3, b: 2, orientation: "horizontal" },
  absolute: { h: 0, k: -1, a: 1, opening: "up" },
  logarithmic: { h: -3, k: 0, a: 1 },
  exponential: { h: 0, k: 0, a: 1, base: 2 },
  circle: { h: 0, k: 0, r: 4 },
  ellipse: { h: 0, k: 0, rx: 5, ry: 3 },
};

const CANVAS = {
  width: 1000,
  height: 620,
};

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedType, setSelectedType] = useState("linear");
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [areaA, setAreaA] = useState(-2);
  const [areaB, setAreaB] = useState(2);
  const [resetViewSignal, setResetViewSignal] = useState(0);

  const currentParams = params[selectedType];

  function goToStudio(type) {
    setSelectedType(type);
    setPage("studio");
    setResetViewSignal((v) => v + 1);
  }

  function sendAnalyzerResultToStudio(type, studioParams) {
   if (!type) return;

   setSelectedType(type);

   if (studioParams) {
     setParams((prev) => ({
       ...prev,
       [type]: {
         ...prev[type],
         ...studioParams,
      },
    }));
  }

  setPage("studio");
  setResetViewSignal((v) => v + 1);
}

  function updateParam(key, value) {
    setParams((prev) => ({
      ...prev,
      [selectedType]: {
        ...prev[selectedType],
        [key]: typeof value === "string" && Number.isNaN(Number(value)) ? value : Number(value),
      },
    }));
  }

  function updateTextParam(key, value) {
    setParams((prev) => ({
      ...prev,
      [selectedType]: {
        ...prev[selectedType],
        [key]: value,
      },
    }));
  }

  function resetGraph() {
    setParams((prev) => ({
      ...prev,
      [selectedType]: { ...DEFAULT_PARAMS[selectedType] },
    }));
    setResetViewSignal((v) => v + 1);
  }

  const graphInfo = useMemo(() => {
    return getGraphInfo(selectedType, currentParams);
  }, [selectedType, currentParams]);

  const areaResult = useMemo(() => {
    return calculateArea(selectedType, currentParams, areaA, areaB);
  }, [selectedType, currentParams, areaA, areaB]);

  return (
    <main className="app">
      <Background />

      {page === "home" && (
        <HomePage
          goMenu={() => setPage("menu")}
          goStudio={() => goToStudio("linear")}
          goAnalyzer={() => setPage("analyzer")}
          goPractice={() => setPage("practice")}
        />
      )}

      {page === "menu" && (
        <GraphMenu
          goHome={() => setPage("home")}
          goToStudio={goToStudio}
        />
      )}

      {page === "analyzer" && (
        <GraphAnalyzer
         goHome={() => setPage("home")}
         goMenu={() => setPage("menu")}
         sendToStudio={sendAnalyzerResultToStudio}
       />
      )}

      {page === "practice" && (
        <PracticeZone goHome={() => setPage("home")} />
      )}

      {page === "studio" && (
        <GraphStudio
          selectedType={selectedType}
          setSelectedType={(type) => {
            setSelectedType(type);
            setResetViewSignal((v) => v + 1);
          }}
          params={currentParams}
          updateParam={updateParam}
          updateTextParam={updateTextParam}
          graphInfo={graphInfo}
          areaA={areaA}
          areaB={areaB}
          setAreaA={setAreaA}
          setAreaB={setAreaB}
          areaResult={areaResult}
          resetGraph={resetGraph}
          resetView={() => setResetViewSignal((v) => v + 1)}
          resetViewSignal={resetViewSignal}
          goHome={() => setPage("home")}
          goMenu={() => setPage("menu")}
        />
      )}
    </main>
  );
}

function Background() {
  return (
    <>
      <div className="bg-gradient" />
      <div className="bg-grid" />
      <div className="bg-glow-one" />
      <div className="bg-glow-two" />
    </>
  );
}

function Header({ title, goHome }) {
  return (
    <header className="header">
      <button className="logo" onClick={goHome}>
        Graph<span>er</span>
      </button>
      <div className="header-title">{title}</div>
    </header>
  );
}

function HomePage({ goMenu, goStudio, goAnalyzer, goPractice }) {
  return (
    <>
      <Header title="" goHome={() => {}} />

      <section className="home">
        <p className="welcome">ยินดีต้อนรับสู่</p>

        <h1 className="hero-title">
          Graph<span>er</span>
        </h1>

        <p className="hero-subtitle">
          แพลตฟอร์มวาดและวิเคราะห์กราฟคณิตศาสตร์แบบโต้ตอบ
          <br />
          สำหรับนักเรียนมัธยมปลาย
        </p>

        <div className="home-cards">
          <HomeCard
            title="GRAPH STUDIO"
            subtitle="เริ่มต้นวาดกราฟได้ที่นี่"
            icon={<GraphIcon />}
            onClick={goMenu}
          />
          <HomeCard
            title="GRAPH ANALYZER"
            subtitle="อธิบายกราฟที่ต้องการ"
            icon={<AnalyzeIcon />}
            onClick={goAnalyzer}
          />
          <HomeCard
             title="PRACTICE ZONE"
            subtitle="ฝึกโจทย์พร้อมดูสถิติ"
            icon={<PracticeIcon />}
            onClick={goPractice}
          />
        </div>

        <button className="start-button" onClick={goMenu}>
          START GRAPHING <span>↓</span>
        </button>
      </section>
    </>
  );
}

function HomeCard({ title, subtitle, icon, onClick }) {
  return (
    <button className="home-card" onClick={onClick}>
      <div className="home-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </button>
  );
}

function GraphMenu({ goHome, goToStudio }) {
  return (
    <>
      <Header title="Graph studio" goHome={goHome} />
      <section className="menu-page">
        <h1>เลือกกราฟที่ต้องการ</h1>

        <div className="graph-menu-grid">
          {GRAPH_TYPES.map((graph) => (
            <button
              key={graph.id}
              className="graph-menu-button"
              onClick={() => goToStudio(graph.id)}
            >
              <span>{graph.thai}</span>
              <small>({graph.eng})</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function GraphStudio({
  selectedType,
  setSelectedType,
  params,
  updateParam,
  updateTextParam,
  graphInfo,
  areaA,
  areaB,
  setAreaA,
  setAreaB,
  areaResult,
  resetGraph,
  resetView,
  resetViewSignal,
  goHome,
  goMenu,
}) {
  const currentGraph = GRAPH_TYPES.find((g) => g.id === selectedType);

  return (
    <>
      <Header title="Graph studio" goHome={goHome} />

      <section className="studio-layout">
        <aside className="sidebar">
          <button className="back-button" onClick={goMenu}>
            ← กลับไปเลือกกราฟ
          </button>

          <div className="graph-heading">
            <h1>
              {currentGraph.thai}
              <br />
              ({currentGraph.eng})
            </h1>
            <p>{graphInfo.equation}</p>
          </div>

          <div className="panel">
            <label className="input-label">เลือกชนิดกราฟ</label>
            <select
              className="select-input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {GRAPH_TYPES.map((graph) => (
                <option key={graph.id} value={graph.id}>
                  {graph.thai}
                </option>
              ))}
            </select>
          </div>

          <GraphControls
            selectedType={selectedType}
            params={params}
            updateParam={updateParam}
            updateTextParam={updateTextParam}
          />

          <div className="panel">
            <h3>Area Calculator</h3>
            <p className="muted">คำนวณพื้นที่ระหว่างกราฟกับแกน x แบบประมาณค่า</p>

            <div className="two-col">
              <NumberInput label="จาก x =" value={areaA} onChange={setAreaA} />
              <NumberInput label="ถึง x =" value={areaB} onChange={setAreaB} />
            </div>

            <div className="result-box">
              <small>ผลลัพธ์</small>
              <strong>
                {areaResult.supported
                  ? `${areaResult.value.toFixed(4)} ตารางหน่วย`
                  : "ยังไม่รองรับกราฟชนิดนี้"}
              </strong>
            </div>
          </div>

          <div className="button-grid">
            <button className="secondary-button" onClick={resetGraph}>
              Reset Graph
            </button>
            <button className="primary-button" onClick={resetView}>
              Reset View
            </button>
          </div>
        </aside>

        <section className="graph-area">
          <GraphCanvas
            selectedType={selectedType}
            params={params}
            resetViewSignal={resetViewSignal}
          />

          <div className="info-grid">
            <InfoCard title="สมการ" value={graphInfo.equation} />
            <InfoCard title="เป็นฟังก์ชันหรือไม่" value={graphInfo.isFunction} />
            <InfoCard title="โดเมน / เรนจ์" value={graphInfo.domainRange} />
          </div>

          <div className="explain-panel">
            <h3>คำอธิบายกราฟ</h3>
            <ul>
              {graphInfo.details.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </>
  );
}

function GraphControls({ selectedType, params, updateParam, updateTextParam }) {
  if (selectedType === "linear") {
    return (
      <Panel title="ค่าของกราฟเส้นตรง">
        <NumberInput label="พิกัดจุดที่ 1: x1" value={params.x1} onChange={(v) => updateParam("x1", v)} />
        <NumberInput label="พิกัดจุดที่ 1: y1" value={params.y1} onChange={(v) => updateParam("y1", v)} />
        <NumberInput label="พิกัดจุดที่ 2: x2" value={params.x2} onChange={(v) => updateParam("x2", v)} />
        <NumberInput label="พิกัดจุดที่ 2: y2" value={params.y2} onChange={(v) => updateParam("y2", v)} />
      </Panel>
    );
  }

  if (selectedType === "quadratic") {
    return (
      <Panel title="ค่าของกราฟพาราโบลา">
        <NumberInput label="พิกัดจุดยอด h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="พิกัดจุดยอด k" value={params.k} onChange={(v) => updateParam("k", v)} />
        <NumberInput label="ค่าความกว้าง a" value={params.a} onChange={(v) => updateParam("a", v)} />
        <DirectionButtons value={params.opening} onChange={(v) => updateTextParam("opening", v)} />
      </Panel>
    );
  }

  if (selectedType === "absolute") {
    return (
      <Panel title="ค่าของกราฟค่าสัมบูรณ์">
        <NumberInput label="พิกัดจุดยอด h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="พิกัดจุดยอด k" value={params.k} onChange={(v) => updateParam("k", v)} />
        <NumberInput label="ค่าความชัน a" value={params.a} onChange={(v) => updateParam("a", v)} />
        <DirectionButtons value={params.opening} onChange={(v) => updateTextParam("opening", v)} />
      </Panel>
    );
  }

  if (selectedType === "hyperbola") {
    return (
      <Panel title="ค่าของกราฟไฮเพอร์โบลา">
        <NumberInput label="พิกัดศูนย์กลาง h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="พิกัดศูนย์กลาง k" value={params.k} onChange={(v) => updateParam("k", v)} />
        <NumberInput label="ค่า a" value={params.a} onChange={(v) => updateParam("a", v)} />
        <NumberInput label="ค่า b" value={params.b} onChange={(v) => updateParam("b", v)} />

        <div className="full-col choice-grid">
          <Choice active={params.orientation === "horizontal"} onClick={() => updateTextParam("orientation", "horizontal")}>
            เปิดซ้าย-ขวา
          </Choice>
          <Choice active={params.orientation === "vertical"} onClick={() => updateTextParam("orientation", "vertical")}>
            เปิดขึ้น-ลง
          </Choice>
        </div>
      </Panel>
    );
  }

  if (selectedType === "logarithmic") {
    return (
      <Panel title="ค่าของกราฟลอการิทึม">
        <NumberInput label="เลื่อนกราฟแนวนอน h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="เลื่อนกราฟแนวตั้ง k" value={params.k} onChange={(v) => updateParam("k", v)} />
        <NumberInput label="ค่าความชัน a" value={params.a} onChange={(v) => updateParam("a", v)} />
      </Panel>
    );
  }

  if (selectedType === "exponential") {
    return (
      <Panel title="ค่าของกราฟเอ็กซ์โพเนนเชียล">
        <NumberInput label="ค่าเริ่มต้น a" value={params.a} onChange={(v) => updateParam("a", v)} />
        <NumberInput label="ฐาน b" value={params.base} onChange={(v) => updateParam("base", v)} />
        <NumberInput label="เลื่อนกราฟแนวนอน h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="เลื่อนกราฟแนวตั้ง k" value={params.k} onChange={(v) => updateParam("k", v)} />
      </Panel>
    );
  }

  if (selectedType === "circle") {
    return (
      <Panel title="ค่าของกราฟวงกลม">
        <NumberInput label="พิกัดศูนย์กลาง h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="พิกัดศูนย์กลาง k" value={params.k} onChange={(v) => updateParam("k", v)} />
        <NumberInput label="รัศมี r" value={params.r} onChange={(v) => updateParam("r", v)} />
      </Panel>
    );
  }

  if (selectedType === "ellipse") {
    return (
      <Panel title="ค่าของกราฟวงรี">
        <NumberInput label="พิกัดศูนย์กลาง h" value={params.h} onChange={(v) => updateParam("h", v)} />
        <NumberInput label="พิกัดศูนย์กลาง k" value={params.k} onChange={(v) => updateParam("k", v)} />
        <NumberInput label="รัศมีแนวนอน rx" value={params.rx} onChange={(v) => updateParam("rx", v)} />
        <NumberInput label="รัศมีแนวตั้ง ry" value={params.ry} onChange={(v) => updateParam("ry", v)} />
      </Panel>
    );
  }

  return null;
}

function Panel({ title, children }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="control-grid">{children}</div>
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step="0.1"
        onChange={(e) => onChange(e.target.value === "" ? 0 : e.target.value)}
      />
    </label>
  );
}

function DirectionButtons({ value, onChange }) {
  return (
    <div className="full-col choice-grid">
      <Choice active={value === "up"} onClick={() => onChange("up")}>เปิดขึ้น</Choice>
      <Choice active={value === "down"} onClick={() => onChange("down")}>เปิดลง</Choice>
      <Choice active={value === "left"} onClick={() => onChange("left")}>เปิดซ้าย</Choice>
      <Choice active={value === "right"} onClick={() => onChange("right")}>เปิดขวา</Choice>
    </div>
  );
}

function Choice({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={active ? "choice active" : "choice"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="info-card">
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  );
}

function GraphCanvas({ selectedType, params, resetViewSignal }) {
  const svgRef = useRef(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(42);
  const [hover, setHover] = useState(null);
  const [dragging, setDragging] = useState(false);
  const lastPointer = useRef(null);

  useEffect(() => {
    setCenter({ x: 0, y: 0 });
    setScale(42);
    setHover(null);
  }, [resetViewSignal, selectedType]);

  useEffect(() => {
  const svg = svgRef.current;
  if (!svg) return;

  function wheelListener(event) {
    event.preventDefault();
    event.stopPropagation();

    const rect = svg.getBoundingClientRect();

    const sx = ((event.clientX - rect.left) / rect.width) * CANVAS.width;
    const sy = ((event.clientY - rect.top) / rect.height) * CANVAS.height;

    const worldX = center.x + (sx - CANVAS.width / 2) / scale;
    const worldY = center.y - (sy - CANVAS.height / 2) / scale;

    const zoomFactor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newScale = clamp(scale * zoomFactor, 12, 260);

    const newCenterX = worldX - (sx - CANVAS.width / 2) / newScale;
    const newCenterY = worldY + (sy - CANVAS.height / 2) / newScale;

    setScale(newScale);
    setCenter({
      x: newCenterX,
      y: newCenterY
    });
  }

  svg.addEventListener("wheel", wheelListener, { passive: false });

  return () => {
    svg.removeEventListener("wheel", wheelListener);
  };
}, [center, scale]);

  const view = useMemo(() => {
    const halfW = CANVAS.width / (2 * scale);
    const halfH = CANVAS.height / (2 * scale);
    return {
      minX: center.x - halfW,
      maxX: center.x + halfW,
      minY: center.y - halfH,
      maxY: center.y + halfH,
    };
  }, [center, scale]);

  const graph = useMemo(() => {
    return generateGraph(selectedType, params, view);
  }, [selectedType, params, view]);

  const grid = useMemo(() => {
    return createGrid(view, scale);
  }, [view, scale]);

  function toScreenX(x) {
    return CANVAS.width / 2 + (x - center.x) * scale;
  }

  function toScreenY(y) {
    return CANVAS.height / 2 - (y - center.y) * scale;
  }

  function screenToWorld(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * CANVAS.width;
    const sy = ((clientY - rect.top) / rect.height) * CANVAS.height;

    return {
      sx,
      sy,
      x: center.x + (sx - CANVAS.width / 2) / scale,
      y: center.y - (sy - CANVAS.height / 2) / scale,
    };
  }

  function handlePointerDown(e) {
    setDragging(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    const point = screenToWorld(e.clientX, e.clientY);
    setHover(point);

    if (!dragging || !lastPointer.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - lastPointer.current.x) / rect.width) * CANVAS.width;
    const dy = ((e.clientY - lastPointer.current.y) / rect.height) * CANVAS.height;

    setCenter((prev) => ({
      x: prev.x - dx / scale,
      y: prev.y + dy / scale,
    }));

    lastPointer.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp() {
    setDragging(false);
    lastPointer.current = null;
  }

  const xAxisY = toScreenY(0);
  const yAxisX = toScreenX(0);

  return (
    <div className="canvas-card">
      <div className="canvas-toolbar">
        <span>Mouse wheel = Zoom | Drag = Pan | Hover = Coordinate</span>
        {hover && (
          <strong>
            x = {fmt(hover.x)}, y = {fmt(hover.y)}
          </strong>
        )}
      </div>

      <svg
        ref={svgRef}
        className={dragging ? "graph-svg dragging" : "graph-svg"}
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHover(null);
          setDragging(false);
        }}
      >
        <rect x="0" y="0" width={CANVAS.width} height={CANVAS.height} fill="#ffffff" />

        {grid.xTicks.map((tick) => {
          const x = toScreenX(tick);
          return (
            <g key={`x-${tick}`}>
              <line x1={x} y1="0" x2={x} y2={CANVAS.height} stroke="#e7e7ef" strokeWidth="1" />
              <text x={x + 4} y={xAxisY + 18} className="axis-number">
                {fmt(tick)}
              </text>
            </g>
          );
        })}

        {grid.yTicks.map((tick) => {
          const y = toScreenY(tick);
          return (
            <g key={`y-${tick}`}>
              <line x1="0" y1={y} x2={CANVAS.width} y2={y} stroke="#e7e7ef" strokeWidth="1" />
              <text x={yAxisX + 8} y={y - 6} className="axis-number">
                {fmt(tick)}
              </text>
            </g>
          );
        })}

        <line x1="0" y1={xAxisY} x2={CANVAS.width} y2={xAxisY} stroke="#111827" strokeWidth="2" />
        <line x1={yAxisX} y1="0" x2={yAxisX} y2={CANVAS.height} stroke="#111827" strokeWidth="2" />

        <text x={CANVAS.width - 24} y={xAxisY - 10} className="axis-label">x</text>
        <text x={yAxisX + 10} y="24" className="axis-label">y</text>

        {graph.segments.map((segment, index) => (
          <polyline
            key={index}
            points={segment
              .map((p) => `${toScreenX(p.x)},${toScreenY(p.y)}`)
              .join(" ")}
            fill="none"
            stroke="#6d28d9"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {graph.points.map((point, index) => {
          const x = toScreenX(point.x);
          const y = toScreenY(point.y);

          return (
            <g key={index}>
              <circle cx={x} cy={y} r="6" fill="#ef4444" />
              <text x={x + 10} y={y - 10} className="point-label">
                {point.label} ({fmt(point.x)}, {fmt(point.y)})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function createGrid(view, scale) {
  const step = niceStep(70 / scale);
  const xTicks = [];
  const yTicks = [];

  const xStart = Math.ceil(view.minX / step) * step;
  const xEnd = Math.floor(view.maxX / step) * step;

  for (let x = xStart; x <= xEnd + step / 2; x += step) {
    xTicks.push(roundTick(x));
  }

  const yStart = Math.ceil(view.minY / step) * step;
  const yEnd = Math.floor(view.maxY / step) * step;

  for (let y = yStart; y <= yEnd + step / 2; y += step) {
    yTicks.push(roundTick(y));
  }

  return { xTicks, yTicks };
}

function niceStep(value) {
  const power = Math.floor(Math.log10(value));
  const base = value / 10 ** power;

  let niceBase = 1;
  if (base <= 1) niceBase = 1;
  else if (base <= 2) niceBase = 2;
  else if (base <= 5) niceBase = 5;
  else niceBase = 10;

  return niceBase * 10 ** power;
}

function generateGraph(type, p, view) {
  const segments = [];
  const points = [];

  const safeA = Math.max(Math.abs(p.a ?? 1), 0.001);
  const safeB = Math.max(Math.abs(p.b ?? 1), 0.001);

  if (type === "linear") {
    if (p.x1 === p.x2) {
      segments.push([
        { x: p.x1, y: view.minY },
        { x: p.x1, y: view.maxY },
      ]);
    } else {
      const m = (p.y2 - p.y1) / (p.x2 - p.x1);
      const b = p.y1 - m * p.x1;
      segments.push(sampleX(view.minX, view.maxX, 700, (x) => m * x + b));
    }

    points.push({ x: p.x1, y: p.y1, label: "P1" });
    points.push({ x: p.x2, y: p.y2, label: "P2" });
  }

  if (type === "quadratic") {
    if (p.opening === "up" || p.opening === "down") {
      const sign = p.opening === "up" ? 1 : -1;
      segments.push(sampleX(view.minX, view.maxX, 900, (x) => sign * safeA * (x - p.h) ** 2 + p.k));
    } else {
      const sign = p.opening === "right" ? 1 : -1;
      segments.push(sampleY(view.minY, view.maxY, 900, (y) => sign * safeA * (y - p.k) ** 2 + p.h));
    }

    points.push({ x: p.h, y: p.k, label: "Vertex" });
  }

  if (type === "absolute") {
    if (p.opening === "up" || p.opening === "down") {
      const sign = p.opening === "up" ? 1 : -1;
      segments.push(sampleX(view.minX, view.maxX, 900, (x) => sign * safeA * Math.abs(x - p.h) + p.k));
    } else {
      const sign = p.opening === "right" ? 1 : -1;
      segments.push(sampleY(view.minY, view.maxY, 900, (y) => sign * safeA * Math.abs(y - p.k) + p.h));
    }

    points.push({ x: p.h, y: p.k, label: "Vertex" });
  }

  if (type === "logarithmic") {
    const start = Math.max(view.minX, p.h + 0.0001);
    if (start < view.maxX) {
      segments.push(sampleX(start, view.maxX, 900, (x) => p.a * Math.log(x - p.h) + p.k));
    }
  }

  if (type === "exponential") {
    const base = Math.max(Math.abs(p.base), 0.001);
    segments.push(sampleX(view.minX, view.maxX, 900, (x) => p.a * base ** (x - p.h) + p.k));
  }

  if (type === "circle") {
    const r = Math.max(Math.abs(p.r), 0.001);
    segments.push(sampleT(0, Math.PI * 2, 900, (t) => ({
      x: p.h + r * Math.cos(t),
      y: p.k + r * Math.sin(t),
    })));
    points.push({ x: p.h, y: p.k, label: "Center" });
  }

  if (type === "ellipse") {
    const rx = Math.max(Math.abs(p.rx), 0.001);
    const ry = Math.max(Math.abs(p.ry), 0.001);
    segments.push(sampleT(0, Math.PI * 2, 900, (t) => ({
      x: p.h + rx * Math.cos(t),
      y: p.k + ry * Math.sin(t),
    })));
    points.push({ x: p.h, y: p.k, label: "Center" });
  }

  if (type === "hyperbola") {
    const a = safeA;
    const b = safeB;

    if (p.orientation === "horizontal") {
      const rightStart = Math.max(view.minX, p.h + a + 0.0001);
      const rightEnd = view.maxX;
      const leftStart = view.minX;
      const leftEnd = Math.min(view.maxX, p.h - a - 0.0001);

      if (rightStart < rightEnd) {
        segments.push(sampleX(rightStart, rightEnd, 500, (x) => p.k + b * Math.sqrt(((x - p.h) ** 2) / a ** 2 - 1)));
        segments.push(sampleX(rightStart, rightEnd, 500, (x) => p.k - b * Math.sqrt(((x - p.h) ** 2) / a ** 2 - 1)));
      }

      if (leftStart < leftEnd) {
        segments.push(sampleX(leftStart, leftEnd, 500, (x) => p.k + b * Math.sqrt(((x - p.h) ** 2) / a ** 2 - 1)));
        segments.push(sampleX(leftStart, leftEnd, 500, (x) => p.k - b * Math.sqrt(((x - p.h) ** 2) / a ** 2 - 1)));
      }
    } else {
      segments.push(sampleX(view.minX, view.maxX, 700, (x) => p.k + a * Math.sqrt(1 + ((x - p.h) ** 2) / b ** 2)));
      segments.push(sampleX(view.minX, view.maxX, 700, (x) => p.k - a * Math.sqrt(1 + ((x - p.h) ** 2) / b ** 2)));
    }

    points.push({ x: p.h, y: p.k, label: "Center" });
  }

  return {
    segments: segments.filter((seg) => seg.length > 1),
    points,
  };
}

function sampleX(start, end, count, fn) {
  const points = [];
  const step = (end - start) / Math.max(count - 1, 1);

  for (let i = 0; i < count; i++) {
    const x = start + i * step;
    const y = fn(x);

    if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(y) < 1e6) {
      points.push({ x, y });
    }
  }

  return points;
}

function sampleY(start, end, count, fn) {
  const points = [];
  const step = (end - start) / Math.max(count - 1, 1);

  for (let i = 0; i < count; i++) {
    const y = start + i * step;
    const x = fn(y);

    if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) < 1e6) {
      points.push({ x, y });
    }
  }

  return points;
}

function sampleT(start, end, count, fn) {
  const points = [];
  const step = (end - start) / Math.max(count - 1, 1);

  for (let i = 0; i < count; i++) {
    const t = start + i * step;
    const point = fn(t);

    if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
      points.push(point);
    }
  }

  return points;
}

function getGraphInfo(type, p) {
  if (type === "linear") {
    if (p.x1 === p.x2) {
      return {
        equation: `x = ${fmt(p.x1)}`,
        isFunction: "ไม่เป็นฟังก์ชัน",
        domainRange: `Domain: x = ${fmt(p.x1)}, Range: จำนวนจริง`,
        details: [
          `กราฟเป็นเส้นตรงแนวตั้งผ่าน x = ${fmt(p.x1)}`,
          "ไม่ผ่าน Vertical Line Test",
          "ค่า x หนึ่งค่าให้ค่า y ได้หลายค่า จึงไม่เป็นฟังก์ชัน",
        ],
      };
    }

    const m = (p.y2 - p.y1) / (p.x2 - p.x1);
    const b = p.y1 - m * p.x1;

    return {
      equation: `y = ${fmt(m)}x ${b >= 0 ? "+" : "-"} ${fmt(Math.abs(b))}`,
      isFunction: "เป็นฟังก์ชัน",
      domainRange: "Domain: จำนวนจริง, Range: จำนวนจริง",
      details: [
        `ความชันของกราฟคือ m = ${fmt(m)}`,
        `จุดตัดแกน y คือ (0, ${fmt(b)})`,
        "เส้นตรงที่ไม่ใช่เส้นตั้งเป็นฟังก์ชันของ x",
      ],
    };
  }

  if (type === "quadratic") {
    const vertical = p.opening === "up" || p.opening === "down";
    const sign = p.opening === "down" || p.opening === "left" ? "-" : "";

    return {
      equation: vertical
        ? `y = ${sign}${fmt(Math.abs(p.a))}(x - ${fmt(p.h)})² + ${fmt(p.k)}`
        : `x = ${sign}${fmt(Math.abs(p.a))}(y - ${fmt(p.k)})² + ${fmt(p.h)}`,
      isFunction: vertical ? "เป็นฟังก์ชัน" : "ไม่เป็นฟังก์ชัน",
      domainRange: vertical
        ? `Domain: จำนวนจริง, Range: ${p.opening === "up" ? `y ≥ ${fmt(p.k)}` : `y ≤ ${fmt(p.k)}`}`
        : `Domain: ${p.opening === "right" ? `x ≥ ${fmt(p.h)}` : `x ≤ ${fmt(p.h)}`}, Range: จำนวนจริง`,
      details: [
        `จุดยอดคือ (${fmt(p.h)}, ${fmt(p.k)})`,
        `กราฟเปิด${directionTH(p.opening)}`,
        vertical ? "พาราโบลาแนวตั้งเป็นฟังก์ชัน" : "พาราโบลาแนวนอนไม่เป็นฟังก์ชัน",
      ],
    };
  }

  if (type === "absolute") {
    const vertical = p.opening === "up" || p.opening === "down";
    const sign = p.opening === "down" || p.opening === "left" ? "-" : "";

    return {
      equation: vertical
        ? `y = ${sign}${fmt(Math.abs(p.a))}|x - ${fmt(p.h)}| + ${fmt(p.k)}`
        : `x = ${sign}${fmt(Math.abs(p.a))}|y - ${fmt(p.k)}| + ${fmt(p.h)}`,
      isFunction: vertical ? "เป็นฟังก์ชัน" : "ไม่เป็นฟังก์ชัน",
      domainRange: vertical
        ? `Domain: จำนวนจริง, Range: ${p.opening === "up" ? `y ≥ ${fmt(p.k)}` : `y ≤ ${fmt(p.k)}`}`
        : `Domain: ${p.opening === "right" ? `x ≥ ${fmt(p.h)}` : `x ≤ ${fmt(p.h)}`}, Range: จำนวนจริง`,
      details: [
        `จุดยอดคือ (${fmt(p.h)}, ${fmt(p.k)})`,
        `กราฟมีลักษณะเป็นรูปตัว V และเปิด${directionTH(p.opening)}`,
        vertical ? "กราฟผ่าน Vertical Line Test" : "กราฟไม่ผ่าน Vertical Line Test",
      ],
    };
  }

  if (type === "logarithmic") {
    return {
      equation: `y = ${fmt(p.a)}ln(x - ${fmt(p.h)}) + ${fmt(p.k)}`,
      isFunction: "เป็นฟังก์ชัน",
      domainRange: `Domain: x > ${fmt(p.h)}, Range: จำนวนจริง`,
      details: [
        `เส้นกำกับแนวตั้งคือ x = ${fmt(p.h)}`,
        "กราฟลอการิทึมเป็นฟังก์ชันของ x",
        "ค่า x ต้องมากกว่า h เพื่อให้ลอการิทึมนิยามได้",
      ],
    };
  }

  if (type === "exponential") {
    return {
      equation: `y = ${fmt(p.a)}(${fmt(p.base)})^(x - ${fmt(p.h)}) + ${fmt(p.k)}`,
      isFunction: "เป็นฟังก์ชัน",
      domainRange: `Domain: จำนวนจริง, Range: ${p.a >= 0 ? `y > ${fmt(p.k)}` : `y < ${fmt(p.k)}`}`,
      details: [
        `ฐานของเลขชี้กำลังคือ ${fmt(p.base)}`,
        `เส้นกำกับแนวนอนคือ y = ${fmt(p.k)}`,
        "กราฟเอ็กซ์โพเนนเชียลเป็นฟังก์ชันของ x",
      ],
    };
  }

  if (type === "circle") {
    const r = Math.abs(p.r);
    return {
      equation: `(x - ${fmt(p.h)})² + (y - ${fmt(p.k)})² = ${fmt(r ** 2)}`,
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange: `Domain: ${fmt(p.h - r)} ≤ x ≤ ${fmt(p.h + r)}, Range: ${fmt(p.k - r)} ≤ y ≤ ${fmt(p.k + r)}`,
      details: [
        `จุดศูนย์กลางคือ (${fmt(p.h)}, ${fmt(p.k)})`,
        `รัศมีคือ ${fmt(r)}`,
        "วงกลมเต็มรูปไม่เป็นฟังก์ชัน เพราะ x หนึ่งค่าอาจให้ y ได้สองค่า",
      ],
    };
  }

  if (type === "ellipse") {
    const rx = Math.abs(p.rx);
    const ry = Math.abs(p.ry);

    return {
      equation: `(x - ${fmt(p.h)})²/${fmt(rx ** 2)} + (y - ${fmt(p.k)})²/${fmt(ry ** 2)} = 1`,
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange: `Domain: ${fmt(p.h - rx)} ≤ x ≤ ${fmt(p.h + rx)}, Range: ${fmt(p.k - ry)} ≤ y ≤ ${fmt(p.k + ry)}`,
      details: [
        `จุดศูนย์กลางคือ (${fmt(p.h)}, ${fmt(p.k)})`,
        `รัศมีแนวนอนคือ ${fmt(rx)} และรัศมีแนวตั้งคือ ${fmt(ry)}`,
        "วงรีเต็มรูปไม่เป็นฟังก์ชันของ x",
      ],
    };
  }

  if (type === "hyperbola") {
    return {
      equation:
        p.orientation === "horizontal"
          ? `(x - ${fmt(p.h)})²/${fmt(p.a ** 2)} - (y - ${fmt(p.k)})²/${fmt(p.b ** 2)} = 1`
          : `(y - ${fmt(p.k)})²/${fmt(p.a ** 2)} - (x - ${fmt(p.h)})²/${fmt(p.b ** 2)} = 1`,
      isFunction: "ไม่เป็นฟังก์ชัน",
      domainRange:
        p.orientation === "horizontal"
          ? `Domain: x ≤ ${fmt(p.h - Math.abs(p.a))} หรือ x ≥ ${fmt(p.h + Math.abs(p.a))}`
          : "Domain: จำนวนจริง",
      details: [
        `จุดศูนย์กลางคือ (${fmt(p.h)}, ${fmt(p.k)})`,
        p.orientation === "horizontal" ? "กราฟเปิดซ้ายและขวา" : "กราฟเปิดขึ้นและลง",
        "ไฮเพอร์โบลาเต็มรูปไม่เป็นฟังก์ชันของ x",
      ],
    };
  }

  return { equation: "-", isFunction: "-", domainRange: "-", details: [] };
}

function calculateArea(type, p, a, b) {
  const min = Math.min(Number(a), Number(b));
  const max = Math.max(Number(a), Number(b));

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { supported: false, value: 0 };
  }

  if (min === max) return { supported: true, value: 0 };

  let fn = null;

  if (type === "linear" && p.x1 !== p.x2) {
    const m = (p.y2 - p.y1) / (p.x2 - p.x1);
    const c = p.y1 - m * p.x1;
    fn = (x) => m * x + c;
  }

  if (type === "quadratic" && (p.opening === "up" || p.opening === "down")) {
    const sign = p.opening === "up" ? 1 : -1;
    fn = (x) => sign * Math.abs(p.a) * (x - p.h) ** 2 + p.k;
  }

  if (type === "absolute" && (p.opening === "up" || p.opening === "down")) {
    const sign = p.opening === "up" ? 1 : -1;
    fn = (x) => sign * Math.abs(p.a) * Math.abs(x - p.h) + p.k;
  }

  if (type === "logarithmic") {
    if (min <= p.h) return { supported: false, value: 0 };
    fn = (x) => p.a * Math.log(x - p.h) + p.k;
  }

  if (type === "exponential") {
    const base = Math.max(Math.abs(p.base), 0.001);
    fn = (x) => p.a * base ** (x - p.h) + p.k;
  }

  if (!fn) return { supported: false, value: 0 };

  const n = 1200;
  const dx = (max - min) / n;
  let area = 0;

  for (let i = 0; i < n; i++) {
    const x1 = min + i * dx;
    const x2 = x1 + dx;
    const y1 = fn(x1);
    const y2 = fn(x2);

    if (!Number.isFinite(y1) || !Number.isFinite(y2)) {
      return { supported: false, value: 0 };
    }

    area += ((Math.abs(y1) + Math.abs(y2)) / 2) * dx;
  }

  return { supported: true, value: area };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundTick(value) {
  return Number(value.toFixed(10));
}

function fmt(num) {
  if (!Number.isFinite(Number(num))) return "-";
  const value = Number(num);
  if (Math.abs(value) < 0.000001) return "0";
  return Number(value.toFixed(3)).toString();
}

function directionTH(direction) {
  const map = {
    up: "ขึ้น",
    down: "ลง",
    left: "ซ้าย",
    right: "ขวา",
  };
  return map[direction] || direction;
}

function GraphIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <path d="M23 17V95H103" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 76C54 78 84 68 96 28" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M85 32L97 24L103 38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 42H32M23 59H32M23 76H32M43 95V87M62 95V87M81 95V87" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function AnalyzeIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <path d="M18 92H67" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 92V67M50 92V48M70 92V58M90 92V38" stroke="currentColor" strokeWidth="8" />
      <path d="M30 53L50 34L70 43L90 22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="53" r="5" fill="currentColor" />
      <circle cx="50" cy="34" r="5" fill="currentColor" />
      <circle cx="70" cy="43" r="5" fill="currentColor" />
      <circle cx="90" cy="22" r="5" fill="currentColor" />
      <circle cx="79" cy="75" r="24" stroke="currentColor" strokeWidth="5" />
      <path d="M95 93L108 111" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none">
      <rect
        x="25"
        y="18"
        width="70"
        height="84"
        rx="14"
        stroke="currentColor"
        strokeWidth="7"
      />
      <path
        d="M42 42H78"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M42 60H72"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M42 78H60"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="83"
        cy="82"
        r="21"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
      />
      <path
        d="M73 82L80 89L94 73"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}