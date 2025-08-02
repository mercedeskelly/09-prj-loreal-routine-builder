// L'Oréal Routine Builder - Enhanced JavaScript

// Global variables
let allProducts = [];
let selectedProducts = [];
let conversationHistory = [];
let currentLanguage = "en";

// DOM elements
const elements = {
  categoryFilter: document.getElementById("categoryFilter"),
  searchInput: document.getElementById("productSearch"),
  productsGrid: document.getElementById("productsContainer"),
  selectedProductsList: document.getElementById("selectedProductsList"),
  selectedCount: document.getElementById("selectedCount"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  generateRoutineBtn: document.getElementById("generateRoutine"),
  chatWindow: document.getElementById("chatWindow"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("userInput"),
  productModal: document.getElementById("productModal"),
  modalProductInfo: document.getElementById("modalProductInfo"),
  closeModal: document.querySelector(".close"),
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  loadProducts();
  loadSelectedProducts();
  setupEventListeners();
  updateSelectedProductsDisplay();
  detectLanguage();
}

// Language detection and RTL support
function detectLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  if (
    userLang.includes("ar") ||
    userLang.includes("he") ||
    userLang.includes("fa")
  ) {
    currentLanguage = "rtl";
    document.documentElement.setAttribute("dir", "rtl");
  }
}

// Load products from JSON
async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const data = await response.json();
    // Handle both array format and object with products property
    allProducts = Array.isArray(data) ? data : data.products || [];
    displayProducts(allProducts);
  } catch (error) {
    console.error("Error loading products:", error);
    showPlaceholderMessage("Error loading products. Please refresh the page.");
  }
}

// Setup event listeners
function setupEventListeners() {
  // Category filter
  if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener("change", handleCategoryChange);
  }

  // Search input
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", handleSearch);
  }

  // Generate routine button
  if (elements.generateRoutineBtn) {
    elements.generateRoutineBtn.addEventListener("click", generateRoutine);
  }

  // Clear all button
  if (elements.clearAllBtn) {
    elements.clearAllBtn.addEventListener("click", clearAllProducts);
  }

  // Chat form
  if (elements.chatForm) {
    elements.chatForm.addEventListener("submit", handleChatSubmit);
  }

  // Modal close
  if (elements.closeModal) {
    elements.closeModal.addEventListener("click", closeModal);
  }
  if (elements.productModal) {
    window.addEventListener("click", function (event) {
      if (event.target === elements.productModal) {
        closeModal();
      }
    });
  }
}

// Handle category filter change
function handleCategoryChange() {
  filterAndDisplayProducts();
}

// Handle search input
function handleSearch() {
  filterAndDisplayProducts();
}

// Filter and display products based on search and category
function filterAndDisplayProducts() {
  const searchTerm = elements.searchInput
    ? elements.searchInput.value.toLowerCase()
    : "";
  const selectedCategory = elements.categoryFilter
    ? elements.categoryFilter.value
    : "";

  let filteredProducts = allProducts;

  // Filter by category
  if (
    selectedCategory &&
    selectedCategory !== "all" &&
    selectedCategory !== ""
  ) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }

  displayProducts(filteredProducts);
}

// Display products in the grid
function displayProducts(products) {
  if (!elements.productsGrid) return;

  if (products.length === 0) {
    showPlaceholderMessage(
      "No products found. Try adjusting your search or filter."
    );
    return;
  }

  const productsHTML = products
    .map((product) => createProductCard(product))
    .join("");
  elements.productsGrid.innerHTML = productsHTML;

  // Add event listeners to product cards
  addProductEventListeners();
}

// Create HTML for a product card
function createProductCard(product) {
  const isSelected = selectedProducts.some((p) => p.id === product.id);
  const selectedClass = isSelected ? "selected" : "";
  const buttonText = isSelected ? "Selected" : "Select";
  const buttonIcon = isSelected ? "fas fa-check" : "fas fa-plus";

  return `
    <div class="product-card ${selectedClass}" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <div class="brand">${product.brand}</div>
        <h3>${product.name}</h3>
        <div class="category">${product.category}</div>
        <div class="product-actions">
          <button class="btn-select ${
            isSelected ? "selected" : ""
          }" data-product-id="${product.id}">
            <i class="${buttonIcon}"></i>
            ${buttonText}
          </button>
          <button class="btn-info" data-product-id="${
            product.id
          }" title="View Details">
            <i class="fas fa-info"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add event listeners to product cards
function addProductEventListeners() {
  // Select/deselect buttons
  document.querySelectorAll(".btn-select").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const productId = parseInt(this.dataset.productId);
      toggleProductSelection(productId);
    });
  });

  // Info buttons
  document.querySelectorAll(".btn-info").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const productId = parseInt(this.dataset.productId);
      showProductModal(productId);
    });
  });

  // Product card click (for selection)
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", function () {
      const productId = parseInt(this.dataset.productId);
      toggleProductSelection(productId);
    });
  });
}

// Toggle product selection
function toggleProductSelection(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const isSelected = selectedProducts.some((p) => p.id === productId);

  if (isSelected) {
    selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  } else {
    selectedProducts.push(product);
  }

  saveSelectedProducts();
  updateSelectedProductsDisplay();
  filterAndDisplayProducts(); // Refresh to update selection state
}

// Update selected products display
function updateSelectedProductsDisplay() {
  if (elements.selectedCount) {
    elements.selectedCount.textContent = selectedProducts.length;
  }

  if (selectedProducts.length === 0) {
    if (elements.selectedProductsList) {
      elements.selectedProductsList.innerHTML =
        '<div class="placeholder-message">No products selected yet. Click on products above to add them to your routine.</div>';
    }
    if (elements.clearAllBtn) {
      elements.clearAllBtn.style.display = "none";
    }
    if (elements.generateRoutineBtn) {
      elements.generateRoutineBtn.disabled = true;
    }
  } else {
    if (elements.selectedProductsList) {
      const selectedHTML = selectedProducts
        .map((product) => createSelectedProductItem(product))
        .join("");
      elements.selectedProductsList.innerHTML = selectedHTML;
    }
    if (elements.clearAllBtn) {
      elements.clearAllBtn.style.display = "flex";
    }
    if (elements.generateRoutineBtn) {
      elements.generateRoutineBtn.disabled = false;
    }

    // Add remove button event listeners
    document.querySelectorAll(".remove-product-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = parseInt(this.dataset.productId);
        toggleProductSelection(productId);
      });
    });
  }
}

// Create HTML for selected product item
function createSelectedProductItem(product) {
  return `
    <div class="selected-product-item">
      <img src="${product.image}" alt="${product.name}">
      <div class="selected-product-info">
        <h4>${product.name}</h4>
        <div class="brand">${product.brand}</div>
      </div>
      <button class="remove-product-btn" data-product-id="${product.id}" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
}

// Clear all selected products
function clearAllProducts() {
  selectedProducts = [];
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  filterAndDisplayProducts();
}

// Show product modal
function showProductModal(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product || !elements.productModal || !elements.modalProductInfo) return;

  const modalHTML = `
    <div class="modal-product-info">
      <img src="${product.image}" alt="${product.name}">
      <div class="modal-product-details">
        <h3>${product.name}</h3>
        <div class="brand">${product.brand}</div>
        <div class="category">${product.category}</div>
        <div class="description">${product.description}</div>
      </div>
    </div>
  `;

  elements.modalProductInfo.innerHTML = modalHTML;
  elements.productModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Close modal
function closeModal() {
  if (elements.productModal) {
    elements.productModal.style.display = "none";
  }
  document.body.style.overflow = "auto";
}

// Generate routine using AI
async function generateRoutine() {
  if (selectedProducts.length === 0) return;

  const userMessage = `Generate a personalized beauty routine using these products: ${selectedProducts
    .map((p) => `${p.brand} ${p.name} (${p.category})`)
    .join(", ")}`;

  addChatMessage(userMessage, "user");

  // Show loading message
  const loadingId = addChatMessage(
    "Generating your personalized routine...",
    "assistant",
    true
  );

  try {
    const response = await callOpenAI(userMessage);
    removeChatMessage(loadingId);
    addChatMessage(response, "assistant");
  } catch (error) {
    removeChatMessage(loadingId);
    addChatMessage(
      "Sorry, I encountered an error while generating your routine. Please try again.",
      "assistant"
    );
    console.error("Error generating routine:", error);
  }
}

// Handle chat form submission
function handleChatSubmit(e) {
  e.preventDefault();

  if (!elements.chatInput) return;

  const message = elements.chatInput.value.trim();
  if (!message) return;

  elements.chatInput.value = "";
  addChatMessage(message, "user");

  // Show loading message
  const loadingId = addChatMessage("Thinking...", "assistant", true);

  // Simulate AI response (replace with actual OpenAI integration)
  setTimeout(async () => {
    try {
      const response = await callOpenAI(message);
      removeChatMessage(loadingId);
      addChatMessage(response, "assistant");
    } catch (error) {
      removeChatMessage(loadingId);
      addChatMessage(
        "Sorry, I encountered an error. Please try again.",
        "assistant"
      );
      console.error("Error in chat:", error);
    }
  }, 1000);
}

// Add chat message
function addChatMessage(message, sender, isLoading = false) {
  if (!elements.chatWindow) return null;

  const messageId = Date.now() + Math.random();
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const messageHTML = `
    <div class="chat-message ${sender}" data-message-id="${messageId}">
      <div class="message-content">${
        isLoading
          ? '<i class="fas fa-spinner fa-spin"></i> ' + message
          : message
      }</div>
      <div class="timestamp">${timestamp}</div>
    </div>
  `;

  // Remove welcome message if it exists
  const welcomeMessage = elements.chatWindow.querySelector(".welcome-message");
  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  elements.chatWindow.insertAdjacentHTML("beforeend", messageHTML);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;

  // Add to conversation history
  if (!isLoading) {
    conversationHistory.push({
      role: sender === "user" ? "user" : "assistant",
      content: message,
    });
  }

  return messageId;
}

// Remove chat message
function removeChatMessage(messageId) {
  if (!elements.chatWindow || !messageId) return;

  const messageElement = elements.chatWindow.querySelector(
    `[data-message-id="${messageId}"]`
  );
  if (messageElement) {
    messageElement.remove();
  }
}

// Call OpenAI API via Cloudflare Worker
async function callOpenAI(message) {
  const context =
    selectedProducts.length > 0
      ? `Selected products: ${selectedProducts
          .map((p) => `${p.brand} ${p.name} (${p.category})`)
          .join(", ")}. `
      : "";
  const fullPrompt = `${context}User question: ${message}`;

  // Format messages for OpenAI API
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful L'Oréal beauty consultant. Help users create personalized skincare and beauty routines based on their selected products and preferences. Provide detailed, professional advice.",
    },
    ...conversationHistory,
    {
      role: "user",
      content: fullPrompt,
    },
  ];

  try {
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle OpenAI API response format
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      return data.choices[0].message.content;
    } else if (data.error) {
      throw new Error(
        `OpenAI API error: ${data.error.message || "Unknown error"}`
      );
    } else {
      console.error("Unexpected response format:", data);
      return "Sorry, I received an unexpected response format. Please try again.";
    }
  } catch (error) {
    console.error("Error calling Cloudflare Worker:", error);
    throw new Error("Failed to get AI response");
  }
}

// Show placeholder message
function showPlaceholderMessage(message) {
  if (elements.productsGrid) {
    elements.productsGrid.innerHTML = `<div class="placeholder-message">${message}</div>`;
  }
}

// LocalStorage functions
function saveSelectedProducts() {
  try {
    localStorage.setItem(
      "loreal_selected_products",
      JSON.stringify(selectedProducts)
    );
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

function loadSelectedProducts() {
  try {
    const saved = localStorage.getItem("loreal_selected_products");
    if (saved) {
      selectedProducts = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    selectedProducts = [];
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add debounced search
const debouncedSearch = debounce(filterAndDisplayProducts, 300);
if (elements.searchInput) {
  elements.searchInput.removeEventListener("input", handleSearch);
  elements.searchInput.addEventListener("input", debouncedSearch);
}

// Secrets configuration
// This section is for storing API keys and other sensitive information
// In production, use environment variables or a secure configuration service

// Cloudflare Worker endpoint (placeholder)
const CLOUDFLARE_WORKER_URL =
  "https://finallorealchatbot-worker.treyzangel.workers.dev/";

// Note: In a real application, never expose API keys in client-side code
// Use a backend service or Cloudflare Worker to handle API requests securely

// Restore the export at the end if needed
window.LorealRoutineBuilder = {
  toggleProductSelection,
  generateRoutine,
  clearAllProducts,
  showProductModal,
};
