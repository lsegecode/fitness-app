"""
Cleanup and Sync Script
1. Reads all English gym routine files
2. Translates any Spanish text found -> English
3. Saves cleaned English files
4. Translates English -> Spanish and saves to ES folder
"""

import json
from pathlib import Path
import translator

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
GYM_EN_DIR = DATA_DIR / 'gym-routine'
GYM_ES_DIR = DATA_DIR / 'gym-routine-es'
GYM_EN_MAIN = DATA_DIR / 'gym-routine.json'
GYM_ES_MAIN = GYM_ES_DIR / 'gym-routine.json'

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"  Saved: {path.name}")

def main():
    print("=" * 50)
    print("  CLEANUP AND SYNC ROUTINE")
    print("=" * 50)
    
    # ========================================
    # STEP 1: Clean English files (ES -> EN)
    # ========================================
    print("\n[Step 1] Cleaning English files (translating any Spanish to English)...")
    
    # Load main EN file
    full_en = load_json(GYM_EN_MAIN)
    
    # Translate any Spanish -> English
    cleaned_en = translator.translate_structure(full_en, target_lang='en')
    
    # Save cleaned main file
    save_json(GYM_EN_MAIN, cleaned_en)
    
    # Save individual day files
    if 'weekly_routine' in cleaned_en:
        for day, content in cleaned_en['weekly_routine'].items():
            day_path = GYM_EN_DIR / f'{day}.json'
            save_json(day_path, content)
    
    print("  English files cleaned!")
    
    # ========================================
    # STEP 2: Sync to Spanish (EN -> ES)
    # ========================================
    print("\n[Step 2] Syncing to Spanish (translating English to Spanish)...")
    
    # Translate EN -> ES
    full_es = translator.translate_structure(cleaned_en, target_lang='es')
    
    # Save main ES file
    save_json(GYM_ES_MAIN, full_es)
    
    # Save individual day files
    if 'weekly_routine' in full_es:
        for day, content in full_es['weekly_routine'].items():
            day_path = GYM_ES_DIR / f'{day}.json'
            save_json(day_path, content)
    
    print("  Spanish files synced!")
    
    print("\n" + "=" * 50)
    print("  COMPLETE!")
    print("=" * 50)

if __name__ == '__main__':
    main()
