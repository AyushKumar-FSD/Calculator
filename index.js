/* ===============================
   DOM REFERENCES
================================ */
const buttons = document.querySelectorAll("button");
const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");
const logEl = document.getElementById("log");
const app = document.getElementById("app");
const delBtn = document.getElementById("del");

/* ===============================
   STATE
================================ */
let currentInput = "";
let lastExpression = "";
let justEvaluated = false;

/* ===============================
   INITIAL LOAD
================================ */
loadTheme();
loadHistory();

/* ===============================
   BUTTON HANDLING
================================ */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.innerText;

    switch(value){

      case "AC":
        resetCalculator();
        break;

      case "DEL":
        deleteLastChar();
        break;

      case "%":
        applyPercentage();
        break;

      case "=":
        calculateResult();
        break;

      default:
        appendValue(value);
    }

    updateUI();
  });
});

/* ===============================
   CORE FUNCTIONS
================================ */

/* Reset everything */
function resetCalculator(){
  currentInput = "";
  lastExpression = "";
  justEvaluated = false;
}

/* Remove last character */
function deleteLastChar(){
  currentInput = currentInput.slice(0,-1);
}

/* Convert to percentage */
function applyPercentage(){
  if(currentInput !== ""){
    currentInput = (Number(currentInput) / 100).toString();
  }
}

/* Perform calculation */
function calculateResult(){

  if(currentInput === "" || currentInput === "Error") return;

  try{
    lastExpression = currentInput;

    const expression = currentInput
      .replace(/×/g,"*")
      .replace(/÷/g,"/")
      .replace(/−/g,"-");

    let result = eval(expression);

    if(isNaN(result)){
      currentInput = "Error";
      return;
    }

    currentInput = formatNumber(result);
    saveHistory(lastExpression, currentInput);
    justEvaluated = true;

  }catch{
    currentInput = "Error";
  }
}

/* Add number/operator */
function appendValue(val){

  if(justEvaluated){
    currentInput = "";
    lastExpression = "";
    justEvaluated = false;
  }

  if(currentInput === "Error") currentInput = "";

  currentInput += val;
}

/* ===============================
   UI
================================ */
function updateUI(){

  resultEl.innerText = currentInput || "0";
  historyEl.innerText = lastExpression;

  /* Auto resize */
  const len = resultEl.innerText.length;

  if(len > 24) resultEl.style.fontSize = "16px";
  else if(len > 18) resultEl.style.fontSize = "20px";
  else if(len > 14) resultEl.style.fontSize = "26px";
  else resultEl.style.fontSize = "34px";

  /* Auto scroll */
  resultEl.scrollLeft = resultEl.scrollWidth;
}

/* ===============================
   NUMBER FORMAT
================================ */
function formatNumber(num){

  if(num !== 0 && (Math.abs(num)>=1e12 || Math.abs(num)<=1e-6)){
    return num.toExponential(10);
  }

  return parseFloat(num.toFixed(10)).toString();
}

/* ===============================
   LONG PRESS DEL
================================ */
let hold;
delBtn.onmousedown = () => {
  hold = setTimeout(()=>{
    currentInput = "";
    updateUI();
  },600);
};
delBtn.onmouseup = ()=> clearTimeout(hold);

/* ===============================
   THEME
================================ */
document.getElementById("themeBtn").onclick = ()=>{
  app.classList.toggle("light");
  localStorage.setItem("theme", app.classList.contains("light"));
};

function loadTheme(){
  if(localStorage.getItem("theme")==="true"){
    app.classList.add("light");
  }
}

/* ===============================
   HISTORY
================================ */
function saveHistory(exp,res){

  const arr = JSON.parse(localStorage.getItem("calcHistory")) || [];
  arr.unshift({exp,res});
  localStorage.setItem("calcHistory", JSON.stringify(arr));
  loadHistory();
}

function loadHistory(){

  const arr = JSON.parse(localStorage.getItem("calcHistory")) || [];
  logEl.innerHTML = "";

  arr.forEach((item,i)=>{

    const row = document.createElement("div");
    row.className = "history-item";

    const text = document.createElement("span");
    const fullText = `${item.exp} = ${item.res}`;

    text.innerText = fullText;
    text.title = fullText;

    let expanded = false;

    text.onclick = ()=>{
      expanded = !expanded;
      text.style.whiteSpace = expanded ? "normal" : "nowrap";

      currentInput = item.exp;
      lastExpression = "";
      justEvaluated = false;
      updateUI();
    };

    const del = document.createElement("span");
    del.className = "history-delete";
    del.innerText = "✖";
    del.onclick = ()=>{
      arr.splice(i,1);
      localStorage.setItem("calcHistory", JSON.stringify(arr));
      loadHistory();
    };

    row.append(text,del);
    logEl.appendChild(row);
  });
}

/* ===============================
   CLEAR ALL HISTORY
================================ */
document.getElementById("clearAllHistory").onclick = ()=>{

  const btn = document.getElementById("clearAllHistory");

  btn.classList.add("shake");
  setTimeout(()=>btn.classList.remove("shake"),400);

  localStorage.removeItem("calcHistory");
  logEl.innerHTML = "";
};

/* ===============================
   COLLAPSE HISTORY
================================ */
document.getElementById("collapseBtn").onclick = ()=>{
  document.getElementById("historyBox")
  .classList.toggle("collapsed");
};
