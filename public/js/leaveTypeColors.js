const LEAVE_TYPE_COLOR_RULES = [
  { test: (name) => name.includes('yıl') || name.includes('yil'), color: '#4CAF50' },
  { test: (name) => name.includes('hastal'), color: '#2196F3' },
  { test: (name) => name.includes('mazeret'), color: '#FF9800' },
  { test: (name) => name.includes('dogum') || name.includes('doğum'), color: '#9C27B0' },
  { test: (name) => name.includes('ucretsiz') || name.includes('ücretsiz'), color: '#F44336' },
  { test: (name) => name.includes('saatlik'), color: '#00BCD4' },
];
const DEFAULT_LEAVE_TYPE_COLOR = '#8C8C8C';

function getLeaveTypeColor(leaveTypeName) {
  const name = (leaveTypeName || '').toLowerCase();
  const rule = LEAVE_TYPE_COLOR_RULES.find((r) => r.test(name));
  return rule ? rule.color : DEFAULT_LEAVE_TYPE_COLOR;
}
