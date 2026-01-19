"""
Fitness App Admin Server
A local Flask server for managing gym routines and diet plans.
"""

import json
import os
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import translator

app = Flask(__name__, static_folder='static')
CORS(app)

# Get the data directory path (relative to admin folder)
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'

# ===== Helper Functions =====

def load_json(filepath: Path) -> dict:
    """Load JSON file and return data."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {filepath}: {e}")
        return {}


def save_json(filepath: Path, data: dict) -> bool:
    """Save data to JSON file with pretty formatting."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving JSON to {filepath}: {e}")
        return False


# ===== Static Routes =====

@app.route('/')
def index():
    """Serve the admin interface."""
    return send_from_directory('static', 'index.html')


@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('static', filename)


# ===== API Routes - Gym Routines =====

@app.route('/api/gym', methods=['GET'])
def get_gym_routine():
    """Get the complete gym routine."""
    lang = request.args.get('lang', 'en')
    if lang == 'es':
        data = load_json(DATA_DIR / 'gym-routine-es' / 'gym-routine.json')
        if not data:
            # Fallback: try loading individual day files
            data = {"weekly_routine": {}}
            for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']:
                day_data = load_json(DATA_DIR / 'gym-routine-es' / f'{day}.json')
                if day_data:
                    data["weekly_routine"][day] = day_data
    else:
        data = load_json(DATA_DIR / 'gym-routine.json')
    return jsonify(data)


@app.route('/api/gym', methods=['POST'])
def save_gym_routine():
    """Save the complete gym routine."""
    lang = request.args.get('lang', 'en')
    data = request.json
    
    if lang == 'es':
        filepath = DATA_DIR / 'gym-routine-es' / 'gym-routine.json'
    else:
        filepath = DATA_DIR / 'gym-routine.json'
    
    if save_json(filepath, data):
        # Also save individual day files for compatibility
        if 'weekly_routine' in data:
            for day, day_data in data['weekly_routine'].items():
                if lang == 'es':
                    day_filepath = DATA_DIR / 'gym-routine-es' / f'{day}.json'
                else:
                    day_filepath = DATA_DIR / 'gym-routine' / f'{day}.json'
                save_json(day_filepath, day_data)
        return jsonify({"success": True, "message": "Gym routine saved successfully"})
    return jsonify({"success": False, "message": "Error saving gym routine"}), 500


@app.route('/api/gym/<day>', methods=['GET'])
def get_gym_day(day):
    """Get a specific day's gym routine."""
    lang = request.args.get('lang', 'en')
    
    # Try loading from main file first
    if lang == 'es':
        main_data = load_json(DATA_DIR / 'gym-routine-es' / 'gym-routine.json')
    else:
        main_data = load_json(DATA_DIR / 'gym-routine.json')
    
    if main_data and 'weekly_routine' in main_data and day in main_data['weekly_routine']:
        return jsonify(main_data['weekly_routine'][day])
    
    # Fallback to individual day file
    if lang == 'es':
        data = load_json(DATA_DIR / 'gym-routine-es' / f'{day}.json')
    else:
        data = load_json(DATA_DIR / 'gym-routine' / f'{day}.json')
    
    return jsonify(data)


@app.route('/api/gym/<day>', methods=['POST'])
def save_gym_day(day):
    """Save a specific day's gym routine."""
    lang = request.args.get('lang', 'en')
    data = request.json
    
    # Update main file
    if lang == 'es':
        main_filepath = DATA_DIR / 'gym-routine-es' / 'gym-routine.json'
        day_filepath = DATA_DIR / 'gym-routine-es' / f'{day}.json'
    else:
        main_filepath = DATA_DIR / 'gym-routine.json'
        day_filepath = DATA_DIR / 'gym-routine' / f'{day}.json'
    
    # Update main routine file (current lang)
    main_data = load_json(main_filepath)
    if 'weekly_routine' not in main_data:
        main_data['weekly_routine'] = {}
    main_data['weekly_routine'][day] = data
    save_json(main_filepath, main_data)
    
    # Also save individual day file (current lang)
    save_json(day_filepath, data)
    
    # ===== AUTO-TRANSLATION SYNC =====
    try:
        # Determine target language and paths
        target_lang = 'en' if lang == 'es' else 'es'
        
        if target_lang == 'es':
            target_main_filepath = DATA_DIR / 'gym-routine-es' / 'gym-routine.json'
            target_day_filepath = DATA_DIR / 'gym-routine-es' / f'{day}.json'
        else:
            target_main_filepath = DATA_DIR / 'gym-routine.json'
            target_day_filepath = DATA_DIR / 'gym-routine' / f'{day}.json'
            
        # Translate Data
        print(f"Syncing translation to {target_lang}...")
        translated_data = translator.translate_structure(data, target_lang)
        
        # Save Translated Individual File
        save_json(target_day_filepath, translated_data)
        
        # Save Translated Main File
        target_main_data = load_json(target_main_filepath)
        if 'weekly_routine' not in target_main_data:
            target_main_data['weekly_routine'] = {}
        target_main_data['weekly_routine'][day] = translated_data
        save_json(target_main_filepath, target_main_data)
        
        print(f"Successfully synced translation for {day} ({target_lang})")
        
    except Exception as e:
        print(f"Error syncing translation: {e}")
        # Note: We don't return 500 here because the primary save succeeded
    
    return jsonify({"success": True, "message": f"{day.capitalize()} routine saved and synced successfully"})


# ===== API Routes - Diet Plans =====

@app.route('/api/diet', methods=['GET'])
def get_diet_plan():
    """Get the complete diet plan."""
    lang = request.args.get('lang', 'en')
    if lang == 'es':
        data = load_json(DATA_DIR / 'diet-plan-es' / 'diet-plan.json')
        if not data:
            data = {"weekly_diet": {}}
            for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                day_data = load_json(DATA_DIR / 'diet-plan-es' / f'{day}.json')
                if day_data:
                    data["weekly_diet"][day] = day_data
    else:
        data = load_json(DATA_DIR / 'diet-plan.json')
    return jsonify(data)


@app.route('/api/diet', methods=['POST'])
def save_diet_plan():
    """Save the complete diet plan."""
    lang = request.args.get('lang', 'en')
    data = request.json
    
    if lang == 'es':
        filepath = DATA_DIR / 'diet-plan-es' / 'diet-plan.json'
    else:
        filepath = DATA_DIR / 'diet-plan.json'
    
    if save_json(filepath, data):
        if 'weekly_diet' in data:
            for day, day_data in data['weekly_diet'].items():
                if lang == 'es':
                    day_filepath = DATA_DIR / 'diet-plan-es' / f'{day}.json'
                else:
                    day_filepath = DATA_DIR / 'diet-plan' / f'{day}.json'
                save_json(day_filepath, day_data)
        return jsonify({"success": True, "message": "Diet plan saved successfully"})
    return jsonify({"success": False, "message": "Error saving diet plan"}), 500


@app.route('/api/diet/<day>', methods=['GET'])
def get_diet_day(day):
    """Get a specific day's diet plan."""
    lang = request.args.get('lang', 'en')
    
    if lang == 'es':
        main_data = load_json(DATA_DIR / 'diet-plan-es' / 'diet-plan.json')
    else:
        main_data = load_json(DATA_DIR / 'diet-plan.json')
    
    if main_data and 'weekly_diet' in main_data and day in main_data['weekly_diet']:
        return jsonify(main_data['weekly_diet'][day])
    
    if lang == 'es':
        data = load_json(DATA_DIR / 'diet-plan-es' / f'{day}.json')
    else:
        data = load_json(DATA_DIR / 'diet-plan' / f'{day}.json')
    
    return jsonify(data)


@app.route('/api/diet/<day>', methods=['POST'])
def save_diet_day(day):
    """Save a specific day's diet plan."""
    lang = request.args.get('lang', 'en')
    data = request.json
    
    if lang == 'es':
        main_filepath = DATA_DIR / 'diet-plan-es' / 'diet-plan.json'
        day_filepath = DATA_DIR / 'diet-plan-es' / f'{day}.json'
    else:
        main_filepath = DATA_DIR / 'diet-plan.json'
        day_filepath = DATA_DIR / 'diet-plan' / f'{day}.json'
    
    main_data = load_json(main_filepath)
    if 'weekly_diet' not in main_data:
        main_data['weekly_diet'] = {}
    main_data['weekly_diet'][day] = data
    save_json(main_filepath, main_data)
    save_json(day_filepath, data)
    
    # ===== AUTO-TRANSLATION SYNC =====
    try:
        # Determine target language and paths
        target_lang = 'en' if lang == 'es' else 'es'
        
        if target_lang == 'es':
            target_main_filepath = DATA_DIR / 'diet-plan-es' / 'diet-plan.json'
            target_day_filepath = DATA_DIR / 'diet-plan-es' / f'{day}.json'
        else:
            target_main_filepath = DATA_DIR / 'diet-plan.json'
            target_day_filepath = DATA_DIR / 'diet-plan' / f'{day}.json'
            
        # Translate Data
        print(f"Syncing diet translation to {target_lang}...")
        translated_data = translator.translate_structure(data, target_lang)
        
        # Save Translated Individual File
        save_json(target_day_filepath, translated_data)
        
        # Save Translated Main File
        target_main_data = load_json(target_main_filepath)
        if 'weekly_diet' not in target_main_data:
            target_main_data['weekly_diet'] = {}
        target_main_data['weekly_diet'][day] = translated_data
        save_json(target_main_filepath, target_main_data)
        
        print(f"Successfully synced diet translation for {day} ({target_lang})")
        
    except Exception as e:
        print(f"Error syncing diet translation: {e}")
    
    return jsonify({"success": True, "message": f"{day.capitalize()} diet saved and synced successfully"})


# ===== Main =====

if __name__ == '__main__':
    print("\n" + "="*50)
    print("  🏋️ Fitness App Admin Server")
    print("="*50)
    print(f"\n  📂 Data directory: {DATA_DIR}")
    print(f"  🌐 Admin URL: http://localhost:5000")
    print("\n  Press Ctrl+C to stop the server\n")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000)
