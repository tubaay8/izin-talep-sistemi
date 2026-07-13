const express = require('express');
const path = require('path');
const homeController = require('../controllers/home.controller');
const { requireAuth, requireGuest } = require('../middlewares/auth.middleware');

const router = express.Router();
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

router.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

router.get('/login', requireGuest, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'auth.html'));
});

router.get('/register', requireGuest, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'auth.html'));
});

router.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html'));
});

router.get('/profile', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'profile.html'));
});

router.get('/leave-requests', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'leave-requests.html'));
});

router.get('/leave-requests/new', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'leave-request-form.html'));
});

router.get('/leave-requests/edit', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'leave-request-form.html'));
});

router.get('/leave-requests/report', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'leave-report.html'));
});

router.get('/manager/leave-requests', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'manager-requests.html'));
});

router.get('/manager/reports', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'manager-report.html'));
});

router.get('/admin/users', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-users.html'));
});

router.get('/admin/users/new', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-user-form.html'));
});

router.get('/admin/users/edit', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-user-form.html'));
});

router.get('/admin/leave-requests', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-leave-requests.html'));
});

router.get('/admin/leave-requests/edit', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-leave-request-form.html'));
});

router.get('/admin/departments', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-departments.html'));
});

router.get('/admin/leave-types', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-leave-types.html'));
});

router.get('/admin/reports', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin-report.html'));
});

router.get('/api/status', homeController.getStatus);

module.exports = router;
