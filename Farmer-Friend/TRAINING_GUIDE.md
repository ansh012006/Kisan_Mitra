# Crop Disease Prediction Model Training Guide

This guide provides a comprehensive step-by-step approach to train a custom deep learning model for crop disease prediction using the PlantVillage dataset and other supplementary datasets.

## Overview

The current application uses OpenAI's GPT-5 Vision API for disease prediction. For higher accuracy and offline capability, you can train a custom CNN model using transfer learning.

## Recommended Datasets

### 1. PlantVillage Dataset (Primary)
- **Size**: 54,305 images
- **Classes**: 38 classes (healthy + diseased)
- **Crops**: 14 crop species including Tomato, Potato, Corn, Apple, Grape, etc.
- **Download**: https://www.kaggle.com/datasets/emmarex/plantdisease
- **Alternative**: https://github.com/spMohanty/PlantVillage-Dataset

### 2. Indian Crop Disease Dataset (Supplementary)
- **Source**: ICAR (Indian Council of Agricultural Research)
- **Crops**: Wheat, Rice, Cotton, Sugarcane, Groundnut
- **Download**: Contact local Krishi Vigyan Kendras or search on Kaggle for "Indian crop disease"

### 3. Additional Resources
- **Rice Disease Dataset**: https://www.kaggle.com/datasets/minhhuy2810/rice-diseases-image-dataset
- **Wheat Disease Dataset**: https://www.kaggle.com/datasets/olyadgetch/wheat-leaf-dataset
- **Cotton Disease Dataset**: Available from various agricultural universities

## Step-by-Step Training Process

### Step 1: Environment Setup

```bash
# Create a virtual environment (if not using Replit)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install required packages
pip install tensorflow keras numpy pandas matplotlib pillow scikit-learn
```

### Step 2: Download and Organize Dataset

```bash
# Create dataset directory structure
mkdir -p dataset/train dataset/validation dataset/test

# Download PlantVillage dataset from Kaggle
# kaggle datasets download -d emmarex/plantdisease

# Extract and organize:
# dataset/
# ├── train/
# │   ├── Tomato_Early_blight/
# │   ├── Tomato_Late_blight/
# │   ├── Tomato_healthy/
# │   ├── Potato_Early_blight/
# │   └── ... (other classes)
# ├── validation/
# └── test/
```

### Step 3: Data Preprocessing Script

Create `prepare_data.py`:

```python
import os
import shutil
import random
from PIL import Image
import numpy as np

def split_dataset(source_dir, train_dir, val_dir, test_dir, 
                  train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """Split dataset into train, validation, and test sets."""
    
    for class_name in os.listdir(source_dir):
        class_path = os.path.join(source_dir, class_name)
        if not os.path.isdir(class_path):
            continue
        
        # Get all images
        images = [f for f in os.listdir(class_path) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        random.shuffle(images)
        
        # Calculate split indices
        n_train = int(len(images) * train_ratio)
        n_val = int(len(images) * val_ratio)
        
        train_images = images[:n_train]
        val_images = images[n_train:n_train + n_val]
        test_images = images[n_train + n_val:]
        
        # Create directories and copy files
        for split_name, split_images, split_dir in [
            ('train', train_images, train_dir),
            ('validation', val_images, val_dir),
            ('test', test_images, test_dir)
        ]:
            dest_class_dir = os.path.join(split_dir, class_name)
            os.makedirs(dest_class_dir, exist_ok=True)
            
            for img in split_images:
                src = os.path.join(class_path, img)
                dst = os.path.join(dest_class_dir, img)
                shutil.copy2(src, dst)
        
        print(f"{class_name}: {len(train_images)} train, "
              f"{len(val_images)} val, {len(test_images)} test")

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess a single image."""
    img = Image.open(image_path)
    img = img.convert('RGB')
    img = img.resize(target_size, Image.LANCZOS)
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    return img_array

if __name__ == "__main__":
    # Adjust paths as needed
    split_dataset(
        source_dir="PlantVillage",
        train_dir="dataset/train",
        val_dir="dataset/validation",
        test_dir="dataset/test"
    )
```

### Step 4: Model Training Script

Create `train_model.py`:

```python
import os
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2, ResNet50V2, EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import matplotlib.pyplot as plt
import json

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.0001
TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/validation"
TEST_DIR = "dataset/test"
MODEL_SAVE_PATH = "models/crop_disease_model.h5"

def create_data_generators():
    """Create data generators with augmentation for training."""
    
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    val_generator = val_datagen.flow_from_directory(
        VAL_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    return train_generator, val_generator

def build_model(num_classes, base_model_name='mobilenetv2'):
    """Build transfer learning model."""
    
    # Choose base model
    if base_model_name == 'mobilenetv2':
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(*IMG_SIZE, 3)
        )
    elif base_model_name == 'resnet50':
        base_model = ResNet50V2(
            weights='imagenet',
            include_top=False,
            input_shape=(*IMG_SIZE, 3)
        )
    elif base_model_name == 'efficientnet':
        base_model = EfficientNetB0(
            weights='imagenet',
            include_top=False,
            input_shape=(*IMG_SIZE, 3)
        )
    
    # Freeze base model layers
    for layer in base_model.layers:
        layer.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    return model, base_model

def train_model():
    """Main training function."""
    
    # Create data generators
    train_gen, val_gen = create_data_generators()
    num_classes = len(train_gen.class_indices)
    
    # Save class indices for inference
    os.makedirs("models", exist_ok=True)
    with open("models/class_indices.json", "w") as f:
        json.dump(train_gen.class_indices, f)
    
    print(f"Number of classes: {num_classes}")
    print(f"Class indices: {train_gen.class_indices}")
    
    # Build model
    model, base_model = build_model(num_classes, 'mobilenetv2')
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=5,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Phase 1: Train only the top layers
    print("\n" + "="*50)
    print("Phase 1: Training top layers only")
    print("="*50)
    
    history1 = model.fit(
        train_gen,
        epochs=10,
        validation_data=val_gen,
        callbacks=callbacks
    )
    
    # Phase 2: Fine-tune the entire model
    print("\n" + "="*50)
    print("Phase 2: Fine-tuning entire model")
    print("="*50)
    
    # Unfreeze all layers
    for layer in base_model.layers:
        layer.trainable = True
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history2 = model.fit(
        train_gen,
        epochs=EPOCHS,
        initial_epoch=10,
        validation_data=val_gen,
        callbacks=callbacks
    )
    
    # Combine histories
    history = {
        'accuracy': history1.history['accuracy'] + history2.history['accuracy'],
        'val_accuracy': history1.history['val_accuracy'] + history2.history['val_accuracy'],
        'loss': history1.history['loss'] + history2.history['loss'],
        'val_loss': history1.history['val_loss'] + history2.history['val_loss']
    }
    
    # Plot training history
    plot_training_history(history)
    
    # Evaluate on test set
    test_datagen = ImageDataGenerator(rescale=1./255)
    test_gen = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    test_loss, test_accuracy = model.evaluate(test_gen)
    print(f"\nTest Accuracy: {test_accuracy * 100:.2f}%")
    
    return model, history

def plot_training_history(history):
    """Plot training and validation accuracy/loss."""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # Accuracy plot
    ax1.plot(history['accuracy'], label='Training Accuracy')
    ax1.plot(history['val_accuracy'], label='Validation Accuracy')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True)
    
    # Loss plot
    ax2.plot(history['loss'], label='Training Loss')
    ax2.plot(history['val_loss'], label='Validation Loss')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('models/training_history.png')
    plt.show()

if __name__ == "__main__":
    model, history = train_model()
    print("\nTraining completed successfully!")
    print(f"Model saved to: {MODEL_SAVE_PATH}")
```

### Step 5: Inference Script for Integration

Create `predict.py`:

```python
import os
import json
import numpy as np
from PIL import Image
import tensorflow as tf

class CropDiseasePredictor:
    def __init__(self, model_path="models/crop_disease_model.h5",
                 class_indices_path="models/class_indices.json"):
        """Initialize the predictor with trained model."""
        
        self.model = tf.keras.models.load_model(model_path)
        
        with open(class_indices_path, 'r') as f:
            self.class_indices = json.load(f)
        
        # Reverse the class indices
        self.index_to_class = {v: k for k, v in self.class_indices.items()}
        self.img_size = (224, 224)
    
    def preprocess_image(self, image_path):
        """Preprocess image for prediction."""
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize(self.img_size, Image.LANCZOS)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    
    def predict(self, image_path, top_k=3):
        """Predict disease from image."""
        
        # Preprocess
        img_array = self.preprocess_image(image_path)
        
        # Predict
        predictions = self.model.predict(img_array, verbose=0)[0]
        
        # Get top-k predictions
        top_indices = np.argsort(predictions)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            class_name = self.index_to_class[idx]
            confidence = float(predictions[idx]) * 100
            
            # Parse class name (format: Crop_Disease or Crop_healthy)
            parts = class_name.split('_')
            crop = parts[0]
            disease = '_'.join(parts[1:]) if len(parts) > 1 else 'Unknown'
            
            results.append({
                'crop': crop,
                'disease': disease,
                'class_name': class_name,
                'confidence': round(confidence, 2)
            })
        
        return results

# Example usage
if __name__ == "__main__":
    predictor = CropDiseasePredictor()
    
    # Test prediction
    test_image = "test_images/tomato_leaf.jpg"
    if os.path.exists(test_image):
        results = predictor.predict(test_image)
        print("Prediction Results:")
        for r in results:
            print(f"  {r['class_name']}: {r['confidence']}%")
```

### Step 6: Convert Model for Web Deployment (Optional)

```python
# Convert to TensorFlow Lite for mobile/edge deployment
import tensorflow as tf

model = tf.keras.models.load_model("models/crop_disease_model.h5")

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open("models/crop_disease_model.tflite", "wb") as f:
    f.write(tflite_model)

print("Model converted to TFLite format!")
```

## Expected Results

With proper training on the PlantVillage dataset, you should achieve:

| Model | Training Accuracy | Validation Accuracy | Test Accuracy |
|-------|------------------|---------------------|---------------|
| MobileNetV2 | 97-99% | 94-96% | 93-95% |
| ResNet50V2 | 98-99% | 95-97% | 94-96% |
| EfficientNetB0 | 98-99% | 96-98% | 95-97% |

## Tips for Better Accuracy

1. **Data Augmentation**: Use aggressive augmentation to prevent overfitting
2. **Class Balancing**: Ensure balanced class distribution or use class weights
3. **Learning Rate Scheduling**: Use cosine annealing or reduce on plateau
4. **Mixed Precision Training**: Use FP16 for faster training on GPU
5. **Ensemble Models**: Combine predictions from multiple models

## Integrating Custom Model with the Website

To use your trained model instead of OpenAI API:

1. Save model to `models/` directory
2. Modify `app.py` to use the custom predictor:

```python
from predict import CropDiseasePredictor

predictor = CropDiseasePredictor()

@app.route('/api/predict-disease-local', methods=['POST'])
def predict_disease_local():
    # Save uploaded image temporarily
    file = request.files['image']
    temp_path = '/tmp/temp_image.jpg'
    file.save(temp_path)
    
    # Get prediction
    results = predictor.predict(temp_path)
    
    return jsonify({
        'success': True,
        'predictions': results
    })
```

## Resources

- [TensorFlow Documentation](https://www.tensorflow.org/tutorials/images/transfer_learning)
- [Keras Applications](https://keras.io/api/applications/)
- [PlantVillage Paper](https://arxiv.org/abs/1511.08060)
- [Data Augmentation Best Practices](https://www.tensorflow.org/tutorials/images/data_augmentation)

## Contact

For questions or support regarding model training, consult:
- TensorFlow Forums
- Kaggle Discussions
- Stack Overflow
