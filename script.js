// ========================================
// PICKLEBALL FORM LOGIC v2.0
// ✅ NEW: Phone Lookup & Auto-Fill
// ========================================

// ========================================
// CONFIGURATION and
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw15_nHUEcro2KXmTyjHhIiXw6BzfhqDDigZLjbSiv4zt9MLs3a6noUP3uutQATJwB1/exec';


// ========================================
// ✅ NEW: PHONE LOOKUP & AUTO-FILL
// ========================================

let playerLookupData = null; // Store looked-up player data
let phoneDebounceTimer = null;

/**
 * Lookup player by phone number
 */
async function lookupPlayerByPhone(phone) {
    try {
        // Format phone for consistency
        const formattedPhone = formatPhoneNumber(phone);
        
        // Call Apps Script endpoint
        const url = `${SCRIPT_URL}?action=lookupPhone&phone=${encodeURIComponent(formattedPhone)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Phone lookup error:', error);
        return { found: false };
    }
}

/**
 * Format phone number as (XXX) XXX-XXXX
 */
function formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return phone;
}

/**
 * Handle phone input with debouncing
 */
function handlePhoneInput(phoneInput) {
    clearTimeout(phoneDebounceTimer);
    
    const phone = phoneInput.value.trim();
    const messageDiv = document.getElementById('playerRecognitionMessage');
    
    // Hide message while typing
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
    
    // Only lookup if we have at least 10 digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
        playerLookupData = null;
        return;
    }
    
    // Format phone as user types
    phoneInput.value = formatPhoneNumber(phone);
    
    // Debounce: wait 500ms after user stops typing
    phoneDebounceTimer = setTimeout(async () => {
        const result = await lookupPlayerByPhone(phone);
        
        if (result.found) {
            // Store player data
            playerLookupData = result;
            
            // Show welcome message
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="background: rgba(0, 217, 255, 0.1); 
                                border-left: 4px solid #00D9FF; 
                                padding: 12px 16px; 
                                border-radius: 8px; 
                                margin-top: 12px;">
                        <strong style="color: #00D9FF;">👋 Welcome back, ${result.firstName}!</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">
                            We've pre-filled your information. You can update anything if needed.
                        </p>
                    </div>
                `;
                messageDiv.style.display = 'block';
            }
            
        } else {
            // New player
            playerLookupData = null;
            
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="background: rgba(155, 81, 224, 0.1); 
                                border-left: 4px solid #9B51E0; 
                                padding: 12px 16px; 
                                border-radius: 8px; 
                                margin-top: 12px;">
                        <strong style="color: #9B51E0;">✨ New player - welcome!</strong>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">
                            Please complete the form below.
                        </p>
                    </div>
                `;
                messageDiv.style.display = 'block';
            }
        }
    }, 500);
}

/**
 * Auto-fill player information when player count changes
 */
function autoFillPlayerInfo() {
    if (!playerLookupData || !playerLookupData.found) return;
    
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    
    if (playerCount === '1') {
        // Single player - fill name field
        const nameField = document.getElementById('playerName');
        if (nameField && !nameField.value) {
            nameField.value = playerLookupData.fullName;
        }
    } else if (playerCount === '2') {
        // Two players - fill Player 1 fields
        const player1FirstName = document.getElementById('player1FirstName');
        const player1LastName = document.getElementById('player1LastName');
        
        if (player1FirstName && !player1FirstName.value) {
            player1FirstName.value = playerLookupData.firstName;
        }
        if (player1LastName && !player1LastName.value) {
            player1LastName.value = playerLookupData.lastName;
        }
    }
    
    // Always fill email (same for both)
    const emailField = document.getElementById('email');
    if (emailField && !emailField.value) {
        emailField.value = playerLookupData.email;
    }
    
    // Pre-select payment method
    if (playerLookupData.lastPaymentMethod) {
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        paymentRadios.forEach(radio => {
            if (radio.value === playerLookupData.lastPaymentMethod) {
                radio.checked = true;
                // Trigger change event to show payment details
                radio.dispatchEvent(new Event('change'));
            }
        });
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadUpcomingDates();
        setupFormEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to load game dates. Please refresh the page.');
    }
});

// ========================================
// LOAD UPCOMING DATES
// ========================================

async function loadUpcomingDates() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getNext3Sundays`);
        const data = await response.json();
        
        if (data.success && data.sundays) {
            renderDateCards(data.sundays);
        } else {
            throw new Error('Failed to load dates');
        }
    } catch (error) {
        console.error('Error loading dates:', error);
        showError('Unable to load game dates. Please try again later.');
    }
}

function renderDateCards(sundays) {
    const container = document.getElementById('dateCardsContainer');
    container.innerHTML = '';
    
    sundays.forEach((sunday, index) => {
        const card = document.createElement('div');
        card.className = 'date-card';
        card.onclick = () => selectDate(index);
        
        card.innerHTML = `
            <div class="date-card-header">
                <img src="calendar-icon.png" alt="Calendar" style="width: 100px; height: 100px;">
            </div>
            <div class="date-card-body">
                <div class="date-card-date">${sunday.dateShort}</div>
                <div class="date-card-time">${sunday.time}</div>
                <div class="date-card-location">${sunday.location}</div>
                <div class="date-card-courts">Courts: ${sunday.courts}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    window.availableDates = sundays;
}

function selectDate(index) {
    document.querySelectorAll('.date-card').forEach((card, i) => {
        card.classList.toggle('selected', i === index);
    });
    
    window.selectedDateIndex = index;
    
    const continueBtn = document.getElementById('continueDateBtn');
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor = 'pointer';
}

function continueFromDateSelection() {
    if (window.selectedDateIndex === undefined) {
        alert('Please select a game date');
        return;
    }
    
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    updateProgress(1, 3);
}

// ========================================
// FORM EVENT LISTENERS
// ========================================

function setupFormEventListeners() {
    // Player count handlers - show dynamic name fields AND update Step 2 pricing
    const playerCount1 = document.getElementById('playerCount1');
    const playerCount2 = document.getElementById('playerCount2');
    
    if (playerCount1) playerCount1.addEventListener('change', handlePlayerCountChange);
    if (playerCount2) playerCount2.addEventListener('change', handlePlayerCountChange);
    
    // Payment method handlers
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
}

function handlePlayerCountChange() {
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    
    const singlePlayerFields = document.getElementById('singlePlayerFields');
    const twoPlayerFields = document.getElementById('twoPlayerFields');
    const pricingDisplay = document.getElementById('pricingDisplay');
    
    if (playerCount === '1') {
        singlePlayerFields.style.display = 'block';
        twoPlayerFields.style.display = 'none';
        pricingDisplay.innerHTML = '<strong style="color: #FFE500;">$4 Sunday Game for 1 person</strong>';
    } else if (playerCount === '2') {
        singlePlayerFields.style.display = 'none';
        twoPlayerFields.style.display = 'block';
        pricingDisplay.innerHTML = '<strong style="color: #FFE500;">$8 Sunday Game for 2 people</strong>';
    }
    
    // Update payment display amounts
    updatePaymentDisplay();
    
    // ✅ NEW: Auto-fill if returning player
    autoFillPlayerInfo();
}

function updatePaymentDisplay() {
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value || '1';
    const amount = parseInt(playerCount) * 4;
    
    // Update Venmo link
    const venmoDetails = document.querySelector('#paymentDetails .payment-method-details');
    if (venmoDetails && venmoDetails.innerHTML.includes('Venmo')) {
        const names = getPlayerNames();
        venmoDetails.innerHTML = `
            <h4 style="color: #00D9FF; margin-bottom: 12px;">💳 Pay with Venmo</h4>
            <p><strong>Venmo:</strong> @Steven-Bettencourt-4</p>
            <p style="margin-top: 12px;">
                <a href="venmo://paycharge?txn=pay&recipients=Steven-Bettencourt-4&amount=${amount}&note=Pickleball%20Sunday%20Game" 
                   style="display: inline-block; padding: 12px 24px; background: #00D9FF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Pay $${amount} via Venmo →
                </a>
            </p>
            <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.6);">
                Click the button above to open Venmo and pay now. You'll also receive this link via email.
            </p>
        `;
    }
    
    // Update Zelle display
    const zelleDetails = document.querySelector('#paymentDetails .payment-method-details');
    if (zelleDetails && zelleDetails.innerHTML.includes('Zelle')) {
        updateZelleDisplay(amount);
    }
}

function handlePaymentMethodChange(e) {
    const method = e.target.value;
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value || '1';
    const amount = parseInt(playerCount) * 4;
    
    let instructions = '';
    
    if (method === 'Venmo') {
        const names = getPlayerNames();
        instructions = `
            <div class="payment-method-details">
                <h4 style="color: #00D9FF; margin-bottom: 12px;">💳 Pay with Venmo</h4>
                <p><strong>Venmo:</strong> @Steven-Bettencourt-4</p>
                <p style="margin-top: 12px;">
                    <a href="venmo://paycharge?txn=pay&recipients=Steven-Bettencourt-4&amount=${amount}&note=Pickleball%20Sunday%20Game" 
                       style="display: inline-block; padding: 12px 24px; background: #00D9FF; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Pay $${amount} via Venmo →
                    </a>
                </p>
                <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.6);">
                    Click the button above to open Venmo and pay now. You'll also receive this link via email.
                </p>
            </div>
        `;
    } else if (method === 'Zelle') {
        instructions = `
            <div class="payment-method-details">
                <h4 style="color: #FFE500; margin-bottom: 12px;">💳 Pay with Zelle</h4>
                <div style="background: rgba(255, 229, 0, 0.1); border: 2px solid #FFE500; padding: 16px; border-radius: 8px; margin: 12px 0;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #FFE500;">Amount to send: $${amount}</p>
                </div>
                <p><strong>Zelle:</strong> (310) 433-8281</p>
                <p style="margin-top: 4px;"><strong>Or email:</strong> bettencourtdesign@me.com</p>
                <p style="margin-top: 12px; font-size: 13px; color: rgba(255,255,255,0.6);">
                    Send payment via Zelle to either the phone number or email above. You'll also receive this info via email.
                </p>
            </div>
        `;
    } else if (method === 'Cash (In Person)') {
        instructions = `
            <div class="payment-method-details">
                <h4 style="color: #00FFA3; margin-bottom: 12px;">💵 Pay Cash In Person</h4>
                <div style="background: rgba(0, 255, 163, 0.1); border: 2px solid #00FFA3; padding: 16px; border-radius: 8px; margin: 12px 0;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #00FFA3;">Bring $${amount} cash to the court</p>
                </div>
                <p style="margin-top: 12px;">Please arrive a few minutes early to complete payment before the game starts.</p>
                <p style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.6);">
                    You'll receive a reminder email with game details.
                </p>
            </div>
        `;
    }
    
    document.getElementById('paymentDetails').innerHTML = instructions;
}

function updateZelleDisplay(amount) {
    const zelleDiv = document.querySelector('#paymentDetails .payment-method-details');
    if (zelleDiv && zelleDiv.innerHTML.includes('Zelle')) {
        zelleDiv.innerHTML = `
            <h4 style="color: #FFE500; margin-bottom: 12px;">💳 Pay with Zelle</h4>
            <div style="background: rgba(255, 229, 0, 0.1); border: 2px solid #FFE500; padding: 16px; border-radius: 8px; margin: 12px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #FFE500;">Amount to send: $${amount}</p>
            </div>
            <p><strong>Zelle:</strong> (310) 433-8281</p>
            <p style="margin-top: 4px;"><strong>Or email:</strong> bettencourtdesign@me.com</p>
            <p style="margin-top: 12px; font-size: 13px; color: rgba(255,255,255,0.6);">
                Send payment via Zelle to either the phone number or email above. You'll also receive this info via email.
            </p>
        `;
    }
}

function getPlayerNames() {
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    
    if (playerCount === '1') {
        return document.getElementById('playerName')?.value || '';
    } else {
        const firstName1 = document.getElementById('player1FirstName')?.value || '';
        const lastName1 = document.getElementById('player1LastName')?.value || '';
        const firstName2 = document.getElementById('player2FirstName')?.value || '';
        const lastName2 = document.getElementById('player2LastName')?.value || '';
        return `${firstName1} ${lastName1} & ${firstName2} ${lastName2}`.trim();
    }
}

// ========================================
// STEP 1 → STEP 2 VALIDATION
// ========================================

function goToStep2() {
    // Phone validation (required and 10 digits)
    const phone = document.getElementById('phone').value.trim();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Player count validation
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    if (!playerCount) {
        alert('Please select how many people are playing');
        return;
    }
    
    // Name validation
    if (playerCount === '1') {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
    } else if (playerCount === '2') {
        const player1FirstName = document.getElementById('player1FirstName').value.trim();
        const player1LastName = document.getElementById('player1LastName').value.trim();
        const player2FirstName = document.getElementById('player2FirstName').value.trim();
        const player2LastName = document.getElementById('player2LastName').value.trim();
        
        if (!player1FirstName || !player1LastName || !player2FirstName || !player2LastName) {
            alert('Please enter both players\' names');
            return;
        }
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Payment method validation
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    // All validations passed - proceed to Step 2
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    updateProgress(2, 3);
}

// ========================================
// PROGRESS BAR
// ========================================

function updateProgress(step, total) {
    const percentage = (step / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `Step ${step} of ${total}`;
}

// ========================================
// PRIORITY ALERTS HANDLERS
// ========================================

document.getElementById('priorityAlertsCheckbox')?.addEventListener('change', function() {
    const detailsDiv = document.getElementById('priorityAlertsDetails');
    detailsDiv.style.display = this.checked ? 'block' : 'none';
});

// ========================================
// FORM SUBMISSION
// ========================================

async function submitForm(event) {
    event.preventDefault();
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');
    
    try {
        const formData = collectFormData();
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showConfirmation(formData);
        } else {
            throw new Error(result.error || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        loadingOverlay.classList.remove('active');
        alert('There was an error submitting your form. Please try again or contact support.');
    }
}

function collectFormData() {
    const selectedDate = window.availableDates[window.selectedDateIndex];
    const playerCount = document.querySelector('input[name="playerCount"]:checked').value;
    
    let names = '';
    if (playerCount === '1') {
        names = document.getElementById('playerName').value.trim();
    } else {
        const first1 = document.getElementById('player1FirstName').value.trim();
        const last1 = document.getElementById('player1LastName').value.trim();
        const first2 = document.getElementById('player2FirstName').value.trim();
        const last2 = document.getElementById('player2LastName').value.trim();
        names = `${first1} ${last1} & ${first2} ${last2}`;
    }
    
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    const priorityAlerts = document.getElementById('priorityAlertsCheckbox').checked;
    
    let vipChoice = priorityAlerts ? 'Yes - Priority Alerts' : 'No - Sunday Only';
    let homeCourt = '';
    let skillLevel = '';
    let bestDays = [];
    let bestTimes = [];
    
    if (priorityAlerts) {
        homeCourt = document.getElementById('homeCourt')?.value || '';
        skillLevel = document.querySelector('input[name="skillLevel"]:checked')?.value || '';
        
        const daysCheckboxes = document.querySelectorAll('input[name="bestDays"]:checked');
        bestDays = Array.from(daysCheckboxes).map(cb => cb.value);
        
        const timesCheckboxes = document.querySelectorAll('input[name="bestTimes"]:checked');
        bestTimes = Array.from(timesCheckboxes).map(cb => cb.value);
    }
    
    const paymentHours = 2;
    const paymentAmount = parseInt(playerCount) * 4;
    
    return {
        selectedGameDate: selectedDate.dateLong,
        selectedCourts: selectedDate.courts,
        names: names,
        phone: phone,
        email: email,
        timeSlot: ['7:00–8:00 PM', '8:00–9:00 PM'],
        paymentMethod: paymentMethod,
        paymentHours: paymentHours,
        paymentAmount: paymentAmount,
        vipChoice: vipChoice,
        homeCourt: homeCourt,
        skillLevel: skillLevel,
        bestDays: bestDays,
        bestTimes: bestTimes,
        priorityAlerts: priorityAlerts
    };
}

function showConfirmation(formData) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('active');
    
    document.getElementById('step2').style.display = 'none';
    
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    
    const confirmationDiv = document.getElementById('confirmation');
    confirmationDiv.style.display = 'block';
    
    const message = formData.priorityAlerts
        ? 'Welcome to Priority Alerts! Check your email for game details and payment instructions.'
        : 'Thanks for signing up! Check your email for game details and payment instructions.';
    
    document.getElementById('confirmationMessage').textContent = message;
}

function showError(message) {
    alert(message);
}

// Expose functions to global scope for HTML onclick handlers
window.selectDate = selectDate;
window.continueFromDateSelection = continueFromDateSelection;
window.goToStep2 = goToStep2;
window.submitForm = submitForm;
window.handlePhoneInput = handlePhoneInput;
