let branchCount = 0;

// Function to add a new branch
function addBranch() {
    branchCount++;
    const branchSection = document.createElement('div');
    branchSection.classList.add('branch-section');
    branchSection.setAttribute('data-branch-id', branchCount);
    branchSection.innerHTML = `
        <h3>Branch ${branchCount}</h3>
        <label for="branchNameEn${branchCount}">Branch Name English | اسم الفرع بالانجليزية</label>
        <input type="text" id="branchNameEn${branchCount}" name="branchName[]" required class="form-control mb-2">

        <label for="branchNameAr${branchCount}">Branch Name Arabic | اسم الفرع عربي </label>
        <input type="text" id="branchNameAr${branchCount}" name="branchName[]" required class="form-control mb-2">

        <label for="branchAddress${branchCount}">Branch Google Maps URL | رابط الفرع على خرائط جوجل</label>
        <input type="text" id="branchAddress${branchCount}" name="branchAddress[]" required class="form-control mb-2">
        <div class="invalid-feedback"></div> <!-- For error message -->

        <button type="button" class="remove-btn btn btn-danger mt-2" onclick="removeBranch(this)">Remove Branch</button>
    `;
    document.getElementById('branchesContainer').appendChild(branchSection);

    // Add event listener for real-time validation of Google Maps URL
    const branchAddressInput = branchSection.querySelector(`#branchAddress${branchCount}`);
    branchAddressInput.addEventListener('input', () => validateGoogleMapsUrl(branchAddressInput));
}

// Function to remove a branch
function removeBranch(button) {
    button.parentElement.remove();
    branchCount--;
    updateBranchIds();
}

// Function to update branch IDs after one is removed
function updateBranchIds() {
    const branchSections = document.querySelectorAll('.branch-section');
    branchSections.forEach((branchSection, index) => {
        const newBranchId = index + 1;
        branchSection.setAttribute('data-branch-id', newBranchId);
        branchSection.querySelector('h3').textContent = `Branch ${newBranchId}`;
    });
}

function validateGoogleMapsUrl(inputElement) {
    const googleMapsRegex = /^https?:\/\/(www\.)?(google\.[a-z]{2,3}(\.[a-z]{2})?\/maps\/.+|maps\.app\.goo\.gl\/[a-zA-Z0-9]+(\?.*)?)$/;
    const isValid = googleMapsRegex.test(inputElement.value);

    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        inputElement.nextElementSibling.textContent = ""; // Clear any error message
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        inputElement.nextElementSibling.textContent = "Please enter a valid Google Maps URL.";
    }
}


function validateEmail(inputElement) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(inputElement.value);

    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        inputElement.nextElementSibling.textContent = ""; // Clear any error message
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        inputElement.nextElementSibling.textContent = "Please enter a valid email address.";
    }
}

// Function to upload an image to the server
async function uploadImage(fileInput) {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file to upload.");
        return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch('https://kz-admin.onrender.com/form/upload-img', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data = await response.json();
        console.log("Uploaded Image URL:", data.url);
        return data.url; // Return the URL of the uploaded image
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
        return null;
    }
}

// Function to collect form data, including image URLs
async function collectFormData() {
    const storeNameEnglish = document.getElementById('storeNameEnglish').value;
    const storeNameArabic = document.getElementById('storeNameArabic').value;
    const storeEmail = document.getElementById('storeEmail').value;
    // Upload the images and get their URLs
    const storeLogoUrl = await uploadImage(document.getElementById('storeLogo'));
    const storeBackgroundUrl = await uploadImage(document.getElementById('storeBackground'));

    if (!storeLogoUrl || !storeBackgroundUrl) {
        alert("Image upload failed. Please try again.");
        return null;
    }

    const branches = [];
    const branchSections = document.querySelectorAll('.branch-section');
    branchSections.forEach(branch => {        
        const branchNameEn = branch.querySelector(`[id^="branchNameEn"]`).value;
        const branchNameAr = branch.querySelector(`[id^="branchNameAr"]`).value;
        const branchAddress = branch.querySelector(`[id^="branchAddress"]`).value;

        const branchInfo = {
            branchNameEnglish: branchNameEn,
            branchNameArabic: branchNameAr,
            branchAddress: branchAddress
        };
        branches.push(branchInfo);
    });

    const formData = {
        storeEmail: storeEmail,
        storeNameEnglish: storeNameEnglish,
        storeNameArabic: storeNameArabic,
        storeLogoUrl: storeLogoUrl,
        storeBackgroundUrl: storeBackgroundUrl,
        branches: branches
    };

    return formData;
}
async function submitData(formData) {
    try {
        const response = await fetch('https://kz-admin.onrender.com/form/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Specify the content type
            },
            body: JSON.stringify({ formData }) // Convert the formData to JSON format
        });

        const data = await response.json();
        alert(data.message);
        if (!response.ok) {
            throw new Error(data.message || "Failed to submit");
        }
        return true; 
    } catch (error) {
        alert("An error occurred: " + error.message); // Show a more descriptive error message
        return false;
    }
}


// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    showLoadingOverlay(); // Show the loading overlay

    const formData = await collectFormData();
    if (!formData) {
        hideLoadingOverlay(); // Hide the loading overlay if failed
        return; // Stop if image upload failed
    }

    const submitted = await submitData(formData);
    if (!submitted){
        hideLoadingOverlay(); // Hide the loading overlay if failed
        return;
    };
    // Additional code to send formData to the server can be added here
    alert("Form submitted successfully!");
    hideLoadingOverlay(); // Hide the loading overlay
    window.location.href = 'success.html';
}

// Function to show the loading overlay
function showLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Function to hide the loading overlay
function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Automatically add the first branch when the page loads
window.onload = function () {
    addBranch();
};

// Add event listener for form submission
document.getElementById('storeForm').addEventListener('submit', handleSubmit);

document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById('storeEmail');
    emailInput.addEventListener('input', () => validateEmail(emailInput));

    // Add a div for error messages below the input field
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    emailInput.parentElement.appendChild(errorDiv);
});
