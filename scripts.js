const SHOW_ANNOUNCEMENT = false;

fetch('Modular/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('main-header-placeholder').innerHTML = data;
        initHamburgerMenu();

        const bar = document.getElementById('announcement-bar');
        if (!SHOW_ANNOUNCEMENT && bar) {
            bar.remove();
        }

        adjustForAnnouncement();
        window.addEventListener('resize', adjustForAnnouncement);
    })
    .catch(error => console.error('Error loading header:', error));

function adjustForAnnouncement() {
    requestAnimationFrame(() => {
        const bar = document.getElementById('announcement-bar');
        const nav = document.querySelector('nav');
        if (bar && nav && SHOW_ANNOUNCEMENT) {
            const barHeight = bar.offsetHeight;
            nav.style.top = barHeight + 'px';
            document.documentElement.style.setProperty('--announcement-height', barHeight + 'px');
        } else {
            if (nav) nav.style.top = '0';
            document.documentElement.style.setProperty('--announcement-height', '0px');
        }
    });
}

fetch('Modular/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

fetch('Modular/story-box.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('story-box-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading story box:', error));

async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);
    const params = new URLSearchParams(data);

    fetch("https://script.google.com/macros/s/AKfycbzKAeY6wHrEoZRfO5On7h0duI2meTHCOQVlzXQNrDAPOhBJBx40HL4MW5X-s4tG6hbv/exec", {
        method: "POST",
        body: params
    }).catch(console.error);

    const message = document.createElement("p");
    message.textContent = "\nThank you! We'll get back to you within 24 hours.";
    form.appendChild(message);
    form.reset();
}

/* Borger */
function initHamburgerMenu() {
    console.log('Initializing hamburger menu');
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    console.log('Hamburger:', hamburger);
    console.log('Nav links:', navLinks);

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Hamburger clicked');
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            console.log('Nav links classes:', navLinks.classList);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Mobile dropdown toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    console.log('Found dropdowns:', dropdowns.length);

    dropdowns.forEach((dropdown, index) => {
        const toggle = dropdown.querySelector('a:first-child');
        console.log(`Dropdown ${index} toggle:`, toggle);
        
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                console.log('Dropdown clicked, window width:', window.innerWidth);
                // Only prevent default and toggle on mobile
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Toggling dropdown');
                    
                    // Close other dropdowns
                    dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                        }
                    });
                    
                    dropdown.classList.toggle('active');
                    console.log('Dropdown classes:', dropdown.classList);
                }
            });
        }
    });

    // Close menu when window is resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && hamburger && navLinks) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
    }
});