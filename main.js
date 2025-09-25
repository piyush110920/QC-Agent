// --- CONFIGURATION ---
const N8N_WEBHOOK_URL = '/api/upload'; // Use the local proxy endpoint

// --- ELEMENT SELECTORS ---
const uploadContainer = document.querySelector('#upload-container');
const previewContainer = document.querySelector('#preview-container');
const uploadForm = document.querySelector('#upload-form');
const previewForm = document.querySelector('#preview-form');
const submitBtn = document.querySelector('#submit-btn');
const loadingIndicator = document.querySelector('#loading-indicator');
const updateBtn = document.querySelector('#update-btn');
const proceedBtn = document.querySelector('#proceed-btn');

// --- STATE MANAGEMENT ---
let originalPreviewData = {};

// --- EVENT LISTENERS ---

/**
 * Handles the submission of the initial file upload form.
 */
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default browser submission

  // Show loading state
  submitBtn.classList.add('hidden');
  loadingIndicator.classList.remove('hidden');

  const formData = new FormData(uploadForm);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    // Store the initial data to check for changes later
    originalPreviewData = data;

    // Populate the preview form with data from n8n
    populatePreviewForm(data);

    // Switch views
    uploadContainer.classList.add('hidden');
    previewContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Error uploading files:', error);
    alert('An error occurred while uploading. Please check the console and try again.');
  } finally {
    // Hide loading state
    submitBtn.classList.remove('hidden');
    loadingIndicator.classList.add('hidden');
  }
});

/**
 * Listens for any input changes in the preview form to show the "Update" button.
 */
previewForm.addEventListener('input', () => {
  updateBtn.classList.remove('hidden');
  proceedBtn.classList.add('hidden');
});

/**
 * Handles the "Update" button click.
 * In a real app, this would send the updated data back to another n8n webhook.
 */
updateBtn.addEventListener('click', () => {
  // Here you would typically send the updated form data to another n8n endpoint
  // For now, we'll just alert and then proceed.
  const updatedData = Object.fromEntries(new FormData(previewForm).entries());
  console.log('Updated Data:', updatedData);
  alert('Data "updated"! Now proceeding to the next item.');
  resetApp();
});

/**
 * Handles the "Proceed" button click to reset the application.
 */
proceedBtn.addEventListener('click', () => {
  resetApp();
});

// --- HELPER FUNCTIONS ---

/**
 * Populates the preview form fields with data received from n8n.
 * @param {object} data - The JSON data from the n8n webhook response.
 */
function populatePreviewForm(data) {
  // Example: mapping data.productName to the input field
  // Adjust the keys ('productName', 'sku', etc.) to match what your n8n workflow returns
  document.querySelector('#preview-product-name').value = data.productName || '';
  document.querySelector('#preview-sku').value = data.sku || '';
  document.querySelector('#preview-invoice-number').value = data.invoiceNumber || '';
}

/**
 * Resets the application to its initial state for the next entry.
 */
function resetApp() {
  uploadForm.reset();
  previewForm.reset();
  uploadContainer.classList.remove('hidden');
  previewContainer.classList.add('hidden');
  updateBtn.classList.add('hidden');
  proceedBtn.classList.remove('hidden');
}
