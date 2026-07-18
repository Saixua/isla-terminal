const canvas = document.getElementById('terminal');
const ctx = canvas.getContext('2d');

// --- THE LOCALIZATION AND STATE PROFILE ENGINES ---
let currentLanguage = "es";
let difficultyMode = "standard"; // Options pathways vectors: "standard" or "hardcore"
let currentDict = null; 

const englishBase = {
    numbers: { 0: "ZERO", 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX", 7: "SEVEN", 8: "EIGHT", 9: "NINE" },
    operators: { "+": "ADD", "-": "SUB", "*": "MULT", "/": "DIV" }
};

// --- LOCALSTORAGE DATA HANDSHAKE STORAGE ALLOCATIONS ---
function initSaveStateProfile() {
    console.log("[SAVE PROFILE] Reading LocalStorage parameters...");
    
    // Pull archived language choice records
    const savedLang = localStorage.getItem("isla_terminal_lang");
    if (savedLang) {
        currentLanguage = savedLang;
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeLangBtn = document.getElementById(`btn-${savedLang}`);
        if (activeLangBtn) activeLangBtn.classList.add('active');
    }

    // Pull archived difficulty status records
    const savedMode = localStorage.getItem("isla_terminal_mode");
    if (savedMode) {
        difficultyMode = savedMode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtnId = savedMode === "standard" ? "mode-std" : "mode-hard";
        const activeModeBtn = document.getElementById(targetBtnId);
        if (activeModeBtn) activeModeBtn.classList.add('active');
    }

    // Pull archived progress tracking markers
    const savedScore = localStorage.getItem(`isla_terminal_progress_${currentLanguage}`);
    if (savedScore) {
        problemCount = parseInt(savedScore);
        console.log(`[SAVE PROFILE] Progress restored for ${currentLanguage.toUpperCase()}: Sector ${problemCount}`);
    } else {
        problemCount = 1;
    }

    loadLanguagePack(currentLanguage);
}

function autoSaveProgress() {
    if (!gameActive) {
        localStorage.removeItem(`isla_terminal_progress_${currentLanguage}`); // Flush score table if fully beaten
        return;
    }
    // Set persistent tracking blocks inside local system storage fields strings values
    localStorage.setItem(`isla_terminal_progress_${currentLanguage}`, problemCount);
    localStorage.setItem("isla_terminal_lang", currentLanguage);
    localStorage.setItem("isla_terminal_mode", difficultyMode);
    console.log(`[AUTOSAVE SUCCESS] Saved profile configuration: Language=${currentLanguage}, Mode=${difficultyMode}, Sector=${problemCount}`);
}

async function loadLanguagePack(langKey) {
    try {
        const response = await fetch(`lang/${langKey}.json?v=${Math.random()}`);
        if (!response.ok) throw new Error(`HTTP network fault code: ${response.status}`);
        currentDict = await response.json();
        
        generateEquation();
        drawTerminal();
    } catch (error) {
        console.error("Critical localization asset crash:", error);
        systemMessage = `CRITICAL: PACK [LANG/${langKey.toUpperCase()}.JSON] NOT FOUND.`;
        drawTerminal();
    }
}

// Runtime Game State Parameters 
let problemCount = 1;
const TOTAL_PROBLEMS = 50;
let playerInput = "";
let systemMessage = "DECODER ONLINE. INTERCEPT NODE READY.";
let terminalColor = "#33ff33";
let gameActive = true;
let systemAudioContext = null;

let currentNum1 = 0;
let currentNum2 = 0;
let currentOperator = "+";
let currentAnswer = 0;

let matrixState = {
    numbers: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false },
    operators: { "+": false, "-": false, "*": false, "/": false }
};

const keypads = [];
function setupMobileKeypad() {
    keypads.length = 0; 
    const startY = 570; 
    const btnWidth = 110; const btnHeight = 70;
    const gapX = 20;      const gapY = 15;
    
    let layout = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["CLR", "0", "ENT"]
    ];

    for (let row = 0; row < 4; row++) {
        let startX = 120; 
        for (let col = 0; col < 3; col++) {
            keypads.push({
                label: layout[row][col],
                x: startX + (col * (btnWidth + gapX)),
                y: startY + (row * (btnHeight + gapY)),
                w: btnWidth, h: btnHeight
            });
        }
    }
}

// Interactive Live Language Switches
window.switchLanguage = function(langKey, element) {
    currentLanguage = langKey;
    if (element) {
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }
    
    // Pull existing score records for the newly chosen language layout from local profile logs
    const savedScore = localStorage.getItem(`isla_terminal_progress_${langKey}`);
    problemCount = savedScore ? parseInt(savedScore) : 1;

    playerInput = "";
    gameActive = true;
    terminalColor = "#33ff33";
    systemMessage = `TRANSCEIVER RE-ROUTING TO TARGET: ${langKey.toUpperCase()}`;
    
    autoSaveProgress();
    loadLanguagePack(langKey);
}

// Difficulty Setting Configuration Switches Panel
window.switchDifficultyMode = function(modeKey, element) {
    difficultyMode = modeKey;
    if (element) {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }
    systemMessage = `OS CONVERSION TYPE ALTERED TO: ${modeKey.toUpperCase()}`;
    autoSaveProgress();
    generateEquation();
    drawTerminal();
}

function generateEquation() {
    const ops = ["+", "-", "*", "/"];
    if (problemCount <= 12 && difficultyMode === "standard") {
        currentOperator = ops[Math.floor(Math.random() * 2)];
    } else {
        currentOperator = ops[Math.floor(Math.random() * 4)];
    }

    let valid = false;
    while (!valid) {
        currentNum1 = Math.floor(Math.random() * 10);
        currentNum2 = Math.floor(Math.random() * 10);

        if (currentOperator === "+") {
            currentAnswer = currentNum1 + currentNum2;
            if (currentAnswer < 10) valid = true;
        } else if (currentOperator === "-") {
            if (currentNum1 >= currentNum2) {
                currentAnswer = currentNum1 - currentNum2;
                valid = true;
            }
        } else if (currentOperator === "*") {
            currentAnswer = currentNum1 * currentNum2;
            if (currentAnswer < 10) valid = true;
        } else if (currentOperator === "/") {
            if (currentNum2 !== 0 && currentNum1 % currentNum2 === 0) {
                currentAnswer = currentNum1 / currentNum2;
                valid = true;
            }
        }
    }
    triggerProceduralCorruption();
}

function triggerProceduralCorruption() {
    // FIXED: Safely reset individual keys to false instead of wiping out the whole object variable structure
    for (let i = 0; i <= 9; i++) {
        matrixState.numbers[i] = false;
    }
    matrixState.operators["+"] = false;
    matrixState.operators["-"] = false;
    matrixState.operators["*"] = false;
    matrixState.operators["/"] = false;

    // HARDCORE FORCE ENTIRE CONVERSION MAPS ACTIVE INSTANTLY AT LEVEL ZERO
    if (difficultyMode === "hardcore") {
        for (let num in matrixState.numbers) matrixState.numbers[num] = true;
        for (let op in matrixState.operators) matrixState.operators[op] = true;
        return; 
    }

    // Standard Curve parameters progress mapping thresholds
    if (problemCount > 2)  matrixState.operators["+"] = true;
    if (problemCount > 5)  matrixState.numbers[0] = true; matrixState.numbers[1] = true;
    if (problemCount > 10) matrixState.operators["-"] = true;
    if (problemCount > 14) matrixState.numbers[2] = true; matrixState.numbers[3] = true;
    if (problemCount > 20) matrixState.numbers[4] = true; matrixState.numbers[5] = true;
    if (problemCount > 25) matrixState.operators["*"] = true;
    if (problemCount > 30) matrixState.numbers[6] = true;
    if (problemCount > 35) matrixState.operators["/"] = true;
    if (problemCount > 40) matrixState.numbers[7] = true; matrixState.numbers[8] = true;
    if (problemCount > 45) matrixState.numbers[9] = true;
}
function compileWord(type, item) {
    if (!currentDict) return "...";
    if (type === "number") {
        return matrixState.numbers[item] ? currentDict.numbers[item] : englishBase.numbers[item];
    } else {
        return matrixState.operators[item] ? currentDict.operators[item] : englishBase.operators[item];
    }
}

function drawTerminal() {
    ctx.fillStyle = "#000a00";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!currentDict) {
        ctx.fillStyle = "#33ff33";
        ctx.font = "20px monospace";
        ctx.fillText("LOADING DATA INTERCEPT CHANNELS...", 50, 450);
        return;
    }

    let uiText = currentDict.ui;

    ctx.fillStyle = terminalColor;
    ctx.font = "bold 16px monospace";
    ctx.fillText("==================================================", 25, 30);
    ctx.fillText(`[${uiText.module} - ${uiText.status}]`, 25, 55);
    ctx.fillText(`SECTORS COMPLETED: ${problemCount - 1}/${TOTAL_PROBLEMS}`, 25, 85);
    ctx.fillText(`MODE: ${difficultyMode.toUpperCase()}`, 25, 110);
    ctx.fillText("==================================================", 25, 135);
 // --- TRANSCEIVER REGISTRATION SHEET CHEAT SHEET AREA ---
    ctx.font = "bold 14px monospace";
    ctx.fillText(difficultyMode === "hardcore" ? "DECRYPTED OVERRIDE LOG:" : "TRANSCEIVER REGISTER STATUS:", 30, 165);

    let startX = 35;
    for (let i = 0; i <= 9; i++) {
        let rowIdx = i % 5; 
        let colIdx = Math.floor(i / 5); 
        
        let isCorrupted = matrixState.numbers[i]; 
        
        let posX = startX + (colIdx * 280); 
        let posY = 195 + (rowIdx * 28); 

        ctx.fillStyle = isCorrupted ? "#ffaa00" : terminalColor;
        ctx.font = "bold 15px monospace";
        ctx.fillText(`[${i}]`, posX, posY);

        ctx.font = "13px monospace";
        ctx.fillStyle = isCorrupted ? "#ffaa00" : "#88ff88";
        
        // FIXED: subText is initialized here inside the loop scope before being called by fillText
        let subText = isCorrupted ? currentDict.numbers[i] : (difficultyMode === "hardcore" ? "???" : englishBase.numbers[i]);
        ctx.fillText(subText, posX + 32, posY);
    }
    ctx.fillStyle = terminalColor;
    ctx.font = "bold 14px monospace";
    ctx.fillText("DATA INJECTORS:", 30, 355);
    
    let opKeys = ["+", "-", "*", "/"];
    for (let j = 0; j < opKeys.length; j++) {
        let op = opKeys[j];
        let isCorrupted = matrixState.operators[op];
        let opX = startX + (j * 135);
        let opY = 385;

        ctx.fillStyle = isCorrupted ? "#ffaa00" : terminalColor;
        ctx.font = "bold 16px monospace";
        ctx.fillText(`[ ${op} ]`, opX, opY);

        ctx.font = "13px monospace";
        ctx.fillStyle = isCorrupted ? "#ffaa00" : "#88ff88";
        let subOpText = isCorrupted ? currentDict.operators[op] : (difficultyMode === "hardcore" ? "???" : englishBase.operators[op]);
        ctx.fillText(subOpText, opX + 48, opY);
    }

    ctx.fillStyle = terminalColor;
    ctx.font = "15px monospace";
    ctx.fillText("--------------------------------------------------", 25, 415);
    
    ctx.font = "13px monospace";
    ctx.fillText(`LOG [${currentLanguage.toUpperCase()}]: ${systemMessage}`, 30, 440);
    ctx.fillText("--------------------------------------------------", 25, 465);

    if (gameActive) {
        let w1 = compileWord("number", currentNum1);
        let opW = compileWord("operator", currentOperator);
        let w2 = compileWord("number", currentNum2);

        ctx.fillStyle = "#ffffff";
        ctx.font = "15px monospace";
        ctx.fillText("SOLVE OVERRIDE SEQUENCE:", 35, 495);
        ctx.font = "bold 22px monospace"; 
        ctx.fillText(`${w1} ${opW} ${w2} = ?`, 35, 530);
        
        ctx.fillStyle = terminalColor;
        ctx.font = "18px monospace";
        ctx.fillText(`INPUT INTERCEPT: > ${playerInput}_`, 35, 560);
    } else {
        ctx.fillStyle = "#55ff55";
        ctx.font = "22px monospace";
        ctx.fillText(`${uiText.complete} [OK]`, 35, 495);
        ctx.font = "15px monospace";
        ctx.fillText("Terminal OS fully configured to native operations.", 35, 530);
    }

    if (gameActive) {
        keypads.forEach(btn => {
            ctx.strokeStyle = terminalColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

            ctx.fillStyle = terminalColor;
            ctx.font = "bold 20px monospace"; 
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(btn.label, btn.x + (btn.w / 2), btn.y + (btn.h / 2));
        });
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";
    }

    ctx.fillStyle = "rgba(0, 10, 0, 0.08)";
    for (let k = 0; k < canvas.height; k += 4) {
        ctx.fillRect(0, k, canvas.width, 2);
    }
}

function checkSubmission() {
    if (!gameActive) return;
    if (parseInt(playerInput.trim()) === currentAnswer) {
        playFX("correct"); 
        problemCount++; 
        playerInput = "";
        autoSaveProgress(); // Archive successful sectors count instantly into localStorage
        
        if (problemCount > TOTAL_PROBLEMS) {
            gameActive = false;
            autoSaveProgress();
        } else {
            systemMessage = "VALID PARSE SEGMENT INTERCEPTED.";
            generateEquation();
        }
    } else {
        playFX("wrong"); 
        systemMessage = "CRITICAL METRIC BALANCE FAULT.";
        playerInput = "";
    }
    drawTerminal();
}

function playFX(type) {
    try {
        if (!systemAudioContext) {
            systemAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (systemAudioContext.state === 'suspended') {
            systemAudioContext.resume();
        }

        const ctxAudio = systemAudioContext;
        const osc = ctxAudio.createOscillator();
        const gainNode = ctxAudio.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctxAudio.destination);

        const timeNow = ctxAudio.currentTime;

        if (type === "click") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, timeNow); 
            gainNode.gain.setValueAtTime(0.1, timeNow); 
            gainNode.gain.linearRampToValueAtTime(0.01, timeNow + 0.05); 
            osc.start(timeNow);
            osc.stop(timeNow + 0.05); 
        } 
        else if (type === "correct") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(523.25, timeNow); 
            osc.frequency.setValueAtTime(659.25, timeNow + 0.08); 
            gainNode.gain.setValueAtTime(0.1, timeNow);
            gainNode.gain.linearRampToValueAtTime(0.01, timeNow + 0.2);
            osc.start(timeNow);
            osc.stop(timeNow + 0.2);
        } 
        else if (type === "wrong") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, timeNow); 
            osc.frequency.linearRampToValueAtTime(100, timeNow + 0.2); 
            gainNode.gain.setValueAtTime(0.15, timeNow);
            gainNode.gain.linearRampToValueAtTime(0.01, timeNow + 0.2);
            osc.start(timeNow);
            osc.stop(timeNow + 0.2);
        }
    } catch (e) { 
        console.warn("Audio generation failed:", e); 
    }
}

function handleScreenTouch(canvasX, canvasY) {
    if (!gameActive) return;
    keypads.forEach(btn => {
        if (canvasX >= btn.x && canvasX <= btn.x + btn.w && canvasY >= btn.y && canvasY <= btn.y + btn.h) {
            playFX("click");
            if (btn.label === "CLR") {
                playerInput = "";
            } else if (btn.label === "ENT") {
                checkSubmission();
            } else if (playerInput.length < 4) {
                playerInput += btn.label;
            }
            drawTerminal();
        }
    });
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0]; // Restored explicit target array coordinate pointer index
    const scaleX = canvas.width / rect.width; 
    const scaleY = canvas.height / rect.height;
    
    handleScreenTouch(
        (touch.clientX - rect.left) * scaleX, 
        (touch.clientY - rect.top) * scaleY
    );
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; 
    const scaleY = canvas.height / rect.height;
    
    handleScreenTouch(
        (e.clientX - rect.left) * scaleX, 
        (e.clientY - rect.top) * scaleY
    );
});
