"use strict";

// 統計計算の純粋関数群。DOM には触れない。
// ブラウザでは通常の script として読み込み window.Stats に公開し、
// Node.js のテストからは CommonJS として読み込む（二重対応にしたのは、
// これまで通り file:// で index.html を直接開く使い方を壊さないため）。
(function (global) {
  // 10進表記のみを数値として認める（"0x10" や "Infinity" は無効）。
  // 指数表記（"1e3"）は、これまでの Number() の挙動に合わせて受理する。
  const DECIMAL_RE = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

  // カンマ区切り文字列をパースする。
  // 空の要素（末尾カンマ・連続カンマなど）は無視し、0 として扱わない。
  // 数値として読めない要素は捨てずに invalid に集めて返す。
  function parseNumbers(text) {
    const values = [];
    const invalid = [];
    String(text)
      .split(",")
      .forEach((raw) => {
        const token = raw.trim();
        if (token === "") return;
        const value = Number(token);
        if (!DECIMAL_RE.test(token) || !Number.isFinite(value)) {
          invalid.push(token);
        } else {
          values.push(value);
        }
      });
    return { values, invalid };
  }

  function computeStats(nums) {
    if (!nums.length) return null;

    // スプレッド（...nums）は大量データで例外になるため使わない。
    const min = nums.reduce((a, b) => Math.min(a, b), Infinity);
    const max = nums.reduce((a, b) => Math.max(a, b), -Infinity);
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;

    // 中央値用にコピーをソートする（引数の配列は変更しない）。
    const s = [...nums].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    const median = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;

    const freq = new Map();
    nums.forEach((n) => freq.set(n, (freq.get(n) || 0) + 1));
    let maxFreq = 0;
    freq.forEach((count) => {
      if (count > maxFreq) maxFreq = count;
    });
    // すべて1回しか出ない場合は「最頻値なし」として空配列を返す（従来の挙動）。
    const mode =
      maxFreq <= 1
        ? []
        : [...freq.keys()]
            .filter((k) => freq.get(k) === maxFreq)
            .sort((a, b) => a - b);

    return { mean, median, mode, min, max, sum, range: max - min, count: nums.length };
  }

  // ヒストグラムの度数を返す。全値が同じ（幅0）場合は先頭の階級に全件入れる。
  function buildHistogram(nums, bins = 5) {
    const counts = Array(bins).fill(0);
    if (!nums.length) return counts;

    const min = nums.reduce((a, b) => Math.min(a, b), Infinity);
    const max = nums.reduce((a, b) => Math.max(a, b), -Infinity);
    if (min === max) {
      counts[0] = nums.length;
      return counts;
    }

    const step = (max - min) / bins;
    nums.forEach((n) => {
      const i = Math.min(bins - 1, Math.max(0, Math.floor((n - min) / step)));
      counts[i]++;
    });
    return counts;
  }

  // 画面表示専用の整形。内部の計算値には適用しない。
  // 原則として小数第4位まで（末尾の 0 は省く）。
  function formatNumber(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return String(value);
    return String(Number(value.toFixed(4)));
  }

  const api = { parseNumbers, computeStats, buildHistogram, formatNumber };
  global.Stats = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
