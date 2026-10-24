const input = document.getElementById("input");
const sorted = document.getElementById("sorted");
const stats = document.getElementById("stats");
const chart = document.getElementById("chart");
const graphType = document.getElementById("graphType");
const calcBtn = document.getElementById("calcBtn");
const themeSwitch = document.getElementById("themeSwitch");
const message = document.getElementById("message");

// stats.js の純粋関数（計算ロジック）
const { parseNumbers, computeStats, buildHistogram, formatNumber } = window.Stats;

// 最後に正しく計算できたデータ（グラフ種類・並び順の変更やリサイズで再描画するため）
let lastNums = null;

// 最後に表示した代表値（並び順・グラフ種類の変更では代表値は変わらないため、
// 同じ内容ならカードを作り直さない。作り直すとフェードアニメーションが再発する）
let lastStatsKey = null;

// テーマ: 保存があればそれを、なければ OS の設定を初期値にする
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeSwitch.checked = dark;
}

try {
  const savedTheme = localStorage.getItem("stats-theme");
  if (savedTheme !== null) {
    applyTheme(savedTheme === "dark");
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme(true);
  }
} catch (e) {
  // 保存が使えない環境では従来通りライトモードのままにする
}

themeSwitch.addEventListener("change", () => {
  applyTheme(themeSwitch.checked);
  try {
    localStorage.setItem("stats-theme", themeSwitch.checked ? "dark" : "light");
  } catch (e) {
    // 保存できなくても切り替え自体は有効
  }
});

calcBtn.addEventListener("click", () => calculate());

// 並び順・グラフ種類の変更も再計算として扱う。
// 入力が無効・空の場合は、古い結果を残さずボタンを押したときと同じ扱いにする
// （レビューで見つかった「古い結果が残る」問題への対応）。
document.querySelectorAll('input[name="order"]').forEach((radio) => {
  radio.addEventListener("change", () => calculate());
});
graphType.addEventListener("change", () => calculate());

let resizeTimer = null;
window.addEventListener("resize", () => {
  if (!lastNums) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => drawGraph(currentSorted(lastNums), freqOf(lastNums)), 200);
});

function currentSorted(nums) {
  const order = document.querySelector('input[name="order"]:checked').value;
  return [...nums].sort((a, b) => (order === "asc" ? a - b : b - a));
}

function freqOf(nums) {
  const freq = {};
  nums.forEach((n) => (freq[n] = (freq[n] || 0) + 1));
  return freq;
}

function clearResults() {
  sorted.textContent = "";
  stats.innerHTML = "";
  lastStatsKey = null;
  const ctx = chart.getContext("2d");
  ctx.clearRect(0, 0, chart.width, chart.height);
}

function calculate() {
  const { values: nums, invalid } = parseNumbers(input.value);

  if (invalid.length) {
    message.textContent = `数値として読めない入力があります: ${invalid.join(", ")}`;
    clearResults();
    lastNums = null;
    return;
  }

  if (!nums.length) {
    message.textContent = "数値を入力してください（例: 1, 5, 3, 3, 9）";
    clearResults();
    lastNums = null;
    return;
  }

  message.textContent = "";
  lastNums = nums;
  render(nums);
}

function render(nums) {
  const display = currentSorted(nums);
  sorted.textContent = display.join(", ");

  // 代表値（丸めは表示だけに適用し、計算値そのものはそのまま使う）
  const result = computeStats(nums);
  const mode = result.mode.length ? result.mode.map(formatNumber).join(", ") : "なし";

  const data = {
    平均: formatNumber(result.mean),
    中央値: formatNumber(result.median),
    最頻値: mode,
    最小: formatNumber(result.min),
    最大: formatNumber(result.max),
    合計: formatNumber(result.sum),
    範囲: formatNumber(result.range)
  };

  // 代表値が前回と同じならカードはそのままにする（アニメーション再発の防止）
  const statsKey = JSON.stringify(data);
  if (statsKey !== lastStatsKey) {
    lastStatsKey = statsKey;
    stats.innerHTML = "";
    Object.entries(data).forEach(([k, v], i) => {
      const d = document.createElement("div");
      d.className = "stat";
      d.style.animationDelay = `${i * 0.05}s`;
      d.innerHTML = `<h3>${k}</h3><p>${v}</p>`;
      stats.appendChild(d);
    });
  }

  drawGraph(display, freqOf(display));
}

function drawGraph(nums, freq) {
  const ctx = chart.getContext("2d");
  chart.width = chart.offsetWidth;
  chart.height = 240;

  ctx.clearRect(0, 0, chart.width, chart.height);
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";

  if (graphType.value === "bar") {
    // 選択中の並び順のまま描く（重複を取り除いた順序をそのまま使う）
    const keys = [...new Set(nums)];
    const max = keys.reduce((m, k) => Math.max(m, freq[k]), 0);
    const w = chart.width / keys.length;
    const showEvery = w >= 30 ? 1 : Math.ceil(30 / w);

    keys.forEach((k, i) => {
      const count = freq[k];
      const h = max ? (count / max) * (chart.height - 50) : 0;
      const barWidth = w > 28 ? w - 24 : Math.max(1, w - 4);

      ctx.fillStyle = "#4f7cff";
      ctx.fillRect(i * w + (w - barWidth) / 2, chart.height - h - 30, barWidth, h);

      if (i % showEvery !== 0) return;

      // (1) みたいな表記
      ctx.fillStyle = "#888";
      ctx.fillText(`(${count})`, i * w + w / 2, chart.height - h - 38);

      ctx.fillText(k, i * w + w / 2, chart.height - 12);
    });

  } else {
    const bins = 5;
    const min = nums.reduce((a, b) => Math.min(a, b), Infinity);
    const max = nums.reduce((a, b) => Math.max(a, b), -Infinity);
    const step = (max - min) / bins;

    const hist = buildHistogram(nums, bins);

    const maxH = hist.reduce((a, b) => Math.max(a, b), 0);
    const w = chart.width / bins;

    hist.forEach((v, i) => {
      const h = maxH ? (v / maxH) * (chart.height - 50) : 0;

      ctx.fillStyle = "#7aa2ff";
      ctx.fillRect(i * w + 12, chart.height - h - 30, w - 24, h);

      ctx.fillStyle = "#888";
      ctx.fillText(v, i * w + w / 2, chart.height - h - 38);

      // 全値が同じ場合は階級が1つだけなので、ラベルも先頭だけに出す
      if (step === 0 && i > 0) return;
      const label = `${(min + step * i).toFixed(1)}〜`;
      ctx.fillText(label, i * w + w / 2, chart.height - 12);
    });
  }
}
