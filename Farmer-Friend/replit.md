# Kisan Mitra - Agricultural Platform for Indian Farmers

## Overview

Kisan Mitra is a comprehensive multilingual agricultural platform designed to help Indian farmers with:
- AI-powered crop disease detection using image analysis
- Live mandi (market) rates from across India
- Government schemes information for farmers
- Fertilizer and pesticide price tracking
- Voice assistance in Hindi and English
- Support for 10 Indian languages

## Current State

The application is fully functional with:
- Flask backend with OpenAI Vision API integration for disease prediction
- Responsive farm-themed UI optimized for farmers
- Sample data for mandi rates, government schemes, and fertilizer prices
- Voice recognition and text-to-speech in Hindi and English
- Multilingual support for Hindi, English, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, and Malayalam

## Project Architecture

```
/
├── app.py                 # Flask application main file
├── disease_data.py        # Crop disease database with treatments
├── translations.py        # Multilingual translations
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css      # Farm-themed styles
│   └── js/
│       └── main.js        # Frontend JavaScript with voice features
├── TRAINING_GUIDE.md      # ML model training documentation
└── replit.md              # This file
```

## Key Features

### 1. Crop Disease Prediction
- Upload crop leaf images for AI analysis
- Supports wheat, rice, tomato, potato, corn, cotton, sugarcane
- Shows confidence percentage and severity level
- Provides treatment recommendations (chemical and organic)
- Includes prevention measures

### 2. Mandi Rates
- Sample data for major commodities across Indian states
- Filter by state and commodity
- Shows min, max, and modal prices
- Ready for data.gov.in API integration

### 3. Government Schemes
- PM-KISAN, PM Fasal Bima Yojana, KCC, and more
- Eligibility and benefits information
- Application guidance

### 4. Fertilizers & Pesticides
- Fertilizer prices with subsidy information
- Pesticide catalog with usage instructions
- Organized by category

### 5. Voice Assistant
- Speech recognition for Hindi and English
- Text-to-speech for reading content aloud
- Voice navigation commands

### 6. Multilingual Support
- 10 Indian languages supported
- Real-time language switching
- Localized content

## Running the Application

The application runs on port 5000 with Flask:
```bash
python app.py
```

For production:
```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port app:app
```

## Environment Variables

### Required
- `OPENAI_API_KEY`: OpenAI API key for disease prediction (Vision API)

### Optional
- `DATA_GOV_API_KEY`: data.gov.in API key for live mandi rates
- `SESSION_SECRET`: Flask session secret key

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main application page |
| `/api/predict-disease` | POST | Analyze crop image for diseases |
| `/api/mandi-rates` | GET | Get mandi market rates |
| `/api/government-schemes` | GET | Get farmer schemes |
| `/api/fertilizer-prices` | GET | Get fertilizer/pesticide prices |
| `/api/translations/<lang>` | GET | Get translations for a language |

## User Preferences

- Farm-themed green color scheme
- Large, easy-to-read fonts
- Mobile-responsive design
- High-contrast UI for outdoor visibility
- Simple navigation with voice support

## Recent Changes

- **Dec 2024**: Initial release with all core features
  - Implemented AI disease prediction with OpenAI Vision
  - Added comprehensive disease database for 7 crop types
  - Created multilingual translation system
  - Built voice assistant with Hindi/English support
  - Added sample data for mandi rates and government schemes

## Next Steps

1. Add DATA_GOV_API_KEY for live mandi rate data
2. Train custom ML model for higher accuracy (see TRAINING_GUIDE.md)
3. Add weather integration for crop advisory
4. Implement user accounts for history tracking
5. Add offline mode support
