const canvas = document.getElementById('terminal');
const ctx = canvas.getContext('2d');

// --- THE ASYNCHRONOUS LOCALIZATION ENGINE ---
let currentLanguage = "es";
let currentDict = null; 

const englishBase = {
    numbers: { 0: "ZERO", 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX", 7: "SEVEN", 8: "EIGHT", 9: "NINE" },
    operators: { "+": "ADD", "-": "SUB", "*": "MULT", "/": "DIV" }
};

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

// Runtime Game State Trackers
let problemCount = 1;
const TOTAL_PROBLEMS = 50;
let playerInput = "";
let systemMessage = "DECODER ONLINE. NETWORK CHANNELS STABLE.";
let terminalColor = "#33ff33";
let gameActive = true;

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

window.switchLanguage = function(langKey, element) {
    currentLanguage = langKey;
    if (element) {
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }
    
    problemCount = 1;
    playerInput = "";
    gameActive = true;
    terminalColor = "#33ff33";
    systemMessage = `CONNECTING TRANSCEIVER INTERCEPT: ${langKey.toUpperCase()}`;
    
    loadLanguagePack(langKey);
}

function generateEquation() {
    const ops = ["+", "-", "*", "/"];
    if (problemCount <= 12) {
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

// FIXED: Cleaned up loops and added safety brackets to prevent global state leaks
function triggerProceduralCorruption() {
    // Clear old memory matrix values completely before rebuilding
    for (let num in matrixState.numbers) matrixState.numbers[num] = false;
    for (let op in matrixState.operators) matrixState.operators[op] = false;

    // Progressively unlock items based on exact score parameters
    if (problemCount > 2)  matrixState.operators["+"] = true;
    if (problemCount > 5)  matrixState.numbers[1] = true;
    if (problemCount > 8)  matrixState.numbers[2] = true;
    if (problemCount > 11) matrixState.operators["-"] = true;
    if (problemCount > 15) matrixState.numbers[3] = true;
    if (problemCount > 19) matrixState.numbers[4] = true;
    if (problemCount > 24) matrixState.operators["*"] = true;
    if (problemCount > 28) matrixState.numbers[5] = true;
    if (problemCount > 32) matrixState.numbers[6] = true;
    if (problemCount > 36) matrixState.operators["/"] = true;
    if (problemCount > 40) matrixState.numbers[7] = true;
    if (problemCount > 43) matrixState.numbers[8] = true;
    if (problemCount > 46) matrixState.numbers[9] = true;
    if (problemCount > 48) matrixState.numbers[0] = true;
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
    ctx.fillText(`CURVE CORRUPTION METRIC: ${problemCount * 2}%`, 25, 110);
    ctx.fillText("==================================================", 25, 135);

    ctx.font = "bold 14px monospace";
    ctx.fillText("TRANSCEIVER REGISTER STATUS:", 30, 165);

    // FIXED: Rebuilt layout into a spacious 2-column list layout giving 280px width per item to prevent collisions
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
        let subText = isCorrupted ? currentDict.numbers[i] : englishBase.numbers[i];
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
        let subOpText = isCorrupted ? currentDict.operators[op] : englishBase.operators[op];
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
        ctx.fillText(`Terminal OS fully configured to native operations.`, 35, 530);
    }

    // Virtual Touch Pad Layout Buttons container starts safely below the layout space metrics at 570
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
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }

    ctx.fillStyle = "rgba(0, 10, 0, 0.08)";
    for (let k = 0; k < canvas.height; k += 4) ctx.fillRect(0, k, canvas.width, 2);
}

function checkSubmission() {
    if (!gameActive) return;
    if (parseInt(playerInput.trim()) === currentAnswer) {
        problemCount++; playerInput = "";
        if (problemCount > TOTAL_PROBLEMS) {
			gameActive = false;
        } else {
            systemMessage = "VALID PARSE SEGMENT INTERCEPTED.";
            generateEquation();
        }
    } else {
        systemMessage = "CRITICAL METRIC BALANCE FAULT.";
        playerInput = "";
    }
    drawTerminal();
}

// Touch Handling Logic Intercept Engine
function handleScreenTouch(canvasX, canvasY) {
    if (!gameActive) return;

    keypads.forEach(btn => {
        if (canvasX >= btn.x && canvasX <= btn.x + btn.w && canvasY >= btn.y && canvasY <= btn.y + btn.h) {
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

// Canvas Touch Intercept Listener Actions Map Hooks
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents zoom-double-tap delays on phone browsers
    const rect = canvas.getBoundingClientRect();
    
    // Scale tracking down directly to coordinate grids
    const touch = e.touches[0]; // Restored explicit target index
    const scaleX = canvas.width / rect.width; 
    const scaleY = canvas.height / rect.height;
    
    handleScreenTouch(
        (touch.clientX - rect.left) * scaleX, 
        (touch.clientY - rect.top) * scaleY
    );
}, { passive: false });

// Desktop Mouse Click Compatibility Callback
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; 
    const scaleY = canvas.height / rect.height;
    
    handleScreenTouch(
        (e.clientX - rect.left) * scaleX, 
        (e.clientY - rect.top) * scaleY
    );
});

// Initialization Sequencing Runtime Launches
setupMobileKeypad();
loadLanguagePack(currentLanguage);