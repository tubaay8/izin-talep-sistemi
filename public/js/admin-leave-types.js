const tbody = document.getElementById('leave-types-body');
const messageEl = document.getElementById('list-message');
const createForm = document.getElementById('create-form');
const newLeaveTypeName = document.getElementById('new-leave-type-name');
const newLeaveTypeDescription = document.getElementById('new-leave-type-description');

let leaveTypes = [];

const ICON_EDIT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>';
const ICON_TRASH =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

function renderViewRow(type) {
  const tr = document.createElement('tr');
  tr.dataset.id = type.id;
  tr.innerHTML = `
    <td>${type.name}</td>
    <td>${type.description || '-'}</td>
    <td>
      <div class="quick-actions">
        <button class="btn-edit" data-action="edit">${ICON_EDIT}Duzenle</button>
        <button class="btn-delete" data-action="delete">${ICON_TRASH}Sil</button>
      </div>
    </td>
  `;
  return tr;
}

function renderEditRow(type) {
  const tr = document.createElement('tr');
  tr.dataset.id = type.id;
  tr.innerHTML = `
    <td><input type="text" class="edit-name-input" value="${type.name}" /></td>
    <td><input type="text" class="edit-description-input" value="${type.description || ''}" /></td>
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
  leaveTypes.forEach((type) => {
    tbody.appendChild(renderViewRow(type));
  });
}

async function loadLeaveTypes() {
  try {
    const res = await fetch('/api/leave-types');
    const data = await res.json();
    leaveTypes = data.leaveTypes;

    if (leaveTypes.length === 0) {
      messageEl.textContent = 'Henuz izin turu bulunmuyor.';
      messageEl.className = 'form-message';
    } else {
      messageEl.textContent = '';
    }
    renderList();
  } catch (err) {
    messageEl.textContent = 'Izin turleri yuklenirken bir hata olustu';
    messageEl.className = 'form-message error';
  }
}

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = newLeaveTypeName.value.trim();
  if (!name) return;
  const description = newLeaveTypeDescription.value.trim();

  try {
    const res = await fetch('/api/admin/leave-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      showErrorDialog(data.message || 'Izin turu eklenemedi');
      return;
    }
    newLeaveTypeName.value = '';
    newLeaveTypeDescription.value = '';
    loadLeaveTypes();
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
  const type = leaveTypes.find((t) => String(t.id) === id);

  if (action === 'edit') {
    tr.replaceWith(renderEditRow(type));
    return;
  }

  if (action === 'cancel') {
    tr.replaceWith(renderViewRow(type));
    return;
  }

  if (action === 'save') {
    const name = tr.querySelector('.edit-name-input').value.trim();
    const description = tr.querySelector('.edit-description-input').value.trim();
    if (!name) return;

    try {
      const res = await fetch(`/api/admin/leave-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        showErrorDialog(data.message || 'Izin turu guncellenemedi');
        return;
      }
      loadLeaveTypes();
    } catch (err) {
      showErrorDialog('Sunucuya baglanilamadi');
    }
    return;
  }

  if (action === 'delete') {
    const confirmed = await confirmDialog({
      title: 'Izin Turunu Sil',
      text: `"${type.name}" izin turunu silmek istediginize emin misiniz?`,
      icon: 'warning',
      confirmText: 'Evet, Sil',
      confirmColor: '#D9534F',
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/leave-types/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showErrorDialog(data.message || 'Izin turu silinemedi');
        return;
      }
      loadLeaveTypes();
    } catch (err) {
      showErrorDialog('Sunucuya baglanilamadi');
    }
  }
});

loadLeaveTypes();
