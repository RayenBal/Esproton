async function fetchJobListings() {
    try {
        const response = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=X4mFI08fH2mTxV6pgIai2d3ZtAY4Ggneph4BSLAN_duZOchxkPM6t96rULk-0B5nAwQPcJ4G6g4hdqeXYoMdCz51ceEFTdpmm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnHWCnNRtxhiFoah4klHZscYQGN5zGlWpaZ2t-2KYP');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jobOffers = await response.json();
        console.log('Fetched Job Offers:', jobOffers);

        jobOffers.forEach(offer => {
            if (!offer["Type de l'activité"]) {
                offer["Type de l'activité"] = "Not Specified";
            }
        });

        displayJobListings(jobOffers);
    } catch (error) {
        console.error('Error fetching job listings:', error);
        const jobListingsDiv = document.getElementById('job-listings');
        jobListingsDiv.innerHTML = '<p>Error fetching job listings. Please try again later.</p>';
    }
}

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    console.log('ID:', profile.getId());
    console.log('Name:', profile.getName());
    console.log('Image URL:', profile.getImageUrl());
    console.log('Email:', profile.getEmail());

    const id_token = googleUser.getAuthResponse().id_token;
    // Send id_token to your server for verification if needed
}

function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        console.log('User signed out.');
    });
}

function fetchSavedJobs() {
    const savedJobList = JSON.parse(localStorage.getItem('savedJobList')) || [];
    displaySavedJobs(savedJobList);
}

function displaySavedJobs(jobs) {
    const savedJobsDiv = document.getElementById('saved-jobs');
    savedJobsDiv.innerHTML = '';

    if (jobs.length === 0) {
        savedJobsDiv.innerHTML = '<p>No saved job offers.</p>';
        return;
    }

    jobs.forEach((job, index) => {
        const jobItem = document.createElement('div');
        jobItem.className = 'col-md-4 mb-4 saved-job';
        jobItem.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${job["Nom de l'organisme :"]}</h5>
                    <p class="card-text"><strong>Email:</strong> ${job["Email (contact principal)"]}</p>
                    <p class="card-text"><strong>Description:</strong> ${job["Description de l'activité"]}</p>
                    <p class="card-text"><strong>Type:</strong> ${job["Type de l'activité"] || "Not Specified"}</p>
                    <button class="btn btn-danger remove-job" data-job-index="${index}">Remove Job</button>
                </div>
            </div>
        `;
        savedJobsDiv.appendChild(jobItem);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-job').forEach(button => {
        button.addEventListener('click', function() {
            const jobIndex = this.getAttribute('data-job-index');
            removeSavedJob(jobIndex);
        });
    });
}

function removeSavedJob(index) {
    let savedJobList = JSON.parse(localStorage.getItem('savedJobList')) || [];
    savedJobList.splice(index, 1); // Remove the job from the array
    localStorage.setItem('savedJobList', JSON.stringify(savedJobList));
    displaySavedJobs(savedJobList); // Refresh the displayed jobs
}

function initGoogleSignIn() {
    gapi.load('auth2', async () => {
        await gapi.auth2.init({
            client_id: '147657062495-4j1542bp1fl6v08jqa27mdv2e7088pt0.apps.googleusercontent.com', // Replace with your Google Client ID
            scope: 'profile email'
        });

        gapi.signin2.render('g_id_signin', {
            'scope': 'profile email',
            'width': 200,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSignIn,
            'onfailure': (error) => {
                console.error('Google Sign-In failed:', error);
            }
        });
    });
}

function displayJobListings(offers) {
    const jobListingsDiv = document.getElementById('job-listings');
    jobListingsDiv.innerHTML = '';

    if (offers.length === 0) {
        jobListingsDiv.innerHTML = '<p>No job listings available.</p>';
        return;
    }

    offers.forEach(listing => {
        const jobItem = document.createElement('div');
        jobItem.className = 'col-md-4 mb-4';
        jobItem.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${listing["Nom de l'organisme :"] || "Unknown Organization"}</h5>
                    <p class="card-text"><strong>Email:</strong> ${listing["Email (contact principal)"] || "N/A"}</p>
                    <p class="card-text"><strong>Date de début:</strong> ${listing["Date de debut"] ? new Date(listing["Date de debut"]).toLocaleDateString() : "N/A"}</p>
                    <p class="card-text"><strong>Description:</strong> ${listing["Description de l'activité"] || "N/A"}</p>
                    <p class="card-text"><strong>Type:</strong> ${listing["Type de l'activité"] || "Not Specified"}</p>
                    <p class="card-text"><strong>Conditions:</strong> ${listing["Conditions "] || "N/A"}</p>
                    <p class="card-text"><strong>Public Cible:</strong> ${listing["Public Cible"] || "N/A"}</p>
                    <p class="card-text"><strong>Population Cible:</strong> ${listing["Population Cible "] || "N/A"}</p>
                </div>
            </div>
        `;
        jobListingsDiv.appendChild(jobItem);
    });
}

// LinkedIn Functions
function onLinkedInLoad() {
    document.getElementById('linkedinButton').onclick = function () {
        const clientId = '77k3se6bxqiuzo'; // Correct LinkedIn Client ID
        const redirectUri = encodeURIComponent('http://127.0.0.1:5500/index.html'); // Replace with your actual redirect URI
        const scope = 'r_liteprofile r_emailaddress';
        const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        
        window.location.href = url;
    };
}


function getAccessToken(authCode) {
    const clientId = '77k3se6bxqiuzo'; // Replace with your LinkedIn Client ID
    const clientSecret = 'vu8GHvbYku3IHkzg'; // Keep this secure
    const redirectUri = encodeURIComponent('http://127.0.0.1:5500/index.html'); // Update as needed

    fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            console.log('Access Token:', data.access_token);
            fetchLinkedInProfile(data.access_token);
            fetchLinkedInEmail(data.access_token);
        } else {
            console.error('Error retrieving access token:', data);
        }
    })
    .catch(error => console.error('Error fetching access token:', error));
}

// Fetch LinkedIn profile data
async function fetchLinkedInProfile(accessToken) {
    const response = await fetch('https://api.linkedin.com/v2/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        const profileData = await response.json();
        console.log('LinkedIn Profile Data:', profileData);
        // Handle profile data as needed
    } else {
        console.error('Error fetching LinkedIn profile:', response.status, response.statusText);
    }
}

// Fetch LinkedIn email address
async function fetchLinkedInEmail(accessToken) {
    const response = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        const emailData = await response.json();
        console.log('LinkedIn Email Data:', emailData);
        // Handle email data as needed
    } else {
        console.error('Error fetching LinkedIn email:', response.status, response.statusText);
    }
}

// Initialize Google Sign-In and fetch job listings on page load
window.onload = function() {
    fetchJobListings();
    initGoogleSignIn();

    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode) {
        getAccessToken(authCode);
    }
};
