// LinkedIn Integration - DEBUG VERSION
console.log('=== LINKEDIN DEBUG === Script loaded');

let linkedInReady = false;
let initializationAttempted = false;

function initLinkedIn() {
    if (initializationAttempted) {
        console.log('=== LINKEDIN DEBUG === Init already attempted, skipping');
        return;
    }
    
    initializationAttempted = true;
    console.log('=== LINKEDIN DEBUG === Starting initialization');
    
    // Check if SDK already exists
    if (window.IN) {
        console.log('=== LINKEDIN DEBUG === IN object already exists');
        linkedInReady = true;
        enableButton();
        return;
    }
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://platform.linkedin.com/in.js';
    
    // 🎯 REPLACE THIS WITH YOUR ACTUAL CLIENT ID
    script.text = 'api_key: 789fpgwdxweuiv\n authorize: true\n scope: r_liteprofile';
    // 🎯 Make sure to replace YOUR_ACTUAL_CLIENT_ID_HERE
    
    script.onload = function() {
        console.log('=== LINKEDIN DEBUG === Script.onload triggered');
        console.log('=== LINKEDIN DEBUG === IN object:', typeof window.IN);
        console.log('=== LINKEDIN DEBUG === IN.User:', typeof window.IN?.User);
        
        linkedInReady = true;
        enableButton();
        checkAuthStatus();
    };
    
    script.onerror = function(err) {
        console.error('=== LINKEDIN DEBUG === Script.onerror triggered:', err);
        console.log('=== LINKEDIN DEBUG === Script src:', script.src);
        showDebugMessage('Failed to load LinkedIn SDK. Check Client ID and console.', 'error');
    };
    
    console.log('=== LINKEDIN DEBUG === Adding script to head');
    document.head.appendChild(script);
}

function enableButton() {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.disabled = false;
        button.textContent = 'Import from LinkedIn';
        console.log('=== LINKEDIN DEBUG === Button enabled and clickable');
    } else {
        console.error('=== LINKEDIN DEBUG === Button element not found!');
    }
}

function importFromLinkedIn() {
    console.log('=== LINKEDIN DEBUG === Button clicked!');
    console.log('=== LINKEDIN DEBUG === linkedInReady:', linkedInReady);
    console.log('=== LINKEDIN DEBUG === IN object:', typeof window.IN);
    console.log('=== LINKEDIN DEBUG === IN.User:', typeof window.IN?.User);
    
    if (!linkedInReady || typeof window.IN === 'undefined') {
        showDebugMessage('LinkedIn not ready. Status: ' + (typeof window.IN), 'error');
        return;
    }
    
    if (typeof window.IN.User === 'undefined') {
        showDebugMessage('IN.User not available', 'error');
        return;
    }
    
    console.log('=== LINKEDIN DEBUG === Calling IN.User.authorize');
    
    window.IN.User.authorize(function() {
        console.log('=== LINKEDIN DEBUG === Authorization successful');
        fetchProfileData();
    }, function(error) {
        console.error('=== LINKEDIN DEBUG === Authorization failed:', error);
        showDebugMessage('Authorization failed: ' + (error?.message || 'Unknown error'), 'error');
    });
}

function fetchProfileData() {
    console.log('=== LINKEDIN DEBUG === Fetching profile data');
    
    window.IN.API.Raw("/people/~:(firstName,lastName,headline)?format=json")
        .result(function(data) {
            console.log('=== LINKEDIN DEBUG === Profile data received:', data);
            updateProfileUI(data);
            showDebugMessage('Success! Data loaded from LinkedIn', 'success');
        })
        .error(function(error) {
            console.error('=== LINKEDIN DEBUG === API Error:', error);
            showDebugMessage('API Error: ' + (error?.message || 'Unknown'), 'error');
        });
}

function updateProfileUI(data) {
    try {
        if (data.firstName && data.lastName) {
            document.getElementById('profile-name').textContent = 
                `${data.firstName.localized.en_US} ${data.lastName.localized.en_US}`;
        }
        if (data.headline) {
            document.getElementById('profile-headline').textContent = data.headline.localized.en_US;
        }
        
        const button = document.getElementById('linkedin-button');
        button.textContent = '✓ LinkedIn Connected';
        button.disabled = true;
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        
    } catch (error) {
        console.error('=== LINKEDIN DEBUG === UI Update error:', error);
    }
}

function showDebugMessage(message, type = 'info') {
    console.log('=== LINKEDIN DEBUG === Message:', message);
    
    const existing = document.getElementById('debug-message');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'debug-message';
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; border: 2px solid red;';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) messageDiv.remove();
    }, 10000);
}

// Multiple initialization attempts
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== LINKEDIN DEBUG === DOM loaded');
    initLinkedIn();
});

window.addEventListener('load', function() {
    console.log('=== LINKEDIN DEBUG === Window loaded');
    setTimeout(initLinkedIn, 1000);
});

// Also try initializing after a longer delay
setTimeout(initLinkedIn, 3000);
