let isEnabled = false;
let currentQuoteIndex = 0;
let sound;
let occupiedPositions = [];

window.addEventListener("DOMContentLoaded", () => {
  const isCompanyWebsite = companyWebsiteLinks.some((v) =>
    window.location.origin.toLowerCase().includes(v.toLowerCase())
  );

  if (isCompanyWebsite) {
    initializeDropletSystem();
    sound = initializeSound();
  document.addEventListener("click", handlePageClick);
  }
});

function initializeSound() {
  sound = new Howl({
    src: [chrome.runtime.getURL("audios/my_audio.mp3")],
    volume: 1.0,
    onloaderror: function () {
      console.error("Error loading audio");
    },
  });
  return sound;
}
// ====== Event Handlers ======
function handlePageClick(e) {
    if ( isEnabled) {
    addQuote(e.clientX, e.clientY);
    makeDroplet(10);
    sound.play();
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  } 
}

// ====== Initialization Functions ======
function initializeDropletSystem() {
  showCustomAlert();
  createContainer();
  createContainerQuotes();
  injectDropletCSS();
}

// ====== Modal Alert ======
function showCustomAlert() {
  const modal = createModal();
  const modalContent = createModalContent();

  const message = createMessageElement(getWebsiteName());
  modalContent.appendChild(message);

  const buttonContainer = createButtonContainer();
  modalContent.appendChild(buttonContainer);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function createModal() {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  return modal;
}

function createModalContent() {
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  `;
  return modalContent;
}

function createMessageElement(websiteName) {
  const message = document.createElement("p");
  message.innerHTML = `<div class="website-name-container"><span class="website_name">${websiteName}</span> </div> is an Israeli company or supports Israel`;
  message.style.fontSize = "18px";
  message.style.marginBottom = "20px";
  return message;
}

function createButtonContainer() {
  const container = document.createElement("div");
  container.style.cssText = `
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  `;

  const yesButton = createButton("Continue, I don't care", "#f44336", () => {
    isEnabled = true;
    // sound.play();
    document.body.removeChild(container.parentElement.parentElement);
    makeDroplet(50);
  });

  const noButton = createButton("Support Palestine", "#4CAF50", () => {
    document.body.removeChild(container.parentElement.parentElement);
    window.location.href = "https://www.google.com/";
  });

  container.appendChild(yesButton);
  container.appendChild(noButton);
  return container;
}

function createButton(text, bgColor, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.cssText = `
    background-color: ${bgColor};
    width: 60%;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  `;
  button.addEventListener("click", onClick);
  return button;
}

// ====== Utility Functions ======
function getWebsiteName() {
  const hostname = window.location.hostname;
  const lastIndex = hostname.lastIndexOf(".");
  return hostname.includes("www")
    ? hostname.substring(4, lastIndex)
    : hostname.substring(0, lastIndex);
}

function injectDropletCSS() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("style.css");
  document.head.appendChild(link);
}

// ====== Droplet System ======
let dropletsContainer;
let quotesContainer;

function createContainer() {
  dropletsContainer = createOverlayContainer("water-droplets-container");
}

function createContainerQuotes() {
  quotesContainer = createOverlayContainer("quotes-container");
}

function createOverlayContainer(id) {
  const container = document.createElement("div");
  container.id = id;
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(container);
  return container;
}

function createWaterDroplet(x, y) {
  const droplet = document.createElement("div");
  droplet.className = "water-droplet";

  const posX = x || Math.random() * window.innerWidth;
  const posY = y || Math.random() * window.innerHeight;
  const size = Math.random() * 500 + 100;

  droplet.style.cssText = `
    --size: ${size}px;
    left: ${posX}px;
    top: ${posY}px;
    animation-duration: ${Math.random() * 2 + 1.5}s, ${Math.random() * 3 + 3}s;
    animation-delay: ${Math.random() * 1}s;
  `;

  dropletsContainer.appendChild(droplet);
}



// Add this at the top of your script (global scope)
// const occupiedPositions = [];

function addQuote(x, y) {
  const quote = document.createElement("div");
  quote.className = "my-quote";
  quote.innerText = quotes[currentQuoteIndex];

  const width = 350;
  const height = 100;
  const { posX, posY } = findNonOverlappingPosition(width, height, x, y);

  // Store the occupied position
  occupiedPositions.push({
    x: posX,
    y: posY,
    width: width,
    height: height,
    element: quote
  });

  quote.style.cssText = `
    position: absolute;
    left: ${posX}px;
    top: ${posY}px;
    width: ${width}px;
    height: ${height}px;
    animation-duration: ${Math.random() * 2 + 1.5}s, ${Math.random() * 3 + 3}s;
    animation-delay: ${Math.random() * 1}s;
  `;

  quotesContainer.appendChild(quote);
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
}

function findNonOverlappingPosition(width, height, x, y) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const maxX = screenWidth - width;
  const maxY = screenHeight - height;

  if (
    x !== undefined &&
    y !== undefined &&
    x >= 0 &&
    x <= maxX &&
    y >= 0 &&
    y <= maxY &&
    !isOverlapping(x, y, width, height)
  ) {
    return { posX: x, posY: y };
  }

  return spiralPlacement(width, height, maxX, maxY);
}

function spiralPlacement(width, height, maxX, maxY) {
  const centerX = maxX / 2;
  const centerY = maxY / 2;
  const angleStep = (2 * Math.PI) / 10;
  const radiusStep = 50;

  for (
    let radius = 0;
    radius < Math.max(window.innerWidth, window.innerHeight);
    radius += radiusStep
  ) {
    for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
      const x = Math.max(0, Math.min(maxX, centerX + Math.cos(angle) * radius - width/2));
      const y = Math.max(0, Math.min(maxY, centerY + Math.sin(angle) * radius - height/2));
      if (!isOverlapping(x, y, width, height)) {
        return { posX: x, posY: y };
      }
    }
  }

  // Fallback - try random positions
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    if (!isOverlapping(x, y, width, height)) {
      return { posX: x, posY: y };
    }
  }
  
  // If all else fails, just return a position (may overlap)
  return { posX: Math.random() * maxX, posY: Math.random() * maxY };
}

function isOverlapping(x, y, width, height) {
  for (const pos of occupiedPositions) {
    if (
      x < pos.x + pos.width &&
      x + width > pos.x &&
      y < pos.y + pos.height &&
      y + height > pos.y
    ) {
      return true;
    }
  }
  return false;
}

// Add this to clean up positions when quotes are removed
function cleanUpOccupiedPositions() {
  occupiedPositions = occupiedPositions.filter(pos => 
    document.body.contains(pos.element)
  );
}


function makeDroplet(counter) {
  for (let i = 0; i < counter; i++) {
    createWaterDroplet();
  }
}
