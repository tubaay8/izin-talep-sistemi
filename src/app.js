const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const indexRoutes = require('./routes/index.routes');
const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const leaveTypeRoutes = require('./routes/leaveType.routes');
const leaveRequestRoutes = require('./routes/leaveRequest.routes');
const managerRoutes = require('./routes/manager.routes');
const managerLeaveRequestRoutes = require('./routes/managerLeaveRequest.routes');
const managerStatisticsRoutes = require('./routes/managerStatistics.routes');
const roleRoutes = require('./routes/role.routes');
const adminUserRoutes = require('./routes/adminUser.routes');
const adminLeaveRequestRoutes = require('./routes/adminLeaveRequest.routes');
const adminDepartmentRoutes = require('./routes/adminDepartment.routes');
const adminLeaveTypeRoutes = require('./routes/adminLeaveType.routes');
const statsRoutes = require('./routes/stats.routes');
const profileRoutes = require('./routes/profile.routes');
const { requireAuth, requireRole } = require('./middlewares/auth.middleware');

const app = express();

// Railway gibi platformlarda uygulama HTTPS'i sonlandiran bir proxy'nin
// arkasinda calisir; bu olmadan Express baglantiyi guvensiz sanip
// "secure" cookie'yi hic gondermez, oturumlar kalici olmaz.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// Yuklenen saglik raporlari sadece yetkilendirilmis API route'u uzerinden
// (/api/leave-requests/:id/report) sunulur; dogrudan statik erisim engellenir.
app.use('/uploads', (req, res) => res.status(404).json({ message: 'Bulunamadi' }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/leave-types', requireAuth, leaveTypeRoutes);
app.use('/api/leave-requests', requireAuth, leaveRequestRoutes);
app.use('/api/manager/leave-requests', requireAuth, requireRole('Yonetici'), managerLeaveRequestRoutes);
app.use('/api/manager/statistics', requireAuth, requireRole('Yonetici'), managerStatisticsRoutes);
app.use('/api/admin/users', requireAuth, requireRole('Admin'), adminUserRoutes);
app.use('/api/admin/leave-requests', requireAuth, requireRole('Admin'), adminLeaveRequestRoutes);
app.use('/api/admin/departments', requireAuth, requireRole('Admin'), adminDepartmentRoutes);
app.use('/api/admin/leave-types', requireAuth, requireRole('Admin'), adminLeaveTypeRoutes);
app.use('/api/stats', requireAuth, statsRoutes);
app.use('/api/profile', requireAuth, profileRoutes);
app.use('/', indexRoutes);

module.exports = app;
