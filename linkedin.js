// Manual LinkedIn OAuth Integration
const LINKEDIN_CLIENT_ID = '789fpgwdxweuiv'; // 🎯 REPLACE THIS
const REDIRECT_URI = window.location.origin;

function startLinkedInAuth() {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=r_liteprofile&state=123456`;
    window.location.href = authUrl;
}

function enableLinkedInButton() {
    const button = document.getElementById('linkedin-button');
    button.disabled = false;
    button.innerHTML = '<i class="bi bi-linkedin"></i> Import from LinkedIn';
    button.onclick = startLinkedInAuth;
}

// Check if we have an authorization code in URL
function checkForAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // We have an auth code - fetch profile data
        fetchProfileData(code);
        return true;
    }
    return false;
}

async function fetchProfileData(authCode) {
    try {
        // Note: This would normally require a server due to CORS
        // For demo, we'll use a proxy approach or show instructions
        showMessage('Authorization successful! For full implementation, you would now exchange the code for an access token via a server.', 'success');
        
        // Clear the code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to fetch profile data', 'error');
    }
}

function showMessage(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3`;
    alert.textContent = message;
    document.querySelector('.container').appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!checkForAuthCode()) {
        enableLinkedInButton();
    }
});
