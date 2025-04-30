// Exploration Camp v1.3 - Mobile Detection Added

// --- Mobile Detection ---
function isMobileDevice() {
    // Basic check using userAgent and touch events
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Checks for common mobile keywords
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
        return true;
    }
    // Checks for touch event support, common on mobile
    if (("ontouchstart" in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
        return true;
    }
    // Check screen width as a fallback (e.g., < 768px)
    if (window.innerWidth < 768) {
        return true;
    }
    return false;
}

function showMobileWarning() {
    const warningDiv = document.getElementById("mobile-warning");
    if (warningDiv) {
        warningDiv.style.display = "block";
    }
}

// Run detection early
if (isMobileDevice()) {
    // We need to wait for the DOM to be ready to show the warning div
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showMobileWarning);
    } else {
        showMobileWarning();
    }
}

// --- Game State ---
let gameState = {
    currentView: "earth", // earth, map, planet, travel
    player: {
        locationId: "earth",
        credits: 1000,
        rocket: null, // { typeId: "scout", currentHp: 50, maxHp: 50, fuel: 0, maxFuel: 50, efficiency: 1.0 }
        visitedPlanets: ["earth"], // Track visited planets for win condition
        quizProgress: {}, // { planetId: { completed: false, currentQ: 0, score: 0 } },
        inventory: {} // { resourceId: quantity }
    },
    planets: {},
    rockets: {},
    quizzes: {},
    resources: {},
    travel: {
        destinationId: null,
        startTime: 0,
        duration: 0
    }
};

// --- Game Data ---
const ROCKETS = {
    scout: { name: "Scout", cost: 300, maxHp: 50, maxFuel: 50, efficiency: 1.0 },
    hauler: { name: "Hauler", cost: 600, maxHp: 100, maxFuel: 80, efficiency: 1.5 },
    explorer: { name: "Explorer", cost: 1000, maxHp: 75, maxFuel: 100, efficiency: 0.7 }
};

const PLANETS = {
    earth: { name: "Earth", orbitalRadius: 125, speed: 0.02, angle: 2.5, color: "#3498db", radius: 8, description: "Our home planet. The only place to buy rockets, fuel, and repairs.", resources: [], activities: ["buy_rocket", "buy_fuel", "repair"], isHub: true },
    mercury: { name: "Mercury", x: 350, y: 250, orbitalRadius: 50, speed: 0.04, angle: 0, color: "#EBE3CF", radius: 4, description: "The smallest planet and closest to the Sun. Extreme temperatures.", resources: ["iron"], activities: ["gather", "quiz", "minigame"], quizId: "mercury", miniGameId: "mercury_dodge" },
    venus: { name: "Venus", x: 400, y: 250, orbitalRadius: 100, speed: 0.025, angle: 1.5, color: "#FFA500", radius: 8, description: "Earth's 'sister planet', shrouded in thick, toxic clouds. Incredibly hot.", resources: ["sulfur"], activities: ["gather", "quiz", "minigame"], quizId: "venus", miniGameId: "venus_scan" },
    mars: { name: "Mars", x: 450, y: 250, orbitalRadius: 150, speed: 0.018, angle: 3.0, color: "#FF4500", radius: 6, description: "The 'Red Planet', known for its iron oxide surface, giant volcanoes, and canyons.", resources: ["iron_oxide"], activities: ["gather", "quiz", "minigame"], quizId: "mars", miniGameId: "mars_collect" },
    jupiter: { name: "Jupiter", x: 550, y: 250, orbitalRadius: 250, speed: 0.01, angle: 4.5, color: "#D2B48C", radius: 15, description: "The largest planet, a gas giant with a Great Red Spot and many moons.", resources: ["helium3"], activities: ["gather", "quiz", "minigame"], quizId: "jupiter", miniGameId: "jupiter_storm" },
    saturn: { name: "Saturn", x: 650, y: 250, orbitalRadius: 350, speed: 0.007, angle: 0.5, color: "#F4A460", radius: 13, description: "Famous for its stunning ring system, Saturn is another gas giant.", resources: ["ammonia_ice"], activities: ["gather", "quiz", "minigame"], quizId: "saturn", miniGameId: "saturn_rings" },
    uranus: { name: "Uranus", x: 750, y: 250, orbitalRadius: 450, speed: 0.005, angle: 2.0, color: "#AFEEEE", radius: 11, description: "An ice giant tilted on its side, with a faint blue-green hue.", resources: ["methane_ice"], activities: ["gather", "quiz", "minigame"], quizId: "uranus", miniGameId: "uranus_tilt" },
    neptune: { name: "Neptune", x: 850, y: 250, orbitalRadius: 550, speed: 0.004, angle: 4.0, color: "#4682B4", radius: 10, description: "The most distant ice giant, known for its strong winds and deep blue color.", resources: ["tritonium"], activities: ["gather", "quiz", "minigame"], quizId: "neptune", miniGameId: "neptune_wind" }
};

const RESOURCES = {
    iron: { name: "Iron Ore", value: 10, icon: "🔩" },
    sulfur: { name: "Sulfur Deposits", value: 15, icon: "<0xF0><0x9F><0xAA><0xB1>" }, // Rock icon
    iron_oxide: { name: "Iron Oxide", value: 12, icon: "🧱" }, // Brick icon
    helium3: { name: "Helium-3 Isotopes", value: 50, icon: "🎈" }, // Balloon icon
    ammonia_ice: { name: "Ammonia Ice", value: 25, icon: "❄️" },
    methane_ice: { name: "Methane Ice", value: 30, icon: "🧊" },
    tritonium: { name: "Tritonium Crystals", value: 40, icon: "💎" }
};

const PLANET_FACTS = {
    mercury: [
        "Mercury is the smallest planet in our solar system.",
        "It's the closest planet to the Sun, completing an orbit in just 88 Earth days!",
        "Temperatures can swing wildly from scorching hot (430°C) to freezing cold (-180°C).",
        "Mercury has no moons.",
        "Its surface is covered in craters, much like Earth's Moon."
    ],
    venus: [
        "Venus is the hottest planet, even hotter than Mercury, due to its thick atmosphere.",
        "It's often called Earth's 'twin' because they are similar in size.",
        "Venus spins slowly in the opposite direction to most planets (retrograde rotation).",
        "A day on Venus is longer than its year!",
        "Venus has more volcanoes than any other planet in the solar system."
    ],
    earth: [
        "Earth is the third planet from the Sun and the only place known to harbor life.",
        "About 71% of Earth's surface is covered by water.",
        "Earth has one moon.",
        "Our planet travels through space at an incredible speed of 67,000 miles per hour!",
        "Earth's atmosphere protects us from harmful radiation and meteoroids."
    ],
    mars: [
        "Mars is known as the 'Red Planet' because of iron oxide (rust) on its surface.",
        "It has the tallest volcano in the solar system, Olympus Mons, three times taller than Mt. Everest!",
        "Mars also has the longest canyon, Valles Marineris, which would stretch across the entire United States.",
        "Mars has two small moons named Phobos and Deimos.",
        "Sunsets on Mars appear blue."
    ],
    jupiter: [
        "Jupiter is the largest planet in our solar system – more than 1,300 Earths could fit inside!",
        "It's a gas giant made mostly of hydrogen and helium.",
        "The Great Red Spot is a giant storm that has been raging for hundreds of years.",
        "Jupiter has faint rings and dozens of moons (over 90 confirmed!).",
        "A day on Jupiter is only about 10 hours long, the shortest of all planets."
    ],
    saturn: [
        "Saturn is famous for its spectacular ring system, made of ice and rock particles.",
        "It's the second-largest planet and another gas giant.",
        "Saturn has the most moons of any planet (over 140!).",
        "Its density is so low that it would float in a giant bathtub (if one existed!).",
        "Winds on Saturn can reach speeds of over 1,100 miles per hour."
    ],
    uranus: [
        "Uranus is an ice giant, colder than the gas giants.",
        "It rotates on its side, likely due to a massive collision long ago.",
        "Its blue-green color comes from methane gas in its atmosphere.",
        "Uranus has faint rings and 27 known moons.",
        "It was the first planet discovered using a telescope (in 1781)."
    ],
    neptune: [
        "Neptune is the most distant planet from the Sun.",
        "It's an ice giant with a deep blue color, also due to methane.",
        "Neptune has the strongest winds in the solar system, reaching up to 1,200 mph!",
        "It has faint rings and 14 known moons, including Triton, which orbits backwards.",
        "A year on Neptune takes almost 165 Earth years."
    ]
};

const QUIZZES = {
    mercury: [
        { q: "Mercury is the ____ planet from the Sun.", a: ["Closest", "Second", "Third", "Smallest"], correct: 0, reward: 10 },
        { q: "Mercury is known for its extreme...?", a: ["Winds", "Rainfall", "Temperature swings", "Magnetic field"], correct: 2, reward: 10 },
        { q: "Does Mercury have any moons?", a: ["Yes, one", "Yes, two", "No", "Yes, many small ones"], correct: 2, reward: 10 },
        { q: "Mercury's surface is heavily...?", a: ["Forested", "Oceanic", "Cratered", "Volcanic"], correct: 2, reward: 10 },
        { q: "A year on Mercury (one orbit) is about how many Earth days?", a: ["365", "88", "225", "59"], correct: 1, reward: 10 }
    ],
    venus: [
        { q: "Venus is often called Earth's...?", a: ["Twin", "Opposite", "Moon", "Nemesis"], correct: 0, reward: 10 },
        { q: "What makes Venus the hottest planet in the solar system?", a: ["Closeness to Sun", "Thick CO2 atmosphere", "Volcanic activity", "Lack of water"], correct: 1, reward: 10 },
        { q: "The clouds on Venus are primarily made of...?", a: ["Water vapor", "Methane", "Sulfuric acid", "Ammonia"], correct: 2, reward: 10 },
        { q: "Venus rotates in which direction compared to most planets?", a: ["Faster", "Slower", "Retrograde (backwards)", "Sideways"], correct: 2, reward: 10 },
        { q: "Has Venus ever been landed on by spacecraft?", a: ["No, it's too hot", "Yes, by US rovers", "Yes, by Soviet Venera probes", "Only orbiters"], correct: 2, reward: 10 }
    ],
    mars: [
        { q: "Mars is known as the...?", a: ["Blue Planet", "Gas Giant", "Red Planet", "Ice World"], correct: 2, reward: 10 },
        { q: "What is the name of the largest volcano in the solar system, located on Mars?", a: ["Mount Everest", "Mauna Kea", "Olympus Mons", "Valles Marineris"], correct: 2, reward: 10 },
        { q: "How many moons does Mars have?", a: ["0", "1", "2", "4"], correct: 2, reward: 10 },
        { q: "The Martian atmosphere is mostly composed of...?", a: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, reward: 10 },
        { q: "Evidence suggests Mars once had liquid...?", a: ["Lava flows", "Water on its surface", "Oil reserves", "Ammonia oceans"], correct: 1, reward: 10 }
    ],
    jupiter: [
        { q: "Jupiter is the ____ planet in the solar system.", a: ["Hottest", "Coldest", "Smallest", "Largest"], correct: 3, reward: 15 },
        { q: "What is the Great Red Spot on Jupiter?", a: ["A large volcano", "A giant, long-lived storm", "A continent-sized island", "An impact crater"], correct: 1, reward: 15 },
        { q: "Which of these is NOT one of Jupiter's Galilean moons?", a: ["Io", "Europa", "Titan", "Ganymede"], correct: 2, reward: 15 },
        { q: "Jupiter is primarily composed of which two elements?", a: ["Iron and Nickel", "Oxygen and Nitrogen", "Hydrogen and Helium", "Carbon and Silicon"], correct: 2, reward: 15 },
        { q: "Does Jupiter have rings?", a: ["No", "Yes, faint ones", "Yes, as bright as Saturn's", "Only a dust cloud"], correct: 1, reward: 15 }
    ],
    saturn: [
        { q: "Saturn is most famous for its prominent...?", a: ["Great Dark Spot", "Volcanoes", "Ring system", "Blue color"], correct: 2, reward: 15 },
        { q: "What are Saturn's rings primarily made of?", a: ["Gas and dust", "Solid rock", "Ice particles and rock debris", "Liquid methane"], correct: 2, reward: 15 },
        { q: "Which large moon of Saturn has a thick nitrogen atmosphere?", a: ["Europa", "Titan", "Enceladus", "Rhea"], correct: 1, reward: 15 },
        { q: "Saturn's density is so low that it could theoretically...?", a: ["Ignite like a star", "Float in water", "Create a black hole", "Repel gravity"], correct: 1, reward: 15 },
        { q: "The hexagonal storm feature is found at Saturn's...?", a: ["Equator", "South Pole", "North Pole", "Great Red Spot"], correct: 2, reward: 15 }
    ],
    uranus: [
        { q: "Uranus is classified as an...?", a: ["Gas Giant", "Terrestrial Planet", "Ice Giant", "Dwarf Planet"], correct: 2, reward: 20 },
        { q: "What is unique about Uranus's rotational axis?", a: ["It's perfectly upright", "It wobbles significantly", "It's tilted almost 98 degrees", "It rotates backwards"], correct: 2, reward: 20 },
        { q: "The blue-green color of Uranus comes from ____ in its atmosphere.", a: ["Water vapor", "Ammonia", "Methane", "Sulfur dioxide"], correct: 2, reward: 20 },
        { q: "Does Uranus have rings?", a: ["No", "Yes, dark and faint ones", "Yes, bright icy ones", "Only one large ring"], correct: 1, reward: 20 },
        { q: "Uranus was the first planet discovered using a...?", a: ["Naked eye", "Telescope", "Space probe", "Radio signal"], correct: 1, reward: 20 }
    ],
    neptune: [
        { q: "Neptune is the ____ planet from the Sun.", a: ["Seventh", "Eighth", "Ninth", "Sixth"], correct: 1, reward: 20 },
        { q: "Neptune is known for having the ____ winds in the solar system.", a: ["Slowest", "Hottest", "Strongest", "Most predictable"], correct: 2, reward: 20 },
        { q: "Like Uranus, Neptune's blue color is primarily due to...?", a: ["Oceans of water", "Nitrogen gas", "Methane gas", "Ammonia ice"], correct: 2, reward: 20 },
        { q: "What was the name of the large storm system observed on Neptune by Voyager 2?", a: ["Great Red Spot", "Great Dark Spot", "Eye of Neptune", "Neptune's Hexagon"], correct: 1, reward: 20 },
        { q: "Which large moon of Neptune orbits in a retrograde direction?", a: ["Titan", "Ganymede", "Triton", "Nereid"], correct: 2, reward: 20 }
    ]
};

const FUEL_COST_PER_UNIT = 2;
const REPAIR_COST_PER_HP = 5;
const BASE_TRAVEL_TIME_MS = 5000; // Base time for a standard distance
const MAP_SCALE_FACTOR = 0.64; // Scale down map to fit

// --- DOM Element Variables (will be assigned in setupEventListeners) ---
let earthView, mapView, planetView, travelView;
let creditsDisplay, fuelDisplay, hpDisplay, locationDisplay, rocketDisplay;
let buyRocketSection, earthServicesSection, starMapCanvas, planetInteractionArea; // Renamed from planetInteractionSection
let messageLog;
let quizSection, quizQuestion, quizAnswers, quizResult, nextQuizQuestionButton, finishQuizButton, stopQuizButton;
let gatherMinigameSection, gatherCanvas, resourceTarget, exitGatherButton;
let marketSection, marketContent, marketTotalValue, marketSellAllButton, exitMarketButton;
let planetFactsSection, planetFactDisplay; // Added for planet facts
let instructionsModal;
let mapCtx;
let animationFrameId = null; // For map animation control
let renderedPlanetPositions = {}; // Store last rendered screen positions
let hoveredPlanetId = null; // Store ID of planet currently hovered over

// --- Mini-game State ---
let gatherGame = {
    active: false,
    ctx: null,
    canvas: null,
    player: { x: 50, y: 50, size: 10, speed: 2 },
    resources: [], // { x, y, size, id, collected }
    keys: {},
    animationFrameId: null,
    collectedCount: 0,
    targetResourceId: null
};

// --- Initialization Function ---
function initGame() {
    console.log("Initializing game...");

    // Initialize Game Data (before UI setup)
    gameState.rockets = ROCKETS;
    gameState.planets = JSON.parse(JSON.stringify(PLANETS)); // Deep copy
    gameState.quizzes = QUIZZES;
    gameState.resources = RESOURCES;
    // Initialize quiz progress
    for (const planetId in gameState.planets) {
        if (!gameState.planets[planetId].isHub && gameState.planets[planetId].quizId) {
            gameState.player.quizProgress[planetId] = { completed: false, currentQ: 0, score: 0 };
        }
    }

    // Setup UI elements and event listeners
    if (!setupEventListeners()) {
        console.error("Failed to set up event listeners. Aborting initialization.");
        logMessage("Error: Could not initialize game interface. Please refresh.");
        return; // Stop if essential elements are missing
    }

    // Initial Render
    switchView("earth");
    logMessage("Welcome to Exploration Camp! Purchase a rocket to begin.");
    console.log("Game Initialized Successfully.");
}

// --- Start Game Initialization ---
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
} else {
    console.log("DOM already loaded, initializing game directly.");
    initGame();
}

// --- Event Listeners Setup ---
// Returns true if successful, false if essential elements are missing
function setupEventListeners() {
    console.log("Setting up event listeners...");
    let essentialElementsFound = true;

    // Get view elements
    earthView = document.getElementById("earth-view");
    mapView = document.getElementById("map-view");
    planetView = document.getElementById("planet-view");
    travelView = document.getElementById("travel-view");

    // Get UI elements
    creditsDisplay = document.getElementById("credits-display");
    fuelDisplay = document.getElementById("fuel-display");
    hpDisplay = document.getElementById("hp-display");
    locationDisplay = document.getElementById("location-display");
    rocketDisplay = document.getElementById("rocket-display");
    buyRocketSection = document.getElementById("buy-rocket-section");
    earthServicesSection = document.getElementById("earth-services-section");
    starMapCanvas = document.getElementById("star-map-canvas");
    planetInteractionArea = document.getElementById("planet-interaction-area"); // Corrected ID
    messageLog = document.getElementById("message-log");

    // Integrated Section Elements
    gatherMinigameSection = document.getElementById("gather-minigame-section");
    gatherCanvas = document.getElementById("gather-canvas");
    resourceTarget = document.getElementById("resource-target");
    exitGatherButton = document.getElementById("exit-gather-button");

    quizSection = document.getElementById("quiz-section");
    quizQuestion = document.getElementById("quiz-question");
    quizAnswers = document.getElementById("quiz-answers");
    quizResult = document.getElementById("quiz-result");
    nextQuizQuestionButton = document.getElementById("next-quiz-question-button");
    finishQuizButton = document.getElementById("finish-quiz-button");
    stopQuizButton = document.getElementById("stop-quiz-button");

    marketSection = document.getElementById("market-section");
    marketContent = document.getElementById("market-content");
    marketTotalValue = document.getElementById("market-total-value");
    marketSellAllButton = document.getElementById("market-sell-all-button");
    exitMarketButton = document.getElementById("exit-market-button");

    planetFactsSection = document.getElementById("planet-facts-section"); // Get facts section
    planetFactDisplay = document.getElementById("planet-fact-display"); // Get facts display p

    // Instructions Modal Elements
    instructionsModal = document.getElementById("instructions-modal");
    const restartGameButton = document.getElementById("restart-game-button");

    // Check if essential elements exist
    const essentialIds = [
        // Views
        "earth-view", "map-view", "planet-view", "travel-view",
        // Status Bar
        "credits-display", "fuel-display", "hp-display", "location-display", "rocket-display", "rocket-image", "show-instructions-button", "restart-game-button",
        // Main Container
        "main-container", "game-area", "message-log-container", "message-log",
        // Earth View
        "buy-rocket-section", "earth-services-section", "buy-rocket-buttons", "fuel-cost-unit", "buy-fuel-amount", "buy-fuel-button", "repair-cost-unit", "repair-hp-amount", "repair-hp-button", "view-map-button",
        // Map View
        "star-map-canvas", "back-to-hub-button",
        // Planet View
        "planet-name", "planet-description", "planet-activities", "planet-gather-button", "planet-sell-button", "planet-quiz-button", "planet-leave-button",
        "planet-interaction-area", "inventory-section", "inventory-list",
        // Integrated Sections
        "gather-minigame-section", "gather-canvas", "resource-target", "exit-gather-button",
        "planet-facts-section", "planet-fact-display", // Added facts elements
        "quiz-section", "quiz-question", "quiz-answers", "quiz-result", "next-quiz-question-button", "finish-quiz-button", "stop-quiz-button",
        "market-section", "market-content", "market-total-value", "market-sell-all-button", "exit-market-button",
        // Travel View
        "travel-destination", "travel-progress-bar", "travel-progress-text", "travel-fact",
        // Instructions Modal
        "instructions-modal", "instructions-close-button", "instructions-content",
        // Mobile Warning
        "mobile-warning" // Check for the new warning div
    ];

    for (const id of essentialIds) {
        if (!document.getElementById(id)) {
            console.error(`Essential UI element missing: #${id}`);
            logMessage(`Error: Interface element #${id} not found. Game may not function correctly.`);
            essentialElementsFound = false;
        }
    }

    // --- Attach Event Listeners ---
    // Instructions
    const instructionsButton = document.getElementById("show-instructions-button");
    const instructionsCloseButton = document.getElementById("instructions-close-button");
    if (instructionsButton) instructionsButton.addEventListener("click", showInstructionsModal);
    if (instructionsCloseButton) instructionsCloseButton.addEventListener("click", closeInstructionsModal);
    if (instructionsModal) {
        instructionsModal.addEventListener("click", (event) => {
            if (event.target === instructionsModal) { // Click outside content
                closeInstructionsModal();
            }
        });
    }

    // Restart Game Button
    if (restartGameButton) restartGameButton.addEventListener("click", restartGame);

    // Earth View Buttons
    const viewMapButton = document.getElementById("view-map-button");
    const buyFuelButton = document.getElementById("buy-fuel-button");
    const repairHpButton = document.getElementById("repair-hp-button");
    if (viewMapButton) viewMapButton.addEventListener("click", () => switchView("map"));
    if (buyFuelButton) buyFuelButton.addEventListener("click", handleBuyFuel);
    if (repairHpButton) repairHpButton.addEventListener("click", handleRepairHp);

    // Map View Buttons & Canvas
    const backToHubButton = document.getElementById("back-to-hub-button");
    if (backToHubButton) backToHubButton.addEventListener("click", () => switchView(gameState.player.locationId === 'earth' ? 'earth' : 'planet'));
    if (starMapCanvas) {
        mapCtx = starMapCanvas.getContext("2d");
        starMapCanvas.addEventListener("click", handleMapClick);
        starMapCanvas.addEventListener("mousemove", handleMapMouseMove); // Add mouse move listener
    }

    // Planet View Buttons
    const planetGatherButton = document.getElementById("planet-gather-button");
    const planetSellButton = document.getElementById("planet-sell-button");
    const planetQuizButton = document.getElementById("planet-quiz-button");
    const planetLeaveButton = document.getElementById("planet-leave-button");
    if (planetGatherButton) planetGatherButton.addEventListener("click", startGatherMinigame);
    if (planetSellButton) planetSellButton.addEventListener("click", showMarket);
    if (planetQuizButton) planetQuizButton.addEventListener("click", startQuiz);
    if (planetLeaveButton) planetLeaveButton.addEventListener("click", () => switchView("map"));

    // Integrated Interaction Buttons
    if (exitGatherButton) exitGatherButton.addEventListener("click", stopGatherMinigame);
    if (nextQuizQuestionButton) nextQuizQuestionButton.addEventListener("click", nextQuizQuestion);
    if (finishQuizButton) finishQuizButton.addEventListener("click", finishQuiz);
    if (stopQuizButton) stopQuizButton.addEventListener("click", handleStopQuiz);
    if (exitMarketButton) exitMarketButton.addEventListener("click", hideMarket);
    if (marketSellAllButton) marketSellAllButton.addEventListener("click", handleSellAll);

    // Initial UI Population
    populateRocketButtons();
    updateStatusBar();

    console.log("Event listeners setup complete.");
    return essentialElementsFound;
}

// --- View Switching ---
function switchView(viewId) {
    console.log(`Switching view to: ${viewId}`);
    // Stop existing animations/intervals if necessary
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (gatherGame.animationFrameId) {
        cancelAnimationFrame(gatherGame.animationFrameId);
        gatherGame.animationFrameId = null;
        document.removeEventListener("keydown", handleGatherKeyDown);
        document.removeEventListener("keyup", handleGatherKeyUp);
    }
    // Stop travel interval if switching away from travel view
    if (gameState.currentView === 'travel' && viewId !== 'travel') {
        // Assuming travel progress is handled by an interval/timeout, clear it here
        // (Need to implement travel progress logic first)
    }

    // Hide all views
    earthView.style.display = "none";
    mapView.style.display = "none";
    planetView.style.display = "none";
    travelView.style.display = "none";

    // Show the target view and update state
    gameState.currentView = viewId;
    switch (viewId) {
        case "earth":
            earthView.style.display = "block";
            renderEarthView();
            break;
        case "map":
            mapView.style.display = "block";
            renderMapView();
            break;
        case "planet":
            planetView.style.display = "block";
            renderPlanetView();
            break;
        case "travel":
            travelView.style.display = "block";
            renderTravelView();
            break;
        default:
            console.error("Unknown view ID:", viewId);
            earthView.style.display = "block"; // Default to earth view
            gameState.currentView = "earth";
            renderEarthView();
    }
    updateStatusBar(); // Update status bar after switching view
}

// --- Rendering Functions ---
function updateStatusBar() {
    if (!creditsDisplay || !fuelDisplay || !hpDisplay || !locationDisplay || !rocketDisplay) {
        console.warn("Status bar elements not fully loaded yet.");
        return;
    }
    const player = gameState.player;
    creditsDisplay.textContent = player.credits;
    locationDisplay.textContent = gameState.planets[player.locationId]?.name || "Unknown";

    const rocketImage = document.getElementById("rocket-image");
    if (player.rocket) {
        fuelDisplay.textContent = `${player.rocket.fuel} / ${player.rocket.maxFuel}`;
        hpDisplay.textContent = `${player.rocket.currentHp} / ${player.rocket.maxHp}`;
        rocketDisplay.textContent = gameState.rockets[player.rocket.typeId]?.name || "Unknown Rocket";
        // Update rocket image
        if (rocketImage) {
            rocketImage.src = `images/rocket_${player.rocket.typeId}.png`; // Assuming images named like this
            rocketImage.style.display = "inline-block";
        } else {
            console.warn("Rocket image element not found");
        }
    } else {
        fuelDisplay.textContent = "N/A";
        hpDisplay.textContent = "N/A";
        rocketDisplay.textContent = "None";
        if (rocketImage) {
            rocketImage.style.display = "none";
            rocketImage.src = "";
        }
    }
}

function renderEarthView() {
    console.log("Rendering Earth view");
    // Show/hide rocket purchase vs services based on whether player has a rocket
    if (gameState.player.rocket) {
        buyRocketSection.style.display = "none";
        earthServicesSection.style.display = "block";
        // Update fuel/repair costs display (if dynamic)
        document.getElementById('fuel-cost-unit').textContent = FUEL_COST_PER_UNIT;
        document.getElementById('repair-cost-unit').textContent = REPAIR_COST_PER_HP;
    } else {
        buyRocketSection.style.display = "block";
        earthServicesSection.style.display = "none";
        populateRocketButtons(); // Ensure buttons are shown if no rocket
    }
    updateStatusBar();
}

function populateRocketButtons() {
    const buttonsContainer = document.getElementById("buy-rocket-buttons");
    if (!buttonsContainer) return;
    buttonsContainer.innerHTML = ""; // Clear existing buttons

    for (const typeId in gameState.rockets) {
        const rocket = gameState.rockets[typeId];
        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("rocket-option");

        const img = document.createElement("img");
        img.src = `images/rocket_${typeId}.png`; // Assuming image naming convention
        img.alt = rocket.name;
        img.style.width = "50px"; // Adjust size as needed
        img.style.height = "auto";
        img.style.marginRight = "10px";

        const details = document.createElement("span");
        details.innerHTML = `<strong>${rocket.name}</strong><br>
                           Cost: ${rocket.cost} Cr | HP: ${rocket.maxHp} | Fuel: ${rocket.maxFuel} | Eff: ${rocket.efficiency}`;

        const buyButton = document.createElement("button");
        buyButton.textContent = "Buy";
        buyButton.onclick = () => handleBuyRocket(typeId);
        buyButton.style.marginLeft = "15px";

        buttonDiv.appendChild(img);
        buttonDiv.appendChild(details);
        buttonDiv.appendChild(buyButton);
        buttonsContainer.appendChild(buttonDiv);
    }
}

function renderMapView() {
    console.log("Rendering Map view");
    if (!mapCtx || !starMapCanvas) {
        console.error("Map canvas or context not available!");
        return;
    }

    // Ensure canvas internal size matches display size for accurate coords
    starMapCanvas.width = starMapCanvas.clientWidth;
    starMapCanvas.height = starMapCanvas.clientHeight;

    const centerX = starMapCanvas.width / 2;
    const centerY = starMapCanvas.height / 2;

    // Clear previous animation frame if any
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    function drawMap() {
        // Clear canvas
        mapCtx.fillStyle = "#000020"; // Dark space blue
        mapCtx.fillRect(0, 0, starMapCanvas.width, starMapCanvas.height);

        // Draw Sun
        mapCtx.fillStyle = "#FFD700"; // Gold
        mapCtx.beginPath();
        mapCtx.arc(centerX, centerY, 15 * MAP_SCALE_FACTOR, 0, Math.PI * 2);
        mapCtx.fill();

        // Draw Planets, Orbits, and Names
        renderedPlanetPositions = {}; // Reset rendered positions for this frame
        mapCtx.font = `${10 * MAP_SCALE_FACTOR}px Arial`; // Set font size scaled
        mapCtx.fillStyle = "#FFFFFF"; // White text
        mapCtx.textAlign = "center";
        mapCtx.textBaseline = "top";

        for (const id in gameState.planets) {
            if (id === "earth" && !gameState.planets[id].isHub) continue; // Skip non-hub Earth if needed
            const planet = gameState.planets[id];
            const scaledRadius = planet.orbitalRadius * MAP_SCALE_FACTOR;
            const scaledPlanetRadius = planet.radius * MAP_SCALE_FACTOR;

            // Draw orbit path
            mapCtx.strokeStyle = "#FFFFFF20"; // Faint white
            mapCtx.beginPath();
            mapCtx.arc(centerX, centerY, scaledRadius, 0, Math.PI * 2);
            mapCtx.stroke();

            // Calculate planet position
            const angle = planet.angle;
            const planetX = centerX + scaledRadius * Math.cos(angle);
            const planetY = centerY + scaledRadius * Math.sin(angle);

            // Store rendered position for click detection
            renderedPlanetPositions[id] = { x: planetX, y: planetY };

            // Draw planet
            mapCtx.fillStyle = planet.color;
            mapCtx.beginPath();
            mapCtx.arc(planetX, planetY, scaledPlanetRadius, 0, Math.PI * 2);
            mapCtx.fill();

            // Draw planet name
            mapCtx.fillStyle = "#FFFFFF"; // Ensure text color is white
            mapCtx.fillText(planet.name, planetX, planetY + scaledPlanetRadius + 2); // Position name below planet

            // Highlight if hovered
            if (id === hoveredPlanetId) {
                mapCtx.strokeStyle = "#FFFF00"; // Yellow highlight
                mapCtx.lineWidth = 2;
                mapCtx.stroke(); // Stroke the planet circle
                mapCtx.lineWidth = 1; // Reset line width
            }

            // Update angle for next frame (animation)
            planet.angle += planet.speed * 0.1; // Adjust multiplier for speed
        }

        // Request next frame
        animationFrameId = requestAnimationFrame(drawMap);
    }

    // Start animation loop
    drawMap();
    updateStatusBar();
}


function renderPlanetView() {
    console.log("Rendering Planet view for:", gameState.player.locationId);
    const planetId = gameState.player.locationId;
    const planet = gameState.planets[planetId];
    if (!planet || planet.isHub) {
        console.error("Cannot render planet view for Earth or invalid ID:", planetId);
        switchView("earth"); // Go back to Earth if trying to view it as a planet
        return;
    }

    document.getElementById("planet-name").textContent = planet.name;
    document.getElementById("planet-description").textContent = planet.description;

    // Show/Hide activity buttons based on planet data and game state
    document.getElementById("planet-gather-button").style.display = planet.resources.length > 0 ? "inline-block" : "none";
    document.getElementById("planet-sell-button").style.display = Object.keys(gameState.player.inventory).length > 0 ? "inline-block" : "none"; // Show only if inventory has items
    document.getElementById("planet-quiz-button").style.display = planet.quizId && !gameState.player.quizProgress[planetId]?.completed ? "inline-block" : "none";

    // Hide all interaction areas initially
    gatherMinigameSection.style.display = "none";
    quizSection.style.display = "none";
    marketSection.style.display = "none";
    planetFactsSection.style.display = "none"; // Hide facts section initially
    planetInteractionArea.style.display = "block"; // Show the main container

    // Show main activity buttons
    document.getElementById("planet-activities").style.display = "block";

    // Display Planet Fact by default
    const facts = PLANET_FACTS[planetId];
    if (facts && facts.length > 0) {
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        planetFactDisplay.textContent = randomFact;
        planetFactsSection.style.display = "block"; // Show the facts section
    } else {
        planetFactsSection.style.display = "none"; // Hide if no facts available
    }

    renderInventory();
    updateStatusBar();
}

function renderInventory() {
    const inventoryList = document.getElementById("inventory-list");
    if (!inventoryList) return;
    inventoryList.innerHTML = ""; // Clear list

    if (Object.keys(gameState.player.inventory).length === 0) {
        inventoryList.innerHTML = "<li>Empty</li>";
        return;
    }

    for (const resourceId in gameState.player.inventory) {
        const quantity = gameState.player.inventory[resourceId];
        const resource = gameState.resources[resourceId];
        if (resource && quantity > 0) {
            const li = document.createElement("li");
            li.textContent = `${resource.icon || ''} ${resource.name}: ${quantity}`;
            inventoryList.appendChild(li);
        }
    }
}

function renderTravelView() {
    console.log("Rendering Travel view to:", gameState.travel.destinationId);
    const destinationId = gameState.travel.destinationId;
    const destination = gameState.planets[destinationId];
    if (!destination) {
        console.error("Invalid travel destination:", destinationId);
        switchView(gameState.player.locationId === 'earth' ? 'earth' : 'planet'); // Go back
        return;
    }

    document.getElementById("travel-destination").textContent = destination.name;
    document.getElementById("travel-fact").textContent = getRandomTravelFact();

    // Reset progress bar
    const progressBar = document.getElementById("travel-progress-bar");
    const progressText = document.getElementById("travel-progress-text");
    progressBar.value = 0;
    progressText.textContent = "0%";

    // Simulate travel progress
    let progress = 0;
    const intervalTime = gameState.travel.duration / 100; // Update progress every 1%
    const travelInterval = setInterval(() => {
        progress++;
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(travelInterval);
            // Arrive at destination
            gameState.player.locationId = destinationId;
            // Add to visited list if not already there
            if (!gameState.player.visitedPlanets.includes(destinationId)) {
                gameState.player.visitedPlanets.push(destinationId);
            }
            logMessage(`Arrived at ${destination.name}.`);
            switchView(destinationId === 'earth' ? 'earth' : 'planet');
            checkWinCondition(); // Check if player won
        }
    }, intervalTime);

    updateStatusBar();
}

// --- Action Handlers ---
function handleBuyRocket(typeId) {
    const rocket = gameState.rockets[typeId];
    if (!rocket) {
        logMessage("Error: Invalid rocket type.");
        return;
    }
    if (gameState.player.credits >= rocket.cost) {
        gameState.player.credits -= rocket.cost;
        gameState.player.rocket = {
            typeId: typeId,
            currentHp: rocket.maxHp,
            maxHp: rocket.maxHp,
            fuel: 0, // Start with empty tank
            maxFuel: rocket.maxFuel,
            efficiency: rocket.efficiency
        };
        logMessage(`Purchased ${rocket.name} for ${rocket.cost} Credits.`);
        renderEarthView(); // Re-render to show services
    } else {
        logMessage(`Not enough credits to buy ${rocket.name}. Need ${rocket.cost} Cr.`);
    }
}

function handleBuyFuel() {
    const amountInput = document.getElementById("buy-fuel-amount");
    const amount = parseInt(amountInput.value);
    const rocket = gameState.player.rocket;

    if (!rocket) {
        logMessage("Error: You need a rocket to buy fuel.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        logMessage("Please enter a valid amount of fuel to buy.");
        return;
    }

    const cost = amount * FUEL_COST_PER_UNIT;
    const spaceAvailable = rocket.maxFuel - rocket.fuel;
    const amountToBuy = Math.min(amount, spaceAvailable);
    const finalCost = amountToBuy * FUEL_COST_PER_UNIT;

    if (amountToBuy <= 0) {
        logMessage("Fuel tank is already full!");
        return;
    }

    if (gameState.player.credits >= finalCost) {
        gameState.player.credits -= finalCost;
        rocket.fuel += amountToBuy;
        logMessage(`Bought ${amountToBuy} units of fuel for ${finalCost} Credits.`);
        updateStatusBar();
        amountInput.value = 10; // Reset input
    } else {
        logMessage(`Not enough credits. Need ${finalCost} Cr for ${amountToBuy} fuel.`);
    }
}

function handleRepairHp() {
    const amountInput = document.getElementById("repair-hp-amount");
    const amount = parseInt(amountInput.value);
    const rocket = gameState.player.rocket;

    if (!rocket) {
        logMessage("Error: You need a rocket to repair.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        logMessage("Please enter a valid amount of HP to repair.");
        return;
    }

    const damage = rocket.maxHp - rocket.currentHp;
    const amountToRepair = Math.min(amount, damage);
    const finalCost = amountToRepair * REPAIR_COST_PER_HP;

    if (amountToRepair <= 0) {
        logMessage("Rocket is already at full health!");
        return;
    }

    if (gameState.player.credits >= finalCost) {
        gameState.player.credits -= finalCost;
        rocket.currentHp += amountToRepair;
        logMessage(`Repaired ${amountToRepair} HP for ${finalCost} Credits.`);
        updateStatusBar();
        amountInput.value = 10; // Reset input
    } else {
        logMessage(`Not enough credits. Need ${finalCost} Cr to repair ${amountToRepair} HP.`);
    }
}

function handleMapClick(event) {
    if (!starMapCanvas) return;
    const rect = starMapCanvas.getBoundingClientRect();
    // Use clientX/Y for coordinates relative to viewport
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    console.log(`Map click detected at: (${clickX.toFixed(2)}, ${clickY.toFixed(2)})`);

    let clickedPlanetId = null;
    let minDistSq = Infinity;

    // Find the closest planet to the click using RENDERED positions
    for (const id in renderedPlanetPositions) {
        const planet = gameState.planets[id]; // Need radius
        const renderedPos = renderedPlanetPositions[id];
        if (!renderedPos) continue;

        const dx = clickX - renderedPos.x;
        const dy = clickY - renderedPos.y;
        const distSq = dx * dx + dy * dy;
        // Use scaled radius for click detection
        const targetRadiusSq = (planet.radius * MAP_SCALE_FACTOR + 5) * (planet.radius * MAP_SCALE_FACTOR + 5); // Add buffer

        console.log(`Checking ${id}: DistSq=${distSq.toFixed(2)}, TargetRadiusSq=${targetRadiusSq.toFixed(2)}`);

        // Check if click is within planet radius + buffer and closer than previous
        if (distSq <= targetRadiusSq && distSq < minDistSq) {
            clickedPlanetId = id;
            minDistSq = distSq;
        }
    }

    if (clickedPlanetId) {
        console.log(`Clicked on planet: ${clickedPlanetId}`);
        initiateTravel(clickedPlanetId);
    } else {
        console.log("Clicked on empty space.");
    }
}

function initiateTravel(destinationId) {
    const player = gameState.player;
    const currentLocId = player.locationId;
    const destination = gameState.planets[destinationId];

    if (!player.rocket) {
        logMessage("You need a rocket to travel!");
        return;
    }
    if (currentLocId === destinationId) {
        logMessage(`You are already at ${destination.name}.`);
        return;
    }
    if (!destination) {
        logMessage("Error: Invalid destination.");
        return;
    }

    // Calculate distance (simplified: difference in orbital radius)
    const currentOrbit = gameState.planets[currentLocId]?.orbitalRadius || 0; // 0 if at Earth (center)
    const destOrbit = destination.orbitalRadius;
    // More realistic distance would involve angles, but let's keep it simple
    const distance = Math.abs(destOrbit - currentOrbit); // Simple distance metric

    // Calculate fuel cost
    const fuelCost = Math.round(distance * player.rocket.efficiency * 0.1); // Adjust multiplier as needed

    logMessage(`Travel to ${destination.name}: Distance approx ${distance.toFixed(0)} units, Fuel Cost: ${fuelCost}`);

    if (player.rocket.fuel >= fuelCost) {
        if (confirm(`Travel to ${destination.name}? Fuel cost: ${fuelCost}. Proceed?`)) {
            player.rocket.fuel -= fuelCost;
            gameState.travel.destinationId = destinationId;
            // Calculate travel time based on distance (adjust multiplier as needed)
            gameState.travel.duration = BASE_TRAVEL_TIME_MS + (distance * 50);
            gameState.travel.startTime = Date.now();
            logMessage(`Initiating travel to ${destination.name}...`);
            switchView("travel");
        }
    } else {
        logMessage(`Not enough fuel to travel to ${destination.name}. Need ${fuelCost}, have ${player.rocket.fuel}.`);
    }
}

// --- Quiz Functions ---
function startQuiz() {
    const planetId = gameState.player.locationId;
    const quizId = gameState.planets[planetId]?.quizId;
    const quizProgress = gameState.player.quizProgress[planetId];

    if (!quizId || !gameState.quizzes[quizId]) {
        logMessage("No quiz available for this location.");
        return;
    }
    if (quizProgress?.completed) {
        logMessage("You have already completed the quiz for this planet.");
        return;
    }

    // Reset progress if starting fresh
    if (!quizProgress || quizProgress.currentQ === 0) {
         gameState.player.quizProgress[planetId] = { completed: false, currentQ: 0, score: 0 };
    }

    logMessage(`Starting quiz for ${gameState.planets[planetId].name}...`);
    document.getElementById("planet-activities").style.display = "none";
    planetInteractionArea.style.display = "block";
    quizSection.style.display = "block";
    marketSection.style.display = "none";
    gatherMinigameSection.style.display = "none";
    planetFactsSection.style.display = "none"; // Hide facts during quiz
    stopQuizButton.style.display = "inline-block"; // Show stop button

    loadQuizQuestion();
}

function loadQuizQuestion() {
    const planetId = gameState.player.locationId;
    const quizProgress = gameState.player.quizProgress[planetId];
    const quizData = gameState.quizzes[gameState.planets[planetId].quizId];
    const questionIndex = quizProgress.currentQ;

    if (questionIndex >= quizData.length) {
        finishQuiz(); // Should not happen if finish button is used, but as fallback
        return;
    }

    const question = quizData[questionIndex];
    quizQuestion.textContent = question.q;
    quizAnswers.innerHTML = ""; // Clear previous answers
    quizResult.textContent = ""; // Clear previous result

    question.a.forEach((answer, index) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = answer;
        button.onclick = () => handleQuizAnswer(index);
        li.appendChild(button);
        quizAnswers.appendChild(li);
    });

    nextQuizQuestionButton.style.display = "none";
    finishQuizButton.style.display = "none";
}

function handleQuizAnswer(selectedIndex) {
    const planetId = gameState.player.locationId;
    const quizProgress = gameState.player.quizProgress[planetId];
    const quizData = gameState.quizzes[gameState.planets[planetId].quizId];
    const questionIndex = quizProgress.currentQ;
    const question = quizData[questionIndex];

    // Disable answer buttons
    const answerButtons = quizAnswers.querySelectorAll("button");
    answerButtons.forEach(button => button.disabled = true);

    if (selectedIndex === question.correct) {
        quizResult.textContent = `Correct! +${question.reward} Credits.`;
        quizResult.style.color = "green";
        gameState.player.credits += question.reward;
        quizProgress.score += question.reward; // Track score as credits earned
        logMessage(`Answered correctly! +${question.reward} Credits.`);
    } else {
        quizResult.textContent = `Incorrect. The correct answer was: ${question.a[question.correct]}`;
        quizResult.style.color = "red";
        logMessage(`Answered incorrectly.`);
    }

    quizProgress.currentQ++;
    updateStatusBar();

    // Show next/finish button
    if (quizProgress.currentQ >= quizData.length) {
        finishQuizButton.style.display = "inline-block";
        stopQuizButton.style.display = "none"; // Hide stop button on last question
    } else {
        nextQuizQuestionButton.style.display = "inline-block";
    }
}

function nextQuizQuestion() {
    loadQuizQuestion();
}

function finishQuiz() {
    const planetId = gameState.player.locationId;
    const quizProgress = gameState.player.quizProgress[planetId];

    logMessage(`Quiz finished for ${gameState.planets[planetId].name}. Final score: ${quizProgress.score} credits earned.`);
    quizProgress.completed = true;

    // Hide quiz UI and show activities/facts again
    quizSection.style.display = "none";
    document.getElementById("planet-activities").style.display = "block";
    renderPlanetView(); // Re-render planet view to update button states and show facts
}

// --- Market Functions ---
function showMarket() {
    logMessage("Opening resource market...");
    document.getElementById("planet-activities").style.display = "none";
    planetInteractionArea.style.display = "block";
    marketSection.style.display = "block";
    quizSection.style.display = "none";
    gatherMinigameSection.style.display = "none";
    planetFactsSection.style.display = "none"; // Hide facts during market interaction
    renderMarket();
}

function hideMarket() {
    marketSection.style.display = "none";
    document.getElementById("planet-activities").style.display = "block";
    renderPlanetView(); // Update sell button visibility and show facts
}

function renderMarket() {
    const marketDiv = document.getElementById("market-content");
    marketDiv.innerHTML = ""; // Clear previous content
    let totalValue = 0;
    let hasItems = false;

    const table = document.createElement('table');
    table.innerHTML = '<tr><th>Resource</th><th>Quantity</th><th>Value/Unit</th><th>Total Value</th></tr>';

    for (const resourceId in gameState.player.inventory) {
        const quantity = gameState.player.inventory[resourceId];
        const resource = gameState.resources[resourceId];
        if (resource && quantity > 0) {
            hasItems = true;
            const value = resource.value * quantity;
            totalValue += value;
            const row = table.insertRow();
            row.innerHTML = `<td>${resource.icon || ''} ${resource.name}</td><td>${quantity}</td><td>${resource.value} Cr</td><td>${value} Cr</td>`;
        }
    }

    if (hasItems) {
        marketDiv.appendChild(table);
        marketSellAllButton.style.display = "inline-block";
    } else {
        marketDiv.innerHTML = "<p>Your inventory is empty.</p>";
        marketSellAllButton.style.display = "none";
    }

    marketTotalValue.textContent = totalValue;
}

function handleSellAll() {
    let totalValue = 0;
    let itemsSold = [];

    for (const resourceId in gameState.player.inventory) {
        const quantity = gameState.player.inventory[resourceId];
        const resource = gameState.resources[resourceId];
        if (resource && quantity > 0) {
            totalValue += resource.value * quantity;
            itemsSold.push(`${quantity} ${resource.name}`);
        }
    }

    if (totalValue > 0) {
        gameState.player.credits += totalValue;
        gameState.player.inventory = {}; // Clear inventory
        logMessage(`Sold ${itemsSold.join(', ')} for ${totalValue} Credits.`);
        updateStatusBar();
        renderInventory();
        renderMarket(); // Re-render market to show empty state
    } else {
        logMessage("No resources to sell.");
    }
}

// --- Resource Gathering Minigame Functions ---
function startGatherMinigame() {
    const planetId = gameState.player.locationId;
    const planet = gameState.planets[planetId];
    if (!planet || planet.resources.length === 0) {
        logMessage("No resources to gather on this planet.");
        return;
    }

    logMessage(`Starting resource gathering on ${planet.name}...`);
    document.getElementById("planet-activities").style.display = "none";
    planetInteractionArea.style.display = "block";
    gatherMinigameSection.style.display = "block";
    quizSection.style.display = "none";
    marketSection.style.display = "none";
    planetFactsSection.style.display = "none"; // Hide facts during minigame

    gatherGame.canvas = document.getElementById("gather-canvas");
    gatherGame.ctx = gatherGame.canvas.getContext("2d");
    gatherGame.active = true;
    gatherGame.keys = {};
    gatherGame.player.x = gatherGame.canvas.width / 2;
    gatherGame.player.y = gatherGame.canvas.height / 2;
    gatherGame.resources = [];
    gatherGame.collectedCount = 0;
    gatherGame.targetResourceId = planet.resources[Math.floor(Math.random() * planet.resources.length)]; // Pick one resource type for this session

    document.getElementById('resource-target').textContent = gameState.resources[gatherGame.targetResourceId]?.name || 'resources';

    // Spawn resources
    const numResources = 10 + Math.floor(Math.random() * 6); // 10-15 resources
    for (let i = 0; i < numResources; i++) {
        gatherGame.resources.push({
            x: Math.random() * (gatherGame.canvas.width - 20) + 10,
            y: Math.random() * (gatherGame.canvas.height - 20) + 10,
            size: 5 + Math.random() * 5,
            id: gatherGame.targetResourceId,
            collected: false
        });
    }

    // Add keyboard listeners
    document.addEventListener("keydown", handleGatherKeyDown);
    document.addEventListener("keyup", handleGatherKeyUp);

    // Start game loop
    gatherGameLoop();
}

function stopGatherMinigame() {
    if (!gatherGame.active) return;

    logMessage(`Finished gathering. Collected ${gatherGame.collectedCount} ${gameState.resources[gatherGame.targetResourceId]?.name || 'items'}.`);
    gatherGame.active = false;
    if (gatherGame.animationFrameId) {
        cancelAnimationFrame(gatherGame.animationFrameId);
        gatherGame.animationFrameId = null;
    }
    document.removeEventListener("keydown", handleGatherKeyDown);
    document.removeEventListener("keyup", handleGatherKeyUp);

    gatherMinigameSection.style.display = "none";
    document.getElementById("planet-activities").style.display = "block";

    renderInventory();
    renderPlanetView(); // Update sell button visibility and show facts
}

function handleGatherKeyDown(event) {
    gatherGame.keys[event.key] = true;
}

function handleGatherKeyUp(event) {
    gatherGame.keys[event.key] = false;
}

function gatherGameLoop() {
    if (!gatherGame.active) return;

    // Update player position based on keys
    if (gatherGame.keys["ArrowUp"] && gatherGame.player.y > gatherGame.player.size / 2) {
        gatherGame.player.y -= gatherGame.player.speed;
    }
    if (gatherGame.keys["ArrowDown"] && gatherGame.player.y < gatherGame.canvas.height - gatherGame.player.size / 2) {
        gatherGame.player.y += gatherGame.player.speed;
    }
    if (gatherGame.keys["ArrowLeft"] && gatherGame.player.x > gatherGame.player.size / 2) {
        gatherGame.player.x -= gatherGame.player.speed;
    }
    if (gatherGame.keys["ArrowRight"] && gatherGame.player.x < gatherGame.canvas.width - gatherGame.player.size / 2) {
        gatherGame.player.x += gatherGame.player.speed;
    }

    // Clear canvas
    gatherGame.ctx.fillStyle = "#2c3e50"; // Dark background
    gatherGame.ctx.fillRect(0, 0, gatherGame.canvas.width, gatherGame.canvas.height);

    // Draw player (simple square for now)
    gatherGame.ctx.fillStyle = "#3498db"; // Blue
    gatherGame.ctx.fillRect(gatherGame.player.x - gatherGame.player.size / 2,
                          gatherGame.player.y - gatherGame.player.size / 2,
                          gatherGame.player.size, gatherGame.player.size);

    // Draw resources and check for collisions
    let allCollected = true;
    gatherGame.resources.forEach(res => {
        if (!res.collected) {
            allCollected = false;
            const resourceData = gameState.resources[res.id];
            gatherGame.ctx.fillStyle = resourceData?.color || "#f1c40f"; // Yellow default
            gatherGame.ctx.beginPath();
            gatherGame.ctx.arc(res.x, res.y, res.size, 0, Math.PI * 2);
            gatherGame.ctx.fill();

            // Collision detection (simple circle overlap)
            const dx = gatherGame.player.x - res.x;
            const dy = gatherGame.player.y - res.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < (gatherGame.player.size / 2 + res.size)) {
                res.collected = true;
                gatherGame.collectedCount++;
                // Add to inventory
                gameState.player.inventory[res.id] = (gameState.player.inventory[res.id] || 0) + 1;
                console.log(`Collected ${resourceData?.name}! Total: ${gatherGame.collectedCount}`);
            }
        }
    });

    // Check if all resources collected
    if (allCollected) {
        stopGatherMinigame();
        return; // Stop the loop
    }

    // Request next frame
    gatherGame.animationFrameId = requestAnimationFrame(gatherGameLoop);
}

// --- Instructions Modal ---
function showInstructionsModal() {
    console.log("Showing instructions modal"); // Debug log
    if (instructionsModal) {
        instructionsModal.style.display = "block";
    } else {
        console.error("Instructions modal element not found!");
    }
}

function closeInstructionsModal() {
    console.log("Closing instructions modal"); // Debug log
    if (instructionsModal) {
        instructionsModal.style.display = "none";
    } else {
        console.error("Instructions modal element not found!");
    }
}

// --- Utility Functions ---
function logMessage(message) {
    if (!messageLog) return;
    const timestamp = new Date().toLocaleTimeString();
    const newMessage = document.createElement("p");
    newMessage.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
    // Prepend to show newest first
    if (messageLog.firstChild) {
        messageLog.insertBefore(newMessage, messageLog.firstChild);
    } else {
        messageLog.appendChild(newMessage);
    }
    // Optional: Limit log length if needed
}

function getRandomTravelFact() {
    const facts = [
        "Space is completely silent because there is no air or atmosphere.",
        "The hottest planet isn't Mercury, it's Venus, due to its thick atmosphere.",
        "A full NASA spacesuit costs about $12 million.",
        "Neutron stars are so dense that a spoonful would weigh about a billion tons.",
        "There are more trees on Earth than stars in the Milky Way galaxy (estimated).",
        "The sunset on Mars appears blue.",
        "One day on Venus is longer than one year on Venus.",
        "Jupiter's Great Red Spot is a storm that has been raging for hundreds of years.",
        "Uranus rotates on its side.",
        "Neptune has the strongest winds in the Solar System."
    ];
    return facts[Math.floor(Math.random() * facts.length)];
}

function checkWinCondition() {
    // Check if all planets (excluding Earth) have been visited
    const totalPlanets = Object.keys(gameState.planets).length - 1; // Exclude Earth
    const visitedCount = gameState.player.visitedPlanets.length - 1; // Exclude Earth

    if (visitedCount >= totalPlanets) {
        gameOver(`Congratulations! You have visited all ${totalPlanets} planets! You win!`);
    }
}

function gameOver(message) {
    logMessage(`GAME OVER: ${message}`);
    // Disable further actions (could hide buttons, show overlay, etc.)
    alert(`GAME OVER: ${message}`); // Simple alert for now
    // Optionally, reset the game or disable controls
    // For now, just log and alert.
}





function handleMapMouseMove(event) {
    const rect = starMapCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let currentlyHovered = null;
    let minDistSq = Infinity;

    // Find the closest planet to the mouse cursor using RENDERED positions
    for (const id in renderedPlanetPositions) {
        const planet = gameState.planets[id]; // Need radius
        const renderedPos = renderedPlanetPositions[id];
        if (!renderedPos) continue;

        const dx = mouseX - renderedPos.x;
        const dy = mouseY - renderedPos.y;
        const distSq = dx * dx + dy * dy;
        const targetRadiusSq = (planet.radius * MAP_SCALE_FACTOR + 5) * (planet.radius * MAP_SCALE_FACTOR + 5); // Use radius + buffer

        // Check if mouse is within planet radius + buffer and closer than previous
        if (distSq <= targetRadiusSq && distSq < minDistSq) {
            currentlyHovered = id;
            minDistSq = distSq;
        }
    }

    // Update hoveredPlanetId only if it changed
    if (hoveredPlanetId !== currentlyHovered) {
        hoveredPlanetId = currentlyHovered;
        // Update cursor style based on hover state
        starMapCanvas.style.cursor = hoveredPlanetId ? "pointer" : "default";
        // No need to manually trigger redraw, animation loop handles it
    }
}




// --- Quiz Stop Functionality ---
function handleStopQuiz() {
    const planetId = gameState.player.locationId;
    const quizProgress = gameState.player.quizProgress[planetId];
    const quizData = gameState.quizzes[gameState.planets[planetId].quizId];

    if (!quizProgress || !quizData) {
        console.error("Cannot stop quiz: No quiz data or progress found for", planetId);
        return;
    }

    // Calculate score based on answered questions
    let finalScore = quizProgress.score;
    let totalReward = 0;
    // Note: The score is already updated in handleQuizAnswer, so we just use the current score.
    // We need to calculate the total reward based on the score.
    for (let i = 0; i < quizProgress.currentQ; i++) { // Iterate through answered questions
        // Assuming score tracks number of correct answers
        // Let's re-calculate reward based on score to be safe
    }
    // Simpler: Assume score directly reflects reward earned so far.
    // Let's adjust handleQuizAnswer later if needed. For now, let's just use the score as is, assuming it's the credit reward.
    totalReward = finalScore; // Assuming score = credits earned

    logMessage(`Quiz stopped early on ${gameState.planets[planetId].name}. Final score: ${finalScore} credits earned.`);

    // Mark quiz as completed (stopped)
    quizProgress.completed = true; // Mark as completed so it can't be retaken immediately
    // quizProgress.stopped = true; // Optional: Add a flag if needed later

    // Hide quiz UI elements and show activities/facts again
    quizSection.style.display = "none";
    document.getElementById("planet-activities").style.display = "block";

    // Update player credits (already done in handleQuizAnswer, but let's ensure)
    // gameState.player.credits += totalReward; // This might double-count if handleQuizAnswer already adds it.
    // Let's modify handleQuizAnswer later if needed. For now, just log and hide.

    updateStatusBar();
    renderPlanetView(); // Re-render planet view to update button states and show facts
}

// --- Restart Game Functionality ---
function restartGame() {
    if (confirm("Are you sure you want to restart the game? All progress will be lost.")) {
        logMessage("Restarting game...");

        // Stop any ongoing animations/intervals
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (gatherGame.animationFrameId) {
            cancelAnimationFrame(gatherGame.animationFrameId);
            gatherGame.animationFrameId = null;
            document.removeEventListener("keydown", handleGatherKeyDown);
            document.removeEventListener("keyup", handleGatherKeyUp);
        }
        // Add clearing for travel interval if implemented

        // Reset game state to initial values (deep copy needed for nested objects)
        gameState = {
            currentView: "earth",
            player: {
                locationId: "earth",
                credits: 1000,
                rocket: null,
                visitedPlanets: ["earth"],
                quizProgress: {}, // Re-initialize based on PLANETS
                inventory: {}
            },
            planets: JSON.parse(JSON.stringify(PLANETS)), // Reset planet angles etc.
            rockets: ROCKETS, // Static data, no need to reset unless modified
            quizzes: QUIZZES, // Static data
            resources: RESOURCES, // Static data
            travel: {
                destinationId: null,
                startTime: 0,
                duration: 0
            }
        };
        // Re-initialize quiz progress based on reset planets
        for (const planetId in gameState.planets) {
            if (!gameState.planets[planetId].isHub && gameState.planets[planetId].quizId) {
                gameState.player.quizProgress[planetId] = { completed: false, currentQ: 0, score: 0 };
            }
        }

        // Reset UI elements
        messageLog.innerHTML = ''; // Clear log
        logMessage("Welcome to Exploration Camp! Purchase a rocket to begin.");

        // Switch to Earth view and render
        switchView("earth");
    }
}

