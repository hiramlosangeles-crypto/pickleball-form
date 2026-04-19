// ========================================
// PICKLEBALL FORM LOGIC v2.0 FINAL
// ✅ Phone Lookup & Auto-Fill
// ✅ All working features from old version
// ========================================

// ========================================
// CONFIGURATION
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBFmuf3MN6YDgqkMhONvFHtXeuw9yNAU_4PwtbBFGN7FlexBjbA6pz3VkoCSbwhkiK/exec';

// ========================================
// ✅ NEW: PHONE LOOKUP & AUTO-FILL
// ========================================

let playerLookupData = null;
let phoneDebounceTimer = null;

async function lookupPlayerByPhone(phone) {
    try {
        const formattedPhone = formatPhoneNumber(phone);
        const url = `${SCRIPT_URL}?action=lookupPhone&phone=${encodeURIComponent(formattedPhone)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Phone lookup error:', error);
        return { found: false };
    }
}

function formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return phone;
}

function handlePhoneInput(phoneInput) {
    clearTimeout(phoneDebounceTimer);
    
    const phone = phoneInput.value.trim();
    const messageDiv = document.getElementById('playerRecognitionMessage');
    
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
        playerLookupData = null;
        return;
    }
    
    phoneInput.value = formatPhoneNumber(phone);
    
    phoneDebounceTimer = setTimeout(async () => {
        const result = await lookupPlayerByPhone(phone);
        
        if (result.found) {
            // STORE player data globally
            window.playerLookupData = result;  // ← ADD window. prefix
            playerLookupData = result;
            
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
            
            // AUTO-FILL EMAIL IMMEDIATELY (it always exists)
            const emailField = document.getElementById('email');
            if (emailField && result.email) {
                emailField.value = result.email;
            }
            
            // AUTO-FILL PAYMENT METHOD if available
            if (result.lastPaymentMethod) {
                setTimeout(() => {
                    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
                    paymentRadios.forEach(radio => {
                        if (radio.value === result.lastPaymentMethod) {
                            radio.checked = true;
                            // Trigger payment details display
                            if (typeof handlePaymentMethodChange === 'function') {
                                handlePaymentMethodChange({ target: radio });
                            }
                        }
                    });
                }, 100);
            }
            
        } else {
            window.playerLookupData = null;  // ← ADD window. prefix
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

function autoFillPlayerInfo() {
    // Use global window.playerLookupData
    const lookupData = window.playerLookupData || playerLookupData;
    
    if (!lookupData || !lookupData.found) {
        console.log('No player data to autofill');
        return;
    }
    
    console.log('🔄 Autofilling player info:', lookupData);
    
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    
    if (playerCount === '1') {
        const nameField = document.getElementById('playerName');
        if (nameField) {
            nameField.value = lookupData.fullName || `${lookupData.firstName} ${lookupData.lastName}`.trim();
            console.log('✅ Filled single player name:', nameField.value);
        }
    } else if (playerCount === '2') {
        const player1FirstName = document.getElementById('player1FirstName');
        const player1LastName = document.getElementById('player1LastName');
        
        if (player1FirstName && lookupData.firstName) {
            player1FirstName.value = lookupData.firstName;
            console.log('✅ Filled player 1 first name');
        }
        if (player1LastName && lookupData.lastName) {
            player1LastName.value = lookupData.lastName;
            console.log('✅ Filled player 1 last name');
        }
    }
    
    // EMAIL - fill if not already filled
    const emailField = document.getElementById('email');
    if (emailField && lookupData.email && !emailField.value) {
        emailField.value = lookupData.email;
        console.log('✅ Filled email');
    }
    
    // PAYMENT METHOD - fill if not already selected
    if (lookupData.lastPaymentMethod) {
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        let alreadySelected = false;
        paymentRadios.forEach(radio => {
            if (radio.checked) alreadySelected = true;
        });
        
        if (!alreadySelected) {
            paymentRadios.forEach(radio => {
                if (radio.value === lookupData.lastPaymentMethod) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                    console.log('✅ Selected payment method:', lookupData.lastPaymentMethod);
                }
            });
        }
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
    const container = document.getElementById('dateChoiceContainer');
    if (!container) {
        console.error('dateChoiceContainer not found');
        return;
    }
    
    container.innerHTML = '';
    
    sundays.forEach((sunday, index) => {
        const card = document.createElement('div');
        card.className = 'date-card' + (sunday.isAvailable ? '' : ' date-card-full');
        
        if (sunday.isAvailable) {
            card.onclick = () => selectDate(index);
        }
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; padding: 4px;">
                <div class="date-card-icon" style="flex-shrink: 0;">
                    <svg width="70" height="70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Calendar background -->
    <rect x="15" y="25" width="70" height="60" rx="8" fill="#9B51E0" opacity="0.2"/>
    <rect x="15" y="25" width="70" height="60" rx="8" fill="none" stroke="#9B51E0" stroke-width="3"/>
    
    <!-- Calendar header -->
    <rect x="15" y="25" width="70" height="18" rx="8" fill="#9B51E0"/>
    
    <!-- Binding rings -->
    <circle cx="30" cy="20" r="3" fill="#FFE500"/>
    <circle cx="50" cy="20" r="3" fill="#FFE500"/>
    <circle cx="70" cy="20" r="3" fill="#FFE500"/>
    
    <!-- SUN text -->
    <text x="50" y="62" text-anchor="middle" font-size="22" font-weight="900" fill="#FFE500">SUN</text>
</svg>
                </div>
                <div class="date-card-body" style="flex: 1;">
                    <div class="date-card-date" style="font-size: 20px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 6px;">
                        ${sunday.dateLong}
                        ${sunday.statusLabel ? `<span style="display: inline-block; background: ${sunday.isAvailable ? 'rgba(255, 229, 0, 0.25)' : 'rgba(255, 0, 0, 0.2)'}; color: ${sunday.isAvailable ? '#FFE500' : '#FF0000'}; padding: ${sunday.statusLabel === 'FULL' ? '8px 20px' : '6px 14px'}; border-radius: 8px; font-size: ${sunday.statusLabel === 'FULL' ? '20px' : '15px'}; margin-left: 10px; font-weight: ${sunday.statusLabel === 'FULL' ? '900' : '700'}; letter-spacing: ${sunday.statusLabel === 'FULL' ? '1px' : '0'};">${sunday.statusLabel}</span>` : ''}
                    </div>
                    <div class="date-card-time" style="font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.95); margin-bottom: 4px;">
                        ⏰ ${sunday.time}
                    </div>
                    ${sunday.timeAlert ? `
                    <div class="date-card-alert" style="background: linear-gradient(135deg, rgba(255, 107, 0, 0.3), rgba(255, 165, 0, 0.2)); border: 2px solid #FF6B00; border-radius: 8px; padding: 10px 12px; margin: 8px 0; animation: pulse 2s ease-in-out infinite;">
                        <div style="font-size: 13px; font-weight: 800; color: #FFA500; line-height: 1.4;">
                            ${sunday.timeAlert}
                        </div>
                    </div>
                    ` : ''}
                    <div class="date-card-location" style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8);">
                        📍 ${sunday.location}
                    </div>
                    <div class="date-card-courts" style="font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7); margin-top: 2px;">
                        Courts ${sunday.courts}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    window.availableDates = sundays;
}
function selectDate(index) {
    const selectedSunday = window.availableDates[index];
    
    // Prevent selection if date is full
    if (!selectedSunday.isAvailable) {
        alert('Sorry, this date is currently full. Please select another date.');
        return;
    }
    
    document.querySelectorAll('.date-card').forEach((card, i) => {
        card.classList.toggle('selected', i === index);
    });
    
    window.selectedDateIndex = index;
    
    const continueBtn = document.getElementById('datePickerContinue');
    if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.style.opacity = '1';
        continueBtn.style.cursor = 'pointer';
    }
}
function goToStep1FromDatePicker() {
    if (window.selectedDateIndex === undefined) {
        alert('Please select a game date');
        return;
    }
    
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    updateProgress(1, 3);
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========================================
// FORM EVENT LISTENERS
// ========================================

function setupFormEventListeners() {
    const playerCount1 = document.getElementById('playerCount1');
    const playerCount2 = document.getElementById('playerCount2');
    
    if (playerCount1) {
        playerCount1.addEventListener('change', handlePlayerCountChange);
        console.log('✅ Player count 1 listener attached');
    }
    if (playerCount2) {
        playerCount2.addEventListener('change', handlePlayerCountChange);
        console.log('✅ Player count 2 listener attached');
    }
    
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // NEW: Priority Alerts radio listeners
    const priorityAlertsRadio = document.getElementById('priorityAlertsRadio');
    const sundayOnlyRadio = document.getElementById('sundayOnlyRadio');
    
    if (priorityAlertsRadio) {
        priorityAlertsRadio.addEventListener('change', handleSignupTypeChange);
    }
    if (sundayOnlyRadio) {
        sundayOnlyRadio.addEventListener('change', handleSignupTypeChange);
    }
    
    console.log('✅ Form event listeners setup complete');
}

function handlePlayerCountChange() {
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    const nameFieldsContainer = document.getElementById('nameFieldsContainer');
    
    if (!nameFieldsContainer) return;
    
    if (playerCount === '1') {
        nameFieldsContainer.innerHTML = `
            <div class="form-group">
                <label for="playerName">Your Name *</label>
                <input 
                    type="text" 
                    id="playerName" 
                    name="playerName" 
                    placeholder="First Last"
                    required
                >
            </div>
        `;
    } else if (playerCount === '2') {
        nameFieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Player 1 (You) *</label>
                <div class="form-row">
                    <div class="form-group">
                        <input 
                            type="text" 
                            id="player1FirstName" 
                            name="player1FirstName" 
                            placeholder="First Name"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <input 
                            type="text" 
                            id="player1LastName" 
                            name="player1LastName" 
                            placeholder="Last Name"
                            required
                        >
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Player 2 *</label>
                <div class="form-row">
                    <div class="form-group">
                        <input 
                            type="text" 
                            id="player2FirstName" 
                            name="player2FirstName" 
                            placeholder="First Name"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <input 
                            type="text" 
                            id="player2LastName" 
                            name="player2LastName" 
                            placeholder="Last Name"
                            required
                        >
                    </div>
                </div>
            </div>
        `;
    }
    
     // CRITICAL: Call autofill AFTER fields are created
    setTimeout(() => {
        console.log('⏰ Calling autoFillPlayerInfo after timeout');
        autoFillPlayerInfo();
    }, 100);
    
    // NEW: Update payment amount if payment method already selected
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedPaymentMethod) {
        console.log('🔄 Updating payment display after player count change');
        handlePaymentMethodChange({ target: selectedPaymentMethod });
    }
}

function handleSignupTypeChange() {
    const priorityAlertsRadio = document.getElementById('priorityAlertsRadio');
    const detailsDiv = document.getElementById('priorityAlertsDetails');
    
    if (priorityAlertsRadio && priorityAlertsRadio.checked) {
        detailsDiv.style.display = 'block';
        
        // Make fields required
        document.getElementById('homeCourt').required = true;
        const skillRadios = document.querySelectorAll('input[name="skillLevel"]');
        skillRadios.forEach(radio => radio.required = true);
        
    } else {
        detailsDiv.style.display = 'none';
        
        // Make fields optional
        document.getElementById('homeCourt').required = false;
        const skillRadios = document.querySelectorAll('input[name="skillLevel"]');
        skillRadios.forEach(radio => radio.required = false);
    }
}
function handlePaymentMethodChange(e) {
    const method = e.target.value;
    
    // Get player count - default to 1 if not selected yet
    const playerCountElement = document.querySelector('input[name="playerCount"]:checked');
    const playerCount = playerCountElement ? playerCountElement.value : '1';
    const amount = parseInt(playerCount) * 4;
    
    console.log('💳 Payment method changed:', method);
    console.log('👥 Player count:', playerCount);
    console.log('💵 Amount:', amount);
    
    let instructions = '';
    
    if (method === 'Venmo') {
        instructions = `
            <div class="payment-method-details">
                <h4 style="color: #00D9FF; margin-bottom: 12px;">💳 Pay with Venmo</h4>
                <p><strong>Venmo:</strong> @Steven-Bettencourt-4</p>
                <p style="margin-top: 12px;">
                    <a href="https://venmo.com/Steven-Bettencourt-4" 
   target="_blank"
   rel="noopener noreferrer"
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
    }
    
    const paymentInstructions = document.getElementById('paymentInstructions');
    const paymentDetails = document.getElementById('paymentDetails');
    
    if (paymentDetails) {
        paymentDetails.innerHTML = instructions;
    }
    
    if (paymentInstructions) {
        paymentInstructions.style.display = 'block';
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
// VALIDATION
// ========================================

function goToStep2() {
    const phone = document.getElementById('phone').value.trim();
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    const playerCount = document.querySelector('input[name="playerCount"]:checked')?.value;
    if (!playerCount) {
        alert('Please select how many people are playing');
        return;
    }
    
    if (playerCount === '1') {
        const playerName = document.getElementById('playerName')?.value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
    } else if (playerCount === '2') {
        const player1FirstName = document.getElementById('player1FirstName')?.value.trim();
        const player1LastName = document.getElementById('player1LastName')?.value.trim();
        const player2FirstName = document.getElementById('player2FirstName')?.value.trim();
        const player2LastName = document.getElementById('player2LastName')?.value.trim();
        
        if (!player1FirstName || !player1LastName || !player2FirstName || !player2LastName) {
            alert('Please enter both players\' names');
            return;
        }
    }
    
    const email = document.getElementById('email').value.trim();
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    updateProgress(2, 3);
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function goToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    updateProgress(1, 3);
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
// PRIORITY ALERTS
// ========================================

// ========================================
// FORM SUBMISSION
// ========================================

async function submitForm(event) {
    event.preventDefault();
    
    console.log('🔵 Form submission started');
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');
    
    try {
        const formData = collectFormData();
        
        console.log('📦 Form data collected:', formData);
        
        // Show confirmation after 1 second (don't wait for Google)
        setTimeout(() => {
            showConfirmation(formData);
        }, 1000);
        
        // Submit to Google Apps Script in background (don't wait)
        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(formData),
            redirect: 'follow'
        }).then(response => {
            console.log('✅ Background save completed');
        }).catch(error => {
            console.error('⚠️ Background save error (data likely saved anyway):', error);
        });
        
    } catch (error) {
        console.error('❌ SUBMISSION ERROR:', error);
        loadingOverlay.classList.remove('active');
        alert('There was an error submitting your form. Please try again.');
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
    
   const signupType = document.querySelector('input[name="signupType"]:checked')?.value;
const priorityAlerts = (signupType === 'priority-alerts');

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
    // Hide loading
    document.getElementById('loadingOverlay').classList.remove('active');

    // UPDATE PROGRESS BAR TO STEP 3 OF 3
    updateProgress(3, 3);
    
    // Hide all steps
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    
    // Show confirmation
    const confirmationDiv = document.getElementById('confirmation');
    confirmationDiv.style.display = 'block';
    confirmationDiv.classList.add('active');
    
    // Update confirmation message
    const message = formData.priorityAlerts
        ? 'Welcome to Priority Alerts! You\'ll receive game notifications throughout the week.'
        : 'Thanks for signing up for this Sunday\'s game!';
    
    document.getElementById('confirmationMessage').textContent = message;
    
    // Show email address prominently (if element exists)
    const emailElement = document.getElementById('confirmationEmail');
    if (emailElement) {
        emailElement.innerHTML = `
            We sent confirmation to: <strong style="color: #FFE500;">${formData.email}</strong>
        `;
    }
    
    // Add confirmation details
    const timeSlots = Array.isArray(formData.timeSlot) 
        ? formData.timeSlot.join(', ') 
        : formData.timeSlot;
    
    const detailsHTML = `
        <div style="background: rgba(155, 81, 224, 0.1); padding: 24px; border-radius: 12px; margin: 20px 0; border: 2px solid rgba(155, 81, 224, 0.3);">
            <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #D946EF;">📅 Your Game Details</h3>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Name:</strong> ${formData.names}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Game Date:</strong> ${formData.selectedGameDate}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Time:</strong> ${timeSlots}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Courts:</strong> COURTS ${formData.selectedCourts}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Payment Method:</strong> ${formData.paymentMethod}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Amount Due:</strong> $${formData.paymentAmount}</p>
        </div>
        
        <div style="background: rgba(255, 107, 0, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B00;">
            <p style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.9);">
                ⚠️ <strong>Remember:</strong> Your spot is pending until payment is verified. Please complete your payment within 24 hours.
            </p>
        </div>
    `;
    
    document.getElementById('confirmationDetails').innerHTML = detailsHTML;
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showError(message) {
    alert(message);
}

function toggleDonationInfo() {
    const donationInfo = document.getElementById('donationInfo');
    if (donationInfo) {
        if (donationInfo.style.display === 'none' || !donationInfo.style.display) {
            donationInfo.style.display = 'block';
        } else {
            donationInfo.style.display = 'none';
        }
    }
}

function showVenmoPayment() {
    handlePaymentMethodChange({ target: { value: 'Venmo' } });
}

function showZellePayment() {
    handlePaymentMethodChange({ target: { value: 'Zelle' } });
}


// Expose functions to global scope
window.selectDate = selectDate;
window.goToStep1FromDatePicker = goToStep1FromDatePicker;
window.goToStep2 = goToStep2;
window.goToStep1 = goToStep1;
window.submitForm = submitForm;
window.handlePhoneInput = handlePhoneInput;
window.toggleDonationInfo = toggleDonationInfo;
window.showVenmoPayment = showVenmoPayment;
window.showZellePayment = showZellePayment;

