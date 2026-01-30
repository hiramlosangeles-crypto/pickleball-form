// ===================================
// CONFIGURATION
// ===================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4LseN1EdsVjG-4gzyAkmEYhO1_7kpP2ghQOYrd75qkql-NmJ6VQu3DBI8B6995FAI/exec';

// ===================================
// STATE MANAGEMENT
// ===================================

let currentStep = 1;
let gameInfo = null;
let selectedTimeSlots = [];

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    loadGameInfo();
    initializeForm();
    setupVIPChoiceListener();
});

// ===================================
// DYNAMIC GAME INFO LOADER
// ===================================

async function loadGameInfo() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getNextGame');
        const data = await response.json();
        
        if (data.success) {
            gameInfo = data.game;
            updateGameInfoInForm();
        } else {
            console.error('Failed to load game info:', data);
        }
    } catch (error) {
        console.error('Error loading game info:', error);
    }
}

function updateGameInfoInForm() {
    if (!gameInfo) return;
    
    const step1Subtitle = document.querySelector('#step1 .step-subtitle:last-of-type');
    if (step1Subtitle) {
        step1Subtitle.innerHTML = `${gameInfo.dateShort} • ${gameInfo.time}<br>${gameInfo.location} · ${gameInfo.courts}`;
    }
}

function initializeForm() {
    updateProgressBar();
    
    document.getElementById('pickleballForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
    
    // Track time slot changes for payment calculation
    document.querySelectorAll('input[name="timeSlot"]').forEach(checkbox => {
        checkbox.addEventListener('change', updatePaymentAmount);
    });
}

// ===================================
// STEP NAVIGATION
// ===================================

function goToStep2() {
    if (!validateStep1()) {
        return;
    }
    
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    currentStep = 2;
    updateProgressBar();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep1() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    
    currentStep = 1;
    updateProgressBar();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// PROGRESS BAR
// ===================================

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (currentStep === 1) {
        progressFill.style.width = '50%';
        progressText.textContent = 'Step 1 of 2';
    } else if (currentStep === 2) {
        progressFill.style.width = '100%';
        progressText.textContent = 'Step 2 of 2';
    }
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
    
    document.querySelectorAll('input[name="skillLevel"]').forEach(input => {
        input.checked = false;
    });
    
    document.querySelectorAll('input[name="bestDays"]').forEach(input => {
        input.checked = false;
    });
    
    document.querySelectorAll('input[name="bestTimes"]').forEach(input => {
        input.checked = false;
    });
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
    
    if (!names) {
        alert('Please enter your name(s)');
        document.getElementById('names').focus();
        return false;
    }
    
    if (!phone) {
        alert('Please enter your phone number');
        document.getElementById('phone').focus();
        return false;
    }
    
    if (!isValidPhone(phone)) {
        alert('Please enter a valid phone number');
        document.getElementById('phone').focus();
        return false;
    }
    
    if (!email) {
        alert('Please enter your email address');
        document.getElementById('email').focus();
        return false;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        document.getElementById('email').focus();
        return false;
    }
    
    if (timeSlots.length === 0) {
        alert('Please select at least one time slot');
        return false;
    }
    
    if (!paymentMethod) {
        alert('Please select a contribution method');
        return false;
    }
    
    return true;
}

function validateStep2() {
    const vipChoice = document.querySelector('input[name="vipChoice"]:checked');
    
    if (!vipChoice) {
        alert('Please choose whether you want VIP access or Sunday only');
        return false;
    }
    
    if (vipChoice.value.includes('Yes')) {
        const homeCourt = document.getElementById('homeCourt').value.trim();
        const skillLevel = document.querySelector('input[name="skillLevel"]:checked');
        const bestDays = document.querySelectorAll('input[name="bestDays"]:checked');
        const bestTimes = document.querySelectorAll('input[name="bestTimes"]:checked');
        
        if (!homeCourt) {
            alert('Please enter your home court/city');
            document.getElementById('homeCourt').focus();
            return false;
        }
        
        if (!skillLevel) {
            alert('Please select your skill level');
            return false;
        }
        
        if (bestDays.length === 0) {
            alert('Please select at least one day');
            return false;
        }
        
        if (bestTimes.length === 0) {
            alert('Please select at least one time');
            return false;
        }
    }
    
    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

// ===================================
// FORM UTILITIES
// ===================================

function formatPhoneNumber(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    let formatted = '';
    
    if (value.length > 0) {
        formatted = '(' + value.substring(0, 3);
    }
    if (value.length >= 4) {
        formatted += ') ' + value.substring(3, 6);
    }
    if (value.length >= 7) {
        formatted += '-' + value.substring(6, 10);
    }
    
    input.value = formatted;
}

function getSelectedCheckboxes(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// ===================================
// FORM SUBMISSION - FIXED FOR INSTANT LOADING
// ===================================

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateStep2()) {
        return;
    }
    
    // Collect form data FIRST (faster)
    const formData = collectFormData();
    
    // Show loading overlay IMMEDIATELY
    showLoading();
    
    // Small delay to ensure loading shows before fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const response = await submitToGoogleSheets(formData);
        
        if (response.success) {
            showConfirmation(formData);
        } else {
            throw new Error(response.message || 'Submission failed');
        }
    } catch (error) {
        hideLoading();
        alert('Oops! Something went wrong. Please try again or contact us directly.\n\nError: ' + error.message);
        console.error('Submission error:', error);
    }
}

function collectFormData() {
    const names = document.getElementById('names').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const timeSlots = getSelectedCheckboxes('timeSlot');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const vipChoice = document.querySelector('input[name="vipChoice"]:checked').value;
    
    const data = {
        timestamp: new Date().toISOString(),
        names: names,
        phone: phone,
        email: email,
        timeSlot: timeSlots,
        paymentMethod: paymentMethod,
        vipChoice: vipChoice
    };
    
    if (vipChoice.includes('Yes')) {
        data.homeCourt = document.getElementById('homeCourt').value.trim();
        data.skillLevel = document.querySelector('input[name="skillLevel"]:checked').value;
        data.bestDays = getSelectedCheckboxes('bestDays');
        data.bestTimes = getSelectedCheckboxes('bestTimes');
    }
    
    return data;
}

async function submitToGoogleSheets(formData) {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
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
    document.getElementById('step2').classList.remove('active');
    
    const confirmation = document.getElementById('confirmation');
    confirmation.style.display = 'block';
    
    const isVIP = formData.vipChoice.includes('Yes');
    const message = document.getElementById('confirmationMessage');
    const details = document.getElementById('confirmationDetails');
    
    const timeSlots = Array.isArray(formData.timeSlot) ? formData.timeSlot.join(', ') : formData.timeSlot;
    
    if (isVIP) {
        message.textContent = "This confirmation has been sent to your email.";
        details.innerHTML = `
            <p><strong>Name:</strong> ${formData.names}</p>
            <p><strong>Sunday Time:</strong> ${timeSlots}</p>
            <p><strong>Payment:</strong> ${formData.paymentMethod}</p>
            <p><strong>VIP Status:</strong> Active ✨</p>
            <p><strong>Home Court:</strong> ${formData.homeCourt}</p>
            <p><strong>Skill Level:</strong> ${formData.skillLevel}</p>
        `;
    } else {
        message.textContent = "This confirmation has been sent to your email.";
        details.innerHTML = `
            <p><strong>Name:</strong> ${formData.names}</p>
            <p><strong>Time:</strong> ${timeSlots}</p>
            <p><strong>Payment:</strong> ${formData.paymentMethod}</p>
            <p style="margin-top: 16px; color: var(--text-secondary);">Want to join VIP later? Use the link in your confirmation email.</p>
        `;
    }
    
    document.querySelector('.progress-container').style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// PAYMENT FUNCTIONS
// ===================================

function updatePaymentAmount() {
    selectedTimeSlots = Array.from(document.querySelectorAll('input[name="timeSlot"]:checked'))
        .map(cb => cb.value);
    
    const hours = selectedTimeSlots.length;
    const amount = hours * 5;
    
    const venmoSelected = document.querySelector('input[name="paymentMethod"][value="Venmo"]:checked');
    const zelleSelected = document.querySelector('input[name="paymentMethod"][value="Zelle"]:checked');
    const cashSelected = document.querySelector('input[name="paymentMethod"][value="Cash (In Person)"]:checked');
    
    if (venmoSelected) {
        showVenmoPayment(amount, hours);
    } else if (zelleSelected) {
        showZellePayment(amount, hours);
    } else if (cashSelected) {
        showCashPayment(amount, hours);
    }
}

function showVenmoPayment(presetAmount = null, presetHours = null) {
    const instructionsBox = document.getElementById('paymentInstructions');
    const detailsDiv = document.getElementById('paymentDetails');
    
    const hours = presetHours || selectedTimeSlots.length || 2;
    const amount = presetAmount || (hours * 5);
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const venmoLink = isMobile 
        ? `venmo://paycharge?txn=pay&recipients=Steven-Bettencourt-4&amount=${amount}&note=Pickleball%20-%20${hours}%20hour${hours > 1 ? 's' : ''}`
        : `https://venmo.com/Steven-Bettencourt-4?txn=pay&amount=${amount}&note=Pickleball`;
    
    detailsDiv.innerHTML = `
        <h4 style="margin: 0 0 16px 0; color: #FFE500; font-size: 20px;">💳 Pay $${amount} via Venmo</h4>
        
        <div style="background: rgba(255, 229, 0, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #FFE500; font-weight: 700; font-size: 18px;">
                Amount Due: $${amount}
            </p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">
                (${hours} hour${hours > 1 ? 's' : ''} × $5/hour)
            </p>
        </div>
        
        <p style="margin: 12px 0; color: #ffffff; line-height: 1.6;">
            <strong>Send to:</strong> <a href="https://venmo.com/Steven-Bettencourt-4" target="_blank" style="color: #00D9FF; font-size: 18px; text-decoration: none; font-weight: bold;">@Steven-Bettencourt-4</a>
        </p>
        
        <a href="${venmoLink}" 
           class="payment-btn-large" 
           target="_blank"
           style="display: block; padding: 20px; background: linear-gradient(135deg, #00D9FF 0%, #9B51E0 100%); border-radius: 12px; color: white; text-decoration: none; text-align: center; font-weight: 800; font-size: 24px; margin: 20px 0; box-shadow: 0 8px 24px rgba(0, 217, 255, 0.4);">
            ${isMobile ? '📱' : '💻'} Pay $${amount} on Venmo →
        </a>
        
        <p style="margin: 16px 0 0 0; color: #b8b8d1; font-size: 14px; text-align: center;">
            ${isMobile 
                ? '<strong>Opens Venmo app</strong> with amount pre-filled' 
                : '<strong>Opens Venmo website</strong> - you can send payment there or use your Venmo app'}
        </p>
        
        <div style="margin-top: 20px; padding: 16px; background: rgba(255, 107, 0, 0.15); border-left: 3px solid #FF6B00; border-radius: 8px;">
            <p style="margin: 0; color: #FFA500; font-weight: 700; font-size: 14px;">
                ⚠️ IMPORTANT: Your spot is PENDING until payment is verified
            </p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 13px;">
                Complete payment within 24 hours to secure your reservation.
            </p>
        </div>
    `;
    
    instructionsBox.style.display = 'block';
    
    setTimeout(() => {
        instructionsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function showZellePayment(presetAmount = null, presetHours = null) {
    const instructionsBox = document.getElementById('paymentInstructions');
    const detailsDiv = document.getElementById('paymentDetails');
    
    const hours = presetHours || selectedTimeSlots.length || 2;
    const amount = presetAmount || (hours * 5);
    
    detailsDiv.innerHTML = `
        <h4 style="margin: 0 0 16px 0; color: #FFE500; font-size: 20px;">🏦 Pay $${amount} via Zelle</h4>
        
        <div style="background: rgba(255, 229, 0, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #FFE500; font-weight: 700; font-size: 18px;">
                Amount Due: $${amount}
            </p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">
                (${hours} hour${hours > 1 ? 's' : ''} × $5/hour)
            </p>
        </div>
        
        <p style="margin: 12px 0; color: #ffffff; line-height: 1.6;">
            <strong>Send to:</strong><br>
            <span style="color: #00D9FF; font-size: 20px; font-weight: bold;">(310) 433-8281</span><br>
            <span style="font-size: 16px;">or bettencourtdesign@me.com</span>
        </p>
        
        <div style="margin: 16px 0; padding: 16px; background: rgba(255, 229, 0, 0.1); border-radius: 8px; border-left: 3px solid var(--primary-yellow);">
            <p style="margin: 0 0 12px 0; color: var(--primary-yellow); font-weight: 700; font-size: 15px;">📱 How to Send via Zelle:</p>
            <ol style="margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.8;">
                <li>Open your bank's mobile app</li>
                <li>Find "Send Money with Zelle"</li>
                <li>Enter: <strong style="color: #ffffff;">(310) 433-8281</strong></li>
                <li>Enter amount: <strong style="color: #ffffff;">$${amount}</strong></li>
                <li>Add note: "Pickleball [Your Name]"</li>
                <li>Send payment</li>
            </ol>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: rgba(255, 107, 0, 0.15); border-left: 3px solid #FF6B00; border-radius: 8px;">
            <p style="margin: 0; color: #FFA500; font-weight: 700; font-size: 14px;">
                ⚠️ IMPORTANT: Your spot is PENDING until payment is verified
            </p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 13px;">
                Complete payment within 24 hours to secure your reservation.
            </p>
        </div>
    `;
    
    instructionsBox.style.display = 'block';
    
    setTimeout(() => {
        instructionsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function showCashPayment(presetAmount = null, presetHours = null) {
    const instructionsBox = document.getElementById('paymentInstructions');
    const detailsDiv = document.getElementById('paymentDetails');
    
    const hours = presetHours || selectedTimeSlots.length || 2;
    const amount = presetAmount || (hours * 5);
    
    detailsDiv.innerHTML = `
        <h4 style="margin: 0 0 16px 0; color: #FFE500; font-size: 20px;">💵 Bring $${amount} Cash to the Court</h4>
        
        <div style="background: rgba(255, 229, 0, 0.1); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #FFE500; font-weight: 700; font-size: 18px;">
                Amount to Bring: $${amount}
            </p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">
                (${hours} hour${hours > 1 ? 's' : ''} × $5/hour)
            </p>
        </div>
        
        <div style="margin: 16px 0; padding: 20px; background: rgba(0, 217, 255, 0.1); border-radius: 8px; border-left: 3px solid #00D9FF;">
            <p style="margin: 0 0 12px 0; color: #00D9FF; font-weight: 700; font-size: 16px;">💵 Payment at the Court:</p>
            <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.8;">
                <li>Bring <strong style="color: #ffffff;">$${amount} cash</strong> to the game</li>
                <li>Pay Steven or Hiram when you arrive</li>
                <li>Please bring exact change if possible</li>
                <li>Your spot is confirmed once payment is received</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: rgba(255, 107, 0, 0.15); border-left: 3px solid #FF6B00; border-radius: 8px;">
            <p style="margin: 0; color: #FFA500; font-weight: 700; font-size: 14px;">
                ⚠️ IMPORTANT: Your spot is PENDING until payment is received
            </p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 13px;">
                We'll confirm your spot when you pay at the court. Please arrive a few minutes early!
            </p>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: rgba(255, 229, 0, 0.05); border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #b8b8d1; font-size: 13px;">
                💡 <strong>Prefer to pay now?</strong> Choose Venmo or Zelle above for instant confirmation!
            </p>
        </div>
    `;
    
    instructionsBox.style.display = 'block';
    
    setTimeout(() => {
        instructionsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ===================================
// DONATION INFO TOGGLE
// ===================================

function toggleDonationInfo() {
    const infoBox = document.getElementById('donationInfo');
    if (infoBox.style.display === 'none' || infoBox.style.display === '') {
        infoBox.style.display = 'block';
        setTimeout(() => {
            infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        infoBox.style.display = 'none';
    }
}

// ===================================
// HELPER FUNCTIONS
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
