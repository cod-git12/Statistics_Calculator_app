// Statistics_Calculator_app の計算ロジックのテスト。
// 実行方法（リポジトリ直下で）:  node --test tests/stats.test.mjs
// stats.js はブラウザ向けに通常の script としても読めるよう CommonJS でも
// 書き出しているため、ここでは default import で受け取る。

import { test } from "node:test";
import assert from "node:assert/strict";
import Stats from "../stats.js";

const { parseNumbers, computeStats, buildHistogram, formatNumber } = Stats;

// ---------- parseNumbers ----------

test("空文字は空配列（0を1件として扱わない）", () => {
  assert.deepEqual(parseNumbers("").values, []);
  assert.deepEqual(parseNumbers("   ").values, []);
});

test("末尾カンマ・連続カンマは 0 を混入させない", () => {
  assert.deepEqual(parseNumbers("1, 5, 3,").values, [1, 5, 3]);
  assert.deepEqual(parseNumbers("10,,20").values, [10, 20]);
});

test("数値でないトークンは無言で捨てず、無効として報告する", () => {
  const r = parseNumbers("1, abc, 3");
  assert.deepEqual(r.values, [1, 3]);
  assert.deepEqual(r.invalid, ["abc"]);
});

test("Infinity と 16進表記は受理しない", () => {
  assert.deepEqual(parseNumbers("Infinity, 1, 2").invalid, ["Infinity"]);
  assert.deepEqual(parseNumbers("0x10, 20").invalid, ["0x10"]);
});

test("負数・小数はそのまま読める", () => {
  assert.deepEqual(parseNumbers("-2.5, 0, 3.75").values, [-2.5, 0, 3.75]);
});

test("回帰: 指数表記はこれまで通り読める", () => {
  assert.deepEqual(parseNumbers("1e3, 2").values, [1000, 2]);
});

// ---------- computeStats ----------

test("回帰: READMEの例 1, 5, 3, 3, 9", () => {
  const s = computeStats([1, 5, 3, 3, 9]);
  assert.equal(s.mean, 4.2);
  assert.equal(s.median, 3);
  assert.deepEqual(s.mode, [3]);
  assert.equal(s.min, 1);
  assert.equal(s.max, 9);
  assert.equal(s.sum, 21);
  assert.equal(s.range, 8);
});

test("中央値: 偶数件は中央2つの平均", () => {
  assert.equal(computeStats([4, 1, 3, 2]).median, 2.5);
});

test("最頻値: すべて異なる場合はなし、複数ある場合は全部", () => {
  assert.deepEqual(computeStats([1, 2, 3]).mode, []);
  assert.deepEqual(computeStats([9, 9, 3, 3, 1]).mode, [3, 9]);
});

test("回帰: 全値が同じ場合はその値が最頻値で、最小=最大・範囲0", () => {
  const s = computeStats([5, 5, 5]);
  assert.deepEqual(s.mode, [5]);
  assert.equal(s.min, 5);
  assert.equal(s.max, 5);
  assert.equal(s.range, 0);
});

test("computeStats は引数の配列を変更しない", () => {
  const input = [9, 1, 3];
  computeStats(input);
  assert.deepEqual(input, [9, 1, 3]);
});

test("内部の計算精度は維持される（平均は丸めない）", () => {
  assert.equal(computeStats([1, 2, 2]).mean, 5 / 3);
});

test("大量データ（200,000件）でも例外にならない", () => {
  const big = Array(200_000).fill(1);
  big[123_456] = 99;
  const s = computeStats(big);
  assert.equal(s.max, 99);
  assert.equal(s.min, 1);
  assert.equal(s.sum, 200_000 - 1 + 99);
});

// ---------- buildHistogram ----------

test("通常データ: 度数の合計は件数と一致し、最大値は最終階級に入る", () => {
  const h = buildHistogram([1, 2, 3, 4, 5], 5);
  assert.equal(h.reduce((a, b) => a + b, 0), 5);
  assert.equal(h[4], 1);
});

test("全値が同じでも壊れない（幅0の回帰テスト）", () => {
  const h = buildHistogram([5, 5, 5], 5);
  assert.equal(h.reduce((a, b) => a + b, 0), 3);
  assert.equal(h[0], 3);
});

// ---------- formatNumber（表示専用の整形） ----------

test("表示は小数第4位までで、末尾の0は省く", () => {
  assert.equal(formatNumber(1.6666666666666667), "1.6667");
  assert.equal(formatNumber(4.2), "4.2");
  assert.equal(formatNumber(21), "21");
  assert.equal(formatNumber(2.25), "2.25");
});
