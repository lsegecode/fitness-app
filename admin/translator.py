"""
Translator Module for Fitness App

Implements a hybrid translation approach:
1. Dictionary Lookup (Fast, Free, Local)
2. LLM Fallback (For unknown terms) - Currently Mocked
"""

import json
import os

# ===== DICTIONARIES =====

# English to Spanish
EN_TO_ES = {
    # Days
    "Monday": "Lunes", "Tuesday": "Martes", "Wednesday": "Miércoles", 
    "Thursday": "Jueves", "Friday": "Viernes", "Saturday": "Sábado", "Sunday": "Domingo",
    "mon": "lun", "tue": "mar", "wed": "mié", "thu": "jue", "fri": "vie", "sat": "sáb", "sun": "dom",
    
    # Categories
    "Warm-up": "Calentamiento",
    "Warm-up and Mobility": "Calentamiento y Movilidad",
    "Strength": "Fuerza",
    "Calisthenics": "Calistenia",
    "Cardio": "Cardio",
    "Stretching": "Estiramiento",
    "Abs": "Abdominales",
    "Core": "Core",
    "Cooldown": "Enfriamiento",
    
    # Common Exercises
    "Squat": "Sentadilla",
    "Bench Press": "Press de Banca",
    "Deadlift": "Peso Muerto",
    "Overhead Press": "Press Militar",
    "Pull-up": "Dominada",
    "Chin-up": "Dominada Supina",
    "Row": "Remo",
    "Push-up": "Flexión",
    "Dip": "Fondo",
    "Lunge": "Estocada",
    "Curl": "Curl",
    "Extension": "Extensión",
    "Raise": "Elevación",
    "Crunch": "Crunch",
    "Plank": "Plancha",
    
    # Diet
    "Breakfast": "Desayuno",
    "Lunch": "Almuerzo",
    "Dinner": "Cena",
    "Snack": "Merienda",
    "Pre-Workout": "Pre-Entreno",
    "Post-Workout": "Post-Entreno",
    "Chicken": "Pollo",
    "Rice": "Arroz",
    "Egg": "Huevo",
    "Beef": "Res",
    "Fish": "Pescado",
    "Oats": "Avena",
    "Milk": "Leche",
    "Water": "Agua",
    "Protein": "Proteína",
    "Carbs": "Carbohidratos",
    "Fats": "Grasas"
}

# Spanish to English (Inverted automatically would be unsafe for collisions, but good for simple 1:1)
# We build a robust reverse lookup manually or semi-automatically where needed
ES_TO_EN = {v: k for k, v in EN_TO_ES.items()}

# Add specific variations if needed
ES_TO_EN.update({
    "Sentadillas": "Squats",
    "Flexiones": "Push-ups",
    # Add more manual entries here
})


def translate_text(text, target_lang='es'):
    """
    Translate a single string using Dictionary -> LLM Fallback.
    """
    if not text or not isinstance(text, str):
        return text
        
    original = text.strip()
    
    # 1. DICTIONARY LOOKUP
    if target_lang == 'es':
        if original in EN_TO_ES:
            return EN_TO_ES[original]
        # Case insensitive check
        for k, v in EN_TO_ES.items():
            if k.lower() == original.lower():
                return v
                
    elif target_lang == 'en':
        if original in ES_TO_EN:
            return ES_TO_EN[original]
        # Case insensitive check
        for k, v in ES_TO_EN.items():
            if k.lower() == original.lower():
                return v

    # 2. LLM FALLBACK (Placeholder)
    # If the word is not in the dictionary, we would call an API here.
    return call_llm(original, target_lang)


def call_llm(text, target_lang):
    """
    Mock LLM function. 
    Replace this with actual OpenAI/Gemini/Anthropic API call.
    """
    # For now, we return the text marked, so the user knows it needs translation
    # or that the dictionary missed it.
    print(f"⚠️ [LLM Fallback Triggered] translating '{text}' to {target_lang}")
    
    # TODO: Implement actual LLM call here
    # Example:
    # return openai.ChatCompletion.create(...)
    
    # Return original text for now (passthrough)
    return text


def translate_structure(data, target_lang='es'):
    """
    Recursively translate a JSON structure (list or dict).
    Only translates specific fields known to contain text.
    """
    if isinstance(data, list):
        return [translate_structure(item, target_lang) for item in data]
    
    elif isinstance(data, dict):
        new_data = data.copy()
        
        # Keys that we want to translate
        text_keys = [
            'name', 'category', 'focus', 'description', 
            'meal', 'food', 'notes', 'exercise'
        ]
        
        # Keys that might contain numeric strings we usually don't want to touch, 
        # but 'time' might need format change? For now, keep time as is.
        
        for key, value in new_data.items():
            if key in text_keys and isinstance(value, str):
                new_data[key] = translate_text(value, target_lang)
            elif isinstance(value, (dict, list)):
                new_data[key] = translate_structure(value, target_lang)
                
        return new_data
        
    return data
