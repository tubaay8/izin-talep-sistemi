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

function showTemporaryPasswordDialog(fullName, password) {
  return Swal.fire({
    title: 'Kullanici Olusturuldu',
    html: `<p>${fullName} icin gecici bir sifre olusturuldu. Bu sifreyi kullaniciya iletin, ilk giriste degistirmesi istenecek.</p>
           <p style="font-size:1.3rem;font-weight:700;letter-spacing:0.05em;margin-top:0.75rem;">${password}</p>`,
    icon: 'success',
    confirmButtonText: 'Anladim',
    confirmButtonColor: DIALOG_COLORS.neutral,
    allowOutsideClick: false,
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

async function confirmResetPassword(fullName) {
  const result = await Swal.fire({
    title: 'Sifreyi Sifirla',
    html: `<strong>${fullName}</strong> icin yeni bir sifre belirleyin.`,
    icon: 'question',
    input: 'text',
    inputLabel: 'Yeni Sifre',
    inputPlaceholder: 'En az 6 karakter',
    inputValidator: (value) => (!value || value.trim().length < 6 ? 'Sifre en az 6 karakter olmalidir' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Sifreyi Guncelle',
    cancelButtonText: 'Vazgec',
    confirmButtonColor: DIALOG_COLORS.neutral,
    cancelButtonColor: '#8C8C8C',
    reverseButtons: true,
  });

  if (!result.isConfirmed) {
    return null;
  }
  return result.value.trim();
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

function confirmBulkApprove(count) {
  return confirmDialog({
    title: 'Toplu Onay',
    text: `Secilen ${count} izin talebini onaylamak istediginize emin misiniz? Bu islem geri alinamaz.`,
    icon: 'question',
    confirmText: 'Onayla',
    confirmColor: DIALOG_COLORS.approve,
  });
}

async function confirmBulkReject(count) {
  const result = await Swal.fire({
    title: 'Toplu Red',
    html: `Secilen <strong>${count}</strong> izin talebi reddedilecek.`,
    icon: 'warning',
    input: 'textarea',
    inputLabel: 'Red Sebebi',
    inputPlaceholder: 'Red gerekcesini yaziniz...',
    inputValidator: (value) => (!value || !value.trim() ? 'Red sebebi zorunludur' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Reddet',
    cancelButtonText: 'Iptal',
    confirmButtonColor: DIALOG_COLORS.reject,
    cancelButtonColor: '#8C8C8C',
    reverseButtons: true,
    focusCancel: true,
  });

  if (!result.isConfirmed) {
    return null;
  }
  return { note: result.value.trim() };
}

function showActionToast(message, icon = 'success') {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}
