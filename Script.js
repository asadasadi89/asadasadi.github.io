// LinkedIn Integration - DEBUG VERSION
console.log('=== LINKEDIN DEBUG === Script loaded');

let linkedinReady = false;

function initLinkedIn() {
    console.log('=== LINKEDIN DEBUG === Initializing LinkedIn SDK');
    
    // Check if SDK is already loaded
    if (window.IN) {
        console.log('=== LINKEDIN DEBUG === SDK already loaded');
        linkedinReady = true;
        enableButton();
        return;
    }
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://platform.linkedin.com/in.js';
    
    // 🎯 MAKE SURE THIS IS YOUR CORRECT CLIENT ID
    script.text = `api_key: 789fpgwdxweuiv
authorize: true
scope: r_liteprofile`;
    
    script.onload = function() {
        console.log('=== LINKEDIN DEBUG === Script loaded successfully');
        
        // Wait for IN object to be available
        const checkIN = setInterval(function() {
            if (window.IN) {
                clearInterval(checkIN);
                console.log('=== LINKEDIN DEBUG === IN object is now available');
                console.log('=== LINKEDIN DEBUG === IN.User:', typeof IN.User);
                linkedinReady = true;
                enableButton();
                
                // Check if user is already authorized
                if (IN.User.isAuthorized()) {
                    console.log('=== LINKEDIN DEBUG === User already authorized');
                    fetchProfileData();
                }
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(function() {
            clearInterval(checkIN);
            if (!window.IN) {
                console.error('=== LINKEDIN DEBUG === IN object never became available');
                showErrorMessage('LinkedIn failed to load');
            }
        }, 5000);
    };
    
    script.onerror = function(error) {
        console.error('=== LINKEDIN DEBUG === Failed to load LinkedIn SDK:', error);
        showErrorMessage('Failed to load LinkedIn SDK. Check your Client ID.');
    };
    
    document.head.appendChild(script);
}

function enableButton() {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-linkedin"></i> Import from LinkedIn';
        console.log('=== LINKEDIN DEBUG === Button is now enabled and clickable!');
    } else {
        console.error('=== LINKEDIN DEBUG === Could not find button with id="linkedin-button"');
    }
}

function showErrorMessage(message) {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.innerHTML = '<i class="bi bi-linkedin"></i> Error - See Console';
        button.disabled = true;
    }
    console.error('=== LINKEDIN DEBUG ===', message);
}

function importFromLinkedIn() {
    console.log('=== LINKEDIN DEBUG === Import button clicked!');
    console.log('=== LINKEDIN DEBUG === linkedinReady:', linkedinReady);
    console.log('=== LINKEDIN DEBUG === IN object:', typeof window.IN);
    
    if (!linkedinReady || typeof window.IN === 'undefined') {
        alert('LinkedIn is not ready yet. Please wait for it to load completely.');
        return;
    }
    
    if (typeof window.IN.User === 'undefined') {
        alert('LinkedIn User API is not available. Please refresh the page.');
        return;
    }
    
    console.log('=== LINKEDIN DEBUG === Starting authorization...');
    
    try {
        window.IN.User.authorize(function() {
            console.log('=== LINKEDIN DEBUG === Authorization successful!');
            fetchProfileData();
        }, function(error) {
            console.error('=== LINKEDIN DEBUG === Authorization failed:', error);
            alert('LinkedIn authorization failed. Please try again. Error: ' + (error.message || 'Unknown'));
        });
    } catch (error) {
        console.error('=== LINKEDIN DEBUG === Error in authorization:', error);
        alert('Error: ' + error.message);
    }
}

function fetchProfileData() {
    console.log('=== LINKEDIN DEBUG === Fetching profile data...');
    
    window.IN.API.Raw("/people/~:(firstName,lastName,headline,summary,location,profilePicture(displayImage~:playableStreams))?format=json")
        .result(function(data) {
            console.log('=== LINKEDIN DEBUG === Profile data received:', data);
            updateProfileUI(data);
        })
        .error(function(error) {
            console.error('=== LINKEDIN DEBUG === API Error:', error);
            alert('Failed to fetch profile data: ' + (error.message || 'Unknown error'));
        });
}

function updateProfileUI(data) {
    try {
        console.log('=== LINKEDIN DEBUG === Updating UI with profile data');
        
        // Update name
        if (data.firstName && data.lastName) {
            document.getElementById('profile-name').textContent = 
                data.firstName.localized.en_US + ' ' + data.lastName.localized.en_US;
        }
        
        // Update headline
        if (data.headline) {
            document.getElementById('profile-headline').textContent = data.headline.localized.en_US;
        }
        
        // Update location
        if (data.location) {
            document.getElementById('profile-location').textContent = data.location.name;
        }
        
        // Update summary
        if (data.summary) {
            document.getElementById('profile-summary').textContent = data.summary.localized.en_US;
        }
        
        // Update profile picture
        const pictureElement = document.getElementById('profile-picture');
        if (data.profilePicture && data.profilePicture['displayImage~'].elements.length > 0) {
            const pictureUrl = data.profilePicture['displayImage~'].elements[0].identifiers[0].identifier;
            pictureElement.src = pictureUrl;
        }
        
        // Update button to show success
        const button = document.getElementById('linkedin-button');
        button.innerHTML = '<i class="bi bi-linkedin"></i> ✓ LinkedIn Connected';
        button.disabled = true;
        button.classList.remove('linkedin-blue');
        button.classList.add('btn-success');
        
        console.log('=== LINKEDIN DEBUG === UI updated successfully!');
        
    } catch (error) {
        console.error('=== LINKEDIN DEBUG === Error updating UI:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== LINKEDIN DEBUG === DOM loaded, initializing LinkedIn');
    initLinkedIn();
});

// Backup initialization
window.addEventListener('load', function() {
    console.log('=== LINKEDIN DEBUG === Window loaded');
    if (!linkedinReady) {
        setTimeout(initLinkedIn, 1000);
    }
});
