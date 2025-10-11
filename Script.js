// Minimal LinkedIn Test
console.log('=== LINKEDIN TEST START ===');

// Create LinkedIn script
const script = document.createElement('script');
script.src = 'https://platform.linkedin.com/in.js';
script.text = 'api_key: 789fpgwdxweuiv\nauthorize: true\nscope: r_liteprofile';

// Track what happens
script.onload = function() {
    console.log('✅ LinkedIn SDK loaded');
    checkIfReady();
};

script.onerror = function() {
    console.error('❌ Failed to load LinkedIn SDK');
    document.getElementById('linkedin-button').textContent = 'Error - Check Console';
};

// Add to page
document.head.appendChild(script);

function checkIfReady() {
    let checks = 0;
    const maxChecks = 30; // 3 seconds
    
    const interval = setInterval(function() {
        checks++;
        
        if (window.IN && window.IN.User) {
            clearInterval(interval);
            console.log('✅ LinkedIn READY - IN.User available');
            enableButton();
        } else if (checks >= maxChecks) {
            clearInterval(interval);
            console.error('❌ LinkedIn NEVER READY - IN.User not found');
            document.getElementById('linkedin-button').textContent = 'Failed - Refresh';
        }
    }, 100);
}

function enableButton() {
    const button = document.getElementById('linkedin-button');
    button.disabled = false;
    button.textContent = 'Import from LinkedIn';
    console.log('✅ BUTTON READY - You can click it now!');
}

function importFromLinkedIn() {
    console.log('🖱️ Button clicked!');
    
    if (!window.IN || !window.IN.User) {
        alert('LinkedIn not ready. Please wait.');
        return;
    }
    
    console.log('Starting LinkedIn login...');
    IN.User.authorize(function() {
        console.log('✅ Login successful!');
        alert('LinkedIn login worked! Now fetching data...');
        getProfileData();
    });
}

function getProfileData() {
    console.log('Getting profile data...');
    IN.API.Raw("/people/~:(firstName,lastName,headline)?format=json")
        .result(function(data) {
            console.log('✅ Profile data:', data);
            
            // Update the page
            document.getElementById('profile-name').textContent = 
                data.firstName.localized.en_US + ' ' + data.lastName.localized.en_US;
            document.getElementById('profile-headline').textContent = data.headline.localized.en_US;
            
            // Show success
            document.getElementById('linkedin-button').textContent = '✓ Connected!';
            document.getElementById('linkedin-button').style.background = 'green';
            
            alert('Success! Your LinkedIn data is now displayed.');
        })
        .error(function(error) {
            console.error('❌ Error getting data:', error);
            alert('Got LinkedIn access but failed to load data.');
        });
}

console.log('=== LINKEDIN TEST END ===');
