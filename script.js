// ========================================
// PICKLEBALL FORM LOGIC v2.1
// ✅ Phone Lookup & Auto-Fill
// ✅ Phoenix Partner Page
// ✅ All working features from v2.0
// ========================================

// ========================================
// CONFIGURATION
// ========================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBFmuf3MN6YDgqkMhONvFHtXeuw9yNAU_4PwtbBFGN7FlexBjbA6pz3VkoCSbwhkiK/exec';

// ========================================
// PHONE LOOKUP & AUTO-FILL
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
            window.playerLookupData = result;
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

            const emailField = document.getElementById('email');
            if (emailField && result.email) {
                emailField.value = result.email;
            }

            if (result.lastPaymentMethod) {
                setTimeout(() => {
                    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
                    paymentRadios.forEach(radio => {
                        if (radio.value === result.lastPaymentMethod) {
                            radio.checked = true;
                            if (typeof handlePaymentMethodChange === 'function') {
                                handlePaymentMethodChange({ target: radio });
                            }
                        }
                    });
                }, 100);
            }

        } else {
            window.playerLookupData = null;
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
        }
    } else if (playerCount === '2') {
        const player1FirstName = document.getElementById('player1FirstName');
        const player1LastName = document.getElementById('player1LastName');
        if (player1FirstName && lookupData.firstName) player1FirstName.value = lookupData.firstName;
        if (player1LastName && lookupData.lastName) player1LastName.value = lookupData.lastName;
    }

    const emailField = document.getElementById('email');
    if (emailField && lookupData.email && !emailField.value) {
        emailField.value = lookupData.email;
    }

    if (lookupData.lastPaymentMethod) {
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        let alreadySelected = false;
        paymentRadios.forEach(radio => { if (radio.checked) alreadySelected = true; });

        if (!alreadySelected) {
            paymentRadios.forEach(radio => {
                if (radio.value === lookupData.lastPaymentMethod) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
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
                        <rect x="15" y="25" width="70" height="60" rx="8" fill="#9B51E0" opacity="0.2"/>
                        <rect x="15" y="25" width="70" height="60" rx="8" fill="none" stroke="#9B51E0" stroke-width="3"/>
                        <rect x="15" y="25" width="70" height="18" rx="8" fill="#9B51E0"/>
                        <circle cx="30" cy="20" r="3" fill="#FFE500"/>
                        <circle cx="50" cy="20" r="3" fill="#FFE500"/>
                        <circle cx="70" cy="20" r="3" fill="#FFE500"/>
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

// ========================================
// DATE PICKER → PHOENIX PAGE
// ========================================

function goToStep1FromDatePicker() {
    if (window.selectedDateIndex === undefined) {
        alert('Please select a game date');
        return;
    }

    // Reset Phoenix page state before showing
    const yesCard = document.getElementById('phoenixYesCard');
    const noCard = document.getElementById('phoenixNoCard');
    const form = document.getElementById('phoenixMemberForm');
    const noRedirect = document.getElementById('phoenixNoRedirect');
    const progressFill = document.getElementById('phoenixProgressFill');

    if (yesCard) yesCard.classList.remove('selected');
    if (noCard) noCard.classList.remove('selected');
    if (form) form.style.display = 'none';
    if (noRedirect) noRedirect.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';

    document.getElementById('step0').style.display = 'none';
    document.getElementById('stepPhoenix').style.display = 'block';
    updateProgress(1, 3);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// PHOENIX PAGE FUNCTIONS
// ========================================

function handlePhoenixYes() {
    const yesCard = document.getElementById('phoenixYesCard');
    const noCard = document.getElementById('phoenixNoCard');
    const form = document.getElementById('phoenixMemberForm');
    const noRedirect = document.getElementById('phoenixNoRedirect');

    yesCard.classList.add('selected');
    noCard.classList.remove('selected');

    form.style.display = 'block';
    noRedirect.style.display = 'none';
}

function handlePhoenixNo() {
    const yesCard = document.getElementById('phoenixYesCard');
    const noCard = document.getElementById('phoenixNoCard');
    const form = document.getElementById('phoenixMemberForm');
    const noRedirect = document.getElementById('phoenixNoRedirect');
    const progressFill = document.getElementById('phoenixProgressFill');

    noCard.classList.add('selected');
    yesCard.classList.remove('selected');
    form.style.display = 'none';
    noRedirect.style.display = 'block';

    // Animate progress bar
    setTimeout(() => {
        if (progressFill) progressFill.style.width = '100%';
    }, 50);

    // Navigate to Step 1 after bar fills (1.6s)
    setTimeout(() => {
        document.getElementById('stepPhoenix').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        updateProgress(1, 3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
}

function goBackToDatePicker() {
    document.getElementById('stepPhoenix').style.display = 'none';
    document.getElementById('step0').style.display = 'block';
    updateProgress(0, 3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function submitPhoenixMember() {
    const name = document.getElementById('phoenixName').value.trim();
    if (!name) {
        alert('Please enter your full name');
        return;
    }

    const email = document.getElementById('phoenixEmail').value.trim();
    const selectedDate = window.availableDates[window.selectedDateIndex];

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');

    const formData = {
        names: name,
        email: email || '',
        phone: '',
        selectedGameDate: selectedDate.dateLong,
        selectedCourts: selectedDate.courts,
        playerCount: 1,
        paymentMethod: 'Phoenix - Invoiced Monthly',
        paymentAmount: 0,
        vipChoice: 'No',
        priorityAlerts: false,
        phoenixMember: true,
        note: 'Phoenix member'
    };

    // Show confirmation after 1 second
    setTimeout(() => {
        showPhoenixConfirmation(formData);
    }, 1000);

    // Submit to Google Apps Script in background
    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData),
        redirect: 'follow'
    }).then(() => {
        console.log('✅ Phoenix member saved');
    }).catch(error => {
        console.error('⚠️ Phoenix submit error:', error);
    });
}

function showPhoenixConfirmation(formData) {
    document.getElementById('loadingOverlay').classList.remove('active');

    updateProgress(3, 3);

    document.getElementById('step0').style.display = 'none';
    document.getElementById('stepPhoenix').style.display = 'none';
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';

    const confirmationDiv = document.getElementById('confirmation');
    confirmationDiv.style.display = 'block';
    confirmationDiv.classList.add('active');

    document.getElementById('confirmationMessage').innerHTML =
        `<strong style="color: #FF8888;">Phoenix Member — Welcome!</strong><br>See you on the court this Sunday! 🎾`;

    const emailElement = document.getElementById('confirmationEmail');
    if (emailElement) {
        emailElement.innerHTML = formData.email
            ? `We sent confirmation to: <strong style="color: #FFE500;">${formData.email}</strong>`
            : '';
    }

    document.getElementById('confirmationDetails').innerHTML = `
        <div style="background: rgba(204,0,0,0.1); padding: 24px; border-radius: 12px; margin: 20px 0; border: 2px solid rgba(204,0,0,0.4);">
            <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #FF6666;">📅 Your Game Details</h3>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Name:</strong> ${formData.names}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Game Date:</strong> ${formData.selectedGameDate}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Time:</strong> 7:00–9:00 PM</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Location:</strong> Plummer Park, West Hollywood</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>Payment:</strong> <span style="color: #00FF88; font-weight: 700;">Covered by The Phoenix ✓</span></p>
        </div>
        <div style="padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; font-style: italic; text-align: center; color: rgba(255,255,255,0.55); line-height: 1.8; font-size: 14px;">
            "Every player matters. Every life counts.<br>Every game ends with friends, no matter the score."
        </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// FORM EVENT LISTENERS
// ========================================

function setupFormEventListeners() {
    const playerCount1 = document.getElementById('playerCount1');
    const playerCount2 = document.getElementById('playerCount2');

    if (playerCount1) playerCount1.addEventListener('change', handlePlayerCountChange);
    if (playerCount2) playerCount2.addEventListener('change', handlePlayerCountChange);

    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    const priorityAlertsRadio = document.getElementById('priorityAlertsRadio');
    const sundayOnlyRadio = document.getElementById('sundayOnlyRadio');

    if (priorityAlertsRadio) priorityAlertsRadio.addEventListener('change', handleSignupTypeChange);
    if (sundayOnlyRadio) sundayOnlyRadio.addEventListener('change', handleSignupTypeChange);

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
                <input type="text" id="playerName" name="playerName" placeholder="First Last" required>
            </div>
        `;
    } else if (playerCount === '2') {
        nameFieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Player 1 (You) *</label>
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" id="player1FirstName" name="player1FirstName" placeholder="First Name" required>
                    </div>
                    <div class="form-group">
                        <input type="text" id="player1LastName" name="player1LastName" placeholder="Last Name" required>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Player 2 *</label>
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" id="player2FirstName" name="player2FirstName" placeholder="First Name" required>
                    </div>
                    <div class="form-group">
                        <input type="text" id="player2LastName" name="player2LastName" placeholder="Last Name" required>
                    </div>
                </div>
            </div>
        `;
    }

    setTimeout(() => { autoFillPlayerInfo(); }, 100);

    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedPaymentMethod) {
        handlePaymentMethodChange({ target: selectedPaymentMethod });
    }
}

function handleSignupTypeChange() {
    const priorityAlertsRadio = document.getElementById('priorityAlertsRadio');
    const detailsDiv = document.getElementById('priorityAlertsDetails');

    if (priorityAlertsRadio && priorityAlertsRadio.checked) {
        detailsDiv.style.display = 'block';
        document.getElementById('homeCourt').required = true;
        document.querySelectorAll('input[name="skillLevel"]').forEach(r => r.required = true);
    } else {
        detailsDiv.style.display = 'none';
        document.getElementById('homeCourt').required = false;
        document.querySelectorAll('input[name="skillLevel"]').forEach(r => r.required = false);
    }
}

function handlePaymentMethodChange(e) {
    const method = e.target.value;
    const playerCountElement = document.querySelector('input[name="playerCount"]:checked');
    const playerCount = playerCountElement ? playerCountElement.value : '1';
    const amount = parseInt(playerCount) * 4;

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

    const paymentDetails = document.getElementById('paymentDetails');
    const paymentInstructions = document.getElementById('paymentInstructions');

    if (paymentDetails) paymentDetails.innerHTML = instructions;
    if (paymentInstructions) paymentInstructions.style.display = 'block';
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
// STEP NAVIGATION
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
        if (!playerName) { alert('Please enter your name'); return; }
    } else if (playerCount === '2') {
        const p1f = document.getElementById('player1FirstName')?.value.trim();
        const p1l = document.getElementById('player1LastName')?.value.trim();
        const p2f = document.getElementById('player2FirstName')?.value.trim();
        const p2l = document.getElementById('player2LastName')?.value.trim();
        if (!p1f || !p1l || !p2f || !p2l) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    updateProgress(1, 3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        setTimeout(() => {
            showConfirmation(formData);
        }, 1000);

        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(formData),
            redirect: 'follow'
        }).then(() => {
            console.log('✅ Background save completed');
        }).catch(error => {
            console.error('⚠️ Background save error:', error);
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
    const vipChoice = priorityAlerts ? 'Yes - Priority Alerts' : 'No - Sunday Only';

    let homeCourt = '';
    let skillLevel = '';
    let bestDays = [];
    let bestTimes = [];

    if (priorityAlerts) {
        homeCourt = document.getElementById('homeCourt')?.value || '';
        skillLevel = document.querySelector('input[name="skillLevel"]:checked')?.value || '';
        bestDays = Array.from(document.querySelectorAll('input[name="bestDays"]:checked')).map(cb => cb.value);
        bestTimes = Array.from(document.querySelectorAll('input[name="bestTimes"]:checked')).map(cb => cb.value);
    }

    return {
        selectedGameDate: selectedDate.dateLong,
        selectedCourts: selectedDate.courts,
        names,
        phone,
        email,
        timeSlot: ['7:00–8:00 PM', '8:00–9:00 PM'],
        paymentMethod,
        paymentHours: 2,
        paymentAmount: parseInt(playerCount) * 4,
        vipChoice,
        homeCourt,
        skillLevel,
        bestDays,
        bestTimes,
        priorityAlerts,
        phoenixMember: false,
        note: ''
    };
}

function showConfirmation(formData) {
    document.getElementById('loadingOverlay').classList.remove('active');
    updateProgress(3, 3);

    document.getElementById('step0').style.display = 'none';
    document.getElementById('stepPhoenix').style.display = 'none';
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';

    const confirmationDiv = document.getElementById('confirmation');
    confirmationDiv.style.display = 'block';
    confirmationDiv.classList.add('active');

    const message = formData.priorityAlerts
        ? 'Welcome to Priority Alerts! You\'ll receive game notifications throughout the week.'
        : 'Thanks for signing up for this Sunday\'s game!';

    document.getElementById('confirmationMessage').textContent = message;

    const emailElement = document.getElementById('confirmationEmail');
    if (emailElement) {
        emailElement.innerHTML = `We sent confirmation to: <strong style="color: #FFE500;">${formData.email}</strong>`;
    }

    const timeSlots = Array.isArray(formData.timeSlot)
        ? formData.timeSlot.join(', ')
        : formData.timeSlot;

    document.getElementById('confirmationDetails').innerHTML = `
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// UTILITIES
// ========================================

function showError(message) { alert(message); }

function toggleDonationInfo() {
    const donationInfo = document.getElementById('donationInfo');
    if (donationInfo) {
        donationInfo.style.display = (donationInfo.style.display === 'none' || !donationInfo.style.display) ? 'block' : 'none';
    }
}

function showVenmoPayment() { handlePaymentMethodChange({ target: { value: 'Venmo' } }); }
function showZellePayment() { handlePaymentMethodChange({ target: { value: 'Zelle' } }); }

// ========================================
// GLOBAL EXPORTS
// ========================================

window.selectDate = selectDate;
window.goToStep1FromDatePicker = goToStep1FromDatePicker;
window.handlePhoenixYes = handlePhoenixYes;
window.handlePhoenixNo = handlePhoenixNo;
window.goBackToDatePicker = goBackToDatePicker;
window.submitPhoenixMember = submitPhoenixMember;
window.goToStep2 = goToStep2;
window.goToStep1 = goToStep1;
window.submitForm = submitForm;
window.handlePhoneInput = handlePhoneInput;
window.toggleDonationInfo = toggleDonationInfo;
window.showVenmoPayment = showVenmoPayment;
window.showZellePayment = showZellePayment;
