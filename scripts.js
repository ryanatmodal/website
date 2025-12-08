fetch('Modular/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

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
    message.textContent = "\nThank you! We'll be in touch shortly.";
    form.appendChild(message);
    form.reset();
}

// Handle initial page load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
    }
});