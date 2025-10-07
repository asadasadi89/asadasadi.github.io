// Simple LinkedIn Integration
console.log('LinkedIn script loaded');

function loadLinkedInSDK() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.IN) {
            console.log('LinkedIn SDK already loaded');
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://platform.linkedin.com/in.js';
        // 🎯 REPLACE WITH YOUR ACTUAL CLIENT ID
        script.text = `api_key: 789fpgwdxweuiv
authorize: true
scope: r_liteprofile`;
        
        script.onload = () => {
            console.log('LinkedIn SDK loaded');
            // Wait a bit for IN object to initialize
            setTimeout(() => {
                if (window.IN) {
                    enableButton();
                    resolve();
                } else {
                    reject('IN object not available');
                }
            }, 1000);
        };
        
        script.onerror = () => {
            reject('Failed to load LinkedIn SDK');
        };
        
        document.head.appendChild(script);
    });
}

function enableButton() {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-linkedin"></i> Import from LinkedIn';
        console.log('Button enabled - ready to use!');
    }
}

async function importFromLinkedIn() {
    console.log('Button clicked');
    
    if (!window.IN) {
        alert('LinkedIn not loaded yet. Please wait...');
        return;
    }
    
    try {
        // Simple authorization
        IN.User.authorize(() => {
            console.log('Authorization successful');
            // Fetch basic profile data
            IN.API.Raw("/people/~:(firstName,lastName,headline,profilePicture(displayImage~:playableStreams))?format=json")
                .result((data) => {
                    console.log('Data received:', data);
                    updateProfile(data);
                })
                .error((error) => {
                    console.error('Error:', error);
                    alert('Failed to load profile data');
                });
        });
    } catch (error) {
        console.error('Error:', error);
        alert('LinkedIn error: ' + error.message);
    }
}

function updateProfile(data) {
    // Update name
    if (data.firstName && data.lastName) {
        document.getElementById('profile-name').textContent = 
            data.firstName.localized.en_US + ' ' + data.lastName.localized.en_US;
    }
    
    // Update headline
    if (data.headline) {
        document.getElementById('profile-headline').textContent = data.headline.localized.en_US;
    }
    
    // Update profile picture
    const img = document.getElementById('profile-picture');
    if (data.profilePicture && data.profilePicture['displayImage~'].elements.length > 0) {
        img.src = data.profilePicture['displayImage~'].elements[0].identifiers[0].identifier;
    }
    
    // Update button
    const button = document.getElementById('linkedin-button');
    button.innerHTML = '<i class="bi bi-linkedin"></i> ✓ LinkedIn Connected';
    button.disabled = true;
    button.classList.remove('linkedin-blue');
    button.classList.add('btn-success');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - loading LinkedIn SDK');
    loadLinkedInSDK().catch(error => {
        console.error('Failed to load LinkedIn:', error);
        const button = document.getElementById('linkedin-button');
        button.innerHTML = '<i class="bi bi-linkedin"></i> Failed to Load - Refresh Page';
        button.disabled = true;
    });
});
