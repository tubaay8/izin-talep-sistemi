const tbody = document.getElementById('departments-body');
const messageEl = document.getElementById('list-message');
const createForm = document.getElementById('create-form');
const newDepartmentName = document.getElementById('new-department-name');

let departments = [];

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
    <td>
      <div class="quick-actions">
        <button class="link-btn" data-action="edit">${ICON_EDIT}Duzenle</button>
        <button class="link-btn" data-action="delete">${ICON_TRASH}Sil</button>
      </div>
    </td>
  `;
  return tr;
}

function renderEditRow(dept) {
  const tr = document.createElement('tr');
  tr.dataset.id = dept.id;
  tr.innerHTML = `
    <td><input type="text" class="edit-name-input" value="${dept.name}" /></td>
    <td>
      <div class="quick-actions">
        <button class="link-btn" data-action="save">${ICON_CHECK}Kaydet</button>
        <button class="link-btn" data-action="cancel">${ICON_X}Iptal</button>
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
  } catch (err) {
    messageEl.textContent = 'Departmanlar yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = newDepartmentName.value.trim();
  if (!name) return;

  try {
    const res = await fetch('/api/admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      showErrorDialog(data.message || 'Departman eklenemedi');
      return;
    }
    newDepartmentName.value = '';
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
    tr.replaceWith(renderEditRow(dept));
    return;
  }

  if (action === 'cancel') {
    tr.replaceWith(renderViewRow(dept));
    return;
  }

  if (action === 'save') {
    const input = tr.querySelector('.edit-name-input');
    const name = input.value.trim();
    if (!name) return;

    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
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
      confirmColor: '#c0392b',
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
