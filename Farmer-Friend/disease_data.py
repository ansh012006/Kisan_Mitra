"""
Comprehensive database of crop diseases, symptoms, and treatment recommendations.
This data is used to enhance AI predictions with local knowledge.
"""

CROP_DISEASES = {
    "wheat": {
        "rust": {
            "names": ["Wheat Rust", "Puccinia", "Brown Rust", "Yellow Rust", "Black Rust"],
            "symptoms": [
                "Orange-brown pustules on leaves",
                "Yellow streaks on leaves",
                "Reduced grain filling",
                "Premature leaf drying"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Propiconazole 25% EC",
                    "dosage": "0.1% spray (1ml/litre water)",
                    "timing": "At first appearance of symptoms",
                    "frequency": "Repeat after 15 days if needed"
                },
                {
                    "type": "chemical",
                    "name": "Tebuconazole 25.9% EC",
                    "dosage": "1ml/litre water",
                    "timing": "Preventive spray at tillering",
                    "frequency": "2-3 sprays at 15 day interval"
                },
                {
                    "type": "organic",
                    "name": "Neem Oil Spray",
                    "dosage": "5ml/litre water",
                    "timing": "Early morning or evening",
                    "frequency": "Weekly application"
                }
            ],
            "prevention": [
                "Use resistant varieties (HD-2967, PBW-550)",
                "Early sowing to escape rust period",
                "Balanced fertilizer application",
                "Remove volunteer wheat plants"
            ]
        },
        "powdery_mildew": {
            "names": ["Powdery Mildew", "White Mold"],
            "symptoms": [
                "White powdery growth on leaves",
                "Yellowing of infected leaves",
                "Reduced photosynthesis",
                "Grain shriveling"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Sulfur 80% WP",
                    "dosage": "3g/litre water",
                    "timing": "At disease initiation",
                    "frequency": "2-3 sprays at 10-15 day interval"
                },
                {
                    "type": "chemical",
                    "name": "Karathane 48% EC",
                    "dosage": "1ml/litre water",
                    "timing": "At first symptoms",
                    "frequency": "Repeat after 15 days"
                }
            ],
            "prevention": [
                "Avoid excessive nitrogen",
                "Maintain proper spacing",
                "Use resistant varieties",
                "Good field sanitation"
            ]
        }
    },
    "rice": {
        "blast": {
            "names": ["Rice Blast", "Magnaporthe oryzae", "Leaf Blast", "Neck Blast"],
            "symptoms": [
                "Diamond-shaped lesions on leaves",
                "Grey center with brown margins",
                "Neck rot at panicle base",
                "Unfilled grains"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Tricyclazole 75% WP",
                    "dosage": "0.6g/litre water",
                    "timing": "At disease appearance",
                    "frequency": "2 sprays at 10 day interval"
                },
                {
                    "type": "chemical",
                    "name": "Isoprothiolane 40% EC",
                    "dosage": "1.5ml/litre water",
                    "timing": "Preventive at tillering",
                    "frequency": "2-3 applications"
                },
                {
                    "type": "organic",
                    "name": "Pseudomonas fluorescens",
                    "dosage": "10g/litre water",
                    "timing": "Seed treatment and foliar spray",
                    "frequency": "At 15 day interval"
                }
            ],
            "prevention": [
                "Use resistant varieties (Tetep, Tadukan)",
                "Avoid excess nitrogen",
                "Maintain field water level",
                "Balanced NPK fertilization"
            ]
        },
        "bacterial_leaf_blight": {
            "names": ["Bacterial Leaf Blight", "BLB", "Xanthomonas oryzae"],
            "symptoms": [
                "Water-soaked lesions on leaf margins",
                "Yellow to white lesions",
                "Wavy leaf margins",
                "Milky bacterial ooze"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Streptocycline + Copper oxychloride",
                    "dosage": "1g + 3g per litre water",
                    "timing": "At first symptoms",
                    "frequency": "3 sprays at 7 day interval"
                },
                {
                    "type": "organic",
                    "name": "Neem Seed Kernel Extract",
                    "dosage": "50g/litre water",
                    "timing": "Preventive spray",
                    "frequency": "Weekly"
                }
            ],
            "prevention": [
                "Use certified disease-free seeds",
                "Avoid clipping of seedlings",
                "Drain fields during severe infection",
                "Use resistant varieties"
            ]
        }
    },
    "tomato": {
        "early_blight": {
            "names": ["Early Blight", "Alternaria solani", "Target Spot"],
            "symptoms": [
                "Dark brown spots with concentric rings",
                "Lower leaves affected first",
                "Yellowing around spots",
                "Leaf drop"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Mancozeb 75% WP",
                    "dosage": "2.5g/litre water",
                    "timing": "At first symptoms",
                    "frequency": "3-4 sprays at 10 day interval"
                },
                {
                    "type": "chemical",
                    "name": "Chlorothalonil 75% WP",
                    "dosage": "2g/litre water",
                    "timing": "Preventive",
                    "frequency": "Every 10-14 days"
                },
                {
                    "type": "organic",
                    "name": "Trichoderma viride",
                    "dosage": "5g/litre water",
                    "timing": "Soil application and foliar",
                    "frequency": "Every 15 days"
                }
            ],
            "prevention": [
                "Crop rotation (3-4 years)",
                "Remove infected plant debris",
                "Proper spacing for air circulation",
                "Avoid overhead irrigation"
            ]
        },
        "late_blight": {
            "names": ["Late Blight", "Phytophthora infestans"],
            "symptoms": [
                "Water-soaked lesions on leaves",
                "White fuzzy growth under leaves",
                "Brown-black lesions on stems",
                "Fruit rot"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Metalaxyl + Mancozeb",
                    "dosage": "2.5g/litre water",
                    "timing": "Immediately at first sign",
                    "frequency": "Every 7-10 days"
                },
                {
                    "type": "chemical",
                    "name": "Cymoxanil + Mancozeb",
                    "dosage": "3g/litre water",
                    "timing": "Preventive in humid weather",
                    "frequency": "Weekly"
                }
            ],
            "prevention": [
                "Plant resistant varieties",
                "Avoid planting in low areas",
                "Good drainage",
                "Remove and destroy infected plants"
            ]
        },
        "leaf_curl": {
            "names": ["Tomato Leaf Curl Virus", "TLCV", "Yellow Leaf Curl"],
            "symptoms": [
                "Upward curling of leaves",
                "Yellowing of leaf margins",
                "Stunted growth",
                "Reduced fruit set"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Imidacloprid 17.8% SL",
                    "dosage": "0.5ml/litre water",
                    "timing": "Control whitefly vector",
                    "frequency": "Every 10-15 days"
                },
                {
                    "type": "organic",
                    "name": "Yellow Sticky Traps",
                    "dosage": "20-25 traps per acre",
                    "timing": "Install at transplanting",
                    "frequency": "Replace monthly"
                }
            ],
            "prevention": [
                "Use virus-free seedlings",
                "Control whitefly population",
                "Remove infected plants immediately",
                "Use reflective mulches"
            ]
        }
    },
    "potato": {
        "late_blight": {
            "names": ["Late Blight", "Phytophthora infestans"],
            "symptoms": [
                "Water-soaked dark lesions on leaves",
                "White mold on leaf undersides",
                "Brown rot in tubers",
                "Rapid plant death"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Mancozeb 75% WP",
                    "dosage": "2g/litre water",
                    "timing": "At first symptoms or preventive",
                    "frequency": "Every 7-10 days"
                },
                {
                    "type": "chemical",
                    "name": "Cymoxanil 8% + Mancozeb 64%",
                    "dosage": "3g/litre water",
                    "timing": "During cloudy/humid weather",
                    "frequency": "Weekly"
                }
            ],
            "prevention": [
                "Use certified disease-free tubers",
                "Plant resistant varieties",
                "Proper hilling of plants",
                "Avoid overhead irrigation"
            ]
        },
        "early_blight": {
            "names": ["Early Blight", "Alternaria solani"],
            "symptoms": [
                "Dark brown spots with target pattern",
                "Older leaves affected first",
                "Yellowing and defoliation",
                "Shallow lesions on tubers"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Chlorothalonil 75% WP",
                    "dosage": "2g/litre water",
                    "timing": "At symptom appearance",
                    "frequency": "Every 10-14 days"
                },
                {
                    "type": "organic",
                    "name": "Copper hydroxide",
                    "dosage": "2g/litre water",
                    "timing": "Preventive",
                    "frequency": "Every 7-10 days"
                }
            ],
            "prevention": [
                "Crop rotation",
                "Adequate fertilization",
                "Proper irrigation management",
                "Remove crop debris"
            ]
        }
    },
    "corn": {
        "northern_leaf_blight": {
            "names": ["Northern Corn Leaf Blight", "NCLB", "Turcicum Leaf Blight"],
            "symptoms": [
                "Long elliptical grey-green lesions",
                "Lesions 1-6 inches long",
                "Cigar-shaped spots",
                "Lower leaves affected first"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Propiconazole 25% EC",
                    "dosage": "1ml/litre water",
                    "timing": "At first symptoms",
                    "frequency": "2 sprays at 15 day interval"
                },
                {
                    "type": "chemical",
                    "name": "Mancozeb 75% WP",
                    "dosage": "2.5g/litre water",
                    "timing": "Preventive or curative",
                    "frequency": "Every 10-15 days"
                }
            ],
            "prevention": [
                "Plant resistant hybrids",
                "Crop rotation with non-host crops",
                "Tillage to bury residue",
                "Balanced fertilization"
            ]
        },
        "common_rust": {
            "names": ["Common Rust", "Puccinia sorghi"],
            "symptoms": [
                "Cinnamon-brown pustules on leaves",
                "Pustules on both leaf surfaces",
                "Circular to elongated pustules",
                "Yellow halos around pustules"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Propiconazole 25% EC",
                    "dosage": "1ml/litre water",
                    "timing": "When 5-10% leaves infected",
                    "frequency": "Single or repeat after 15 days"
                },
                {
                    "type": "chemical",
                    "name": "Tebuconazole 25.9% EC",
                    "dosage": "1ml/litre water",
                    "timing": "At disease onset",
                    "frequency": "1-2 applications"
                }
            ],
            "prevention": [
                "Use resistant varieties",
                "Early planting",
                "Balanced nitrogen application",
                "Scout fields regularly"
            ]
        }
    },
    "cotton": {
        "bacterial_blight": {
            "names": ["Bacterial Blight", "Angular Leaf Spot", "Xanthomonas citri"],
            "symptoms": [
                "Angular water-soaked lesions",
                "Brown necrotic spots",
                "Black arm on stems",
                "Boll rot"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Streptomycin sulfate + COC",
                    "dosage": "0.5g + 3g per litre",
                    "timing": "At first symptoms",
                    "frequency": "3 sprays at weekly interval"
                },
                {
                    "type": "organic",
                    "name": "Copper hydroxide",
                    "dosage": "2g/litre water",
                    "timing": "Preventive spray",
                    "frequency": "Every 10 days"
                }
            ],
            "prevention": [
                "Use acid-delinted seeds",
                "Seed treatment with Carboxin",
                "Avoid overhead irrigation",
                "Remove infected plant debris"
            ]
        }
    },
    "sugarcane": {
        "red_rot": {
            "names": ["Red Rot", "Colletotrichum falcatum"],
            "symptoms": [
                "Red discoloration of internal tissue",
                "White patches in red areas",
                "Alcohol smell from infected cane",
                "Drying of crown leaves"
            ],
            "treatments": [
                {
                    "type": "chemical",
                    "name": "Carbendazim 50% WP",
                    "dosage": "2g/litre for sett treatment",
                    "timing": "Before planting",
                    "frequency": "Sett dip for 15 minutes"
                },
                {
                    "type": "organic",
                    "name": "Trichoderma harzianum",
                    "dosage": "10g/litre water",
                    "timing": "Sett treatment and soil application",
                    "frequency": "At planting"
                }
            ],
            "prevention": [
                "Use disease-free seed cane",
                "Hot water treatment of setts",
                "Avoid waterlogging",
                "Plant resistant varieties"
            ]
        }
    }
}

def get_treatment_recommendations(crop_type, disease_name):
    """
    Get treatment recommendations for a specific crop disease.
    Performs fuzzy matching to find the best match.
    """
    crop_type = crop_type.lower().strip()
    disease_name = disease_name.lower().strip()
    
    if crop_type not in CROP_DISEASES:
        return None
    
    crop_diseases = CROP_DISEASES[crop_type]
    
    # Try exact match first
    for disease_key, disease_data in crop_diseases.items():
        disease_names = [name.lower() for name in disease_data.get('names', [])]
        disease_names.append(disease_key.lower())
        
        for name in disease_names:
            if name in disease_name or disease_name in name:
                return {
                    'disease_key': disease_key,
                    'official_names': disease_data.get('names', []),
                    'symptoms': disease_data.get('symptoms', []),
                    'treatments': disease_data.get('treatments', []),
                    'prevention': disease_data.get('prevention', [])
                }
    
    return None

def get_all_crops():
    """Return list of all supported crops"""
    return list(CROP_DISEASES.keys())

def get_diseases_for_crop(crop_type):
    """Return list of diseases for a specific crop"""
    crop_type = crop_type.lower().strip()
    if crop_type in CROP_DISEASES:
        return list(CROP_DISEASES[crop_type].keys())
    return []
