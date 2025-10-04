// LinkedIn Integration Script
console.log('LinkedIn script loaded');

let linkedInReady = false;

// Initialize LinkedIn SDK
function initLinkedIn() {
    console.log('Initializing LinkedIn SDK...');
    
    // Check if already loaded
    if (document.querySelector('script[src*="linkedin.com/in.js"]')) {
        console.log('LinkedIn SDK already loaded');
        return;
    }
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://platform.linkedin.com/in.js';
    // ⬇️⬇️⬇️ REPLACE WITH YOUR ACTUAL CLIENT ID ⬇️⬇️⬇️
    script.text = 'api_key: 789fpgwdxweuiv\n authorize: true\n scope: r_liteprofile';
    // ⬆️⬆️⬆️ REPLACE WITH YOUR ACTUAL CLIENT ID ⬆️⬆️⬆️
    
    script.onload = function() {
        console.log('LinkedIn SDK loaded successfully');
        linkedInReady = true;
        enableButton();
        
        // Check if user is already authorized
        if (typeof IN !== 'undefined') {
            checkAuthStatus();
        }
    };
    
    script.onerror = function() {
        console.error('Failed to load LinkedIn SDK');
        linkedInReady = false;
        showMessage('Failed to load LinkedIn services', 'error');
    };
    
    document.head.appendChild(script);
}

// Enable the button when ready
function enableButton() {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.disabled = false;
        button.textContent = 'Import from LinkedIn';
        console.log('LinkedIn button enabled and clickable');
    }
}

// Check if user is already authorized
function checkAuthStatus() {
    if (typeof IN !== 'undefined' && IN.User && IN.User.isAuthorized()) {
        console.log('User already authorized, fetching data...');
        fetchProfileData();
    }
}

// Main function to handle LinkedIn import
function importFromLinkedIn() {
    console.log('Import button clicked');
    console.log('LinkedIn ready:', linkedInReady);
    console.log('IN object:', typeof IN);
    
    if (!linkedInReady || typeof IN === 'undefined') {
        showMessage('LinkedIn is still loading. Please wait...', 'info');
        // Retry initialization
        setTimeout(initLinkedIn, 1000);
        return;
    }
    
    if (typeof IN.User === 'undefined') {
        showMessage('LinkedIn service unavailable. Please refresh the page.', 'error');
        return;
    }
    
    console.log('Starting LinkedIn authorization...');
    
    // Use LinkedIn SDK to authorize
    IN.User.authorize(function() {
        console.log('Authorization successful');
        fetchProfileData();
    }, function(error) {
        console.error('Authorization failed:', error);
        showMessage('Failed to connect with LinkedIn. Please try again.', 'error');
    });
}

// Fetch profile data from LinkedIn
function fetchProfileData() {
    console.log('Fetching profile data...');
    
    if (typeof IN === 'undefined') {
        showMessage('LinkedIn service error. Please refresh.', 'error');
        return;
    }
    
    IN.API.Raw("/people/~:(firstName,lastName,headline,summary,location,profilePicture(displayImage~:playableStreams))?format=json")
        .result(function(data) {
            console.log('Profile data received:', data);
            updateProfileUI(data);
            showMessage('LinkedIn data imported successfully!', 'success');
        })
        .error(function(error) {
            console.error('Error fetching profile:', error);
            showMessage('Failed to load profile data. Please try again.', 'error');
        });
}

// Update the UI with LinkedIn data
function updateProfileUI(data) {
    try {
        // Update Name
        if (data.firstName && data.lastName) {
            document.getElementById('profile-name').textContent = 
                `${data.firstName.localized.en_US} ${data.lastName.localized.en_US}`;
        }
        
        // Update Headline
        if (data.headline) {
            document.getElementById('profile-headline').textContent = data.headline.localized.en_US;
        }
        
        // Update Location
        if (data.location) {
            document.getElementById('profile-location').textContent = data.location.name;
        }
        
        // Update Summary
        if (data.summary) {
            document.getElementById('profile-summary').textContent = data.summary.localized.en_US;
        }
        
        // Update Profile Picture
        const pictureElement = document.getElementById('profile-picture');
        if (data.profilePicture && data.profilePicture['displayImage~'].elements.length > 0) {
            const pictureUrl = data.profilePicture['displayImage~'].elements[0].identifiers[0].identifier;
            pictureElement.src = pictureUrl;
        }
        
        // Update button to show success
        const button = document.getElementById('linkedin-button');
        button.textContent = '✓ LinkedIn Connected';
        button.disabled = true;
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        
    } catch (error) {
        console.error('Error updating UI:', error);
        showMessage('Error displaying profile data', 'error');
    }
}

// Show user messages
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existing = document.getElementById('user-message');
    if (existing) existing.remove();
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.id = 'user-message';
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing LinkedIn...');
    initLinkedIn();
});

// Also initialize on window load as backup
window.addEventListener('load', function() {
    console.log('Window loaded, checking LinkedIn...');
    if (!linkedInReady) {
        setTimeout(initLinkedIn, 500);
    }
});
