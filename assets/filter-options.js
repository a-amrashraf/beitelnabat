const FILTER_INPUT_NAME = 'filter-options';
const FILTER_ITEM_SELECTOR = '[data-filter-options]';
const FILTER_CONTAINER_SELECTOR = '[data-filter-options-filter]';
const FILTER_COUNT_SELECTOR = '[data-filter-options-count]';
const FILTER_CLEAR_SELECTOR = '[data-filter-options-clear]';

/** @returns {HTMLInputElement[]} */
const getInputs = () =>
  Array.from(document.querySelectorAll(`input[name="${FILTER_INPUT_NAME}"]`)).filter(
    (element) => element instanceof HTMLInputElement
  );
/** @returns {HTMLElement[]} */
const getItems = () => Array.from(document.querySelectorAll(FILTER_ITEM_SELECTOR));
/** @returns {HTMLElement[]} */
const getContainers = () => Array.from(document.querySelectorAll(FILTER_CONTAINER_SELECTOR));

const getSelectedValues = () => getInputs().filter((input) => input.checked).map((input) => input.value);

/** @param {HTMLInputElement} changedInput */
const syncInputs = (changedInput) => {
  getInputs().forEach((input) => {
    if (input.value === changedInput.value) {
      input.checked = changedInput.checked;
    }
  });
};

/** @param {number} count */
const updateCountBubbles = (count) => {
  getContainers().forEach((container) => {
    const countNode = container.querySelector(FILTER_COUNT_SELECTOR);
    if (!countNode) return;
    countNode.textContent = count > 0 ? String(count) : '';
  });
};

const applyFilter = () => {
  const selected = getSelectedValues();
  const items = getItems();

  items.forEach((item) => {
    const values = (item.getAttribute('data-filter-options') || '')
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean);

    const matches =
      selected.length === 0 || selected.some((selectedValue) => values.includes(selectedValue));

    if (matches) {
      item.removeAttribute('hidden');
    } else {
      item.setAttribute('hidden', '');
    }
  });

  updateCountBubbles(selected.length);
};

const clearFilters = () => {
  getInputs().forEach((input) => {
    input.checked = false;
  });
  applyFilter();
};

const bindEvents = () => {
  getInputs().forEach((input) => {
    input.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      syncInputs(event.target);
      applyFilter();
    });
  });

  getContainers().forEach((container) => {
    const clearButton = container.querySelector(FILTER_CLEAR_SELECTOR);
    if (clearButton) {
      clearButton.addEventListener('click', clearFilters);
    }
  });
};

const observeGridUpdates = () => {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  const observer = new MutationObserver(() => {
    applyFilter();
  });

  observer.observe(grid, { childList: true, subtree: false });
};

const initFilterOptions = () => {
  if (getContainers().length === 0 || getInputs().length === 0) return;
  bindEvents();
  applyFilter();
  observeGridUpdates();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFilterOptions, { once: true });
} else {
  initFilterOptions();
}
