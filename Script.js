// Simple LinkedIn Integration
console.log('LinkedIn integration started');

// Wait for page to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing LinkedIn');
    initializeLinkedIn();
});

function initializeLinkedIn() {
    console.log('Loading LinkedIn SDK...');
    
    // Create and configure the LinkedIn script
    const script = document.createElement('script');
    script.src = 'https://platform.linkedin.com/in.js';
    script.text = 'api_key: 789fpgwdxweuiv\nauthorize: true\nscope: r_liteprofile';
    
    script.onload = function() {
        console.log('LinkedIn SDK loaded successfully');
        waitForINObject();
    };
    
    script.onerror = function() {
        console.error('Failed to load LinkedIn SDK');
        updateButton('Error loading LinkedIn', true);
    };
    
    // Add to page
    document.head.appendChild(script);
}

function waitForINObject() {
    console.log('Waiting for IN object...');
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    const checkInterval = setInterval(function() {
        attempts++;
        
        if (window.IN) {
            clearInterval(checkInterval);
            console.log('IN object is available');
            setupLinkedInButton();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('IN object never became available');
            updateButton('LinkedIN not available', true);
        }
    }, 100);
}

function setupLinkedInButton() {
    const button = document.getElementById('linkedin-button');
    if (!button) {
        console.error('LinkedIn button not found');
        return;
    }
    
    // Enable the button
    button.disabled = false;
    button.textContent = 'Import from LinkedIn';
    
    // Add click event listener
    button.addEventListener('click', handleLinkedInClick);
    
    console.log('LinkedIn button is ready');
}

function handleLinkedInClick() {
    console.log('LinkedIn button clicked');
    
    if (!window.IN || !window.IN.User) {
        alert('LinkedIn is not ready. Please try again.');
        return;
    }
    
    // Start LinkedIn authorization
    IN.User.authorize(function() {
        console.log('LinkedIn authorization successful');
        fetchLinkedInProfile();
    }, function(error) {
        console.error('LinkedIn authorization failed:', error);
        alert('Authorization failed. Please try again.');
    });
}

function fetchLinkedInProfile() {
    console.log('Fetching LinkedIn profile...');
    
    IN.API.Raw("/people/~:(firstName,lastName,headline)?format=json")
        .result(function(data) {
            console.log('Profile data received:', data);
            updateProfileWithData(data);
        })
        .error(function(error) {
            console.error('Error fetching profile:', error);
            alert('Failed to load profile data.');
        });
}

function updateProfileWithData(data) {
    try {
        // Update name
        if (data.firstName && data.lastName) {
            const fullName = data.firstName.localized.en_US + ' ' + data.lastName.localized.en_US;
            document.getElementById('profile-name').textContent = fullName;
        }
        
        // Update headline
        if (data.headline) {
            document.getElementById('profile-headline').textContent = data.headline.localized.en_US;
        }
        
        // Update button to show success
        updateButton('LinkedIn Connected', false);
        
        console.log('Profile updated successfully');
        
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

function updateButton(text, isError) {
    const button = document.getElementById('linkedin-button');
    if (button) {
        button.textContent = text;
        button.disabled = true;
        
        if (isError) {
            button.style.backgroundColor = '#dc3545';
        } else {
            button.style.backgroundColor = '#28a745';
        }
    }
}
