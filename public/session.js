// Get session ID from URL
const pathParts = window.location.pathname.split('/');
const sessionId = pathParts[2] || 'default';

// Countdown functionality
let countdownInterval;
let endDate;

async function initCountdown() {
    try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (!response.ok) {
            const errorData = await response.json();
            alert('Session not found: ' + errorData.error);
            window.location.href = '/';
            return;
        }
        
        const data = await response.json();
        endDate = new Date(data.endDate);
        document.getElementById('contactCount').textContent = data.contactCount;
        
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    } catch (error) {
        console.error('Error fetching countdown:', error);
        alert('Failed to load session. Redirecting to home...');
        window.location.href = '/';
    }
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = endDate - now;
    
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Form submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageDiv = document.getElementById('message');
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        sessionId: sessionId
    };
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            document.getElementById('contactCount').textContent = data.contactCount;
            document.getElementById('contactForm').reset();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.error || 'An error occurred';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Failed to submit contact. Please try again.';
    }
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
});

// Download VCF
document.getElementById('downloadBtn').addEventListener('click', () => {
    window.location.href = `/api/download?sessionId=${sessionId}`;
});

// Initialize on page load
initCountdown();
