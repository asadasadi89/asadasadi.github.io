// Global variables to track SDK state
let linkedInSDKLoaded = false;
let linkedInInitialized = false;

// Initialize the LinkedIn SDK
function initLinkedIn() {
    if (linkedInInitialized) {
        return;
    }
    
    console.log('Initializing LinkedIn SDK...');
    linkedInInitialized = true;
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://platform.linkedin.com/in.js';
    // IMPORTANT: Replace YOUR_CLIENT_ID with your actual Client ID
    script.text = `api_key: 789fpgwdxweuiv\n authorize: true\n scope: r_liteprofile`;
    
    script.onload = function() {
        console.log('LinkedIn SDK loaded successfully');
        linkedInSDKLoaded = true;
        updateButtonState();
        
        // Check if we're returning from OAuth flow
        checkOAuthReturn();
    };
    
    script.onerror = function() {
        console.error('Failed to load LinkedIn SDK');
        linkedInSDKLoaded = false;
        updateButtonState();
    };
    
    document.head.appendChild(script);
}

// Check if we're returning from OAuth authorization
function checkOAuthReturn() {
    if (typeof IN !== 'undefined' && IN.User.isAuthorized()) {
        console.log('User is already authorized, fetching profile data...');
        fetchProfileData();
    }
}

// Function to handle the sign-in button click
function signInWithLinkedIn() {
    console.log('Sign-in button clicked');
    
    if (!linkedInSDKLoaded || typeof IN === 'undefined') {
        showMessage('LinkedIn is still loading. Please wait...', 'info');
        setTimeout(initLinkedIn, 1000);
        return;
    }
    
    // Use the raw OAuth URL to have more control
    const clientId = '789fpgwdxweuiv'; // Replace with your actual Client ID
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent('r_liteprofile');
    const state = encodeURIComponent('linkedin_login');
    
    const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    console.log('Redirecting to OAuth URL...');
    window.location.href = oauthUrl;
}

// Alternative method using the SDK (try this if above doesn't work)
function signInWithLinkedInSDK() {
    if (typeof IN === 'undefined') {
        showMessage('LinkedIn SDK not loaded. Please try again.', 'error');
        return;
    }
    
    IN.User.authorize(function() {
        console.log('Authorization callback triggered');
        // This should now work since we're in the proper context
        fetchProfileData();
    });
}

// Function to fetch the user's profile data
function fetchProfileData() {
    console.log('Fetching profile data...');
    
    if (typeof IN === 'undefined') {
        showMessage('LinkedIn service unavailable. Please refresh and try again.', 'error');
        return;
    }
    
    IN.API.Raw("/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams),vanityName,headline,location,summary)?format=json")
        .result(function(data) {
            console.log('Profile data received:', data);
            updateProfileUI(data);
            showMessage('Profile data loaded successfully!', 'success');
        })
        .error(function(error) {
            console.error("Error fetching profile data:", error);
            showMessage('Failed to load profile data. Please try again.', 'error');
        });
}

// Function to update the HTML with the fetched data
function updateProfileUI(data) {
    try {
        // Update Name
        const nameElement = document.getElementById('profile-name');
        if (data.firstName && data.lastName) {
            nameElement.textContent = `${data.firstName.localized.en_US} ${data.lastName.localized.en_US}`;
        }

        // Update Headline
        const headlineElement = document.getElementById('profile-headline');
        if (data.headline) {
            headlineElement.textContent = data.headline.localized.en_US;
        }

        // Update Location
        const locationElement = document.getElementById('profile-location');
        if (data.location) {
            locationElement.textContent = data.location.name;
        }

        // Update Summary
        const summaryElement = document.getElementById('profile-summary');
        if (data.summary && data.summary.localized && data.summary.localized.en_US) {
            summaryElement.textContent = data.summary.localized.en_US;
        }

        // Update Profile Picture
        const pictureElement = document.getElementById('profile-picture');
        if (data.profilePicture && data.profilePicture['displayImage~'].elements.length > 0) {
            const pictureUrl = data.profilePicture['displayImage~'].elements.pop().identifiers[0].identifier;
            pictureElement.src = pictureUrl;
        }

        // Update button
        const signInButton = document.querySelector('.btn.linkedin-blue');
        if (signInButton) {
            signInButton.textContent = '✓ LinkedIn Connected';
            signInButton.disabled = true;
            signInButton.classList.remove('linkedin-blue');
            signInButton.classList.add('btn-success');
        }
        
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Function to update button state
function updateButtonState() {
    const button = document.querySelector('.btn.linkedin-blue');
    if (button) {
        if (linkedInSDKLoaded && typeof IN !== 'undefined') {
            button.textContent = 'Import from LinkedIn';
            button.disabled = false;
            // Update onclick to use the SDK method
            button.setAttribute('onclick', 'signInWithLinkedInSDK()');
        } else {
            button.textContent = 'Loading LinkedIn...';
            button.disabled = true;
        }
    }
}

// Function to show messages
function showMessage(message, type = 'info') {
    const existingMessage = document.getElementById('linkedin-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.id = 'linkedin-message';
    messageElement.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} mt-3`;
    messageElement.textContent = message;
    messageElement.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; min-width: 300px;';
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

// Initialize when the page loads
window.addEventListener('load', function() {
    console.log('Page loaded, initializing LinkedIn SDK...');
    initLinkedIn();
});
