function renderPagination(container, { page, totalPages, hasNext, onChange }) {
  if (!container) return;
  const knownTotal = typeof totalPages === 'number';

  if (knownTotal && totalPages <= 1) {
    container.innerHTML = '';
    container.hidden = true;
    return;
  }

  container.hidden = false;
  const prevDisabled = page <= 1;
  const nextDisabled = knownTotal ? page >= totalPages : !hasNext;
  const label = knownTotal ? `Sayfa ${page} / ${totalPages}` : `Sayfa ${page}`;

  container.innerHTML = `
    <button type="button" class="pagination-btn" id="pagination-prev" ${prevDisabled ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      Onceki
    </button>
    <span class="pagination-info">${label}</span>
    <button type="button" class="pagination-btn" id="pagination-next" ${nextDisabled ? 'disabled' : ''}>
      Sonraki
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </button>
  `;

  if (!prevDisabled) {
    container.querySelector('#pagination-prev').addEventListener('click', () => onChange(page - 1));
  }
  if (!nextDisabled) {
    container.querySelector('#pagination-next').addEventListener('click', () => onChange(page + 1));
  }
}
