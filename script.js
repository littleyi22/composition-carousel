const defaultOptions = [
    "105會考作文 從陌生到熟悉",
    "106會考作文 在這樣的傳統習俗裡，我看見",
    "107會考作文 我們這個世代",
    "108會考作文 無題，青銀共居",
    "109會考作文 我想開設一家這樣的店",
    "110會考作文 未成功的物品展覽會",
    "111會考作文 多做多得",
    "112會考作文 無題，影劇數據圖表",
    "113會考作文 無題，廣告標題",
    "114會考作文 無題，兩隻倉鼠",
    "預試1 這不是____，更是____",
    "預試2 癌末少女的選擇",
    "預試5 我看從眾實驗",
    "預試7 用不到，丟不掉",
    "預試8 談改變",
    "預試10 不要被____掌控",
    "預試11 說與不說之間",
    "預試12 我看天才時間",
    "預試13 網路與人際互動",
    "預試14 我對榮譽考試制度的看法",
    "預試15 我較為認同○國的讓座文化",
    "預試17 這樣做其實並不傻"
];

let options = [];
let history = [];

// DOM 元素
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const optionsTextarea = document.getElementById('options-textarea');
const saveOptionsBtn = document.getElementById('save-options-btn');
const cancelAdminBtn = document.getElementById('cancel-admin-btn');
const resetDefaultBtn = document.getElementById('reset-default-btn');
const historyList = document.getElementById('history-list');
const resultDisplay = document.getElementById('result-display');
const resultText = document.getElementById('result-text');
const closeResultBtn = document.getElementById('close-result-btn');

let currentRotation = 0;
let isSpinning = false;

// 顏色庫 (水墨、大地色系)
const colors = [
    "#e8d9c8", "#d6c5b3", "#c2b29d", "#b3a38f", "#a0907d", 
    "#8e806c", "#7a6e5b", "#695e4d", "#554c3e", "#423b2f"
];

// 初始化
function init() {
    loadData();
    drawWheel();
    renderHistory();
    
    // 綁定事件
    spinBtn.addEventListener('click', spinWheel);
    adminBtn.addEventListener('click', openAdmin);
    cancelAdminBtn.addEventListener('click', closeAdmin);
    saveOptionsBtn.addEventListener('click', saveOptions);
    resetDefaultBtn.addEventListener('click', resetOptions);
    closeResultBtn.addEventListener('click', () => {
        resultDisplay.classList.add('hidden');
    });
}

function loadData() {
    const savedVersion = localStorage.getItem('essayRouletteVersion');
    if (savedVersion !== '1.2') {
        options = [...defaultOptions];
        localStorage.setItem('essayRouletteVersion', '1.2');
        saveData();
    } else {
        const savedOptions = localStorage.getItem('essayRouletteOptions');
        if (savedOptions) {
            options = JSON.parse(savedOptions);
        } else {
            options = [...defaultOptions];
        }
    }

    const savedHistory = localStorage.getItem('essayRouletteHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }
}

function saveData() {
    localStorage.setItem('essayRouletteOptions', JSON.stringify(options));
    localStorage.setItem('essayRouletteHistory', JSON.stringify(history));
}

function drawWheel() {
    if (options.length === 0) return;
    
    const numOptions = options.length;
    const arc = Math.PI * 2 / numOptions;
    const radius = canvas.width / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(radius, radius);
    
    for (let i = 0; i < numOptions; i++) {
        const angle = i * arc;
        
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + arc);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();
        
        // 繪製文字
        ctx.save();
        ctx.fillStyle = (i % colors.length >= 6) ? "#f4f1ea" : "#1a1a1a";
        // 旋轉到該選項的角度，並加上 PI 讓文字方向對準圓心
        ctx.rotate(angle + arc / 2 + Math.PI);
        
        let text = options[i];
        if (text.length > 20) {
            text = text.substring(0, 20) + "...";
        }
        
        ctx.font = '14px "Noto Serif TC"';
        // 從圓周向圓心寫 (左到右)，所以對齊起點 (Left)
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        // 因為旋轉了 180 度，X 軸的反方向 (-radius) 是外圈，X=0 是中心
        ctx.fillText(text, -radius + 20, 0);
        ctx.restore();
    }
    
    // 繪製中心點
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#3e4a59";
    ctx.fill();
    
    ctx.restore();
}

function spinWheel() {
    if (isSpinning || options.length === 0) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    
    // 隨機旋轉角度 (至少轉 5 圈)
    const spinTurns = 5 + Math.random() * 5; 
    const randomDegree = Math.random() * 360;
    const totalRotation = (spinTurns * 360) + randomDegree;
    
    currentRotation += totalRotation;
    
    canvas.style.transform = `rotate(${currentRotation}deg)`;
    
    // 旋轉結束後的處理
    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        
        // 計算結果
        const normalizedRotation = currentRotation % 360;
        const numOptions = options.length;
        const segmentDegree = 360 / numOptions;
        
        // 指針朝上 (270度 / -90度)，扣除這部分來計算選中的索引
        const offsetRotation = (360 - normalizedRotation + 270) % 360;
        const selectedIndex = Math.floor(offsetRotation / segmentDegree);
        
        const selectedResult = options[selectedIndex];
        showResult(selectedResult);
        addHistory(selectedResult);
        
    }, 5000); // 對應 CSS 中的 transition 時間 (5s)
}

function showResult(result) {
    resultText.innerText = result;
    resultDisplay.classList.remove('hidden');
}

function addHistory(result) {
    const time = new Date().toLocaleTimeString('zh-TW');
    history.unshift(`${time} - ${result}`);
    
    // 最多保留 20 筆歷史
    if (history.length > 20) {
        history.pop();
    }
    
    saveData();
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

function openAdmin() {
    optionsTextarea.value = options.join('\n');
    adminModal.classList.remove('hidden');
}

function closeAdmin() {
    adminModal.classList.add('hidden');
}

function saveOptions() {
    const newOptionsStr = optionsTextarea.value.trim();
    if (newOptionsStr) {
        options = newOptionsStr.split('\n').filter(o => o.trim() !== '');
        saveData();
        drawWheel();
        
        // 重置轉盤角度，避免結果計算錯誤
        currentRotation = 0;
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(0deg)`;
        setTimeout(() => {
            canvas.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)';
        }, 50);
        
        closeAdmin();
    } else {
        alert("選項不能為空！");
    }
}

function resetOptions() {
    if(confirm("確定要恢復預設選項嗎？")) {
        optionsTextarea.value = defaultOptions.join('\n');
    }
}

// 啟動程式
init();
