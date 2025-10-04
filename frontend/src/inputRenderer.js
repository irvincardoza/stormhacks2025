console.log('Input Renderer Loaded');

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('activity-input');
    const logButton = document.getElementById('log-button');
    const cancelButton = document.getElementById('cancel-button');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');

    // Listen for reset event from main process to clear input & restore state
    if (window.electronInputAPI?.onReset) {
        window.electronInputAPI.onReset(() => {
            inputField.value = '';
            logButton.disabled = false;
            logButton.innerHTML = 'Log';
            // Do NOT auto-focus; let the user click when they are ready
        });
    }

    // Don't automatically focus - let user click to focus
    // This prevents interrupting their typing flow
    
    // Focus input field when user clicks on the window
    document.addEventListener('click', (event) => {
        // If user clicks anywhere in the window (except buttons), focus the input
        if (!event.target.closest('button')) {
            inputField?.focus();
        }
    });

    // Focus input field when user clicks directly on it
    inputField?.addEventListener('click', () => {
        inputField.focus();
    });

    const submitLog = async () => {
        const activity = inputField.value.trim();
        if (activity) { // Only log if there is text
            console.log(`Renderer sending log: ${activity}`);
            
            // Show loading state
            const originalText = logButton.innerHTML;
            logButton.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>Logging...';
            logButton.disabled = true;
            
            try {
                await window.electronInputAPI.addLog(activity);
                
                // Show success state briefly before closing
                logButton.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Logged!';
                
                setTimeout(() => {
                    window.electronInputAPI.closeInputWindow();
                }, 500);
                
            } catch (error) {
                console.error('Error sending log:', error);
                
                // Restore button state and show error
                logButton.innerHTML = originalText;
                logButton.disabled = false;
                
                // Show error feedback
                const errorMsg = document.createElement('p');
                errorMsg.className = 'text-xs text-red-500 mt-2';
                errorMsg.textContent = 'Failed to save log. Please try again.';
                logButton.parentNode.appendChild(errorMsg);
                
                setTimeout(() => {
                    errorMsg.remove();
                }, 3000);
            }
        } else {
             // If input is empty, just close the window
             console.log('Input is empty, closing window.');
             window.electronInputAPI.closeInputWindow();
        }
    };

    // Handle suggestion button clicks
    suggestionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const activity = btn.getAttribute('data-activity');
            inputField.value = activity;
            inputField.focus();
            
            // Add visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        });
    });

    // Handle log button click
    logButton.addEventListener('click', submitLog);
    
    // Handle cancel button
    cancelButton.addEventListener('click', () => {
        console.log('Cancel button clicked, closing window.');
        window.electronInputAPI.closeInputWindow();
    });

    // Handle Enter key press in the input field
    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior (if any)
            submitLog();
        }
    });
    
    // Handle Escape key to cancel
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            console.log('Escape key pressed, closing window.');
            window.electronInputAPI.closeInputWindow();
        }
    });

    // Add subtle animation on load
    setTimeout(() => {
        document.querySelector('.card').style.animation = 'fadeIn 0.3s ease-out';
    }, 50);
}); 