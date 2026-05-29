let currentLang = window.currentLang || 'en';
let translations = window.translations || {};
let recognition = null;
let synthesis = window.speechSynthesis;
let isListening = false;
let isSpeaking = false;

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initImageUpload();
    initVoiceAssistant();
    initTTS();
    loadMandiRates();
    loadSchemes();
    loadFertilizerPrices('fertilizer');
    initTabButtons();
    initLanguageSelector();
    initMobileMenu();
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            navigateTo(sectionId);
        });
    });
}

function navigateTo(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initImageUpload() {
    const uploadBox = document.getElementById('upload-box');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const changeImageBtn = document.getElementById('change-image');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    uploadBox.addEventListener('click', () => imageInput.click());
    
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary-green)';
        uploadBox.style.background = 'var(--light-green)';
    });
    
    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--accent-green)';
        uploadBox.style.background = 'var(--pale-green)';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--accent-green)';
        uploadBox.style.background = 'var(--pale-green)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    imageInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleImageFile(this.files[0]);
        }
    });
    
    changeImageBtn.addEventListener('click', function() {
        imageInput.value = '';
        uploadBox.style.display = 'block';
        imagePreview.style.display = 'none';
        analyzeBtn.disabled = true;
        document.getElementById('results-area').style.display = 'none';
    });
    
    analyzeBtn.addEventListener('click', analyzeDisease);
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('preview-image');
        const uploadBox = document.getElementById('upload-box');
        const imagePreview = document.getElementById('image-preview');
        const analyzeBtn = document.getElementById('analyze-btn');
        
        previewImage.src = e.target.result;
        uploadBox.style.display = 'none';
        imagePreview.style.display = 'block';
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

async function analyzeDisease() {
    const imageInput = document.getElementById('image-input');
    const cropType = document.getElementById('crop-type').value;
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsArea = document.getElementById('results-area');
    
    if (!imageInput.files.length) {
        alert('Please upload an image first.');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (translations.analyzing || 'Analyzing...');
    
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('crop_type', cropType);
    formData.append('lang', currentLang);
    
    try {
        const response = await fetch('/api/predict-disease', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.result);
        } else {
            alert(data.error || 'An error occurred during analysis.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze image. Please try again.');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> ' + (translations.analyze || 'Analyze Disease');
    }
}

function displayResults(result) {
    const resultsArea = document.getElementById('results-area');
    const diseaseStatus = document.getElementById('disease-status');
    const statusText = document.getElementById('status-text');
    const confidenceValue = document.getElementById('confidence-value');
    const resultDetails = document.getElementById('result-details');
    
    resultsArea.style.display = 'block';
    
    const isHealthy = !result.disease_detected || result.disease_name === 'Healthy';
    
    diseaseStatus.className = 'disease-status ' + (isHealthy ? 'healthy' : 'diseased');
    diseaseStatus.querySelector('i').className = isHealthy ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    statusText.textContent = result.disease_name || (isHealthy ? (translations.healthy_plant || 'Healthy Plant') : (translations.disease_detected || 'Disease Detected'));
    
    confidenceValue.textContent = result.confidence_percentage + '%';
    
    let detailsHTML = '';
    
    if (result.severity && result.severity !== 'none') {
        detailsHTML += `
            <div class="result-section">
                <h4><i class="fas fa-thermometer-half"></i> ${translations.severity || 'Severity'}</h4>
                <p style="text-transform: capitalize; color: ${getSeverityColor(result.severity)}">${result.severity}</p>
            </div>
        `;
    }
    
    if (result.symptoms_observed && result.symptoms_observed.length > 0) {
        detailsHTML += `
            <div class="result-section">
                <h4><i class="fas fa-eye"></i> ${translations.symptoms || 'Symptoms Observed'}</h4>
                <ul>
                    ${result.symptoms_observed.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (result.treatment_recommendations && result.treatment_recommendations.length > 0) {
        detailsHTML += `
            <div class="result-section">
                <h4><i class="fas fa-prescription"></i> ${translations.treatment || 'Treatment Recommendations'}</h4>
                ${result.treatment_recommendations.map(t => `
                    <div class="treatment-card ${t.type || 'general'}">
                        <h5>${t.name}</h5>
                        <p><strong>${translations.dosage || 'Dosage'}:</strong> ${t.dosage || t.description || 'As recommended'}</p>
                        <p><strong>${translations.timing || 'Timing'}:</strong> ${t.timing || 'As needed'}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (result.prevention_measures && result.prevention_measures.length > 0) {
        detailsHTML += `
            <div class="result-section">
                <h4><i class="fas fa-shield-alt"></i> ${translations.prevention || 'Prevention Measures'}</h4>
                <ul>
                    ${result.prevention_measures.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (result.additional_notes) {
        detailsHTML += `
            <div class="result-section">
                <h4><i class="fas fa-info-circle"></i> Additional Notes</h4>
                <p>${result.additional_notes}</p>
            </div>
        `;
    }
    
    resultDetails.innerHTML = detailsHTML;
    
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getSeverityColor(severity) {
    const colors = {
        'mild': '#4caf50',
        'moderate': '#ff9800',
        'severe': '#f44336'
    };
    return colors[severity.toLowerCase()] || '#666666';
}

async function loadMandiRates() {
    const tbody = document.getElementById('mandi-tbody');
    const loading = document.getElementById('mandi-loading');
    const table = document.getElementById('mandi-table');
    
    loading.style.display = 'flex';
    table.style.display = 'none';
    
    try {
        const state = document.getElementById('state-filter').value;
        const commodity = document.getElementById('commodity-filter').value;
        
        const params = new URLSearchParams();
        if (state) params.append('state', state);
        if (commodity) params.append('commodity', commodity);
        
        const response = await fetch(`/api/mandi-rates?${params}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            tbody.innerHTML = data.data.map(item => `
                <tr>
                    <td>${item.state}</td>
                    <td>${item.market || item.district}</td>
                    <td>${item.commodity}</td>
                    <td>₹${item.min_price}</td>
                    <td>₹${item.max_price}</td>
                    <td><strong>₹${item.modal_price}</strong></td>
                </tr>
            `).join('');
            table.style.display = 'table';
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">${translations.no_data || 'No data available'}</td></tr>`;
            table.style.display = 'table';
        }
    } catch (error) {
        console.error('Error loading mandi rates:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${translations.error || 'Error loading data'}</td></tr>`;
        table.style.display = 'table';
    } finally {
        loading.style.display = 'none';
    }
}

async function loadSchemes() {
    const grid = document.getElementById('schemes-grid');
    const loading = document.getElementById('schemes-loading');
    
    loading.style.display = 'flex';
    grid.innerHTML = '';
    
    try {
        const response = await fetch('/api/government-schemes');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            grid.innerHTML = data.data.map(scheme => `
                <div class="scheme-card">
                    <div class="scheme-header">
                        <h3>${scheme.scheme_name}</h3>
                        ${scheme.category ? `<span class="scheme-category">${scheme.category}</span>` : ''}
                    </div>
                    <div class="scheme-body">
                        <div class="scheme-item">
                            <label>Description</label>
                            <p>${scheme.description}</p>
                        </div>
                        <div class="scheme-item">
                            <label>${translations.eligibility || 'Eligibility'}</label>
                            <p>${scheme.eligibility}</p>
                        </div>
                        <div class="scheme-item">
                            <label>${translations.benefits || 'Benefits'}</label>
                            <p>${scheme.benefits}</p>
                        </div>
                        <div class="scheme-item">
                            <label>${translations.how_to_apply || 'How to Apply'}</label>
                            <p>${scheme.how_to_apply}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = `<p style="text-align: center; color: #666;">${translations.no_data || 'No schemes available'}</p>`;
        }
    } catch (error) {
        console.error('Error loading schemes:', error);
        grid.innerHTML = `<p style="text-align: center; color: red;">${translations.error || 'Error loading data'}</p>`;
    } finally {
        loading.style.display = 'none';
    }
}

async function loadFertilizerPrices(category) {
    const tbody = document.getElementById('fertilizer-tbody');
    const loading = document.getElementById('fertilizer-loading');
    const table = document.getElementById('fertilizer-table');
    
    loading.style.display = 'flex';
    table.style.display = 'none';
    
    try {
        const response = await fetch(`/api/fertilizer-prices?category=${category}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            tbody.innerHTML = data.data.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.brand}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>${item.usage}</td>
                </tr>
            `).join('');
            table.style.display = 'table';
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">${translations.no_data || 'No data available'}</td></tr>`;
            table.style.display = 'table';
        }
    } catch (error) {
        console.error('Error loading fertilizer prices:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${translations.error || 'Error loading data'}</td></tr>`;
        table.style.display = 'table';
    } finally {
        loading.style.display = 'none';
    }
}

function initTabButtons() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-tab');
            loadFertilizerPrices(category);
        });
    });
    
    document.getElementById('search-mandi').addEventListener('click', loadMandiRates);
}

function initLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', async function() {
        const newLang = this.value;
        try {
            const response = await fetch(`/api/translations/${newLang}`);
            const data = await response.json();
            
            if (data.success) {
                currentLang = newLang;
                translations = data.translations;
                updatePageTranslations();
            }
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    });
}

function updatePageTranslations() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
    
    document.getElementById('app-name').textContent = translations.app_name || 'Kisan Mitra';
    document.getElementById('welcome-text').textContent = translations.welcome_message || 'Welcome to Kisan Mitra!';
}

function initVoiceAssistant() {
    const voiceToggle = document.getElementById('voice-toggle');
    const voicePanel = document.getElementById('voice-panel');
    const voiceClose = document.getElementById('voice-close');
    const startListening = document.getElementById('start-listening');
    const stopSpeaking = document.getElementById('stop-speaking');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            handleVoiceCommand(transcript);
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            updateVoiceStatus('Error: ' + event.error);
            isListening = false;
            voiceToggle.classList.remove('active');
        };
        
        recognition.onend = function() {
            isListening = false;
            voiceToggle.classList.remove('active');
        };
    }
    
    voiceToggle.addEventListener('click', function() {
        voicePanel.classList.toggle('active');
    });
    
    voiceClose.addEventListener('click', function() {
        voicePanel.classList.remove('active');
        if (isListening) {
            recognition.stop();
            isListening = false;
        }
        if (isSpeaking) {
            synthesis.cancel();
            isSpeaking = false;
        }
    });
    
    startListening.addEventListener('click', function() {
        if (recognition) {
            if (isListening) {
                recognition.stop();
                isListening = false;
                voiceToggle.classList.remove('active');
            } else {
                recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
                recognition.start();
                isListening = true;
                voiceToggle.classList.add('active');
                updateVoiceStatus(translations.voice_help || 'Listening... Speak now');
            }
        } else {
            alert('Speech recognition is not supported in your browser.');
        }
    });
    
    stopSpeaking.addEventListener('click', function() {
        if (isSpeaking) {
            synthesis.cancel();
            isSpeaking = false;
        }
    });
}

function handleVoiceCommand(command) {
    const lowerCommand = command.toLowerCase();
    updateVoiceStatus('You said: ' + command);
    
    const navCommands = {
        'home': ['home', 'होम', 'घर', 'मुख्य'],
        'disease': ['disease', 'रोग', 'बीमारी', 'crop disease', 'फसल रोग'],
        'mandi': ['mandi', 'मंडी', 'market', 'बाजार', 'rate', 'भाव'],
        'schemes': ['scheme', 'योजना', 'government', 'सरकारी'],
        'fertilizers': ['fertilizer', 'उर्वरक', 'खाद', 'pesticide', 'कीटनाशक']
    };
    
    for (const [section, keywords] of Object.entries(navCommands)) {
        for (const keyword of keywords) {
            if (lowerCommand.includes(keyword)) {
                navigateTo(section);
                speak(`Navigating to ${section} section`);
                return;
            }
        }
    }
    
    speak('I heard: ' + command + '. You can say home, disease, mandi, schemes, or fertilizers to navigate.');
}

function updateVoiceStatus(message) {
    document.getElementById('voice-status').textContent = message;
}

function speak(text) {
    if (synthesis) {
        synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        
        utterance.onstart = () => { isSpeaking = true; };
        utterance.onend = () => { isSpeaking = false; };
        
        synthesis.speak(utterance);
    }
}

function initTTS() {
    const readAloudBtn = document.getElementById('read-aloud');
    
    readAloudBtn.addEventListener('click', function() {
        if (isSpeaking) {
            synthesis.cancel();
            isSpeaking = false;
            return;
        }
        
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            const textContent = getReadableContent(activeSection);
            if (textContent) {
                speak(textContent);
            }
        }
    });
}

function getReadableContent(section) {
    const elementsToRead = section.querySelectorAll('h1, h2, h3, p, .scheme-item p, .result-section p, .result-section li');
    let content = [];
    elementsToRead.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 2) {
            content.push(text);
        }
    });
    return content.slice(0, 20).join('. ');
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}
