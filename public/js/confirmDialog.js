const DIALOG_COLORS = {
  approve: '#4CAF50',
  reject: '#D9534F',
  neutral: '#3E2522',
};

function confirmDialog({ title, text, icon = 'question', confirmText, confirmColor = DIALOG_COLORS.neutral }) {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Vazgec',
    confirmButtonColor: confirmColor,
    cancelButtonColor: '#8C8C8C',
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => result.isConfirmed);
}

function confirmApproveRequest() {
  return confirmDialog({
    title: 'Islemi Onayla',
    text: 'Bu izin talebini onaylamak istediginize emin misiniz?',
    icon: 'question',
    confirmText: 'Evet, Onayla',
    confirmColor: DIALOG_COLORS.approve,
  });
}

async function confirmRejectRequest() {
  const result = await Swal.fire({
    title: 'Izin Talebini Reddet',
    text: 'Bu izin talebini reddetmek istediginize emin misiniz?',
    icon: 'warning',
    input: 'textarea',
    inputLabel: 'Red gerekcesi (opsiyonel)',
    inputPlaceholder: 'Aciklama yazabilirsiniz...',
    showCancelButton: true,
    confirmButtonText: 'Evet, Reddet',
    cancelButtonText: 'Vazgec',
    confirmButtonColor: DIALOG_COLORS.reject,
    cancelButtonColor: '#8C8C8C',
    reverseButtons: true,
    focusCancel: true,
  });

  if (!result.isConfirmed) {
    return null;
  }
  return { note: result.value || '' };
}

function confirmCancelRequest() {
  return confirmDialog({
    title: 'Izin Talebini Iptal Et',
    text: 'Bu izin talebini iptal etmek istediginize emin misiniz?',
    icon: 'warning',
    confirmText: 'Evet, Iptal Et',
    confirmColor: DIALOG_COLORS.reject,
  });
}

function showErrorDialog(message) {
  return Swal.fire({
    title: 'Islem Basarisiz',
    text: message,
    icon: 'error',
    confirmButtonText: 'Tamam',
    confirmButtonColor: DIALOG_COLORS.neutral,
  });
}

function confirmStatusChange(label) {
  return confirmDialog({
    title: 'Durumu Degistir',
    text: `Durumu "${label}" olarak degistirmek istiyor musunuz?`,
    icon: 'question',
    confirmText: 'Evet, Degistir',
    confirmColor: DIALOG_COLORS.neutral,
  });
}
