let currentImageIndex = 0;
const responses = {};

document.addEventListener('DOMContentLoaded', function() {
    // Wait for config to load
    setTimeout(initializeEvaluation, 100);
});

function initializeEvaluation() {
    if (!CONFIG || !CONFIG.IMAGES || CONFIG.IMAGES.length === 0) {
        document.getElementById('questionsContainer').innerHTML = 
            '<p style="color: red;">No images configured. Please run generate_config.py to build the configuration.</p>';
        return;
    }
    
    loadImage(currentImageIndex);
    setupEventListeners();
}

function loadImage(index) {
    if (index >= CONFIG.IMAGES.length) {
        showCompletionMessage();
        return;
    }
    
    const image = CONFIG.IMAGES[index];
    document.getElementById('evaluationImage').src = image.imageUrl;
    
    // Create display with species name and class
    const displayText = `${image.displayName} (${image.class})`;
    document.getElementById('imageName').textContent = displayText;
    
    // Show other species in class
    const otherSpeciesDiv = document.getElementById('otherSpecies');
    if (image.otherSpeciesInClass && image.otherSpeciesInClass.length > 0) {
        otherSpeciesDiv.innerHTML = `
            <div style="margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 6px; border-left: 4px solid #28a745;">
                <strong>Other species in ${image.class}:</strong>
                <div style="margin-top: 8px; font-size: 14px; color: #555;">
                    ${image.otherSpeciesInClass.join(', ')}
                </div>
            </div>
        `;
    } else {
        otherSpeciesDiv.innerHTML = '';
    }
    
    renderQuestions(image);
    updateProgressIndicator(index + 1);
    window.scrollTo(0, 0);
}

function renderQuestions(image) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    if (!image.descriptors || image.descriptors.length === 0) {
        container.innerHTML = '<p style="color: #666;">No descriptors available for this image.</p>';
        return;
    }
    
    image.descriptors.forEach((descriptor, qIndex) => {
        const questionId = `${image.id}_d${qIndex}`;
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.textContent = descriptor;
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'question-options';
        
        // Yes/No options
        const yesOption = createOption(questionId, 'yes', 'Yes');
        const noOption = createOption(questionId, 'no', 'No');
        
        optionsDiv.appendChild(yesOption);
        optionsDiv.appendChild(noOption);
        
        questionDiv.appendChild(questionText);
        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
        
        // Restore previous answer if it exists
        if (responses[questionId]) {
            document.getElementById(questionId + '_' + responses[questionId]).checked = true;
        }
    });
}

function createOption(questionId, value, label) {
    const optionGroup = document.createElement('div');
    optionGroup.className = 'option-group';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = questionId;
    radio.id = questionId + '_' + value;
    radio.value = value;
    radio.addEventListener('change', function() {
        responses[questionId] = value;
    });
    
    const labelElem = document.createElement('label');
    labelElem.htmlFor = radio.id;
    labelElem.textContent = label;
    
    optionGroup.appendChild(radio);
    optionGroup.appendChild(labelElem);
    
    return optionGroup;
}

function setupEventListeners() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', handleSubmit);
}

function handleSubmit() {
    const image = CONFIG.IMAGES[currentImageIndex];
    
    if (!image.descriptors || image.descriptors.length === 0) {
        alert('No descriptors to submit.');
        return;
    }
    
    // Check all answers
    const unanswered = image.descriptors.some((_, qIndex) => 
        !responses[`${image.id}_d${qIndex}`]
    );
    
    if (unanswered) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    // Prepare data to send to Google Sheet
    const answers = image.descriptors.map((_, qIndex) => 
        responses[`${image.id}_d${qIndex}`]
    );
    
    sendToGoogleSheet(image.id, image.species, image.displayName, answers, image.descriptors);
    
    // Move to next image
    currentImageIndex++;
    
    if (currentImageIndex < CONFIG.IMAGES.length) {
        showSuccessMessage();
        setTimeout(() => {
            document.getElementById('successMessage').style.display = 'none';
            loadImage(currentImageIndex);
        }, 2000);
    } else {
        showCompletionMessage();
    }
}

function sendToGoogleSheet(imageId, species, displayName, answers, descriptors) {
    // This function sends data to your Google Apps Script endpoint
    // Set CONFIG.FORM_URL to your deployed Google Apps Script URL
    
    if (!CONFIG.FORM_URL || CONFIG.FORM_URL === 'YOUR_GOOGLE_FORM_URL_HERE') {
        console.log('No Google Sheet endpoint configured. Logging locally only.');
        console.log('Submitted:', {imageId, species, displayName, answers});
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        imageId: imageId,
        species: species,
        displayName: displayName,
        descriptors: descriptors,
        answers: answers
    };
    
    // Send to Google Apps Script
    fetch(CONFIG.FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(error => console.error('Error submitting to sheet:', error));
}

function showSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    successMsg.style.display = 'block';
}

function updateProgressIndicator(current) {
    const total = CONFIG.IMAGES.length;
    const percent = Math.round((current / total) * 100);
    
    let progressDiv = document.getElementById('progressIndicator');
    if (!progressDiv) {
        progressDiv = document.createElement('div');
        progressDiv.id = 'progressIndicator';
        document.querySelector('.container').insertBefore(progressDiv, document.querySelector('h1'));
    }
    
    progressDiv.innerHTML = `<p style="color: #666; font-size: 14px; margin-bottom: 10px;">Image ${current} of ${total} (${percent}%)</p>`;
}

function showCompletionMessage() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h2 style="color: #28a745; margin-bottom: 10px;">✓ Evaluation Complete!</h2>
            <p style="color: #666; font-size: 16px;">Thank you for evaluating all ${CONFIG.IMAGES.length} images!</p>
        </div>
    `;
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('otherSpecies').innerHTML = '';
}
