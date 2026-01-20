import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'

STRENGTH_CATEGORIES = ['Strength', 'Fuerza']

def migrate_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Skipping {filepath}: {e}")
        return

    modified = False
    
    if 'weekly_routine' in data:
        for day, content in data['weekly_routine'].items():
            if 'blocks' in content:
                for block in content['blocks']:
                    # Check if it's a strength category
                    # We can also just add weight to ALL exercises that are objects, just in case
                    is_strength = block.get('category') in STRENGTH_CATEGORIES
                    
                    if 'exercises' in block:
                        new_exercises = []
                        for ex in block['exercises']:
                            if isinstance(ex, dict):
                                if 'weight' not in ex:
                                    ex['weight'] = "" # Initialize empty string
                                    modified = True
                            elif isinstance(ex, str) and is_strength:
                                # Convert string exercise in Strength block to object
                                ex = {
                                    "name": ex,
                                    "sets": "",
                                    "reps": "",
                                    "weight": ""
                                }
                                modified = True
                            new_exercises.append(ex)
                        block['exercises'] = new_exercises

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Migrated {filepath}")
    else:
        print(f"No changes needed for {filepath}")

def main():
    # Migrate English
    migrate_file(DATA_DIR / 'gym-routine.json')
    # Migrate Spanish 
    migrate_file(DATA_DIR / 'gym-routine-es' / 'gym-routine.json')
    
    # Also migrate individual day files if they exist (though the server logic seems to favor the big file)
    # But let's be safe
    for f in (DATA_DIR / 'gym-routine').glob('*.json'):
        migrate_file(f)
    for f in (DATA_DIR / 'gym-routine-es').glob('*.json'):
        migrate_file(f)

if __name__ == '__main__':
    main()
