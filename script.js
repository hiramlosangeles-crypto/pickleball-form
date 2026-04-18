// ===================================
// CONFIGURATION
// ===================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8LaPCSEaU54WUfVW7Ko4g08qBZJuDO4Ah_9rV-P0QIgJSwxHRk24Dwd7uQJwp_2Ds/exec';

// ===================================
// STATE MANAGEMENT
// ===================================

let currentStep = 0;
let selectedGameDate = null;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupVIPChoiceListener();
    loadGameDates();
});

function initializeForm() {
    updateProgressBar();
    document.getElementById('pickleballForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// ===================================
// PROGRESS BAR
// ===================================

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (currentStep === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = 'Step 0 of 3';
    } else if (currentStep === 1) {
        progressFill.style.width = '50%';
        progressText.textContent = 'Step 1 of 3';
    } else if (currentStep === 2) {
        progressFill.style.width = '100%';
        progressText.textContent = 'Step 2 of 3';
    }
}

// ===================================
// STEP 0: LOAD GAME DATES
// ===================================

function loadGameDates() {
    const container = document.getElementById('dateChoiceContainer');

    fetch(SCRIPT_URL + '?action=getGameDates')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.dates && data.dates.length > 0) {
                renderDateCards(data.dates);
            } else {
                container.innerHTML = '<p style="text-align:center; color: rgba(255,255,255,0.6); padding: 40px 0;">No upcoming games found. Check back soon!</p>';
            }
        })
        .catch(err => {
            console.error('Failed to load game dates:', err);
            container.innerHTML = '<p style="text-align:center; color: rgba(255,100,100,0.8); padding: 40px 0;">Could not load game dates. Please refresh the page.</p>';
        });
}

function renderDateCards(dates) {
    const container = document.getElementById('dateChoiceContainer');
    container.innerHTML = '';

    dates.forEach((game, index) => {
        const isFull = game.spotsLeft <= 0;
        const card = document.createElement('div');
        card.className = 'date-card' + (isFull ? ' date-card-full' : '');
        card.dataset.index = index;

        const spotsLabel = isFull
            ? '<span style="background: #FF0000; color: #fff; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px;">FULL</span>'
            : `<span style="background: rgba(255,229,0,0.15); color: #FFE500; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(255,229,0,0.4);">${game.spotsLeft} spot${game.spotsLeft !== 1 ? 's' : ''} left</span>`;

        const alertHTML = game.alert
            ? `<div style="margin-top: 10px; padding: 10px 14px; background: rgba(255,140,0,0.15); border: 1px solid rgba(255,140,0,0.5); border-radius: 10px; font-size: 13px; color: #FFA500; font-weight: 600;">⚠️ ${game.alert}</div>`
            : '';

        card.innerHTML = `
            <input type="radio" name="gameDate" value="${game.dateLabel}" style="position:absolute;opacity:0;">
            <div class="date-card-content">
                <div class="date-icon">
                    <div style="background: #6B3FA0; border-radius: 10px; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-size: 11px; font-weight: 800; color: #fff; line-height: 1.1;">
                        <span style="font-size: 9px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">SUN</span>
                        <span style="font-size: 22px;">📅</span>
                    </div>
                </div>
                <div class="date-details">
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span class="date-title">${game.dateLabel}</span>
                        ${spotsLabel}
                    </div>
                    <div class="date-info">
                        <div class="date-info-row"><span class="date-info-icon">⏰</span><span>${game.timeRange}</span></div>
                        <div class="date-info-row"><span class="date-info-icon">📍</span><span>${game.location || 'PLUMMER PARK'}</span></div>
                        ${game.courts ? `<div class="date-info-row"><span class="date-info-icon">🎾</span><span>${game.courts}</span></div>` : '<div class="date-info-row" style="color: rgba(255,255,255,0.4);"><span class="date-info-icon">🎾</span><span>Courts TBD</span></div>'}
                    </div>
                    ${alertHTML}
                </div>
            </div>
        `;

        if (!isFull) {
            card.addEventListener('click', () => selectDateCard(card, game));
        }

        container.appendChild(card);
    });
}

function selectDateCard(selectedCard, game) {
    // Deselect all cards
    document.querySelectorAll('.date-card').forEach(c => c.classList.remove('selected'));

    // Select this card
    selectedCard.classList.add('selected');
    selectedGameDate = game;

    // Enable continue button
    const btn = document.getElementById('datePickerContinue');
    btn.disabled = false;
}

function goToStep1FromDatePicker() {
    if (!selectedGameDate) {
        alert('Please select a game date first!');
        return;
    }

    // Update Step 1 subtitle with selected date
    const subtitle = document.getElementById('step1Subtitle');
    if (subtitle) {
        subtitle.textContent = `Signing up for ${selectedGameDate.dateLabel} · ${selectedGameDate.timeRange} at ${selectedGameDate.location || 'Plummer Park'}`;
    }

    // Hide Step 0, show Step 1
    document.getElementById('step0').classList.remove('active');
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step1').classList.add('active');

    currentStep = 1;
    updateProgressBar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// VIP CHOICE LOGIC
// ===================================

function setupVIPChoiceListener() {
    const vipYes = document.getElementById('vipYes');
    const vipNo = document.getElementById('vipNo');
    const vipDetails = document.getElementById('vipDetails');

    vipYes.addEventListener('change', function() {
        if (this.checked) {
            vipDetails.style.display = 'block';
            makeVIPFieldsRequired(true);
        }
    });

    vipNo.addEventListener('change', function() {
        if (this.checked) {
            vipDetails.style.display = 'none';
            makeVIPFieldsRequired(false);
            clearVIPFields();
        }
    });
}

function makeVIPFieldsRequired(required) {
    const homeCourt = document.getElementById('homeCourt');
    if (required) {
        homeCourt.setAttribute('required', 'required');
    } else {
        homeCourt.removeAttribute('required');
    }
}

function clearVIPFields() {
    document.getElementById('homeCourt').value = '';
    document.querySelectorAll('input[name="skillLevel"]').forEach(i => i.checked = false);
    document.querySelectorAll('input[name="bestDays"]').forEach(i => i.checked = false);
    document.querySelectorAll('input[name="bestTimes"]').forEach(i => i.checked = false);
}

// ===================================
// VALIDATION
// ===================================

function validateStep1() {
    const names = document.getElementById('names').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const timeSlots = document.querySelectorAll('input[name="timeSlot"]:checked');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const vipChoice = document.querySelector('input[name="vipChoice"]:checked');

    if (!names) { alert('Please enter your name(s)'); document.getElementById('names').focus(); return false; }
    if (!phone) { alert('Please enter your phone number'); document.getElementById('phone').focus(); return false; }
    if (!isValidPhone(phone)) { alert('Please enter a valid phone number'); document.getElementById('phone').focus(); return false; }
    if (!email) { alert('Please enter your email address'); document.getElementById('email').focus(); return false; }
    if (!isValidEmail(email)) { alert('Please enter a valid email address'); document.getElementById('email').focus(); return false; }
    if (timeSlots.length === 0) { alert('Please select at least one time slot'); return false; }
    if (!paymentMethod) { alert('Please select a payment method'); return false; }
    if (!vipChoice) { alert('Please choose Priority Alerts or Sunday Only'); return false; }

    if (vipChoice.value.includes('Yes')) {
        const homeCourt = document.getElementById('homeCourt').value.trim();
        const skillLevel = document.querySelector('input[name="skillLevel"]:checked');
        const bestDays = document.querySelectorAll('input[name="bestDays"]:checked');
        const bestTimes = document.querySelectorAll('input[name="bestTimes"]:checked');

        if (!homeCourt) { alert('Please enter your home court/city'); document.getElementById('homeCourt').focus(); return false; }
        if (!skillLevel) { alert('Please select your skill level'); return false; }
        if (bestDays.length === 0) { alert('Please select at least one day'); return false; }
        if (bestTimes.length === 0) { alert('Please select at least one time'); return false; }
    }

    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return phone.replace(/\D/g, '').length === 10;
}

// ===================================
// FORM UTILITIES
// ===================================

function formatPhoneNumber(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    let formatted = '';
    if (value.length > 0) formatted = '(' + value.substring(0, 3);
    if (value.length >= 4) formatted += ') ' + value.substring(3, 6);
    if (value.length >= 7) formatted += '-' + value.substring(6, 10);
    input.value = formatted;
}

function getSelectedCheckboxes(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

// ===================================
// FORM SUBMISSION
// ===================================

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateStep1()) return;

    showLoading();
    const formData = collectFormData();

    try {
        const response = await submitToGoogleSheets(formData);
        if (response.success) {
            showConfirmation(formData);
        } else {
            throw new Error(response.message || 'Submission failed');
        }
    } catch (error) {
        hideLoading();
        alert('Oops! Something went wrong. Please try again.\n\nError: ' + error.message);
        console.error('Submission error:', error);
    }
}

function collectFormData() {
    const vipChoice = document.querySelector('input[name="vipChoice"]:checked').value;
    const data = {
        timestamp: new Date().toISOString(),
        gameDate: selectedGameDate ? selectedGameDate.dateLabel : '',
        gameTime: selectedGameDate ? selectedGameDate.timeRange : '',
        names: document.getElementById('names').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        timeSlots: getSelectedCheckboxes('timeSlot').join(', '),
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        vipChoice: vipChoice
    };

    if (vipChoice.includes('Yes')) {
        data.homeCourt = document.getElementById('homeCourt').value.trim();
        data.skillLevel = document.querySelector('input[name="skillLevel"]:checked').value;
        data.bestDays = getSelectedCheckboxes('bestDays').join(', ');
        data.bestTimes = getSelectedCheckboxes('bestTimes').join(', ');
    } else {
        data.homeCourt = '';
        data.skillLevel = '';
        data.bestDays = '';
        data.bestTimes = '';
    }

    return data;
}

async function submitToGoogleSheets(formData) {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    return { success: true };
}

// ===================================
// UI FEEDBACK
// ===================================

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showConfirmation(formData) {
    hideLoading();
    document.getElementById('step1').classList.remove('active');

    const confirmation = document.getElementById('confirmation');
    confirmation.style.display = 'block';

    currentStep = 2;
    updateProgressBar();

    const isVIP = formData.vipChoice.includes('Yes');
    document.getElementById('confirmationMessage').textContent = isVIP
        ? "You're all set for Sunday AND you're now part of the VIP network! Check your email for details."
        : "You're all set for Sunday! Check your email for game details.";

    document.getElementById('confirmationDetails').innerHTML = isVIP
        ? `<p><strong>Name:</strong> ${formData.names}</p>
           <p><strong>Game Date:</strong> ${formData.gameDate}</p>
           <p><strong>Sunday Time:</strong> ${formData.timeSlots}</p>
           <p><strong>Payment:</strong> ${formData.paymentMethod}</p>
           <p><strong>VIP Status:</strong> Active ✨</p>
           <p><strong>Home Court:</strong> ${formData.homeCourt}</p>
           <p><strong>Skill Level:</strong> ${formData.skillLevel}</p>`
        : `<p><strong>Name:</strong> ${formData.names}</p>
           <p><strong>Game Date:</strong> ${formData.gameDate}</p>
           <p><strong>Time:</strong> ${formData.timeSlots}</p>
           <p><strong>Payment:</strong> ${formData.paymentMethod}</p>
           <p style="margin-top: 16px; color: var(--text-secondary);">Want to join VIP later? Check your email for a special link!</p>`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// PAYMENT INFO DISPLAY
// ===================================

function showPaymentInfo(method) {
    const infoBox = document.getElementById('paymentInfo');
    const detailsDiv = document.getElementById('paymentDetails');

    const paymentDetails = {
        zelle: {
            title: '🏦 Zelle',
            info: '<strong style="color: #00D9FF; font-size: 18px;">(310) 433-8281</strong><br><span style="font-size: 16px;">or bettencourtdesign@me.com</span>',
            note: 'Send via phone number or email'
        },
        venmo: {
            title: '💳 Venmo',
            info: '<a href="https://venmo.com/Steven-Bettencourt-4" target="_blank" style="color: #00D9FF; font-size: 18px; text-decoration: none; font-weight: bold;">@Steven-Bettencourt-4</a>',
            note: 'Click to open Venmo'
        }
    };

    const selected = paymentDetails[method];
    if (selected) {
        detailsDiv.innerHTML = `
            <h4 style="margin: 0 0 12px 0; color: #ffffff; font-size: 16px;">${selected.title}</h4>
            <p style="margin: 8px 0; color: #ffffff; line-height: 1.6;">${selected.info}</p>
            <p style="margin: 8px 0 0 0; color: #b8b8d1; font-size: 14px;">${selected.note}</p>
        `;
        infoBox.style.display = 'block';
        setTimeout(() => infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
}

// ===================================
// MISC
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
