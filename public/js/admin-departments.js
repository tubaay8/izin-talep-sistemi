const tbody = document.getElementById('departments-body');
const messageEl = document.getElementById('list-message');
const createForm = document.getElementById('create-form');
const newDepartmentName = document.getElementById('new-department-name');
const newDepartmentManager = document.getElementById('new-department-manager');

let departments = [];

async function fetchAvailableManagers(excludeDepartmentId) {
  const url = excludeDepartmentId
    ? `/api/managers/available?exclude_department_id=${excludeDepartmentId}`
    : '/api/managers/available';
  const res = await fetch(url);
  const data = await res.json();
  return data.managers || [];
}

function managerOptionsHtml(managers, selectedId) {
  return (
    '<option value="">Seciniz...</option>' +
    managers
      .map(
        (m) =>
          `<option value="${m.id}" ${Number(selectedId) === m.id ? 'selected' : ''}>${m.full_name}</option>`
      )
      .join('')
  );
}

async function populateCreateManagerSelect() {
  const managers = await fetchAvailableManagers();
  newDepartmentManager.innerHTML = managerOptionsHtml(managers, null);
}

const ICON_EDIT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>';
const ICON_TRASH =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

function renderViewRow(dept) {
  const tr = document.createElement('tr');
  tr.dataset.id = dept.id;
  tr.innerHTML = `
    <td>${dept.name}</td>
    <td>${dept.manager_name || '-'}</td>
    <td>
      <div class="quick-actions">
        <button class="btn-edit" data-action="edit">${ICON_EDIT}Duzenle</button>
        <button class="btn-delete" data-action="delete">${ICON_TRASH}Sil</button>
      </div>
    </td>
  `;
  return tr;
}

async function renderEditRow(dept) {
  const managers = await fetchAvailableManagers(dept.id);
  const tr = document.createElement('tr');
  tr.dataset.id = dept.id;
  tr.innerHTML = `
    <td><input type="text" class="edit-name-input" value="${dept.name}" /></td>
    <td><select class="edit-manager-select">${managerOptionsHtml(managers, dept.manager_id)}</select></td>
    <td>
      <div class="quick-actions">
        <button class="btn-save" data-action="save">${ICON_CHECK}Kaydet</button>
        <button class="btn-cancel" data-action="cancel">${ICON_X}Iptal</button>
      </div>
    </td>
  `;
  return tr;
}

function renderList() {
  tbody.innerHTML = '';
  departments.forEach((dept) => {
    tbody.appendChild(renderViewRow(dept));
  });
}

async function loadDepartments() {
  try {
    const res = await fetch('/api/departments');
    const data = await res.json();
    departments = data.departments;

    if (departments.length === 0) {
      messageEl.textContent = 'Henuz departman bulunmuyor.';
      messageEl.className = 'form-message';
    } else {
      messageEl.textContent = '';
    }
    renderList();
    await populateCreateManagerSelect();
  } catch (err) {
    messageEl.textContent = 'Departmanlar yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = newDepartmentName.value.trim();
  if (!name) return;
  const manager_id = newDepartmentManager.value || null;

  try {
    const res = await fetch('/api/admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, manager_id }),
    });
    const data = await res.json();
    if (!res.ok) {
      showErrorDialog(data.message || 'Departman eklenemedi');
      return;
    }
    newDepartmentName.value = '';
    newDepartmentManager.value = '';
    loadDepartments();
  } catch (err) {
    showErrorDialog('Sunucuya baglanilamadi');
  }
});

tbody.addEventListener('click', async (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.getAttribute('data-action');

  const tr = event.target.closest('tr');
  const id = tr.dataset.id;
  const dept = departments.find((d) => String(d.id) === id);

  if (action === 'edit') {
    tr.replaceWith(await renderEditRow(dept));
    return;
  }

  if (action === 'cancel') {
    tr.replaceWith(renderViewRow(dept));
    return;
  }

  if (action === 'save') {
    const input = tr.querySelector('.edit-name-input');
    const managerSelect = tr.querySelector('.edit-manager-select');
    const name = input.value.trim();
    if (!name) return;
    const manager_id = managerSelect.value || null;

    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, manager_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showErrorDialog(data.message || 'Departman guncellenemedi');
        return;
      }
      loadDepartments();
    } catch (err) {
      showErrorDialog('Sunucuya baglanilamadi');
    }
    return;
  }

  if (action === 'delete') {
    const confirmed = await confirmDialog({
      title: 'Departmani Sil',
      text: `"${dept.name}" departmanini silmek istediginize emin misiniz?`,
      icon: 'warning',
      confirmText: 'Evet, Sil',
      confirmColor: '#D9534F',
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showErrorDialog(data.message || 'Departman silinemedi');
        return;
      }
      loadDepartments();
    } catch (err) {
      showErrorDialog('Sunucuya baglanilamadi');
    }
  }
});

loadDepartments();
