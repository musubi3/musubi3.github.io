import { fetchJSON, renderProjects } from "../global.js";

let globalProjects = [];
let currentQuery = '';
let selectedYear = '';
let selectedTag = ''; // <-- NEW state for tags

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

// --- Year Filter Selectors ---
const yearFilterWrapper = document.querySelector('#year-filter-wrapper');
const yearFilterTrigger = yearFilterWrapper.querySelector('.custom-select-trigger');
const yearFilterTriggerText = yearFilterTrigger.querySelector('span');
const yearOptions = yearFilterWrapper.querySelector('.custom-options');

// --- NEW Tag Filter Selectors ---
const tagFilterWrapper = document.querySelector('#tag-filter-wrapper');
const tagFilterTrigger = tagFilterWrapper.querySelector('.custom-select-trigger');
const tagFilterTriggerText = tagFilterTrigger.querySelector('span');
const tagOptions = tagFilterWrapper.querySelector('.custom-options');

/**
 * Populates the year filter
 */
function populateYearFilter() {
    const allYearsOption = document.createElement('div');
    allYearsOption.textContent = 'All Years';
    allYearsOption.classList.add('custom-option');
    allYearsOption.setAttribute('data-value', '');
    yearOptions.appendChild(allYearsOption);

    const years = [...new Set(globalProjects.map(p => p.year))];
    years.sort((a, b) => b - a);

    for (const year of years) {
        const option = document.createElement('div');
        option.textContent = year;
        option.classList.add('custom-option');
        option.setAttribute('data-value', year);
        yearOptions.appendChild(option);
    }
}

/**
 * NEW: Populates the tag filter
 */
function populateTagFilter() {
    const allTagsOption = document.createElement('div');
    allTagsOption.textContent = 'All Tags';
    allTagsOption.classList.add('custom-option');
    allTagsOption.setAttribute('data-value', '');
    tagOptions.appendChild(allTagsOption);

    // Get all unique tags
    const allTags = new Set();
    globalProjects.forEach(project => {
        if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach(tag => allTags.add(tag));
        }
    });

    const sortedTags = [...allTags].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    for (const tag of sortedTags) {
        const option = document.createElement('div');
        option.textContent = tag;
        option.classList.add('custom-option');
        option.setAttribute('data-value', tag);
        tagOptions.appendChild(option);
    }
}

/**
 * UPDATED: Filters by query, then year, then tag
 */
function updateVisuals() {
    // 1. Filter by search query
    const searchFilteredProjects = globalProjects.filter((project) => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(currentQuery);
    });

    // 2. Filter by selected year
    const yearFilteredProjects = selectedYear
        ? searchFilteredProjects.filter(p => p.year === selectedYear)
        : searchFilteredProjects;

    // 3. Filter by selected tag
    const finalFilteredProjects = selectedTag
        ? yearFilteredProjects.filter(p => p.tags && p.tags.includes(selectedTag))
        : yearFilteredProjects;

    renderProjects(finalFilteredProjects, projectsContainer);
}

async function main() {
    globalProjects = await fetchJSON('../lib/projects.json');

    if (globalProjects && projectsContainer) {
        populateYearFilter();
        populateTagFilter(); // <-- NEW
        updateVisuals();
    }

    searchInput.addEventListener('input', (event) => {
        currentQuery = event.target.value.toLowerCase();
        updateVisuals();
    });

    // --- Year Filter Listeners ---
    yearFilterTrigger.addEventListener('click', () => {
        yearFilterWrapper.classList.toggle('open');
        yearOptions.classList.toggle('open');
    });

    yearOptions.addEventListener('click', (event) => {
        if (event.target.classList.contains('custom-option')) {
            selectedYear = event.target.getAttribute('data-value');
            yearFilterTriggerText.textContent = event.target.textContent;
            yearFilterWrapper.classList.remove('open');
            yearOptions.classList.remove('open');
            updateVisuals();
        }
    });

    // --- NEW: Tag Filter Listeners ---
    tagFilterTrigger.addEventListener('click', () => {
        tagFilterWrapper.classList.toggle('open');
        tagOptions.classList.toggle('open');
    });

    tagOptions.addEventListener('click', (event) => {
        if (event.target.classList.contains('custom-option')) {
            selectedTag = event.target.getAttribute('data-value');
            tagFilterTriggerText.textContent = event.target.textContent;
            tagFilterWrapper.classList.remove('open');
            tagOptions.classList.remove('open');
            updateVisuals();
        }
    });

    // --- Close-on-click-outside Listener (UPDATED) ---
    document.addEventListener('click', (event) => {
        // If the click is *not* inside the year filter
        if (!yearFilterWrapper.contains(event.target)) {
            yearFilterWrapper.classList.remove('open');
            yearOptions.classList.remove('open');
        }
        // If the click is *not* inside the tag filter
        if (!tagFilterWrapper.contains(event.target)) {
            tagFilterWrapper.classList.remove('open');
            tagOptions.classList.remove('open');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await main();
});