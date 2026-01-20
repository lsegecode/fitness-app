import json
import os
import shutil
from pathlib import Path
import translator

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
GYM_EN_DIR = DATA_DIR / 'gym-routine'
GYM_ES_DIR = DATA_DIR / 'gym-routine-es'
GYM_EN_MAIN = DATA_DIR / 'gym-routine.json'
GYM_ES_MAIN = DATA_DIR / 'gym-routine-es' / 'gym-routine.json'

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"Saved: {path}")

def main():
    print("Starting Routine Migration...")

    # 1. Tuesday EN -> Friday EN
    print("\n[Step 1] Copying EN Tuesday -> EN Friday")
    
    tuesday_en_path = GYM_EN_DIR / 'tuesday.json'
    friday_en_path = GYM_EN_DIR / 'friday.json'
    
    tuesday_data = load_json(tuesday_en_path)
    # Deep copy to ensure independence
    friday_data = json.loads(json.dumps(tuesday_data))
    
    save_json(friday_en_path, friday_data)
    
    # Also update main EN file
    full_en = load_json(GYM_EN_MAIN)
    if 'weekly_routine' in full_en:
        full_en['weekly_routine']['friday'] = friday_data
        save_json(GYM_EN_MAIN, full_en)

    # 2. Main Translation EN -> ES (All Days)
    # Assumes EN is the Source of Truth as requested (copy Mon, Tue, Thu to ES)
    print("\n[Step 2] Translating EN -> ES for Monday, Tuesday, Thursday (and others implicitly via Main)")
    
    full_en_translated = translator.translate_structure(full_en, target_lang='es')
    save_json(GYM_ES_MAIN, full_en_translated)
    
    # 3. Update Individual ES Files
    print("\n[Step 3] Updating Individual ES Files")
    if 'weekly_routine' in full_en_translated:
        for day, content in full_en_translated['weekly_routine'].items():
            day_path = GYM_ES_DIR / f'{day}.json'
            save_json(day_path, content)
            print(f"  - Updated {day} (ES)")

    print("\nMigration Complete!")

if __name__ == '__main__':
    main()
