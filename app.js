// ===== Data Storage =====
let gymData = null;
let dietData = null;
let currentCategory = 'gym';
let currentDay = null;
let currentLang = localStorage.getItem('fittrack-lang') || 'en';

// ===== Translations =====
const translations = {
    en: {
        gym: 'GYM',
        diet: 'DIET',
        todaysFocus: "Today's Focus",
        selectDayTitle: 'Select a day to get started',
        selectDay: 'Select a Day',
        selectDayDesc: 'Choose a day from above to view your routine',
        exercise: 'exercise',
        exercises: 'exercises',
        sets: 'sets',
        reps: 'reps',
        item: 'item',
        items: 'items',
        calories: 'Calories',
        protein: 'Protein',
        carbs: 'Carbs',
        fats: 'Fats',
        cal: 'cal',
        footer: 'Made with ❤️ for your fitness journey',
        days: {
            monday: { short: 'MON', full: 'Monday' },
            tuesday: { short: 'TUE', full: 'Tuesday' },
            wednesday: { short: 'WED', full: 'Wednesday' },
            thursday: { short: 'THU', full: 'Thursday' },
            friday: { short: 'FRI', full: 'Friday' },
            saturday: { short: 'SAT', full: 'Saturday' },
            sunday: { short: 'SUN', full: 'Sunday' }
        }
    },
    es: {
        gym: 'GIMNASIO',
        diet: 'DIETA',
        todaysFocus: 'Enfoque de Hoy',
        selectDayTitle: 'Selecciona un día para comenzar',
        selectDay: 'Selecciona un Día',
        selectDayDesc: 'Elige un día de arriba para ver tu rutina',
        exercise: 'ejercicio',
        exercises: 'ejercicios',
        sets: 'series',
        reps: 'reps',
        item: 'item',
        items: 'items',
        calories: 'Calorías',
        protein: 'Proteína',
        carbs: 'Carbos',
        fats: 'Grasas',
        cal: 'cal',
        footer: 'Hecho con ❤️ para tu viaje fitness',
        days: {
            monday: { short: 'LUN', full: 'Lunes' },
            tuesday: { short: 'MAR', full: 'Martes' },
            wednesday: { short: 'MIÉ', full: 'Miércoles' },
            thursday: { short: 'JUE', full: 'Jueves' },
            friday: { short: 'VIE', full: 'Viernes' },
            saturday: { short: 'SÁB', full: 'Sábado' },
            sunday: { short: 'DOM', full: 'Domingo' }
        }
    }
};

// ===== Category Icons =====
const categoryIcons = {
    // English
    'Warm-up and Mobility': '🔥',
    'Warm-up': '🔥',
    'Calisthenics': '🤸',
    'Strength': '💪',
    'Functional / Calisthenics': '🏃',
    'Stretching': '🧘',
    'Abs': '🎯',
    // Spanish
    'Calentamiento': '🔥',
    'Calentamiento y Movilidad': '🔥',
    'Calistenia': '🤸',
    'Fuerza': '💪',
    'Estiramientos': '🧘',
    'Abdominales': '🎯',
    'default': '⚡'
};

const mealIcons = {
    // English
    'Breakfast': '🍳',
    'Mid-Morning Snack': '🥜',
    'Brunch Snack': '🥤',
    'Lunch': '🍗',
    'Pre-Workout': '⚡',
    'Dinner': '🍽️',
    'Evening Snack': '🌙',
    'Afternoon Snack': '🍎',
    // Spanish
    'Desayuno': '🍳',
    'Colación Matutina': '🥜',
    'Colación Brunch': '🥤',
    'Almuerzo': '🍗',
    'Pre-Entreno': '⚡',
    'Cena': '🍽️',
    'Colación Nocturna': '🌙',
    'Colación Vespertina': '🍎',
    'default': '🥗'
};

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ===== Helper function to get translation =====
function t(key) {
    return translations[currentLang][key] || translations.en[key] || key;
}

function getDayNames() {
    return translations[currentLang].days;
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initLangSwitcher();
    updateUILanguage();
    initDayPills();
    initNavTabs();
    highlightToday();
});

// ===== Initialize Language Switcher =====
function initLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
        btn.addEventListener('click', async () => {
            const newLang = btn.dataset.lang;
            if (newLang !== currentLang) {
                currentLang = newLang;
                localStorage.setItem('fittrack-lang', newLang);

                // Update button states
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.lang === currentLang);
                });

                // Reload data for new language
                await loadData();
                updateUILanguage();
                initDayPills();
                highlightToday();

                // Re-render current content if a day is selected
                if (currentDay) {
                    selectDay(currentDay);
                } else {
                    showEmptyState();
                }
            }
        });
    });
}

// ===== Update UI Language =====
function updateUILanguage() {
    // Update nav tabs
    document.querySelector('#gymTab .tab-text').textContent = t('gym');
    document.querySelector('#dietTab .tab-text').textContent = t('diet');

    // Update focus label
    document.querySelector('.focus-label').textContent = t('todaysFocus');

    // Update footer
    document.querySelector('.app-footer p').textContent = t('footer');

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
}

// ===== Load JSON Data =====
async function loadData() {
    try {
        // Determine folder suffix based on language
        const gymFolder = currentLang === 'es' ? 'gym-routine-es' : 'gym-routine';
        const dietFolder = currentLang === 'es' ? 'diet-plan-es' : 'diet-plan';

        // Load individual day files for gym routine
        const gymDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const gymPromises = gymDays.map(day =>
            fetch(`data/${gymFolder}/${day}.json`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null)
        );

        // Load individual day files for diet plan
        const dietDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dietPromises = dietDays.map(day =>
            fetch(`data/${dietFolder}/${day}.json`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null)
        );

        const [gymResults, dietResults] = await Promise.all([
            Promise.all(gymPromises),
            Promise.all(dietPromises)
        ]);

        // Build gym data structure
        gymData = { weekly_routine: {} };
        gymDays.forEach((day, index) => {
            if (gymResults[index]) {
                gymData.weekly_routine[day] = gymResults[index];
            }
        });

        // Build diet data structure
        dietData = { weekly_diet: {} };
        dietDays.forEach((day, index) => {
            if (dietResults[index]) {
                dietData.weekly_diet[day] = dietResults[index];
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== Initialize Day Pills =====
function initDayPills() {
    const container = document.getElementById('dayPills');
    container.innerHTML = '';

    const dayNames = getDayNames();
    const availableDays = currentCategory === 'gym'
        ? Object.keys(gymData?.weekly_routine || {})
        : Object.keys(dietData?.weekly_diet || {});

    days.forEach(day => {
        if (currentCategory === 'gym' && !availableDays.includes(day)) return;

        const pill = document.createElement('button');
        pill.className = 'day-pill';
        pill.dataset.day = day;
        pill.innerHTML = `
            <span class="day-short">${dayNames[day].short}</span>
            <span class="day-full">${dayNames[day].full}</span>
        `;
        pill.addEventListener('click', () => selectDay(day));
        container.appendChild(pill);
    });
}

// ===== Initialize Nav Tabs =====
function initNavTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            if (category !== currentCategory) {
                currentCategory = category;
                updateNavTabs();
                initDayPills();
                highlightToday();
                if (currentDay) {
                    selectDay(currentDay);
                } else {
                    showEmptyState();
                }
            }
        });
    });
}

// ===== Update Nav Tabs UI =====
function updateNavTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === currentCategory);
    });

    const banner = document.getElementById('focusBanner');
    banner.classList.toggle('diet', currentCategory === 'diet');
}

// ===== Highlight Today =====
function highlightToday() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    document.querySelectorAll('.day-pill').forEach(pill => {
        pill.classList.toggle('today', pill.dataset.day === today);
    });
}

// ===== Select Day =====
function selectDay(day) {
    currentDay = day;

    document.querySelectorAll('.day-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.day === day);
    });

    if (currentCategory === 'gym') {
        renderGymContent(day);
    } else {
        renderDietContent(day);
    }
}

// ===== Show Empty State =====
function showEmptyState() {
    const content = document.getElementById('contentArea');
    content.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>${t('selectDay')}</h3>
            <p>${t('selectDayDesc')}</p>
        </div>
    `;
    document.getElementById('focusTitle').textContent = t('selectDayTitle');
    document.getElementById('focusIcon').textContent = '🎯';
}

// ===== Render Gym Content =====
function renderGymContent(day) {
    const dayData = gymData?.weekly_routine?.[day];
    if (!dayData) {
        showEmptyState();
        return;
    }

    document.getElementById('focusTitle').textContent = dayData.focus;
    document.getElementById('focusIcon').textContent = '🏋️';

    const content = document.getElementById('contentArea');
    content.innerHTML = '';

    const blocks = [...dayData.blocks].sort((a, b) => a.order - b.order);

    blocks.forEach((block, index) => {
        const card = document.createElement('div');
        card.className = 'block-card';

        const icon = categoryIcons[block.category] || categoryIcons.default;
        const exerciseCount = block.exercises.length;
        const exerciseText = exerciseCount > 1 ? t('exercises') : t('exercise');

        card.innerHTML = `
            <div class="block-header" onclick="toggleBlock(this)">
                <div class="block-info">
                    <div class="block-icon">${icon}</div>
                    <div class="block-details">
                        <h3>${block.category}</h3>
                        <span>${exerciseCount} ${exerciseText}</span>
                    </div>
                </div>
                <div class="block-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </div>
            </div>
            <div class="block-content">
                <div class="exercise-list">
                    ${renderExercises(block.exercises)}
                </div>
            </div>
        `;

        content.appendChild(card);
    });
}

// ===== Render Exercises =====
function renderExercises(exercises) {
    return exercises.map(ex => {
        if (typeof ex === 'string') {
            return `
                <div class="exercise-item simple">
                    <span class="exercise-name">${ex}</span>
                </div>
            `;
        }

        const reps = typeof ex.reps === 'number' ? `${ex.reps} ${t('reps')}` : ex.reps;

        return `
            <div class="exercise-item">
                <span class="exercise-name">${ex.name}</span>
                <div class="exercise-meta">
                    <span class="meta-badge">${ex.sets} ${t('sets')}</span>
                    <span class="meta-badge">${reps}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Render Diet Content =====
function renderDietContent(day) {
    const dayData = dietData?.weekly_diet?.[day];
    if (!dayData) {
        showEmptyState();
        return;
    }

    document.getElementById('focusTitle').textContent = dayData.focus;
    document.getElementById('focusIcon').textContent = '🥗';

    const content = document.getElementById('contentArea');
    content.innerHTML = '';

    // Macros Summary
    if (dayData.macros) {
        const macrosDiv = document.createElement('div');
        macrosDiv.className = 'macros-summary';
        macrosDiv.innerHTML = `
            <div class="macro-item">
                <span class="macro-value">${dayData.total_calories}</span>
                <span class="macro-label">${t('calories')}</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${dayData.macros.protein}</span>
                <span class="macro-label">${t('protein')}</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${dayData.macros.carbs}</span>
                <span class="macro-label">${t('carbs')}</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${dayData.macros.fats}</span>
                <span class="macro-label">${t('fats')}</span>
            </div>
        `;
        content.appendChild(macrosDiv);
    }

    // Meals
    dayData.meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'meal-card';

        const icon = mealIcons[meal.meal] || mealIcons.default;
        const foodCount = meal.foods.length;
        const itemText = foodCount > 1 ? t('items') : t('item');

        card.innerHTML = `
            <div class="meal-header" onclick="toggleMeal(this)">
                <div class="meal-info">
                    <div class="meal-icon">${icon}</div>
                    <div class="meal-details">
                        <h3>${meal.meal}</h3>
                        <span>${meal.time} • ${foodCount} ${itemText}</span>
                    </div>
                </div>
                <div class="block-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </div>
            </div>
            <div class="meal-content">
                <div class="food-list">
                    ${renderFoods(meal.foods)}
                </div>
            </div>
        `;

        content.appendChild(card);
    });
}

// ===== Render Foods =====
function renderFoods(foods) {
    return foods.map(food => `
        <div class="food-item">
            <div>
                <div class="food-name">${food.name}</div>
                <div class="food-portion">${food.portion}</div>
            </div>
            <div class="food-stats">
                <span class="stat-badge calories">${food.calories} ${t('cal')}</span>
                <span class="stat-badge protein">${food.protein}</span>
            </div>
        </div>
    `).join('');
}

// ===== Toggle Block (Gym) =====
function toggleBlock(header) {
    const card = header.closest('.block-card');
    card.classList.toggle('open');
}

// ===== Toggle Meal (Diet) =====
function toggleMeal(header) {
    const card = header.closest('.meal-card');
    card.classList.toggle('open');
}
