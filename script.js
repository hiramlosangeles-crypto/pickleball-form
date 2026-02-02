// ========================================
// PICKLEBALL FORM - COMPLETE SCRIPT v3.0
// With 3-Sunday Date Picker System
// ========================================

// ========================================
// CONFIGURATION
// ========================================

// ⚠️ IMPORTANT: Replace YOUR_DEPLOYMENT_ID with your actual Google Apps Script deployment ID
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// Store selected game data
let selectedGameData = null;

// ========================================
// DATE PICKER FUNCTIONS
// ========================================

// Load dates when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadGameDates();
    setupFormEventListeners();
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
// FORM NAVIGATION FUNCTIONS
// ========================================

function goToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    updateProgress(1, 3);
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
    const skillLevels = document.querySelectorAll('input[name="skillLevel"]');
    const bestDays = document.querySelectorAll('input[name="bestDays"]');
    const bestTimes = document.querySelectorAll('input[name="bestTimes"]');
    
    skillLevels.forEach(input => input.required = true);
    bestDays.forEach(input => input.required = true);
    bestTimes.forEach(input => input.required = true);
}

function makeVIPFieldsOptional() {
    document.getElementById('homeCourt').required = false;
    const skillLevels = document.querySelectorAll('input[name="skillLevel"]');
    const bestDays = document.querySelectorAll('input[name="bestDays"]');
    const bestTimes = document.querySelectorAll('input[name="bestTimes"]');
    
    skillLevels.forEach(input => input.required = false);
    bestDays.forEach(input => input.required = false);
    bestTimes.forEach(input => input.required = false);
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
        const homeCourt = document.getElementById('homeCourt').value;
        const skillLevel = document.querySelector('input[name="skillLevel"]:checked');
        const bestDays = document.querySelectorAll('input[name="bestDays"]:checked');
        const bestTimes = document.querySelectorAll('input[name="bestTimes"]:checked');
        
        if (!homeCourt || !skillLevel || bestDays.length === 0 || bestTimes.length === 0) {
            alert('Please fill in all VIP fields');
            return;
        }
    }
    
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
    
    // Show loading
    document.getElementById('loadingOverlay').style.display = 'flex';
    
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
        document.getElementById('loadingOverlay').style.display = 'none';
        alert('There was an error submitting your signup. Please try again or contact us directly.');
    }
}

function showConfirmation(formData) {
    // Hide loading
    document.getElementById('loadingOverlay').style.display = 'none';
    
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
    
    // Add confirmation details
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
        <p style="margin-top: 20px; font-size: 14px; color: rgba(255,255,255,0.7);">
            A confirmation email with payment details has been sent to ${formData.email}
        </p>
    `;
    
    document.getElementById('confirmationDetails').innerHTML = detailsHTML;
    
    // Scroll to top
    window.scrollTo(0, 0);
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
console.log('Pickleball Form Script v3.0 Loaded with Date Picker');
console.log('Script URL:', SCRIPT_URL);
