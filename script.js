/* ========================================
   TASKBAR CLOCK
======================================== */

const taskbarClock =
    document.querySelector("#taskbarClock");

function updateClock() {

    const now = new Date();

    let hours = now.getHours();

    const minutes =
        now.getMinutes().toString().padStart(2, "0");

    const isPM = hours >= 12;

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    const suffix = isPM ? "PM" : "AM";

    taskbarClock.textContent =
        hours + ":" + minutes + " " + suffix;

}

updateClock();

setInterval(updateClock, 1000);


/* ========================================
   DESKTOP REFERENCE
======================================== */

const desktop =
    document.querySelector(".desktop");


/* ========================================
   WINDOW REGISTRY
   (new — lets the Start Menu / Terminal /
   keyboard shortcuts open or focus any
   existing window without duplicating it)
======================================== */

const windows = {};


/* ========================================
   WINDOW STACKING (BRING TO FRONT)
======================================== */

let topZ = 100;

function bringToFront(windowEl) {

    topZ = topZ + 1;

    windowEl.style.zIndex = topZ;

}


/* ========================================
   WINDOW CONTROLLER
   (reused for every window: About Me,
   My Projects, and each project detail
   window — same drag / minimize /
   maximize / close / taskbar behavior)
======================================== */

function setupWindow(config) {

    const windowEl =
        document.querySelector(config.windowSelector);

    const taskButton =
        document.querySelector(config.taskButtonSelector);

    const titleBar =
        windowEl.querySelector(".title-bar");

    const minimizeBtn =
        windowEl.querySelector('[data-action="minimize"]');

    const maximizeBtn =
        windowEl.querySelector('[data-action="maximize"]');

    const closeBtn =
        windowEl.querySelector('[data-action="close"]');

    const restoreWidth =
        config.width || "690px";

    const restoreHeight =
        config.height || "480px";

    /* ====================================
       RESPONSIVE SIZE HELPERS
       (new — on a normal desktop viewport
       these resolve to the exact same
       restoreWidth/restoreHeight as
       before; on a small screen the
       vw/vh side of min() wins instead,
       so the window shrinks to fit
       without ever needing a resize
       listener — min() recalculates live)
    ==================================== */

    function responsiveWidth() {
        return "min(94vw, " + restoreWidth + ")";
    }

    function responsiveHeight() {
        return "min(78vh, " + restoreHeight + ")";
    }


    let isDragging = false;

    let offsetX = 0;
    let offsetY = 0;

    let isMaximized = false;


    /* ====================================
       OPEN WINDOW
    ==================================== */

    function openWindow() {

        const wasHidden =
            windowEl.style.display === "none" ||
            windowEl.style.display === "";

        windowEl.style.display = "block";

        bringToFront(windowEl);

        if (!isMaximized) {

            windowEl.style.width = responsiveWidth();
            windowEl.style.height = responsiveHeight();

        }

        windowEl.classList.remove("pixel-open");

        void windowEl.offsetWidth;

        windowEl.classList.add("pixel-open");

        taskButton.style.display = "flex";

        taskButton.classList.remove("showing");

        void taskButton.offsetWidth;

        taskButton.classList.add("showing");

        taskButton.classList.add("active");

        if (!isMaximized && wasHidden) {

            const rect =
                windowEl.getBoundingClientRect();

            const desktopRect =
                desktop.getBoundingClientRect();

            const isSmallScreen =
                window.innerWidth <= 700;

            let x =
                (desktopRect.width - rect.width) / 2;

            let y = isSmallScreen ? 14 : 60;

            windowEl.style.left = x + "px";
            windowEl.style.top = y + "px";
        }
    }


    /* ====================================
       OPEN TRIGGERS
       (desktop icons / file icons that
       open this window)
    ==================================== */

    config.openTriggers.forEach(function (trigger) {

        trigger.addEventListener(
            config.openEvent || "dblclick",
            function () {
                openWindow();
            }
        );

    });


    /* ====================================
       BRING TO FRONT ON ANY CLICK
    ==================================== */

    windowEl.addEventListener(
        "mousedown",
        function () {

            bringToFront(windowEl);

        }
    );


    /* ====================================
       DRAG START — ONLY TITLE BAR
    ==================================== */

    titleBar.addEventListener(
        "mousedown",
        function (event) {

            if (event.target.closest(".window-btn")) {
                return;
            }

            if (isMaximized) {
                return;
            }

            isDragging = true;

            const rect =
                windowEl.getBoundingClientRect();

            offsetX =
                event.clientX - rect.left;

            offsetY =
                event.clientY - rect.top;

            titleBar.classList.add("dragging");

            event.preventDefault();

        }
    );


    /* ====================================
       DRAG WINDOW
    ==================================== */

    document.addEventListener(
        "mousemove",
        function (event) {

            if (!isDragging) {
                return;
            }

            const desktopRect =
                desktop.getBoundingClientRect();

            let x =
                event.clientX -
                desktopRect.left -
                offsetX;

            let y =
                event.clientY -
                desktopRect.top -
                offsetY;

            windowEl.style.left = x + "px";
            windowEl.style.top = y + "px";

        }
    );


    /* ====================================
       STOP DRAGGING
    ==================================== */

    document.addEventListener(
        "mouseup",
        function () {

            isDragging = false;

            titleBar.classList.remove("dragging");

        }
    );


    /* ====================================
       MINIMIZE
    ==================================== */

    minimizeBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            windowEl.style.display = "none";

            taskButton.classList.remove("active");

        }
    );


    /* ====================================
       CLOSE
    ==================================== */

    closeBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            windowEl.style.display = "none";

            taskButton.style.display = "none";

            taskButton.classList.remove("active");

            isMaximized = false;

            windowEl.style.width = responsiveWidth();
            windowEl.style.height = responsiveHeight();

            windowEl.style.left = "50%";
            windowEl.style.top = "60px";

            maximizeBtn.textContent = "□";

        }
    );


    /* ====================================
       MAXIMIZE / RESTORE
    ==================================== */

    maximizeBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (!isMaximized) {

                windowEl.style.left = "0px";
                windowEl.style.top = "0px";

                windowEl.style.width = "100vw";

                windowEl.style.height =
                    "calc(100vh - 92px)";

                isMaximized = true;

                maximizeBtn.textContent = "❐";

            }

            else {

                windowEl.style.width = responsiveWidth();
                windowEl.style.height = responsiveHeight();

                windowEl.style.left = "50%";
                windowEl.style.top = "60px";

                isMaximized = false;

                maximizeBtn.textContent = "□";

            }

        }
    );


    /* ====================================
       TASKBAR BUTTON — RESTORE / MINIMIZE
    ==================================== */

    taskButton.addEventListener(
        "click",
        function () {

            if (windowEl.style.display === "none") {

                windowEl.style.display = "block";

                bringToFront(windowEl);

                taskButton.classList.add("active");

            }

            else {

                windowEl.style.display = "none";

                taskButton.classList.remove("active");

            }

        }
    );


    /* ====================================
       EXPOSE OPEN/FOCUS BEHAVIOR
       (new — used by the Start Menu and
       the Terminal's global shortcut so
       they can bring an already-open
       window to front instead of
       duplicating it)
    ==================================== */

    return {
        open: openWindow,
        windowEl: windowEl,
        taskButton: taskButton
    };

}


/* ========================================
   CAMERA WINDOW
======================================== */

windows.camera = setupWindow({
    windowSelector: "#cameraWindow",
    taskButtonSelector: "#cameraTaskButton",
    openTriggers: [
        document.querySelector("#cameraIcon")
    ],
    width: "540px",
    height: "500px"
});


/* ========================================
   CAMERA APP LOGIC
======================================== */

const cameraIcon =
    document.querySelector("#cameraIcon");

const cameraWindow =
    document.querySelector("#cameraWindow");

const cameraVideo =
    document.querySelector("#cameraVideo");

const cameraCanvas =
    document.querySelector("#cameraCanvas");

const cameraPhoto =
    document.querySelector("#cameraPhoto");

const cameraStatus =
    document.querySelector("#cameraStatus");

const captureBtn =
    document.querySelector("#captureBtn");

const retakeBtn =
    document.querySelector("#retakeBtn");

const downloadBtn =
    document.querySelector("#downloadBtn");

let cameraStream = null;


/* ====================================
   START CAMERA
==================================== */

function startCamera() {

    if (cameraStream) {
        return;
    }

    cameraStatus.textContent =
        "STARTING CAMERA...";

    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {

            cameraStream = stream;

            cameraVideo.srcObject = stream;

            cameraVideo.style.display = "block";

            cameraPhoto.style.display = "none";

            captureBtn.style.display = "flex";

            retakeBtn.style.display = "none";

            downloadBtn.style.display = "none";

            cameraStatus.textContent = "";

        })
        .catch(function () {

            cameraStatus.textContent =
                "CAMERA UNAVAILABLE — CHECK PERMISSIONS";

        });

}


/* ====================================
   STOP CAMERA
==================================== */

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(
            function (track) {
                track.stop();
            }
        );

        cameraStream = null;

    }

}


/* ====================================
   CAPTURE PHOTO
   (downscaled + retro-filtered for
   that pixelated retro camera look)
==================================== */

function capturePhoto() {

    if (!cameraStream) {
        return;
    }

    const pixelWidth = 160;
    const pixelHeight = 112;

    cameraCanvas.width = pixelWidth;
    cameraCanvas.height = pixelHeight;

    const ctx =
        cameraCanvas.getContext("2d");

    ctx.filter =
        "sepia(0.35) saturate(1.5) contrast(1.15) brightness(0.9) hue-rotate(-10deg)";

    ctx.drawImage(
        cameraVideo,
        0, 0,
        pixelWidth, pixelHeight
    );

    const dataUrl =
        cameraCanvas.toDataURL("image/png");

    cameraPhoto.src = dataUrl;

    cameraPhoto.style.display = "block";
    cameraVideo.style.display = "none";

    captureBtn.style.display = "none";
    retakeBtn.style.display = "flex";
    downloadBtn.style.display = "flex";

    downloadBtn.href = dataUrl;

}


/* ====================================
   RETAKE PHOTO
==================================== */

function retakePhoto() {

    cameraPhoto.style.display = "none";
    cameraVideo.style.display = "block";

    retakeBtn.style.display = "none";
    downloadBtn.style.display = "none";
    captureBtn.style.display = "flex";

}


/* ====================================
   EVENTS
==================================== */

cameraIcon.addEventListener(
    "dblclick",
    startCamera
);

captureBtn.addEventListener(
    "click",
    capturePhoto
);

retakeBtn.addEventListener(
    "click",
    retakePhoto
);

cameraWindow
    .querySelector('[data-action="close"]')
    .addEventListener("click", stopCamera);

cameraWindow
    .querySelector('[data-action="minimize"]')
    .addEventListener("click", stopCamera);

windows.contact = setupWindow({
    windowSelector: "#contactWindow",
    taskButtonSelector: "#contactTaskButton",
    openTriggers: [
        document.querySelector("#contactIcon")
    ],
    width: "500px",
    height: "320px"
});

windows.about = setupWindow({
    windowSelector: "#aboutWindow",
    taskButtonSelector: "#aboutTaskButton",
    openTriggers: [
        document.querySelector("#aboutIcon")
    ],
    width: "690px",
    height: "480px"
});


/* ========================================
   SKILLS WINDOW
======================================== */

windows.skills = setupWindow({
    windowSelector: "#skillsWindow",
    taskButtonSelector: "#skillsTaskButton",
    openTriggers: [
        document.querySelector("#skillsIcon")
    ],
    width: "620px",
    height: "620px"
});


/* ========================================
   MY PROJECTS WINDOW
======================================== */

windows.projects = setupWindow({
    windowSelector: "#projectsWindow",
    taskButtonSelector: "#projectsTaskButton",
    openTriggers: [
        document.querySelector("#projectsIcon")
    ],
    width: "800px",
    height: "500px"
});


/* ========================================
   RETRO GAMES DETAIL WINDOW
   (opened by clicking the file
   inside the Projects window)
======================================== */

windows.retro = setupWindow({
    windowSelector: "#retroWindow",
    taskButtonSelector: "#retroTaskButton",
    openTriggers: [
        document.querySelector("#retroFile")
    ],
    openEvent: "click",
    width: "600px",
    height: "420px"
});


/* ========================================
   AERO FLAPPY DETAIL WINDOW
   (opened by clicking the file inside
   the Retro Games window)
======================================== */

windows.aero = setupWindow({
    windowSelector: "#aeroWindow",
    taskButtonSelector: "#aeroTaskButton",
    openTriggers: [
        document.querySelector("#aeroFile")
    ],
    openEvent: "click",
    width: "600px",
    height: "560px"
});


/* ========================================
   BUBBLEGUM BITCH RUN DETAIL WINDOW
======================================== */

windows.bubblegum = setupWindow({
    windowSelector: "#bubblegumWindow",
    taskButtonSelector: "#bubblegumTaskButton",
    openTriggers: [
        document.querySelector("#bubblegumFile")
    ],
    openEvent: "click",
    width: "600px",
    height: "560px"
});


/* ========================================
   DESK COMPANION DETAIL WINDOW
======================================== */

windows.desk = setupWindow({
    windowSelector: "#deskWindow",
    taskButtonSelector: "#deskTaskButton",
    openTriggers: [
        document.querySelector("#deskFile")
    ],
    openEvent: "click",
    width: "600px",
    height: "560px"
});


/* ========================================
   SMART AGRICULTURE DETAIL WINDOW
======================================== */

windows.agri = setupWindow({
    windowSelector: "#agriWindow",
    taskButtonSelector: "#agriTaskButton",
    openTriggers: [
        document.querySelector("#agriFile")
    ],
    openEvent: "click",
    width: "600px",
    height: "560px"
});


/* ========================================
   OTHERS DETAIL WINDOW
======================================== */

windows.others = setupWindow({
    windowSelector: "#othersWindow",
    taskButtonSelector: "#othersTaskButton",
    openTriggers: [
        document.querySelector("#othersFile")
    ],
    openEvent: "click",
    width: "600px",
    height: "500px"
});


/* ========================================
   TERMINAL WINDOW
   (new — no desktop-icon trigger; opened
   from the Start Menu or the Ctrl+A
   shortcut instead, both routed through
   openTerminal() below)
======================================== */

windows.terminal = setupWindow({
    windowSelector: "#terminalWindow",
    taskButtonSelector: "#terminalTaskButton",
    openTriggers: [],
    width: "560px",
    height: "420px"
});


/* ========================================================================
   START MENU
======================================================================== */

const startButton =
    document.querySelector(".start-button");

const startMenu =
    document.querySelector("#startMenu");


function openStartMenu() {

    startMenu.classList.add("open");

    startButton.classList.add("active");

}

function closeStartMenu() {

    startMenu.classList.remove("open");

    startButton.classList.remove("active");

}

function toggleStartMenu(event) {

    event.stopPropagation();

    if (startMenu.classList.contains("open")) {
        closeStartMenu();
    }

    else {
        openStartMenu();
    }

}

startButton.addEventListener("click", toggleStartMenu);

/* keep clicks inside the menu from
   bubbling up and immediately re-closing
   it via the document-level listener
   below */
startMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

/* clicking anywhere outside the menu
   (and outside the Start button itself)
   closes it */
document.addEventListener("click", function (event) {

    if (
        !startMenu.contains(event.target) &&
        event.target !== startButton
    ) {
        closeStartMenu();
    }

});


/* ====================================
   START MENU NAVIGATION
   (maps each item to an existing
   window — no new pages invented)
==================================== */

function wireMenuItem(selector, windowKey) {

    document.querySelector(selector)
        .addEventListener("click", function () {

            windows[windowKey].open();

            closeStartMenu();

        });

}

wireMenuItem("#menuAbout", "about");
wireMenuItem("#menuProjects", "projects");
wireMenuItem("#menuGames", "retro");
wireMenuItem("#menuSkills", "skills");
wireMenuItem("#menuCamera", "camera");

document.querySelector("#menuTerminal")
    .addEventListener("click", function () {

        openTerminal();

        closeStartMenu();

    });

document.querySelector("#menuShutdown")
    .addEventListener("click", function () {

        openShutdownDialog();

        closeStartMenu();

    });


/* ========================================================================
   SHUT DOWN CONFIRMATION DIALOG
======================================================================== */

const shutdownOverlay =
    document.querySelector("#shutdownOverlay");

function openShutdownDialog() {

    shutdownOverlay.classList.add("open");

}

function closeShutdownDialog() {

    shutdownOverlay.classList.remove("open");

}

document.querySelector("#shutdownOkBtn")
    .addEventListener("click", closeShutdownDialog);

document.querySelector("#shutdownCloseBtn")
    .addEventListener("click", closeShutdownDialog);

/* clicking the dimmed backdrop also
   dismisses it, like a real dialog */
shutdownOverlay.addEventListener("click", function (event) {

    if (event.target === shutdownOverlay) {
        closeShutdownDialog();
    }

});


/* ========================================================================
   TERMINAL APPLICATION
======================================================================== */

const terminalOutput =
    document.querySelector("#terminalOutput");

const terminalInput =
    document.querySelector("#terminalInput");

let terminalInitialized = false;

let commandHistory = [];
let historyIndex = 0;


const TERMINAL_HELP =
`AVAILABLE COMMANDS
────────────────────────
about       About me
projects    My projects
games       Retro games
skills      Technical skills
contact     Contact
clear       Clear terminal
secret      ???`;

const TERMINAL_ABOUT =
`Arushi Prakash — Kolkata, West Bengal.
3rd year Electrical Engineering student,
Central University of Jharkhand, Ranchi.

Big fan of Y2K and retro tech. Main niche
is IoT and Machine Learning, with some web
dev, pixel art, and MATLAB/Simulink on the
side.`;

const TERMINAL_PROJECTS =
`RETRO GAMES     Aero Flappy, Bubblegum Bitch Run
DESK COMPANION  Tara — ESP32 + Python AI companion
SMART AGRI      IoT/ML crop health monitoring system
OTHERS          RFID attendance, attendance app,
                Arduino oscilloscope, logic gate lock,
                IR speedometer

Type 'games' for more on the retro games.`;

const TERMINAL_GAMES =
`AERO FLAPPY
  Flappy Bird-style game on an ESP32 with an
  ILI9341 TFT, inside a custom Frutiger Aero
  desktop UI. Custom Catty character and pole
  artwork, gravity/flap physics, buffered
  rendering to cut flicker.

BUBBLEGUM BITCH RUN
  ESP32 runner with an Anti-Hero chase AI,
  coin collection, a three-life system, and
  chunk-based rendering for the TFT.`;

const TERMINAL_SKILLS =
`EMBEDDED & HARDWARE
  Arduino/ESP32 (C++), Raspberry Pi,
  Circuit Design, Sensors & Instrumentation,
  Serial Comm (SPI / RS-485)

PROGRAMMING & SOFTWARE
  C/C++, Python, JavaScript/Web Dev,
  Kotlin (Android Studio), React/Node.js,
  Firebase Realtime DB

DATA, ML & DESIGN
  Machine Learning, MATLAB/Simulink,
  Data Visualization, Pixel Art/Graphics

HOBBIES
  Writing, Reading, Exploring New Technologies`;

const TERMINAL_CONTACT =
`INSTAGRAM  instagram.com/yourhandle
GITHUB     github.com/yourusername
MAIL       prakasharushi113@gmail.com`;

const TERMINAL_SECRET =
`...you found the secret command.
Somewhere in Aero Flappy, a small pixel cat
named Catty is dodging poles right now.
Say hi to her sometime. :)`;


function printTerminalLine(text) {

    const line = document.createElement("div");

    line.textContent = text;

    terminalOutput.appendChild(line);

}

function printTerminalBlock(text) {

    text.split("\n").forEach(printTerminalLine);

}

function scrollTerminalToBottom() {

    terminalOutput.scrollTop =
        terminalOutput.scrollHeight;

}

function runTerminalCommand(rawInput) {

    const command = rawInput.trim().toLowerCase();

    printTerminalLine("ARUSHI@DESKTOP:~$ " + rawInput);

    if (command === "") {

        scrollTerminalToBottom();

        return;

    }

    switch (command) {

        case "help":
            printTerminalBlock(TERMINAL_HELP);
            break;

        case "about":
            printTerminalBlock(TERMINAL_ABOUT);
            windows.about.open();
            break;

        case "projects":
            printTerminalBlock(TERMINAL_PROJECTS);
            windows.projects.open();
            break;

        case "games":
            printTerminalBlock(TERMINAL_GAMES);
            windows.retro.open();
            break;

        case "skills":
            printTerminalBlock(TERMINAL_SKILLS);
            windows.skills.open();
            break;

        case "contact":
            printTerminalBlock(TERMINAL_CONTACT);
            windows.contact.open();
            break;

        case "clear":
            terminalOutput.innerHTML = "";
            break;

        case "secret":
            printTerminalBlock(TERMINAL_SECRET);
            break;

        default:
            printTerminalLine(
                "Command not found. Type 'help' for available commands."
            );
            break;

    }

    scrollTerminalToBottom();

}

function initTerminal() {

    if (terminalInitialized) {
        return;
    }

    terminalInitialized = true;

    printTerminalLine("ARUSHI@DESKTOP:~$");
    printTerminalLine("Type 'help' to see available commands.");

    scrollTerminalToBottom();

}

terminalInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const value = terminalInput.value;

        runTerminalCommand(value);

        if (value.trim() !== "") {
            commandHistory.push(value);
        }

        historyIndex = commandHistory.length;

        terminalInput.value = "";

        return;

    }

    if (event.key === "ArrowUp") {

        if (commandHistory.length === 0) {
            return;
        }

        historyIndex = Math.max(0, historyIndex - 1);

        terminalInput.value =
            commandHistory[historyIndex] || "";

        event.preventDefault();

        return;

    }

    if (event.key === "ArrowDown") {

        if (commandHistory.length === 0) {
            return;
        }

        historyIndex =
            Math.min(commandHistory.length, historyIndex + 1);

        terminalInput.value =
            commandHistory[historyIndex] || "";

        event.preventDefault();

        return;

    }

});


/* ====================================
   OPEN / FOCUS TERMINAL
   (shared by the Start Menu item and
   the Ctrl+A shortcut — brings the
   existing terminal to front instead
   of duplicating it)
==================================== */

function openTerminal() {

    initTerminal();

    windows.terminal.open();

    setTimeout(function () {
        terminalInput.focus();
    }, 0);

}


/* ========================================================================
   GLOBAL CTRL+A SHORTCUT
   (opens/focuses the Terminal — unless
   the user is typing in an input, a
   textarea, or is otherwise in an
   editable field, in which case normal
   "select all" behavior is left alone)
======================================================================== */

document.addEventListener("keydown", function (event) {

    const isCtrlA =
        (event.ctrlKey || event.metaKey) &&
        (event.key === "a" || event.key === "A");

    if (!isCtrlA) {
        return;
    }

    const target = event.target;

    const isTypingContext =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

    if (isTypingContext) {
        return;
    }

    event.preventDefault();

    openTerminal();

});