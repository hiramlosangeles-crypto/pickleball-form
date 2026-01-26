// ===================================
// CONFIGURATION
// ===================================

// Replace this with your Google Apps Script Web App URL after deployment
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4LseN1EdsVjG-4gzyAkmEYhO1_7kpP2ghQOYrd75qkql-NmJ6VQu3DBI8B6995FAI/exec';

// ===================================
// STATE MANAGEMENT
// ===================================

let currentStep = 1;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupVIPChoiceListener();
});

function initializeForm() {
    updateProgressBar();
    
    // Add form submission handler
    document.getElementById('pickleballForm').addEventListener('submit', handleFormSubmit);
    
    // Format phone number as user types
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// ===================================
// STEP NAVIGATION
// ===================================

function goToStep2() {
    // Validate Step 1 fields
    if (!validateStep1()) {
        return;
    }
    
    // Hide step 1, show step 2
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    currentStep = 2;
    updateProgressBar();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep1() {
    // Hide step 2, show step 1
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    
    currentStep = 1;
    updateProgressBar();
    
    // Scroll to top
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
            // Make VIP fields required
            makeVIPFieldsRequired(true);
        }
    });
    
    vipNo.addEventListener('change', function() {
        if (this.checked) {
            vipDetails.style.display = 'none';
            // Make VIP fields optional
            makeVIPFieldsRequired(false);
            // Clear VIP fields
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
    
    // If they chose VIP, validate VIP fields
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
// FORM SUBMISSION
// ===================================

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate Step 2
    if (!validateStep2()) {
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    // Collect form data
    const formData = collectFormData();
    
    try {
        // Submit to Google Apps Script
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
        timeSlots: timeSlots.join(', '),
        paymentMethod: paymentMethod,
        vipChoice: vipChoice
    };
    
    // Add VIP fields if they chose VIP
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
    // Check if script URL is configured
    if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('Google Apps Script URL not configured. Form data:', formData);
        // For testing without backend
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, message: 'Test mode - no actual submission' });
            }, 1500);
        });
    }
    
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    // Note: no-cors means we can't read the response
    // We'll assume success if no error was thrown
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
    
    // Hide form steps
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    
    // Show confirmation
    const confirmation = document.getElementById('confirmation');
    confirmation.style.display = 'block';
    
    // Update confirmation message
    const isVIP = formData.vipChoice.includes('Yes');
    const message = document.getElementById('confirmationMessage');
    const details = document.getElementById('confirmationDetails');
    
    if (isVIP) {
        message.textContent = "You're all set for Sunday AND you're now part of the VIP network! Check your email for details.";
        details.innerHTML = `
            <p><strong>Name:</strong> ${formData.names}</p>
            <p><strong>Sunday Time:</strong> ${formData.timeSlots}</p>
            <p><strong>Payment:</strong> ${formData.paymentMethod}</p>
            <p><strong>VIP Status:</strong> Active ✨</p>
            <p><strong>Home Court:</strong> ${formData.homeCourt}</p>
            <p><strong>Skill Level:</strong> ${formData.skillLevel}</p>
        `;
    } else {
        message.textContent = "You're all set for Sunday! "This confirmation has been sent to your email.";
        details.innerHTML = `
            <p><strong>Name:</strong> ${formData.names}</p>
            <p><strong>Time:</strong> ${formData.timeSlots}</p>
            <p><strong>Payment:</strong> ${formData.paymentMethod}</p>
            <p style="margin-top: 16px; color: var(--text-secondary);">"Want to join VIP later? Use the link in your confirmation email."</p>
        `;
    }
    
    // Hide progress bar on confirmation
    document.querySelector('.progress-container').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// PAYMENT INFO DISPLAY
// ===================================

function showPaymentInfo(method) {
    const infoBox = document.getElementById('paymentInfo');
    const detailsDiv = document.getElementById('paymentDetails');
    
    const paymentDetails = {
        cashapp: {
            title: '💵 Cash App',
            info: '<strong style="color: #00D9FF; font-size: 18px;">$HyruhmUlyssisGrant</strong>',
            note: 'Send payment to Cash App'
        },
        venmo: {
            title: '💳 Venmo',
            info: '<a href="https://venmo.com/Steven-Bettencourt-4" target="_blank" style="color: #00D9FF; font-size: 18px; text-decoration: none; font-weight: bold;">@Steven-Bettencourt-4</a>',
            note: 'Click to open Venmo'
        },
        zelle: {
            title: '🏦 Zelle',
            info: '<strong style="color: #00D9FF; font-size: 18px;">(310) 433-8281</strong><br><span style="font-size: 16px;">or bettencourtdesign@me.com</span>',
            note: 'Send via phone number or email'
        },
        paypal: {
            title: '🌐 PayPal',
            info: '<strong style="color: #00D9FF; font-size: 18px;">hyruhm@hyruhm.com</strong>',
            note: 'Send payment to PayPal email'
        },
        inperson: {
            title: '💵 In Person',
            info: '<strong style="color: #00D9FF; font-size: 18px;">Pay at the court</strong>',
            note: 'Bring cash or card to the game'
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
        
        // Smooth scroll to show the info
        setTimeout(() => {
            infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// ===================================
// DONATION INFO TOGGLE
// ===================================

function toggleDonationInfo() {
    const infoBox = document.getElementById('donationInfo');
    if (infoBox.style.display === 'none' || infoBox.style.display === '') {
        infoBox.style.display = 'block';
        // Smooth scroll to show the info
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

// Add smooth scroll for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
