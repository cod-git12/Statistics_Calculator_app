const input = document.getElementById("input");
const sorted = document.getElementById("sorted");
const stats = document.getElementById("stats");
const chart = document.getElementById("chart");
const graphType = document.getElementById("graphType");
const calcBtn = document.getElementById("calcBtn");
const themeSwitch = document.getElementById("themeSwitch");

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSwitch.checked);
});

calcBtn.addEventListener("click", calculate);

function calculate(){
  let nums = input.value
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v));

  if(!nums.length) return;

  const order = document.querySelector('input[name="order"]:checked').value;
  nums.sort((a,b)=> order==="asc" ? a-b : b-a);

  sorted.textContent = nums.join(", ");

  // 代表値
  stats.innerHTML = "";

  const mean = nums.reduce((a,b)=>a+b,0)/nums.length;
  const s = [...nums].sort((a,b)=>a-b);
  const m = Math.floor(s.length/2);
  const median = s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;

  const freq = {};
  nums.forEach(n => freq[n] = (freq[n]||0) + 1);

  const maxFreq = Math.max(...Object.values(freq));
  const mode = maxFreq === 1 ? "なし"
    : Object.keys(freq).filter(k => freq[k] === maxFreq).join(", ");

  const data = {
    平均: mean,
    中央値: median,
    最頻値: mode,
    最小: Math.min(...nums),
    最大: Math.max(...nums),
    合計: nums.reduce((a,b)=>a+b,0),
    範囲: Math.max(...nums) - Math.min(...nums)
  };

  Object.entries(data).forEach(([k,v],i)=>{
    const d = document.createElement("div");
    d.className = "stat";
    d.style.animationDelay = `${i*0.05}s`;
    d.innerHTML = `<h3>${k}</h3><p>${v}</p>`;
    stats.appendChild(d);
  });

  drawGraph(nums, freq);
}

function drawGraph(nums, freq){
  const ctx = chart.getContext("2d");
  chart.width = chart.offsetWidth;
  chart.height = 240;

  ctx.clearRect(0,0,chart.width,chart.height);
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";

  if(graphType.value === "bar"){
    const keys = Object.keys(freq);
    const max = Math.max(...Object.values(freq));
    const w = chart.width / keys.length;

    keys.forEach((k,i)=>{
      const count = freq[k];
      const h = (count / max) * (chart.height - 50);

      ctx.fillStyle = "#4f7cff";
      ctx.fillRect(i*w + 12, chart.height - h - 30, w - 24, h);

      // (1) みたいな表記
      ctx.fillStyle = "#888";
      ctx.fillText(`(${count})`, i*w + w/2, chart.height - h - 38);

      ctx.fillText(k, i*w + w/2, chart.height - 12);
    });

  }else{
    const bins = 5;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const step = (max - min) / bins;

    const hist = Array(bins).fill(0);
    nums.forEach(n=>{
      let i = Math.min(bins-1, Math.floor((n - min) / step));
      hist[i]++;
    });

    const maxH = Math.max(...hist);
    const w = chart.width / bins;

    hist.forEach((v,i)=>{
      const h = (v / maxH) * (chart.height - 50);

      ctx.fillStyle = "#7aa2ff";
      ctx.fillRect(i*w + 12, chart.height - h - 30, w - 24, h);

      ctx.fillStyle = "#888";
      ctx.fillText(v, i*w + w/2, chart.height - h - 38);

      const label = `${(min + step*i).toFixed(1)}〜`;
      ctx.fillText(label, i*w + w/2, chart.height - 12);
    });
  }
}
