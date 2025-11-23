fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));