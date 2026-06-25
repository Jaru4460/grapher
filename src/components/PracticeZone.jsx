import React, { useEffect, useMemo, useState } from "react";
import { practiceQuestions } from "../data/practiceQuestions.js";

const ALL_TOPICS = ["All", "Calculus", "Vector", "Analytic Geometry"];
const ALL_DIFFICULTIES = ["All", "Easy", "Normal", "Hard", "A-level 68"];

const EMPTY_STATS = {
  total: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  byTopic: {}
};

export default function PracticeZone({ goHome }) {
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [currentId, setCurrentId] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [stats, setStats] = useState(loadStats);

  const filteredQuestions = useMemo(() => {
    return practiceQuestions.filter((q) => {
      const topicOK = topic === "All" || q.topic === topic;
      const difficultyOK = difficulty === "All" || q.difficulty === difficulty;
      return topicOK && difficultyOK;
    });
  }, [topic, difficulty]);

  const currentQuestion = useMemo(() => {
    return filteredQuestions.find((q) => q.id === currentId) || filteredQuestions[0];
  }, [filteredQuestions, currentId]);

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  useEffect(() => {
    chooseRandomQuestion();
  }, [topic, difficulty]);

  function chooseRandomQuestion() {
    if (filteredQuestions.length === 0) {
      setCurrentId(null);
      return;
    }

    const pool =
      filteredQuestions.length > 1
        ? filteredQuestions.filter((q) => q.id !== currentId)
        : filteredQuestions;

    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];

    setCurrentId(randomQuestion.id);
    setUserAnswer("");
    setChecked(false);
    setIsCorrect(false);
    setShowSolution(false);
  }

  function checkAnswer() {
    if (!currentQuestion) return;

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const correct = currentQuestion.acceptedAnswers.some((answer) => {
      return normalizeAnswer(answer) === normalizedUserAnswer;
    });

    setChecked(true);
    setIsCorrect(correct);

    const nextStats = updateStats(stats, currentQuestion.topic, correct);
    setStats(nextStats);
    localStorage.setItem("grapherPracticeStats", JSON.stringify(nextStats));
  }

  function resetStats() {
    setStats(EMPTY_STATS);
    localStorage.removeItem("grapherPracticeStats");
  }

  return (
    <>
      <header className="practice-header">
        <button className="logo" onClick={goHome}>
          Graph<span>er</span>
        </button>
        <div className="header-title">Practice Zone</div>
      </header>

      <section className="practice-page">
        <div className="practice-hero">
          <div>
            <h1>ฝึกโจทย์คณิตศาสตร์แบบสุ่ม</h1>
            <p>
              ระบบจะสุ่มโจทย์จากคลัง Calculus, Vector และ Analytic Geometry
              พร้อมตรวจคำตอบ แสดงเฉลย และเก็บสถิติการทำแบบฝึกหัด
            </p>
          </div>

          <div className="practice-stats-card">
            <div>
              <small>Accuracy</small>
              <strong>{accuracy}%</strong>
            </div>
            <div>
              <small>Correct</small>
              <strong>{stats.correct}/{stats.total}</strong>
            </div>
            <div>
              <small>Streak</small>
              <strong>{stats.streak}</strong>
            </div>
            <div>
              <small>Best</small>
              <strong>{stats.bestStreak}</strong>
            </div>
          </div>
        </div>

        <div className="practice-layout">
          <aside className="practice-sidebar">
            <div className="practice-panel">
              <h3>ตั้งค่าโจทย์</h3>

              <label className="practice-select-label">
                หัวข้อ
                <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {ALL_TOPICS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="practice-select-label">
                ระดับความยาก
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {ALL_DIFFICULTIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <button className="practice-secondary-button" onClick={chooseRandomQuestion}>
                สุ่มโจทย์ใหม่
              </button>

              <button className="practice-danger-button" onClick={resetStats}>
                Reset Stats
              </button>
            </div>

            <div className="practice-panel">
              <h3>สถิติตามหัวข้อ</h3>
              <TopicStat stats={stats} topic="Calculus" />
              <TopicStat stats={stats} topic="Vector" />
              <TopicStat stats={stats} topic="Analytic Geometry" />
            </div>
          </aside>

          <main className="question-card">
            {!currentQuestion ? (
              <div className="no-question">
                ไม่พบโจทย์ในเงื่อนไขที่เลือก กรุณาเปลี่ยนหัวข้อหรือระดับความยาก
              </div>
            ) : (
              <>
                <div className="question-meta">
                  <span>ข้อ {currentQuestion.id}</span>
                  <span>{currentQuestion.topic}</span>
                  <span>{currentQuestion.difficulty}</span>
                </div>

                <h2>โจทย์</h2>

                <div className="question-text">
                  {formatMathText(currentQuestion.question)}
                </div>

                <div className="answer-area">
                  <label>
                    คำตอบของคุณ
                    <input
                      value={userAnswer}
                      onChange={(e) => {
                        setUserAnswer(e.target.value);
                        setChecked(false);
                        setIsCorrect(false);
                      }}
                      placeholder="พิมพ์คำตอบ เช่น 17, (0,4), 2√14"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") checkAnswer();
                      }}
                    />
                  </label>

                  <button className="check-button" onClick={checkAnswer}>
                    Check Answer
                  </button>
                </div>

                {checked && (
                  <div className={isCorrect ? "feedback correct" : "feedback wrong"}>
                    {isCorrect ? (
                      <>ถูกต้อง! คำตอบคือ {currentQuestion.answerDisplay}</>
                    ) : (
                      <>ยังไม่ถูก คำตอบที่ถูกคือ {currentQuestion.answerDisplay}</>
                    )}
                  </div>
                )}

                <div className="practice-actions">
                  <button
                    className="practice-secondary-button"
                    onClick={() => setShowSolution((prev) => !prev)}
                  >
                    {showSolution ? "ซ่อนเฉลย" : "ดูเฉลย"}
                  </button>

                  <button className="practice-primary-button" onClick={chooseRandomQuestion}>
                    Next Question →
                  </button>
                </div>

                {showSolution && (
                  <div className="solution-box">
                    <h3>เฉลย</h3>
                    <ol>
                      {currentQuestion.solution.map((step, index) => (
                        <li key={index}>{formatMathText(step)}</li>
                      ))}
                    </ol>
                    <div className="final-answer">
                      คำตอบ: {currentQuestion.answerDisplay}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>
    </>
  );
}

function TopicStat({ stats, topic }) {
  const topicStat = stats.byTopic[topic] || { total: 0, correct: 0 };
  const percent =
    topicStat.total > 0 ? Math.round((topicStat.correct / topicStat.total) * 100) : 0;

  return (
    <div className="topic-stat">
      <span>{topic}</span>
      <strong>
        {topicStat.correct}/{topicStat.total} · {percent}%
      </strong>
    </div>
  );
}

function loadStats() {
  try {
    const saved = localStorage.getItem("grapherPracticeStats");
    if (!saved) return EMPTY_STATS;
    return { ...EMPTY_STATS, ...JSON.parse(saved) };
  } catch {
    return EMPTY_STATS;
  }
}

function updateStats(prev, topic, correct) {
  const topicStats = prev.byTopic[topic] || { total: 0, correct: 0 };
  const nextStreak = correct ? prev.streak + 1 : 0;

  return {
    total: prev.total + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak: nextStreak,
    bestStreak: Math.max(prev.bestStreak, nextStreak),
    byTopic: {
      ...prev.byTopic,
      [topic]: {
        total: topicStats.total + 1,
        correct: topicStats.correct + (correct ? 1 : 0)
      }
    }
  };
}

function normalizeAnswer(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("−", "-")
    .replaceAll("–", "-")
    .replaceAll("√", "sqrt")
    .replaceAll("*", "")
    .replaceAll("องศา", "")
    .replaceAll("หน่วย", "")
    .replaceAll("ตาราง", "")
    .replaceAll("°", "")
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll(",", ",");
}

function formatMathText(text) {
  return String(text)
    .replaceAll("^2", "²")
    .replaceAll("^3", "³")
    .replaceAll("^4", "⁴")
    .replaceAll("sqrt", "√");
}