import os
import json
import base64
import requests
from flask import Flask, render_template, request, jsonify, session
from PIL import Image
import io
from openai import OpenAI
from disease_data import CROP_DISEASES, get_treatment_recommendations
from translations import TRANSLATIONS

app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'kisan-mitra-secret-key')

# the newest OpenAI model is "gpt-5" which was released August 7, 2025.
# do not change this unless explicitly requested by the user
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Data.gov.in API configuration
DATA_GOV_API_KEY = os.environ.get("DATA_GOV_API_KEY", "")
DATA_GOV_BASE_URL = "https://api.data.gov.in/resource"

# Supported languages
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'हिंदी',
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'kn': 'ಕನ್ನಡ',
    'bn': 'বাংলা',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'pa': 'ਪੰਜਾਬੀ',
    'ml': 'മലയാളം'
}

@app.route('/')
def index():
    lang = request.args.get('lang', 'en')
    return render_template('index.html', 
                         languages=SUPPORTED_LANGUAGES,
                         current_lang=lang,
                         translations=TRANSLATIONS.get(lang, TRANSLATIONS['en']))

@app.route('/api/predict-disease', methods=['POST'])
def predict_disease():
    """Analyze crop image for disease prediction using OpenAI Vision API"""
    if not openai_client:
        return jsonify({
            'success': False,
            'error': 'OpenAI API key not configured. Please add OPENAI_API_KEY to secrets.'
        }), 400
    
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['image']
        crop_type = request.form.get('crop_type', 'unknown')
        lang = request.form.get('lang', 'en')
        
        # Read and encode image
        image_data = file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Determine image type
        img = Image.open(io.BytesIO(image_data))
        img_format = img.format.lower() if img.format else 'jpeg'
        
        # Create detailed prompt for disease analysis
        analysis_prompt = f"""You are an expert agricultural pathologist specializing in crop diseases. 
        Analyze this image of a {crop_type} plant/crop leaf carefully.
        
        Provide your analysis in the following JSON format:
        {{
            "disease_detected": true/false,
            "disease_name": "Name of the disease or 'Healthy' if no disease",
            "confidence_percentage": number between 0-100,
            "severity": "mild/moderate/severe/none",
            "symptoms_observed": ["list of visible symptoms"],
            "affected_parts": ["list of affected plant parts"],
            "possible_causes": ["list of possible causes"],
            "treatment_recommendations": [
                {{
                    "type": "chemical/organic/cultural",
                    "name": "Treatment name",
                    "description": "How to apply",
                    "timing": "When to apply"
                }}
            ],
            "prevention_measures": ["list of prevention steps"],
            "additional_notes": "Any other relevant information"
        }}
        
        Be thorough and accurate. If the image is not clear or not of a plant, indicate that in your response.
        Provide confidence percentage based on image clarity and symptom visibility."""
        
        response = openai_client.chat.completions.create(
            model="gpt-5",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": analysis_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{img_format};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=2048
        )
        
        content = response.choices[0].message.content or '{}'
        result = json.loads(content)
        
        # Enhance with local disease database if available
        if result.get('disease_name') and result['disease_name'] != 'Healthy':
            local_data = get_treatment_recommendations(crop_type, result['disease_name'])
            if local_data:
                result['local_treatments'] = local_data
        
        return jsonify({
            'success': True,
            'result': result,
            'crop_type': crop_type
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/mandi-rates')
def get_mandi_rates():
    """Fetch mandi rates from data.gov.in API"""
    try:
        state = request.args.get('state', '')
        commodity = request.args.get('commodity', '')
        
        # Using the agricultural market commodity prices API
        api_url = f"{DATA_GOV_BASE_URL}/9ef84268-d588-465a-a308-a864a43d0070"
        params = {
            'api-key': DATA_GOV_API_KEY,
            'format': 'json',
            'limit': 100
        }
        
        if state:
            params['filters[state]'] = state
        if commodity:
            params['filters[commodity]'] = commodity
        
        # For demo purposes, return sample data if API key not available
        if not DATA_GOV_API_KEY:
            sample_data = get_sample_mandi_data()
            return jsonify({
                'success': True,
                'data': sample_data,
                'source': 'sample_data',
                'message': 'Using sample data. Add DATA_GOV_API_KEY for live data.'
            })
        
        response = requests.get(api_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'success': True,
                'data': data.get('records', []),
                'source': 'data.gov.in'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to fetch data from API'
            }), 500
            
    except Exception as e:
        # Return sample data on error
        sample_data = get_sample_mandi_data()
        return jsonify({
            'success': True,
            'data': sample_data,
            'source': 'sample_data',
            'message': f'Using sample data due to API error: {str(e)}'
        })

@app.route('/api/government-schemes')
def get_government_schemes():
    """Fetch government schemes for farmers"""
    try:
        category = request.args.get('category', '')
        
        # Government schemes API
        api_url = f"{DATA_GOV_BASE_URL}/6176ee09-3d56-4a3b-8115-21841576b2f6"
        params = {
            'api-key': DATA_GOV_API_KEY,
            'format': 'json',
            'limit': 50
        }
        
        if not DATA_GOV_API_KEY:
            sample_schemes = get_sample_schemes()
            return jsonify({
                'success': True,
                'data': sample_schemes,
                'source': 'sample_data'
            })
        
        response = requests.get(api_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'success': True,
                'data': data.get('records', []),
                'source': 'data.gov.in'
            })
        else:
            sample_schemes = get_sample_schemes()
            return jsonify({
                'success': True,
                'data': sample_schemes,
                'source': 'sample_data'
            })
            
    except Exception as e:
        sample_schemes = get_sample_schemes()
        return jsonify({
            'success': True,
            'data': sample_schemes,
            'source': 'sample_data'
        })

@app.route('/api/fertilizer-prices')
def get_fertilizer_prices():
    """Fetch fertilizer and pesticide prices"""
    try:
        category = request.args.get('category', 'fertilizer')
        
        # Return comprehensive sample data
        sample_data = get_sample_fertilizer_prices(category)
        return jsonify({
            'success': True,
            'data': sample_data,
            'category': category,
            'source': 'sample_data'
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/translations/<lang>')
def get_translations(lang):
    """Get translations for a specific language"""
    if lang in TRANSLATIONS:
        return jsonify({
            'success': True,
            'translations': TRANSLATIONS[lang]
        })
    return jsonify({
        'success': False,
        'error': 'Language not supported'
    }), 404

def get_sample_mandi_data():
    """Return sample mandi data for demonstration"""
    return [
        {"state": "Punjab", "district": "Ludhiana", "market": "Ludhiana", "commodity": "Wheat", "variety": "Lokwan", "arrival_date": "2024-12-10", "min_price": 2200, "max_price": 2400, "modal_price": 2300},
        {"state": "Punjab", "district": "Amritsar", "market": "Amritsar", "commodity": "Rice", "variety": "Basmati", "arrival_date": "2024-12-10", "min_price": 3500, "max_price": 4200, "modal_price": 3800},
        {"state": "Maharashtra", "district": "Nashik", "market": "Nashik", "commodity": "Onion", "variety": "Red", "arrival_date": "2024-12-10", "min_price": 1500, "max_price": 2200, "modal_price": 1800},
        {"state": "Uttar Pradesh", "district": "Agra", "market": "Agra", "commodity": "Potato", "variety": "Jyoti", "arrival_date": "2024-12-10", "min_price": 800, "max_price": 1200, "modal_price": 1000},
        {"state": "Karnataka", "district": "Bangalore", "market": "Bangalore", "commodity": "Tomato", "variety": "Hybrid", "arrival_date": "2024-12-10", "min_price": 2000, "max_price": 3000, "modal_price": 2500},
        {"state": "Madhya Pradesh", "district": "Indore", "market": "Indore", "commodity": "Soybean", "variety": "Yellow", "arrival_date": "2024-12-10", "min_price": 4500, "max_price": 5200, "modal_price": 4800},
        {"state": "Gujarat", "district": "Rajkot", "market": "Rajkot", "commodity": "Groundnut", "variety": "Bold", "arrival_date": "2024-12-10", "min_price": 5500, "max_price": 6500, "modal_price": 6000},
        {"state": "Rajasthan", "district": "Jaipur", "market": "Jaipur", "commodity": "Mustard", "variety": "Yellow", "arrival_date": "2024-12-10", "min_price": 5000, "max_price": 5800, "modal_price": 5400},
        {"state": "Haryana", "district": "Karnal", "market": "Karnal", "commodity": "Wheat", "variety": "PBW-343", "arrival_date": "2024-12-10", "min_price": 2100, "max_price": 2350, "modal_price": 2225},
        {"state": "Tamil Nadu", "district": "Coimbatore", "market": "Coimbatore", "commodity": "Cotton", "variety": "DCH-32", "arrival_date": "2024-12-10", "min_price": 6000, "max_price": 7200, "modal_price": 6600}
    ]

def get_sample_schemes():
    """Return sample government schemes for farmers"""
    return [
        {
            "scheme_name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "description": "Direct income support of ₹6,000 per year to farmer families in three equal installments",
            "eligibility": "All landholding farmer families with cultivable land",
            "benefits": "₹6,000 per year in 3 installments of ₹2,000 each",
            "how_to_apply": "Visit pmkisan.gov.in or nearest CSC center",
            "category": "Income Support"
        },
        {
            "scheme_name": "PM Fasal Bima Yojana",
            "description": "Crop insurance scheme to provide financial support in case of crop failure",
            "eligibility": "All farmers growing notified crops in notified areas",
            "benefits": "Insurance coverage for crop loss due to natural calamities",
            "how_to_apply": "Through banks, CSC centers, or insurance companies",
            "category": "Insurance"
        },
        {
            "scheme_name": "Kisan Credit Card (KCC)",
            "description": "Credit facility for farmers for agricultural and allied activities",
            "eligibility": "Farmers, fishermen, animal husbandry farmers",
            "benefits": "Credit limit up to ₹3 lakh at 4% interest rate",
            "how_to_apply": "Apply at any bank branch with land documents",
            "category": "Credit"
        },
        {
            "scheme_name": "Soil Health Card Scheme",
            "description": "Provide soil health cards to farmers with crop-wise nutrient recommendations",
            "eligibility": "All farmers",
            "benefits": "Free soil testing and fertilizer recommendations",
            "how_to_apply": "Contact local agriculture office or Krishi Vigyan Kendra",
            "category": "Soil Health"
        },
        {
            "scheme_name": "PM Krishi Sinchai Yojana",
            "description": "Improve irrigation facilities and ensure water use efficiency",
            "eligibility": "All farmers with agricultural land",
            "benefits": "Subsidy on micro-irrigation systems (55-75%)",
            "how_to_apply": "Apply through state agriculture department",
            "category": "Irrigation"
        },
        {
            "scheme_name": "e-NAM (National Agriculture Market)",
            "description": "Online trading platform for agricultural commodities",
            "eligibility": "All farmers, traders, and buyers",
            "benefits": "Better price discovery, transparent trading",
            "how_to_apply": "Register at enam.gov.in",
            "category": "Marketing"
        },
        {
            "scheme_name": "Paramparagat Krishi Vikas Yojana",
            "description": "Promote organic farming through cluster approach",
            "eligibility": "Farmer groups willing to adopt organic farming",
            "benefits": "₹50,000 per hectare for 3 years",
            "how_to_apply": "Apply through state agriculture department",
            "category": "Organic Farming"
        },
        {
            "scheme_name": "Agriculture Infrastructure Fund",
            "description": "Financing facility for post-harvest management infrastructure",
            "eligibility": "Farmers, FPOs, cooperatives, agri-entrepreneurs",
            "benefits": "Loans with 3% interest subvention",
            "how_to_apply": "Apply online at agriinfra.dac.gov.in",
            "category": "Infrastructure"
        }
    ]

def get_sample_fertilizer_prices(category):
    """Return sample fertilizer and pesticide prices"""
    if category == 'pesticide':
        return [
            {"name": "Chlorpyrifos 20% EC", "category": "Insecticide", "brand": "Dursban", "quantity": "1 Litre", "price": 450, "usage": "For soil insects and termites"},
            {"name": "Imidacloprid 17.8% SL", "category": "Insecticide", "brand": "Confidor", "quantity": "250 ml", "price": 650, "usage": "For sucking pests"},
            {"name": "Mancozeb 75% WP", "category": "Fungicide", "brand": "Dithane M-45", "quantity": "1 kg", "price": 550, "usage": "For fungal diseases"},
            {"name": "Carbendazim 50% WP", "category": "Fungicide", "brand": "Bavistin", "quantity": "500 gm", "price": 380, "usage": "For wilt and rot diseases"},
            {"name": "Glyphosate 41% SL", "category": "Herbicide", "brand": "Round Up", "quantity": "1 Litre", "price": 520, "usage": "Non-selective weed control"},
            {"name": "2,4-D Sodium Salt 80% WP", "category": "Herbicide", "brand": "Weedmar", "quantity": "500 gm", "price": 180, "usage": "Broadleaf weed control"},
            {"name": "Lambda Cyhalothrin 5% EC", "category": "Insecticide", "brand": "Karate", "quantity": "500 ml", "price": 750, "usage": "For bollworms and caterpillars"},
            {"name": "Thiamethoxam 25% WG", "category": "Insecticide", "brand": "Actara", "quantity": "100 gm", "price": 420, "usage": "For aphids and whiteflies"}
        ]
    else:
        return [
            {"name": "Urea (46% N)", "category": "Nitrogenous", "brand": "IFFCO", "quantity": "50 kg", "price": 266.50, "subsidy": "Yes", "usage": "For vegetative growth"},
            {"name": "DAP (18-46-0)", "category": "Phosphatic", "brand": "IFFCO", "quantity": "50 kg", "price": 1350, "subsidy": "Yes", "usage": "For root development and flowering"},
            {"name": "MOP (60% K2O)", "category": "Potassic", "brand": "IPL", "quantity": "50 kg", "price": 1700, "subsidy": "Yes", "usage": "For fruit quality and disease resistance"},
            {"name": "NPK 10-26-26", "category": "Complex", "brand": "Coromandel", "quantity": "50 kg", "price": 1470, "subsidy": "Yes", "usage": "For balanced nutrition"},
            {"name": "SSP (16% P2O5)", "category": "Phosphatic", "brand": "Paradeep", "quantity": "50 kg", "price": 400, "subsidy": "Yes", "usage": "For phosphorus and sulfur"},
            {"name": "Ammonium Sulphate", "category": "Nitrogenous", "brand": "GSFC", "quantity": "50 kg", "price": 750, "subsidy": "Partial", "usage": "For nitrogen and sulfur"},
            {"name": "Zinc Sulphate", "category": "Micronutrient", "brand": "Agrichem", "quantity": "25 kg", "price": 1200, "subsidy": "No", "usage": "For zinc deficiency correction"},
            {"name": "Calcium Nitrate", "category": "Nitrogenous", "brand": "Yara", "quantity": "25 kg", "price": 1100, "subsidy": "No", "usage": "For calcium and nitrogen"}
        ]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
