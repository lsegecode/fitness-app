// ===== State =====
let currentSection = 'gym';
let currentLang = 'en';
let currentDay = null;
let gymData = {};
let dietData = {};

// ===== DOM Elements =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDaySelector();
    initButtons();
    loadData();
});

// ===== Navigation =====
function initNavigation() {
    $$('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSection = btn.dataset.section;
            updatePageHeader();
            renderEditor();
        });
    });

    $$('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            loadData();
        });
    });
}

function initDaySelector() {
    $$('.day-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            $$('.day-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentDay = pill.dataset.day;
            renderEditor();
        });
    });
}

function initButtons() {
    $('#refreshBtn').addEventListener('click', loadData);
    $('#saveAllBtn').addEventListener('click', saveCurrentDay);
    $('#addBlockBtn').addEventListener('click', addBlock);
    $('#addMealBtn').addEventListener('click', addMeal);
}

// ===== Data Loading =====
async function loadData() {
    try {
        const [gymRes, dietRes] = await Promise.all([
            fetch(`/api/gym?lang=${currentLang}`),
            fetch(`/api/diet?lang=${currentLang}`)
        ]);
        gymData = await gymRes.json();
        dietData = await dietRes.json();
        showToast('Data loaded successfully', false);
        renderEditor();
    } catch (err) {
        showToast('Error loading data', true);
        console.error(err);
    }
}

// ===== UI Updates =====
function updatePageHeader() {
    const titles = {
        gym: { title: 'Gym Routines', subtitle: 'Manage your weekly workout schedule' },
        diet: { title: 'Diet Plans', subtitle: 'Manage your meal plans and nutrition' }
    };
    $('#pageTitle').textContent = titles[currentSection].title;
    $('#pageSubtitle').textContent = titles[currentSection].subtitle;
}

function renderEditor() {
    const welcomeState = $('#welcomeState');
    const gymEditor = $('#gymEditor');
    const dietEditor = $('#dietEditor');

    if (!currentDay) {
        welcomeState.classList.remove('hidden');
        gymEditor.classList.add('hidden');
        dietEditor.classList.add('hidden');
        return;
    }

    welcomeState.classList.add('hidden');

    if (currentSection === 'gym') {
        gymEditor.classList.remove('hidden');
        dietEditor.classList.add('hidden');
        renderGymEditor();
    } else {
        gymEditor.classList.add('hidden');
        dietEditor.classList.remove('hidden');
        renderDietEditor();
    }
}

// ===== Gym Editor =====
function renderGymEditor() {
    const dayData = gymData?.weekly_routine?.[currentDay] || { focus: '', blocks: [] };
    $('#gymFocus').value = dayData.focus || '';

    const container = $('#blocksContainer');
    container.innerHTML = '';

    (dayData.blocks || []).forEach((block, blockIdx) => {
        container.appendChild(createBlockCard(block, blockIdx));
    });
}

function createBlockCard(block, blockIdx) {
    const card = document.createElement('div');
    card.className = 'block-card';
    card.innerHTML = `
        <div class="block-header" onclick="toggleBlockContent(this)">
            <input type="text" class="block-title-input" value="${block.category || ''}" 
                   placeholder="Block Category" onclick="event.stopPropagation()"
                   onchange="updateBlockCategory(${blockIdx}, this.value)">
            <div class="block-actions">
                <button class="icon-btn" onclick="event.stopPropagation(); moveBlock(${blockIdx}, -1)">↑</button>
                <button class="icon-btn" onclick="event.stopPropagation(); moveBlock(${blockIdx}, 1)">↓</button>
                <button class="icon-btn delete" onclick="event.stopPropagation(); deleteBlock(${blockIdx})">✕</button>
            </div>
        </div>
        <div class="block-content open">
            <div class="exercises-list" id="exercises-${blockIdx}"></div>
            <button class="add-exercise-btn" onclick="addExercise(${blockIdx})">+ Add Exercise</button>
        </div>
    `;

    const exercisesList = card.querySelector(`#exercises-${blockIdx}`);
    (block.exercises || []).forEach((ex, exIdx) => {
        exercisesList.appendChild(createExerciseItem(ex, blockIdx, exIdx));
    });

    return card;
}

function createExerciseItem(exercise, blockIdx, exIdx) {
    const item = document.createElement('div');
    item.className = 'exercise-item';

    const isSimple = typeof exercise === 'string';
    const name = isSimple ? exercise : exercise.name;
    const sets = isSimple ? '' : (exercise.sets || '');
    const reps = isSimple ? '' : (exercise.reps || '');

    item.innerHTML = `
        <input type="text" value="${name}" placeholder="Exercise name" 
               onchange="updateExercise(${blockIdx}, ${exIdx}, 'name', this.value)">
        <input type="text" value="${sets}" placeholder="Sets" 
               onchange="updateExercise(${blockIdx}, ${exIdx}, 'sets', this.value)">
        <input type="text" value="${reps}" placeholder="Reps" 
               onchange="updateExercise(${blockIdx}, ${exIdx}, 'reps', this.value)">
        <button class="icon-btn delete" onclick="deleteExercise(${blockIdx}, ${exIdx})">✕</button>
    `;
    return item;
}

// ===== Diet Editor =====
function renderDietEditor() {
    const dayData = dietData?.weekly_diet?.[currentDay] || { focus: '', total_calories: 0, macros: {}, meals: [] };

    $('#dietFocus').value = dayData.focus || '';
    $('#totalCalories').value = dayData.total_calories || '';
    $('#macroProtein').value = dayData.macros?.protein || '';
    $('#macroCarbs').value = dayData.macros?.carbs || '';
    $('#macroFats').value = dayData.macros?.fats || '';

    const container = $('#mealsContainer');
    container.innerHTML = '';

    (dayData.meals || []).forEach((meal, mealIdx) => {
        container.appendChild(createMealCard(meal, mealIdx));
    });
}

function createMealCard(meal, mealIdx) {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.innerHTML = `
        <div class="meal-header" onclick="toggleMealContent(this)">
            <input type="text" class="meal-title-input" value="${meal.meal || ''}" 
                   placeholder="Meal name" onclick="event.stopPropagation()"
                   onchange="updateMealName(${mealIdx}, this.value)">
            <input type="text" style="width:100px;margin-left:10px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:4px;padding:4px 8px;color:var(--text-primary)" 
                   value="${meal.time || ''}" placeholder="Time" onclick="event.stopPropagation()"
                   onchange="updateMealTime(${mealIdx}, this.value)">
            <div class="meal-actions">
                <button class="icon-btn delete" onclick="event.stopPropagation(); deleteMeal(${mealIdx})">✕</button>
            </div>
        </div>
        <div class="meal-content open">
            <div class="foods-list" id="foods-${mealIdx}"></div>
            <button class="add-food-btn" onclick="addFood(${mealIdx})">+ Add Food</button>
        </div>
    `;

    const foodsList = card.querySelector(`#foods-${mealIdx}`);
    (meal.foods || []).forEach((food, foodIdx) => {
        foodsList.appendChild(createFoodItem(food, mealIdx, foodIdx));
    });

    return card;
}

function createFoodItem(food, mealIdx, foodIdx) {
    const item = document.createElement('div');
    item.className = 'food-item';
    item.innerHTML = `
        <input type="text" value="${food.name || ''}" placeholder="Food name" 
               onchange="updateFood(${mealIdx}, ${foodIdx}, 'name', this.value)">
        <input type="text" value="${food.portion || ''}" placeholder="Portion" 
               onchange="updateFood(${mealIdx}, ${foodIdx}, 'portion', this.value)">
        <input type="number" value="${food.calories || ''}" placeholder="Cal" 
               onchange="updateFood(${mealIdx}, ${foodIdx}, 'calories', parseInt(this.value))">
        <input type="text" value="${food.protein || ''}" placeholder="Protein" 
               onchange="updateFood(${mealIdx}, ${foodIdx}, 'protein', this.value)">
        <button class="icon-btn delete" onclick="deleteFood(${mealIdx}, ${foodIdx})">✕</button>
    `;
    return item;
}

// ===== Block Operations =====
function toggleBlockContent(header) {
    header.nextElementSibling.classList.toggle('open');
}

function addBlock() {
    if (!currentDay) return;
    if (!gymData.weekly_routine) gymData.weekly_routine = {};
    if (!gymData.weekly_routine[currentDay]) gymData.weekly_routine[currentDay] = { focus: '', blocks: [] };
    gymData.weekly_routine[currentDay].blocks.push({ category: 'New Block', order: gymData.weekly_routine[currentDay].blocks.length + 1, exercises: [] });
    renderGymEditor();
}

function deleteBlock(blockIdx) {
    gymData.weekly_routine[currentDay].blocks.splice(blockIdx, 1);
    renderGymEditor();
}

function moveBlock(blockIdx, direction) {
    const blocks = gymData.weekly_routine[currentDay].blocks;
    const newIdx = blockIdx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    [blocks[blockIdx], blocks[newIdx]] = [blocks[newIdx], blocks[blockIdx]];
    renderGymEditor();
}

function updateBlockCategory(blockIdx, value) {
    gymData.weekly_routine[currentDay].blocks[blockIdx].category = value;
}

// ===== Exercise Operations =====
function addExercise(blockIdx) {
    gymData.weekly_routine[currentDay].blocks[blockIdx].exercises.push({ name: '', sets: 3, reps: 12 });
    renderGymEditor();
}

function deleteExercise(blockIdx, exIdx) {
    gymData.weekly_routine[currentDay].blocks[blockIdx].exercises.splice(exIdx, 1);
    renderGymEditor();
}

function updateExercise(blockIdx, exIdx, field, value) {
    const exercises = gymData.weekly_routine[currentDay].blocks[blockIdx].exercises;
    if (typeof exercises[exIdx] === 'string') {
        exercises[exIdx] = { name: exercises[exIdx], sets: '', reps: '' };
    }
    if (field === 'sets' && !isNaN(value)) value = parseInt(value);
    exercises[exIdx][field] = value;
}

// ===== Meal Operations =====
function toggleMealContent(header) {
    header.nextElementSibling.classList.toggle('open');
}

function addMeal() {
    if (!currentDay) return;
    if (!dietData.weekly_diet) dietData.weekly_diet = {};
    if (!dietData.weekly_diet[currentDay]) dietData.weekly_diet[currentDay] = { focus: '', total_calories: 0, macros: {}, meals: [] };
    dietData.weekly_diet[currentDay].meals.push({ meal: 'New Meal', time: '12:00 PM', foods: [] });
    renderDietEditor();
}

function deleteMeal(mealIdx) {
    dietData.weekly_diet[currentDay].meals.splice(mealIdx, 1);
    renderDietEditor();
}

function updateMealName(mealIdx, value) {
    dietData.weekly_diet[currentDay].meals[mealIdx].meal = value;
}

function updateMealTime(mealIdx, value) {
    dietData.weekly_diet[currentDay].meals[mealIdx].time = value;
}

// ===== Food Operations =====
function addFood(mealIdx) {
    dietData.weekly_diet[currentDay].meals[mealIdx].foods.push({ name: '', portion: '', calories: 0, protein: '0g' });
    renderDietEditor();
}

function deleteFood(mealIdx, foodIdx) {
    dietData.weekly_diet[currentDay].meals[mealIdx].foods.splice(foodIdx, 1);
    renderDietEditor();
}

function updateFood(mealIdx, foodIdx, field, value) {
    dietData.weekly_diet[currentDay].meals[mealIdx].foods[foodIdx][field] = value;
}

// ===== Save =====
async function saveCurrentDay() {
    if (!currentDay) {
        showToast('Please select a day first', true);
        return;
    }

    try {
        if (currentSection === 'gym') {
            gymData.weekly_routine[currentDay].focus = $('#gymFocus').value;
            await fetch(`/api/gym/${currentDay}?lang=${currentLang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gymData.weekly_routine[currentDay])
            });
        } else {
            const dayData = dietData.weekly_diet[currentDay];
            dayData.focus = $('#dietFocus').value;
            dayData.total_calories = parseInt($('#totalCalories').value) || 0;
            dayData.macros = {
                protein: $('#macroProtein').value,
                carbs: $('#macroCarbs').value,
                fats: $('#macroFats').value
            };
            await fetch(`/api/diet/${currentDay}?lang=${currentLang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dayData)
            });
        }
        showToast('Changes saved successfully!', false);
    } catch (err) {
        showToast('Error saving changes', true);
        console.error(err);
    }
}

// ===== Toast =====
function showToast(message, isError = false) {
    const toast = $('#toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.querySelector('.toast-icon').textContent = isError ? '✕' : '✓';
    toast.classList.toggle('error', isError);
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
