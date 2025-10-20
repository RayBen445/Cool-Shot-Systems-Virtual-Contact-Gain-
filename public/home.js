// Create session functionality
document.getElementById('createSessionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const days = document.getElementById('days').value;
    
    try {
        const response = await fetch('/api/session/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ days: parseInt(days) })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const fullUrl = window.location.origin + data.shareUrl;
            document.getElementById('shareLink').value = fullUrl;
            document.getElementById('sessionInfo').style.display = 'block';
        } else {
            alert('Failed to create session: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to create session. Please try again.');
    }
});

// Copy link functionality
document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(shareLink.value).then(() => {
        const btn = document.getElementById('copyLinkBtn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });
});
