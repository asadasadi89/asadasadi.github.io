// LinkedIn Integration - Fixed for your URL
console.log('=== LINKEDIN DEBUG === Script loaded for asadasadi89.github.io');

let linkedinReady = false;

function initLinkedIn() {
    console.log('=== LINKEDIN DEBUG === Initializing LinkedIn SDK');
    console.log('=== LINKEDIN DEBUG === Current URL:', window.location.href);
    
    // Check if already loaded
    if (window.IN) {
        console.log('=== LINKEDIN DEBUG === SDK already loaded');
        linkedinReady = true;
        enableButton();
        return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://platform.linkedin.com/in.js';
    
    // 🎯 Your Client ID
    script.text = `api_key: 789fpgwdxweuiv
authorize: true
scope: r_liteprofile`;
    
    script.onload = function() {
        console.log('=== LINKEDIN DEBUG === LinkedIn script loaded successfully');
        
        // Wait for IN object with timeout
        let attempts = 0;
        const checkInterval = setInterval(function() {
            attempts++;
            
            if (window.IN) {
                clearInterval(checkInterval);
                console.log('=== LINKEDIN DEBUG === IN object available!');
                console.log('=== LINKEDIN DEBUG === IN.User:', typeof IN.User);
                linkedinReady = true;
                enableButton();
            } else if (attempts > 30) { // 3 second timeout
                clearInterval(checkInterval);
                console.error('=== LINKEDIN DEBUG === IN object never loaded');
                showErrorMessage('LinkedIn SDK loaded but IN object not available');
            }
        }, 100);
    };
    
    script.onerror = function(error) {
        console.error('=== LINKEDIN DEBUG === Failed to load LinkedIn SDK:', error);
        showErrorMessage('Failed to load LinkedIn SDK. Check Client ID and Redirect URL.');
    };
    
    document.head.appendChild(script);
    console.log('=== LINKEDIN DEBUG === LinkedIn script added to page');
}

function enableButton() {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.disabled = false;
        button.innerHTML = 'Import from LinkedIn';
        console.log('=== LINKEDIN DEBUG === Button enabled and ready!');
    } else {
        console.error('=== LINKEDIN DEBUG === Could not find linkedin-button');
    }
}

function showErrorMessage(message) {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.innerHTML = 'Error - Check Console';
        button.style.backgroundColor = '#dc3545';
    }
    console.error('=== LINKEDIN DEBUG ===', message);
}

function importFromLinkedIn() {
    console.log('=== LINKEDIN DEBUG === Import button clicked!');
    console.log('=== LINKEDIN DEBUG === LinkedIn ready:', linkedinReady);
    console.log('=== LINKEDIN DEBUG === IN object:', typeof window.IN);
    
    if (!linkedinReady || typeof window.IN === 'undefined') {
        alert('LinkedIn is not ready yet. Please wait a moment and try again.');
        return;
    }
    
    if (typeof window.IN.User === 'undefined') {
        alert('LinkedIn service not available. Please refresh the page.');
        return;
    }
    
    console.log('=== LINKEDIN DEBUG === Starting LinkedIn authorization...');
    
    try {
        window.IN.User.authorize(function() {
            console.log('=== LINKEDIN DEBUG === Authorization successful!');
            fetchProfileData();
        }, function(error) {
            console.error('=== LINKEDIN DEBUG === Authorization failed:', error);
            alert('LinkedIn authorization failed. Please try again.');
        });
    } catch (error) {
        console.error('=== LINKEDIN DEBUG === Error:', error);
        alert('Error: ' + error.message);
    }
}

function fetchProfileData() {
    console.log('=== LINKEDIN DEBUG === Fetching profile data...');
    
    window.IN.API.Raw("/people/~:(firstName,lastName,headline,summary,location)?format=json")
        .result(function(data) {
            console.log('=== LINKEDIN DEBUG === Profile data received:', data);
            updateProfileUI(data);
        })
        .error(function(error) {
            console.error('=== LINKEDIN DEBUG === API Error:', error);
            alert('Failed to load profile data from LinkedIn.');
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
        
        // Update button
        const button = document.getElementById('linkedin-button');
        button.innerHTML = '✓ LinkedIn Connected';
        button.disabled = true;
        button.style.backgroundColor = '#28a745';
        
        console.log('=== LINKEDIN DEBUG === UI updated successfully!');
        
    } catch (error) {
        console.error('=== LINKEDIN DEBUG === Error updating UI:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== LINKEDIN DEBUG === DOM loaded, starting LinkedIn initialization');
    initLinkedIn();
});

// Backup initialization after 2 seconds
setTimeout(function() {
    if (!linkedinReady) {
        console.log('=== LINKEDIN DEBUG === Backup initialization');
        initLinkedIn();
    }
}, 2000);
