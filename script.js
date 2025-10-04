// Initialize the LinkedIn SDK
function initLinkedIn() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://platform.linkedin.com/in.js';
    // IMPORTANT: You'll replace YOUR_CLIENT_ID in the next steps
    script.text = `api_key: 789fpgwdxweuiv\n authorize: true\n scope: r_liteprofile`;
    document.head.appendChild(script);
    console.log('LinkedIn SDK initialized');
}

// Function to handle the sign-in button click
function signInWithLinkedIn() {
    if (typeof IN === 'undefined') {
        alert('LinkedIn SDK not loaded yet. Please wait a moment and try again.');
        return;
    }
    
    IN.User.authorize(function() {
        console.log('Authorization successful');
        fetchProfileData();
    });
}

// Function to fetch the user's profile data
function fetchProfileData() {
    IN.API.Raw("/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams),vanityName,headline,location,summary)?format=json")
        .result(function(data) {
            console.log('Profile data received:', data);
            updateProfileUI(data);
        })
        .error(function(error) {
            console.error("Error fetching profile data:", error);
            alert("There was an error fetching your LinkedIn data. Please make sure you've set up the LinkedIn app correctly.");
        });
}

// Function to update the HTML with the fetched data
function updateProfileUI(data) {
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
    } else {
        summaryElement.textContent = "Professional summary from LinkedIn.";
    }

    // Update Profile Picture
    const pictureElement = document.getElementById('profile-picture');
    if (data.profilePicture && data.profilePicture['displayImage~'].elements.length > 0) {
        const pictureUrl = data.profilePicture['displayImage~'].elements.pop().identifiers[0].identifier;
        pictureElement.src = pictureUrl;
    }

    // Hide the sign-in button after successful login
    const signInButton = document.querySelector('.btn');
    signInButton.textContent = '✓ LinkedIn Connected';
    signInButton.disabled = true;
    signInButton.classList.remove('linkedin-blue');
    signInButton.classList.add('btn-success');
}

// Initialize the LinkedIn SDK when the page loads
window.onload = function() {
    initLinkedIn();
};
