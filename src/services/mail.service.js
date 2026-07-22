// Mailtrap'in test kutusuna (sandbox) HTTPS API uzerinden gonderim yapilir.
// Onceden nodemailer + ham SMTP kullaniliyordu; bazi barindirma
// platformlarinda (orn. Railway) SMTP portlarina (2525/587) giden baglanti
// zaman asimina ugrayabiliyor. HTTPS zaten uygulamanin kendisi icin acik
// oldugundan, ayni protokolu mail gonderimi icin de kullanmak bu sorunu
// tamamen ortadan kaldirir.
const MAILTRAP_API_URL = `https://sandbox.api.mailtrap.io/api/send/${process.env.MAILTRAP_INBOX_ID}`;

function parseFromAddress(raw) {
  const match = /^(.*)<(.+)>$/.exec(raw || '');
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2].trim() };
  }
  return { email: raw };
}

async function sendViaMailtrapApi({ to, subject, html }) {
  const res = await fetch(MAILTRAP_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: parseFromAddress(process.env.MAIL_FROM),
      to: [{ email: to }],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Mailtrap API ${res.status}${detail ? `: ${detail}` : ''}`);
  }
}

async function verifyConnection() {
  if (!process.env.MAILTRAP_API_TOKEN || !process.env.MAILTRAP_INBOX_ID) {
    throw new Error('MAILTRAP_API_TOKEN veya MAILTRAP_INBOX_ID tanimli degil');
  }
}

function formatDateTR(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('-');
  return `${day}.${month}.${year}`;
}

// Tum mail sablonlarinin ortak govdesi (header/footer); her bildirim turu
// sadece kendi ic icerigini (bodyHtml) uretir, boylece tasarim tek yerden
// yonetilir ve mevcut kahverengi/krem tema her mailde tutarli kalir.
function buildEmailShell({ title, bodyHtml }) {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#FFF2DF; font-family:'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF2DF; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 12px 30px rgba(62,37,34,0.14);">
          <tr>
            <td style="background-color:#3E2522; padding:28px 32px; text-align:center;">
              <span style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:10px; background:#8C6E63; color:#ffffff; font-weight:700; font-size:14px; line-height:40px;">İT</span>
              <div style="color:#ffffff; font-size:16px; font-weight:700; margin-top:10px;">İzin Talep Sistemi</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px; text-align:left;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:#FFE0B2; padding:18px 32px; text-align:center;">
              <span style="font-size:11.5px; color:#3E2522;">İzin Talep Sistemi &middot; Bu e-posta otomatik olarak gönderilmiştir.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildDetailRows(rows) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px; background-color:#FFF2DF; border-radius:14px;">
      ${rows
        .map(
          ([label, value]) => `
      <tr>
        <td style="padding:10px 16px; font-size:12.5px; color:#8C6E63; font-weight:600; white-space:nowrap; vertical-align:top;">${label}</td>
        <td style="padding:10px 16px; font-size:13.5px; color:#3E2522; vertical-align:top;">${value}</td>
      </tr>`
        )
        .join('')}
    </table>`;
}

function buildButton({ url, label }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:14px; background-color:#8C6E63;">
          <a href="${url}" target="_blank" style="display:inline-block; padding:13px 32px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:14px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

function buildPasswordResetEmailHtml({ fullName, resetUrl }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; color:#3E2522;">Şifre Sıfırlama Talebi</h1>
    <p style="margin:0 0 8px; font-size:14px; color:#3E2522; line-height:1.6;">Merhaba <strong>${fullName}</strong>,</p>
    <p style="margin:0 0 24px; font-size:14px; color:#5c463f; line-height:1.6;">
      Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu bağlantı
      güvenliğiniz için <strong>15 dakika</strong> boyunca geçerlidir.
    </p>
    ${buildButton({ url: resetUrl, label: 'Şifremi Yenile' })}
    <p style="margin:0 0 6px; font-size:12.5px; color:#8C6E63;">Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza yapıştırın:</p>
    <p style="margin:0 0 24px; font-size:12.5px; word-break:break-all;">
      <a href="${resetUrl}" target="_blank" style="color:#8C6E63;">${resetUrl}</a>
    </p>
    <p style="margin:0; font-size:12.5px; color:#a08a7d; line-height:1.6;">
      Bu talebi siz oluşturmadıysanız bu e-postayı görmezden gelebilirsiniz;
      şifreniz değiştirilmeyecektir.
    </p>`;
  return buildEmailShell({ title: 'Sifre Sifirlama Talebi', bodyHtml });
}

function buildLeaveRequestCreatedHtml({ managerName, employeeName, leaveTypeName, startDate, endDate, reason }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; color:#3E2522;">Yeni İzin Talebi</h1>
    <p style="margin:0 0 8px; font-size:14px; color:#3E2522; line-height:1.6;">Merhaba <strong>${managerName}</strong>,</p>
    <p style="margin:0 0 20px; font-size:14px; color:#5c463f; line-height:1.6;">
      <strong>${employeeName}</strong> adlı personeliniz yeni bir izin talebi oluşturdu. Detaylar aşağıdadır:
    </p>
    ${buildDetailRows([
      ['İzin Türü', leaveTypeName],
      ['Tarih Aralığı', `${formatDateTR(startDate)} - ${formatDateTR(endDate)}`],
      ['Açıklama', reason || '-'],
    ])}
    <p style="margin:0; font-size:12.5px; color:#a08a7d; line-height:1.6;">
      Talebi incelemek ve karar vermek için sisteme giriş yapabilirsiniz.
    </p>`;
  return buildEmailShell({ title: 'Yeni Izin Talebi', bodyHtml });
}

function buildLeaveRequestApprovedHtml({ employeeName, leaveTypeName, startDate, endDate }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; color:#3E2522;">İzin Talebiniz Onaylandı</h1>
    <p style="margin:0 0 8px; font-size:14px; color:#3E2522; line-height:1.6;">Merhaba <strong>${employeeName}</strong>,</p>
    <p style="margin:0 0 20px; font-size:14px; color:#5c463f; line-height:1.6;">
      Aşağıdaki izin talebiniz onaylanmıştır.
    </p>
    ${buildDetailRows([
      ['İzin Türü', leaveTypeName],
      ['Tarih Aralığı', `${formatDateTR(startDate)} - ${formatDateTR(endDate)}`],
      ['Durum', '<span style="color:#4CAF50; font-weight:700;">Onaylandı</span>'],
    ])}
    <p style="margin:0; font-size:12.5px; color:#a08a7d; line-height:1.6;">
      İyi tatiller dileriz.
    </p>`;
  return buildEmailShell({ title: 'Izin Talebi Onaylandi', bodyHtml });
}

function buildLeaveRequestRejectedHtml({ employeeName, leaveTypeName, startDate, endDate, reason }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; color:#3E2522;">İzin Talebiniz Reddedildi</h1>
    <p style="margin:0 0 8px; font-size:14px; color:#3E2522; line-height:1.6;">Merhaba <strong>${employeeName}</strong>,</p>
    <p style="margin:0 0 20px; font-size:14px; color:#5c463f; line-height:1.6;">
      Aşağıdaki izin talebiniz reddedilmiştir.
    </p>
    ${buildDetailRows([
      ['İzin Türü', leaveTypeName],
      ['Tarih Aralığı', `${formatDateTR(startDate)} - ${formatDateTR(endDate)}`],
      ['Durum', '<span style="color:#D9534F; font-weight:700;">Reddedildi</span>'],
      ['Red Sebebi', reason || 'Belirtilmedi'],
    ])}
    <p style="margin:0; font-size:12.5px; color:#a08a7d; line-height:1.6;">
      Sorularınız için yöneticinizle iletişime geçebilirsiniz.
    </p>`;
  return buildEmailShell({ title: 'Izin Talebi Reddedildi', bodyHtml });
}

function buildDelegateAssignedHtml({ delegateName, employeeName, leaveTypeName, startDate, endDate }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px; font-size:20px; color:#3E2522;">Vekalet Ataması</h1>
    <p style="margin:0 0 8px; font-size:14px; color:#3E2522; line-height:1.6;">Merhaba <strong>${delegateName}</strong>,</p>
    <p style="margin:0 0 20px; font-size:14px; color:#5c463f; line-height:1.6;">
      <strong>${employeeName}</strong> izinli olduğu sürece sizi vekil olarak belirlemiştir.
    </p>
    ${buildDetailRows([
      ['İzin Türü', leaveTypeName],
      ['Tarih Aralığı', `${formatDateTR(startDate)} - ${formatDateTR(endDate)}`],
    ])}
    <p style="margin:0; font-size:12.5px; color:#a08a7d; line-height:1.6;">
      Bu tarihler arasında ilgili sorumlulukları devralmanız gerekebilir.
    </p>`;
  return buildEmailShell({ title: 'Vekalet Atamasi', bodyHtml });
}

async function sendPasswordResetEmail({ to, fullName, resetUrl }) {
  await sendViaMailtrapApi({
    to,
    subject: 'Şifre Sıfırlama Talebi',
    html: buildPasswordResetEmailHtml({ fullName, resetUrl }),
  });
}

async function sendLeaveRequestCreatedEmail({ to, managerName, employeeName, leaveTypeName, startDate, endDate, reason }) {
  await sendViaMailtrapApi({
    to,
    subject: 'Yeni İzin Talebi',
    html: buildLeaveRequestCreatedHtml({ managerName, employeeName, leaveTypeName, startDate, endDate, reason }),
  });
}

async function sendLeaveRequestApprovedEmail({ to, employeeName, leaveTypeName, startDate, endDate }) {
  await sendViaMailtrapApi({
    to,
    subject: 'İzin Talebiniz Onaylandı',
    html: buildLeaveRequestApprovedHtml({ employeeName, leaveTypeName, startDate, endDate }),
  });
}

async function sendLeaveRequestRejectedEmail({ to, employeeName, leaveTypeName, startDate, endDate, reason }) {
  await sendViaMailtrapApi({
    to,
    subject: 'İzin Talebiniz Reddedildi',
    html: buildLeaveRequestRejectedHtml({ employeeName, leaveTypeName, startDate, endDate, reason }),
  });
}

async function sendDelegateAssignedEmail({ to, delegateName, employeeName, leaveTypeName, startDate, endDate }) {
  await sendViaMailtrapApi({
    to,
    subject: 'Vekalet Ataması',
    html: buildDelegateAssignedHtml({ delegateName, employeeName, leaveTypeName, startDate, endDate }),
  });
}

// Izin talebi akislarindaki mail bildirimleri opsiyoneldir: gonderim
// basarisiz olsa dahi ilgili izin islemi (olusturma/onay/red) kesintiye
// ugramamalidir. Hata sadece loglanir, kimlik bilgileri asla yazilmaz.
async function trySend(sendFn, context) {
  try {
    await sendFn();
  } catch (err) {
    console.error(`Mail gonderilemedi (${context}):`, err.message);
  }
}

module.exports = {
  verifyConnection,
  sendPasswordResetEmail,
  sendLeaveRequestCreatedEmail,
  sendLeaveRequestApprovedEmail,
  sendLeaveRequestRejectedEmail,
  sendDelegateAssignedEmail,
  trySend,
};
