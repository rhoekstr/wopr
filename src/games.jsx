import { useState, useEffect, useRef } from "react";

// ─── Shared constants ──────────────────────────────────────────────────────────
const DIFFICULTIES = ["easy", "medium", "hard", "impossible"];
const DIFF_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard", impossible: "Impossible" };
const DIFF_COLORS = { easy: "#4ade80", medium: "#facc15", hard: "#fb923c", impossible: "#f87171" };
const MODES = ["vs-cpu", "vs-human", "cpu-cpu"];
const MODE_LABELS = { "vs-cpu": "vs CPU", "vs-human": "vs Human", "cpu-cpu": "CPU vs CPU" };

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
function ModeBar({ mode, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
      {MODES.map(m => (
        <button key={m} onClick={() => onChange(m)} style={{
          background: mode === m ? "#fff" : "transparent",
          border: `2px solid ${mode === m ? "#fff" : "#888"}`,
          color: mode === m ? "#0a0a0a" : "#ddd",
          padding: "5px 10px", fontSize: "9px", letterSpacing: "0.12em",
          textTransform: "uppercase", cursor: "pointer", borderRadius: "3px",
          fontFamily: "'Courier New', monospace", fontWeight: "bold",
          transition: "all 0.15s"
        }}>{MODE_LABELS[m]}</button>
      ))}
    </div>
  );
}

function DiffBar({ difficulty, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
      {DIFFICULTIES.map(d => (
        <button key={d} onClick={() => onChange(d)} style={{
          background: difficulty === d ? DIFF_COLORS[d] : "transparent",
          border: `2px solid ${difficulty === d ? DIFF_COLORS[d] : "#777"}`,
          color: difficulty === d ? "#0a0a0a" : "#ddd",
          padding: "3px 8px", fontSize: "8px", letterSpacing: "0.15em",
          textTransform: "uppercase", cursor: "pointer", borderRadius: "3px",
          fontFamily: "'Courier New', monospace", fontWeight: "bold",
          transition: "all 0.15s"
        }}>{DIFF_LABELS[d]}</button>
      ))}
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <button onClick={onBack} style={{
      position: "absolute", top: "14px", left: "14px", zIndex: 50,
      background: "rgba(0,0,0,0.6)", border: "2px solid #ddd",
      color: "#fff", padding: "6px 12px", fontSize: "10px",
      letterSpacing: "0.2em", textTransform: "uppercase",
      cursor: "pointer", borderRadius: "3px", fontWeight: "bold",
      fontFamily: "'Courier New', monospace", transition: "all 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.background = "rgba(0,0,0,0.85)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
    >← Menu</button>
  );
}

// "by awryLabs" credit — shown in the same top-center position on every screen.
// Brand style: italic "awry" + bold "Labs", matching www.awrylabs.com.
function AwryCredit() {
  return (
    <a href="https://www.awrylabs.com" target="_blank" rel="noopener noreferrer" style={{
      position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 40,
      fontSize: 11, letterSpacing: "0.05em",
      color: "#888", textDecoration: "none",
      fontFamily: "'Courier New', monospace",
      transition: "color 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
    onMouseLeave={e => { e.currentTarget.style.color = "#888"; }}
    >by <em style={{ fontStyle: "italic" }}>awry</em><strong style={{ fontWeight: "bold" }}>Labs</strong> <span style={{ fontSize: 9 }}>↗</span></a>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIC TAC TOE
// ═══════════════════════════════════════════════════════════════════════════════

const TTT_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function tttCheckWinner(squares) {
  for (let [a,b,c] of TTT_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return { winner: squares[a], line: [a,b,c] };
  }
  if (squares.every(Boolean)) return { winner: "draw", line: [] };
  return null;
}

function tttRandomEmpty(squares) {
  const empty = squares.map((v,i) => v === null ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function tttFindThreat(squares, mark) {
  for (let [a,b,c] of TTT_LINES) {
    const vals = [squares[a], squares[b], squares[c]];
    if (vals.filter(v => v === mark).length === 2 && vals.includes(null))
      return [a,b,c][vals.indexOf(null)];
  }
  return null;
}

function tttMinimax(squares, isMaximizing, depth = 0) {
  const result = tttCheckWinner(squares);
  if (result) {
    if (result.winner === "O") return 10 - depth;
    if (result.winner === "X") return depth - 10;
    return 0;
  }
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const next = [...squares]; next[i] = "O";
        best = Math.max(best, tttMinimax(next, false, depth + 1));
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const next = [...squares]; next[i] = "X";
        best = Math.min(best, tttMinimax(next, true, depth + 1));
      }
    }
    return best;
  }
}

function tttGetMinimaxMove(squares, mark) {
  const isMax = mark === "O";
  let bestVal = isMax ? -Infinity : Infinity, bestIdx = -1;
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const next = [...squares]; next[i] = mark;
      const val = tttMinimax(next, !isMax, 1);
      if (isMax ? val > bestVal : val < bestVal) { bestVal = val; bestIdx = i; }
    }
  }
  return bestIdx;
}

function tttGetCpuMove(squares, mark, difficulty) {
  const opp = mark === "O" ? "X" : "O";
  const win = tttFindThreat(squares, mark);
  const block = tttFindThreat(squares, opp);
  if (difficulty === "easy") {
    if ((win !== null || block !== null) && Math.random() < 0.1) return win !== null ? win : block;
    return tttRandomEmpty(squares);
  }
  if (difficulty === "medium") {
    if (win !== null) return win;
    if (block !== null) return block;
    if (Math.random() < 0.5) {
      if (!squares[4]) return 4;
      const corners = [0,2,6,8].filter(i => !squares[i]);
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    }
    return tttRandomEmpty(squares);
  }
  if (difficulty === "hard") {
    if (win !== null) return win;
    if (block !== null) return block;
    if (!squares[4]) return 4;
    const corners = [0,2,6,8].filter(i => !squares[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return tttRandomEmpty(squares);
  }
  if (difficulty === "impossible") return tttGetMinimaxMove(squares, mark);
  return tttRandomEmpty(squares);
}

function TicTacToe({ onBack }) {
  const [mode, setMode] = useState("vs-cpu");
  const [difficulty, setDifficulty] = useState("hard");
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [playerGoesFirst, setPlayerGoesFirst] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [winningLine, setWinningLine] = useState([]);
  const [flash, setFlash] = useState(null);
  const scoredRef = useRef(false);

  const result = tttCheckWinner(squares);
  const isCpuTurn = !result && (mode === "cpu-cpu" || (mode === "vs-cpu" && !xIsNext));

  useEffect(() => {
    if (result && !scoredRef.current) {
      scoredRef.current = true;
      if (result.winner !== "draw") setWinningLine(result.line);
      setScores(s => ({ ...s, [result.winner]: s[result.winner] + 1 }));
    }
  }, [result]);

  useEffect(() => {
    if (!isCpuTurn) return;
    const mark = xIsNext ? "X" : "O";
    const timer = setTimeout(() => {
      const idx = tttGetCpuMove(squares, mark, difficulty);
      if (idx !== null && idx !== -1) {
        const next = [...squares]; next[idx] = mark;
        setSquares(next); setXIsNext(v => !v);
        setFlash(idx); setTimeout(() => setFlash(null), 400);
      }
    }, mode === "cpu-cpu" ? 700 : 450);
    return () => clearTimeout(timer);
  }, [squares, xIsNext, isCpuTurn, mode, difficulty]);

  function handleClick(i) {
    if (isCpuTurn || squares[i] || result || mode === "cpu-cpu") return;
    const next = [...squares]; next[i] = xIsNext ? "X" : "O";
    setSquares(next); setXIsNext(v => !v);
  }

  function resetGame(pf) {
    const go = pf !== undefined ? pf : playerGoesFirst;
    scoredRef.current = false;
    setSquares(Array(9).fill(null));
    setXIsNext(mode === "vs-cpu" ? go : true);
    setWinningLine([]); setFlash(null);
  }

  function handleNewGame() {
    const next = !playerGoesFirst; setPlayerGoesFirst(next); resetGame(next);
  }

  function changeMode(m) {
    setMode(m); setScores({ X: 0, O: 0, draw: 0 });
    scoredRef.current = false;
    setSquares(Array(9).fill(null)); setXIsNext(true);
    setPlayerGoesFirst(true); setWinningLine([]); setFlash(null);
  }

  const xLabel = mode === "vs-human" ? "P1" : mode === "cpu-cpu" ? "CPU 1" : "PLAYER";
  const oLabel = mode === "vs-human" ? "P2" : mode === "cpu-cpu" ? "CPU 2" : "CPU";
  const turnLabel = xIsNext ? xLabel : oLabel;
  const statusText = result
    ? result.winner === "draw" ? "Draw." : `${result.winner === "X" ? xLabel : oLabel} wins!`
    : `${turnLabel}'s move`;
  const statusColor = result
    ? result.winner === "draw" ? "#888" : result.winner === "X" ? "#4ade80" : "#f87171"
    : "#e8e8e8";

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", maxWidth: 420, margin: "0 auto", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace", color: "#e8e8e8",
      padding: "24px", position: "relative"
    }}>
      <BackButton onBack={onBack} />
      <AwryCredit />
      <div style={{ fontSize: "12px", letterSpacing: "0.4em", color: "#888", textTransform: "uppercase", marginBottom: "10px", fontWeight: "bold" }}>
        Tic-Tac-Toe
      </div>
      <ModeBar mode={mode} onChange={changeMode} />
      {mode !== "vs-human"
        ? <DiffBar difficulty={difficulty} onChange={d => { setDifficulty(d); resetGame(); }} />
        : <div style={{ height: "29px", marginBottom: "8px" }} />}
      <div style={{ height: 16 }} />
      <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "6px", color: statusColor }}>{statusText}</div>
      {mode === "vs-cpu" && !result
        ? <div style={{ fontSize: "10px", color: "#444", letterSpacing: "0.2em", marginBottom: "16px" }}>{playerGoesFirst ? "PLAYER goes first" : "CPU goes first"}</div>
        : <div style={{ height: "16px", marginBottom: "16px" }} />}
      <div style={{ display: "flex", gap: "28px", marginBottom: "24px" }}>
        {[[xLabel, "X", "#4ade80"], ["DRAW", "draw", "#888"], [oLabel, "O", "#f87171"]].map(([label, key, color]) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "#444", letterSpacing: "0.2em", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color }}>{scores[key]}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 96px)", gridTemplateRows: "repeat(3, 96px)", gap: "6px", marginBottom: "24px" }}>
        {squares.map((val, i) => {
          const isWin = winningLine.includes(i);
          const clickable = !val && !isCpuTurn && !result && mode !== "cpu-cpu";
          return (
            <div key={i} onClick={() => handleClick(i)} style={{
              width: "96px", height: "96px",
              background: isWin ? (val === "X" ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)") : flash === i ? "rgba(255,255,255,0.08)" : "#141414",
              border: isWin ? `2px solid ${val === "X" ? "#4ade80" : "#f87171"}` : "2px solid #222",
              borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "36px", fontWeight: "bold",
              cursor: clickable ? "pointer" : "default",
              color: val === "X" ? "#4ade80" : "#f87171",
              transition: "all 0.15s", userSelect: "none",
            }}
            onMouseEnter={e => { if (clickable) e.currentTarget.style.background = "#1e1e1e"; }}
            onMouseLeave={e => { if (!isWin) e.currentTarget.style.background = "#141414"; }}
            >{val || ""}</div>
          );
        })}
      </div>
      <button onClick={handleNewGame} style={{
        background: "transparent", border: "2px solid #ddd", color: "#fff",
        padding: "9px 24px", fontSize: "10px", letterSpacing: "0.3em",
        textTransform: "uppercase", cursor: "pointer", borderRadius: "3px", fontWeight: "bold",
        fontFamily: "'Courier New', monospace", transition: "all 0.2s"
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#999"; e.currentTarget.style.color = "#ddd"; }}
      >New Game</button>
      <div style={{ marginTop: "16px", fontSize: "10px", color: "#888", letterSpacing: "0.15em" }}>
        X = {xLabel} &nbsp;·&nbsp; O = {oLabel}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECT 4
// ═══════════════════════════════════════════════════════════════════════════════

const C4_ROWS = 6, C4_COLS = 7, C4_EMPTY = null;
const C4_CELL = 44, C4_PAD = 6;
const C4_COLORS = {
  R: { fill: "#ef4444", glow: "rgba(239,68,68,0.5)", shine: "#fca5a5" },
  Y: { fill: "#eab308", glow: "rgba(234,179,8,0.5)", shine: "#fde68a" },
};

function c4MakeBoard() {
  return Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(C4_EMPTY));
}

function c4CheckWinner(board) {
  const lines = [];
  for (let r = 0; r < C4_ROWS; r++)
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r][c+1] && val === board[r][c+2] && val === board[r][c+3])
        lines.push({ winner: val, cells: [[r,c],[r,c+1],[r,c+2],[r,c+3]] });
    }
  for (let r = 0; r <= C4_ROWS - 4; r++)
    for (let c = 0; c < C4_COLS; c++) {
      const val = board[r][c];
      if (val && val === board[r+1][c] && val === board[r+2][c] && val === board[r+3][c])
        lines.push({ winner: val, cells: [[r,c],[r+1,c],[r+2,c],[r+3,c]] });
    }
  for (let r = 0; r <= C4_ROWS - 4; r++)
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r+1][c+1] && val === board[r+2][c+2] && val === board[r+3][c+3])
        lines.push({ winner: val, cells: [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]] });
    }
  for (let r = 0; r <= C4_ROWS - 4; r++)
    for (let c = 3; c < C4_COLS; c++) {
      const val = board[r][c];
      if (val && val === board[r+1][c-1] && val === board[r+2][c-2] && val === board[r+3][c-3])
        lines.push({ winner: val, cells: [[r,c],[r+1,c-1],[r+2,c-2],[r+3,c-3]] });
    }
  if (lines.length > 0) {
    const winner = lines[0].winner;
    const seen = new Set();
    const cells = lines.flatMap(l => l.cells).filter(([r,c]) => {
      const key = `${r},${c}`; if (seen.has(key)) return false; seen.add(key); return true;
    });
    return { winner, cells };
  }
  if (board[0].every(v => v !== C4_EMPTY)) return { winner: "draw", cells: [] };
  return null;
}

function c4GetRow(board, col) {
  for (let r = C4_ROWS - 1; r >= 0; r--)
    if (board[r][col] === C4_EMPTY) return r;
  return -1;
}

const C4_COL_ORDER = [3,2,4,1,5,0,6];

function c4ValidCols(board) {
  return C4_COL_ORDER.filter(c => c4GetRow(board, c) !== -1);
}

function c4Apply(board, col, mark) {
  const r = c4GetRow(board, col); if (r === -1) return null;
  const next = board.map(row => [...row]); next[r][col] = mark; return next;
}

function c4RandomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function c4Evaluate(board, myMark, turn, depth) {
  const res = c4CheckWinner(board);
  if (res) {
    if (res.winner === myMark) return "win";
    if (res.winner === "draw") return "draw";
    return "loss";
  }
  const cols = c4ValidCols(board);
  if (!cols.length) return "draw";
  if (depth === 0) return "draw";
  const opp = turn === "R" ? "Y" : "R";
  if (turn === myMark) {
    let best = "loss";
    for (const c of cols) {
      const outcome = c4Evaluate(c4Apply(board, c, turn), myMark, opp, depth - 1);
      if (outcome === "win") return "win";
      if (outcome === "draw") best = "draw";
    }
    return best;
  } else {
    let hasLoss = false, hasDraw = false;
    for (const c of cols) {
      const outcome = c4Evaluate(c4Apply(board, c, turn), myMark, opp, depth - 1);
      if (outcome === "loss") { hasLoss = true; break; }
      if (outcome === "draw") hasDraw = true;
    }
    if (hasLoss) return "loss";
    if (hasDraw) return "draw";
    return "win";
  }
}

function c4CountLeaves(board, myMark, turn, depth) {
  const res = c4CheckWinner(board);
  if (res) {
    if (res.winner === myMark) return { wins: 1, draws: 0, losses: 0 };
    if (res.winner === "draw") return { wins: 0, draws: 1, losses: 0 };
    return { wins: 0, draws: 0, losses: 1 };
  }
  const cols = c4ValidCols(board);
  if (!cols.length) return { wins: 0, draws: 1, losses: 0 };
  if (depth === 0) return { wins: 0, draws: 1, losses: 0 };
  const opp = turn === "R" ? "Y" : "R";
  let wins = 0, draws = 0, losses = 0;
  for (const c of cols) {
    const r = c4CountLeaves(c4Apply(board, c, turn), myMark, opp, depth - 1);
    wins += r.wins; draws += r.draws; losses += r.losses;
  }
  return { wins, draws, losses };
}

function c4GetBestCol(board, mark, depth) {
  const opp = mark === "R" ? "Y" : "R";
  const cols = c4ValidCols(board);
  if (!cols.length) return null;
  for (const c of cols) { if (c4CheckWinner(c4Apply(board, c, mark))?.winner === mark) return c; }
  for (const c of cols) { if (c4CheckWinner(c4Apply(board, c, opp))?.winner === opp) return c; }
  const evaluated = cols.map(c => {
    const next = c4Apply(board, c, mark);
    const outcome = c4Evaluate(next, mark, opp, depth - 1);
    const { wins, draws, losses } = c4CountLeaves(next, mark, opp, Math.min(depth - 1, 3));
    const total = wins + draws + losses;
    const rate = total === 0 ? 0 : wins / total;
    return { c, outcome, rate };
  });
  const safe = evaluated.filter(x => x.outcome !== "loss");
  const pool = safe.length ? safe : evaluated;
  const best = Math.max(...pool.map(x => x.rate));
  const tied = pool.filter(x => x.rate === best);
  return c4RandomChoice(tied).c;
}

function c4GetCpuMove(board, mark, difficulty) {
  const cols = c4ValidCols(board);
  if (!cols.length) return null;
  if (difficulty === "easy") {
    if (Math.random() < 0.5) return c4RandomChoice(cols);
    return c4GetBestCol(board, mark, 2);
  }
  if (difficulty === "medium") return c4GetBestCol(board, mark, 4);
  if (difficulty === "hard")   return c4GetBestCol(board, mark, 6);
  if (difficulty === "impossible") return c4GetBestCol(board, mark, 8);
  return c4RandomChoice(cols);
}

function Connect4({ onBack }) {
  const [mode, setMode] = useState("vs-cpu");
  const [difficulty, setDifficulty] = useState("hard");
  const [board, setBoard] = useState(c4MakeBoard());
  const [currentMark, setCurrentMark] = useState("R");
  const [scores, setScores] = useState({ R: 0, Y: 0, draw: 0 });
  const [result, setResult] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [dropping, setDropping] = useState(null);
  const [playerGoesFirst, setPlayerGoesFirst] = useState(true);
  const scoredRef = useRef(false);
  const boardRef = useRef(board);
  boardRef.current = board;

  const isCpuTurn = !result && !animating && (mode === "cpu-cpu" || (mode === "vs-cpu" && currentMark === "Y"));

  function dropPiece(col, mark, currentBoard, onComplete) {
    const row = c4GetRow(currentBoard, col); if (row === -1) return;
    setAnimating(true);
    const duration = 80 + (row + 1) * 60;
    const start = performance.now();
    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 1 ? progress * progress : 1;
      setDropping({ col, row, mark, progress: eased });
      if (progress < 1) requestAnimationFrame(animate);
      else { setDropping(null); setAnimating(false); onComplete(row); }
    }
    requestAnimationFrame(animate);
  }

  function commitMove(col, mark, currentBoard) {
    if (animating) return;
    const row = c4GetRow(currentBoard, col); if (row === -1) return;
    dropPiece(col, mark, currentBoard, landRow => {
      const next = currentBoard.map(r => [...r]); next[landRow][col] = mark;
      setBoard(next);
      const res = c4CheckWinner(next);
      if (res && !scoredRef.current) {
        scoredRef.current = true; setResult(res);
        setScores(s => ({ ...s, [res.winner]: s[res.winner] + 1 }));
      } else if (!res) setCurrentMark(mark === "R" ? "Y" : "R");
    });
  }

  useEffect(() => {
    if (!isCpuTurn) return;
    const timer = setTimeout(() => {
      const col = c4GetCpuMove(boardRef.current, currentMark, difficulty);
      if (col !== null) commitMove(col, currentMark, boardRef.current);
    }, mode === "cpu-cpu" ? 800 : 500);
    return () => clearTimeout(timer);
  }, [isCpuTurn, currentMark, difficulty, mode]);

  function handleColClick(col) {
    if (animating || result || isCpuTurn || mode === "cpu-cpu") return;
    if (c4GetRow(board, col) === -1) return;
    commitMove(col, currentMark, board);
  }

  function resetGame(pgf) {
    const pf = pgf !== undefined ? pgf : playerGoesFirst;
    scoredRef.current = false; setBoard(c4MakeBoard()); setResult(null);
    setDropping(null); setAnimating(false); setHoverCol(null);
    setCurrentMark(mode === "vs-cpu" && !pf ? "Y" : "R");
  }

  function handleNewGame() { const n = !playerGoesFirst; setPlayerGoesFirst(n); resetGame(n); }

  function changeMode(m) {
    setMode(m); setScores({ R: 0, Y: 0, draw: 0 }); scoredRef.current = false;
    setBoard(c4MakeBoard()); setResult(null); setDropping(null);
    setAnimating(false); setCurrentMark("R"); setPlayerGoesFirst(true);
  }

  const rLabel = mode === "vs-human" ? "P1" : mode === "cpu-cpu" ? "CPU 1" : "PLAYER";
  const yLabel = mode === "vs-human" ? "P2" : mode === "cpu-cpu" ? "CPU 2" : "CPU";
  const turnLabel = currentMark === "R" ? rLabel : yLabel;
  const turnColor = currentMark === "R" ? C4_COLORS.R.fill : C4_COLORS.Y.fill;
  const statusText = result
    ? result.winner === "draw" ? "Draw!" : `${result.winner === "R" ? rLabel : yLabel} wins!`
    : animating ? "" : `${turnLabel}'s turn`;
  const statusColor = result
    ? result.winner === "draw" ? "#888" : result.winner === "R" ? C4_COLORS.R.fill : C4_COLORS.Y.fill
    : turnColor;
  const winCells = new Set((result?.cells || []).map(([r,c]) => `${r},${c}`));
  const boardW = C4_COLS * C4_CELL + C4_PAD * 2;
  const boardH = C4_ROWS * C4_CELL + C4_PAD * 2;
  let dropY = null;
  if (dropping) {
    const topY = -C4_CELL, landY = C4_PAD + dropping.row * C4_CELL;
    dropY = topY + (landY - topY) * dropping.progress;
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080c14", maxWidth: 420, margin: "0 auto", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace", color: "#e8e8e8",
      padding: "12px", userSelect: "none", position: "relative"
    }}>
      <BackButton onBack={onBack} />
      <AwryCredit />
      <div style={{ fontSize: "12px", letterSpacing: "0.5em", color: "#7090c0", textTransform: "uppercase", marginBottom: "6px", fontWeight: "bold" }}>
        Connect Four
      </div>
      <ModeBar mode={mode} onChange={changeMode} />
      {mode !== "vs-human"
        ? <DiffBar difficulty={difficulty} onChange={d => { setDifficulty(d); resetGame(); }} />
        : <div style={{ height: "29px", marginBottom: "8px" }} />}
      <div style={{ height: 16 }} />
      <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px", color: statusColor, minHeight: "26px" }}>{statusText}</div>
      <div style={{ fontSize: "10px", color: "#2a3a50", letterSpacing: "0.2em", marginBottom: "8px", minHeight: "16px" }}>
        {mode === "vs-cpu" && !result ? (playerGoesFirst ? "PLAYER goes first" : "CPU goes first") : ""}
      </div>
      <div style={{ display: "flex", gap: "24px", marginBottom: "10px" }}>
        {[[rLabel, "R", C4_COLORS.R.fill], ["DRAW", "draw", "#3a4a6a"], [yLabel, "Y", C4_COLORS.Y.fill]].map(([label, key, color]) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "#2a3a50", letterSpacing: "0.2em", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color }}>{scores[key]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <div style={{ position: "absolute", top: -C4_CELL, left: C4_PAD, display: "flex", zIndex: 10, height: C4_CELL }}>
          {Array(C4_COLS).fill(null).map((_, c) => {
            const isHover = hoverCol === c && !result && !animating && !isCpuTurn && mode !== "cpu-cpu";
            const canDrop = c4GetRow(board, c) !== -1;
            return (
              <div key={c} style={{ width: C4_CELL, height: C4_CELL, display: "flex", alignItems: "center", justifyContent: "center", cursor: canDrop && !result && !isCpuTurn && mode !== "cpu-cpu" ? "pointer" : "default" }}
                onMouseEnter={() => setHoverCol(c)} onMouseLeave={() => setHoverCol(null)} onClick={() => handleColClick(c)}>
                {isHover && canDrop && !dropping && (
                  <div style={{ width: C4_CELL - 16, height: C4_CELL - 16, borderRadius: "50%", background: currentMark === "R" ? C4_COLORS.R.fill : C4_COLORS.Y.fill, opacity: 0.5, boxShadow: `0 0 12px ${currentMark === "R" ? C4_COLORS.R.glow : C4_COLORS.Y.glow}` }} />
                )}
              </div>
            );
          })}
        </div>
        {dropping && dropY !== null && (
          <div style={{ position: "absolute", left: C4_PAD + dropping.col * C4_CELL + 8, top: dropY + 8, width: C4_CELL - 16, height: C4_CELL - 16, borderRadius: "50%", background: C4_COLORS[dropping.mark].fill, boxShadow: `0 0 16px ${C4_COLORS[dropping.mark].glow}, inset 0 -4px 8px rgba(0,0,0,0.3)`, zIndex: 20, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "15%", left: "20%", width: "30%", height: "20%", borderRadius: "50%", background: C4_COLORS[dropping.mark].shine, opacity: 0.6 }} />
          </div>
        )}
        <svg width={boardW} height={boardH} style={{ display: "block", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.6))" }} onMouseLeave={() => setHoverCol(null)}>
          <rect x={0} y={0} width={boardW} height={boardH} rx={12} ry={12} fill="#0f1e38" />
          {hoverCol !== null && !result && !animating && !isCpuTurn && mode !== "cpu-cpu" && (
            <rect x={C4_PAD + hoverCol * C4_CELL} y={C4_PAD} width={C4_CELL} height={C4_ROWS * C4_CELL} fill="rgba(255,255,255,0.03)" rx={4} />
          )}
          {Array(C4_ROWS).fill(null).map((_, r) =>
            Array(C4_COLS).fill(null).map((_, c) => {
              const val = board[r][c];
              const isWin = winCells.has(`${r},${c}`);
              const isDropping = dropping && dropping.col === c && dropping.row === r;
              const cx = C4_PAD + c * C4_CELL + C4_CELL / 2;
              const cy = C4_PAD + r * C4_CELL + C4_CELL / 2;
              const radius = C4_CELL / 2 - 8;
              return (
                <g key={`${r},${c}`} onClick={() => handleColClick(c)} onMouseEnter={() => setHoverCol(c)} style={{ cursor: !result && !isCpuTurn && mode !== "cpu-cpu" ? "pointer" : "default" }}>
                  <circle cx={cx} cy={cy} r={radius + 2} fill="#080c14" />
                  {val && !isDropping && (
                    <g>
                      <circle cx={cx} cy={cy} r={radius} fill={C4_COLORS[val].fill} opacity={isWin ? 1 : 0.9} />
                      {isWin && (
                        <circle cx={cx} cy={cy} r={radius + 3} fill="none" stroke={C4_COLORS[val].fill} strokeWidth={2} opacity={0.8}>
                          <animate attributeName="r" values={`${radius+2};${radius+6};${radius+2}`} dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <ellipse cx={cx - radius * 0.2} cy={cy - radius * 0.25} rx={radius * 0.35} ry={radius * 0.22} fill={C4_COLORS[val].shine} opacity={0.5} />
                    </g>
                  )}
                  {!val && <circle cx={cx} cy={cy} r={radius} fill="#06101e" />}
                </g>
              );
            })
          )}
          {Array(C4_COLS + 1).fill(null).map((_, i) => <line key={`v${i}`} x1={C4_PAD + i * C4_CELL} y1={C4_PAD} x2={C4_PAD + i * C4_CELL} y2={boardH - C4_PAD} stroke="#0a1828" strokeWidth={1} opacity={0.5} />)}
          {Array(C4_ROWS + 1).fill(null).map((_, i) => <line key={`h${i}`} x1={C4_PAD} y1={C4_PAD + i * C4_CELL} x2={boardW - C4_PAD} y2={C4_PAD + i * C4_CELL} stroke="#0a1828" strokeWidth={1} opacity={0.5} />)}
        </svg>
        <div style={{ position: "absolute", top: C4_PAD, left: C4_PAD, display: "flex", height: C4_ROWS * C4_CELL, zIndex: 5 }}>
          {Array(C4_COLS).fill(null).map((_, c) => (
            <div key={c} style={{ width: C4_CELL, height: "100%", cursor: !result && !isCpuTurn && mode !== "cpu-cpu" && c4GetRow(board,c) !== -1 ? "pointer" : "default" }}
              onClick={() => handleColClick(c)} onMouseEnter={() => setHoverCol(c)} onMouseLeave={() => setHoverCol(null)} />
          ))}
        </div>
      </div>
      <button onClick={handleNewGame} style={{
        background: "transparent", border: "2px solid #cfe2f5", color: "#fff",
        padding: "8px 20px", fontSize: "10px", letterSpacing: "0.3em",
        textTransform: "uppercase", cursor: "pointer", borderRadius: "3px", fontWeight: "bold",
        fontFamily: "'Courier New', monospace", transition: "all 0.2s"
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#cfe2f5"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#8ab0d0"; e.currentTarget.style.color = "#cfe2f5"; }}
      >New Game</button>
      <div style={{ marginTop: "14px", fontSize: "10px", color: "#7090c0", letterSpacing: "0.15em" }}>
        {rLabel} = RED &nbsp;·&nbsp; {yLabel} = YELLOW
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOTS AND BOXES
// ═══════════════════════════════════════════════════════════════════════════════

const DAB_SIZES = [4, 6, 8];
const DAB_P1 = "#e05252";
const DAB_P2 = "#4a9eed";
const DAB_DOT = "#c8b89a";
const DAB_HOVER = "#888";
const DAB_CELL = 40;
const DAB_MARGIN = 24;
const DAB_DOT_R = 4;

function dab_makeState(N) {
  return {
    h: Array(N + 1).fill(null).map(() => Array(N).fill(false)),
    v: Array(N).fill(null).map(() => Array(N + 1).fill(false)),
    boxes: Array(N).fill(null).map(() => Array(N).fill(null)),
    turn: "P1", scores: { P1: 0, P2: 0 }, done: false, lastMove: null,
  };
}

function dab_clone(s) {
  return {
    h: s.h.map(r => [...r]), v: s.v.map(r => [...r]),
    boxes: s.boxes.map(r => [...r]),
    turn: s.turn, scores: { ...s.scores }, done: s.done, lastMove: s.lastMove,
  };
}

function dab_checkBoxes(h, v, N) {
  const closed = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (h[r][c] && h[r+1][c] && v[r][c] && v[r][c+1]) closed.push([r, c]);
  return closed;
}

function dab_apply(state, move, N) {
  const s = dab_clone(state);
  const { type, r, c } = move;
  s.lastMove = { ...move, player: s.turn };
  if (type === "h") s.h[r][c] = true; else s.v[r][c] = true;
  const allClosed = dab_checkBoxes(s.h, s.v, N);
  let newlyClosed = 0;
  for (const [br, bc] of allClosed) {
    if (!s.boxes[br][bc]) { s.boxes[br][bc] = s.turn; s.scores[s.turn]++; newlyClosed++; }
  }
  if (newlyClosed === 0) s.turn = s.turn === "P1" ? "P2" : "P1";
  if (s.scores.P1 + s.scores.P2 === N * N) s.done = true;
  return s;
}

function dab_legal(state, N) {
  const moves = [];
  for (let r = 0; r <= N; r++) for (let c = 0; c < N; c++) if (!state.h[r][c]) moves.push({ type: "h", r, c });
  for (let r = 0; r < N; r++) for (let c = 0; c <= N; c++) if (!state.v[r][c]) moves.push({ type: "v", r, c });
  return moves;
}

function dab_boxEdges(h, v, r, c) {
  return (h[r][c]?1:0)+(h[r+1][c]?1:0)+(v[r][c]?1:0)+(v[r][c+1]?1:0);
}

function dab_heuristic(state, N, mark) {
  const opp = mark === "P1" ? "P2" : "P1";
  let score = (state.scores[mark] - state.scores[opp]) * 100;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (state.boxes[r][c]) continue;
    const e = dab_boxEdges(state.h, state.v, r, c);
    if (e === 3) score += state.turn === mark ? 2 : -8;
    if (e === 2) score -= 1;
    if (e <= 1) { const dr = Math.abs(r-(N-1)/2), dc = Math.abs(c-(N-1)/2); score += (N-dr-dc)*0.05; }
  }
  score += Math.random() * 0.4 - 0.2;
  return score;
}

function dab_classify(state, N) {
  const moves = dab_legal(state, N);
  const wins = [], safe = [], risky = [];
  for (const m of moves) {
    const next = dab_apply(state, m, N);
    const gained = next.scores[state.turn] - state.scores[state.turn];
    if (gained > 0) { wins.push(m); continue; }
    let gifts = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
      if (!next.boxes[r][c] && dab_boxEdges(next.h, next.v, r, c) === 3) gifts++;
    if (gifts > 0) risky.push(m); else safe.push(m);
  }
  return { wins, safe, risky };
}

function dab_minimax(state, N, mark, depth, alpha, beta) {
  if (state.done) return (state.scores[mark] - state.scores[mark === "P1" ? "P2" : "P1"]) * 100;
  if (depth === 0) return dab_heuristic(state, N, mark);
  const moves = dab_legal(state, N);
  if (!moves.length) return dab_heuristic(state, N, mark);
  const isMyTurn = state.turn === mark;
  if (isMyTurn) {
    let best = -Infinity;
    for (const m of moves) {
      const score = dab_minimax(dab_apply(state, m, N), N, mark, depth-1, alpha, beta);
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const score = dab_minimax(dab_apply(state, m, N), N, mark, depth-1, alpha, beta);
      if (score < best) best = score;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
    return best;
  }
}

const DAB_BUDGET = { easy: 0, medium: 0, hard: 3000, impossible: 6000 };

function dab_shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function dab_bestAmong(scored) {
  const best = Math.max(...scored.map(x => x.score));
  const tied = scored.filter(x => x.score === best);
  return tied[Math.floor(Math.random() * tied.length)].move;
}

function dab_getCpuMove(state, N, mark, difficulty) {
  const moves = dab_legal(state, N);
  if (!moves.length) return null;
  if (difficulty === "easy") {
    if (Math.random() < 0.5) return moves[Math.floor(Math.random()*moves.length)];
    const { wins } = dab_classify(state, N);
    return wins.length ? wins[Math.floor(Math.random()*wins.length)] : moves[Math.floor(Math.random()*moves.length)];
  }
  if (difficulty === "medium") {
    const { wins, safe, risky } = dab_classify(state, N);
    if (wins.length) return wins[Math.floor(Math.random()*wins.length)];
    if (safe.length) return dab_shuffle(safe)[0];
    if (risky.length) return dab_bestAmong(risky.map(m => ({ move: m, score: dab_heuristic(dab_apply(state,m,N), N, mark) })));
    return moves[Math.floor(Math.random()*moves.length)];
  }
  const deadline = performance.now() + DAB_BUDGET[difficulty];
  const { wins, safe, risky } = dab_classify(state, N);
  if (wins.length) return dab_bestAmong(wins.map(m => ({ move: m, score: dab_minimax(dab_apply(state,m,N), N, mark, 1, -Infinity, Infinity) })));
  const candidates = dab_shuffle(safe.length ? safe : risky.length ? risky : moves);
  let bestMove = dab_bestAmong(candidates.map(m => ({ move: m, score: dab_minimax(dab_apply(state,m,N), N, mark, 1, -Infinity, Infinity) })));
  for (let depth = 2; depth <= 12; depth++) {
    if (performance.now() >= deadline) break;
    const scored = []; let timedOut = false;
    for (const m of candidates) {
      if (performance.now() >= deadline) { timedOut = true; break; }
      scored.push({ move: m, score: dab_minimax(dab_apply(state,m,N), N, mark, depth, -Infinity, Infinity) });
    }
    if (!timedOut) bestMove = dab_bestAmong(scored);
  }
  return bestMove;
}

function DotsAndBoxes({ onBack }) {
  const [N, setN] = useState(4);
  const [mode, setMode] = useState("vs-cpu");
  const [difficulty, setDifficulty] = useState("hard");
  const [gameState, setGameState] = useState(() => dab_makeState(4));
  const [hover, setHover] = useState(null);
  const [matchScores, setMatchScores] = useState({ P1: 0, P2: 0 });
  const [thinking, setThinking] = useState(false);
  const thinkStartRef = useRef(null);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const isCpuTurn = !gameState.done && (mode === "cpu-cpu" || (mode === "vs-cpu" && gameState.turn === "P2"));

  useEffect(() => {
    if (!isCpuTurn) return;
    setThinking(true);
    thinkStartRef.current = performance.now();
    const t = setTimeout(() => {
      requestAnimationFrame(() => setTimeout(() => {
        const s = stateRef.current;
        const move = dab_getCpuMove(s, N, s.turn, difficulty);
        setThinking(false);
        if (move) setGameState(dab_apply(s, move, N));
      }, 0));
    }, 50);
    return () => { clearTimeout(t); setThinking(false); };
  }, [gameState, isCpuTurn, N, difficulty, mode]);

  useEffect(() => {
    if (gameState.done) {
      const { P1, P2 } = gameState.scores;
      if (P1 > P2) setMatchScores(s => ({ ...s, P1: s.P1+1 }));
      else if (P2 > P1) setMatchScores(s => ({ ...s, P2: s.P2+1 }));
    }
  }, [gameState.done]);

  function handleEdgeClick(type, r, c) {
    if (isCpuTurn || gameState.done || mode === "cpu-cpu") return;
    const edge = type === "h" ? gameState.h[r][c] : gameState.v[r][c];
    if (edge) return;
    setGameState(dab_apply(gameState, { type, r, c }, N));
  }

  function newGame() { setGameState(dab_makeState(N)); setHover(null); }
  function changeN(n) { setN(n); setGameState(dab_makeState(n)); setMatchScores({ P1: 0, P2: 0 }); setHover(null); }
  function changeMode(m) { setMode(m); setGameState(dab_makeState(N)); setMatchScores({ P1: 0, P2: 0 }); setHover(null); }

  const p1Label = mode === "vs-human" ? "P1" : mode === "cpu-cpu" ? "CPU 1" : "PLAYER";
  const p2Label = mode === "vs-human" ? "P2" : mode === "cpu-cpu" ? "CPU 2" : "CPU";
  const winner = gameState.done ? (gameState.scores.P1 > gameState.scores.P2 ? "P1" : gameState.scores.P2 > gameState.scores.P1 ? "P2" : "draw") : null;
  const statusText = gameState.done ? (winner === "draw" ? "Draw!" : `${winner === "P1" ? p1Label : p2Label} wins!`) : `${gameState.turn === "P1" ? p1Label : p2Label}'s turn`;
  const statusColor = gameState.done ? (winner === "draw" ? "#888" : winner === "P1" ? DAB_P1 : DAB_P2) : gameState.turn === "P1" ? DAB_P1 : DAB_P2;
  const svgW = N * DAB_CELL + DAB_MARGIN * 2;
  const svgH = N * DAB_CELL + DAB_MARGIN * 2;
  const dx = c => DAB_MARGIN + c * DAB_CELL;
  const dy = r => DAB_MARGIN + r * DAB_CELL;
  const HIT = 10;

  return (
    <div style={{ minHeight: "100vh", background: "#111009", maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", color: "#d4c9b0", padding: "16px", userSelect: "none", position: "relative" }}>
      <BackButton onBack={onBack} />
      <AwryCredit />
      <div style={{ fontSize: "10px", letterSpacing: "0.5em", color: "#5a5040", textTransform: "uppercase", marginBottom: "4px" }}>Dots & Boxes</div>
      <div style={{ fontSize: "9px", color: "#3a3028", letterSpacing: "0.2em", marginBottom: "10px" }}>Édouard Lucas · 1889</div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "7px" }}>
        {MODES.map(m => (
          <button key={m} onClick={() => changeMode(m)} style={{ background: mode===m?"#d4c9b0":"transparent", border:`2px solid ${mode===m?"#d4c9b0":"#a09280"}`, color:mode===m?"#111009":"#e8dcc0", padding:"4px 9px", fontSize:"8px", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", borderRadius:"2px", fontFamily:"'Courier New', monospace", fontWeight:"bold" }}>{MODE_LABELS[m]}</button>
        ))}
      </div>

      {mode !== "vs-human"
        ? <div style={{ display: "flex", gap: "4px", marginBottom: "7px" }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => { setDifficulty(d); newGame(); }} style={{ background:difficulty===d?DIFF_COLORS[d]:"transparent", border:`2px solid ${difficulty===d?DIFF_COLORS[d]:"#a09280"}`, color:difficulty===d?"#111009":"#e8dcc0", padding:"3px 7px", fontSize:"8px", letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", borderRadius:"2px", fontFamily:"'Courier New', monospace", fontWeight:"bold" }}>{DIFF_LABELS[d]}</button>
            ))}
          </div>
        : <div style={{ height: "21px", marginBottom: "7px" }} />}

      <div style={{ display: "flex", gap: "5px", marginBottom: "26px", alignItems: "center" }}>
        <span style={{ fontSize: "8px", color: "#a89880", letterSpacing: "0.2em", marginRight: "4px" }}>GRID</span>
        {DAB_SIZES.map(s => (
          <button key={s} onClick={() => changeN(s)} style={{ background:N===s?"#8a7a60":"transparent", border:`2px solid ${N===s?"#8a7a60":"#a09280"}`, color:N===s?"#111009":"#e8dcc0", padding:"3px 8px", fontSize:"8px", letterSpacing:"0.1em", cursor:"pointer", borderRadius:"2px", fontFamily:"'Courier New', monospace", fontWeight:"bold" }}>{s}×{s}</button>
        ))}
      </div>

      <div style={{ fontSize: "16px", fontWeight: "bold", color: statusColor, marginBottom: "4px", minHeight: "22px", letterSpacing: "0.05em" }}>
        {thinking ? <span style={{ color: "#8a7a60" }}>Thinking…</span> : statusText}
      </div>

      <div style={{ display: "flex", gap: "32px", marginBottom: "10px" }}>
        {[[p1Label,"P1",DAB_P1],["DRAW","draw","#5a5040"],[p2Label,"P2",DAB_P2]].map(([label,key,color]) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "8px", color: "#4a4030", letterSpacing: "0.2em", marginBottom: "2px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color }}>{key==="draw"?0:gameState.scores[key]}</div>
            {key !== "draw" && <div style={{ fontSize: "8px", color: "#3a3028", marginTop: "1px" }}>{matchScores[key]}W</div>}
          </div>
        ))}
      </div>

      <svg width={svgW} height={svgH} style={{ display: "block", overflow: "visible" }} onMouseLeave={() => setHover(null)}>
        {Array(N).fill(null).map((_,r) => Array(N).fill(null).map((_,c) => {
          const owner = gameState.boxes[r][c];
          if (!owner) return null;
          return <rect key={`box-${r}-${c}`} x={dx(c)+1} y={dy(r)+1} width={DAB_CELL-2} height={DAB_CELL-2} fill={owner==="P1"?`${DAB_P1}30`:`${DAB_P2}30`} />;
        }))}

        {Array(N+1).fill(null).map((_,r) => Array(N).fill(null).map((_,c) => {
          const placed = gameState.h[r][c];
          const isLast = gameState.lastMove?.type==="h" && gameState.lastMove.r===r && gameState.lastMove.c===c;
          const isHover = hover?.type==="h" && hover.r===r && hover.c===c;
          const x1=dx(c)+DAB_DOT_R+2, x2=dx(c+1)-DAB_DOT_R-2, y=dy(r);
          const canClick = !placed && !isCpuTurn && !gameState.done && mode!=="cpu-cpu";
          const lastMover = gameState.lastMove?.player;
          return (
            <g key={`h-${r}-${c}`}>
              <rect x={x1} y={y-HIT} width={x2-x1} height={HIT*2} fill="transparent" style={{cursor:canClick?"pointer":"default"}} onMouseEnter={()=>canClick&&setHover({type:"h",r,c})} onMouseLeave={()=>setHover(null)} onClick={()=>handleEdgeClick("h",r,c)} />
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={placed?(isLast?(lastMover==="P1"?DAB_P1:DAB_P2):"#5a5248"):isHover?DAB_HOVER:"#2a2518"} strokeWidth={placed?(isLast?3.5:2.5):isHover?2:1.5} strokeLinecap="round" style={{pointerEvents:"none",transition:"stroke 0.1s"}} />
            </g>
          );
        }))}

        {Array(N).fill(null).map((_,r) => Array(N+1).fill(null).map((_,c) => {
          const placed = gameState.v[r][c];
          const isLast = gameState.lastMove?.type==="v" && gameState.lastMove.r===r && gameState.lastMove.c===c;
          const isHover = hover?.type==="v" && hover.r===r && hover.c===c;
          const x=dx(c), y1=dy(r)+DAB_DOT_R+2, y2=dy(r+1)-DAB_DOT_R-2;
          const canClick = !placed && !isCpuTurn && !gameState.done && mode!=="cpu-cpu";
          const lastMover = gameState.lastMove?.player;
          return (
            <g key={`v-${r}-${c}`}>
              <rect x={x-HIT} y={y1} width={HIT*2} height={y2-y1} fill="transparent" style={{cursor:canClick?"pointer":"default"}} onMouseEnter={()=>canClick&&setHover({type:"v",r,c})} onMouseLeave={()=>setHover(null)} onClick={()=>handleEdgeClick("v",r,c)} />
              <line x1={x} y1={y1} x2={x} y2={y2} stroke={placed?(isLast?(lastMover==="P1"?DAB_P1:DAB_P2):"#5a5248"):isHover?DAB_HOVER:"#2a2518"} strokeWidth={placed?(isLast?3.5:2.5):isHover?2:1.5} strokeLinecap="round" style={{pointerEvents:"none",transition:"stroke 0.1s"}} />
            </g>
          );
        }))}

        {Array(N).fill(null).map((_,r) => Array(N).fill(null).map((_,c) => {
          const owner = gameState.boxes[r][c];
          if (!owner) return null;
          const label = owner==="P1"?(mode==="vs-human"?"1":mode==="cpu-cpu"?"1":"P"):(mode==="vs-human"?"2":mode==="cpu-cpu"?"2":"C");
          return <text key={`lbl-${r}-${c}`} x={dx(c)+DAB_CELL/2} y={dy(r)+DAB_CELL/2+4} textAnchor="middle" fontSize={13} fontFamily="'Courier New', monospace" fontWeight="bold" fill={owner==="P1"?DAB_P1:DAB_P2} opacity={0.7} style={{pointerEvents:"none"}}>{label}</text>;
        }))}

        {Array(N+1).fill(null).map((_,r) => Array(N+1).fill(null).map((_,c) => (
          <circle key={`dot-${r}-${c}`} cx={dx(c)} cy={dy(r)} r={DAB_DOT_R} fill={DAB_DOT} style={{pointerEvents:"none"}} />
        )))}
      </svg>

      <button onClick={newGame} style={{ marginTop:"16px", background:"transparent", border:"1px solid #c8b89a", color:"#e8dcc0", padding:"8px 22px", fontSize:"10px", letterSpacing:"0.3em", textTransform:"uppercase", cursor:"pointer", borderRadius:"2px", fontWeight:"bold", fontFamily:"'Courier New', monospace", transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="#fff";e.currentTarget.style.color="#fff";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="#c8b89a";e.currentTarget.style.color="#e8dcc0";}}>New Game</button>
      <div style={{ marginTop:"10px", fontSize:"8px", color:"#2a2018", letterSpacing:"0.15em" }}>{p1Label} = RED &nbsp;·&nbsp; {p2Label} = BLUE</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GO (囲棋)
// ═══════════════════════════════════════════════════════════════════════════════

const GO_DIFFICULTIES = ["easy", "medium", "hard"];
const GO_SIZES = [5, 7, 9];

const GO_BLACK = "B";
const GO_WHITE = "W";
const GO_EMPTY = null;

const GO_B_COLOR = "#1a1008";
const GO_W_COLOR = "#f0e8d0";
const GO_BOARD_BG = "#c8a96e";
const GO_LINE_CLR = "#8a6a30";

function go_makeBoard(N) {
  return Array(N).fill(null).map(() => Array(N).fill(GO_EMPTY));
}

function go_boardKey(board) {
  return board.map(r => r.map(c => c || ".").join("")).join("|");
}

function go_cloneBoard(board) {
  return board.map(r => [...r]);
}

function go_neighbors(r, c, N) {
  const result = [];
  if (r > 0) result.push([r-1, c]);
  if (r < N-1) result.push([r+1, c]);
  if (c > 0) result.push([r, c-1]);
  if (c < N-1) result.push([r, c+1]);
  return result;
}

function go_getGroup(board, r, c, N) {
  const color = board[r][c];
  if (!color) return null;
  const group = new Set();
  const liberties = new Set();
  const queue = [[r, c]];
  const visited = new Set([`${r},${c}`]);
  while (queue.length) {
    const [cr, cc] = queue.shift();
    group.add(`${cr},${cc}`);
    for (const [nr, nc] of go_neighbors(cr, cc, N)) {
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (board[nr][nc] === color) queue.push([nr, nc]);
      else if (board[nr][nc] === GO_EMPTY) liberties.add(key);
    }
  }
  return { group, liberties };
}

function go_removeGroup(board, group) {
  let count = 0;
  for (const key of group) {
    const [r, c] = key.split(",").map(Number);
    board[r][c] = GO_EMPTY;
    count++;
  }
  return count;
}

// Ko-rule history is a Set kept in component state. If serialization is added later,
// convert to Array on save and rebuild the Set on load.
function go_tryPlace(board, r, c, color, N, history) {
  if (board[r][c] !== GO_EMPTY) return { valid: false };
  const b = go_cloneBoard(board);
  b[r][c] = color;
  const opp = color === GO_BLACK ? GO_WHITE : GO_BLACK;
  let captured = 0;

  const checked = new Set();
  for (const [nr, nc] of go_neighbors(r, c, N)) {
    if (b[nr][nc] !== opp) continue;
    const key = `${nr},${nc}`;
    if (checked.has(key)) continue;
    const g = go_getGroup(b, nr, nc, N);
    if (!g) continue;
    for (const k of g.group) checked.add(k);
    if (g.liberties.size === 0) captured += go_removeGroup(b, g.group);
  }

  const ownGroup = go_getGroup(b, r, c, N);
  if (ownGroup && ownGroup.liberties.size === 0) return { valid: false };

  const key = go_boardKey(b);
  if (history.has(key)) return { valid: false };

  return { valid: true, board: b, captured };
}

function go_scoreBoard(board, N, komi = 6.5) {
  let bScore = 0, wScore = komi;
  const visited = Array(N).fill(null).map(() => Array(N).fill(false));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] === GO_BLACK) { bScore++; continue; }
      if (board[r][c] === GO_WHITE) { wScore++; continue; }
      if (visited[r][c]) continue;
      const region = [];
      const queue = [[r, c]];
      visited[r][c] = true;
      let touchB = false, touchW = false;
      while (queue.length) {
        const [cr, cc] = queue.shift();
        region.push([cr, cc]);
        for (const [nr, nc] of go_neighbors(cr, cc, N)) {
          if (board[nr][nc] === GO_BLACK) { touchB = true; continue; }
          if (board[nr][nc] === GO_WHITE) { touchW = true; continue; }
          if (!visited[nr][nc]) { visited[nr][nc] = true; queue.push([nr, nc]); }
        }
      }
      if (touchB && !touchW) bScore += region.length;
      if (touchW && !touchB) wScore += region.length;
    }
  }
  return { bScore, wScore };
}

function go_randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function go_heuristicScore(board, N, color) {
  let score = 0;
  const center = (N - 1) / 2;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] === GO_EMPTY) continue;
      const isOurs = board[r][c] === color;
      const sign = isOurs ? 1 : -1;
      const dist = Math.abs(r - center) + Math.abs(c - center);
      score += sign * (N - dist) * 0.3;
      const g = go_getGroup(board, r, c, N);
      if (g) score += sign * g.liberties.size * 0.5;
    }
  }
  const { bScore, wScore } = go_scoreBoard(board, N);
  score += color === GO_BLACK ? (bScore - wScore) * 2 : (wScore - bScore) * 2;
  return score;
}

function go_validMoves(board, N, color, history) {
  const moves = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const result = go_tryPlace(board, r, c, color, N, history);
      if (result.valid) moves.push({ r, c, ...result });
    }
  return moves;
}

function go_isSelfAtari(board, r, c, color, N) {
  const b = go_cloneBoard(board);
  b[r][c] = color;
  const opp = color === GO_BLACK ? GO_WHITE : GO_BLACK;
  for (const [nr, nc] of go_neighbors(r, c, N)) {
    if (b[nr][nc] !== opp) continue;
    const g = go_getGroup(b, nr, nc, N);
    if (g && g.liberties.size === 0) go_removeGroup(b, g.group);
  }
  const g = go_getGroup(b, r, c, N);
  return g && g.liberties.size === 1;
}

function go_isOwnTerritory(board, r, c, color, N) {
  if (board[r][c] !== GO_EMPTY) return false;
  const queue = [[r, c]];
  const visited = new Set([`${r},${c}`]);
  let touchOpp = false;
  while (queue.length) {
    const [cr, cc] = queue.shift();
    for (const [nr, nc] of go_neighbors(cr, cc, N)) {
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (board[nr][nc] === GO_EMPTY) queue.push([nr, nc]);
      else if (board[nr][nc] !== color) { touchOpp = true; break; }
    }
    if (touchOpp) break;
  }
  return !touchOpp;
}

function go_findCaptures(board, N, color, history) {
  const caps = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const result = go_tryPlace(board, r, c, color, N, history);
      if (!result.valid) continue;
      if (result.captured > 0) caps.push({ r, c, captured: result.captured, board: result.board });
    }
  }
  return caps;
}

function go_findAtariEscapes(board, N, color, history) {
  const escapes = [];
  const visited = new Set();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] !== color) continue;
      const g = go_getGroup(board, r, c, N);
      if (!g || g.liberties.size !== 1) continue;
      for (const libKey of g.liberties) {
        if (visited.has(libKey)) continue;
        visited.add(libKey);
        const [lr, lc] = libKey.split(",").map(Number);
        const result = go_tryPlace(board, lr, lc, color, N, history);
        if (!result.valid) continue;
        const newG = go_getGroup(result.board, lr, lc, N);
        if (newG && newG.liberties.size > 1) escapes.push({ r: lr, c: lc, board: result.board });
      }
    }
  }
  return escapes;
}

function go_shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function go_getBestMoves(moves, board, N, color) {
  return go_shuffle(moves)
    .map(m => ({ ...m, score: go_heuristicScore(m.board, N, color) + Math.random() * 0.5 }))
    .sort((a, b) => b.score - a.score);
}

function go_shouldPass(board, N, color, history) {
  const totalStones = board.flat().filter(v => v !== GO_EMPTY).length;
  if (totalStones < N * 2) return false;
  const caps = go_findCaptures(board, N, color, history);
  if (caps.length) return false;
  const visited = Array(N).fill(null).map(() => Array(N).fill(false));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] !== GO_EMPTY || visited[r][c]) continue;
      const queue = [[r, c]];
      visited[r][c] = true;
      let touchOwn = false, touchOpp = false;
      while (queue.length) {
        const [cr, cc] = queue.shift();
        for (const [nr, nc] of go_neighbors(cr, cc, N)) {
          if (visited[nr][nc]) continue;
          if (board[nr][nc] === GO_EMPTY) { visited[nr][nc] = true; queue.push([nr, nc]); }
          else if (board[nr][nc] === color) touchOwn = true;
          else touchOpp = true;
        }
      }
      if ((touchOwn && touchOpp) || (!touchOwn && !touchOpp)) return false;
    }
  }
  return true;
}

function go_getCpuMove(board, N, color, history, difficulty) {
  if (go_shouldPass(board, N, color, history)) return null;
  const allMoves = go_shuffle(go_validMoves(board, N, color, history));
  if (!allMoves.length) return null;
  const filterBad = moves => moves.filter(m =>
    !go_isSelfAtari(board, m.r, m.c, color, N) &&
    !go_isOwnTerritory(board, m.r, m.c, color, N)
  );
  if (difficulty === "easy") {
    const safe = filterBad(allMoves);
    return go_randomChoice(safe.length ? safe : allMoves);
  }
  if (difficulty === "medium") {
    const caps = go_shuffle(go_findCaptures(board, N, color, history));
    if (caps.length) return go_randomChoice(caps);
    const escapes = go_shuffle(go_findAtariEscapes(board, N, color, history));
    if (escapes.length) return go_randomChoice(escapes);
    const safe = filterBad(allMoves);
    const pool = safe.length ? safe : allMoves;
    const ranked = go_getBestMoves(pool, board, N, color);
    return go_randomChoice(ranked.slice(0, Math.min(3, ranked.length)));
  }
  if (difficulty === "hard") {
    const caps = go_shuffle(go_findCaptures(board, N, color, history));
    if (caps.length) {
      const maxCap = Math.max(...caps.map(c => c.captured));
      return go_randomChoice(caps.filter(c => c.captured === maxCap));
    }
    const escapes = go_shuffle(go_findAtariEscapes(board, N, color, history));
    if (escapes.length) {
      const ranked = go_getBestMoves(escapes, board, N, color);
      return go_randomChoice(ranked.slice(0, Math.min(2, ranked.length)));
    }
    const safe = filterBad(allMoves);
    const pool = safe.length ? safe : allMoves;
    const ranked = go_getBestMoves(pool, board, N, color);
    return go_randomChoice(ranked.slice(0, Math.min(2, ranked.length)));
  }
  return go_randomChoice(allMoves);
}

const GO_CELL = 38;
const GO_MARGIN = 28;
const GO_STONE_R = 15;

function go_makeGameState(N) {
  return {
    board: go_makeBoard(N),
    turn: GO_BLACK,
    history: new Set(),
    captured: { B: 0, W: 0 },
    passes: 0,
    done: false,
    lastMove: null,
  };
}

function GoGame({ onBack }) {
  const [N, setN] = useState(9);
  const [mode, setMode] = useState("vs-cpu");
  const [difficulty, setDifficulty] = useState("hard");
  const [gs, setGs] = useState(() => go_makeGameState(9));
  const [hover, setHover] = useState(null);
  const [matchScores, setMatchScores] = useState({ B: 0, W: 0 });
  const [thinking, setThinking] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const gsRef = useRef(gs);
  gsRef.current = gs;
  const thinkRef = useRef(null);

  const isCpuTurn = !gs.done && (
    mode === "cpu-cpu" ||
    (mode === "vs-cpu" && gs.turn === GO_WHITE)
  );

  useEffect(() => {
    if (!isCpuTurn) return;
    setThinking(true);
    const t = setTimeout(() => {
      requestAnimationFrame(() => setTimeout(() => {
        const s = gsRef.current;
        const move = go_getCpuMove(s.board, N, s.turn, s.history, difficulty);
        setThinking(false);
        applyPlayerMove(s, move);
      }, 0));
    }, mode === "cpu-cpu" ? 300 : 200);
    thinkRef.current = t;
    return () => { clearTimeout(thinkRef.current); setThinking(false); };
  }, [gs, isCpuTurn, N, difficulty, mode]);

  useEffect(() => {
    if (gs.done) {
      const { bScore, wScore } = go_scoreBoard(gs.board, N);
      if (bScore > wScore) setMatchScores(s => ({ ...s, B: s.B + 1 }));
      else if (wScore > bScore) setMatchScores(s => ({ ...s, W: s.W + 1 }));
      setShowScore(true);
    }
  }, [gs.done]);

  function applyPlayerMove(state, move) {
    if (state.done) return;
    if (!move) {
      const newPasses = state.passes + 1;
      const done = newPasses >= 2;
      setGs({
        ...state,
        turn: state.turn === GO_BLACK ? GO_WHITE : GO_BLACK,
        passes: newPasses,
        done,
        lastMove: "pass",
      });
      return;
    }
    const result = go_tryPlace(state.board, move.r, move.c, state.turn, N, state.history);
    if (!result.valid) return;
    const newHistory = new Set(state.history);
    newHistory.add(go_boardKey(result.board));
    const newCaptured = { ...state.captured };
    newCaptured[state.turn === GO_BLACK ? GO_WHITE : GO_BLACK] =
      (newCaptured[state.turn === GO_BLACK ? GO_WHITE : GO_BLACK] || 0) + (result.captured || 0);
    setGs({
      board: result.board,
      turn: state.turn === GO_BLACK ? GO_WHITE : GO_BLACK,
      history: newHistory,
      captured: newCaptured,
      passes: 0,
      done: false,
      lastMove: { r: move.r, c: move.c, color: state.turn },
    });
  }

  function handleIntersectionClick(r, c) {
    if (isCpuTurn || gs.done || mode === "cpu-cpu") return;
    applyPlayerMove(gs, { r, c });
  }

  function handlePass() {
    if (isCpuTurn || gs.done || mode === "cpu-cpu") return;
    applyPlayerMove(gs, null);
  }

  function newGame() { setGs(go_makeGameState(N)); setShowScore(false); }
  function changeN(n) { setN(n); setGs(go_makeGameState(n)); setMatchScores({ B: 0, W: 0 }); setShowScore(false); }
  function changeMode(m) { setMode(m); setGs(go_makeGameState(N)); setMatchScores({ B: 0, W: 0 }); setShowScore(false); }

  const bLabel = mode === "vs-human" ? "P1" : mode === "cpu-cpu" ? "CPU 1" : "PLAYER";
  const wLabel = mode === "vs-human" ? "P2" : mode === "cpu-cpu" ? "CPU 2" : "CPU";

  const { bScore, wScore } = gs.done || showScore ? go_scoreBoard(gs.board, N) : { bScore: 0, wScore: 0 };
  const winner = gs.done ? (bScore > wScore ? "B" : "W") : null;

  const statusText = gs.done
    ? `${winner === "B" ? bLabel : wLabel} wins! (${winner === "B" ? bScore.toFixed(1) : wScore.toFixed(1)} – ${winner === "B" ? wScore.toFixed(1) : bScore.toFixed(1)})`
    : gs.lastMove === "pass"
    ? `${gs.turn === GO_BLACK ? bLabel : wLabel}'s turn (opponent passed)`
    : `${gs.turn === GO_BLACK ? bLabel : wLabel}'s turn`;

  const statusColor = gs.done
    ? winner === "B" ? "#c8b89a" : "#e8dcc0"
    : gs.turn === GO_BLACK ? "#c8b89a" : "#e8dcc0";

  const svgW = (N - 1) * GO_CELL + GO_MARGIN * 2;
  const svgH = (N - 1) * GO_CELL + GO_MARGIN * 2;
  const px = c => GO_MARGIN + c * GO_CELL;
  const py = r => GO_MARGIN + r * GO_CELL;

  function starPoints(N) {
    if (N === 9) return [[2,2],[2,6],[6,2],[6,6],[4,4]];
    if (N === 7) return [[2,2],[2,4],[4,2],[4,4],[3,3]];
    if (N === 5) return [[1,1],[1,3],[3,1],[3,3],[2,2]];
    return [];
  }

  const canClick = !isCpuTurn && !gs.done && mode !== "cpu-cpu";

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1208", maxWidth: 420, margin: "0 auto", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace", color: "#d4c9a8",
      padding: "16px", userSelect: "none", position: "relative",
    }}>
      <BackButton onBack={onBack} />
      <AwryCredit />
      <div style={{ fontSize: "10px", letterSpacing: "0.5em", color: "#5a4a28", textTransform: "uppercase", marginBottom: "4px" }}>Go</div>
      <div style={{ fontSize: "9px", color: "#3a3018", letterSpacing: "0.2em", marginBottom: "10px" }}>圍棋 · 2500 years old</div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "7px" }}>
        {MODES.map(m => (
          <button key={m} onClick={() => changeMode(m)} style={{
            background: mode===m ? "#d4c9a8" : "transparent",
            border: `2px solid ${mode===m ? "#d4c9a8" : "#a89870"}`,
            color: mode===m ? "#1a1208" : "#e8dcc0",
            padding: "4px 9px", fontSize: "8px", letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
            fontFamily: "'Courier New', monospace", fontWeight: "bold",
          }}>{MODE_LABELS[m]}</button>
        ))}
      </div>

      {mode !== "vs-human"
        ? <div style={{ display: "flex", gap: "4px", marginBottom: "7px" }}>
            {GO_DIFFICULTIES.map(d => (
              <button key={d} onClick={() => { setDifficulty(d); newGame(); }} style={{
                background: difficulty===d ? DIFF_COLORS[d] : "transparent",
                border: `2px solid ${difficulty===d ? DIFF_COLORS[d] : "#a89870"}`,
                color: difficulty===d ? "#1a1208" : "#e8dcc0",
                padding: "3px 7px", fontSize: "8px", letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
                fontFamily: "'Courier New', monospace", fontWeight: "bold",
              }}>{DIFF_LABELS[d]}</button>
            ))}
          </div>
        : <div style={{ height: "21px", marginBottom: "7px" }} />}

      <div style={{ display: "flex", gap: "5px", marginBottom: "26px", alignItems: "center" }}>
        <span style={{ fontSize: "8px", color: "#a89870", letterSpacing: "0.2em", marginRight: "4px" }}>BOARD</span>
        {GO_SIZES.map(s => (
          <button key={s} onClick={() => changeN(s)} style={{
            background: N===s ? "#8a7a40" : "transparent",
            border: `2px solid ${N===s ? "#8a7a40" : "#a89870"}`,
            color: N===s ? "#1a1208" : "#e8dcc0",
            padding: "3px 8px", fontSize: "8px", letterSpacing: "0.1em",
            cursor: "pointer", borderRadius: "2px",
            fontFamily: "'Courier New', monospace", fontWeight: "bold",
          }}>{s}×{s}</button>
        ))}
      </div>

      <div style={{ fontSize: "13px", fontWeight: "bold", color: statusColor, marginBottom: "6px", minHeight: "20px", letterSpacing: "0.04em", textAlign: "center", maxWidth: svgW }}>
        {thinking ? <span style={{ color: "#8a7a40" }}>Thinking…</span> : statusText}
      </div>

      <div style={{ display: "flex", gap: "28px", marginBottom: "10px", alignItems: "center" }}>
        {[[bLabel, "B", "#c8b89a", GO_B_COLOR], [wLabel, "W", "#e8dcc0", GO_W_COLOR]].map(([label, key, textCol, stoneCol]) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "8px", color: "#4a3a18", letterSpacing: "0.2em", marginBottom: "2px" }}>{label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: stoneCol, border: key==="W"?"1px solid #888":"none" }} />
              <div style={{ fontSize: "14px", fontWeight: "bold", color: textCol }}>
                {gs.done ? (key === "B" ? bScore.toFixed(1) : wScore.toFixed(1)) : `×${gs.captured[key] || 0}`}
              </div>
            </div>
            <div style={{ fontSize: "8px", color: "#3a3018", marginTop: "1px" }}>{gs.done ? "pts" : "cap"} · {matchScores[key]}W</div>
          </div>
        ))}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "8px", color: "#3a3018", letterSpacing: "0.15em", marginBottom: "2px" }}>KOMI</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#6a5a30" }}>6.5</div>
        </div>
      </div>

      <svg width={svgW} height={svgH} style={{ display: "block", borderRadius: "4px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))" }} onMouseLeave={() => setHover(null)}>
        <rect x={0} y={0} width={svgW} height={svgH} fill={GO_BOARD_BG} rx={4} />
        {Array(N).fill(null).map((_, i) => (
          <g key={`grid-${i}`}>
            <line x1={px(0)} y1={py(i)} x2={px(N-1)} y2={py(i)} stroke={GO_LINE_CLR} strokeWidth={0.8} />
            <line x1={px(i)} y1={py(0)} x2={px(i)} y2={py(N-1)} stroke={GO_LINE_CLR} strokeWidth={0.8} />
          </g>
        ))}
        {starPoints(N).map(([r, c]) => (
          <circle key={`star-${r}-${c}`} cx={px(c)} cy={py(r)} r={3} fill={GO_LINE_CLR} />
        ))}
        {hover && canClick && !gs.board[hover.r][hover.c] && (() => {
          const result = go_tryPlace(gs.board, hover.r, hover.c, gs.turn, N, gs.history);
          if (!result.valid) return null;
          return (
            <circle cx={px(hover.c)} cy={py(hover.r)} r={GO_STONE_R}
              fill={gs.turn === GO_BLACK ? GO_B_COLOR : GO_W_COLOR}
              opacity={0.4} style={{ pointerEvents: "none" }} />
          );
        })()}
        {Array(N).fill(null).map((_, r) =>
          Array(N).fill(null).map((_, c) => {
            const stone = gs.board[r][c];
            if (!stone) return null;
            const isLast = gs.lastMove && gs.lastMove !== "pass" && gs.lastMove.r === r && gs.lastMove.c === c;
            const isBlack = stone === GO_BLACK;
            return (
              <g key={`stone-${r}-${c}`}>
                <circle cx={px(c)} cy={py(r)} r={GO_STONE_R}
                  fill={isBlack ? GO_B_COLOR : GO_W_COLOR}
                  stroke={isBlack ? "#3a2a10" : "#b0a080"} strokeWidth={0.8} />
                <ellipse cx={px(c) - GO_STONE_R * 0.25} cy={py(r) - GO_STONE_R * 0.25}
                  rx={GO_STONE_R * 0.35} ry={GO_STONE_R * 0.25}
                  fill={isBlack ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)"}
                  style={{ pointerEvents: "none" }} />
                {isLast && (
                  <circle cx={px(c)} cy={py(r)} r={5}
                    fill={isBlack ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"}
                    style={{ pointerEvents: "none" }} />
                )}
              </g>
            );
          })
        )}
        {Array(N).fill(null).map((_, r) =>
          Array(N).fill(null).map((_, c) => (
            <rect key={`hit-${r}-${c}`}
              x={px(c) - GO_CELL/2} y={py(r) - GO_CELL/2}
              width={GO_CELL} height={GO_CELL} fill="transparent"
              style={{ cursor: canClick && !gs.board[r][c] ? "pointer" : "default" }}
              onMouseEnter={() => canClick && setHover({ r, c })}
              onMouseLeave={() => setHover(null)}
              onClick={() => handleIntersectionClick(r, c)} />
          ))
        )}
      </svg>

      <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
        {!gs.done && mode !== "cpu-cpu" && (
          <button onClick={handlePass} disabled={isCpuTurn} style={{
            background: "transparent",
            border: `2px solid ${isCpuTurn ? "#5a4a28" : "#f0e8c8"}`,
            color: isCpuTurn ? "#5a4a28" : "#f0e8c8",
            padding: "8px 18px", fontSize: "10px", letterSpacing: "0.25em",
            textTransform: "uppercase", cursor: isCpuTurn ? "default" : "pointer",
            borderRadius: "2px", fontWeight: "bold",
            fontFamily: "'Courier New', monospace", transition: "all 0.2s",
          }}
          onMouseEnter={e => { if (!isCpuTurn) { e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.color="#fff"; }}}
          onMouseLeave={e => { if (!isCpuTurn) { e.currentTarget.style.borderColor="#d4c9a8"; e.currentTarget.style.color="#f0e8c8"; }}}
          >Pass</button>
        )}
        <button onClick={newGame} style={{
          background: "transparent", border: "2px solid #f0e8c8", color: "#fff",
          padding: "8px 20px", fontSize: "10px", letterSpacing: "0.3em",
          textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
          fontWeight: "bold", fontFamily: "'Courier New', monospace", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.color="#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="#d4c9a8"; e.currentTarget.style.color="#f0e8c8"; }}
        >New Game</button>
      </div>

      <div style={{ marginTop: "10px", fontSize: "8px", color: "#2a2010", letterSpacing: "0.15em" }}>
        {bLabel} = BLACK · {wLabel} = WHITE · two passes ends game
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WOPR — Global Thermonuclear War
// ═══════════════════════════════════════════════════════════════════════════════

const WOPR_C = {
  hot: "#00ff41", bright: "#00cc33", mid: "#00892a", faint: "#005a1a",
  dimmer: "#003a10", bg: "#000900", border: "#003c10",
  red: "#ff3030", amber: "#ffaa00", white: "#e0e0e0",
  usaCol: "#00ff41", ussrCol: "#ff66aa",
  // 8-bit palette accents for launch platforms — distinct from city/country colors.
  siloCol:   "#ff8c00",   // bright orange, NES-feel
  siloDim:   "#5a3000",
  subCol:    "#3aa0ff",   // bright blue
  subDim:    "#1c4060",
  bomberCol: "#ffdd00",   // bright gold/yellow — manned aircraft
  bomberDim: "#5a4a00",
};

// Distance normalization: typical map distances run 50–450 px between source and target.
// Closer launches give defenders less reaction time → harder to intercept.
// Farther bomber sorties spend more time over hostile territory → more AAA → lower reach.
const WOPR_DIST_MIN = 50;
const WOPR_DIST_MAX = 450;

// Country outlines — sourced from mapsicon (CC BY 4.0) and rendered via a transform group.
// Source paths use a 1024×1024 viewBox with potrace's Y-up convention; we apply a matrix
// transform to map source units (0..10240) into our display halves with Y-flip.
// Russia main path (Kola, Black/Caspian, Caucasus, Kamchatka, Far East all included):
const WOPR_RU_OUTLINE = "M9177 8126 c-10 -15 -29 -25 -54 -29 -53 -9 -80 -31 -87 -71 -4 -19 -13 -48 -21 -63 -8 -15 -15 -31 -15 -35 0 -5 25 -8 56 -8 33 0 53 -4 49 -10 -10 -15 -75 -23 -109 -13 -21 7 -38 6 -51 -1 -45 -24 -165 -104 -235 -157 -41 -31 -86 -62 -100 -69 -14 -7 -47 -37 -73 -66 -27 -30 -57 -54 -68 -54 -12 0 -19 -7 -19 -19 0 -32 -52 -134 -87 -171 -18 -19 -36 -43 -39 -53 -7 -22 22 -57 47 -57 10 0 39 -10 64 -22 35 -17 45 -27 45 -46 0 -15 -5 -22 -12 -19 -7 3 -32 -6 -54 -19 -35 -20 -44 -21 -59 -10 -13 9 -15 15 -7 20 19 11 14 43 -7 49 -25 6 -61 -19 -61 -41 0 -9 7 -26 15 -36 24 -32 18 -74 -13 -104 -16 -15 -37 -40 -48 -56 -10 -16 -27 -40 -37 -55 -12 -19 -16 -36 -11 -63 5 -35 4 -38 -23 -43 -15 -4 -38 -11 -51 -16 -34 -13 -40 -11 -44 13 -5 33 -62 49 -113 31 -83 -29 -110 -55 -145 -145 -18 -46 -42 -93 -53 -105 -21 -24 -47 -31 -47 -13 0 16 -58 12 -92 -6 -65 -33 -107 -37 -77 -7 15 15 3 33 -21 33 -10 0 -47 -19 -82 -43 -35 -24 -100 -60 -146 -82 -45 -21 -87 -44 -93 -52 -6 -7 -22 -13 -34 -13 -13 0 -26 -7 -29 -16 -9 -22 -8 -24 9 -24 21 0 19 -14 -9 -47 -18 -21 -21 -33 -15 -51 7 -19 12 -21 28 -12 25 13 31 13 31 -2 0 -7 11 -26 24 -42 l23 -30 -27 -15 c-101 -59 -137 -87 -152 -123 -14 -32 -21 -38 -47 -38 -16 0 -33 5 -36 10 -8 13 -45 13 -45 0 0 -5 6 -27 14 -47 8 -21 17 -50 20 -65 3 -14 9 -33 12 -42 5 -13 -1 -16 -35 -16 -34 0 -49 7 -85 40 -24 22 -51 40 -61 40 -17 0 -17 11 0 52 5 13 1 19 -18 23 -13 4 -39 26 -57 51 -46 60 -87 73 -142 44 -28 -15 -53 -20 -74 -17 -38 6 -50 0 -64 -37 -8 -23 -7 -32 5 -46 43 -48 -24 -100 -130 -100 -48 0 -54 2 -57 23 -2 13 -9 21 -18 18 -8 -1 -38 -6 -66 -10 -28 -4 -64 -17 -81 -29 -36 -26 -59 -28 -71 -7 -7 14 -11 13 -27 -5 -21 -24 -48 -26 -65 -5 -17 21 -23 19 -43 -14 -22 -38 -21 -44 3 -38 30 8 25 -17 -11 -47 -17 -14 -51 -38 -75 -52 -26 -15 -47 -36 -50 -49 -6 -24 -34 -43 -34 -23 0 18 52 128 61 128 18 0 47 44 59 88 7 26 23 58 35 72 43 47 80 132 79 180 0 37 -9 57 -45 108 -34 49 -48 62 -63 58 -11 -3 -24 1 -30 9 -16 22 -119 -18 -135 -51 -10 -23 -31 -31 -44 -18 -3 4 1 20 9 35 13 26 13 30 -1 35 -8 4 -37 3 -63 -1 l-47 -7 28 29 c15 16 27 32 27 36 0 10 -67 26 -88 21 -31 -9 -72 -86 -72 -136 0 -24 5 -49 12 -56 9 -9 1 -12 -36 -12 -46 0 -48 -1 -42 -25 5 -21 0 -29 -33 -51 -49 -32 -66 -29 -46 9 17 32 7 34 -44 8 -20 -11 -49 -22 -64 -26 -21 -4 -27 -10 -22 -23 4 -14 -6 -23 -48 -40 -29 -12 -56 -22 -60 -22 -4 0 -33 -20 -66 -45 -32 -25 -65 -45 -72 -45 -7 0 -20 -7 -30 -16 -14 -12 -16 -22 -9 -40 5 -13 7 -31 4 -39 -4 -9 2 -25 11 -35 10 -11 16 -21 14 -23 -2 -2 -26 -13 -54 -25 -55 -25 -85 -28 -161 -17 -49 7 -52 6 -60 -16 -4 -13 -8 -35 -9 -49 -1 -14 -6 -41 -10 -61 -6 -31 -3 -41 22 -70 15 -19 38 -48 49 -64 l21 -31 -34 4 c-27 3 -40 13 -58 42 -13 21 -38 48 -55 60 -29 21 -35 22 -73 9 -55 -17 -54 -15 -26 -38 l24 -20 -22 -1 c-13 0 -23 5 -23 11 0 6 -12 9 -27 7 -20 -2 -29 -9 -31 -25 -4 -26 25 -73 44 -73 16 0 54 -57 54 -80 0 -8 -12 2 -26 22 -18 25 -36 38 -59 42 -18 4 -38 13 -45 21 -14 16 -6 68 16 102 21 33 18 142 -4 171 -16 20 -20 21 -30 9 -10 -11 -9 -17 3 -27 17 -14 20 -66 6 -103 -6 -16 -21 -28 -39 -32 -16 -3 -40 -17 -52 -30 -22 -23 -23 -28 -12 -76 17 -73 15 -113 -7 -133 -10 -9 -26 -35 -37 -57 -14 -33 -16 -44 -6 -60 9 -15 10 -25 1 -40 -9 -17 -8 -25 4 -36 12 -13 21 -13 51 -3 31 10 39 9 63 -8 46 -33 60 -55 66 -104 5 -36 3 -47 -9 -52 -23 -9 -24 -8 -24 24 0 16 -8 45 -17 65 -15 32 -21 35 -58 35 -57 0 -78 -24 -83 -100 -4 -50 -7 -59 -26 -64 -16 -4 -27 -19 -37 -53 -12 -39 -22 -50 -59 -70 -25 -13 -47 -28 -48 -33 -5 -15 -39 -12 -72 5 -34 18 -39 35 -11 35 32 0 51 11 51 31 0 10 19 31 44 48 54 37 86 76 86 104 0 11 10 32 23 45 l22 24 -22 18 c-28 23 -29 54 -3 120 11 28 20 62 20 76 0 14 9 42 20 64 22 43 26 100 9 131 -9 17 -3 32 30 89 51 86 53 120 9 152 -18 13 -48 28 -66 35 l-34 11 -38 -61 c-59 -93 -76 -113 -127 -143 -27 -15 -51 -32 -55 -38 -13 -18 -9 -34 9 -38 15 -3 15 -4 0 -19 -9 -9 -19 -30 -23 -45 -4 -16 -18 -40 -32 -53 l-26 -23 35 -29 c27 -22 33 -33 31 -58 -2 -17 5 -44 15 -61 l18 -31 -33 -30 c-32 -29 -35 -29 -48 -12 -7 10 -14 31 -14 47 0 18 -10 41 -26 57 -28 30 -34 38 -77 118 -20 38 -38 57 -65 69 -51 23 -92 57 -92 75 0 9 -5 19 -11 23 -6 3 -9 14 -6 24 3 11 -6 29 -23 45 l-28 27 -21 -21 c-27 -27 -26 -47 5 -92 21 -31 25 -46 22 -95 l-3 -59 -37 -3 c-27 -2 -39 -9 -44 -24 -4 -14 -9 -17 -16 -10 -8 8 -6 19 6 36 25 39 21 56 -13 56 -16 0 -41 -4 -54 -9 -19 -7 -35 -4 -73 15 -36 18 -58 23 -81 19 -18 -3 -41 -1 -52 5 -18 9 -18 12 -5 39 8 16 24 32 37 35 54 15 -13 22 -166 19 -89 -2 -177 -4 -196 -3 -26 0 -43 -8 -67 -31 l-32 -31 -39 18 c-36 18 -38 21 -35 64 4 73 5 74 72 67 l60 -7 0 46 c0 54 -16 87 -64 133 l-36 35 0 -45 c0 -53 -18 -83 -68 -108 -35 -18 -37 -22 -37 -67 0 -44 -3 -50 -35 -71 -19 -12 -41 -27 -48 -33 -9 -8 -12 -4 -12 19 0 17 -10 45 -23 64 -21 32 -24 33 -52 21 -17 -7 -64 -13 -106 -14 l-76 0 -26 -53 c-15 -29 -27 -58 -27 -65 0 -19 -39 8 -46 33 -4 11 -12 27 -19 35 -7 8 -15 32 -18 53 -7 46 -22 67 -48 67 -27 0 -42 -37 -36 -90 6 -53 -2 -74 -29 -68 -57 11 -76 155 -29 224 13 20 27 43 30 52 3 9 20 26 38 37 33 21 47 59 29 77 -7 7 -5 22 4 44 8 18 14 46 14 61 0 15 4 33 8 40 4 6 7 -8 7 -30 1 -29 14 -69 43 -126 23 -46 42 -92 42 -102 0 -28 63 -85 116 -105 45 -17 50 -17 113 -1 73 20 81 27 81 77 0 20 7 45 15 57 14 20 14 28 -5 82 -11 33 -20 78 -20 99 0 22 -7 55 -14 74 -8 19 -12 45 -9 57 4 15 -1 28 -16 42 -11 11 -21 26 -21 35 0 8 -11 19 -24 25 -15 7 -26 23 -30 41 -9 48 -8 51 19 34 24 -16 25 -16 25 9 0 39 -17 64 -38 58 -10 -2 -24 3 -31 11 -8 9 -29 16 -51 16 -20 0 -51 5 -69 11 -42 15 -73 6 -110 -32 -22 -21 -31 -40 -31 -62 0 -18 -5 -49 -11 -69 -9 -36 -12 -38 -49 -38 -48 0 -105 -45 -115 -90 -7 -32 -41 -80 -56 -80 -17 0 -104 -42 -111 -54 -4 -6 -3 -15 2 -20 16 -16 11 -34 -11 -41 -16 -5 -19 -14 -17 -38 3 -31 2 -32 -42 -37 l-45 -5 -17 -69 c-9 -38 -23 -75 -31 -83 -17 -17 -158 -32 -301 -33 -98 0 -99 0 -81 -20 17 -19 17 -21 2 -38 -22 -24 -21 -34 4 -66 12 -15 18 -30 14 -34 -4 -4 -12 1 -19 11 -7 9 -16 17 -20 17 -3 0 -27 10 -51 21 -42 20 -47 20 -64 5 -9 -9 -28 -16 -40 -16 -23 0 -74 -34 -122 -82 -16 -16 -38 -28 -53 -28 -19 0 -29 -7 -37 -27 -27 -66 -35 -80 -70 -123 -30 -37 -35 -51 -31 -79 3 -21 11 -35 23 -38 17 -5 17 -8 5 -32 -14 -26 -13 -27 15 -40 25 -11 29 -18 29 -51 0 -30 -5 -40 -20 -45 -11 -3 -20 -15 -20 -25 0 -10 -10 -20 -23 -24 -23 -5 -47 -42 -47 -71 0 -8 -7 -35 -16 -61 -16 -46 -15 -48 6 -64 15 -12 19 -19 11 -24 -6 -4 -11 -16 -11 -28 0 -14 -5 -18 -16 -14 -9 3 -27 6 -40 6 -13 0 -24 6 -24 13 0 7 -6 22 -14 32 -12 16 -16 17 -30 6 -9 -7 -16 -20 -16 -28 0 -8 -13 -28 -30 -43 -21 -20 -30 -37 -30 -60 0 -30 2 -32 29 -27 24 5 35 0 65 -29 53 -52 57 -79 14 -119 -48 -43 -53 -65 -28 -108 l21 -36 -25 -44 c-26 -44 -26 -44 -6 -62 11 -10 20 -28 20 -40 0 -27 15 -41 53 -50 24 -6 27 -12 27 -50 0 -34 4 -44 20 -48 12 -3 20 -14 20 -25 0 -11 10 -33 23 -49 25 -30 52 -107 43 -122 -3 -5 -21 -12 -40 -15 -38 -7 -52 -20 -61 -57 -4 -15 -23 -37 -46 -52 l-39 -26 -22 30 c-24 32 -53 37 -107 18 -42 -15 -39 -39 9 -69 21 -13 38 -25 37 -26 -7 -7 -135 30 -149 43 -22 20 -53 9 -43 -15 4 -9 9 -33 12 -52 5 -33 5 -34 -12 -18 -16 15 -22 15 -59 2 -22 -8 -46 -22 -53 -31 -11 -14 -16 -12 -44 21 -18 20 -36 36 -39 36 -11 0 -30 -49 -30 -76 0 -21 53 -138 70 -154 11 -10 32 -116 31 -157 -1 -37 2 -44 28 -58 29 -15 59 -66 74 -127 4 -16 14 -28 23 -28 8 0 35 -20 60 -45 34 -35 44 -53 44 -78 0 -18 5 -38 10 -43 8 -8 6 -15 -5 -24 -24 -20 -18 -30 20 -30 27 0 46 -10 87 -47 62 -54 63 -56 43 -73 -22 -18 -19 -44 10 -78 19 -22 27 -46 31 -94 4 -34 14 -75 22 -90 15 -25 20 -27 57 -21 22 3 46 9 54 13 22 12 41 80 41 154 0 58 5 77 31 122 44 77 51 110 34 145 -8 15 -15 32 -15 36 0 5 30 17 66 27 36 11 79 30 95 43 26 23 28 23 38 5 7 -14 18 -17 45 -14 25 3 36 0 36 -8 0 -9 5 -8 18 3 11 10 26 14 41 10 23 -6 24 -4 18 36 -4 34 -2 41 9 37 21 -8 25 7 25 90 0 69 -3 80 -25 103 -23 24 -25 31 -16 60 6 22 6 40 0 52 -16 29 -12 39 23 54 45 20 70 45 86 83 11 27 19 33 37 29 16 -3 28 4 44 25 11 15 28 28 37 28 13 0 15 -9 9 -64 -5 -53 -4 -65 10 -70 27 -10 34 -7 55 29 16 26 28 35 48 35 15 0 31 4 37 10 5 5 41 14 79 21 116 18 118 18 136 -20 9 -19 19 -29 22 -23 12 18 49 0 69 -34 11 -18 27 -36 36 -39 27 -9 62 -96 55 -139 -6 -36 3 -46 24 -25 15 15 33 3 33 -21 0 -30 42 -53 74 -40 49 18 92 13 110 -15 17 -25 44 -32 62 -16 5 5 21 7 37 4 21 -4 25 -8 17 -18 -15 -18 -2 -64 21 -78 11 -7 19 -17 19 -24 0 -21 40 -26 55 -7 12 18 14 17 26 -8 24 -55 105 -50 131 7 15 35 15 36 -14 73 -60 74 -58 92 8 92 28 0 33 4 38 34 7 37 36 70 43 49 2 -7 21 -17 40 -24 32 -10 38 -9 50 6 11 16 9 21 -17 37 -33 19 -36 28 -18 46 9 9 8 12 -4 12 -22 0 -13 32 14 49 18 11 25 10 48 -7 42 -32 111 -41 416 -59 74 -4 104 -1 163 17 66 19 75 20 90 6 9 -8 33 -22 54 -31 45 -19 54 -48 36 -112 -11 -41 -11 -47 6 -59 12 -9 23 -10 36 -4 25 14 25 14 39 -20 10 -24 16 -28 26 -19 10 8 19 7 36 -5 12 -9 31 -16 42 -16 19 0 19 -1 -2 -16 -14 -10 -22 -24 -20 -37 3 -18 11 -21 60 -24 31 -2 60 1 63 7 3 5 16 10 29 10 12 0 26 3 29 6 5 6 103 42 115 44 1 0 -2 -9 -8 -19 -19 -36 -10 -60 37 -108 41 -42 54 -69 115 -228 38 -99 74 -184 79 -190 7 -7 17 -2 29 13 19 23 40 22 40 -2 0 -38 145 -88 164 -57 8 12 54 15 81 5 9 -4 27 -28 41 -55 13 -27 33 -55 44 -61 11 -7 20 -21 20 -30 0 -29 49 -53 106 -53 55 0 77 -12 100 -57 12 -23 21 -28 54 -28 32 0 39 4 42 22 2 19 13 24 66 34 61 10 82 24 82 52 0 11 134 82 157 82 5 0 18 9 27 19 10 10 33 22 52 26 20 3 42 9 50 12 8 3 14 -1 14 -11 0 -13 11 -16 56 -16 48 0 59 -4 76 -25 37 -47 66 -55 194 -51 102 3 122 7 141 24 26 24 31 73 8 92 -23 19 -29 75 -11 102 9 12 16 30 16 40 0 10 4 18 9 18 5 0 14 15 22 33 17 42 16 42 34 27 9 -7 37 -17 63 -22 26 -4 85 -18 132 -31 l85 -24 14 -42 c11 -36 21 -46 57 -62 59 -27 105 -27 141 -1 49 35 84 44 163 44 104 0 171 -11 195 -33 39 -35 73 -40 180 -26 86 12 104 17 127 40 15 15 36 27 47 27 11 0 29 13 40 29 12 16 32 32 46 35 16 4 25 13 25 26 0 11 11 26 23 35 13 8 29 26 35 40 6 13 23 31 37 41 23 15 27 15 50 0 29 -19 76 -21 93 -3 8 7 52 14 110 17 97 5 97 5 100 32 2 16 18 40 38 57 36 32 43 64 20 90 -11 13 -12 32 -4 96 18 162 20 193 8 215 -9 17 -17 20 -39 15 -38 -8 -46 15 -25 71 12 31 25 46 48 55 17 8 49 30 72 51 51 47 80 58 154 58 32 0 62 4 65 10 3 5 23 10 45 10 29 0 48 -8 80 -35 23 -19 46 -35 50 -35 4 0 37 -28 73 -62 35 -35 85 -81 111 -103 25 -22 46 -46 46 -52 0 -7 17 -21 39 -32 36 -19 39 -19 62 -3 13 9 45 24 70 32 42 14 51 14 88 1 33 -12 48 -13 71 -4 17 6 30 8 30 5 0 -4 17 -26 39 -50 33 -36 44 -42 79 -42 31 0 45 5 56 22 9 12 30 27 48 33 26 8 32 15 30 34 -1 13 9 36 24 54 15 18 33 46 40 64 16 36 54 64 54 39 0 -8 12 -24 26 -35 22 -17 25 -26 20 -52 -4 -23 3 -55 28 -118 31 -80 52 -169 47 -198 -1 -7 3 -22 9 -33 9 -16 6 -22 -15 -36 -14 -9 -40 -20 -58 -23 -24 -5 -35 -14 -42 -36 -5 -17 -18 -41 -28 -55 -17 -24 -17 -25 0 -35 43 -24 153 -157 153 -184 0 -12 -10 -40 -22 -61 -18 -31 -20 -42 -11 -51 10 -10 19 -7 43 16 26 25 30 36 32 94 2 54 6 66 21 69 10 2 24 -4 31 -14 11 -15 18 -15 64 -5 61 15 94 57 111 141 7 30 19 66 28 79 12 18 14 36 8 75 -3 28 -6 56 -5 61 1 6 4 95 7 198 4 171 2 194 -17 251 -11 34 -20 78 -20 97 0 89 -13 215 -25 229 -7 8 -16 26 -20 40 -17 53 -77 147 -122 191 -49 46 -87 123 -100 201 l-5 36 67 -26 c48 -19 71 -34 81 -54 8 -16 43 -57 79 -92 35 -35 80 -91 100 -124 22 -37 49 -69 73 -83 20 -13 41 -30 46 -38 5 -9 29 -37 53 -62 24 -25 43 -55 43 -66 0 -22 59 -73 84 -73 20 0 21 30 1 56 -20 27 -18 51 5 57 45 12 3 64 -72 89 -36 12 -98 65 -98 83 0 6 -13 29 -30 51 -58 77 -32 134 65 134 l50 1 -45 18 c-87 35 -198 98 -246 139 -27 23 -56 42 -65 42 -28 0 -92 56 -103 90 -8 24 -25 42 -61 63 -27 16 -71 47 -96 68 -45 37 -68 47 -82 33 -4 -4 14 -26 38 -49 46 -43 56 -65 30 -65 -32 0 -28 -31 8 -68 30 -32 67 -90 67 -107 0 -12 -38 -4 -44 10 -3 8 -17 20 -31 25 -18 7 -25 17 -25 35 0 24 -2 25 -64 25 -36 0 -68 5 -71 10 -11 18 -78 11 -112 -12 -36 -25 -41 -39 -17 -58 35 -30 35 -46 -1 -84 -18 -20 -36 -36 -39 -36 -3 0 -6 13 -6 29 0 27 -33 61 -60 61 -16 0 -11 -38 7 -48 10 -6 14 -16 10 -26 -11 -28 -33 -17 -56 29 -12 25 -25 45 -29 45 -4 0 -20 -14 -35 -30 -44 -47 -97 -52 -97 -11 0 10 10 56 21 102 17 66 22 122 24 261 2 97 8 185 13 194 7 12 5 31 -6 61 -13 34 -14 51 -6 82 6 22 7 46 3 53 -14 22 -10 70 10 113 23 51 126 145 158 145 28 0 42 28 22 42 -8 5 -10 11 -4 14 38 16 77 48 85 69 5 14 16 25 23 25 9 0 14 11 13 30 -1 16 -4 30 -8 30 -5 0 -8 6 -8 13 0 20 110 107 135 107 12 0 28 7 35 15 7 8 17 12 22 9 5 -3 0 -17 -13 -30 -26 -28 -19 -57 13 -52 15 2 24 13 30 36 5 18 15 35 23 39 10 3 15 20 15 48 0 38 3 44 23 47 12 2 21 8 21 13 -1 6 5 19 12 30 8 11 14 25 14 32 0 20 -47 15 -63 -7 -13 -19 -15 -19 -29 -3 -20 24 -48 117 -48 162 0 20 -7 45 -15 55 -8 11 -15 30 -15 42 0 12 -7 27 -15 34 -21 17 -18 70 5 100 11 14 20 37 20 53 0 20 5 27 20 27 16 0 20 7 20 30 0 17 3 30 8 30 4 0 28 -24 54 -52 42 -47 47 -50 48 -29 0 23 1 24 20 6 11 -10 23 -15 26 -12 4 3 -1 50 -10 103 -11 66 -13 101 -6 108 14 14 12 46 -2 41 -7 -2 -32 13 -56 35 -34 30 -42 44 -37 60 9 28 75 97 75 78 0 -9 -7 -21 -15 -28 -26 -21 -18 -54 15 -67 16 -6 38 -25 47 -42 10 -17 26 -31 36 -31 9 0 17 -7 17 -16 0 -9 8 -18 18 -21 17 -4 18 -13 14 -79 -4 -62 -2 -77 12 -87 11 -8 20 -35 25 -70 4 -32 13 -63 19 -69 7 -7 12 -25 12 -42 0 -16 9 -39 19 -50 11 -12 28 -54 39 -93 16 -61 17 -75 6 -84 -8 -7 -11 -21 -8 -35 4 -14 1 -31 -7 -40 -10 -13 -10 -17 2 -25 8 -5 19 -9 26 -9 11 0 36 -58 47 -112 15 -69 171 -195 326 -263 36 -16 80 -41 97 -57 22 -18 50 -30 83 -34 35 -5 64 -17 95 -41 47 -36 102 -60 112 -49 3 3 1 31 -6 61 -7 30 -9 59 -6 65 8 13 -35 87 -69 119 -23 21 -26 33 -26 88 0 43 4 63 13 63 6 1 3 6 -8 13 -82 48 -115 92 -115 151 0 26 6 38 21 46 16 9 19 17 14 38 -10 39 -24 52 -56 52 -16 0 -48 14 -74 32 -53 38 -60 72 -20 106 30 26 25 44 -18 64 -24 11 -36 12 -49 5 -23 -15 -85 15 -98 47 -5 13 -14 27 -20 31 -15 9 -40 -13 -40 -36 0 -22 -28 -25 -53 -6 -26 19 -87 110 -87 129 0 10 -11 24 -23 33 -48 31 -54 90 -13 124 15 12 15 16 2 30 -8 9 -18 36 -22 60 -7 43 -7 44 19 38 14 -4 32 -10 41 -13 21 -8 22 39 1 56 -18 15 -19 32 -4 101 14 65 37 89 87 89 51 0 56 7 27 44 -13 17 -27 45 -31 61 -4 17 -20 55 -35 86 -28 57 -42 127 -59 309 -4 47 -11 96 -14 110 -6 20 -1 32 24 55 35 34 38 55 9 81 -21 19 -62 23 -169 15 -25 -2 -55 0 -67 4 -20 6 -23 4 -23 -20 0 -23 -3 -26 -22 -21 -13 3 -29 6 -35 6 -18 0 -16 25 2 40 8 7 15 19 15 26 0 8 -7 14 -15 14 -11 0 -15 12 -15 46 0 39 -5 51 -32 76 -29 27 -36 29 -80 23 l-48 -7 0 31 c0 29 1 30 29 20 18 -6 42 -7 62 -1 31 8 34 12 34 48 1 60 22 84 71 84 42 0 72 20 59 40 -9 14 32 47 68 55 33 8 49 42 41 85 -7 32 -14 36 -30 20 -7 -7 -22 -2 -48 15 -20 14 -50 25 -66 25 -30 0 -40 13 -20 25 17 10 12 48 -5 41 -11 -4 -15 2 -15 23 0 24 -25 61 -42 61 -3 0 -13 -11 -21 -24z";

// USA main path (lower 48 contiguous; smaller paths for AK/HI islands omitted):
const WOPR_US_OUTLINE = "M9767 8370 l-55 -50 -25 20 c-25 20 -26 20 -36 2 -26 -48 -43 -197 -36 -309 5 -92 4 -117 -10 -142 -10 -21 -14 -43 -9 -65 9 -49 -3 -76 -40 -91 -37 -16 -52 -31 -57 -59 -5 -24 -97 -65 -358 -160 -101 -37 -195 -74 -208 -83 -32 -21 -71 -89 -93 -164 -11 -34 -33 -79 -50 -100 -16 -21 -30 -40 -30 -43 0 -3 18 -9 40 -12 43 -7 51 -26 28 -64 -10 -16 -9 -23 11 -43 l22 -25 -33 -31 c-18 -18 -75 -53 -125 -77 -73 -36 -105 -46 -151 -48 -43 -2 -74 -11 -120 -36 -37 -19 -59 -37 -55 -44 3 -6 19 -28 35 -48 21 -27 27 -44 23 -59 -11 -33 -204 -228 -265 -267 -30 -20 -86 -65 -125 -102 -70 -67 -186 -143 -238 -156 -18 -4 -34 -1 -45 8 -9 9 -35 18 -56 21 -22 4 -46 13 -54 21 -13 13 -13 18 2 41 11 17 21 60 26 113 10 107 15 120 49 129 55 13 54 50 -4 168 -77 156 -96 165 -162 74 -54 -76 -84 -86 -98 -32 -4 19 0 35 16 56 25 34 49 116 49 168 0 21 -8 47 -20 62 -11 14 -20 38 -20 54 0 28 -3 30 -92 57 -51 15 -106 32 -122 36 -33 11 -60 0 -77 -32 -9 -17 -8 -23 6 -31 17 -9 17 -11 -3 -26 -17 -12 -23 -29 -25 -73 -2 -32 -7 -61 -11 -65 -10 -10 -39 10 -52 35 -10 20 -13 19 -49 -29 l-39 -51 0 -138 c-1 -125 1 -141 20 -167 60 -81 75 -165 50 -283 -23 -107 -61 -178 -110 -203 -35 -18 -41 -19 -65 -6 -47 27 -83 100 -91 187 -4 42 -17 110 -30 150 -19 62 -21 80 -12 115 6 23 13 85 16 137 3 68 12 115 30 166 14 39 26 77 26 84 0 23 -29 -10 -61 -71 -33 -61 -65 -97 -76 -85 -16 15 28 174 74 266 26 52 48 97 50 99 1 2 9 -2 17 -8 10 -8 16 -9 21 -1 9 14 45 13 45 -2 0 -7 10 -1 23 13 12 14 51 48 86 74 70 52 66 51 179 19 19 -5 22 -3 22 21 0 23 3 25 23 19 63 -21 84 -1 33 34 -30 21 -37 22 -78 11 -38 -11 -48 -10 -71 6 -19 12 -27 26 -27 45 l0 28 -81 -31 c-49 -19 -99 -47 -125 -70 -41 -36 -48 -39 -87 -33 -23 3 -79 25 -125 48 -70 36 -86 40 -102 30 -31 -19 -40 -14 -40 20 0 24 10 41 47 77 27 25 42 46 35 49 -32 10 -91 -26 -183 -114 -54 -52 -103 -94 -110 -94 -7 0 -28 -14 -46 -32 -29 -28 -41 -33 -98 -36 l-65 -4 0 31 c0 37 -4 37 -72 11 -50 -19 -128 -27 -128 -14 0 3 23 32 52 63 28 31 66 79 84 106 44 68 77 97 159 138 l70 35 -47 7 c-27 4 -63 4 -82 1 -19 -4 -45 -1 -60 5 -21 10 -33 9 -63 -5 -37 -16 -39 -16 -108 13 -44 19 -74 26 -80 20 -16 -16 -24 -10 -40 27 -11 28 -19 35 -32 30 -10 -4 -49 -11 -88 -16 -59 -7 -73 -6 -88 8 -12 10 -42 18 -83 20 l-65 4 -29 52 c-50 88 -46 85 -63 43 -10 -23 -26 -41 -42 -47 -74 -28 -1122 -43 -1470 -21 -998 62 -1967 243 -2867 534 -76 25 -138 43 -138 40 0 -2 11 -21 25 -41 29 -43 30 -50 9 -73 -15 -17 -15 -22 0 -65 22 -64 20 -83 -9 -110 -17 -16 -25 -34 -25 -57 0 -18 -6 -40 -12 -49 -15 -18 -66 -52 -90 -61 -23 -8 -58 28 -58 59 0 20 6 23 41 26 56 4 74 31 40 59 l-24 20 23 24 c23 24 23 25 4 46 -10 11 -60 40 -110 64 -50 24 -104 55 -121 69 l-31 26 -11 -28 c-9 -21 -9 -50 -2 -113 6 -46 11 -109 11 -140 0 -37 5 -59 13 -62 8 -3 6 -9 -8 -20 -20 -15 -20 -16 -1 -47 18 -32 18 -32 -3 -61 -27 -36 -26 -43 4 -63 35 -23 31 -34 -11 -38 -37 -3 -37 -4 -59 -78 -12 -41 -35 -102 -52 -135 -17 -33 -45 -97 -62 -142 -18 -44 -54 -118 -82 -164 -107 -178 -116 -206 -139 -418 -4 -41 -5 -91 -3 -112 9 -61 -25 -164 -70 -215 -54 -62 -58 -97 -17 -186 l33 -72 -18 -111 c-21 -128 -17 -160 27 -242 28 -52 30 -62 20 -97 -13 -49 -1 -82 33 -98 20 -9 28 -8 44 6 17 16 19 16 25 -6 3 -13 6 -38 6 -57 0 -25 -4 -32 -14 -28 -11 5 -17 -5 -22 -38 -10 -72 1 -107 51 -154 25 -23 45 -45 45 -49 0 -4 -11 -25 -25 -46 l-24 -39 28 -56 c16 -31 32 -75 36 -98 3 -23 19 -60 35 -81 16 -22 40 -69 55 -106 23 -58 25 -74 19 -135 l-6 -70 33 -20 c19 -12 60 -28 92 -37 50 -15 65 -25 119 -86 36 -41 81 -79 109 -93 32 -17 49 -32 51 -47 2 -12 19 -32 38 -45 70 -44 86 -62 119 -128 21 -44 33 -85 34 -116 1 -28 7 -51 15 -53 6 -3 12 -16 12 -30 0 -29 -17 -24 265 -71 149 -25 212 -39 218 -50 11 -20 78 -63 311 -197 105 -61 220 -132 256 -158 36 -26 83 -57 105 -68 52 -25 195 -58 315 -71 177 -19 370 -34 376 -29 3 3 6 30 7 58 l2 53 150 -7 c83 -3 166 -10 186 -15 44 -10 149 -110 164 -155 7 -20 29 -43 67 -68 31 -21 68 -53 83 -72 32 -43 75 -147 75 -184 0 -33 40 -92 93 -139 50 -44 166 -111 205 -119 30 -6 37 -2 100 64 41 44 86 79 114 92 43 19 54 20 115 9 64 -10 71 -15 124 -69 30 -32 100 -127 154 -211 58 -90 120 -175 151 -204 58 -55 75 -90 123 -242 36 -117 44 -125 141 -146 36 -8 79 -22 95 -31 17 -9 46 -16 66 -16 21 0 47 -8 62 -20 26 -21 63 -26 85 -11 11 7 11 9 -2 14 -9 4 -16 18 -16 33 0 15 -12 62 -27 105 -24 73 -25 82 -13 120 13 39 13 42 -10 59 l-24 18 32 30 c36 34 38 39 17 69 -14 20 -14 23 5 36 11 7 27 30 35 51 9 20 20 34 26 30 14 -9 48 24 65 64 10 26 18 32 32 28 33 -11 52 3 46 32 l-5 27 73 1 c46 0 84 6 104 17 74 39 164 169 143 208 -12 24 -6 35 31 54 28 15 29 14 40 -20 6 -19 16 -37 21 -40 5 -4 42 10 81 30 40 19 105 42 143 50 66 13 75 13 135 -5 36 -11 83 -20 105 -20 34 0 44 5 68 35 32 40 48 42 112 15 26 -11 49 -20 51 -20 3 0 -7 22 -23 49 -31 56 -28 66 11 51 34 -13 56 -63 56 -130 0 -37 5 -55 20 -70 25 -25 37 -25 75 0 22 14 39 18 71 13 35 -5 44 -2 58 18 23 33 20 46 -15 78 -23 22 -29 34 -24 50 10 31 33 26 74 -18 20 -21 59 -51 88 -65 29 -14 56 -34 62 -43 9 -17 11 -17 30 1 41 37 23 69 -51 91 -35 10 -44 17 -46 39 -4 34 13 56 44 56 32 0 31 17 -2 32 -20 9 -30 9 -45 0 -33 -21 -59 -15 -59 13 0 28 -12 32 -30 10 -21 -26 -78 -19 -111 14 -16 16 -29 33 -29 38 0 4 19 16 43 26 43 17 44 17 109 -7 l65 -25 58 40 c49 33 65 39 112 39 61 0 109 17 137 49 24 27 30 27 44 -4 10 -23 17 -25 72 -25 l60 0 0 30 c0 28 2 30 40 30 22 0 60 5 85 12 38 10 59 10 130 -5 80 -16 89 -21 142 -72 l56 -54 69 35 c53 27 72 42 80 64 10 29 12 30 77 30 72 0 83 -7 124 -72 10 -16 41 -40 70 -54 63 -32 113 -69 126 -93 6 -10 15 -58 20 -107 21 -172 22 -180 32 -161 13 23 46 21 54 -3 3 -11 1 -35 -6 -53 -10 -29 -9 -38 10 -75 34 -67 56 -84 96 -76 28 5 35 3 35 -9 0 -9 15 -28 34 -42 21 -16 33 -32 29 -41 -3 -8 6 -26 20 -39 13 -14 27 -38 30 -54 4 -19 14 -32 29 -36 12 -4 45 -29 72 -55 28 -26 61 -53 74 -59 17 -9 21 -18 17 -32 -6 -19 -5 -20 17 -7 22 12 28 14 55 17 41 4 62 150 52 366 -3 61 -9 87 -25 110 -12 17 -24 44 -28 60 -4 17 -45 92 -92 168 -46 76 -84 140 -84 143 0 2 9 4 20 4 17 0 9 14 -44 84 -77 101 -133 198 -156 274 -15 47 -20 54 -27 37 -4 -11 -8 -44 -8 -72 0 -29 -2 -53 -5 -53 -9 0 -30 86 -30 119 0 16 7 34 15 41 18 15 19 69 4 124 -13 49 6 194 33 248 10 21 18 51 18 67 0 16 5 33 10 36 6 4 9 19 8 33 -2 16 2 26 8 25 7 -1 20 7 29 17 10 11 22 20 27 20 19 0 106 83 112 106 4 13 11 24 16 24 14 0 60 72 60 94 0 11 9 29 20 41 12 12 37 55 58 96 30 61 46 80 87 106 76 47 105 78 105 109 0 32 41 106 83 151 17 18 52 40 79 49 50 16 85 51 69 67 -6 6 -22 -1 -42 -17 -37 -31 -74 -32 -74 -1 0 14 8 21 28 23 22 3 27 8 27 32 0 23 -6 30 -32 40 -31 11 -32 12 -11 20 12 5 27 18 33 29 12 24 31 26 61 9 18 -11 23 -10 44 15 33 37 49 100 34 129 -11 21 -12 21 -24 -9 -13 -30 -13 -30 -63 -20 -42 9 -54 8 -76 -6 -14 -9 -27 -17 -30 -17 -8 0 -28 101 -22 108 4 3 20 -2 36 -11 29 -17 29 -17 74 16 l44 34 -19 29 c-12 19 -17 38 -14 55 8 36 -26 57 -90 56 -28 0 -61 5 -74 12 -22 12 -23 14 -7 23 10 6 29 8 42 5 24 -4 23 -3 -8 24 l-33 29 23 17 23 16 -52 35 c-42 28 -49 36 -36 43 9 5 26 5 41 -1 41 -15 42 8 2 49 -39 40 -44 51 -22 51 26 0 28 20 3 31 -18 8 -33 33 -56 91 -17 43 -31 89 -31 101 0 27 43 93 70 107 26 14 38 -11 22 -43 -18 -38 -10 -103 17 -130 12 -14 21 -30 17 -35 -3 -5 12 -26 34 -47 21 -21 41 -48 44 -61 5 -19 13 -24 36 -24 35 0 38 -13 14 -64 -16 -33 -12 -79 5 -60 5 5 18 67 30 137 27 162 22 190 -48 240 -38 28 -50 43 -55 72 -4 20 -6 38 -4 40 2 2 26 -2 54 -8 56 -13 83 -31 85 -56 2 -35 89 302 89 345 0 9 -12 14 -35 14 l-35 0 0 49 c0 42 7 60 49 123 67 99 100 128 211 188 112 61 146 91 162 142 13 43 15 44 39 22 16 -14 20 -12 50 26 22 27 36 37 43 30 17 -17 24 -12 65 40 40 50 44 73 14 84 -22 9 -28 -1 -14 -18 18 -22 5 -52 -29 -66 -41 -17 -72 -7 -94 31 -10 17 -34 37 -52 45 -31 13 -34 18 -34 59 0 24 5 47 11 51 8 4 2 12 -15 21 -32 17 -33 38 -6 151 23 95 42 137 71 155 11 6 37 35 58 62 31 41 39 61 43 108 5 67 31 106 49 75 18 -33 14 -37 160 120 37 39 59 71 59 86 0 34 -34 71 -80 90 -25 10 -48 28 -58 47 -10 18 -28 32 -45 36 -33 7 -50 37 -93 162 -32 95 -76 151 -117 151 -17 0 -44 -17 -80 -50z";

// City/silo coordinates derived from lat/lon, scaled to fit the new mapsicon outlines.
// Russia frame: lon 22..170 → x 10..350, lat 78..41 → y 10..200 (190 tall)
// USA frame:    lon -125..-67 → x 10..350, lat 49..25 → y 220..400 (180 tall)
const WOPR_RU_CITIES = [
  { id:"mow", name:"MOSCOW",         pop:12.5, x:46,  y:124, region:"west"    },
  { id:"spb", name:"ST PETERSBURG",  pop:5.4,  x:29,  y:103, region:"west"    },
  { id:"nov", name:"NOVOSIBIRSK",    pop:1.6,  x:150, y:128, region:"east"    },
  { id:"ykt", name:"YEKATERINBURG",  pop:1.5,  x:99,  y:119, region:"central" },
  { id:"nnv", name:"N NOVGOROD",     pop:1.2,  x:60,  y:121, region:"west"    },
  { id:"kaz", name:"KAZAN",          pop:1.2,  x:72,  y:124, region:"central" },
  { id:"che", name:"CHELYABINSK",    pop:1.1,  x:100, y:127, region:"central" },
  { id:"oms", name:"OMSK",           pop:1.2,  x:128, y:128, region:"east"    },
  { id:"sam", name:"SAMARA",         pop:1.1,  x:75,  y:138, region:"west"    },
  { id:"ros", name:"ROSTOV",         pop:1.1,  x:51,  y:168, region:"west"    },
];

const WOPR_US_CITIES = [
  { id:"nyc", name:"NEW YORK",       pop:8.3,  x:309, y:282, region:"east"    },
  { id:"la",  name:"LOS ANGELES",    pop:4.0,  x:50,  y:332, region:"west"    },
  { id:"chi", name:"CHICAGO",        pop:2.7,  x:229, y:273, region:"central" },
  { id:"hou", name:"HOUSTON",        pop:2.3,  x:184, y:364, region:"south"   },
  { id:"phx", name:"PHOENIX",        pop:1.6,  x:86,  y:336, region:"west"    },
  { id:"phi", name:"PHILADELPHIA",   pop:1.6,  x:302, y:288, region:"east"    },
  { id:"sat", name:"SAN ANTONIO",    pop:1.4,  x:165, y:367, region:"south"   },
  { id:"sdg", name:"SAN DIEGO",      pop:1.4,  x:56,  y:342, region:"west"    },
  { id:"dal", name:"DALLAS",         pop:1.3,  x:175, y:342, region:"south"   },
  { id:"det", name:"DETROIT",        pop:0.7,  x:256, y:270, region:"central" },
];

// Silos spread across both countries to give visual variety and AI better-distributed targets.
const WOPR_RU_SILOS = [
  { id:"rs1", name:"KOZELSK",        x:41,  y:133, region:"west"    },
  { id:"rs2", name:"VYPOLZOVO",      x:35,  y:118, region:"west"    },
  { id:"rs3", name:"TATISHCHEVO",    x:64,  y:145, region:"west"    },
  { id:"rs4", name:"DOMBARVSK",      x:96,  y:148, region:"central" },
  { id:"rs5", name:"KARTALY",        x:99,  y:138, region:"central" },
  { id:"rs6", name:"ALEYSK",         x:155, y:135, region:"east"    },
  { id:"rs7", name:"IRKUTSK",        x:200, y:140, region:"east"    },
  { id:"rs8", name:"KHABAROVSK",     x:262, y:160, region:"east"    },
];

const WOPR_US_SILOS = [
  { id:"ss1", name:"MALMSTROM",      x:91,  y:252, region:"central" },
  { id:"ss2", name:"FAIRCHILD",      x:74,  y:256, region:"west"    },
  { id:"ss3", name:"MINOT",          x:149, y:248, region:"central" },
  { id:"ss4", name:"FE WARREN",      x:128, y:284, region:"west"    },
  { id:"ss5", name:"WHITEMAN",       x:194, y:298, region:"central" },
  { id:"ss6", name:"VANDENBERG",     x:54,  y:316, region:"west"    },
  { id:"ss7", name:"PLATTSBURGH",    x:296, y:255, region:"east"    },
  { id:"ss8", name:"ROBINS",         x:248, y:328, region:"south"   },
];

// Submarines + bombers are placed RANDOMLY at game start (within their respective zones)
// so per-game distance distributions vary — see wopr_genSubs / wopr_genBombers below.
// Each sub carries 2 missiles, fires up to 2 per round.
// Each bomber carries 1 sortie, fires once per game.
const WOPR_SUB_NAMES = {
  us: ["PACIFIC SSBN", "ATLANTIC SSBN", "GULF SSBN"],
  ru: ["NORTHERN FLEET", "PACIFIC FLEET", "BLACK SEA FLT"],
};
const WOPR_BOMBER_NAMES = {
  us: ["B-52", "B-1", "B-2", "B-21"],
  ru: ["TU-95", "TU-160", "TU-22", "TU-95MS"],
};

// ── Personalities (PRD §8.6) ──────────────────────────────────────────────────
const WOPR_PERSONALITY_KEYS = ["firstStrike","populationStrike","decapitation","defenseHeavy","deescalatory","erratic"];
const WOPR_PERSONALITIES = {
  firstStrike:      { baseLaunch: 0.95, basePass: 0.05, target: "silosThenPop",   intercept: "low"    },
  populationStrike: { baseLaunch: 0.65, basePass: 0.10, target: "highestPop",     intercept: "medium" },
  decapitation:     { baseLaunch: 0.70, basePass: 0.15, target: "silosOnly",      intercept: "medium" },
  defenseHeavy:     { baseLaunch: 0.30, basePass: 0.30, target: "convenient",     intercept: "max"    },
  deescalatory:     { baseLaunch: 0.10, basePass: 0.60, target: "lowPop",         intercept: "high"   },
  erratic:          { baseLaunch: "rand", basePass: "rand", target: "rand",       intercept: "rand"   },
};
const WOPR_PERSONALITY_LABELS = {
  firstStrike: "FIRST STRIKE",
  populationStrike: "POPULATION STRIKE",
  decapitation: "DECAPITATION",
  defenseHeavy: "DEFENSE HEAVY",
  deescalatory: "DE-ESCALATORY",
  erratic: "ERRATIC",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function wopr_deepClone(s) { return JSON.parse(JSON.stringify(s)); }
function wopr_getSide(state, side) { return side === "us" ? state.us : state.ru; }
function wopr_aliveCities(state, side) { return wopr_getSide(state, side).cities.filter(c => c.alive); }
function wopr_aliveSilos(state, side)   { return wopr_getSide(state, side).silos.filter(s => s.alive && !s.launched); }
function wopr_aliveSubs(state, side)    { return wopr_getSide(state, side).subs.filter(s => s.alive && !s.launched); }
function wopr_aliveBombers(state, side) { return wopr_getSide(state, side).bombers.filter(s => s.alive && !s.launched); }
function wopr_aliveSources(state, side) { return [...wopr_aliveSilos(state, side), ...wopr_aliveSubs(state, side), ...wopr_aliveBombers(state, side)]; }
function wopr_findSource(state, side, id) {
  const x = wopr_getSide(state, side);
  return x.silos.find(s => s.id === id) || x.subs.find(s => s.id === id) || x.bombers.find(s => s.id === id);
}
function wopr_totalCasualties(state, side) { return wopr_getSide(state, side).cities.reduce((n, c) => n + c.casualties, 0); }
function wopr_isDestroyed(state, side) { return wopr_getSide(state, side).cities.every(c => !c.alive); }
function wopr_distance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function wopr_distNorm(d) {
  return Math.max(0, Math.min(1, (d - WOPR_DIST_MIN) / (WOPR_DIST_MAX - WOPR_DIST_MIN)));
}
// Intercept chance — distance + region. Closer = harder (less warning).
// Range: ~30% (point-blank, cross-region) to ~95% (cross-continental, same-region).
function wopr_interceptChance(defenderCity, source, target) {
  if (!source || !target) return 0.6; // safe fallback
  const dn = wopr_distNorm(wopr_distance(source, target));
  const sameRegion = defenderCity.region === target.region ? 1 : 0;
  return Math.max(0.30, Math.min(0.95, 0.40 + 0.50 * dn + 0.05 * sameRegion));
}
// Bomber AAA reach — distance only. Closer target = less AAA exposure.
// Range: ~30% (cross-continental) to ~85% (point-blank).
function wopr_bomberReach(source, target) {
  if (!source || !target) return 0.5;
  const dn = wopr_distNorm(wopr_distance(source, target));
  return Math.max(0.30, Math.min(0.85, 0.75 - 0.40 * dn));
}
// Per-city interceptor count: 1–3, weighted (25/50/25).
function wopr_pickInterceptorCount() {
  const r = Math.random();
  if (r < 0.25) return 1;
  if (r < 0.75) return 2;
  return 3;
}
function wopr_pickInRange(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function wopr_pickRandomN(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

// Region by x coord, used when generating randomly-placed launch platforms.
function wopr_regionFromX(x) {
  if (x < 130) return "west";
  if (x > 230) return "east";
  return "central";
}

// Random sub placement — in international waters above USSR or below USA.
// Distributes x across the map width to avoid clustering.
function wopr_genSubs(side, n) {
  const yBand = side === "us" ? [407, 418] : [3, 14];
  // Slice the width into n bands and place one sub per band (shuffled) so they spread.
  const bandWidth = 320 / Math.max(1, n);
  const xs = [];
  for (let i = 0; i < n; i++) {
    const min = 20 + i * bandWidth;
    const max = min + bandWidth;
    xs.push(wopr_pickInRange(Math.round(min), Math.round(max)));
  }
  // Shuffle so sub names don't always go left-to-right
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs.map((x, i) => ({
    id: `${side}_sub_${i}`,
    name: WOPR_SUB_NAMES[side][i] || `SSBN ${i + 1}`,
    x, y: wopr_pickInRange(yBand[0], yBand[1]),
    region: wopr_regionFromX(x), kind: "sub",
  }));
}

// Random bomber placement — within the country's interior.
function wopr_genBombers(side, n) {
  const xRange = [50, 300];
  const yRange = side === "us" ? [240, 370] : [85, 175];
  const bandWidth = (xRange[1] - xRange[0]) / Math.max(1, n);
  const positions = [];
  for (let i = 0; i < n; i++) {
    const min = xRange[0] + i * bandWidth;
    const max = min + bandWidth;
    positions.push({
      x: wopr_pickInRange(Math.round(min), Math.round(max)),
      y: wopr_pickInRange(yRange[0], yRange[1]),
    });
  }
  // Shuffle so bomber names don't always go left-to-right
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions.map((p, i) => ({
    id: `${side}_bmb_${i}`,
    name: WOPR_BOMBER_NAMES[side][i] || `BOMBER ${i + 1}`,
    x: p.x, y: p.y,
    region: wopr_regionFromX(p.x), kind: "bomber",
  }));
}
function wopr_rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function wopr_findTarget(state, targetSide, targetId) {
  const side = wopr_getSide(state, targetSide);
  return side.cities.find(c => c.id === targetId) || side.silos.find(s => s.id === targetId);
}
// Display labels for log/UI messages so weapon and target type are always clear.
const WOPR_KIND_TAG = { silo: "SILO", sub: "SSBN", bomber: "BOMBER", city: "CITY" };
function wopr_label(obj) {
  if (!obj) return "?";
  const tag = WOPR_KIND_TAG[obj.kind];
  return tag ? `${obj.name} (${tag})` : obj.name;
}
function wopr_oppSide(side) { return side === "us" ? "ru" : "us"; }
function wopr_modeIsCpu(mode) { return mode && mode !== "human"; }

// ── Init ──────────────────────────────────────────────────────────────────────
function wopr_pickPersonality(mode) {
  if (mode === "impossible") return wopr_rand(WOPR_PERSONALITY_KEYS); // adapts each turn anyway
  return wopr_rand(WOPR_PERSONALITY_KEYS);
}

function wopr_initState(usMode = "human", ruMode = "human") {
  const makeCity = c => ({ ...c, kind: "city", alive: true, interceptors: wopr_pickInterceptorCount(),
    casualties: 0, bias: 1 + (Math.random() - 0.5) * 0.6 });
  // Silo data doesn't carry a kind field; subs/bombers come from generators that set it.
  const makeSource = s => ({ ...s, kind: s.kind || "silo", alive: true, launched: false });

  // Per-side independent rolls — each game has a different operational arsenal.
  // Bounded by available data positions (8 silos / 2 subs / 3 bombers per side).
  const usCities = WOPR_US_CITIES.map(makeCity);
  const ruCities = WOPR_RU_CITIES.map(makeCity);
  const usSilos = wopr_pickRandomN(WOPR_US_SILOS, wopr_pickInRange(5, 8)).map(makeSource);
  const ruSilos = wopr_pickRandomN(WOPR_RU_SILOS, wopr_pickInRange(5, 8)).map(makeSource);
  const usSubs  = wopr_genSubs("us",     wopr_pickInRange(1, 3)).map(makeSource);
  const ruSubs  = wopr_genSubs("ru",     wopr_pickInRange(1, 3)).map(makeSource);
  const usBmbrs = wopr_genBombers("us",  wopr_pickInRange(2, 4)).map(makeSource);
  const ruBmbrs = wopr_genBombers("ru",  wopr_pickInRange(2, 4)).map(makeSource);
  const usMaxInterceptors = usCities.reduce((n, c) => n + c.interceptors, 0);
  const ruMaxInterceptors = ruCities.reduce((n, c) => n + c.interceptors, 0);

  return {
    phase: "intro",
    defcon: 3,
    round: 1,
    usMode, ruMode,
    usPersonality: wopr_modeIsCpu(usMode) ? wopr_pickPersonality(usMode) : null,
    ruPersonality: wopr_modeIsCpu(ruMode) ? wopr_pickPersonality(ruMode) : null,
    usPassedLast: false,
    ruPassedLast: false,
    log: ["WOPR ONLINE.", "GREETINGS, PROFESSOR FALKEN.", "SHALL WE PLAY A GAME?"],
    us: { cities: usCities, silos: usSilos, subs: usSubs, bombers: usBmbrs, maxInterceptors: usMaxInterceptors },
    ru: { cities: ruCities, silos: ruSilos, subs: ruSubs, bombers: ruBmbrs, maxInterceptors: ruMaxInterceptors },
    usLaunches:   [],   // {siloId, targetId, targetSide}  — siloId is the LAUNCH SOURCE id (silo / sub / bomber)
    ruLaunches:   [],
    usIntercepts: [],   // {cityId, missileIdx, chance}  — defending against ruLaunches
    ruIntercepts: [],   // defending against usLaunches
    selectedSilo: null,
    selectedInterceptCity: null,
  };
}

// ── CPU AI: target ranking ────────────────────────────────────────────────────
function wopr_rankCityTargets(state, attackerSide, mode) {
  const defenderSide = wopr_oppSide(attackerSide);
  const cities = wopr_aliveCities(state, defenderSide);
  const ranked = cities.map(c => ({ ...c, score: c.pop * (c.bias || 1) }));
  ranked.sort((a, b) => b.score - a.score);
  if (mode === "highestPop") return ranked;
  if (mode === "lowPop")     return [...ranked].reverse();
  if (mode === "rand")       { const a = [...ranked]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  return ranked;
}
function wopr_rankSiloTargets(state, attackerSide) {
  const defenderSide = wopr_oppSide(attackerSide);
  return wopr_getSide(state, defenderSide).silos.filter(s => s.alive && !s.launched);
}

// ── CPU AI: launches ──────────────────────────────────────────────────────────
function wopr_pickLaunches(state, side, personality, difficulty) {
  const p = WOPR_PERSONALITIES[personality];
  const opponentPassed = side === "us" ? state.ruPassedLast : state.usPassedLast;
  const passProb = wopr_passProbability(state, side, personality, opponentPassed);
  if (Math.random() < passProb) return [];

  const sources = wopr_aliveSources(state, side);
  if (sources.length === 0) return [];

  // Decide volume — fraction of sources that fire (each source fires up to 2 missiles)
  let baseRate = p.baseLaunch === "rand" ? Math.random() : p.baseLaunch;
  if (difficulty === "easy") baseRate *= 0.7 + Math.random() * 0.6; // 0.7-1.3x noise
  if (difficulty === "medium") baseRate *= 0.85 + Math.random() * 0.3;
  // Hard/Impossible: full base rate

  // Heavy escalation if own cities heavily damaged
  const ownCasualtyFrac = (10 - wopr_aliveCities(state, side).length) / 10;
  if (ownCasualtyFrac > 0.5 && personality !== "deescalatory") baseRate = Math.min(1, baseRate * 1.3);

  const numSourcesToFire = Math.max(1, Math.round(sources.length * baseRate));
  const silosToUse = sources.slice(0, Math.min(numSourcesToFire, sources.length));

  // Pick target priority based on personality
  const useSilos = (personality === "firstStrike" || personality === "decapitation");
  const cityRankMode =
    personality === "populationStrike" ? "highestPop" :
    personality === "deescalatory"     ? "lowPop" :
    personality === "erratic"          ? "rand" :
    "highestPop";

  const cityTargets = wopr_rankCityTargets(state, side, cityRankMode);
  const siloTargets = wopr_rankSiloTargets(state, side);

  const launches = [];
  let cityIdx = 0, siloIdx = 0;

  for (const silo of silosToUse) {
    // Bombers fire 1 missile (single target); silos and subs fire up to 2.
    const isBomber = silo.kind === "bomber";
    const maxFromSource = isBomber ? 1 : 2;
    const missilesFromSilo = Math.min(maxFromSource, Math.random() < 0.6 ? 2 : 1);
    for (let m = 0; m < missilesFromSilo; m++) {
      let target = null, targetSide = null;
      if (personality === "decapitation") {
        if (siloIdx < siloTargets.length) { target = siloTargets[siloIdx++]; targetSide = wopr_oppSide(side); }
        else if (cityIdx < cityTargets.length) { target = cityTargets[cityIdx++]; targetSide = wopr_oppSide(side); }
      } else if (useSilos && siloIdx < siloTargets.length && Math.random() < 0.5) {
        target = siloTargets[siloIdx++]; targetSide = wopr_oppSide(side);
      } else if (cityIdx < cityTargets.length) {
        target = cityTargets[cityIdx++]; targetSide = wopr_oppSide(side);
      }
      if (target) launches.push({ siloId: silo.id, targetId: target.id, targetSide, isBomber });
    }
  }

  // Difficulty-based mistakes — easy may target destroyed cities
  if (difficulty === "easy" && launches.length > 0 && Math.random() < 0.25) {
    const allCities = wopr_getSide(state, wopr_oppSide(side)).cities;
    const dead = allCities.filter(c => !c.alive);
    if (dead.length) {
      const idx = Math.floor(Math.random() * launches.length);
      launches[idx] = { ...launches[idx], targetId: wopr_rand(dead).id };
    }
  }

  return launches;
}

// ── CPU AI: pass probability (PRD §8.8) ───────────────────────────────────────
function wopr_passProbability(state, side, personality, opponentPassed) {
  const p = WOPR_PERSONALITIES[personality];
  let pp = p.basePass === "rand" ? Math.random() * 0.6 : p.basePass;
  if (opponentPassed) {
    const mult = personality === "deescalatory" ? 4 :
                 personality === "defenseHeavy" ? 3 :
                 personality === "decapitation" ? 2.5 : 2.5;
    pp = Math.min(0.95, pp * mult);
  }
  // Heavy own casualties → escalate de-escalation pressure
  const ownLost = 10 - wopr_aliveCities(state, side).length;
  if (ownLost > 5) pp = Math.min(0.95, pp * 1.4);
  // ±20% noise
  pp = Math.max(0, Math.min(1, pp * (0.8 + Math.random() * 0.4)));
  return pp;
}

// ── CPU AI: intercepts ────────────────────────────────────────────────────────
function wopr_pickIntercepts(state, side, personality, difficulty, incomingLaunches) {
  if (incomingLaunches.length === 0) return [];
  const p = WOPR_PERSONALITIES[personality];

  // Cap = max(0, side_max_interceptors - own_missiles_launched_this_step * 3)
  const ownLaunchCount = (side === "us" ? state.usLaunches : state.ruLaunches).length;
  const sideMax = wopr_getSide(state, side).maxInterceptors || 20;
  const cap = Math.max(0, sideMax - ownLaunchCount * 3);

  // Available interceptor pool from alive cities
  const cities = wopr_aliveCities(state, side).map(c => ({ ...c, available: c.interceptors }));
  let totalAvailable = cities.reduce((n, c) => n + c.available, 0);
  let totalUsable = Math.min(cap, totalAvailable);
  if (totalUsable === 0) return [];

  // Score incoming missiles: prioritize highest-pop targets
  const attackerSide = wopr_oppSide(side);
  const allMissiles = incomingLaunches.map((l, idx) => {
    const tgt = wopr_findTarget(state, l.targetSide, l.targetId);
    const src = wopr_findSource(state, attackerSide, l.siloId);
    return { idx, launch: l, target: tgt, source: src, value: tgt ? (tgt.pop || 0.3) : 0 };
  });
  // Sort by value desc — highest-value first
  allMissiles.sort((a, b) => b.value - a.value);

  // Stacking style by personality
  const maxStack =
    p.intercept === "max"    ? 3 :
    p.intercept === "high"   ? 2 :
    p.intercept === "medium" ? 2 :
    p.intercept === "low"    ? 1 :
    p.intercept === "rand"   ? (1 + Math.floor(Math.random() * 3)) : 1;

  // Easy/medium chance of mistakes — sometimes intercept low-value targets first
  if (difficulty === "easy" && Math.random() < 0.4) {
    allMissiles.reverse();
  }

  const intercepts = [];
  for (const m of allMissiles) {
    if (totalUsable === 0) break;
    const stack = Math.min(maxStack, totalUsable);
    let assigned = 0;
    while (assigned < stack && totalUsable > 0) {
      // Find best city: prefer same-region (90% chance), with available interceptor
      let pool = cities.filter(c => c.available > 0);
      if (pool.length === 0) break;
      const sameRegion = pool.filter(c => c.region === (m.target?.region || ""));
      const candidate = sameRegion.length ? sameRegion[0] : pool[0];
      candidate.available--;
      const chance = wopr_interceptChance(candidate, m.source, m.target);
      intercepts.push({ cityId: candidate.id, missileIdx: m.idx, chance });
      totalUsable--;
      assigned++;
    }
  }
  return intercepts;
}

// ── Resolution ────────────────────────────────────────────────────────────────
function wopr_resolveRound(state) {
  const s = wopr_deepClone(state);
  const log = [];

  // Step 1: silo strikes are immediate (silos hit before launch)
  const immediateDestroy = (launches, defendSide) => {
    for (const l of launches) {
      if (l.targetSide !== defendSide) continue;
      const silo = wopr_getSide(s, defendSide).silos.find(x => x.id === l.targetId);
      if (silo?.alive) {
        silo.alive = false;
        log.push(`▸ SILO ${silo.name} [${defendSide.toUpperCase()}] HIT BEFORE LAUNCH — disarmed`);
      }
    }
  };
  immediateDestroy(s.usLaunches, "ru");
  immediateDestroy(s.ruLaunches, "us");

  // Step 2: intercepts resolve (only against missile launches; bombers skip this)
  const resolveIntercepts = (intercepts, launches, defSide) => {
    const blocked = new Set();
    for (const ic of intercepts) {
      if (blocked.has(ic.missileIdx)) continue;
      // Bomber launches can't be intercepted by city interceptors — silently skip the assignment.
      if (launches[ic.missileIdx]?.isBomber) continue;
      const city = wopr_getSide(s, defSide).cities.find(c => c.id === ic.cityId);
      if (!city?.alive || city.interceptors <= 0) continue;
      city.interceptors--;
      if (Math.random() < ic.chance) {
        blocked.add(ic.missileIdx);
        log.push(`▸ INTERCEPT [${Math.round(ic.chance*100)}%] — MISSILE NEUTRALIZED`);
      } else {
        log.push(`▸ INTERCEPT FAILED [${Math.round(ic.chance*100)}%] — MISSILE THROUGH`);
      }
    }
    return blocked;
  };
  // usIntercepts defend against ruLaunches; ruIntercepts defend against usLaunches
  const ruBlocked = resolveIntercepts(s.usIntercepts, s.ruLaunches, "us");
  const usBlocked = resolveIntercepts(s.ruIntercepts, s.usLaunches, "ru");

  // Step 3: strikes resolve. Bombers roll an AAA-reach check independently.
  const resolveStrikes = (launches, blocked, defendSide) => {
    for (let i = 0; i < launches.length; i++) {
      const l = launches[i];
      if (l.targetSide !== defendSide) continue;
      if (l.isBomber) {
        // Distance-based AAA: closer targets are easier to reach (less time over hostile territory).
        const attacker = (defendSide === "us") ? "ru" : "us";
        const src = wopr_findSource(s, attacker, l.siloId);
        const tgt = wopr_findTarget(s, l.targetSide, l.targetId);
        const reach = wopr_bomberReach(src, tgt);
        if (Math.random() > reach) {
          log.push(`▸ BOMBER SHOT DOWN BY AAA [${Math.round(reach*100)}% REACH] — TARGET INTACT`);
          continue;
        }
      } else if (blocked.has(i)) {
        continue;
      }
      const city = wopr_getSide(s, defendSide).cities.find(c => c.id === l.targetId);
      if (city?.alive) {
        city.alive = false;
        const pct = 0.5 + Math.random() * 0.4;
        city.casualties = Math.round(city.pop * pct * 10) / 10;
        const verb = l.isBomber ? "BOMBED" : "STRUCK";
        log.push(`▸ CITY ${city.name} [${defendSide.toUpperCase()}] ${verb} — ${city.casualties.toFixed(1)}M CASUALTIES`);
      }
      const silo = wopr_getSide(s, defendSide).silos.find(x => x.id === l.targetId);
      if (silo?.alive) {
        silo.alive = false;
        log.push(`▸ SILO ${silo.name} [${defendSide.toUpperCase()}] DESTROYED`);
      }
    }
  };
  resolveStrikes(s.usLaunches, usBlocked, "ru");
  resolveStrikes(s.ruLaunches, ruBlocked, "us");

  // Step 4: mark fired sources (silos, subs, AND bombers)
  const markFired = (launches, side) => {
    for (const l of launches) {
      const src = s[side].silos.find(x => x.id === l.siloId)
              || s[side].subs.find(x => x.id === l.siloId)
              || s[side].bombers.find(x => x.id === l.siloId);
      if (src) src.launched = true;
    }
  };
  markFired(s.usLaunches, "us");
  markFired(s.ruLaunches, "ru");

  // Step 5: track passes for next round's logic
  s.usPassedLast = s.usLaunches.length === 0;
  s.ruPassedLast = s.ruLaunches.length === 0;

  // Step 6: DEFCON — start at 3, climb to 5 on launches, decay toward 2 in quiet rounds
  const totalLaunched = s.usLaunches.length + s.ruLaunches.length;
  const upLabels = {
    4: "DEFCON 4 — ELEVATED ALERT",
    5: "DEFCON 5 — MAXIMUM READINESS",
  };
  const downLabels = {
    3: "DEFCON 3 — STANDING DOWN",
    2: "DEFCON 2 — DE-ESCALATION",
  };
  if (totalLaunched > 0 && s.defcon < 5) {
    s.defcon++;
    if (upLabels[s.defcon]) log.push(`▸ ${upLabels[s.defcon]}`);
  } else if (totalLaunched === 0 && s.defcon > 2) {
    s.defcon--;
    if (downLabels[s.defcon]) log.push(`▸ ${downLabels[s.defcon]}`);
  }

  // Clear launch queues for next round
  s.usLaunches = [];
  s.ruLaunches = [];
  s.usIntercepts = [];
  s.ruIntercepts = [];
  s.selectedSilo = null;
  s.selectedInterceptCity = null;

  s.round++;
  s.log = [...s.log, ...log];

  // Step 7: end conditions
  const usGone = wopr_isDestroyed(s, "us");
  const ruGone = wopr_isDestroyed(s, "ru");
  const noSources = wopr_aliveSources(s, "us").length === 0 && wopr_aliveSources(s, "ru").length === 0;
  // Peace via de-escalation: DEFCON has decayed to 2 (which only happens after quiet round(s)).
  const deescalated = s.defcon === 2 && totalLaunched === 0;
  if (usGone || ruGone || noSources) {
    s.phase = "gameover";
    if (usGone && ruGone) {
      s.log.push("", "A STRANGE GAME.", "THE ONLY WINNING MOVE IS NOT TO PLAY.");
    } else if (ruGone) {
      s.log.push("", `USA VICTORIOUS. GLOBAL CASUALTIES: ${(wopr_totalCasualties(s,"us")+wopr_totalCasualties(s,"ru")).toFixed(1)}M`);
    } else if (usGone) {
      s.log.push("", `USSR VICTORIOUS. GLOBAL CASUALTIES: ${(wopr_totalCasualties(s,"us")+wopr_totalCasualties(s,"ru")).toFixed(1)}M`);
    } else {
      s.log.push("", "ALL SILOS EXPENDED. STALEMATE.", "THE ONLY WINNING MOVE IS NOT TO PLAY.");
    }
  } else if (deescalated) {
    s.phase = "gameover";
    const totalCas = (wopr_totalCasualties(s,"us") + wopr_totalCasualties(s,"ru")).toFixed(1);
    s.log.push("",
      "DEFCON 2 — DE-ESCALATION ACHIEVED.",
      "THE ONLY WINNING MOVE IS NOT TO PLAY.",
      "STAND DOWN INITIATED.",
      `▸ TOTAL CASUALTIES: ${totalCas}M`);
  } else {
    s.phase = "us_launch";
    s.log.push(`▸ ROUND ${s.round} — USA LAUNCH ORDERS`);
  }
  return s;
}

// ── DEFCON bar ────────────────────────────────────────────────────────────────
function WOPR_DefconBar({ level }) {
  // Game uses inverted-DEFCON semantics: higher number = higher tension. 5 = launches in flight, 2 = peace.
  const tone = level >= 5 ? WOPR_C.red : level === 4 ? WOPR_C.amber : WOPR_C.bright;
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      <span style={{ fontSize: 8, color: WOPR_C.mid, letterSpacing: "0.2em", marginRight: 6 }}>DEFCON</span>
      {[1,2,3,4,5].map(n => {
        const lit = n <= level;
        return <div key={n} style={{ width: 14, height: 8,
          background: lit ? tone : WOPR_C.dimmer,
          opacity: lit ? 1 : 0.5,
        }} />;
      })}
      <span style={{ fontSize: 8, color: tone, letterSpacing: "0.2em", marginLeft: 6 }}>
        {level}
      </span>
    </div>
  );
}

// ── Field manual / help modal ─────────────────────────────────────────────────
function WOPR_HelpModal({ onClose }) {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: WOPR_C.hot, letterSpacing: "0.25em", marginBottom: 6, fontWeight: "bold" }}>
        {title}
      </div>
      <div style={{ fontSize: 10, color: WOPR_C.bright, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
  const IconRow = ({ swatch, label, desc }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 22, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>{swatch}</div>
      <div style={{ flex: 1, fontSize: 10 }}>
        <span style={{ color: WOPR_C.hot, fontWeight: "bold" }}>{label}</span>
        <span style={{ color: WOPR_C.bright }}> — {desc}</span>
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      zIndex: 200, padding: 16, overflowY: "auto",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        marginTop: 24, marginBottom: 24,
        maxWidth: 360, width: "100%",
        background: WOPR_C.bg, border: `2px solid ${WOPR_C.bright}`,
        padding: 16, borderRadius: 4,
        fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ color: WOPR_C.hot, fontSize: 12, letterSpacing: "0.25em", fontWeight: "bold" }}>
            ▸ FIELD MANUAL
          </span>
          <button onClick={onClose} style={{
            background: "transparent", border: `2px solid ${WOPR_C.bright}`,
            color: WOPR_C.bright, width: 26, height: 26,
            cursor: "pointer", borderRadius: "50%", fontWeight: "bold",
            fontFamily: "'Courier New', monospace", fontSize: 12,
          }} aria-label="Close">✕</button>
        </div>

        <Section title="UNITS">
          <IconRow
            swatch={<svg width={18} height={14}><circle cx={9} cy={7} r={4} fill={WOPR_C.usaCol} /></svg>}
            label="CITY"
            desc="10/side, 1–3 interceptors each."
          />
          <IconRow
            swatch={<svg width={18} height={14}><polygon points="9,1 1,12 17,12" fill={WOPR_C.siloCol} /></svg>}
            label="SILO"
            desc="5–8/side × 2 missiles. Targetable."
          />
          <IconRow
            swatch={<svg width={22} height={14}><polygon points="2,7 6,3 16,3 20,7 16,11 6,11" fill={WOPR_C.subCol} /><rect x={9} y={1} width={4} height={2} fill={WOPR_C.subCol} /></svg>}
            label="SSBN"
            desc="1–3/side × 2 missiles. Untargetable. Random patrol position each game."
          />
          <IconRow
            swatch={<svg width={18} height={14}><polygon points="9,2 17,11 9,8 1,11" fill={WOPR_C.bomberCol} /></svg>}
            label="BOMBER"
            desc="2–4/side, 1 sortie. Un-interceptable; reach scales with distance. Random base each game."
          />
        </Section>

        <Section title="FLOW">
          <div>Each round: both sides launch (blind), both assign interceptors, then resolve. Each game's arsenal is randomized — recon early.</div>
        </Section>

        <Section title="INTERCEPTS">
          <div>Chance scales with travel distance — closer launches are <span style={{ color: WOPR_C.hot, fontWeight: "bold" }}>harder</span> to intercept (less warning). Range: <span style={{ color: WOPR_C.hot, fontWeight: "bold" }}>30%–95%</span>. Same-region defenders get a small bonus. Stack interceptors per missile to compound. Cap = total − launches × 3.</div>
          <div style={{ marginTop: 4, color: WOPR_C.amber }}>Bombers skip city interceptors entirely; they roll AAA reach (30%–85%, also distance-based).</div>
        </Section>

        <Section title="END">
          <div>• Cities all destroyed → victory.</div>
          <div>• Both annihilated → mutual.</div>
          <div>• All sources expended → stalemate.</div>
          <div>• DEFCON 2 (quiet rounds) → peace.</div>
        </Section>

        <button onClick={onClose} style={{
          width: "100%", marginTop: 4,
          background: "transparent", border: `2px solid ${WOPR_C.hot}`,
          color: WOPR_C.hot, padding: 8, fontSize: 10,
          letterSpacing: "0.25em", cursor: "pointer", fontWeight: "bold",
          fontFamily: "'Courier New', monospace",
        }}>CLOSE</button>
      </div>
    </div>
  );
}

// ── Mode selector (intro screen) ──────────────────────────────────────────────
// Resolves the unified ModeBar/DiffBar/side selection into per-side WOPR modes.
function wopr_resolveModes(uiMode, difficulty, humanSide) {
  if (uiMode === "vs-human") return { usMode: "human", ruMode: "human" };
  if (uiMode === "cpu-cpu")  return { usMode: difficulty, ruMode: difficulty };
  // vs-cpu
  if (humanSide === "us")    return { usMode: "human", ruMode: difficulty };
  return { usMode: difficulty, ruMode: "human" };
}

// ── Main component ────────────────────────────────────────────────────────────
function WOPR({ onBack }) {
  const [state, setState] = useState(() => wopr_initState());
  const [uiMode, setUiMode] = useState("vs-cpu");
  const [uiDifficulty, setUiDifficulty] = useState("hard");
  const [humanSide, setHumanSide] = useState("us");
  const [showHelp, setShowHelp] = useState(false);
  const logRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  // Resolve auto-advances after a brief delay (to show animation phase)
  useEffect(() => {
    if (state.phase !== "resolve") return;
    const t = setTimeout(() => setState(wopr_resolveRound), 1500);
    return () => clearTimeout(t);
  }, [state.phase]);

  // CPU driver — auto-play CPU phases
  useEffect(() => {
    const phase = state.phase;
    if (phase === "intro" || phase === "resolve" || phase === "gameover") return;

    const sideMap = { us_launch: "us", ru_launch: "ru", us_intercept: "us", ru_intercept: "ru" };
    const activeSide = sideMap[phase];
    if (!activeSide) return;
    const mode = activeSide === "us" ? state.usMode : state.ruMode;
    if (!wopr_modeIsCpu(mode)) return;

    const personality = activeSide === "us" ? state.usPersonality : state.ruPersonality;
    const isLaunch = phase.endsWith("_launch");
    const delayMs = (state.usMode !== "human" && state.ruMode !== "human") ? 1300 : 700;

    const t = setTimeout(() => {
      setState(s => {
        if (isLaunch) {
          const launches = wopr_pickLaunches(s, activeSide, personality, mode);
          const key = activeSide === "us" ? "usLaunches" : "ruLaunches";
          const msg = launches.length > 0
            ? `▸ ${activeSide.toUpperCase()} LAUNCHES ${launches.length} MISSILE${launches.length>1?"S":""} [${WOPR_PERSONALITY_LABELS[personality]}]`
            : `▸ ${activeSide.toUpperCase()} PASSES — AWAITING OPPONENT RESPONSE`;
          return { ...s, [key]: launches, log: [...s.log, msg], phase: wopr_nextPhase(phase) };
        } else {
          const incomingKey = activeSide === "us" ? "ruLaunches" : "usLaunches";
          const intercepts = wopr_pickIntercepts(s, activeSide, personality, mode, s[incomingKey]);
          const key = activeSide === "us" ? "usIntercepts" : "ruIntercepts";
          const msg = intercepts.length > 0
            ? `▸ ${activeSide.toUpperCase()} ASSIGNS ${intercepts.length} INTERCEPTOR${intercepts.length>1?"S":""}`
            : `▸ ${activeSide.toUpperCase()} HOLDS INTERCEPTORS`;
          return { ...s, [key]: intercepts, log: [...s.log, msg], phase: wopr_nextPhase(phase) };
        }
      });
    }, delayMs);
    return () => clearTimeout(t);
  }, [state.phase, state.usMode, state.ruMode, state.usPersonality, state.ruPersonality]);

  // ── Phase plumbing ──────────────────────────────────────────────────────────
  function wopr_nextPhase(phase) {
    if (phase === "us_launch")    return "ru_launch";
    if (phase === "ru_launch")    return "us_intercept";
    if (phase === "us_intercept") return "ru_intercept";
    if (phase === "ru_intercept") return "resolve";
    return phase;
  }
  function activeSide() {
    if (state.phase === "us_launch" || state.phase === "us_intercept") return "us";
    if (state.phase === "ru_launch" || state.phase === "ru_intercept") return "ru";
    return null;
  }
  function isLaunchPhase() { return state.phase === "us_launch" || state.phase === "ru_launch"; }
  function isInterceptPhase() { return state.phase === "us_intercept" || state.phase === "ru_intercept"; }
  function activeIsHuman() {
    const side = activeSide();
    if (!side) return false;
    return (side === "us" ? state.usMode : state.ruMode) === "human";
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function startGame() {
    const { usMode, ruMode } = wopr_resolveModes(uiMode, uiDifficulty, humanSide);
    const fresh = wopr_initState(usMode, ruMode);
    const usLabel = fresh.usMode === "human" ? "HUMAN" : `CPU ${fresh.usMode.toUpperCase()} [${WOPR_PERSONALITY_LABELS[fresh.usPersonality]}]`;
    const ruLabel = fresh.ruMode === "human" ? "HUMAN" : `CPU ${fresh.ruMode.toUpperCase()} [${WOPR_PERSONALITY_LABELS[fresh.ruPersonality]}]`;
    setState({
      ...fresh,
      phase: "us_launch",
      log: [...fresh.log, "", "▸ SIMULATION INITIATED",
            `▸ USA: ${usLabel}`, `▸ USSR: ${ruLabel}`,
            "", "▸ ROUND 1 — USA LAUNCH ORDERS"],
    });
  }
  function restart() { setState(wopr_initState()); }

  function handleSiloClick(side, sourceId) {
    if (!isLaunchPhase() || side !== activeSide() || !activeIsHuman()) return;
    const src = wopr_findSource(state, side, sourceId);
    if (!src?.alive || src.launched) return;
    const launchKey = side === "us" ? "usLaunches" : "ruLaunches";
    // Bombers fire 1 per round; silos and subs up to 2.
    const max = src.kind === "bomber" ? 1 : 2;
    const fromThisSource = state[launchKey].filter(l => l.siloId === sourceId).length;
    if (fromThisSource >= max) return;
    setState(s => ({
      ...s,
      selectedSilo: s.selectedSilo === sourceId ? null : sourceId,
      selectedInterceptCity: null,
    }));
  }
  function handleTargetClick(targetSide, targetId) {
    if (!isLaunchPhase() || !state.selectedSilo || !activeIsHuman()) return;
    const side = activeSide();
    const launchKey = side === "us" ? "usLaunches" : "ruLaunches";
    setState(s => {
      const silo = wopr_findSource(s, side, s.selectedSilo);
      const max = silo?.kind === "bomber" ? 1 : 2;
      const fromThisSilo = s[launchKey].filter(l => l.siloId === s.selectedSilo).length;
      if (fromThisSilo >= max) return s;
      const target = wopr_findTarget(s, targetSide, targetId);
      const isBomber = silo?.kind === "bomber";
      return {
        ...s,
        [launchKey]: [...s[launchKey], { siloId: s.selectedSilo, targetId, targetSide, isBomber }],
        selectedSilo: null,
        log: [...s.log, `▸ ${wopr_label(silo)} → ${wopr_label(target)}`],
      };
    });
  }
  function removeLaunch(idx) {
    const side = activeSide();
    const launchKey = side === "us" ? "usLaunches" : "ruLaunches";
    setState(s => {
      const list = [...s[launchKey]]; list.splice(idx, 1);
      return { ...s, [launchKey]: list };
    });
  }

  function handleInterceptCityClick(side, cityId) {
    if (!isInterceptPhase() || side !== activeSide() || !activeIsHuman()) return;
    const city = wopr_getSide(state, side).cities.find(c => c.id === cityId);
    if (!city?.alive || city.interceptors <= 0) return;
    const interceptKey = side === "us" ? "usIntercepts" : "ruIntercepts";
    const usedByCity = state[interceptKey].filter(ic => ic.cityId === cityId).length;
    if (usedByCity >= city.interceptors) return;
    setState(s => ({
      ...s,
      selectedInterceptCity: s.selectedInterceptCity === cityId ? null : cityId,
      selectedSilo: null,
    }));
  }
  function handleMissileClick(missileIdx) {
    if (!isInterceptPhase() || !state.selectedInterceptCity || !activeIsHuman()) return;
    const side = activeSide();
    const interceptKey = side === "us" ? "usIntercepts" : "ruIntercepts";
    const incomingKey = side === "us" ? "ruLaunches" : "usLaunches";

    const city = wopr_getSide(state, side).cities.find(c => c.id === state.selectedInterceptCity);
    if (!city?.alive) return;

    // Cap check (uses this side's randomized max-interceptors total)
    const ownLaunchKey = side === "us" ? "usLaunches" : "ruLaunches";
    const ownLaunchCount = state[ownLaunchKey].length;
    const sideMax = wopr_getSide(state, side).maxInterceptors || 20;
    const cap = Math.max(0, sideMax - ownLaunchCount * 3);
    if (state[interceptKey].length >= cap) return;

    // Per-city max: city.interceptors total, max 3 stacked per missile
    const usedByCity = state[interceptKey].filter(ic => ic.cityId === city.id).length;
    if (usedByCity >= city.interceptors) return;
    const onMissile = state[interceptKey].filter(ic => ic.missileIdx === missileIdx).length;
    if (onMissile >= 3) return;

    const launch = state[incomingKey][missileIdx];
    const target = wopr_findTarget(state, launch.targetSide, launch.targetId);
    const source = wopr_findSource(state, wopr_oppSide(side), launch.siloId);
    const chance = wopr_interceptChance(city, source, target);

    setState(s => ({
      ...s,
      [interceptKey]: [...s[interceptKey], { cityId: city.id, missileIdx, chance }],
      selectedInterceptCity: null,
      log: [...s.log, `▸ ${city.name} → MISSILE ${missileIdx+1} [${Math.round(chance*100)}%]`],
    }));
  }
  function removeIntercept(idx) {
    const side = activeSide();
    const interceptKey = side === "us" ? "usIntercepts" : "ruIntercepts";
    setState(s => { const list = [...s[interceptKey]]; list.splice(idx, 1); return { ...s, [interceptKey]: list }; });
  }

  // Auto-assign: pre-fills a baseline intercept plan, sorted by target value, using same-region cities first.
  // User can still add/remove individual assignments before confirming.
  function handleAutoAssign(perMissile) {
    const side = activeSide();
    if (!side || !isInterceptPhase()) return;
    setState(s => {
      const incomingKey = side === "us" ? "ruLaunches" : "usLaunches";
      const ownLaunchKey = side === "us" ? "usLaunches" : "ruLaunches";
      const interceptKey = side === "us" ? "usIntercepts" : "ruIntercepts";
      const incoming = s[incomingKey];
      const sideMax = wopr_getSide(s, side).maxInterceptors || 20;
      const cap = Math.max(0, sideMax - s[ownLaunchKey].length * 3);
      const cities = wopr_aliveCities(s, side).map(c => ({ ...c, available: c.interceptors }));
      const attackerSide = wopr_oppSide(side);
      const sorted = incoming.map((l, idx) => {
        const tgt = wopr_findTarget(s, l.targetSide, l.targetId);
        const src = wopr_findSource(s, attackerSide, l.siloId);
        return { idx, target: tgt, source: src, value: tgt ? (tgt.pop || 0.3) : 0 };
      }).sort((a, b) => b.value - a.value);

      const intercepts = [];
      let used = 0;
      for (const m of sorted) {
        for (let n = 0; n < perMissile && used < cap; n++) {
          const pool = cities.filter(c => c.available > 0);
          if (pool.length === 0) break;
          const sameRegion = pool.filter(c => c.region === (m.target?.region || ""));
          const candidate = sameRegion.length ? sameRegion[0] : pool[0];
          candidate.available--;
          const chance = wopr_interceptChance(candidate, m.source, m.target);
          intercepts.push({ cityId: candidate.id, missileIdx: m.idx, chance });
          used++;
        }
      }
      return {
        ...s,
        [interceptKey]: intercepts,
        selectedInterceptCity: null,
        log: [...s.log, `▸ AUTO-ASSIGNED ${intercepts.length} INTERCEPTOR${intercepts.length===1?"":"S"} [×${perMissile}]`],
      };
    });
  }
  function confirmPhase() {
    const side = activeSide();
    setState(s => {
      let msg = "";
      if (s.phase === "us_launch")    msg = `▸ USA LAUNCHES ${s.usLaunches.length} MISSILE${s.usLaunches.length===1?"":"S"}`;
      if (s.phase === "ru_launch")    msg = `▸ USSR LAUNCHES ${s.ruLaunches.length} MISSILE${s.ruLaunches.length===1?"":"S"}`;
      if (s.phase === "us_intercept") msg = `▸ USA ASSIGNS ${s.usIntercepts.length} INTERCEPTOR${s.usIntercepts.length===1?"":"S"}`;
      if (s.phase === "ru_intercept") msg = `▸ USSR ASSIGNS ${s.ruIntercepts.length} INTERCEPTOR${s.ruIntercepts.length===1?"":"S"}`;
      return { ...s, phase: wopr_nextPhase(s.phase), log: [...s.log, msg] };
    });
  }

  // ── Derived data for render ─────────────────────────────────────────────────
  const phase = state.phase;
  const aSide = activeSide();
  const launchKey = aSide === "us" ? "usLaunches" : "ruLaunches";
  const interceptKey = aSide === "us" ? "usIntercepts" : "ruIntercepts";
  const incomingKey = aSide === "us" ? "ruLaunches" : "usLaunches";
  const ownLaunches = aSide ? state[launchKey] : [];
  const ownIntercepts = aSide ? state[interceptKey] : [];
  const incomingLaunches = aSide && isInterceptPhase() ? state[incomingKey] : [];
  const isCpuActive = aSide && !activeIsHuman();

  // ── SVG render helpers ──────────────────────────────────────────────────────
  const SVG_W = 360;
  const SVG_H = 420;

  function renderSilo(silo, side) {
    const isFriendly = side === aSide;
    const dim = silo.launched || !silo.alive;
    const fillCol = dim ? WOPR_C.siloDim : WOPR_C.siloCol;
    const isSelected = state.selectedSilo === silo.id && isFriendly && isLaunchPhase();
    const queueCount = ownLaunches.filter(l => l.siloId === silo.id).length;
    // Spent (launched) silos and destroyed silos are no longer useful targets — gate accordingly.
    const isLaunchTarget = isLaunchPhase() && state.selectedSilo && side !== aSide && silo.alive && !silo.launched;
    const clickable = isLaunchTarget || (isFriendly && isLaunchPhase() && silo.alive && !silo.launched);

    return (
      <g key={silo.id}
         onClick={() => {
           if (isLaunchTarget) handleTargetClick(side, silo.id);
           else if (isFriendly && isLaunchPhase()) handleSiloClick(side, silo.id);
         }}
         style={{ cursor: clickable ? "pointer" : "default" }}>
        {/* Larger transparent hit-area for easier clicking on phones */}
        <circle cx={silo.x} cy={silo.y} r={14} fill="transparent" />
        {/* Targetable ring */}
        {isLaunchTarget && (
          <circle cx={silo.x} cy={silo.y} r={11} fill="none" stroke={WOPR_C.red} strokeWidth={1.5} opacity={0.8} />
        )}
        {/* Triangle marker — orange (silo accent regardless of side) */}
        <polygon
          points={`${silo.x},${silo.y-10} ${silo.x-9},${silo.y+7} ${silo.x+9},${silo.y+7}`}
          fill={fillCol}
          opacity={dim ? 0.5 : 1}
          stroke={isSelected ? WOPR_C.hot : "#000"}
          strokeWidth={isSelected ? 2 : 0.5}
        />
        {/* Crossed out if destroyed */}
        {!silo.alive && (
          <>
            <line x1={silo.x-9} y1={silo.y-9} x2={silo.x+9} y2={silo.y+9} stroke={WOPR_C.red} strokeWidth={1.5} />
            <line x1={silo.x+9} y1={silo.y-9} x2={silo.x-9} y2={silo.y+9} stroke={WOPR_C.red} strokeWidth={1.5} />
          </>
        )}
        {/* Smoke puff if launched */}
        {silo.launched && silo.alive && (
          <circle cx={silo.x} cy={silo.y - 12} r={4} fill="#888" opacity={0.5} />
        )}
        {/* Pulse ring if selected */}
        {isSelected && (
          <circle cx={silo.x} cy={silo.y} r={13} fill="none" stroke={WOPR_C.hot} strokeWidth={1.5}>
            <animate attributeName="r" values="13;18;13" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Queue badge */}
        {queueCount > 0 && (
          <text x={silo.x + 10} y={silo.y - 8} fontSize={9} fill={WOPR_C.hot}
                fontFamily="monospace" fontWeight="bold">{queueCount}</text>
        )}
      </g>
    );
  }

  function renderBomber(bomber, side) {
    const isFriendly = side === aSide;
    const dim = bomber.launched;
    const fillCol = dim ? WOPR_C.bomberDim : WOPR_C.bomberCol;
    const isSelected = state.selectedSilo === bomber.id && isFriendly && isLaunchPhase();
    const queueCount = ownLaunches.filter(l => l.siloId === bomber.id).length;
    const clickable = isFriendly && isLaunchPhase() && !bomber.launched;
    return (
      <g key={bomber.id}
         onClick={() => { if (clickable) handleSiloClick(side, bomber.id); }}
         style={{ cursor: clickable ? "pointer" : "default" }}>
        {/* Hit area */}
        <circle cx={bomber.x} cy={bomber.y} r={14} fill="transparent" />
        {/* Bomber silhouette: 4-point arrow / paper-airplane shape, points up */}
        <polygon
          points={`${bomber.x},${bomber.y-8} ${bomber.x+8},${bomber.y+5} ${bomber.x},${bomber.y+1} ${bomber.x-8},${bomber.y+5}`}
          fill={fillCol}
          opacity={dim ? 0.4 : 1}
          stroke={isSelected ? WOPR_C.hot : "#000"}
          strokeWidth={isSelected ? 2 : 0.5}
        />
        {/* Crossed-out if spent */}
        {bomber.launched && (
          <>
            <line x1={bomber.x-9} y1={bomber.y-6} x2={bomber.x+9} y2={bomber.y+6}
                  stroke={WOPR_C.red} strokeWidth={1.5} opacity={0.8} />
          </>
        )}
        {/* Pulse ring if selected */}
        {isSelected && (
          <circle cx={bomber.x} cy={bomber.y} r={13} fill="none" stroke={WOPR_C.hot} strokeWidth={1.5}>
            <animate attributeName="r" values="13;17;13" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Queue badge */}
        {queueCount > 0 && (
          <text x={bomber.x + 10} y={bomber.y - 6} fontSize={9} fill={WOPR_C.hot}
                fontFamily="monospace" fontWeight="bold">{queueCount}</text>
        )}
      </g>
    );
  }

  function renderSub(sub, side) {
    const isFriendly = side === aSide;
    const dim = sub.launched;
    const fillCol = dim ? WOPR_C.subDim : WOPR_C.subCol;
    const isSelected = state.selectedSilo === sub.id && isFriendly && isLaunchPhase();
    const queueCount = ownLaunches.filter(l => l.siloId === sub.id).length;
    const clickable = isFriendly && isLaunchPhase() && !sub.launched;
    return (
      <g key={sub.id}
         onClick={() => { if (clickable) handleSiloClick(side, sub.id); }}
         style={{ cursor: clickable ? "pointer" : "default" }}>
        {/* Hit area */}
        <circle cx={sub.x} cy={sub.y} r={16} fill="transparent" />
        {/* Submarine silhouette: elongated hexagon (hull) */}
        <polygon
          points={`${sub.x-14},${sub.y} ${sub.x-9},${sub.y-4} ${sub.x+9},${sub.y-4} ${sub.x+14},${sub.y} ${sub.x+9},${sub.y+4} ${sub.x-9},${sub.y+4}`}
          fill={fillCol}
          opacity={dim ? 0.4 : 1}
          stroke={isSelected ? WOPR_C.hot : "#000"}
          strokeWidth={isSelected ? 2 : 0.5}
        />
        {/* Conning tower */}
        <rect x={sub.x-3} y={sub.y-7} width={6} height={3}
              fill={fillCol} opacity={dim ? 0.4 : 1} />
        {/* Crossed-out if spent */}
        {sub.launched && (
          <line x1={sub.x-14} y1={sub.y-4} x2={sub.x+14} y2={sub.y+4}
                stroke={WOPR_C.red} strokeWidth={1.5} opacity={0.8} />
        )}
        {/* Pulse ring if selected */}
        {isSelected && (
          <circle cx={sub.x} cy={sub.y} r={16} fill="none" stroke={WOPR_C.hot} strokeWidth={1.5}>
            <animate attributeName="r" values="16;20;16" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Queue badge */}
        {queueCount > 0 && (
          <text x={sub.x + 16} y={sub.y - 4} fontSize={9} fill={WOPR_C.hot}
                fontFamily="monospace" fontWeight="bold">{queueCount}</text>
        )}
      </g>
    );
  }

  function renderCity(city, side) {
    const isFriendly = side === aSide;
    const sideCol = side === "us" ? WOPR_C.usaCol : WOPR_C.ussrCol;
    const isSelectedIntercept = state.selectedInterceptCity === city.id && isFriendly && isInterceptPhase();
    // Destroyed cities are not useful targets — gate at the flag so all use-sites stay consistent.
    const isLaunchTarget = isLaunchPhase() && state.selectedSilo && side !== aSide && city.alive;

    return (
      <g key={city.id}
         onClick={() => {
           if (isLaunchTarget) handleTargetClick(side, city.id);
           else if (isInterceptPhase() && isFriendly && city.alive) handleInterceptCityClick(side, city.id);
         }}
         style={{ cursor:
           isLaunchTarget ||
           (isInterceptPhase() && isFriendly && city.alive && city.interceptors > 0)
             ? "pointer" : "default" }}>
        {/* Larger transparent hit-area for easier clicking on phones */}
        <circle cx={city.x} cy={city.y} r={14} fill="transparent" />
        {/* Targetable ring */}
        {isLaunchTarget && (
          <circle cx={city.x} cy={city.y} r={10} fill="none" stroke={WOPR_C.red} strokeWidth={1.5} opacity={0.8} />
        )}
        <circle cx={city.x} cy={city.y} r={city.alive ? 5 : 4}
                fill={city.alive ? sideCol : WOPR_C.red}
                opacity={city.alive ? 1 : 0.6}
                stroke={isSelectedIntercept ? WOPR_C.hot : "#000"}
                strokeWidth={isSelectedIntercept ? 2 : 0.5} />
        {/* Interceptor pips */}
        {/* Interceptor pips: render up to 3, lit per c.interceptors. Position auto-centers for 1/2/3. */}
        {city.alive && Array.from({ length: 3 }, (_, i) => {
          const lit = i < city.interceptors;
          // Centre the row of 3 pips above the city circle
          return (
            <circle key={i} cx={city.x - 5 + i*5} cy={city.y - 9} r={1.6}
                    fill={lit ? sideCol : "transparent"} />
          );
        })}
        {/* Casualty count for destroyed cities */}
        {!city.alive && (
          <text x={city.x} y={city.y + 11} fontSize={8} fill={WOPR_C.red}
                fontFamily="monospace" fontWeight="bold" textAnchor="middle">{city.casualties.toFixed(1)}M</text>
        )}
        {/* Pulse ring for selected interceptor source */}
        {isSelectedIntercept && (
          <circle cx={city.x} cy={city.y} r={9} fill="none" stroke={WOPR_C.hot} strokeWidth={1.5}>
            <animate attributeName="r" values="9;13;9" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    );
  }

  function arcVariant(launches, idx) {
    const cur = launches[idx];
    return launches.slice(0, idx).filter(x => x.siloId === cur.siloId).length;
  }

  function renderArc(launch, idx, side, opts = {}) {
    const sourceSilo = wopr_findSource(state, side, launch.siloId);
    const target = wopr_findTarget(state, launch.targetSide, launch.targetId);
    if (!sourceSilo || !target) return null;
    const x1 = sourceSilo.x, y1 = sourceSilo.y;
    const x2 = target.x, y2 = target.y;
    // Quadratic bezier with arc bulge perpendicular to the line.
    // variant 0 → +nx bulge, variant 1 → −nx bulge (same silo, opposite side),
    // variant 2+ scales the magnitude up a touch.
    const variant = opts.variant || 0;
    const sign = variant % 2 === 0 ? 1 : -1;
    const mag = 1 + Math.floor(variant / 2) * 0.35;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len * sign, ny = dx / len * sign;
    const bulge = Math.min(80, len * 0.4) * mag;
    const cx = mx + nx * bulge;
    const cy = my + ny * bulge;
    const stroke = side === "us" ? WOPR_C.usaCol : WOPR_C.ussrCol;
    const isInbound = opts.inbound;
    const interceptCount = opts.interceptCount || 0;
    const arcStroke = isInbound ? WOPR_C.red : stroke;

    // Midpoint of the quadratic bezier (t=0.5) and split control points via de Casteljau.
    // Used during intercept phase to render solid-trail + dashed-ahead with a missile in flight.
    const midX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
    const midY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
    const c1x = (x1 + cx) / 2, c1y = (y1 + cy) / 2;
    const c2x = (cx + x2) / 2, c2y = (cy + y2) / 2;
    const angleDeg = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const inFlight = isInbound && opts.showNumber;

    return (
      <g key={`${side}-${idx}`}>
        {inFlight ? (
          <>
            {/* Trail behind missile — solid */}
            <path d={`M ${x1} ${y1} Q ${c1x} ${c1y} ${midX} ${midY}`}
                  stroke={arcStroke} strokeWidth={1.4} fill="none"
                  opacity={opts.dim ? 0.5 : 0.95} />
            {/* Path ahead of missile — dashed */}
            <path d={`M ${midX} ${midY} Q ${c2x} ${c2y} ${x2} ${y2}`}
                  stroke={arcStroke} strokeWidth={1.2} fill="none"
                  strokeDasharray="3 2"
                  opacity={opts.dim ? 0.4 : 0.7} />
          </>
        ) : (
          <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                stroke={arcStroke} strokeWidth={1.2} fill="none"
                strokeDasharray="3 2"
                opacity={opts.dim ? 0.4 : 0.85} />
        )}

        {/* Missile/badge in-flight cluster — at midpoint, oriented along travel direction */}
        {opts.showNumber && (
          <g onClick={() => isInbound && handleMissileClick(idx)}
             style={{ cursor: isInbound && state.selectedInterceptCity ? "pointer" : "default" }}>
            {inFlight && (
              <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
                {/* Stylized missile silhouette pointing in direction of travel */}
                <polygon points="6,0 -2,-3 -1,0 -2,3" fill={arcStroke} stroke="#000" strokeWidth={0.4} />
                {/* Exhaust tail */}
                <line x1={-2} y1={0} x2={-6} y2={0} stroke={arcStroke} strokeWidth={1} opacity={0.6} />
              </g>
            )}
            {/* Numbered badge — at control point for outgoing arcs, at midpoint for inbound */}
            <circle cx={inFlight ? midX : cx} cy={inFlight ? midY - 9 : cy} r={6}
                    fill={WOPR_C.bg} stroke={arcStroke} strokeWidth={1} />
            <text x={inFlight ? midX : cx} y={(inFlight ? midY - 9 : cy) + 2}
                  fontSize={8} fill={arcStroke}
                  fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {idx + 1}
            </text>
            {interceptCount > 0 && (
              <text x={(inFlight ? midX : cx) + 10} y={(inFlight ? midY - 9 : cy) + 2}
                    fontSize={7} fill={WOPR_C.hot}
                    fontFamily="monospace" fontWeight="bold">×{interceptCount}</text>
            )}
          </g>
        )}
      </g>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (state.phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: WOPR_C.bg, maxWidth: 420, margin: "0 auto",
        fontFamily: "'Courier New', monospace", color: WOPR_C.bright,
        padding: 24, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", position: "relative" }}>
        <BackButton onBack={onBack} />
      <AwryCredit />
        <button onClick={() => setShowHelp(true)} style={{
          position: "absolute", top: 14, right: 14, zIndex: 50,
          background: "rgba(0,0,0,0.5)", border: `1px solid ${WOPR_C.bright}`,
          color: WOPR_C.bright, width: 28, height: 28,
          fontSize: 14, fontWeight: "bold",
          cursor: "pointer", borderRadius: "50%",
          fontFamily: "'Courier New', monospace",
        }} aria-label="Help">?</button>
        {showHelp && <WOPR_HelpModal onClose={() => setShowHelp(false)} />}
        <div style={{ fontSize: 11, letterSpacing: "0.4em", color: WOPR_C.mid, textTransform: "uppercase", marginBottom: 6 }}>
          WOPR
        </div>
        <div style={{ fontSize: 16, color: WOPR_C.hot, letterSpacing: "0.12em", marginBottom: 4,
                      textShadow: `0 0 8px ${WOPR_C.hot}`, textAlign: "center" }}>
          GLOBAL THERMONUCLEAR WAR
        </div>
        <div style={{ fontSize: 9, color: WOPR_C.faint, letterSpacing: "0.3em", marginBottom: 24 }}>
          SHALL WE PLAY A GAME?
        </div>
        <ModeBar mode={uiMode} onChange={setUiMode} />
        {uiMode !== "vs-human"
          ? <DiffBar difficulty={uiDifficulty} onChange={setUiDifficulty} />
          : <div style={{ height: 29, marginBottom: 8 }} />}
        {uiMode === "vs-cpu" && (
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            <span style={{ fontSize: 8, color: WOPR_C.faint, letterSpacing: "0.2em",
                           alignSelf: "center", marginRight: 4 }}>YOU PLAY</span>
            {[["us","USA",WOPR_C.usaCol],["ru","USSR",WOPR_C.ussrCol]].map(([key,lbl,col]) => (
              <button key={key} onClick={() => setHumanSide(key)} style={{
                background: humanSide === key ? col : "transparent",
                border: `2px solid ${humanSide === key ? col : col}`,
                color: humanSide === key ? WOPR_C.bg : col,
                fontFamily: "'Courier New', monospace",
                fontSize: 8, letterSpacing: "0.15em", padding: "3px 10px",
                cursor: "pointer", borderRadius: 2, fontWeight: humanSide === key ? "bold" : "normal",
              }}>{lbl}</button>
            ))}
          </div>
        )}
        <button onClick={startGame} style={{
          marginTop: uiMode === "vs-cpu" ? 4 : 16, width: "100%", maxWidth: 280,
          background: "transparent", border: `2px solid ${WOPR_C.hot}`,
          color: WOPR_C.hot, padding: "10px", fontSize: 10,
          letterSpacing: "0.3em", cursor: "pointer",
          fontFamily: "'Courier New', monospace",
        }}>▶ INITIATE SIMULATION</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: WOPR_C.bg, maxWidth: 420, margin: "0 auto",
      fontFamily: "'Courier New', monospace", color: WOPR_C.bright,
      padding: 12, position: "relative" }}>
      <BackButton onBack={onBack} />
      <AwryCredit />
      <button onClick={() => setShowHelp(true)} style={{
        position: "absolute", top: 14, right: 14, zIndex: 50,
        background: "rgba(0,0,0,0.6)", border: `2px solid ${WOPR_C.bright}`,
        color: WOPR_C.bright, width: 30, height: 30,
        fontSize: 14, fontWeight: "bold",
        cursor: "pointer", borderRadius: "50%",
        fontFamily: "'Courier New', monospace",
      }} aria-label="Help">?</button>
      {showHelp && <WOPR_HelpModal onClose={() => setShowHelp(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 36 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: SVG_W,
                      alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: WOPR_C.mid, letterSpacing: "0.25em" }}>ROUND {state.round}</div>
          <WOPR_DefconBar level={state.defcon} />
        </div>

        {/* Phase indicator */}
        <div style={{ fontSize: 10, color: WOPR_C.hot, letterSpacing: "0.2em", marginBottom: 6,
                      textShadow: `0 0 4px ${WOPR_C.hot}`, minHeight: 14 }}>
          {phase === "us_launch"    && "USA LAUNCH ORDERS"}
          {phase === "ru_launch"    && "USSR LAUNCH ORDERS"}
          {phase === "us_intercept" && "USA INTERCEPT ASSIGNMENT"}
          {phase === "ru_intercept" && "USSR INTERCEPT ASSIGNMENT"}
          {phase === "resolve"      && "RESOLVING…"}
          {phase === "gameover"     && "SIMULATION COMPLETE"}
        </div>
        {isCpuActive && phase !== "resolve" && phase !== "gameover" && (
          <div style={{ fontSize: 8, color: WOPR_C.faint, letterSpacing: "0.2em", marginBottom: 4 }}>
            CPU EXECUTING…
          </div>
        )}

        {/* Map */}
        <svg width={SVG_W} height={SVG_H}
             style={{ background: WOPR_C.bg, border: `1px solid ${WOPR_C.border}` }}>
          {/* Country outlines — mapsicon paths in source coords 0..10240, scaled into our halves with Y-flip */}
          <g transform="matrix(0.0332, 0, 0, -0.01856, 10, 200)">
            <path d={WOPR_RU_OUTLINE} fill="#001a05" stroke={WOPR_C.border} strokeWidth={28}
                  vectorEffect="non-scaling-stroke" />
          </g>
          <g transform="matrix(0.0332, 0, 0, -0.01758, 10, 400)">
            <path d={WOPR_US_OUTLINE} fill="#001a05" stroke={WOPR_C.border} strokeWidth={28}
                  vectorEffect="non-scaling-stroke" />
          </g>
          {/* Country shapes are self-evident; labels removed for cleaner mobile view */}

          {/* Cities + silos + subs + bombers */}
          {state.ru.cities.map(c => renderCity(c, "ru"))}
          {state.us.cities.map(c => renderCity(c, "us"))}
          {state.ru.silos.map(s => renderSilo(s, "ru"))}
          {state.us.silos.map(s => renderSilo(s, "us"))}
          {state.ru.bombers.map(b => renderBomber(b, "ru"))}
          {state.us.bombers.map(b => renderBomber(b, "us"))}
          {state.ru.subs.map(s => renderSub(s, "ru"))}
          {state.us.subs.map(s => renderSub(s, "us"))}

          {/* Outgoing arcs visible to active side during own launch phase, plus full reveal at resolve */}
          {(phase === "us_launch" || phase === "resolve") && state.usLaunches.map((l, i) =>
            renderArc(l, i, "us", { showNumber: false, variant: arcVariant(state.usLaunches, i),
              dim: phase === "us_launch" ? false : false }))}
          {(phase === "ru_launch" || phase === "resolve") && state.ruLaunches.map((l, i) =>
            renderArc(l, i, "ru", { showNumber: false, variant: arcVariant(state.ruLaunches, i) }))}

          {/* During intercept phase, show incoming as red arcs with numbered badges */}
          {isInterceptPhase() && incomingLaunches.map((l, i) => {
            const interceptCount = ownIntercepts.filter(ic => ic.missileIdx === i).length;
            return renderArc(l, i, wopr_oppSide(aSide),
              { inbound: true, showNumber: true, interceptCount,
                variant: arcVariant(incomingLaunches, i) });
          })}
        </svg>

        {/* Side panels — launch queue or intercept queue */}
        <div style={{ width: "100%", maxWidth: SVG_W, marginTop: 8 }}>
          {phase === "gameover" ? (
            <div style={{ textAlign: "center" }}>
              <button onClick={restart} style={{
                background: "transparent", border: `2px solid ${WOPR_C.hot}`,
                color: WOPR_C.hot, padding: "8px 16px", fontSize: 9,
                letterSpacing: "0.3em", cursor: "pointer",
                fontFamily: "'Courier New', monospace",
              }}>▶ NEW SIMULATION</button>
            </div>
          ) : (
            <>
              {/* Launch queue */}
              {isLaunchPhase() && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 7, color: WOPR_C.mid, letterSpacing: "0.2em", marginBottom: 3 }}>
                    {aSide?.toUpperCase()} LAUNCH QUEUE ({ownLaunches.length}/10):
                  </div>
                  {ownLaunches.length === 0 ? (
                    <div style={{ fontSize: 8, color: WOPR_C.faint }}>— NONE —</div>
                  ) : ownLaunches.map((l, i) => {
                    const silo = wopr_findSource(state, aSide, l.siloId);
                    const tgt = wopr_findTarget(state, l.targetSide, l.targetId);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6,
                            fontSize: 8, color: WOPR_C.hot, marginBottom: 2 }}>
                        <span>▸ {wopr_label(silo)} → {wopr_label(tgt)}</span>
                        {activeIsHuman() && (
                          <button onClick={() => removeLaunch(i)} style={{
                            fontSize: 7, color: WOPR_C.red, background: "transparent",
                            border: `1px solid ${WOPR_C.red}66`, cursor: "pointer",
                            padding: "0 4px", fontFamily: "monospace",
                          }}>✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Intercept queue */}
              {isInterceptPhase() && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 7, color: WOPR_C.mid, letterSpacing: "0.2em", marginBottom: 3 }}>
                    {aSide?.toUpperCase()} INTERCEPTS ({ownIntercepts.length}/{Math.max(0, (wopr_getSide(state, aSide).maxInterceptors || 20) - state[launchKey].length*3)} cap):
                  </div>
                  {ownIntercepts.length === 0 ? (
                    <div style={{ fontSize: 8, color: WOPR_C.faint }}>— NONE —</div>
                  ) : ownIntercepts.map((ic, i) => {
                    const city = wopr_getSide(state, aSide).cities.find(c => c.id === ic.cityId);
                    const inboundLaunch = incomingLaunches[ic.missileIdx];
                    const inboundTgt = inboundLaunch ? wopr_findTarget(state, inboundLaunch.targetSide, inboundLaunch.targetId) : null;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6,
                            fontSize: 8, color: WOPR_C.bright, marginBottom: 2 }}>
                        <span>▸ {city?.name} → #{ic.missileIdx+1} aimed at {wopr_label(inboundTgt)} [{Math.round(ic.chance*100)}%]</span>
                        {activeIsHuman() && (
                          <button onClick={() => removeIntercept(i)} style={{
                            fontSize: 7, color: WOPR_C.red, background: "transparent",
                            border: `1px solid ${WOPR_C.red}66`, cursor: "pointer",
                            padding: "0 4px", fontFamily: "monospace",
                          }}>✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Confirm button (human only) */}
              {/* Auto-assign — fills a baseline intercept plan; user can still tweak before confirm */}
              {activeIsHuman() && isInterceptPhase() && incomingLaunches.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <button onClick={() => handleAutoAssign(1)} style={{
                    flex: 1, background: "transparent",
                    border: `2px solid ${WOPR_C.subCol}`, color: WOPR_C.subCol,
                    padding: 7, fontSize: 9, letterSpacing: "0.2em",
                    cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: "bold",
                  }}>AUTO ×1</button>
                  <button onClick={() => handleAutoAssign(2)} style={{
                    flex: 1, background: "transparent",
                    border: `2px solid ${WOPR_C.subCol}`, color: WOPR_C.subCol,
                    padding: 7, fontSize: 9, letterSpacing: "0.2em",
                    cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: "bold",
                  }}>AUTO ×2</button>
                </div>
              )}
              {activeIsHuman() && phase !== "resolve" && (
                <button onClick={confirmPhase} style={{
                  width: "100%", background: "transparent",
                  border: `2px solid ${WOPR_C.hot}`, color: WOPR_C.hot,
                  padding: 8, fontSize: 9, letterSpacing: "0.25em",
                  cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: "bold",
                }}>
                  {isLaunchPhase() ? "✓ CONFIRM LAUNCH ORDERS" : "✓ CONFIRM INTERCEPTS"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Scoreboard */}
        <div style={{ display: "flex", justifyContent: "space-between",
              width: "100%", maxWidth: SVG_W, marginTop: 8, paddingTop: 6,
              borderTop: `1px solid ${WOPR_C.border}` }}>
          {[["USA","us",WOPR_C.usaCol],["USSR","ru",WOPR_C.ussrCol]].map(([label, side, col]) => (
            <div key={side} style={{ fontSize: 8, color: col }}>
              <div style={{ letterSpacing: "0.2em", marginBottom: 2, fontWeight: "bold" }}>{label}</div>
              <div>CITIES: {wopr_aliveCities(state, side).length}/10</div>
              <div style={{ color: WOPR_C.siloCol }}>SILOS: {wopr_aliveSilos(state, side).length}/{wopr_getSide(state, side).silos.length}</div>
              <div style={{ color: WOPR_C.subCol }}>SUBS: {wopr_aliveSubs(state, side).length}/{wopr_getSide(state, side).subs.length}</div>
              <div style={{ color: WOPR_C.bomberCol }}>BMBR: {wopr_aliveBombers(state, side).length}/{wopr_getSide(state, side).bombers.length}</div>
              <div style={{ color: WOPR_C.red }}>KIA: {wopr_totalCasualties(state, side).toFixed(1)}M</div>
            </div>
          ))}
        </div>

        {/* Log */}
        <div ref={logRef} style={{ width: "100%", maxWidth: SVG_W,
              marginTop: 8, height: 96, overflowY: "auto",
              borderTop: `1px solid ${WOPR_C.border}`, paddingTop: 6,
              display: "flex", flexDirection: "column", gap: 1 }}>
          {state.log.map((line, i) => (
            <div key={i} style={{ fontSize: 7.5, fontFamily: "monospace",
                  letterSpacing: "0.04em",
                  color: line.startsWith("▸") ? WOPR_C.hot
                    : line.startsWith("A STRANGE") || line.startsWith("THE ONLY") || line.startsWith("HOW ABOUT") ? WOPR_C.amber
                    : WOPR_C.mid }}>
              {line || " "}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MENU + ROOT
// ═══════════════════════════════════════════════════════════════════════════════

const GAMES = [
  {
    id: "ttt",
    label: "Tic-Tac-Toe",
    desc: "Classic 3×3 — first to three wins",
    icon: "✕ ○",
    bg: "#0a0a0a",
    accent: "#4ade80",
  },
  {
    id: "c4",
    label: "Connect Four",
    desc: "Drop pieces, connect four to win",
    icon: "⬤\n⬤",
    iconLineHeight: 1.4,
    bg: "#080c14",
    accent: "#ef4444",
  },
  {
    id: "dab",
    label: "Dots & Boxes",
    desc: "Draw edges, claim boxes — Édouard Lucas, 1889",
    icon: "· ·\n· ·",
    bg: "#111009",
    accent: "#c8b89a",
  },
  {
    id: "go",
    label: "Go",
    desc: "Ancient territory game — 5×5 / 7×7 / 9×9",
    icon: "囲棋",
    bg: "#1a1208",
    accent: "#8a7a40",
  },
  {
    id: "wopr",
    label: "Global Thermonuclear War",
    desc: "WOPR simulation — human or CPU each side",
    icon: "☢",
    iconSize: "44px",
    bg: "#000900",
    accent: "#00ff41",
  },
];

function Menu({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      maxWidth: 420,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      color: "#e8e8e8",
      padding: "32px",
      gap: "0",
    }}>
      <a href="https://www.awrylabs.com" target="_blank" rel="noopener noreferrer" style={{
        fontSize: "14px", letterSpacing: "0.05em", color: "#bbb",
        marginBottom: "6px",
        textDecoration: "none", transition: "color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "#bbb"; }}
      ><em style={{ fontStyle: "italic" }}>awry</em><strong style={{ fontWeight: "bold" }}>Labs</strong> <span style={{ fontSize: 11 }}>↗</span></a>
      <div style={{ fontSize: "26px", fontWeight: "bold", letterSpacing: "0.15em", marginBottom: "4px", color: "#00ff41", textShadow: "0 0 8px rgba(0,255,65,0.4)" }}>
        WOPR
      </div>
      <div style={{ fontSize: "12px", color: "#bbb", letterSpacing: "0.18em", marginBottom: "8px", fontWeight: "bold" }}>
        GAME SELECTION
      </div>
      <div style={{ fontSize: "10px", color: "#888", letterSpacing: "0.2em", marginBottom: "48px" }}>
        SHALL WE PLAY A GAME?
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "320px" }}>
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => onSelect(game.id)}
            style={{
              background: `${game.accent}10`,
              border: `2px solid ${game.accent}66`,
              borderRadius: "8px",
              padding: "20px 24px",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "'Courier New', monospace",
              color: "#fff",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = game.accent;
              e.currentTarget.style.background = `${game.accent}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = `${game.accent}66`;
              e.currentTarget.style.background = `${game.accent}10`;
            }}
          >
            <div style={{ fontSize: game.iconSize || "22px", letterSpacing: "0.1em", color: game.accent, minWidth: "52px", textAlign: "center", whiteSpace: "pre", lineHeight: game.iconLineHeight || 1.15 }}>
              {game.icon}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "0.08em", marginBottom: "4px", color: "#fff" }}>
                {game.label}
              </div>
              <div style={{ fontSize: "11px", color: "#ddd", letterSpacing: "0.1em" }}>
                {game.desc}
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: "20px", color: game.accent, fontWeight: "bold" }}>›</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "48px", fontSize: "10px", color: "#777", letterSpacing: "0.25em" }}>
        VS CPU · VS HUMAN · CPU VS CPU
      </div>
    </div>
  );
}

export default function GameRoom() {
  const [screen, setScreen] = useState("menu");

  if (screen === "ttt")  return <TicTacToe    onBack={() => setScreen("menu")} />;
  if (screen === "c4")   return <Connect4     onBack={() => setScreen("menu")} />;
  if (screen === "dab")  return <DotsAndBoxes onBack={() => setScreen("menu")} />;
  if (screen === "go")   return <GoGame       onBack={() => setScreen("menu")} />;
  if (screen === "wopr") return <WOPR         onBack={() => setScreen("menu")} />;
  return <Menu onSelect={setScreen} />;
}
