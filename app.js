// ===== Data Storage =====
let gymData = null;
let dietData = null;
let currentCategory = 'gym';
let currentDay = null;

// ===== Category Icons =====
const categoryIcons = {
    'Warm-up and Mobility': '🔥',
    'Warm-up': '🔥',
    'Calisthenics': '🤸',
    'Strength': '💪',
    'Functional / Calisthenics': '🏃',
    'Stretching': '🧘',
    'Abs': '🎯',
    'default': '⚡'
};

const mealIcons = {
    'Breakfast': '🍳',
    'Mid-Morning Snack': '🥜',
    'Brunch Snack': '🥤',
    'Lunch': '🍗',
    'Pre-Workout': '⚡',
    'Dinner': '🍽️',
    'Evening Snack': '🌙',
    'Afternoon Snack': '🍎',
    'default': '🥗'
};

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayNames = {
    monday: { short: 'MON', full: 'Monday' },
    tuesday: { short: 'TUE', full: 'Tuesday' },
    wednesday: { short: 'WED', full: 'Wednesday' },
    thursday: { short: 'THU', full: 'Thursday' },
    friday: { short: 'FRI', full: 'Friday' },
    saturday: { short: 'SAT', full: 'Saturday' },
    sunday: { short: 'SUN', full: 'Sunday' }
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initDayPills();
    initNavTabs();
    highlightToday();
});

// ===== Load JSON Data =====
async function loadData() {
    try {
        const [gymRes, dietRes] = await Promise.all([
            fetch('data/gym-routine.json'),
            fetch('data/diet-plan.json')
        ]);
        gymData = await gymRes.json();
        dietData = await dietRes.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== Initialize Day Pills =====
function initDayPills() {
    const container = document.getElementById('dayPills');
    container.innerHTML = '';
    
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
            <h3>Select a Day</h3>
            <p>Choose a day from above to view your routine</p>
        </div>
    `;
    document.getElementById('focusTitle').textContent = 'Select a day to get started';
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
        
        card.innerHTML = `
            <div class="block-header" onclick="toggleBlock(this)">
                <div class="block-info">
                    <div class="block-icon">${icon}</div>
                    <div class="block-details">
                        <h3>${block.category}</h3>
                        <span>${exerciseCount} exercise${exerciseCount > 1 ? 's' : ''}</span>
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
        
        const reps = typeof ex.reps === 'number' ? `${ex.reps} reps` : ex.reps;
        
        return `
            <div class="exercise-item">
                <span class="exercise-name">${ex.name}</span>
                <div class="exercise-meta">
                    <span class="meta-badge">${ex.sets} sets</span>
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
                <span class="macro-label">Calories</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${dayData.macros.protein}</span>
                <span class="macro-label">Protein</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${dayData.macros.carbs}</span>
                <span class="macro-label">Carbs</span>
            </div>
            <div class="macro-item">
                <span class="macro-value">${dayData.macros.fats}</span>
                <span class="macro-label">Fats</span>
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
        
        card.innerHTML = `
            <div class="meal-header" onclick="toggleMeal(this)">
                <div class="meal-info">
                    <div class="meal-icon">${icon}</div>
                    <div class="meal-details">
                        <h3>${meal.meal}</h3>
                        <span>${meal.time} • ${foodCount} item${foodCount > 1 ? 's' : ''}</span>
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
                <span class="stat-badge calories">${food.calories} cal</span>
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
