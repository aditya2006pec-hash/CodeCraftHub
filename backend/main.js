import './style.css'

const API_BASE = 'http://localhost:5000/api/courses';

const state = {
  courses: [],
  filter: 'All',
  loading: false,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusClass(status) {
  if (status === 'Not Started') return 'status-not-started';
  if (status === 'In Progress') return 'status-in-progress';
  if (status === 'Completed') return 'status-completed';
  return 'status-not-started';
}

function showToast(message, type = 'info') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setLoading(loading) {
  state.loading = loading;
  $('#loading-overlay').style.display = loading ? 'flex' : 'none';
  $('#course-grid').style.display = loading ? 'none' : 'grid';
}

function setButtonLoading(btn, loading) {
  const textEl = btn.querySelector('.btn-text');
  const spinnerEl = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (textEl) textEl.style.display = loading ? 'none' : 'inline';
  if (spinnerEl) spinnerEl.style.display = loading ? 'inline-block' : 'none';
}

function validateForm(formId) {
  const prefix = formId === 'course-form' ? '' : 'edit-';
  let valid = true;

  const fields = [
    { name: 'name', label: 'Course name' },
    { name: 'description', label: 'Description' },
    { name: 'target_date', label: 'Target date' },
    { name: 'status', label: 'Status' },
  ];

  fields.forEach(({ name, label }) => {
    const input = $(`#${prefix}${name === 'target_date' ? 'target-date' : name}`);
    const errorEl = $(`#${prefix}${name}-error`);
    if (!input || !errorEl) return;

    const value = input.value.trim();
    if (!value) {
      input.classList.add('error');
      errorEl.textContent = `${label} is required`;
      valid = false;
    } else {
      input.classList.remove('error');
      errorEl.textContent = '';
    }
  });

  return valid;
}

function clearValidation(formId) {
  const prefix = formId === 'course-form' ? '' : 'edit-';
  const fields = ['name', 'description', 'target-date', 'status'];
  fields.forEach((f) => {
    const input = $(`#${prefix}${f}`);
    const errorEl = $(`#${prefix}${f.replace('target-date', 'target_date')}-error`);
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  });
}

function getFormData(prefix) {
  const nameEl = $(`#${prefix}name`);
  const descEl = $(`#${prefix}description`);
  const dateEl = $(`#${prefix}target-date`);
  const statusEl = $(`#${prefix}status`);
  return {
    name: nameEl.value.trim(),
    description: descEl.value.trim(),
    target_date: dateEl.value,
    status: statusEl.value,
  };
}

async function apiCall(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchCourses() {
  setLoading(true);
  try {
    const data = await apiCall(API_BASE);
    state.courses = Array.isArray(data) ? data : data.courses || [];
    renderCourses();
  } catch (err) {
    showToast('Failed to load courses: ' + err.message, 'error');
    state.courses = [];
    renderCourses();
  } finally {
    setLoading(false);
  }
}

async function createCourse(data) {
  const btn = $('#submit-btn');
  setButtonLoading(btn, true);
  try {
    const course = await apiCall(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    showToast('Course added successfully!', 'success');
    $('#course-form').reset();
    clearValidation('course-form');
    await fetchCourses();
  } catch (err) {
    showToast('Failed to add course: ' + err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

async function updateCourse(id, data) {
  const btn = $('#edit-submit-btn');
  setButtonLoading(btn, true);
  try {
    await apiCall(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    showToast('Course updated successfully!', 'success');
    closeModal();
    await fetchCourses();
  } catch (err) {
    showToast('Failed to update course: ' + err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

async function deleteCourse(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
  try {
    await apiCall(`${API_BASE}/${id}`, { method: 'DELETE' });
    showToast('Course deleted successfully!', 'success');
    await fetchCourses();
  } catch (err) {
    showToast('Failed to delete course: ' + err.message, 'error');
  }
}

function renderCourses() {
  const grid = $('#course-grid');
  const emptyState = $('#empty-state');
  const filtered = state.filter === 'All'
    ? state.courses
    : state.courses.filter((c) => c.status === state.filter);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    emptyState.querySelector('p').textContent =
      state.courses.length === 0
        ? 'No courses found. Add your first course above!'
        : `No courses with status "${state.filter}".`;
    return;
  }

  emptyState.style.display = 'none';
  grid.innerHTML = filtered
    .map(
      (c) => `
    <div class="course-card" data-id="${c.id}">
      <div class="course-card-header">
        <h3 class="course-name">${escapeHtml(c.name)}</h3>
        <div class="course-actions">
          <button class="btn btn-edit btn-sm" onclick="window.__editCourse(${c.id})">Edit</button>
          <button class="btn btn-delete btn-sm" onclick="window.__deleteCourse(${c.id}, '${escapeAttr(c.name)}')">Remove</button>
        </div>
      </div>
      <p class="course-description">${escapeHtml(c.description)}</p>
      <div class="course-meta">
        <span class="course-meta-item">
          <span class="meta-label">Target:</span> ${formatDate(c.target_date)}
        </span>
        <span class="course-meta-item">
          <span class="status-badge ${statusClass(c.status)}">${escapeHtml(c.status)}</span>
        </span>
        <span class="course-meta-item">
          <span class="meta-label">Created:</span> ${formatDate(c.created_at)}
        </span>
      </div>
    </div>`
    )
    .join('');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function openEditModal(course) {
  const modal = $('#edit-modal');
  $('#edit-course-id').value = course.id;
  $('#edit-name').value = course.name || '';
  $('#edit-description').value = course.description || '';
  $('#edit-target-date').value = course.target_date || '';
  $('#edit-status').value = course.status || '';
  clearValidation('edit-form');
  modal.style.display = 'flex';
}

function closeModal() {
  $('#edit-modal').style.display = 'none';
}

function findCourse(id) {
  return state.courses.find((c) => c.id === id || c.id === Number(id));
}

// Expose to inline onclick handlers
window.__editCourse = (id) => {
  const course = findCourse(id);
  if (course) openEditModal(course);
};

window.__deleteCourse = (id, name) => {
  deleteCourse(id, name);
};

// Event listeners
function init() {
  // Add course form
  $('#course-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm('course-form')) return;
    const data = getFormData('');
    createCourse(data);
  });

  $('#course-form').addEventListener('reset', () => {
    clearValidation('course-form');
  });

  // Edit form
  $('#edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm('edit-form')) return;
    const id = $('#edit-course-id').value;
    const data = getFormData('edit-');
    updateCourse(id, data);
  });

  // Modal close
  $('#modal-close-btn').addEventListener('click', closeModal);
  $('#edit-cancel-btn').addEventListener('click', closeModal);
  $('#edit-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Filter
  $('#status-filter').addEventListener('change', (e) => {
    state.filter = e.target.value;
    renderCourses();
  });

  // Clear validation on input
  $$('#course-form input, #course-form select, #course-form textarea').forEach((el) => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const name = el.name;
      const errorEl = $(`#${name}-error`);
      if (errorEl) errorEl.textContent = '';
    });
  });

  // Initial fetch
  fetchCourses();
}

document.addEventListener('DOMContentLoaded', init);
