// ========================================
// PICKLEBALL FORM - COMPLETE SCRIPT v3.1 UPDATED
// With 3-Sunday Date Picker System
// ALL FIXES APPLIED
// ========================================

// ========================================
// CONFIGURATION
// ========================================

// ⚠️ IMPORTANT: Replace YOUR_DEPLOYMENT_ID with your actual Google Apps Script deployment ID
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4LseN1EdsVjG-4gzyAkmEYhO1_7kpP2ghQOYrd75qkql-NmJ6VQu3DBI8B6995FAI/exec';

// Store selected game data
let selectedGameData = null;

// ========================================
// DATE PICKER FUNCTIONS
// ========================================

// Load dates when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadGameDates();
    setupFormEventListeners();
    setupPhoneFormatting();  // ✅ FIX #8: Phone formatting
});

async function loadGameDates() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getNext3Sundays`);
        const data = await response.json();
        
        if (data.success) {
            displayGameDates(data.sundays);
        } else {
            showDateLoadError('Failed to load game dates');
        }
    } catch (error) {
        console.error('Error loading dates:', error);
        showDateLoadError('Unable to load game dates. Please refresh the page.');
    }
}

function displayGameDates(sundays) {
    const container = document.getElementById('dateChoiceContainer');
    
    const html = sundays.map((sunday, index) => `
        <label class="date-card" data-index="${index}">
            <input type="radio" name="gameDate" value="${sunday.dateKey}" data-index="${index}">
            <div class="date-card-content">
                <div class="date-icon">📅</div>
                <div class="date-details">
                    <div class="date-title">${sunday.dateLong}</div>
                    <div class="date-info">
                        <div class="date-info-row">
                            <span class="date-info-icon">🕖</span>
                            <span>${sunday.time}</span>
                        </div>
                        <div class="date-info-row">
                            <span class="date-info-icon">📍</span>
                            <span>${sunday.location} • Courts ${sunday.courts}</span>
                        </div>
                    </div>
                </div>
            </div>
        </label>
    `).join('');
    
    container.innerHTML = html;
    
    // Store sunday data globally
    window.sundayDates = sundays;
    
    // Add click handlers to date cards
    document.querySelectorAll('.date-card').forEach((card, index) => {
        card.addEventListener('click', () => selectDate(index));
    });
}

function selectDate(index) {
    // Remove selected class from all cards
    document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    const cards = document.querySelectorAll('.date-card');
    cards[index].classList.add('selected');
    
    // Check the radio button
    const radio = cards[index].querySelector('input[type="radio"]');
    radio.checked = true;
    
    // Store selected game data
    selectedGameData = window.sundayDates[index];
    
    // Enable continue button
    document.getElementById('datePickerContinue').disabled = false;
}

function goToStep1FromDatePicker() {
    if (!selectedGameData) {
        alert('Please select a game date');
        return;
    }
    
    // Update Step 1 with selected date
    updateStep1WithSelectedDate();
    
    // Hide Step 0, show Step 1
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step1').classList.add('active');
    
    // Update progress bar
    updateProgress(1, 3);
    
    // ✅ FIX #9: Prevent URL flash - use replaceState instead of pushState
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
    }
}

function updateStep1WithSelectedDate() {
    // Update the game details subtitle in Step 1
    const subtitle = document.querySelector('#step1 .step-subtitle');
    if (subtitle) {
        subtitle.innerHTML = `
            Sign up for this Sunday's Pickleball! Steven will organize the games and match you with players.
            <br><br>
            <strong style="color: #FFE500; font-size: 18px;">
                ${selectedGameData.dateLong} • ${selectedGameData.time}<br>
                ${selectedGameData.location} · COURTS ${selectedGameData.courts}
            </strong>
        `;
    }
}

function showDateLoadError(message) {
    const container = document.getElementById('dateChoiceContainer');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">${message}</p>
            <button onclick="loadGameDates()" class="btn btn-secondary">Try Again</button>
        </div>
    `;
}

// ========================================
// PHONE NUMBER FORMATTING
// ✅ FIX #8: US Phone Number Formatting (XXX) XXX-XXXX
// ========================================

function setupPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
        phoneInput.addEventListener('keydown', handlePhoneKeydown);
    }
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length === 0) {
        e.target.value = '';
        return;
    }
    
    // Format as (XXX) XXX-XXXX
    if (value.length <= 3) {
        e.target.value = `(${value}`;
    } else if (value.length <= 6) {
        e.target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
        e.target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
}

function handlePhoneKeydown(e) {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 13, 27, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
    }
    
    // Prevent input if not a number
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

// ========================================
// FORM NAVIGATION FUNCTIONS
// ========================================

function goToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    updateProgress(1, 3);
    scrollToTop();
}

function goToStep2() {
    // Validate Step 1 fields
    const names = document.getElementById('names').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const timeSlots = document.querySelectorAll('input[name="timeSlot"]:checked');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!names || !phone || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (timeSlots.length === 0) {
        alert('Please select at least one time slot');
        return;
    }
    
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    // Hide Step 1, show Step 2
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    updateProgress(2, 3);
    scrollToTop();
}

function updateProgress(step, total) {
    const percentage = (step / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `Step ${step} of ${total}`;
}

// ========================================
// VIP CHOICE HANDLERS
// ========================================

function setupFormEventListeners() {
    // VIP choice handlers
    const vipYes = document.getElementById('vipYes');
    const vipNo = document.getElementById('vipNo');
    
    if (vipYes) {
        vipYes.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('vipDetails').style.display = 'block';
                makeVIPFieldsRequired();
            }
        });
    }
    
    if (vipNo) {
        vipNo.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('vipDetails').style.display = 'none';
                makeVIPFieldsOptional();
            }
        });
    }
}

function makeVIPFieldsRequired() {
    document.getElementById('homeCourt').required = true;
    // Note: Checkboxes can't use required attribute properly
    // Validation happens in handleFormSubmit instead
}

function makeVIPFieldsOptional() {
    document.getElementById('homeCourt').required = false;
    // No need to set required on checkboxes
}

// ========================================
// PAYMENT METHOD HANDLERS
// ========================================

function showVenmoPayment() {
    const instructions = `
        <div class="payment-method-details">
            <h4 style="color: #00D9FF; margin-bottom: 12px;">💳 Pay with Venmo</h4>
            <p><strong>Venmo:</strong> @Steven-Bettencourt-4</p>
            <p style="margin-top: 8px; font-size: 14px; color: rgba(255,255,255,0.7);">
                After submitting this form, you'll receive a confirmation email with a direct Venmo payment link.
            </p>
        </div>
    `;
    document.getElementById('paymentDetails').innerHTML = instructions;
    document.getElementById('paymentInstructions').style.display = 'block';
}

function showZellePayment() {
    const instructions = `
        <div class="payment-method-details">
            <h4 style="color: #00D9FF; margin-bottom: 12px;">🏦 Pay with Zelle</h4>
            <p><strong>Zelle:</strong> (310) 433-8281</p>
            <p><strong>or</strong> bettencourtdesign@me.com</p>
            <p style="margin-top: 8px; font-size: 14px; color: rgba(255,255,255,0.7);">
                Send payment through your bank's Zelle feature to either the phone number or email above.
            </p>
        </div>
    `;
    document.getElementById('paymentDetails').innerHTML = instructions;
    document.getElementById('paymentInstructions').style.display = 'block';
}

function showCashPayment() {
    const instructions = `
        <div class="payment-method-details">
            <h4 style="color: #00D9FF; margin-bottom: 12px;">💵 Pay with Cash</h4>
            <p>Pay in person at the court before the game starts.</p>
            <p style="margin-top: 8px; font-size: 14px; color: rgba(255,255,255,0.7);">
                Please arrive a few minutes early to complete your payment.
            </p>
        </div>
    `;
    document.getElementById('paymentDetails').innerHTML = instructions;
    document.getElementById('paymentInstructions').style.display = 'block';
}

function toggleDonationInfo() {
    const info = document.getElementById('donationInfo');
    if (info.style.display === 'none') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}

// ========================================
// FORM SUBMISSION
// ✅ FIX #2: VIP Submission Bug Fix
// ✅ FIX #4: Loading Spinner Restored
// ========================================

// Setup form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pickleballForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate we have a selected game date
    if (!selectedGameData) {
        alert('Please select a game date');
        return;
    }
    
    // Validate VIP fields if VIP selected
    const vipChoice = document.querySelector('input[name="vipChoice"]:checked')?.value;
    
    if (vipChoice === 'Yes - VIP Network') {
        const homeCourt = document.getElementById('homeCourt').value.trim();
        const skillLevel = document.querySelector('input[name="skillLevel"]:checked');
        const bestDays = document.querySelectorAll('input[name="bestDays"]:checked');
        const bestTimes = document.querySelectorAll('input[name="bestTimes"]:checked');
        
        // Check each required field
        if (!homeCourt) {
            alert('Please enter your Home Court / City');
            return;
        }
        if (!skillLevel) {
            alert('Please select your Skill Level');
            return;
        }
        if (bestDays.length === 0) {
            alert('Please select at least one Best Day');
            return;
        }
        if (bestTimes.length === 0) {
            alert('Please select at least one Best Time');
            return;
        }
    }
    
    // ✅ FIX #4: Show loading spinner & disable submit button
    const loadingOverlay = document.getElementById('loadingOverlay');
    const submitBtn = document.getElementById('submitBtn');
    
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
    
    // Collect all form data
    const formData = {
        // Selected game date from Step 0
        selectedGameDate: selectedGameData.dateLong,
        selectedCourts: 'COURTS ' + selectedGameData.courts,
        selectedDateKey: selectedGameData.dateKey,
        
        // User info from Step 1
        names: document.getElementById('names').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        
        // Time slots
        timeSlot: Array.from(document.querySelectorAll('input[name="timeSlot"]:checked'))
            .map(cb => cb.value),
        
        // Payment method
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        
        // VIP choice from Step 2
        vipChoice: vipChoice || 'No - Sunday Only',
        
        // VIP details (if selected)
        homeCourt: document.getElementById('homeCourt')?.value || '',
        skillLevel: document.querySelector('input[name="skillLevel"]:checked')?.value || '',
        bestDays: Array.from(document.querySelectorAll('input[name="bestDays"]:checked'))
            .map(cb => cb.value),
        bestTimes: Array.from(document.querySelectorAll('input[name="bestTimes"]:checked'))
            .map(cb => cb.value)
    };
    
    // Submit to Google Apps Script
    submitToGoogleScript(formData);
}

async function submitToGoogleScript(formData) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Note: no-cors mode doesn't let us read the response
        // So we assume success if no error is thrown
        showConfirmation(formData);
        
    } catch (error) {
        console.error('Submission error:', error);
        const loadingOverlay = document.getElementById('loadingOverlay');
        const submitBtn = document.getElementById('submitBtn');
        
        loadingOverlay.classList.remove('active');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        
        alert('There was an error submitting your signup. Please try again or contact us directly.');
    }
}

// ✅ FIX #5: Enhanced Confirmation Message Emphasis
function showConfirmation(formData) {
    // Hide loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('active');
    
    // Hide Step 2
    document.getElementById('step2').style.display = 'none';
    
    // Show confirmation
    const confirmationDiv = document.getElementById('confirmation');
    confirmationDiv.style.display = 'block';
    
    // Update confirmation message
    const message = formData.vipChoice === 'Yes - VIP Network'
        ? 'Welcome to the VIP Network! Check your email for game details and payment instructions.'
        : 'Thanks for signing up! Check your email for game details and payment instructions.';
    
    document.getElementById('confirmationMessage').textContent = message;
    
    // Add confirmation details with ENHANCED email emphasis
    const timeSlots = Array.isArray(formData.timeSlot) 
        ? formData.timeSlot.join(', ') 
        : formData.timeSlot;
    
    const detailsHTML = `
        <div style="background: rgba(155, 81, 224, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${formData.names}</p>
            <p style="margin: 8px 0;"><strong>Game Date:</strong> ${formData.selectedGameDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${timeSlots}</p>
            <p style="margin: 8px 0;"><strong>Courts:</strong> ${formData.selectedCourts}</p>
            <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${formData.paymentMethod}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 229, 0, 0.2)); 
                    border: 3px solid #FFE500; 
                    padding: 24px; 
                    border-radius: 12px; 
                    margin: 24px 0;
                    box-shadow: 0 8px 24px rgba(255, 229, 0, 0.3);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 32px;">📧</span>
                <h3 style="margin: 0; color: #FFE500; font-size: 20px; font-weight: 800;">CHECK YOUR EMAIL</h3>
            </div>
            <p style="margin: 8px 0; font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.6;">
                A confirmation email with payment details has been sent to:<br>
                <span style="color: #FFE500; font-size: 18px;">${formData.email}</span>
            </p>
            <p style="margin: 16px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 600;">
                ⚠️ <strong>Payment is required within 24 hours to secure your Sunday spot.</strong>
            </p>
        </div>
    `;
    
    document.getElementById('confirmationDetails').innerHTML = detailsHTML;
    
    // Scroll to top
    scrollToTop();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Scroll to top helper
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Log for debugging
console.log('Pickleball Form Script v3.1 UPDATED - All Fixes Applied');
console.log('Script URL:', SCRIPT_URL);
