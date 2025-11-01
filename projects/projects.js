import { fetchJSON, renderProjects } from "../global.js";

let globalProjects = [];
let currentQuery = '';
let selectedYear = '';

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

const yearFilterWrapper = document.querySelector('.custom-select-wrapper');
const yearFilterTrigger = document.querySelector('.custom-select-trigger');
const yearFilterTriggerText = yearFilterTrigger.querySelector('span');
const yearOptions = document.querySelector('.custom-options');

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

function updateVisuals() {
    const searchFilteredProjects = globalProjects.filter((project) => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(currentQuery);
    });

    const finalFilteredProjects = selectedYear
        ? searchFilteredProjects.filter(p => p.year === selectedYear)
        : searchFilteredProjects;

    renderProjects(finalFilteredProjects, projectsContainer);
}

async function main() {
    globalProjects = await fetchJSON('../lib/projects.json');

    if (globalProjects && projectsContainer) {
        populateYearFilter();
        updateVisuals();
    }

    searchInput.addEventListener('input', (event) => {
        currentQuery = event.target.value.toLowerCase();
        updateVisuals();
    });

    yearFilterTrigger.addEventListener('click', () => {
        yearFilterWrapper.classList.toggle('open');
        yearOptions.classList.toggle('open');
    });

    yearOptions.addEventListener('click', (event) => {
        if (event.target.classList.contains('custom-option')) {
            const clickedOption = event.target;
            selectedYear = clickedOption.getAttribute('data-value');
            yearFilterTriggerText.textContent = clickedOption.textContent;

            yearFilterWrapper.classList.remove('open');
            yearOptions.classList.remove('open');

            updateVisuals();
        }
    });

    document.addEventListener('click', (event) => {
        if (!yearFilterWrapper.contains(event.target)) {
            yearFilterWrapper.classList.remove('open');
            yearOptions.classList.remove('open');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await main();
});