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
    "Functional / Calisthenics": "Funcional / Calistenia",
    
    # Focus descriptions
    "Back + Biceps (Thickness)": "Espalda + Bíceps (Grosor)",
    "Back + Biceps (Width and Stability)": "Espalda + Bíceps (Amplitud y Estabilidad)",
    "Chest + Triceps + Shoulders (Shoulder Focus)": "Pecho + Tríceps + Hombros (Énfasis en Hombros)",
    "Chest + Triceps + Shoulders (Shoulder Focus) + Abs": "Pecho + Tríceps + Hombros (Énfasis en Hombros) + Abdominales",
    "Legs (Compound Movements)": "Piernas (Movimientos Compuestos)",
    "Legs (Compound) + Abs": "Piernas (Compuestos) + Abdominales",
    
    # Warm-up exercises
    "Shoulder circles": "Círculos de hombros",
    "Cat-Cow stretch": "Estiramiento gato-vaca",
    "Wrist rotation": "Rotación de muñecas",
    "Arm circles": "Círculos de brazos",
    "Plank to Downward Dog": "Plancha a Perro boca abajo",
    "Band rotator cuff rotations": "Rotaciones de manguito rotador con banda",
    "Dynamic chest openers": "Aperturas de pecho dinámicas",
    "Leg swings": "Balanceo de piernas",
    "World's Greatest Stretch": "El Mayor Estiramiento del Mundo",
    "Cat cow": "Gato-Vaca",
    "Superman": "Superman",
    "Glute Bridge": "Puente de glúteos",
    "Laying lower body rotation": "Rotación de tren inferior acostado",
    "Bird dog": "Perro-pájaro",
    "Bodyweight squats": "Sentadillas con peso corporal",
    "Hip circles": "Círculos de cadera",
    "5 minutes bike": "5 minutos de bicicleta",
    "Knee to Heel": "Rodilla al talón",
    "Dorsiflexion": "Dorsiflexión",
    
    # Calisthenics
    "Chin-ups (Underhand grip)": "Dominadas supinas (agarre supino)",
    "Negative Pull-ups (Overhand grip)": "Dominadas negativas (agarre prono)",
    "Chin-ups": "Dominadas supinas",
    "Australian Rows": "Remo australiano",
    "Push-ups": "Flexiones",
    "Diamond Push-ups": "Flexiones diamante",
    "Pike Push-ups": "Flexiones pike",
    "Dips": "Fondos",
    
    # Strength - Back
    "Romanian Deadlift (RDL)": "Peso Muerto Rumano (RDL)",
    "Pull up": "Dominada",
    "Seated Row": "Remo sentado",
    "Seated machine row": "Remo en máquina sentado",
    "Face Pulls": "Jalones a la cara",
    "Kettlebell Swing": "Swing con pesa rusa",
    "Chest pull": "Jalón al pecho",
    "Pullover": "Pullover",
    "Hyperextensions": "Hiperextensiones",
    
    # Strength - Arms
    "Z-Curl": "Curl en Z",
    "Hammer Curl": "Curl martillo",
    "Seated Incline DB Curl": "Curl inclinado con mancuernas sentado",
    "Overhead Triceps Extension": "Extensión de tríceps tras nuca",
    "Cable Triceps Pushdown": "Extensión de tríceps en polea alta",
    "Reverse Grip Triceps Pushdown": "Extensión de tríceps agarre supino",
    "Skullcrushers": "Rompecráneos",
    
    # Strength - Chest/Shoulders
    "Dumbbell Shoulder Press": "Press de hombros con mancuernas",
    "Lateral Raise": "Elevación lateral",
    "Upright Row": "Remo al mentón",
    "Barbell Bench Press": "Press de banca con barra",
    "Incline Dumbbell Press": "Press inclinado con mancuernas",
    "Chest Fly": "Aperturas de pecho",
    "Barbell Back Squat": "Sentadilla trasera con barra",
    "Bulgarian Split Squat": "Sentadilla búlgara",
    "Box Jumps": "Saltos al cajón",
    
    # Strength - Legs
    "Deadlift": "Peso Muerto",
    "Lunges": "Zancadas",
    "Hip Thrust (High Range)": "Hip Thrust (Rango alto)",
    "Hamstring Curl": "Curl de isquiotibiales",
    "Leg Press": "Prensa de piernas",
    "Abductor Machine": "Máquina de abductores",
    "Calf Raises": "Elevación de pantorrillas",
    
    # Abs
    "Abs Wheel": "Rueda abdominal",
    "Wheel abs": "Rueda abdominal",
    "Abdominal Crunches": "Crunches abdominales",
    "Bicycle Crunches": "Crunches bicicleta",
    "Russian Twists": "Giros rusos",
    "Ab Wheel Rollouts": "Rueda abdominal",
    "Leg Raises": "Elevaciones de piernas",
    
    # Stretching
    "Dead hang (Lat stretch)": "Colgado pasivo (estiramiento de dorsales)",
    "Wall bicep stretch": "Estiramiento de bíceps en pared",
    "Doorway chest stretch": "Estiramiento de pecho en puerta",
    "Overhead tricep stretch": "Estiramiento de tríceps sobre cabeza",
    "Hamstring stretch": "Estiramiento de isquiotibiales",
    "Pigeon pose (Glutes)": "Postura de paloma (Glúteos)",
    "Child's Pose": "Postura del niño",
    "Forearm stretch": "Estiramiento de antebrazos",
    "Quad stretch": "Estiramiento de cuádriceps",
    "Cobra stretch (Abs)": "Estiramiento de cobra (Abdominales)",
    
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
    print(f"[LLM Fallback Triggered] translating '{text}' to {target_lang}")
    
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
