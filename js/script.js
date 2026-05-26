document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Header - Toggle Profile
    const header = document.getElementById('main-header');
    const profileSection = document.getElementById('profile-section');
    const clickHint = document.querySelector('.click-hint i');

    header.addEventListener('click', () => {
        profileSection.classList.toggle('hidden');
        if (profileSection.classList.contains('hidden')) {
            clickHint.classList.remove('fa-chevron-up');
            clickHint.classList.add('fa-chevron-down');
        } else {
            clickHint.classList.remove('fa-chevron-down');
            clickHint.classList.add('fa-chevron-up');
        }
    });

    // 2. Toggle Deep Content in Projects
    const toggleButtons = document.querySelectorAll('.toggle-deep-content');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find the closest deep-content element to handle clicks on the icon inside the button
            const targetBtn = e.currentTarget;
            const deepContent = targetBtn.nextElementSibling;
            const icon = targetBtn.querySelector('i');
            
            deepContent.classList.toggle('hidden');
            
            if (deepContent.classList.contains('hidden')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });

    // 3. Set Current Year in Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 4. Chatbot UI Toggle
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chat-close');

    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.remove('hidden');
    });

    chatClose.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });

    // 5. EmailJS Setup & Form Submission
    emailjs.init("qMGiGB4Vd73UkGKzx");

    const contactForm = document.getElementById('contact-form');
    const chatStatus = document.getElementById('chat-status');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('sender-name').value;
        const email = document.getElementById('sender-email').value;
        const message = document.getElementById('sender-message').value;

        // Visual feedback
        chatStatus.textContent = "Sending...";
        chatStatus.className = "";
        chatStatus.classList.remove('hidden');
        
        const templateParams = {
            from_name: name,
            from_email: email,
            message: message
        };

        emailjs.send('service_t2zneb1', 'template_hwwj18o', templateParams)
            .then(function(response) {
                chatStatus.textContent = "Message sent successfully!";
                chatStatus.className = "success";
                contactForm.reset();
                setTimeout(() => {
                    chatbotWindow.classList.add('hidden');
                    chatStatus.classList.add('hidden');
                }, 3000);
            }, function(error) {
                chatStatus.textContent = "Failed to send message. Try again.";
                chatStatus.className = "error";
            });
    });
});
