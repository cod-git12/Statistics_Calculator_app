# 📊 Statistics Web App

カンマ区切りで入力した数値データから、代表値の計算・並び替え・グラフ可視化を行う  
軽量な統計計算 Web アプリです。  
Weアプリ風のカードUIと、ライト / ダークモード切り替えに対応しています。

---

## ✨ 特徴

- 📌 代表値をカード単位で表示  
  平均 / 中央値 / 最頻値 / 最小値 / 最大値 / 合計 / 範囲
- 🔢 数値の並び替え  
  小さい順 / 大きい順 を切り替え可能
- 📊 グラフ表示  
  ・棒グラフ（各値の出現回数を「(1)」形式で表示）  
  ・ヒストグラム（階級ごとの件数表示）
- 🌗 ライト / ダークモード  
  右上スイッチで即時切り替え（☀️ / 🌙）
- 🎨 Weアプリ風 UI  
  カード型レイアウト / フェードインアニメーション

---

## 🛠 使用技術

- HTML5  
- CSS3（CSS Variables / Animation）  
- JavaScript（Vanilla JS）  
- Canvas API（グラフ描画）

※ フレームワーク・外部ライブラリ不使用

---

## 📁 ファイル構成

    .
    ├── index.html   # メインHTML
    ├── style.css    # スタイル定義（テーマ切替含む）
    ├── script.js    # ロジック・計算・描画処理
    └── README.md

---

## 🚀 使い方

1. 数値をカンマ区切りで入力  
   例:
   `1, 5, 3, 3, 9`

3. 並び順を選択  
   小さい順 / 大きい順

4. グラフ種類を選択  
   棒グラフ / ヒストグラム

5. 「計算する」ボタンをクリック

---

## 📊 グラフ仕様

### 棒グラフ

- 各数値の出現回数を表示
- バー上部に (回数) 形式で数値を表示

### ヒストグラム

- データ範囲を5階級に分割
- 各階級ごとの件数を表示

---

## 🌙 テーマ切り替え

画面右上のスイッチでテーマを切り替え可能です。

- ☀️ ライトモード
- 🌙 ダークモード

CSS Variables を利用して、全体配色を一括管理しています。

---

## 📌 制作意図

- 統計の代表値を視覚的に理解しやすくする
- 外部ライブラリに依存しないシンプルな実装
- 学習用途・教育用途・デモ用として使える構成

---

## 🔗 Demo

GitHub Pages で公開可能です。

    https://cod-git12.github.io/Statistics_Calculator_app/

---

## 📜 ライセンス / License

本プロジェクトは **個人利用・学習目的・改変・再配布** を許可します。

ただし、以下の条件を満たす必要があります。

- 本リポジトリを使用・改変・再配布する場合  
  **作者クレジット（Copyright 表記）を必ず明記してください**
- 商用・非商用を問いませんが、  
  **作者名を削除した再配布は禁止**します

### クレジット表記例

    © 2026 cod-git12  
    Statistics Web App  
    https://github.com/cod-git12/Statistics_Calculator_app

---

This software is free to use, modify, and redistribute  
**as long as proper credit to the original author is provided**.

Removing the copyright notice is not permitted.


---

## 👤 Author

- GitHub: cod-git12
