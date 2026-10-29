# Controller contract excerpts

Generated 2026-10-28. Exact controller code is included for request field spelling and response branching. These excerpts are reference material, not runnable client code. They call services whose rules are not fully described by this file. No production environment values or credentials are imported.

<a id="get-api-v1"></a>
## GET /api/v1

```javascript
(req, res) => apiResponse.success(res, {
  name: 'VMOVEXA ONE API',
  version: 'v1',
}, 'VMOVEXA ONE API is live')
```

<a id="get-api-v1-activity-logs"></a>
## GET /api/v1/activity-logs

```javascript
async function list(req, res) {
  const { rows, meta } = await service.list(req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-activity-logs-id"></a>
## GET /api/v1/activity-logs/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await service.getById(req.params.id));
}
```

<a id="get-api-v1-activity-logs-categories"></a>
## GET /api/v1/activity-logs/categories

```javascript
async function categories(req, res) {
  return apiResponse.success(res, await service.categories(req));
}
```

<a id="get-api-v1-activity-logs-filters"></a>
## GET /api/v1/activity-logs/filters

```javascript
async function filters(req, res) {
  return apiResponse.success(res, await service.filters(req));
}
```

<a id="post-api-v1-admin-impersonate-userid"></a>
## POST /api/v1/admin/impersonate/:userId

```javascript
async function impersonate(req, res) {
  const targetId = req.params.userId;
  const target = await authService.loadUserForAuth({ id: targetId });
  if (!target) throw new AppError('NOT_FOUND', 'Target user not found.');
  if (target.role && target.role.code === 'ROLE-SUPER-ADMIN') {
    throw new AppError('AUTH_FORBIDDEN', 'Cannot impersonate another Super Admin.');
  }

  const permissions = authService.permissionsOf(target);
  const token = tokenService.signImpersonationToken(target, permissions, req.user.id);

  const session = await db.ImpersonationSession.create({
    impersonator_id: req.user.id,
    target_user_id: target.id,
    started_at: new Date(),
    ip: req.ip,
    reason: req.body.reason || null,
  });

  await ActivityLogger.log({
    logName: 'IMPERSONATION', event: 'custom', severity: 'WARNING',
    description: `SuperAdmin ${req.user.id} started impersonating user ${target.id}`,
    subject: { type: 'User', id: target.id },
    properties: { impersonated_by: req.user.id, session_id: session.id },
  });

  return apiResponse.success(res, {
    impersonationToken: token,
    tokenType: 'Bearer',
    expiresIn: 1800,
    target: { id: target.id, name: target.name, role: target.role ? target.role.code : null, enrollment_no: target.enrollment_no },
    banner: `You are impersonating ${target.name}`,
    sessionId: session.id,
  }, 'Impersonation started.');
}
```

<a id="post-api-v1-admin-impersonate-advertiser-advertiserid"></a>
## POST /api/v1/admin/impersonate/advertiser/:advertiserId

```javascript
async function impersonateAdvertiser(req, res) {
  const advId = req.params.advertiserId;
  const adv = await db.Advertiser.findByPk(advId, {
    include: [{ model: db.User, as: 'user', include: [{ model: db.Role, as: 'role' }] }],
  });
  if (!adv) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const advRole = await db.Role.findOne({ where: { code: 'ROLE-ADVERTISER' } });

  let target = adv.user;
  if (!target && adv.user_id) {
    target = await db.User.findByPk(adv.user_id, {
      include: [{ model: db.Role, as: 'role' }],
    });
  }

  // If user role was accidentally set to another role, enforce ROLE-ADVERTISER
  if (target && target.role && target.role.code !== 'ROLE-ADVERTISER' && target.role.code !== 'ROLE-SUPER-ADMIN') {
    if (advRole) {
      await target.update({ role_id: advRole.id });
      target = await db.User.findByPk(target.id, {
        include: [{ model: db.Role, as: 'role' }],
      });
    }
  }

  // If no user linked, look up by email
  if (!target && adv.email) {
    target = await db.User.findOne({
      where: { email: adv.email },
      include: [{ model: db.Role, as: 'role' }],
    });
    if (target && advRole && (!target.role || target.role.code !== 'ROLE-ADVERTISER')) {
      await target.update({ role_id: advRole.id });
      target = await db.User.findByPk(target.id, {
        include: [{ model: db.Role, as: 'role' }],
      });
    }
  }

  // Fallback: check general test advertiser account
  if (!target) {
    target = await db.User.findOne({
      where: { email: 'advertiser@vmovexa.com' },
      include: [{ model: db.Role, as: 'role' }],
    });
  }

  // Auto-provision advertiser user account if missing
  if (!target && advRole) {
    const { generateEnrollmentNo } = require('../../utils/enrollment');
    const slug = (adv.code || `adv-${adv.id}`).toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = adv.email || `adv.${slug}@vmovexa.com`;
    const passwordHash = await db.User.hashPassword('Adv@12345');
    const enrollmentNo = await generateEnrollmentNo(db.sequelize, 'ROLE-ADVERTISER');

    target = await db.User.create({
      code: `USR-ADV-${adv.id}-${Date.now().toString(36).toUpperCase()}`,
      enrollment_no: enrollmentNo,
      name: adv.contact_name || adv.name || 'Advertiser Admin',
      email,
      phone: adv.phone || null,
      password_hash: passwordHash,
      role_id: advRole.id,
      status: 'active',
    });
  }

  if (target && (!adv.user_id || adv.user_id !== target.id)) {
    await adv.update({ user_id: target.id });
  }

  if (!target) {
    throw new AppError('NOT_FOUND', `No advertiser user account found for "${adv.company_name || adv.name}".`);
  }

  if (target.role && target.role.code === 'ROLE-SUPER-ADMIN') {
    throw new AppError('AUTH_FORBIDDEN', 'Cannot impersonate a Super Admin.');
  }

  const fullTarget = await authService.loadUserForAuth({ id: target.id });
  const permissions = authService.permissionsOf(fullTarget || target);
  const token = tokenService.signImpersonationToken(target, permissions, req.user.id);

  const session = await db.ImpersonationSession.create({
    impersonator_id: req.user.id,
    target_user_id: target.id,
    started_at: new Date(),
    ip: req.ip,
    reason: req.body.reason || `Direct login to advertiser ${adv.company_name || adv.name}`,
  });

  await ActivityLogger.log({
    logName: 'IMPERSONATION',
    event: 'custom',
    severity: 'WARNING',
    description: `SuperAdmin ${req.user.id} started impersonating advertiser ${target.name} (${target.id}) of ${adv.company_name || adv.name}`,
    subject: { type: 'User', id: target.id },
    properties: { impersonated_by: req.user.id, session_id: session.id, advertiser_id: adv.id, advertiser_name: adv.company_name || adv.name },
  });

  return apiResponse.success(res, {
    impersonationToken: token,
    tokenType: 'Bearer',
    expiresIn: 1800,
    target: {
      id: target.id,
      name: target.name,
      email: target.email,
      role: 'ROLE-ADVERTISER',
      enrollment_no: target.enrollment_no,
      advertiser: { id: adv.id, name: adv.name, company_name: adv.company_name },
    },
    banner: `You are impersonating ${target.name} (${adv.company_name || adv.name})`,
    sessionId: session.id,
  }, `Impersonation started for advertiser ${adv.company_name || adv.name}.`);
}
```

<a id="post-api-v1-admin-impersonate-stop"></a>
## POST /api/v1/admin/impersonate/stop

```javascript
async function stop(req, res) {
  // The current token may be an impersonation token; close the latest open session.
  const impersonatorId = req.user.impersonatorId || req.user.id;
  const open = await db.ImpersonationSession.findOne({
    where: { impersonator_id: impersonatorId, ended_at: null },
    order: [['id', 'DESC']],
  });
  if (open) {
    open.ended_at = new Date();
    await open.save();
    await ActivityLogger.log({
      logName: 'IMPERSONATION', event: 'custom', severity: 'WARNING',
      description: `Impersonation session ${open.id} ended`,
      properties: { session_id: open.id },
    });
  }
  return apiResponse.success(res, { ok: true }, 'Impersonation ended. Return to your SuperAdmin session.');
}
```

<a id="post-api-v1-admin-impersonate-tenant-organizationid"></a>
## POST /api/v1/admin/impersonate/tenant/:organizationId

```javascript
async function impersonateTenant(req, res) {
  const orgId = req.params.organizationId;
  const org = await db.Organization.findByPk(orgId);
  if (!org) throw new AppError('NOT_FOUND', 'Tenant organization not found.');

  // Find tenant admin user for this organization
  let target = await db.User.findOne({
    where: { organization_id: org.id },
    include: [{
      model: db.Role,
      as: 'role',
      where: {
        code: {
          [Op.or]: [
            'ROLE-TENANT-ADMIN',
            { [Op.like]: 'TROLE-ADMIN%' },
          ],
        },
      },
      include: [{ model: db.Permission, as: 'permissions' }],
    }],
    order: [['id', 'ASC']],
  });

  // If no explicit tenant admin exists, create or link one so SuperAdmin can always manage this tenant!
  if (!target) {
    const adminRole = await db.Role.findOne({
      where: {
        code: {
          [Op.or]: ['ROLE-TENANT-ADMIN', 'TROLE-ADMIN'],
        },
      },
    });

    if (adminRole) {
      const { generateEnrollmentNo } = require('../../utils/enrollment');
      const slug = (org.slug || org.code || `tenant-${org.id}`).toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `admin.${slug}@vmovexa.com`;
      const passwordHash = await db.User.hashPassword('Admin@12345');
      const enrollmentNo = await generateEnrollmentNo(db.sequelize, 'ROLE-TENANT-ADMIN');

      target = await db.User.findOne({ where: { email } });
      if (!target) {
        target = await db.User.create({
          code: `USR-TADM-${org.id}-${Date.now().toString(36).toUpperCase()}`,
          enrollment_no: enrollmentNo,
          name: `${org.name} Admin`,
          email,
          phone: org.phone || null,
          password_hash: passwordHash,
          role_id: adminRole.id,
          organization_id: org.id,
          status: 'active',
        });
      } else {
        await target.update({ organization_id: org.id, role_id: adminRole.id, status: 'active' });
      }
    }
  }

  // Fallback to any user belonging to this organization if no explicit ROLE-TENANT-ADMIN
  if (!target) {
    target = await db.User.findOne({
      where: { organization_id: org.id },
      include: [{
        model: db.Role,
        as: 'role',
        include: [{ model: db.Permission, as: 'permissions' }],
      }],
      order: [['id', 'ASC']],
    });
  }

  if (!target) {
    throw new AppError('NOT_FOUND', `No admin or user account found for tenant "${org.name}".`);
  }

  if (target.role && target.role.code === 'ROLE-SUPER-ADMIN') {
    throw new AppError('AUTH_FORBIDDEN', 'Cannot impersonate a Super Admin.');
  }

  const fullTarget = await authService.loadUserForAuth({ id: target.id });
  const permissions = authService.permissionsOf(fullTarget || target);
  const token = tokenService.signImpersonationToken(target, permissions, req.user.id);

  const session = await db.ImpersonationSession.create({
    impersonator_id: req.user.id,
    target_user_id: target.id,
    started_at: new Date(),
    ip: req.ip,
    reason: req.body.reason || `Direct login to tenant ${org.name} (${org.code || org.id})`,
  });

  await ActivityLogger.log({
    logName: 'IMPERSONATION',
    event: 'custom',
    severity: 'WARNING',
    description: `SuperAdmin ${req.user.id} started impersonating tenant admin ${target.name} (${target.id}) of ${org.name}`,
    subject: { type: 'User', id: target.id },
    organizationId: org.id,
    properties: { impersonated_by: req.user.id, session_id: session.id, organization_id: org.id, organization_name: org.name },
  });

  return apiResponse.success(res, {
    impersonationToken: token,
    tokenType: 'Bearer',
    expiresIn: 1800,
    target: {
      id: target.id,
      name: target.name,
      email: target.email,
      role: target.role ? target.role.code : 'ROLE-TENANT-ADMIN',
      enrollment_no: target.enrollment_no,
      organization: { id: org.id, name: org.name, code: org.code, status: org.status },
    },
    banner: `You are impersonating ${target.name} (${org.name})`,
    sessionId: session.id,
  }, `Impersonation started for tenant ${org.name}.`);
}
```

<a id="get-api-v1-advertisers"></a>
## GET /api/v1/advertisers

```javascript
async function listAdvertisers(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status && req.query.status !== 'All') {
    let s = req.query.status.toLowerCase();
    if (s === 'deactivated' || s === 'inactive') s = 'suspended';
    where.status = s;
  }
  if (req.query.search) {
    const s = `%${req.query.search}%`;
    where[Op.or] = [
      { name: { [Op.like]: s } },
      { company_name: { [Op.like]: s } },
      { contact_name: { [Op.like]: s } },
      { email: { [Op.like]: s } },
      { code: { [Op.like]: s } },
      { phone: { [Op.like]: s } },
    ];
  }
  const include = [
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }] : []),
    ...(db.Campaign ? [{ model: db.Campaign, as: 'campaigns', attributes: ['id', 'title', 'status', 'budget'] }] : []),
  ];
  const [result, totalAll, totalActive, totalSuspended, totalVerified] = await Promise.all([
    db.Advertiser.findAndCountAll({
      where,
      include,
      order: [['id', 'DESC']],
      limit,
      offset,
    }),
    db.Advertiser.count(),
    db.Advertiser.count({ where: { status: 'active' } }),
    db.Advertiser.count({ where: { status: 'suspended' } }),
    db.Advertiser.count({ where: { verified: true } }),
  ]);
  const { rows, count } = result;
  rows.forEach((adv) => {
    adv.setDataValue('avatar_url', adv.user?.avatar_url || null);
    adv.setDataValue('logo_url', adv.user?.avatar_url || null);
  });
  const meta = buildMeta(page, limit, count);
  meta.stats = {
    total: totalAll,
    active: totalActive,
    suspended: totalSuspended,
    verified: totalVerified,
  };
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-advertisers"></a>
## POST /api/v1/advertisers

```javascript
async function createAdvertiser(req, res) {
  const data = req.body || {};
  const contactName = (data.name || data.contact_name || '').trim();
  if (!contactName) throw new AppError('VALIDATION_FAILED', 'Contact person name is required.');

  // Commercial advertisers operate directly under SuperAdmin, so Company Name is optional
  const companyName = (data.companyName || data.company_name || '').trim() || null;
  const advertiserDisplayName = companyName || contactName;

  const email = (data.email || '').toLowerCase().trim();
  const phone = data.phone ? String(data.phone).trim() : null;
  const plainPassword = data.password || 'Adv@12345';

  if (!email) throw new AppError('VALIDATION_FAILED', 'Email address is required for advertiser account.');
  if (!phone) throw new AppError('VALIDATION_FAILED', 'Mobile phone number is required for advertiser account.');

  const result = await db.sequelize.transaction(async (t) => {
    // 1. Strictly enforce email and mobile uniqueness across the platform
    await assertUniqueCredentials({ email, phone, transaction: t });

    let role = await db.Role.findOne({ where: { code: 'ROLE-ADVERTISER' }, transaction: t });
    const avatarToSet = data.avatar_url || data.logo_url || data.avatarUrl || data.logoUrl || null;
    const passwordHash = await db.User.hashPassword(plainPassword);
    const enrollmentNo = await generateEnrollmentNo(db.sequelize, 'ROLE-ADVERTISER', t);

    const user = await db.User.create({
      code: newUserCode(),
      name: contactName,
      email,
      phone,
      password_hash: passwordHash,
      role_id: role ? role.id : null,
      department: data.designation || null,
      avatar_url: avatarToSet,
      status: 'active',
      enrollment_no: enrollmentNo,
    }, { transaction: t });

    // 2. Create Advertiser with Location & Designation Fields
    const advCode = `ADV-${Date.now().toString(36).toUpperCase()}`;
    const advertiser = await db.Advertiser.create({
      code: advCode,
      name: advertiserDisplayName,
      company_name: companyName,
      business_type: data.category || data.brand_vertical || data.business_type || data.businessType || 'Commercial Brand',
      contact_name: contactName,
      designation: data.designation || null,
      email: email || user.email,
      phone: phone || user.phone,
      gstin: data.gstin || data.gst_number || null,
      pan: data.pan || data.pan_number || null,
      address: data.address || data.billing_address || data.billingAddress || null,
      city: data.city || null,
      state: data.state || null,
      pincode: data.pincode || null,
      country: data.country || 'India',
      place_id: data.place_id || data.placeId || null,
      latitude: data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null,
      longitude: data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null,
      website: data.website || null,
      billing_email: data.billingEmail || data.billing_email || email || user.email,
      payment_terms: data.paymentTerms || data.payment_terms || 'Prepaid Wallet',
      wallet_balance: Number(data.initialWallet || data.wallet_balance || 0),
      verified: true,
      account_status: 'approved',
      status: data.status || 'active',
      user_id: user.id,
    }, { transaction: t });

    // 3. Assign Direct Advertiser Permissions in user_permissions
    if (db.UserPermission && db.Permission) {
      const ADVERTISER_PERMS = [
        'dashboard.view',
        'advertiser.dashboard.view',
        'campaigns.view', 'campaigns.create', 'campaigns.update', 'campaigns.delete', 'campaigns.submit', 'campaigns.pay',
        'campaigns.analytics.view',
        'finance.invoices.view', 'finance.payments.view',
        'billing.invoices.view', 'billing.subscriptions.view', 'billing.transactions.view',
        'reports.view', 'reports.export', 'reports.generate',
        'support.view', 'support.manage',
        'activity.view',
        'uploads.manage',
      ];
      const permissions = await db.Permission.findAll({
        where: { key: { [Op.in]: ADVERTISER_PERMS } },
        transaction: t,
      });
      if (permissions && permissions.length > 0) {
        await db.UserPermission.destroy({ where: { user_id: user.id }, transaction: t });
        for (const p of permissions) {
          await db.UserPermission.create({ user_id: user.id, permission_id: p.id }, { transaction: t });
        }
      }
    }

    // 4. Attach documents
    if (db.MediaAsset && Array.isArray(data.documents) && data.documents.length > 0) {
      for (const doc of data.documents) {
        await db.MediaAsset.create({
          owner_type: 'advertiser',
          owner_id: advertiser.id,
          purpose: doc.purpose || 'Identity / Business Proof',
          storage_key: doc.key || null,
          url: doc.url,
          mime: doc.fileType || doc.mime || null,
          size: doc.fileSize || doc.size || null,
          status: 'available',
          uploaded_by: req.user?.id || null,
        }, { transaction: t });
      }
    }

    advertiser.setDataValue('avatar_url', avatarToSet);
    advertiser.setDataValue('logo_url', avatarToSet);
    if (user) advertiser.setDataValue('user', user);

    return { advertiser, user, role, avatarToSet };
  });

  const { advertiser, user, role } = result;

  // 5. Asynchronous Background Notification Dispatch (Queued in NotificationLog, processed via Cron/Worker)
  if (user) {
    const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
    const loginUrl = `${appUrl}/login`;
    const superAdminEmail = req.user?.email || 'root@vmovexa.com';
    const superAdminId = req.user?.id || null;

    try {
      const notificationLogService = require('../../services/notificationLog.service');

      // A. Queue In-App notification for the new Advertiser
      await notificationLogService.enqueueNotification({
        userId: user.id,
        recipient: user.email || user.phone || 'Advertiser',
        channel: 'in_app',
        eventKey: 'user_welcome_credentials',
        title: 'Welcome to VMOVEXA! Advertiser Account Ready',
        body: `Welcome ${user.name}! Your Commercial Advertiser account has been provisioned. Enrollment ID: ${user.enrollment_no}. You can now create and launch transit display ad campaigns.`,
        metadata: {
          severity: 'info',
          data: { enrollmentNo: user.enrollment_no, email: user.email, advertiserId: advertiser.id },
        },
      });

      // B. Queue SMS with login credentials if phone number provided (DB template + fallback)
      if (user.phone) {
        const smsSvc = require('../../services/sms.service');
        const tplSms = smsSvc.renderTemplateByCode
          ? await smsSvc.renderTemplateByCode('user_welcome_credentials', {
              user_name: user.name,
              role_name: role?.name || 'Advertiser',
              user_email: user.email,
              temporary_password: plainPassword,
            })
          : null;
        await notificationLogService.enqueueNotification({
          userId: user.id,
          recipient: user.phone,
          channel: 'sms',
          eventKey: 'user_welcome_credentials',
          title: 'Advertiser Account Credentials SMS',
          body: tplSms || `[VMOVEXA] Welcome ${user.name}! Your Advertiser account is ready. Enrollment: ${user.enrollment_no}, Login: ${user.email}, Pass: ${plainPassword}. Login: ${loginUrl}`,
        });
      }

      // C. Send Branded HTML Email with login credentials & SuperAdmin notification
      if (user.email) {
        const emailService = require('../../services/email.service');
        await emailService.sendUserProvisioningEmails({
          user,
          role: role || { name: 'Commercial Advertiser', code: 'ROLE-ADVERTISER' },
          password: plainPassword,
          superAdminEmail,
        }).catch((emailErr) => {
          logger.notification?.warn(`Direct email dispatch warning for advertiser ${user.email}: ${emailErr.message}`);
        });
      }

      // D. Queue In-App & WebSocket Notification to SuperAdmin
      if (superAdminId) {
        await notificationLogService.enqueueNotification({
          userId: superAdminId,
          recipient: superAdminEmail,
          channel: 'in_app',
          eventKey: 'user_provisioned_superadmin',
          title: 'New Commercial Advertiser Onboarded',
          body: `Commercial Advertiser "${advertiser.name}" (${advertiser.code}) was onboarded successfully. Credentials dispatched via Email & SMS.`,
          metadata: {
            severity: 'info',
            data: { advertiserId: advertiser.id, code: advertiser.code, userId: user.id },
          },
        });
      }

      // Trigger background worker tick immediately
      setImmediate(() => {
        notificationLogService.processPendingNotifications().catch((err) => {
          logger.notification?.warn(`Background notification queue error: ${err.message}`);
        });
      });
    } catch (notifErr) {
      console.warn(`Advertiser onboarding notification queuing warning: ${notifErr.message}`);
    }
  }

  return apiResponse.created(res, advertiser, 'Commercial advertiser onboarded successfully.');
}
```

<a id="delete-api-v1-advertisers-id"></a>
## DELETE /api/v1/advertisers/:id

```javascript
async function deleteAdvertiser(req, res) {
  const advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  // Delete attached media assets
  if (db.MediaAsset) {
    await db.MediaAsset.destroy({
      where: { owner_type: 'advertiser', owner_id: advertiser.id },
      force: true,
    }).catch(() => {});
  }

  // Delete linked user completely from user table
  if (advertiser.user_id && db.User) {
    const user = await db.User.findByPk(advertiser.user_id);
    if (user) {
      try {
        await emailService.sendAccountDeletedEmail({ user });
      } catch (_) {}
      const tokenService = require('../auth/token.service');
      await tokenService.revokeAllForUser(user.id).catch(() => {});
      await user.destroy({ force: true }).catch(() => user.destroy());
    }
  }

  await advertiser.destroy({ force: true }).catch(() => advertiser.destroy());
  return apiResponse.success(res, { ok: true }, 'Commercial advertiser deleted successfully.');
}
```

<a id="get-api-v1-advertisers-id"></a>
## GET /api/v1/advertisers/:id

```javascript
async function getAdvertiser(req, res) {
  const include = [
    { model: db.Campaign, as: 'campaigns' },
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'department', 'created_at'] }] : []),
  ];
  let a = null;
  const advId = req.params.id;
  if (!isNaN(Number(advId))) {
    a = await db.Advertiser.findByPk(Number(advId), { include });
    if (!a) {
      a = await db.Advertiser.findOne({ where: { user_id: Number(advId) }, include });
    }
  } else {
    a = await db.Advertiser.findOne({
      where: { [Op.or]: [{ code: advId }, { email: advId }] },
      include,
    });
  }
  if (!a) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  if (db.MediaAsset) {
    const docs = await db.MediaAsset.findAll({
      where: {
        owner_type: 'advertiser',
        owner_id: a.id,
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    a.setDataValue('documents', docs);
  }
  a.setDataValue('brand_vertical', a.business_type);
  a.setDataValue('gst_number', a.gstin);
  a.setDataValue('pan_number', a.pan);
  a.setDataValue('billing_address', a.address);
  a.setDataValue('logo_url', a.user?.avatar_url || null);
  a.setDataValue('avatar_url', a.user?.avatar_url || null);
  return apiResponse.success(res, a);
}
```

<a id="patch-api-v1-advertisers-id"></a>
## PATCH /api/v1/advertisers/:id

```javascript
async function updateAdvertiser(req, res) {
  const advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const data = req.body || {};
  const patch = {};
  ['name', 'company_name', 'business_type', 'contact_name', 'designation', 'email', 'phone', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'country', 'place_id', 'website', 'billing_email', 'payment_terms', 'status', 'account_status'].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });
  if (data.companyName !== undefined) patch.company_name = data.companyName ? data.companyName.trim() : null;
  // Frontend sends `name` as the authorized officer name (maps to contact_name)
  if (data.name !== undefined) patch.contact_name = data.name;
  const newDisplayName = (patch.company_name !== undefined ? patch.company_name : advertiser.company_name)
    || (patch.contact_name !== undefined ? patch.contact_name : advertiser.contact_name)
    || advertiser.name;
  if (newDisplayName) patch.name = newDisplayName;
  if (data.category !== undefined || data.brand_vertical !== undefined) patch.business_type = data.category || data.brand_vertical;
  if (data.gst_number !== undefined) patch.gstin = data.gst_number;
  if (data.pan_number !== undefined) patch.pan = data.pan_number;
  if (data.billing_address !== undefined || data.billingAddress !== undefined) patch.address = data.billing_address || data.billingAddress;
  if (data.billingEmail !== undefined) patch.billing_email = data.billingEmail;
  if (data.paymentTerms !== undefined) patch.payment_terms = data.paymentTerms;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  if (data.latitude !== undefined) patch.latitude = data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null;
  if (data.longitude !== undefined) patch.longitude = data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null;
  if (data.walletBalance !== undefined || data.wallet_balance !== undefined) {
    patch.wallet_balance = Number(data.walletBalance ?? data.wallet_balance);
  }

  if (Object.keys(patch).length > 0) {
    await advertiser.update(patch);
  }

  // Update linked user if needed
  let newAvatar = data.avatar_url ?? data.logo_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (advertiser.user_id && db.User) {
    linkedUser = await db.User.findByPk(advertiser.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newAvatar !== undefined) userPatch.avatar_url = newAvatar || null;
      if (data.name) userPatch.name = data.name;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (data.designation !== undefined) userPatch.department = data.designation || null;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'user_updated',
          title: 'Account Details Updated',
          body: 'Your advertiser profile details have been updated by Super Admin.',
          severity: 'info',
        });
        await emailService.sendProfileUpdatedEmail({ user: linkedUser });
      } catch (_) {}
    }
  }

  // Handle new documents
  const newDocs = data.newDocuments || (Array.isArray(data.documents) ? data.documents.filter((d) => !d.id) : []);
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      await db.MediaAsset.create({
        owner_type: 'advertiser',
        owner_id: advertiser.id,
        purpose: doc.purpose || 'Business Document',
        storage_key: doc.key || null,
        url: doc.url,
        mime: doc.fileType || doc.mime || null,
        size: doc.fileSize || doc.size || null,
        status: 'available',
        uploaded_by: req.user?.id || null,
      });
    }
  }

  // Handle removed documents
  if (db.MediaAsset && Array.isArray(data.removedDocumentIds) && data.removedDocumentIds.length > 0) {
    await db.MediaAsset.destroy({
      where: {
        id: { [Op.in]: data.removedDocumentIds },
        owner_type: 'advertiser',
        owner_id: advertiser.id,
      },
    });
  }

  const currentAvatar = newAvatar || advertiser.user?.avatar_url || null;
  advertiser.setDataValue('avatar_url', currentAvatar);
  advertiser.setDataValue('logo_url', currentAvatar);
  return apiResponse.success(res, advertiser, 'Commercial advertiser updated successfully.');
}
```

<a id="put-api-v1-advertisers-id"></a>
## PUT /api/v1/advertisers/:id

```javascript
async function updateAdvertiser(req, res) {
  const advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const data = req.body || {};
  const patch = {};
  ['name', 'company_name', 'business_type', 'contact_name', 'designation', 'email', 'phone', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'country', 'place_id', 'website', 'billing_email', 'payment_terms', 'status', 'account_status'].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });
  if (data.companyName !== undefined) patch.company_name = data.companyName ? data.companyName.trim() : null;
  // Frontend sends `name` as the authorized officer name (maps to contact_name)
  if (data.name !== undefined) patch.contact_name = data.name;
  const newDisplayName = (patch.company_name !== undefined ? patch.company_name : advertiser.company_name)
    || (patch.contact_name !== undefined ? patch.contact_name : advertiser.contact_name)
    || advertiser.name;
  if (newDisplayName) patch.name = newDisplayName;
  if (data.category !== undefined || data.brand_vertical !== undefined) patch.business_type = data.category || data.brand_vertical;
  if (data.gst_number !== undefined) patch.gstin = data.gst_number;
  if (data.pan_number !== undefined) patch.pan = data.pan_number;
  if (data.billing_address !== undefined || data.billingAddress !== undefined) patch.address = data.billing_address || data.billingAddress;
  if (data.billingEmail !== undefined) patch.billing_email = data.billingEmail;
  if (data.paymentTerms !== undefined) patch.payment_terms = data.paymentTerms;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  if (data.latitude !== undefined) patch.latitude = data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null;
  if (data.longitude !== undefined) patch.longitude = data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null;
  if (data.walletBalance !== undefined || data.wallet_balance !== undefined) {
    patch.wallet_balance = Number(data.walletBalance ?? data.wallet_balance);
  }

  if (Object.keys(patch).length > 0) {
    await advertiser.update(patch);
  }

  // Update linked user if needed
  let newAvatar = data.avatar_url ?? data.logo_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (advertiser.user_id && db.User) {
    linkedUser = await db.User.findByPk(advertiser.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newAvatar !== undefined) userPatch.avatar_url = newAvatar || null;
      if (data.name) userPatch.name = data.name;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (data.designation !== undefined) userPatch.department = data.designation || null;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'user_updated',
          title: 'Account Details Updated',
          body: 'Your advertiser profile details have been updated by Super Admin.',
          severity: 'info',
        });
        await emailService.sendProfileUpdatedEmail({ user: linkedUser });
      } catch (_) {}
    }
  }

  // Handle new documents
  const newDocs = data.newDocuments || (Array.isArray(data.documents) ? data.documents.filter((d) => !d.id) : []);
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      await db.MediaAsset.create({
        owner_type: 'advertiser',
        owner_id: advertiser.id,
        purpose: doc.purpose || 'Business Document',
        storage_key: doc.key || null,
        url: doc.url,
        mime: doc.fileType || doc.mime || null,
        size: doc.fileSize || doc.size || null,
        status: 'available',
        uploaded_by: req.user?.id || null,
      });
    }
  }

  // Handle removed documents
  if (db.MediaAsset && Array.isArray(data.removedDocumentIds) && data.removedDocumentIds.length > 0) {
    await db.MediaAsset.destroy({
      where: {
        id: { [Op.in]: data.removedDocumentIds },
        owner_type: 'advertiser',
        owner_id: advertiser.id,
      },
    });
  }

  const currentAvatar = newAvatar || advertiser.user?.avatar_url || null;
  advertiser.setDataValue('avatar_url', currentAvatar);
  advertiser.setDataValue('logo_url', currentAvatar);
  return apiResponse.success(res, advertiser, 'Commercial advertiser updated successfully.');
}
```

<a id="patch-api-v1-advertisers-id-status"></a>
## PATCH /api/v1/advertisers/:id/status

```javascript
async function setAdvertiserStatus(req, res) {
  let advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) {
    // Fallback: look up by user_id if frontend passed user id
    advertiser = await db.Advertiser.findOne({ where: { user_id: req.params.id } });
  }
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const rawStatus = req.body.status;
  if (!rawStatus) throw new AppError('VALIDATION_FAILED', 'Status is required.');

  // Normalize status for database ENUM ('pending_approval', 'approved', 'active', 'rejected', 'suspended')
  const isDeactivating = rawStatus === 'suspended' || rawStatus === 'deactivated' || rawStatus === 'inactive';
  const targetAdvStatus = isDeactivating ? 'suspended' : 'active';
  const targetUserStatus = isDeactivating ? 'suspended' : 'active';

  await advertiser.update({ status: targetAdvStatus });
  if (advertiser.user_id && db.User) {
    const user = await db.User.findByPk(advertiser.user_id);
    if (user) {
      await user.update({ status: targetUserStatus });
      if (isDeactivating) {
        const tokenService = require('../auth/token.service');
        await tokenService.revokeAllForUser(user.id).catch(() => {});
      }

      // 3-Channel Notification Dispatch for Status Toggle
      try {
        const statusTitle = isDeactivating ? 'Account Deactivated' : 'Account Activated';
        const statusBody = isDeactivating 
          ? 'Your advertiser account has been deactivated by Super Admin.' 
          : 'Your advertiser account has been activated and restored by Super Admin.';

        await notificationService.send({
          userId: user.id,
          eventKey: 'user_status_changed',
          title: statusTitle,
          body: statusBody,
          severity: isDeactivating ? 'critical' : 'info',
          bypassQuietHours: isDeactivating,
        });

        await emailService.sendAccountStatusEmail({ user, status: isDeactivating ? 'deactivated' : 'active' });
      } catch (_) {}
    }
  }

  // Reload to return fresh user association data
  if (db.User) {
    await advertiser.reload({
      include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }],
    });
  }

  return apiResponse.success(res, advertiser, `Advertiser account ${isDeactivating ? 'deactivated' : 'activated'} successfully.`);
}
```

<a id="get-api-v1-approvals"></a>
## GET /api/v1/approvals

```javascript
async function list(req, res) {
  const opts = {
    entityType: req.query.entityType,
    state: req.query.state,
    page: req.query.page,
    limit: req.query.limit,
  };
  if (!req.isPlatformScope) opts.organizationId = req.tenantId;
  const result = await service.list(opts);
  return apiResponse.paginated(res, result.items, result.meta);
}
```

<a id="get-api-v1-approvals-id"></a>
## GET /api/v1/approvals/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await service.getById(req.params.id));
}
```

<a id="post-api-v1-approvals-id-approve"></a>
## POST /api/v1/approvals/:id/approve

```javascript
async function approve(req, res) {
  return apiResponse.success(res, await service.decide(req.params.id, 'approved', req.body.reason, req.user.id), 'Approved.');
}
```

<a id="post-api-v1-approvals-id-reject"></a>
## POST /api/v1/approvals/:id/reject

```javascript
async function reject(req, res) {
  return apiResponse.success(res, await service.decide(req.params.id, 'rejected', req.body.reason, req.user.id), 'Rejected.');
}
```

<a id="post-api-v1-auth-accept-invite"></a>
## POST /api/v1/auth/accept-invite

```javascript
async function acceptInvite(req, res) {
  const result = await invitationService.acceptInvite({ token: req.body.token, password: req.body.password }, ctxFrom(req));
  return apiResponse.success(res, result, 'Invitation accepted. You can now log in.');
}
```

<a id="post-api-v1-auth-change-password"></a>
## POST /api/v1/auth/change-password

```javascript
async function changePassword(req, res) {
  const r = await authService.changePassword({
    userId: req.user.id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  }, ctxFrom(req));
  return apiResponse.success(res, r, 'Password changed successfully.');
}
```

<a id="post-api-v1-auth-complete-organization-profile"></a>
## POST /api/v1/auth/complete-organization-profile

```javascript
async function completeOrganizationProfile(req, res) {
  const result = await authService.completeOrganizationProfile({
    userId: req.user.id,
    organizationName: req.body.organizationName,
    phone: req.body.phone,
    city: req.body.city,
    state: req.body.state,
    address: req.body.address || req.body.office_address,
    pincode: req.body.pincode,
    latitude: req.body.latitude || req.body.lat,
    longitude: req.body.longitude || req.body.lng,
    cin: req.body.cin,
    gstin: req.body.gstin,
  });
  return apiResponse.success(res, result, 'Organization profile completed successfully.');
}
```

<a id="post-api-v1-auth-forgot-password"></a>
## POST /api/v1/auth/forgot-password

```javascript
async function forgotPassword(req, res) {
  const r = await authService.forgotPassword({ email: req.body.email });
  return apiResponse.success(res, r, 'Password reset OTP code sent to your registered email.');
}
```

<a id="post-api-v1-auth-login-email"></a>
## POST /api/v1/auth/login-email

```javascript
async function loginEmail(req, res) {
  const result = await authService.login({ email: req.body.email, password: req.body.password }, ctxFrom(req));
  if (result.mfaRequired) {
    return apiResponse.success(res, { mfaRequired: true, identifier: result.identifier, devCode: result.devCode }, 'MFA verification required.');
  }
  return apiResponse.success(res, result, 'Login successful.');
}
```

<a id="post-api-v1-auth-login-phone"></a>
## POST /api/v1/auth/login-phone

```javascript
async function loginPhone(req, res) {
  const result = await authService.login({ phone: req.body.phone, password: req.body.password }, ctxFrom(req));
  if (result.mfaRequired) {
    return apiResponse.success(res, { mfaRequired: true, identifier: result.identifier, devCode: result.devCode }, 'MFA verification required.');
  }
  return apiResponse.success(res, result, 'Login successful.');
}
```

<a id="post-api-v1-auth-logout"></a>
## POST /api/v1/auth/logout

```javascript
async function logout(req, res) {
  if (req.body.refreshToken) await tokenService.revokeRefreshToken(req.body.refreshToken);
  return apiResponse.success(res, { ok: true }, 'Logged out.');
}
```

<a id="get-api-v1-auth-me"></a>
## GET /api/v1/auth/me

```javascript
async function me(req, res) {
  const user = await db.User.findByPk(req.user.id, {
    include: [
      { model: db.Role, as: 'role', include: [{ model: db.Permission, as: 'permissions' }] },
      ...(db.User.associations && db.User.associations.directPermissions ? [{ model: db.Permission, as: 'directPermissions' }] : []),
      {
        model: db.Driver,
        as: 'driver',
        include: [{ model: db.Depot, as: 'depot' }],
      },
      {
        model: db.Organization,
        as: 'organization',
        include: [{ model: db.Subscription, as: 'subscription', include: [{ model: db.SubscriptionPlan, as: 'plan' }] }],
      },
      ...(db.FleetOperatorProfile ? [{
        model: db.FleetOperatorProfile,
        as: 'fleetOperatorProfile',
        include: db.Depot ? [{ model: db.Depot, as: 'depot' }] : [],
      }] : []),
      ...(db.Advertiser ? [{ model: db.Advertiser, as: 'advertiser' }] : []),
      ...(db.GovernmentAgency ? [{ model: db.GovernmentAgency, as: 'governmentAgency' }] : []),
      { model: db.UserSetting, as: 'settings' },
      { model: db.Language, as: 'language' },
    ],
  });
  if (!user) throw new AppError('NOT_FOUND', 'User not found.');

  // If user account is suspended
  if (user.status === 'suspended') {
    throw new AppError('AUTH_FORBIDDEN', 'Your account has been suspended.');
  }

  // If organization account is suspended/frozen (unless superadmin impersonating)
  const isImpersonating = !!(req.user && req.user.impersonatorId);
  if (!isImpersonating && user.organization && user.organization.status === 'suspended') {
    throw new AppError('AUTH_FORBIDDEN', 'Your organization account has been suspended/frozen.');
  }

  const json = user.toJSON();
  json.permissions = authService.permissionsOf(user);
  if (req.user && req.user.impersonatorId) {
    json.impersonatorId = req.user.impersonatorId;
  }
  return apiResponse.success(res, json, 'OK');
}
```

<a id="patch-api-v1-auth-me"></a>
## PATCH /api/v1/auth/me

```javascript
async function updateMe(req, res) {
  const updated = await authService.updateMe({ userId: req.user.id, patch: req.body });
  return apiResponse.success(res, updated, 'Profile updated.');
}
```

<a id="put-api-v1-auth-me"></a>
## PUT /api/v1/auth/me

```javascript
async function updateMe(req, res) {
  const updated = await authService.updateMe({ userId: req.user.id, patch: req.body });
  return apiResponse.success(res, updated, 'Profile updated.');
}
```

<a id="post-api-v1-auth-refresh"></a>
## POST /api/v1/auth/refresh

```javascript
async function refresh(req, res) {
  const { tokens } = await tokenService.rotateRefreshToken(req.body.refreshToken, ctxFrom(req));
  return apiResponse.success(res, { tokens }, 'Token refreshed.');
}
```

<a id="post-api-v1-auth-register"></a>
## POST /api/v1/auth/register

```javascript
async function register(req, res) {
  const result = await registrationService.register(req.body);
  return apiResponse.created(res, result, result.message);
}
```

<a id="post-api-v1-auth-request-signup-otp"></a>
## POST /api/v1/auth/request-signup-otp

```javascript
async function requestRegistrationOtp(req, res) {
  const result = await authService.requestRegistrationOtp({ name: req.body.name, email: req.body.email });
  return apiResponse.success(res, result, 'Verification OTP sent to your email address.');
}
```

<a id="post-api-v1-auth-reset-password"></a>
## POST /api/v1/auth/reset-password

```javascript
async function resetPassword(req, res) {
  const r = await authService.resetPassword({ email: req.body.email, code: req.body.code, newPassword: req.body.newPassword });
  return apiResponse.success(res, r, 'Password changed successfully! Please log in.');
}
```

<a id="post-api-v1-auth-resubmit-registration"></a>
## POST /api/v1/auth/resubmit-registration

```javascript
async function resubmitRegistration(req, res) {
  const result = await registrationService.resubmit(req.body);
  return apiResponse.success(res, result, result.message);
}
```

<a id="get-api-v1-auth-social"></a>
## GET /api/v1/auth/social

```javascript
async (req, res) => {
  return apiResponse.success(res, await service.listLinked(req.user.id));
}
```

<a id="delete-api-v1-auth-social-provider-unlink"></a>
## DELETE /api/v1/auth/social/:provider/unlink

```javascript
async (req, res) => {
  return apiResponse.success(res, await service.unlink(req.user.id, req.params.provider), 'Provider unlinked.');
}
```

<a id="post-api-v1-auth-social-apple"></a>
## POST /api/v1/auth/social/apple

```javascript
async (req, res) => {
  const { code, idToken, user, redirectUri, mode } = req.body;
  const result = await service.loginOrRegisterWithApple({ code, idToken, user, redirectUri, mode }, {
    ip: req.ip,
    clientType: (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web',
    deviceInfo: req.headers['user-agent'] || null,
  });
  return apiResponse.success(res, result, 'Apple authentication successful.');
}
```

<a id="get-api-v1-auth-social-apple-callback"></a>
## GET /api/v1/auth/social/apple/callback

```javascript
(req, res) => {
  const { code, id_token, state, error } = req.query;
  const frontendOrigin = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
  if (error) {
    return res.redirect(`${frontendOrigin}/auth/apple/callback?error=${encodeURIComponent(error)}`);
  }
  return res.redirect(`${frontendOrigin}/auth/apple/callback?code=${encodeURIComponent(code || '')}&id_token=${encodeURIComponent(id_token || '')}&state=${encodeURIComponent(state || '')}`);
}
```

<a id="post-api-v1-auth-social-apple-callback"></a>
## POST /api/v1/auth/social/apple/callback

```javascript
(req, res) => {
  const { code, id_token, state, error, user } = req.body;
  const frontendOrigin = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
  if (error) {
    return res.redirect(`${frontendOrigin}/auth/apple/callback?error=${encodeURIComponent(error)}`);
  }
  const params = new URLSearchParams({
    code: code || '',
    id_token: id_token || '',
    state: state || '',
  });
  if (user) {
    params.set('user', typeof user === 'string' ? user : JSON.stringify(user));
  }
  return res.redirect(`${frontendOrigin}/auth/apple/callback?${params.toString()}`);
}
```

<a id="get-api-v1-auth-social-apple-url"></a>
## GET /api/v1/auth/social/apple/url

```javascript
async (req, res) => {
  const redirectUri = req.query.redirectUri || null;
  const result = await service.getAppleAuthUrl(redirectUri);
  return apiResponse.success(res, result, 'Apple auth URL generated.');
}
```

<a id="post-api-v1-auth-social-firebase-apple"></a>
## POST /api/v1/auth/social/firebase/apple

```javascript
async (req, res) => {
  const result = await service.loginWithFirebaseApple({ idToken: req.body.idToken }, {
    ip: req.ip,
    clientType: (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web',
    deviceInfo: req.headers['user-agent'] || null,
  });
  return apiResponse.success(res, result, 'Apple login successful.');
}
```

<a id="post-api-v1-auth-social-firebase-apple-register"></a>
## POST /api/v1/auth/social/firebase/apple/register

```javascript
async (req, res) => {
  const result = await service.registerWithFirebaseApple(req.body, {
    ip: req.ip,
    clientType: (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web',
    deviceInfo: req.headers['user-agent'] || null,
  });
  return apiResponse.created(res, result, 'Tenant registration application submitted.');
}
```

<a id="post-api-v1-auth-social-firebase-google"></a>
## POST /api/v1/auth/social/firebase/google

```javascript
async (req, res) => {
  const result = await service.loginWithFirebaseGoogle({ idToken: req.body.idToken }, {
    ip: req.ip,
    clientType: (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web',
    deviceInfo: req.headers['user-agent'] || null,
  });
  return apiResponse.success(res, result, 'Google login successful.');
}
```

<a id="post-api-v1-auth-social-firebase-google-register"></a>
## POST /api/v1/auth/social/firebase/google/register

```javascript
async (req, res) => {
  const result = await service.registerWithFirebaseGoogle(req.body, {
    ip: req.ip,
    clientType: (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web',
    deviceInfo: req.headers['user-agent'] || null,
  });
  return apiResponse.created(res, result, 'Tenant registration application submitted.');
}
```

<a id="post-api-v1-auth-social-zoho"></a>
## POST /api/v1/auth/social/zoho

```javascript
async (req, res) => {
  const { code, redirectUri, mode } = req.body;
  const result = await service.loginOrRegisterWithZoho({ code, redirectUri, mode }, {
    ip: req.ip,
    clientType: (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web',
    deviceInfo: req.headers['user-agent'] || null,
  });
  return apiResponse.success(res, result, 'Zoho authentication successful.');
}
```

<a id="get-api-v1-auth-social-zoho-callback"></a>
## GET /api/v1/auth/social/zoho/callback

```javascript
(req, res) => {
  const { code, state, error } = req.query;
  const frontendOrigin = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
  if (error) {
    return res.redirect(`${frontendOrigin}/auth/zoho/callback?error=${encodeURIComponent(error)}`);
  }
  return res.redirect(`${frontendOrigin}/auth/zoho/callback?code=${encodeURIComponent(code || '')}&state=${encodeURIComponent(state || '')}`);
}
```

<a id="get-api-v1-auth-social-zoho-url"></a>
## GET /api/v1/auth/social/zoho/url

```javascript
async (req, res) => {
  const redirectUri = req.query.redirectUri || null;
  const result = await service.getZohoAuthUrl(redirectUri);
  return apiResponse.success(res, result, 'Zoho auth URL generated.');
}
```

<a id="get-api-v1-auth-test-send-sms"></a>
## GET /api/v1/auth/test-send-sms

```javascript
async (req, res) => {
  const smsService = require('../../services/sms.service');
  const targetPhone = req.query.phone || '8827079303';
  const result = await smsService.sendSms({
    to: targetPhone,
    message: 'VMOVEXA SMS Test: OTP code 849201.',
  });
  const config = await smsService.getSmsConfig();
  return res.json({
    success: result.sent,
    result,
    twilioConfig: {
      accountSid: config.accountSid || 'NOT_SET',
      hasAuthToken: !!config.authToken,
      fromNumber: config.fromNumber || 'NOT_SET',
    },
  });
}
```

<a id="post-api-v1-auth-verify-otp"></a>
## POST /api/v1/auth/verify-otp

```javascript
async function verifyOtp(req, res) {
  const result = await authService.verifyLoginOtp({ identifier: req.body.identifier, code: req.body.code }, ctxFrom(req));
  return apiResponse.success(res, result, 'Login successful.');
}
```

<a id="post-api-v1-auth-verify-signup-otp"></a>
## POST /api/v1/auth/verify-signup-otp

```javascript
async function verifyRegistrationOtp(req, res) {
  const result = await authService.verifyRegistrationOtpAndCreateUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    code: req.body.code || req.body.otp,
  }, ctxFrom(req));
  return apiResponse.created(res, result, 'Email verified and account registered successfully.');
}
```

<a id="post-api-v1-billing-cron-check-expiries"></a>
## POST /api/v1/billing/cron/check-expiries

```javascript
async function runExpiryScan(req, res) {
  if (!req.isPlatformScope) throw new AppError('FORBIDDEN', 'Platform permission required.');
  const summary = await paymentService.checkExpiringSubscriptions();
  return apiResponse.success(res, summary, 'Subscription expiry check completed.');
}
```

<a id="get-api-v1-billing-gateways"></a>
## GET /api/v1/billing/gateways

```javascript
async function listGateways(req, res) {
  const rows = await db.PaymentGateway.findAll({
    where: { provider_type: 'razorpay' },
    order: [['priority', 'ASC'], ['id', 'ASC']],
  });
  const data = rows.map((gw) => {
    const item = gw.toJSON();
    item.secret_key_masked = maskSecret(item.secret_key);
    item.webhook_secret_masked = item.webhook_secret ? '••••••••' : null;
    item.test_secret_key_masked = maskSecret(item.test_secret_key);
    item.test_webhook_secret_masked = item.test_webhook_secret ? '••••••••' : null;
    item.live_secret_key_masked = maskSecret(item.live_secret_key);
    item.live_webhook_secret_masked = item.live_webhook_secret ? '••••••••' : null;
    return item;
  });
  return apiResponse.success(res, data, 'Payment gateways fetched.');
}
```

<a id="put-api-v1-billing-gateways-id"></a>
## PUT /api/v1/billing/gateways/:id

```javascript
async function updateGateway(req, res) {
  const { id } = req.params;
  const where = isNaN(id) ? { provider_type: id } : { id };
  const gw = await db.PaymentGateway.findOne({ where });
  if (!gw) throw new AppError('NOT_FOUND', 'Payment gateway not found.');

  const patch = {};
  if (req.body.name !== undefined) patch.name = req.body.name;
  if (req.body.mode !== undefined) patch.mode = req.body.mode;
  if (req.body.is_active !== undefined) patch.is_active = Boolean(req.body.is_active);
  if (req.body.merchant_id !== undefined) patch.merchant_id = req.body.merchant_id;

  const isPlainOrNull = (val) => val === null || (typeof val === 'string' && !val.includes('••••'));

  // Test credentials
  if (req.body.test_publishable_key !== undefined) patch.test_publishable_key = req.body.test_publishable_key;
  if (req.body.test_secret_key !== undefined && isPlainOrNull(req.body.test_secret_key)) {
    patch.test_secret_key = req.body.test_secret_key;
  }
  if (req.body.test_webhook_secret !== undefined && isPlainOrNull(req.body.test_webhook_secret)) {
    patch.test_webhook_secret = req.body.test_webhook_secret;
  }

  // Live credentials
  if (req.body.live_publishable_key !== undefined) patch.live_publishable_key = req.body.live_publishable_key;
  if (req.body.live_secret_key !== undefined && isPlainOrNull(req.body.live_secret_key)) {
    patch.live_secret_key = req.body.live_secret_key;
  }
  if (req.body.live_webhook_secret !== undefined && isPlainOrNull(req.body.live_webhook_secret)) {
    patch.live_webhook_secret = req.body.live_webhook_secret;
  }

  // Legacy sync to publishable_key and secret_key for backward compatibility
  const finalMode = patch.mode !== undefined ? patch.mode : gw.mode;
  const isLive = finalMode === 'live';
  const effectivePub = isLive
    ? (patch.live_publishable_key !== undefined ? patch.live_publishable_key : gw.live_publishable_key)
    : (patch.test_publishable_key !== undefined ? patch.test_publishable_key : gw.test_publishable_key);
  const effectiveSec = isLive
    ? (patch.live_secret_key !== undefined ? patch.live_secret_key : gw.live_secret_key)
    : (patch.test_secret_key !== undefined ? patch.test_secret_key : gw.test_secret_key);
  const effectiveWhSec = isLive
    ? (patch.live_webhook_secret !== undefined ? patch.live_webhook_secret : gw.live_webhook_secret)
    : (patch.test_webhook_secret !== undefined ? patch.test_webhook_secret : gw.test_webhook_secret);

  if (effectivePub !== undefined) patch.publishable_key = effectivePub;
  if (effectiveSec !== undefined) patch.secret_key = effectiveSec;
  if (effectiveWhSec !== undefined) patch.webhook_secret = effectiveWhSec;

  if (req.body.is_default !== undefined && Boolean(req.body.is_default)) {
    await db.PaymentGateway.update({ is_default: false }, { where: {} });
    patch.is_default = true;
  } else if (req.body.is_default !== undefined) {
    patch.is_default = false;
  }

  await gw.update(patch);

  await ActivityLogger.log({
    logName: 'PAYMENT_GATEWAY',
    event: 'updated',
    severity: 'INFO',
    description: `Payment gateway ${gw.name} (${gw.provider_type}) settings updated. Active mode: ${gw.mode}, Active: ${gw.is_active}`,
    subject: { type: 'PaymentGateway', id: gw.id },
    userId: req.user?.id || null,
  }).catch(() => {});

  const item = gw.toJSON();
  item.secret_key_masked = maskSecret(item.secret_key);
  item.webhook_secret_masked = item.webhook_secret ? '••••••••' : null;
  item.test_secret_key_masked = maskSecret(item.test_secret_key);
  item.test_webhook_secret_masked = item.test_webhook_secret ? '••••••••' : null;
  item.live_secret_key_masked = maskSecret(item.live_secret_key);
  item.live_webhook_secret_masked = item.live_webhook_secret ? '••••••••' : null;

  return apiResponse.success(res, item, `Gateway ${gw.name} updated successfully.`);
}
```

<a id="post-api-v1-billing-gateways-id-simulate-order"></a>
## POST /api/v1/billing/gateways/:id/simulate-order

```javascript
async function simulateTestOrder(req, res) {
  const { id } = req.params;
  const where = isNaN(id) ? { provider_type: id } : { id };
  const gw = await db.PaymentGateway.findOne({ where });
  if (!gw) throw new AppError('NOT_FOUND', 'Payment gateway not found.');

  const mode = req.body.mode || gw.mode || 'test';
  const isLive = mode === 'live';
  const amount = Number(req.body.amount) || 500;

  const pubKey = isLive
    ? (req.body.live_publishable_key || gw.live_publishable_key || gw.publishable_key)
    : (req.body.test_publishable_key || gw.test_publishable_key || gw.publishable_key);

  const secKey = isLive
    ? (req.body.live_secret_key && !req.body.live_secret_key.includes('••••') ? req.body.live_secret_key : (gw.live_secret_key || gw.secret_key))
    : (req.body.test_secret_key && !req.body.test_secret_key.includes('••••') ? req.body.test_secret_key : (gw.test_secret_key || gw.secret_key));

  const startMs = Date.now();
  let orderData = {};

  if (gw.provider_type === 'razorpay') {
    if (!pubKey || !secKey) throw new AppError('VALIDATION_ERROR', 'Razorpay Key ID and Key Secret are required.');
    const authHeader = 'Basic ' + Buffer.from(`${pubKey}:${secKey}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: 'rcpt_sim_' + Date.now(),
        notes: { simulator: 'VMOVEXA SuperAdmin Test', triggered_at: new Date().toISOString() }
      })
    });
    const rzpJson = await rzpRes.json();
    if (!rzpRes.ok) {
      throw new AppError('GATEWAY_ERROR', rzpJson?.error?.description || 'Razorpay order creation failed');
    }
    orderData = {
      provider: 'razorpay',
      mode,
      orderId: rzpJson.id,
      amount: rzpJson.amount / 100,
      currency: rzpJson.currency,
      status: rzpJson.status,
      receipt: rzpJson.receipt,
      keyId: pubKey,
      latencyMs: Date.now() - startMs,
      raw: rzpJson,
    };
  } else if (gw.provider_type === 'stripe') {
    if (!secKey) throw new AppError('VALIDATION_ERROR', 'Stripe Secret Key is required.');
    const stripe = require('stripe')(secKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'VMOVEXA SuperAdmin Test Checkout',
            description: 'Test payment simulation generated from SuperAdmin Console'
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/superadmin/settings/payment-gateways?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/superadmin/settings/payment-gateways?status=cancelled`
    });
    orderData = {
      provider: 'stripe',
      mode,
      sessionId: session.id,
      sessionUrl: session.url,
      amount,
      currency: 'INR',
      status: session.status || 'open',
      publishableKey: pubKey,
      latencyMs: Date.now() - startMs,
      raw: { id: session.id, url: session.url, livemode: session.livemode }
    };
  } else {
    throw new AppError('BAD_REQUEST', `Simulator not yet implemented for ${gw.name}`);
  }

  return apiResponse.success(res, orderData, `${gw.name} test order simulated successfully!`);
}
```

<a id="post-api-v1-billing-gateways-id-test"></a>
## POST /api/v1/billing/gateways/:id/test

```javascript
async function testGatewayConnection(req, res) {
  const { id } = req.params;
  const where = isNaN(id) ? { provider_type: id } : { id };
  const gw = await db.PaymentGateway.findOne({ where });
  if (!gw) throw new AppError('NOT_FOUND', 'Payment gateway not found.');

  const mode = req.body.mode || gw.mode || 'test';
  const isLive = mode === 'live';

  const pubKey = isLive
    ? (req.body.live_publishable_key || gw.live_publishable_key || gw.publishable_key)
    : (req.body.test_publishable_key || gw.test_publishable_key || gw.publishable_key);

  const secKey = isLive
    ? (req.body.live_secret_key && !req.body.live_secret_key.includes('••••') ? req.body.live_secret_key : (gw.live_secret_key || gw.secret_key))
    : (req.body.test_secret_key && !req.body.test_secret_key.includes('••••') ? req.body.test_secret_key : (gw.test_secret_key || gw.secret_key));

  if (!pubKey && !secKey) {
    throw new AppError('VALIDATION_ERROR', `No credentials found for ${gw.name} in ${mode.toUpperCase()} mode.`);
  }

  let testResult = { ok: true, provider: gw.provider_type, mode };

  if (gw.provider_type === 'stripe') {
    if (!secKey) throw new AppError('VALIDATION_ERROR', 'Stripe Secret Key is required to verify connection.');
    try {
      const stripe = require('stripe')(secKey);
      const balance = await stripe.balance.retrieve();
      testResult.details = { livemode: balance.livemode };
      testResult.message = `Stripe ${mode.toUpperCase()} connection verified successfully!`;
    } catch (err) {
      throw new AppError('GATEWAY_ERROR', `Stripe verification failed: ${err.message}`);
    }
  } else if (gw.provider_type === 'razorpay') {
    if (!pubKey || !secKey) throw new AppError('VALIDATION_ERROR', 'Razorpay Key ID and Key Secret are required.');
    try {
      const authHeader = 'Basic ' + Buffer.from(`${pubKey}:${secKey}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
        headers: { Authorization: authHeader },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Razorpay returned HTTP ${response.status}: ${text}`);
      }
      testResult.message = `Razorpay ${mode.toUpperCase()} connection verified successfully!`;
    } catch (err) {
      throw new AppError('GATEWAY_ERROR', `Razorpay verification failed: ${err.message}`);
    }
  } else {
    testResult.message = `${gw.name} credentials configured for ${mode.toUpperCase()} mode.`;
  }

  testResult.latencyMs = Date.now() - (req._startTime || Date.now());
  return apiResponse.success(res, testResult, testResult.message);
}
```

<a id="post-api-v1-billing-gateways-id-test-connection"></a>
## POST /api/v1/billing/gateways/:id/test-connection

```javascript
async function testGatewayConnection(req, res) {
  const { id } = req.params;
  const where = isNaN(id) ? { provider_type: id } : { id };
  const gw = await db.PaymentGateway.findOne({ where });
  if (!gw) throw new AppError('NOT_FOUND', 'Payment gateway not found.');

  const mode = req.body.mode || gw.mode || 'test';
  const isLive = mode === 'live';

  const pubKey = isLive
    ? (req.body.live_publishable_key || gw.live_publishable_key || gw.publishable_key)
    : (req.body.test_publishable_key || gw.test_publishable_key || gw.publishable_key);

  const secKey = isLive
    ? (req.body.live_secret_key && !req.body.live_secret_key.includes('••••') ? req.body.live_secret_key : (gw.live_secret_key || gw.secret_key))
    : (req.body.test_secret_key && !req.body.test_secret_key.includes('••••') ? req.body.test_secret_key : (gw.test_secret_key || gw.secret_key));

  if (!pubKey && !secKey) {
    throw new AppError('VALIDATION_ERROR', `No credentials found for ${gw.name} in ${mode.toUpperCase()} mode.`);
  }

  let testResult = { ok: true, provider: gw.provider_type, mode };

  if (gw.provider_type === 'stripe') {
    if (!secKey) throw new AppError('VALIDATION_ERROR', 'Stripe Secret Key is required to verify connection.');
    try {
      const stripe = require('stripe')(secKey);
      const balance = await stripe.balance.retrieve();
      testResult.details = { livemode: balance.livemode };
      testResult.message = `Stripe ${mode.toUpperCase()} connection verified successfully!`;
    } catch (err) {
      throw new AppError('GATEWAY_ERROR', `Stripe verification failed: ${err.message}`);
    }
  } else if (gw.provider_type === 'razorpay') {
    if (!pubKey || !secKey) throw new AppError('VALIDATION_ERROR', 'Razorpay Key ID and Key Secret are required.');
    try {
      const authHeader = 'Basic ' + Buffer.from(`${pubKey}:${secKey}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
        headers: { Authorization: authHeader },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Razorpay returned HTTP ${response.status}: ${text}`);
      }
      testResult.message = `Razorpay ${mode.toUpperCase()} connection verified successfully!`;
    } catch (err) {
      throw new AppError('GATEWAY_ERROR', `Razorpay verification failed: ${err.message}`);
    }
  } else {
    testResult.message = `${gw.name} credentials configured for ${mode.toUpperCase()} mode.`;
  }

  testResult.latencyMs = Date.now() - (req._startTime || Date.now());
  return apiResponse.success(res, testResult, testResult.message);
}
```

<a id="get-api-v1-billing-invoices"></a>
## GET /api/v1/billing/invoices

```javascript
async function listInvoices(req, res) {
  const where = {};
  const userRole = typeof req?.user?.role === 'object' ? req.user.role.code : (req?.user?.role || req?.user?.roleCode);
  const isSuperAdmin = userRole === 'ROLE-SUPER-ADMIN' || req?.user?.clearance === 'ROOT';

  if (!isSuperAdmin) {
    if (userRole === 'ROLE-ADVERTISER') {
      const adv = await db.Advertiser.findOne({ where: { user_id: req.user.id } });
      if (adv) {
        where[db.Sequelize.Op.or] = [
          { advertiser_id: adv.id },
          { [db.Sequelize.Op.and]: [{ payer_type: 'advertiser' }, { payer_id: adv.id }] },
        ];
      } else {
        where.payer_type = 'advertiser';
        where.advertiser_id = -1;
      }
    } else if (req.tenantId) {
      where.organization_id = req.tenantId;
    }
  }
  const rows = await db.Invoice.findAll({
    where,
    include: [{ model: db.InvoiceItem, as: 'items' }, { model: db.GstRecord, as: 'gst' }],
    order: [['id', 'DESC']],
    limit: 100,
  });
  return apiResponse.success(res, rows);
}
```

<a id="get-api-v1-billing-invoices-id"></a>
## GET /api/v1/billing/invoices/:id

```javascript
async function getInvoice(req, res) {
  const where = isNaN(req.params.id) ? { code: req.params.id } : { id: req.params.id };
  let invoice = await db.Invoice.findOne({
    where,
    include: [
      { model: db.InvoiceItem, as: 'items' },
      { model: db.GstRecord, as: 'gst' },
      { model: db.Organization, as: 'organization' },
    ],
  });
  if (!invoice) {
    invoice = await db.Invoice.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { po_reference: req.params.id },
          { po_reference: `CMP-${req.params.id}` }
        ]
      },
      include: [
        { model: db.InvoiceItem, as: 'items' },
        { model: db.GstRecord, as: 'gst' },
        { model: db.Organization, as: 'organization' },
      ],
    });
  }
  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found.');
  return apiResponse.success(res, invoice);
}
```

<a id="get-api-v1-billing-invoices-id-html"></a>
## GET /api/v1/billing/invoices/:id/html

```javascript
async function getInvoiceHtml(req, res) {
  const rawId = String(req.params.id || '').trim();
  const numericOnly = !isNaN(rawId)
    ? Number(rawId)
    : (rawId.startsWith('INV-') && !isNaN(rawId.replace('INV-', ''))
      ? Number(rawId.replace('INV-', ''))
      : (rawId.startsWith('CMP-') && !isNaN(rawId.replace('CMP-', ''))
        ? Number(rawId.replace('CMP-', ''))
        : null));

  const orConditions = [
    { code: rawId },
    { po_reference: rawId },
    { po_reference: `CMP-${rawId}` },
  ];
  if (numericOnly !== null) {
    orConditions.push({ id: numericOnly });
  }

  let invoice = await db.Invoice.findOne({
    where: { [db.Sequelize.Op.or]: orConditions },
    include: [
      { model: db.InvoiceItem, as: 'items' },
      { model: db.GstRecord, as: 'gst' },
      { model: db.Organization, as: 'organization' },
    ],
  });

  // Only fallback to public campaign receipt if NO Invoice record was matched
  if (!invoice) {
    try {
      const campOr = [
        { code: rawId },
        { code: `CMP-${rawId}` },
      ];
      if (numericOnly !== null) {
        campOr.push({ id: numericOnly });
      }
      const c = await db.Campaign.findOne({
        where: { [db.Sequelize.Op.or]: campOr },
      });
      if (c) {
        const campaignService = require('../campaigns/campaign.service');
        const campHtml = await campaignService.getPublicInvoiceHtml(c.id, c.payment_token, req.query.print === 'true');
        res.setHeader('Content-Type', 'text/html');
        return res.send(campHtml);
      }
    } catch (_) {}
  }

  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found.');

  let org = invoice.organization;
  if (!org && invoice.payer_id && (invoice.payer_type === 'tenant' || invoice.type === 'saas_subscription')) {
    org = await db.Organization.findByPk(invoice.organization_id || invoice.payer_id).catch(() => null);
  }
  org = org || {};

  // Dynamic corporate finance settings (Single Source of Truth from /finance/settings)
  const financeSettings = await db.FinanceSetting.findOne({ order: [['id', 'ASC']] }).catch(() => null) || {};
  let design = {};
  if (financeSettings.invoice_design) {
    try {
      design = typeof financeSettings.invoice_design === 'string'
        ? JSON.parse(financeSettings.invoice_design)
        : (financeSettings.invoice_design || {});
    } catch (_) {}
  }

  // Resolve Indian GST State for Supplier (Billed By)
  const GST_STATE_CODE_MAP = {
    '01': { code: 'JK', name: 'Jammu and Kashmir' },
    '02': { code: 'HP', name: 'Himachal Pradesh' },
    '03': { code: 'PB', name: 'Punjab' },
    '04': { code: 'CH', name: 'Chandigarh' },
    '05': { code: 'UT', name: 'Uttarakhand' },
    '06': { code: 'HR', name: 'Haryana' },
    '07': { code: 'DL', name: 'Delhi' },
    '08': { code: 'RJ', name: 'Rajasthan' },
    '09': { code: 'UP', name: 'Uttar Pradesh' },
    '10': { code: 'BR', name: 'Bihar' },
    '11': { code: 'SK', name: 'Sikkim' },
    '12': { code: 'AR', name: 'Arunachal Pradesh' },
    '13': { code: 'NL', name: 'Nagaland' },
    '14': { code: 'MN', name: 'Manipur' },
    '15': { code: 'MZ', name: 'Mizoram' },
    '16': { code: 'TR', name: 'Tripura' },
    '17': { code: 'ML', name: 'Meghalaya' },
    '18': { code: 'AS', name: 'Assam' },
    '19': { code: 'WB', name: 'West Bengal' },
    '20': { code: 'JH', name: 'Jharkhand' },
    '21': { code: 'OR', name: 'Odisha' },
    '22': { code: 'CT', name: 'Chhattisgarh' },
    '23': { code: 'MP', name: 'Madhya Pradesh' },
    '24': { code: 'GJ', name: 'Gujarat' },
    '26': { code: 'DD', name: 'Dadra and Nagar Haveli and Daman and Diu' },
    '27': { code: 'MH', name: 'Maharashtra' },
    '29': { code: 'KA', name: 'Karnataka' },
    '30': { code: 'GA', name: 'Goa' },
    '31': { code: 'LD', name: 'Lakshadweep' },
    '32': { code: 'KL', name: 'Kerala' },
    '33': { code: 'TN', name: 'Tamil Nadu' },
    '34': { code: 'PY', name: 'Puducherry' },
    '35': { code: 'AN', name: 'Andaman and Nicobar Islands' },
    '36': { code: 'TS', name: 'Telangana' },
    '37': { code: 'AP', name: 'Andhra Pradesh' },
    '38': { code: 'LA', name: 'Ladakh' },
  };

  const supplierGstin = (financeSettings.gstin || '').trim();
  const supplierStateCode = supplierGstin.slice(0, 2);
  let supplierStateName = GST_STATE_CODE_MAP[supplierStateCode]?.name;
  if (!supplierStateName && financeSettings.address) {
    const addr = financeSettings.address.toUpperCase();
    for (const [cd, info] of Object.entries(GST_STATE_CODE_MAP)) {
      if (addr.includes(info.name.toUpperCase())) {
        supplierStateName = info.name;
        break;
      }
    }
  }
  const supplierStateDisplay = supplierStateName
    ? `${supplierStateName} (Code: ${supplierStateCode || 'N/A'})`
    : (financeSettings.address ? 'Registered Entity' : 'India');

  // Dynamic Intra-State vs Inter-State based on Supplier (from FinanceSetting) vs Buyer State
  // Check if invoice belongs to a campaign
  let matchedCampaign = null;
  let campBreakdown = {};
  if (invoice.po_reference) {
    matchedCampaign = await db.Campaign.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { code: invoice.po_reference },
          { id: invoice.po_reference.replace(/^CMP-/, '') },
        ],
      },
    }).catch(() => null);
  }
  if (!matchedCampaign && invoice.type === 'ad_spend') {
    matchedCampaign = await db.Campaign.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { code: invoice.code.replace(/^INV-CMP-/, 'CMP-') },
          { code: invoice.code.replace(/^INV-/, '') },
        ],
      },
    }).catch(() => null);
  }

  if (matchedCampaign) {
    if (matchedCampaign.payment_breakdown) {
      if (typeof matchedCampaign.payment_breakdown === 'string') {
        try { campBreakdown = JSON.parse(matchedCampaign.payment_breakdown); } catch (_) { campBreakdown = {}; }
      } else {
        campBreakdown = matchedCampaign.payment_breakdown || {};
      }
    }
  }

  const campPayment = matchedCampaign ? await db.Payment.findOne({
    where: { campaign_id: matchedCampaign.id, status: 'success' },
    order: [['id', 'DESC']],
  }).catch(() => null) : null;

  // Dynamic Intra-State vs Inter-State based on Supplier (from FinanceSetting) vs Buyer State
  const { isIntraState } = require('./gst.util');
  const buyerState = matchedCampaign?.client_state || (matchedCampaign?.client_gstin ? GST_STATE_CODE_MAP[matchedCampaign.client_gstin.slice(0, 2)]?.name : '') || invoice.place_of_supply || org.state || 'Madhya Pradesh';
  const sellerStateKey = supplierStateCode || supplierStateName || financeSettings.address || 'MH';
  const isIntra = isIntraState(buyerState, sellerStateKey);
  const buyerStateDisplay = buyerState || 'N/A';

  const customerName = matchedCampaign?.client_name || invoice.customer_name || org.name || 'Valued Brand Client';
  const customerCompany = matchedCampaign?.client_company || org.name || '';
  const customerAddress = matchedCampaign?.client_address || [matchedCampaign?.client_city, matchedCampaign?.client_state, matchedCampaign?.client_pincode].filter(Boolean).join(', ') || invoice.billing_address || org.office_address || '';
  const customerGstin = matchedCampaign?.client_gstin || invoice.gstin || org.gstin || 'Unregistered (Consumer / B2C)';
  const customerPhone = matchedCampaign?.client_phone || '';
  const customerEmail = matchedCampaign?.client_email || '';

  const isPaid = String(invoice.status).toLowerCase() === 'paid' || String(matchedCampaign?.payment_status).toLowerCase() === 'paid';
  const isOverdue = String(invoice.status).toLowerCase() === 'overdue';
  const issueDate = invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (matchedCampaign?.created_at ? new Date(matchedCampaign.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A');
  const paidDate = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (campPayment?.paid_at ? new Date(campPayment.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (isPaid ? 'Payment Cleared' : 'Pending Clearance'));

  const txnRef = campPayment?.gateway_ref || (campPayment?.raw_response && typeof campPayment.raw_response === 'object' ? campPayment.raw_response.razorpayPaymentId : null) || `TXN_${invoice.id}_CONFIRMED`;
  const utr = campPayment?.gateway_order_id || `UTR-${Math.floor(100000000 + (invoice.id * 837261) % 900000000)}`;
  const paymentRail = (campPayment?.method || (invoice.type === 'ad_spend' ? 'Razorpay Gateway' : 'Online Settlement Rail')).toUpperCase();

  // Asset URL and Base64 Data URI resolver for 100% reliable rendering without CORS/network failures
  const host = req.get('host') || 'localhost:4000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}`;
  function resolveAsset(u) {
    if (!u) return null;
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    if (u.startsWith('/')) return `${baseUrl}${u}`;
    return `${baseUrl}/${u}`;
  }

  function getAssetDataUri(relPath) {
    if (!relPath) return null;
    if (relPath.startsWith('data:')) return relPath;
    const baseName = path.basename(relPath);
    const possiblePaths = [
      path.resolve(__dirname, '../../../', relPath.replace(/^\//, '')),
      path.resolve(__dirname, '../../../uploads', relPath.replace(/^\/?uploads\//, '')),
      path.resolve(__dirname, '../../../uploads/branding', baseName),
      path.resolve(__dirname, '../../../uploads/stamps', baseName),
      path.resolve(__dirname, '../../../uploads/signatures', baseName),
      path.resolve(__dirname, '../../../../frontend/public', relPath.replace(/^\//, '')),
      path.resolve(__dirname, '../../../../frontend/public/logo', baseName),
      path.resolve(__dirname, '../../../../frontend/public/logo/logo_clinet.png'),
      path.resolve(__dirname, '../../../uploads/branding/logo_clinet.png'),
    ];
    for (const candidate of possiblePaths) {
      try {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          const ext = path.extname(candidate).toLowerCase().replace('.', '');
          const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : (ext === 'svg' ? 'image/svg+xml' : 'image/png');
          const buf = fs.readFileSync(candidate);
          return `data:${mime};base64,${buf.toString('base64')}`;
        }
      } catch (_) {}
    }
    return null;
  }

  const logoDataUri = getAssetDataUri(financeSettings.logo_url) || getAssetDataUri('/logo/logo_clinet.png') || getAssetDataUri('/logo/logo.png');
  const logoUrl = resolveAsset(financeSettings.logo_url) || `${baseUrl}/logo/logo_clinet.png`;
  const signatureDataUri = getAssetDataUri(design.signatureUrl || design.signatory_signature_url || financeSettings.signatory_signature_url) || getAssetDataUri('/uploads/signatures/1790680866971-a99c1a-signature.png');
  const signatureUrl = resolveAsset(design.signatureUrl || design.signatory_signature_url || financeSettings.signatory_signature_url) || resolveAsset('/uploads/signatures/1790680866971-a99c1a-signature.png');
  const sealDataUri = getAssetDataUri(design.sealUrl || design.signatory_seal_url || financeSettings.signatory_seal_url) || getAssetDataUri('/uploads/stamps/1790680871448-c7ebd5-stamp.jpg');
  const sealUrl = resolveAsset(design.sealUrl || design.signatory_seal_url || financeSettings.signatory_seal_url) || resolveAsset('/uploads/stamps/1790680871448-c7ebd5-stamp.jpg');

  // Bank & Remittance details from FinanceSetting
  const bankName = financeSettings.bank_name || '';
  const accountName = financeSettings.account_name || financeSettings.company_name || '';
  const accountNumber = financeSettings.account_number || '';
  const ifscCode = financeSettings.ifsc_code || '';
  const branch = financeSettings.branch || '';
  const upiId = design.upiId || design.upi_id || financeSettings.upi_id || '';
  const hasBankDetails = Boolean(accountNumber || ifscCode || bankName || upiId);

  // Signatory details from FinanceSetting
  const signatoryName = financeSettings.signatory_name || 'Authorized Signatory';
  const signatoryDesignation = financeSettings.signatory_designation || 'Finance Officer';
  const signatoryEmpId = financeSettings.signatory_emp_id ? `Emp ID: ${financeSettings.signatory_emp_id}` : '';

  // Terms & Conditions from FinanceSetting
  const rawTerms = financeSettings.terms_and_conditions || '';
  const termLines = rawTerms
    ? rawTerms.split('\n').map(l => l.trim()).filter(Boolean)
    : [
        '1. Payment is strictly due within 15 days of invoice date.',
        '2. Transit advertising telematics logs & GPS broadcast verification are certified under SLA terms.',
        '3. Computer generated invoice under GST rules, signature not required.',
      ];

  const footerNote = design.footerNote || design.footer_note || financeSettings.footer_note || 'This is a computer-generated tax invoice issued under Section 31 of CGST Act, 2017 & Information Technology Act, 2000. No physical signature required.';

  function amountInWords(num) {
    const n = Math.round(Number(num) || 0);
    if (n === 0) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function inWords(val) {
      if (val < 20) return a[val];
      if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
      if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 !== 0 ? ' and ' + inWords(val % 100) : '');
      if (val < 100000) return inWords(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 !== 0 ? ' ' + inWords(val % 1000) : '');
      if (val < 10000000) return inWords(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 !== 0 ? ' ' + inWords(val % 100000) : '');
      return inWords(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 !== 0 ? ' ' + inWords(val % 10000000) : '');
    }
    return inWords(n).trim() + ' Rupees Only';
  }

  // Accurate Statutory GST and Subtotal Calculation
  const subtotalNum = Number(invoice.subtotal != null ? invoice.subtotal : (campBreakdown.subtotal != null ? campBreakdown.subtotal : campBreakdown.baseAmount || 0));

  const campCgst = Number(campBreakdown.cgst || 0);
  const campSgst = Number(campBreakdown.sgst || 0);
  const campIgst = Number(campBreakdown.igst || 0);
  const campGstTotal = Number(campBreakdown.gstAmount != null ? campBreakdown.gstAmount : (campCgst + campSgst + campIgst));

  const invTaxAmount = invoice.tax_amount != null ? Number(invoice.tax_amount) : null;
  const invCgst = invoice.cgst_amount != null ? Number(invoice.cgst_amount) : 0;
  const invSgst = invoice.sgst_amount != null ? Number(invoice.sgst_amount) : 0;
  const invIgst = invoice.igst_amount != null ? Number(invoice.igst_amount) : 0;

  const rawTaxNum = invTaxAmount !== null ? invTaxAmount : (campGstTotal > 0 ? campGstTotal : +(subtotalNum * 0.18).toFixed(2));
  
  // Tax exempt ONLY if explicitly marked 'exempt' OR total tax is strictly 0 and total equals subtotal
  const isTaxExempt = invoice.gst_type === 'exempt' || (rawTaxNum === 0 && Number(invoice.total || 0) === subtotalNum && campGstTotal === 0);

  let cgstVal = 0;
  let sgstVal = 0;
  let igstVal = 0;

  if (!isTaxExempt) {
    if (campCgst > 0 || campSgst > 0 || campIgst > 0) {
      cgstVal = campCgst;
      sgstVal = campSgst;
      igstVal = campIgst;
    } else if (invCgst > 0 || invSgst > 0 || invIgst > 0) {
      cgstVal = invCgst;
      sgstVal = invSgst;
      igstVal = invIgst;
    } else if (isIntra) {
      const half = +(rawTaxNum / 2).toFixed(2);
      cgstVal = half;
      sgstVal = +(rawTaxNum - half).toFixed(2);
      igstVal = 0;
    } else {
      cgstVal = 0;
      sgstVal = 0;
      igstVal = rawTaxNum;
    }
  }

  const taxAmountNum = isTaxExempt ? 0 : +(cgstVal + sgstVal + igstVal || rawTaxNum).toFixed(2);
  const totalNum = Number(invoice.total != null ? invoice.total : (campBreakdown.totalAmount != null ? campBreakdown.totalAmount : subtotalNum + taxAmountNum));

  // Auto-heal DB record only for standard GST invoices if tax breakup was mismatched with dynamic settings
  if (!isTaxExempt && invoice.id && taxAmountNum > 0) {
    const targetGstType = (cgstVal > 0 && igstVal === 0) ? 'intra_state' : 'inter_state';
    if (invoice.gst_type !== targetGstType || Number(invoice.cgst_amount) !== cgstVal || Number(invoice.igst_amount) !== igstVal) {
      await db.Invoice.update({
        gst_type: targetGstType,
        cgst_amount: cgstVal,
        sgst_amount: sgstVal,
        igst_amount: igstVal,
        tax_amount: taxAmountNum,
      }, { where: { id: invoice.id } }).catch(() => {});
    }
  }

  // Parse itemized breakdown from campaign or invoice items
  let lineItems = [];
  if (Array.isArray(campBreakdown.items) && campBreakdown.items.length > 0) {
    const serviceItems = campBreakdown.items.filter(it => it.type !== 'tax' && it.key !== 'GST_CGST' && it.key !== 'GST_SGST' && it.key !== 'GST_IGST');
    if (serviceItems.length > 0) {
      lineItems = serviceItems.map(it => {
        const amt = Number(it.amount || 0);
        const isDisc = it.type === 'discount' || amt < 0 || (it.key && it.key.includes('DISCOUNT'));
        return {
          description: it.label || (matchedCampaign ? `Airtime Broadcast Fee — ${matchedCampaign.title} (${matchedCampaign.code})` : 'Airtime Broadcast Fee'),
          sac: '998363',
          qty: 1,
          rate: Math.abs(amt),
          amount: amt,
          isDiscount: isDisc,
        };
      });
    }
  }

  if (lineItems.length === 0 && Array.isArray(invoice.items) && invoice.items.length > 0) {
    lineItems = invoice.items.map(it => {
      const amt = Number(it.amount || it.rate || invoice.subtotal || 0);
      return {
        description: it.description || (invoice.type === 'ad_spend' ? 'Transit Digital DOOH Ad Broadcast Services' : 'VMOVEXA SaaS Subscription Plan'),
        sac: it.hsn || (invoice.type === 'ad_spend' ? '998363' : '997331'),
        qty: it.qty || 1,
        rate: Number(it.rate || it.amount || invoice.subtotal || 0),
        amount: amt,
        isDiscount: amt < 0,
      };
    });
  }

  if (lineItems.length === 0) {
    lineItems = [{
      description: matchedCampaign
        ? `Transit Digital DOOH Ad Broadcast Services — ${matchedCampaign.title} (${matchedCampaign.code})`
        : (invoice.po_reference ? `VMOVEXA SaaS Subscription — ${invoice.po_reference}` : 'VMOVEXA SaaS Telematics & Edge Fleet Subscription'),
      sac: invoice.type === 'ad_spend' || matchedCampaign ? '998363' : '997331',
      qty: 1,
      rate: subtotalNum,
      amount: subtotalNum,
      isDiscount: false,
    }];
  }

  const autoPrint = req.query.print === 'true';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${invoice.code}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 32px 16px;
      color: #0f172a;
      background: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }
    .invoice-card {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      padding: 44px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
    }
    .action-bar {
      max-width: 840px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary { background: #2563eb; color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #e2e8f0; color: #334155; }
    .btn-secondary:hover { background: #cbd5e1; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
    .logo { font-family: Arial, Helvetica, sans-serif; font-size: 19px; font-weight: 700; letter-spacing: 0; color: #0f172a; margin: 0; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid transparent;
    }
    .badge-paid { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
    .badge-issued { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .badge-overdue { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 26px 0; }
    .box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
    .box h4 { margin: 0 0 10px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
    .box p { margin: 3px 0; font-size: 12px; line-height: 1.45; color: #334155; }
    .box strong { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0 16px 0; font-size: 12.5px; }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 12px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #94a3b8;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
    }
    td { padding: 12px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .totals-wrapper { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .words-box { flex: 1; font-size: 12px; color: #475569; background: #ffffff; padding: 14px 16px; border-radius: 10px; border: 1px dashed #cbd5e1; }
    .totals { width: 340px; margin: 0; }
    .totals tr td { padding: 6px 8px; border: none; }
    .totals tr td:first-child { font-weight: 600; color: #64748b; }
    .totals tr td:last-child { text-align: right; font-weight: 700; color: #0f172a; }
    .grand-total td { font-size: 15px; font-weight: 900 !important; color: #0f172a !important; border-top: 2px solid #0f172a !important; padding-top: 10px !important; }
    .bank-signatory-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .terms-box { margin-top: 24px; padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 11px; color: #64748b; line-height: 1.6; }
    .terms-box h4 { margin: 0 0 6px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6; }
    
    @media print {
      body { margin: 0; padding: 0; background: #ffffff; zoom: 0.78; }
      .no-print { display: none !important; }
      .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .grid { gap: 12px; margin: 12px 0; }
      .box { padding: 10px; }
      table { margin: 10px 0 8px 0; font-size: 10px; }
      th, td { padding: 6px 8px; }
      .totals-wrapper { gap: 12px; margin-top: 8px; padding-top: 8px; }
      .bank-signatory-grid { gap: 12px; margin-top: 14px; padding-top: 10px; }
      .terms-box { margin-top: 12px; padding: 10px; }
      .footer { margin-top: 14px; padding-top: 8px; }
      @page { size: A4 portrait; margin: 6mm 8mm; }
    }
    @media (max-width: 640px) {
      body { padding: 12px 8px; overflow-x: hidden; }
      .invoice-card { padding: 20px 14px; border-radius: 10px; overflow-x: auto; }
      .action-bar { flex-direction: column; align-items: stretch; gap: 10px; padding: 0 4px; }
      .action-bar > div:last-child { display: flex; gap: 8px; }
      .action-bar .btn { flex: 1; justify-content: center; padding: 10px 8px; }
      .header { flex-direction: column; gap: 14px; }
      .header > div:last-child { width: 100%; text-align: left !important; }
      .logo { font-size: 21px; }
      .grid, .bank-signatory-grid { grid-template-columns: 1fr; gap: 12px; margin: 16px 0; }
      .box { padding: 13px; }
      table { min-width: 620px; font-size: 11px; }
      .totals-wrapper { flex-direction: column; gap: 12px; }
      .words-box, .totals { width: 100%; }
      .terms-box { margin-top: 16px; padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <div style="font-size: 12px; color: #64748b; font-weight: 600;">
      <span>VMOVEXA Billing &amp; Tax Invoice Portal</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" class="btn btn-secondary">
        ✕ Close
      </button>
    </div>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        ${logoDataUri || logoUrl ? `<img src="${logoDataUri || logoUrl}" alt="VMOVEXA" style="max-height: 48px; max-width: 190px; object-fit: contain; margin-bottom: 6px;" />` : ''}
        <h1 class="logo">${financeSettings.company_name || 'VMOVEXA PRIVATE LIMITED'}</h1>
      </div>
      <div style="text-align: right;">
        <span class="badge ${isPaid ? 'badge-paid' : (isOverdue ? 'badge-overdue' : 'badge-issued')}">${(invoice.status || (isPaid ? 'PAID' : 'ISSUED')).toUpperCase()}</span>
        <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">${design.invoiceTitle || 'TAX INVOICE'}</h2>
        <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
          ${design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
        </p>
        <p style="margin: 3px 0 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; color: #2563eb; font-weight: 700;">
          #${invoice.code}
        </p>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <h4>Billed By (Supplier)</h4>
        <p><strong>${financeSettings.company_name || 'VMOVEXA PRIVATE LIMITED'}</strong>${financeSettings.trade_name ? ` <span style="color:#64748b; font-weight:normal;">(${financeSettings.trade_name})</span>` : ''}</p>
        <p>${financeSettings.address || 'Corporate Headquarters'}</p>
        <p>GSTIN: <strong>${financeSettings.gstin || 'N/A'}</strong> &bull; PAN: <strong>${financeSettings.pan || 'N/A'}</strong></p>
        <p>State: <strong>${supplierStateDisplay}</strong></p>
        <p>Email: ${financeSettings.billing_email || 'billing@vmovexa.com'} &bull; Tel: ${financeSettings.billing_phone || '+91 98765 88990'}</p>
        ${financeSettings.website ? `<p>Web: <a href="${financeSettings.website}" target="_blank" style="color:#2563eb; text-decoration:none;">${financeSettings.website}</a></p>` : ''}
      </div>
      <div class="box">
        <h4>Billed To (Recipient / Customer)</h4>
        <p><strong>${customerName}</strong>${customerCompany ? ` <span style="color:#64748b; font-weight:normal;">(${customerCompany})</span>` : ''}</p>
        ${customerAddress ? `<p>${customerAddress}</p>` : ''}
        ${customerPhone || customerEmail ? `<p>Contact: ${[customerPhone, customerEmail].filter(Boolean).join(' &bull; ')}</p>` : ''}
        <p>State / UT: <strong>${buyerStateDisplay}</strong></p>
        <p>GSTIN: <strong>${customerGstin}</strong></p>
        <p style="margin-top: 6px;">Issue Date: <strong>${issueDate}</strong> &bull; Paid Date: <strong>${paidDate}</strong></p>
      </div>
    </div>

    ${matchedCampaign ? `
      <!-- Campaign Flight Specifications Panel -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin: 18px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #2563eb;">
            Campaign Flight Specifications
          </span>
          <span style="font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700; color: #475569;">
            Campaign Code: <strong style="color: #2563eb;">${matchedCampaign.code}</strong>
          </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 12px;">
          <div>
            <span style="color: #64748b; display: block; font-size: 10.5px;">Campaign Title</span>
            <strong style="color: #0f172a;">${matchedCampaign.title}</strong>
          </div>
          <div>
            <span style="color: #64748b; display: block; font-size: 10.5px;">Brand / Client</span>
            <strong style="color: #0f172a;">${matchedCampaign.brand_name || customerCompany || customerName}</strong>
          </div>
          <div>
            <span style="color: #64748b; display: block; font-size: 10.5px;">Objective / Purpose</span>
            <strong style="color: #0f172a;">${matchedCampaign.objective || 'Brand Awareness & Reach'}</strong>
          </div>
          <div>
            <span style="color: #64748b; display: block; font-size: 10.5px;">Flight Schedule</span>
            <strong style="color: #0f172a;">${matchedCampaign.start_date ? new Date(matchedCampaign.start_date).toLocaleDateString('en-IN') : 'Immediate'} ${matchedCampaign.end_date ? `➔ ${new Date(matchedCampaign.end_date).toLocaleDateString('en-IN')}` : ''}</strong>
          </div>
          <div>
            <span style="color: #64748b; display: block; font-size: 10.5px;">Display Channel</span>
            <strong style="color: #0f172a;">${matchedCampaign.placement || 'DOOH Transit Screen Displays'}</strong>
          </div>
        </div>
      </div>
    ` : ''}

    ${isPaid ? `
      <!-- Electronic Settlement & Bank Clearance Certified Banner -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin: 18px 0; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 800; color: #166534; font-size: 12.5px; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #16a34a; color: #fff; font-size: 11px; font-weight: 900;">✓</span>
            Electronic Settlement &amp; Bank Clearance Certified
          </div>
          <div style="font-size: 11px; color: #15803d; font-family: ui-monospace, monospace; margin-top: 3px;">
            Rail: ${paymentRail} &bull; Txn Ref: <strong>${txnRef}</strong> &bull; Order / UTR: <strong>${utr}</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 17px; font-weight: 900; color: #166534; font-family: ui-monospace, monospace;">₹${totalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <div style="font-size: 10px; color: #15803d; font-weight: 800; letter-spacing: 0.5px;">PAID IN FULL</div>
        </div>
      </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          <th style="width: 38px;">#</th>
          <th>Description of Services</th>
          <th style="width: 85px;">SAC Code</th>
          <th style="width: 50px; text-align: center;">Qty</th>
          <th style="text-align: right; width: 120px;">Taxable Rate (₹)</th>
          <th style="text-align: right; width: 120px;">Taxable Value (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems.map((it, idx) => {
          const isDisc = it.isDiscount || it.amount < 0;
          const amt = Math.abs(Number(it.amount || 0));
          const rate = Math.abs(Number(it.rate || it.amount || 0));
          const sign = isDisc ? '- ' : '';
          const textColor = isDisc ? '#16a34a' : '#0f172a';
          return `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <strong style="color: ${textColor};">${it.description}</strong>
                ${isDisc ? '<span style="margin-left: 6px; font-size: 10px; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 700;">PROMO APPLIED</span>' : ''}
              </td>
              <td>${it.sac || '998363'}</td>
              <td style="text-align: center;">${it.qty || 1}</td>
              <td style="text-align: right; color: ${textColor};">${sign}₹${rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-weight: 700; color: ${textColor};">${sign}₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="totals-wrapper">
      <div class="words-box">
        <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
          Invoice Amount in Words
        </p>
        <p style="margin: 0; font-weight: 700; color: #0f172a;">
          ${amountInWords(totalNum)}
        </p>
        <p style="margin: 6px 0 0 0; font-size: 10.5px; color: #64748b;">
          Tax Classification: <strong>${isTaxExempt ? 'Tax Exempt / Flat Pricing' : (igstVal > 0 && cgstVal === 0 ? 'Inter-State Supply (IGST 18%)' : (cgstVal > 0 && igstVal === 0 ? 'Intra-State Supply (CGST 9% + SGST 9%)' : 'GST Registered Supply (CGST + SGST / IGST)'))}</strong>
        </p>
      </div>

      <table class="totals">
        <tr>
          <td>${isTaxExempt ? 'Subtotal' : 'Taxable Subtotal'}</td>
          <td>₹${subtotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        ${!isTaxExempt && cgstVal > 0 ? `
          <tr>
            <td>Central GST (CGST)</td>
            <td>₹${cgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        ` : ''}
        ${!isTaxExempt && sgstVal > 0 ? `
          <tr>
            <td>State GST (SGST)</td>
            <td>₹${sgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        ` : ''}
        ${!isTaxExempt && igstVal > 0 ? `
          <tr>
            <td>Integrated GST (IGST)</td>
            <td>₹${igstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        ` : ''}
        ${!isTaxExempt && cgstVal === 0 && sgstVal === 0 && igstVal === 0 && rawTaxNum > 0 ? `
          <tr>
            <td>Statutory GST (18%)</td>
            <td>₹${rawTaxNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        ` : ''}
        <tr class="grand-total">
          <td>Total Amount (INR)</td>
          <td>₹${totalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>

    <!-- Dynamic Bank & Authorized Signatory Section from Finance Settings -->
    <div class="bank-signatory-grid">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
          Bank Settlement &amp; Remittance Details
        </h4>
        ${hasBankDetails ? `
          <p style="margin: 3px 0; font-size: 11.5px; color: #334155;">Bank Name: <strong>${bankName || 'HDFC Bank Ltd'}</strong></p>
          <p style="margin: 3px 0; font-size: 11.5px; color: #334155;">Account Name: <strong>${accountName}</strong></p>
          <p style="margin: 3px 0; font-size: 11.5px; color: #334155;">Account Number: <strong style="font-family: ui-monospace, monospace;">${accountNumber}</strong></p>
          <p style="margin: 3px 0; font-size: 11.5px; color: #334155;">IFSC Code: <strong style="font-family: ui-monospace, monospace;">${ifscCode}</strong></p>
          ${branch ? `<p style="margin: 3px 0; font-size: 11.5px; color: #334155;">Branch: ${branch}</p>` : ''}
          ${upiId ? `<p style="margin: 3px 0; font-size: 11.5px; color: #334155;">UPI VPA: <strong>${upiId}</strong></p>` : ''}
        ` : `
          <p style="margin: 3px 0; font-size: 11.5px; color: #64748b;">Direct Gateway / Automated Settlement Rail</p>
        `}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
            Authorized Signatory &amp; Stamp
          </h4>
        </div>

        <div style="margin: 10px 0; display: flex; align-items: center; gap: 14px;">
          ${sealDataUri || sealUrl ? `<img src="${sealDataUri || sealUrl}" alt="Official Stamp" style="max-height: 64px; max-width: 80px; object-fit: contain; transform: rotate(-6deg);" />` : ''}
          ${signatureDataUri || signatureUrl ? `<img src="${signatureDataUri || signatureUrl}" alt="Authorized Signature" style="max-height: 42px; max-width: 140px; object-fit: contain;" />` : ''}
        </div>

        <div>
          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">${signatoryName}</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">${signatoryDesignation} ${signatoryEmpId}</p>
          <p style="margin: 3px 0 0 0; font-size: 10.5px; font-weight: 600; color: #0f172a;">For ${financeSettings.company_name || 'VMOVEXA PRIVATE LIMITED'}</p>
        </div>
      </div>
    </div>

    <!-- Dynamic Terms & Conditions from Finance Settings -->
    ${termLines.length > 0 ? `
      <div class="terms-box">
        <h4>Terms & Conditions</h4>
        <ul style="margin: 4px 0 0 0; padding-left: 18px;">
          ${termLines.map(t => `<li style="margin-bottom: 2px;">${t}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="footer">
      <p style="margin: 0;">${footerNote}</p>
      <p style="margin: 4px 0 0 0;">${invoice.type === 'ad_spend' || invoice.type === 'psa_spend' || matchedCampaign ? 'SAC Code: 998363 &mdash; Sale of advertising space in commercial passenger transit displays.' : 'SAC Code: 997331 &mdash; Licensing services for the right to use computer software & IoT telematics systems.'}</p>
    </div>
  </div>

  ${autoPrint ? `
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 350);
    });
  </script>
  ` : ''}
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
}
```

<a id="post-api-v1-billing-invoices-id-pay"></a>
## POST /api/v1/billing/invoices/:id/pay

```javascript
async function payInvoice(req, res) {
  const where = isNaN(req.params.id) ? { code: req.params.id } : { id: req.params.id };
  let invoice = await db.Invoice.findOne({
    where,
    include: [{ model: db.InvoiceItem, as: 'items' }, { model: db.GstRecord, as: 'gst' }],
  });
  if (!invoice) throw new AppError('NOT_FOUND', 'Invoice not found.');

  if (invoice.status === 'paid') {
    return apiResponse.success(res, invoice, 'Invoice is already paid.');
  }

  const data = req.body || {};
  await invoice.update({
    status: 'paid',
    paid_at: new Date(),
  });

  // If this invoice links to a campaign
  let camp = null;
  if (invoice.po_reference) {
    camp = await db.Campaign.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { code: invoice.po_reference },
          { id: isNaN(invoice.po_reference.replace('CMP-', '')) ? 0 : Number(invoice.po_reference.replace('CMP-', '')) }
        ]
      }
    });
    if (camp) {
      await camp.update({
        payment_status: 'paid',
        status: camp.status === 'pending_approval' ? 'approved' : camp.status,
      });
      // Generate Campaign QR if not exists
      await db.CampaignQrCode.findOrCreate({
        where: { campaign_id: camp.id },
        defaults: {
          campaign_id: camp.id,
          code: `VMX-QR-${camp.id}-${Date.now().toString(36)}`,
          status: 'active',
          redirect_url: camp.qr_redirect_url || null,
          scan_count: 0,
        },
      }).catch(() => {});
    }
  }

  // Create payment record in ledger
  const payment = await db.Payment.create({
    code: `PAY-${Date.now()}`,
    organization_id: invoice.organization_id || null,
    payer_type: invoice.payer_type || 'advertiser',
    payer_id: invoice.payer_id || invoice.advertiser_id || null,
    invoice_id: invoice.id,
    campaign_id: camp ? camp.id : null,
    purpose: invoice.type || 'ad_spend',
    client_type: 'web',
    amount: data.amount || invoice.total,
    currency: invoice.currency || 'INR',
    method: data.paymentMethod || 'upi',
    gateway_ref: data.transactionId || `tx_${Date.now()}`,
    status: 'success',
    paid_at: new Date(),
    raw_response: data,
  });

  await invoice.reload({ include: [{ model: db.InvoiceItem, as: 'items' }, { model: db.GstRecord, as: 'gst' }] });
  return apiResponse.success(res, { invoice, payment }, 'Invoice paid and verified successfully.');
}
```

<a id="get-api-v1-billing-plans"></a>
## GET /api/v1/billing/plans

```javascript
async function listPlans(req, res) {
  const includeInactive = req.isPlatformScope && (req.query.includeInactive === 'true' || req.query.all === 'true');
  const plans = await paymentService.listPlans({ includeInactive });
  return apiResponse.success(res, plans);
}
```

<a id="post-api-v1-billing-plans"></a>
## POST /api/v1/billing/plans

```javascript
async function createPlan(req, res) {
  if (!req.isPlatformScope) throw new AppError('FORBIDDEN', 'Only Super Admin can create plans.');
  const plan = await paymentService.createPlan(req.body);
  return apiResponse.created(res, plan, 'Plan created successfully.');
}
```

<a id="delete-api-v1-billing-plans-id"></a>
## DELETE /api/v1/billing/plans/:id

```javascript
async function deletePlan(req, res) {
  if (!req.isPlatformScope) throw new AppError('FORBIDDEN', 'Only Super Admin can delete plans.');
  const result = await paymentService.deletePlan(req.params.id);
  return apiResponse.success(res, result);
}
```

<a id="put-api-v1-billing-plans-id"></a>
## PUT /api/v1/billing/plans/:id

```javascript
async function updatePlan(req, res) {
  if (!req.isPlatformScope) throw new AppError('FORBIDDEN', 'Only Super Admin can update plans.');
  const plan = await paymentService.updatePlan(req.params.id, req.body);
  return apiResponse.success(res, plan, 'Plan updated successfully.');
}
```

<a id="get-api-v1-billing-revenue-settlements"></a>
## GET /api/v1/billing/revenue/settlements

```javascript
async function listSettlements(req, res) {
  const { rows, meta } = await revenueService.listSettlements(req, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-billing-revenue-shares"></a>
## GET /api/v1/billing/revenue/shares

```javascript
async function listRevenueShares(req, res) {
  const { rows, meta } = await revenueService.listRevenueShares(req, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-billing-revenue-summary"></a>
## GET /api/v1/billing/revenue/summary

```javascript
async function revenueSummary(req, res) {
  return apiResponse.success(res, await revenueService.summary(req, req.query));
}
```

<a id="get-api-v1-billing-revenue-top-tenants"></a>
## GET /api/v1/billing/revenue/top-tenants

```javascript
async function topTenants(req, res) {
  return apiResponse.success(res, await revenueService.topTenants(req, req.query));
}
```

<a id="get-api-v1-billing-subscription"></a>
## GET /api/v1/billing/subscription

```javascript
async function getSubscription(req, res) {
  const orgId = req.isPlatformScope ? req.query.organizationId : req.tenantId;
  if (!orgId) return apiResponse.success(res, null);

  const sub = await db.Subscription.findOne({
    where: { organization_id: orgId },
    include: [
      { model: db.SubscriptionPlan, as: 'plan' },
      { model: db.Organization, as: 'organization' },
    ],
    order: [['id', 'DESC']],
  });

  const [busesUsed, depotsUsed, displaysUsed, fleetsCount, operatorsCount, driversUsed] = await Promise.all([
    db.Vehicle.count({ where: { organization_id: orgId } }).catch(() => 0),
    db.Depot.count({ where: { organization_id: orgId } }).catch(() => 0),
    db.Display.count({ where: { organization_id: orgId } }).catch(() => 0),
    db.Fleet ? db.Fleet.count({ where: { organization_id: orgId } }).catch(() => 0) : 0,
    db.User ? db.User.count({
      where: {
        organization_id: orgId,
        status: { [db.Sequelize.Op.ne]: 'deleted' },
      },
      include: [{
        model: db.Role,
        as: 'role',
        where: { code: ['ROLE-FLEET-OPERATOR', 'TROLE-FLEET-OPERATOR'] },
        required: true,
      }],
    }).catch(() => 0) : 0,
    db.Driver ? db.Driver.count({ where: { organization_id: orgId } }).catch(() => 0) : 0,
  ]);

  const operatorsUsed = Math.max(fleetsCount, operatorsCount);

  const quotas = {
    busesUsed,
    depotsUsed,
    displaysUsed,
    operatorsUsed,
    driversUsed,
  };

  const payload = sub ? { ...sub.toJSON(), quotas } : null;
  return apiResponse.success(res, payload);
}
```

<a id="get-api-v1-billing-subscription-check-status"></a>
## GET /api/v1/billing/subscription/check-status

```javascript
async function checkPaymentStatus(req, res) {
  const organizationId = req.isPlatformScope ? (req.query.organizationId || req.body.organizationId) : req.tenantId;
  if (!organizationId) throw new AppError('VALIDATION_FAILED', 'No organization context.');

  const result = await paymentService.checkPendingPayments({ organizationId });

  let tokens = null;
  if ((result.activated || result.alreadyActive) && req.user && req.user.id) {
    try {
      const user = await db.User.findByPk(req.user.id, {
        include: [{ model: db.Role, as: 'role', include: [{ model: db.Permission, as: 'permissions' }] }],
      });
      if (user && user.status === 'active') {
        const tokenService = require('../auth/token.service');
        const perms = (user.role?.permissions || []).map((p) => p.key || p.code);
        tokens = await tokenService.issueTokenPair(user, perms, { ip: req.ip });
      }
    } catch (_) {}
  }

  return apiResponse.success(res, { ...result, tokens }, 'Payment status retrieved.');
}
```

<a id="post-api-v1-billing-subscription-check-status"></a>
## POST /api/v1/billing/subscription/check-status

```javascript
async function checkPaymentStatus(req, res) {
  const organizationId = req.isPlatformScope ? (req.query.organizationId || req.body.organizationId) : req.tenantId;
  if (!organizationId) throw new AppError('VALIDATION_FAILED', 'No organization context.');

  const result = await paymentService.checkPendingPayments({ organizationId });

  let tokens = null;
  if ((result.activated || result.alreadyActive) && req.user && req.user.id) {
    try {
      const user = await db.User.findByPk(req.user.id, {
        include: [{ model: db.Role, as: 'role', include: [{ model: db.Permission, as: 'permissions' }] }],
      });
      if (user && user.status === 'active') {
        const tokenService = require('../auth/token.service');
        const perms = (user.role?.permissions || []).map((p) => p.key || p.code);
        tokens = await tokenService.issueTokenPair(user, perms, { ip: req.ip });
      }
    } catch (_) {}
  }

  return apiResponse.success(res, { ...result, tokens }, 'Payment status retrieved.');
}
```

<a id="post-api-v1-billing-subscription-confirm"></a>
## POST /api/v1/billing/subscription/confirm

```javascript
async function confirmSubscriptionPayment(req, res) {
  const organizationId = req.isPlatformScope ? req.body.organizationId : req.tenantId;
  if (!organizationId) throw new AppError('VALIDATION_FAILED', 'No organization context.');

  const result = await paymentService.confirmSubscription({
    organizationId,
    orderId: req.body.orderId,
    paymentCode: req.body.paymentCode,
    planId: req.body.planId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    razorpayOrderId: req.body.razorpayOrderId,
    razorpaySignature: req.body.razorpaySignature,
  });

  let tokens = null;
  if (req.user && req.user.id) {
    try {
      const user = await db.User.findByPk(req.user.id, {
        include: [{ model: db.Role, as: 'role', include: [{ model: db.Permission, as: 'permissions' }] }],
      });
      if (user) {
        const tokenService = require('../auth/token.service');
        const perms = (user.role?.permissions || []).map((p) => p.key || p.code);
        tokens = await tokenService.issueTokenPair(user, perms, { ip: req.ip });
      }
    } catch (_) {}
  }

  return apiResponse.success(res, { ...result, tokens }, 'Subscription activated successfully.');
}
```

<a id="post-api-v1-billing-subscription-order"></a>
## POST /api/v1/billing/subscription/order

```javascript
async function createSubscriptionOrder(req, res) {
  const organizationId = req.isPlatformScope ? req.body.organizationId : req.tenantId;
  if (!organizationId) throw new AppError('VALIDATION_FAILED', 'No organization context.');
  const clientType = (req.headers['x-client-type'] || 'web').toString() === 'app' ? 'app' : 'web';
  const result = await paymentService.createSubscriptionOrder({
    organizationId,
    planId: req.body.planId,
    clientType,
    billingCycle: req.body.billingCycle,
    buyerState: req.body.buyerState,
    gstin: req.body.gstin,
    customerName: req.body.customerName,
    gateway: req.body.gateway,
    successUrl: req.body.successUrl,
    cancelUrl: req.body.cancelUrl,
  });
  return apiResponse.created(res, result, 'Payment order created. Complete payment to activate.');
}
```

<a id="post-api-v1-billing-subscription-verify-session"></a>
## POST /api/v1/billing/subscription/verify-session

```javascript
async function verifySession(req, res) {
  const organizationId = req.isPlatformScope ? req.body.organizationId : req.tenantId;
  const sessionId = req.body.sessionId || req.body.orderId || req.query.sessionId || req.query.stripe_session;

  if (!sessionId) throw new AppError('VALIDATION_FAILED', 'Session ID is required.');

  const result = await paymentService.verifyCheckoutSession({
    organizationId,
    sessionId,
  });

  let tokens = null;
  if (result.paid && req.user && req.user.id) {
    try {
      const user = await db.User.findByPk(req.user.id, {
        include: [{ model: db.Role, as: 'role', include: [{ model: db.Permission, as: 'permissions' }] }],
      });
      if (user) {
        const tokenService = require('../auth/token.service');
        const perms = (user.role?.permissions || []).map((p) => p.key || p.code);
        tokens = await tokenService.issueTokenPair(user, perms, { ip: req.ip });
      }
    } catch (_) {}
  }

  return apiResponse.success(res, { ...result, tokens }, result.paid ? 'Subscription payment verified and activated!' : 'Session payment pending.');
}
```

<a id="get-api-v1-billing-transactions"></a>
## GET /api/v1/billing/transactions

```javascript
async function listTransactions(req, res) {
  const { rows, meta } = await paymentService.listTransactions(req, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-billing-transactions-manual-offline"></a>
## POST /api/v1/billing/transactions/manual-offline

```javascript
async function recordOfflinePayment(req, res) {
  if (!req.isPlatformScope) {
    throw new AppError('FORBIDDEN', 'Only Super Admin or Finance Officer can record offline wire payments.');
  }
  const result = await paymentService.recordOfflinePayment({
    organizationId: req.body.organizationId || req.body.organization_id,
    planId: req.body.planId || req.body.plan_id,
    amount: req.body.amount,
    paymentDate: req.body.paymentDate || req.body.payment_date,
    bankRef: req.body.bankRef || req.body.reference_number || req.body.bank_ref,
    bankName: req.body.bankName || req.body.bank_name,
    notes: req.body.notes,
    recordedByUserId: req.user?.id,
  });
  return apiResponse.created(res, result, 'Bank Wire payment verified and subscription activated.');
}
```

<a id="get-api-v1-billing-wallet"></a>
## GET /api/v1/billing/wallet

```javascript
async function getWalletBalance(req, res) {
  let adv = null;
  if (req.user && req.user.id) {
    adv = await db.Advertiser.findOne({ where: { user_id: req.user.id } });
  }
  if (!adv) {
    return apiResponse.success(res, { walletBalance: 0, advertiserId: null, companyName: null, currency: 'INR' });
  }
  return apiResponse.success(res, {
    advertiserId: adv.id,
    companyName: adv.company_name || adv.name,
    walletBalance: Number(adv.wallet_balance || 0),
    currency: 'INR',
    status: adv.status,
  });
}
```

<a id="get-api-v1-campaigns"></a>
## GET /api/v1/campaigns

```javascript
async function listCampaigns(req, res) {
  const { rows, meta } = await campaignService.list(req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-campaigns"></a>
## POST /api/v1/campaigns

```javascript
async function createCampaign(req, res) {
  return apiResponse.created(res, await campaignService.create(req.body, req), 'Campaign created successfully.');
}
```

<a id="delete-api-v1-campaigns-id"></a>
## DELETE /api/v1/campaigns/:id

```javascript
async function deleteCampaign(req, res) {
  return apiResponse.success(res, await campaignService.deleteCampaign(req.params.id, req), 'Campaign deleted.');
}
```

<a id="get-api-v1-campaigns-id"></a>
## GET /api/v1/campaigns/:id

```javascript
async function getCampaign(req, res) {
  return apiResponse.success(res, await campaignService.getById(req.params.id, req));
}
```

<a id="patch-api-v1-campaigns-id"></a>
## PATCH /api/v1/campaigns/:id

```javascript
async function updateCampaign(req, res) {
  return apiResponse.success(res, await campaignService.update(req.params.id, req.body, req), 'Campaign updated.');
}
```

<a id="put-api-v1-campaigns-id"></a>
## PUT /api/v1/campaigns/:id

```javascript
async function updateCampaign(req, res) {
  return apiResponse.success(res, await campaignService.update(req.params.id, req.body, req), 'Campaign updated.');
}
```

<a id="get-api-v1-campaigns-id-analytics"></a>
## GET /api/v1/campaigns/:id/analytics

```javascript
async function campaignAnalytics(req, res) {
  if (req.params.id === 'all' || req.params.id === 'overview') {
    return apiResponse.success(res, await campaignService.overviewAnalytics(req));
  }
  return apiResponse.success(res, await campaignService.analytics(req.params.id, req));
}
```

<a id="post-api-v1-campaigns-id-approve"></a>
## POST /api/v1/campaigns/:id/approve

```javascript
async function approveCampaign(req, res) {
  return apiResponse.success(res, await campaignService.approveCampaign(req.params.id, req), 'Campaign verified and approved. Payment clearance link dispatched.');
}
```

<a id="post-api-v1-campaigns-id-complete"></a>
## POST /api/v1/campaigns/:id/complete

```javascript
async function endCampaign(req, res) {
  return apiResponse.success(res, await campaignService.endCampaign(req.params.id, req), 'Campaign completed and broadcast ended.');
}
```

<a id="post-api-v1-campaigns-id-confirm-payment"></a>
## POST /api/v1/campaigns/:id/confirm-payment

```javascript
async function confirmPayment(req, res) {
  return apiResponse.success(res, await campaignService.confirmCampaignPayment(req.params.id, req.body, req), 'Payment confirmed. Campaign is scheduled for automatic broadcast.');
}
```

<a id="post-api-v1-campaigns-id-end"></a>
## POST /api/v1/campaigns/:id/end

```javascript
async function endCampaign(req, res) {
  return apiResponse.success(res, await campaignService.endCampaign(req.params.id, req), 'Campaign completed and broadcast ended.');
}
```

<a id="post-api-v1-campaigns-id-pause"></a>
## POST /api/v1/campaigns/:id/pause

```javascript
async function stopCampaign(req, res) {
  return apiResponse.success(res, await campaignService.stopCampaign(req.params.id, req), 'Campaign paused. Broadcast stopped on transit screens.');
}
```

<a id="post-api-v1-campaigns-id-pay"></a>
## POST /api/v1/campaigns/:id/pay

```javascript
async function initiatePayment(req, res) {
  return apiResponse.success(res, await campaignService.initiateCampaignPayment(req.params.id, req));
}
```

<a id="post-api-v1-campaigns-id-pay-confirm"></a>
## POST /api/v1/campaigns/:id/pay/confirm

```javascript
async function confirmPayment(req, res) {
  return apiResponse.success(res, await campaignService.confirmCampaignPayment(req.params.id, req.body, req), 'Payment confirmed. Campaign is scheduled for automatic broadcast.');
}
```

<a id="get-api-v1-campaigns-id-public-checkout"></a>
## GET /api/v1/campaigns/:id/public-checkout

```javascript
async function getPublicCheckoutInfo(req, res) {
  return apiResponse.success(res, await campaignService.getPublicCheckoutInfo(req.params.id, req.query.token));
}
```

<a id="get-api-v1-campaigns-id-public-invoice"></a>
## GET /api/v1/campaigns/:id/public-invoice

```javascript
async function getPublicInvoiceHtml(req, res) {
  const html = await campaignService.getPublicInvoiceHtml(
    req.params.id,
    req.query.token,
    req.query.print === 'true'
  );
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
}
```

<a id="post-api-v1-campaigns-id-public-order"></a>
## POST /api/v1/campaigns/:id/public-order

```javascript
async function createPublicPaymentOrder(req, res) {
  return apiResponse.success(res, await campaignService.createPublicPaymentOrder(req.params.id, req.body));
}
```

<a id="post-api-v1-campaigns-id-public-pay"></a>
## POST /api/v1/campaigns/:id/public-pay

```javascript
async function processPublicPayment(req, res) {
  return apiResponse.success(res, await campaignService.processPublicPayment(req.params.id, req.body, req), 'Payment confirmed successfully. Campaign is cleared for broadcast launch.');
}
```

<a id="post-api-v1-campaigns-id-record-offline-payment"></a>
## POST /api/v1/campaigns/:id/record-offline-payment

```javascript
async function recordOfflinePayment(req, res) {
  return apiResponse.success(
    res,
    await campaignService.recordOfflinePayment(req.params.id, req.body, req),
    'Offline payment recorded successfully. Campaign is marked as paid.'
  );
}
```

<a id="post-api-v1-campaigns-id-reject"></a>
## POST /api/v1/campaigns/:id/reject

```javascript
async function rejectCampaign(req, res) {
  const { reason } = req.body || {};
  return apiResponse.success(res, await campaignService.rejectCampaign(req.params.id, reason, req), 'Campaign rejected.');
}
```

<a id="get-api-v1-campaigns-id-reviews"></a>
## GET /api/v1/campaigns/:id/reviews

```javascript
async function listCampaignReviews(req, res) {
  // Ownership: resolve campaign and ensure caller owns it (unless admin).
  const campaign = await campaignService.getById(req.params.id);
  const roleCode = typeof req.user?.role === 'object' ? req.user.role.code : req.user?.role;
  const isAdmin = ['ROLE-SUPER-ADMIN', 'ROLE-ADMIN'].includes(roleCode) || req.isPlatformScope;
  if (!isAdmin) {
    const adv = await db.Advertiser.findOne({ where: { user_id: req.user.id } });
    if (!adv || Number(adv.id) !== Number(campaign.advertiser_id)) {
      throw new AppError('AUTH_FORBIDDEN', 'You do not own this campaign.');
    }
  }
  const data = await reviewService.listForCampaign(campaign.id);
  return apiResponse.success(res, data);
}
```

<a id="post-api-v1-campaigns-id-share-payment-link"></a>
## POST /api/v1/campaigns/:id/share-payment-link

```javascript
async function sharePaymentLink(req, res) {
  return apiResponse.success(res, await campaignService.sharePaymentLink(req.params.id, req.body, req), 'Payment link dispatched successfully.');
}
```

<a id="post-api-v1-campaigns-id-start"></a>
## POST /api/v1/campaigns/:id/start

```javascript
async function startCampaign(req, res) {
  return apiResponse.success(res, await campaignService.startCampaign(req.params.id, req), 'Campaign started successfully. Broadcast live on transit screens.');
}
```

<a id="post-api-v1-campaigns-id-stop"></a>
## POST /api/v1/campaigns/:id/stop

```javascript
async function stopCampaign(req, res) {
  return apiResponse.success(res, await campaignService.stopCampaign(req.params.id, req), 'Campaign paused. Broadcast stopped on transit screens.');
}
```

<a id="post-api-v1-campaigns-id-submit"></a>
## POST /api/v1/campaigns/:id/submit

```javascript
async function submitCampaign(req, res) {
  return apiResponse.success(res, await campaignService.submitForApproval(req.params.id, req), 'Campaign submitted for approval.');
}
```

<a id="post-api-v1-campaigns-id-verify"></a>
## POST /api/v1/campaigns/:id/verify

```javascript
async function verifyCampaign(req, res) {
  return apiResponse.success(res, await campaignService.verifyCampaign(req.params.id, req.user.id, req), 'Campaign verified. Payment link dispatched.');
}
```

<a id="get-api-v1-campaigns-advertisers"></a>
## GET /api/v1/campaigns/advertisers

```javascript
async function listAdvertisers(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status && req.query.status !== 'All') {
    let s = req.query.status.toLowerCase();
    if (s === 'deactivated' || s === 'inactive') s = 'suspended';
    where.status = s;
  }
  if (req.query.search) {
    const s = `%${req.query.search}%`;
    where[Op.or] = [
      { name: { [Op.like]: s } },
      { company_name: { [Op.like]: s } },
      { contact_name: { [Op.like]: s } },
      { email: { [Op.like]: s } },
      { code: { [Op.like]: s } },
      { phone: { [Op.like]: s } },
    ];
  }
  const include = [
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }] : []),
    ...(db.Campaign ? [{ model: db.Campaign, as: 'campaigns', attributes: ['id', 'title', 'status', 'budget'] }] : []),
  ];
  const [result, totalAll, totalActive, totalSuspended, totalVerified] = await Promise.all([
    db.Advertiser.findAndCountAll({
      where,
      include,
      order: [['id', 'DESC']],
      limit,
      offset,
    }),
    db.Advertiser.count(),
    db.Advertiser.count({ where: { status: 'active' } }),
    db.Advertiser.count({ where: { status: 'suspended' } }),
    db.Advertiser.count({ where: { verified: true } }),
  ]);
  const { rows, count } = result;
  rows.forEach((adv) => {
    adv.setDataValue('avatar_url', adv.user?.avatar_url || null);
    adv.setDataValue('logo_url', adv.user?.avatar_url || null);
  });
  const meta = buildMeta(page, limit, count);
  meta.stats = {
    total: totalAll,
    active: totalActive,
    suspended: totalSuspended,
    verified: totalVerified,
  };
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-campaigns-advertisers"></a>
## POST /api/v1/campaigns/advertisers

```javascript
async function createAdvertiser(req, res) {
  const data = req.body || {};
  const contactName = (data.name || data.contact_name || '').trim();
  if (!contactName) throw new AppError('VALIDATION_FAILED', 'Contact person name is required.');

  // Commercial advertisers operate directly under SuperAdmin, so Company Name is optional
  const companyName = (data.companyName || data.company_name || '').trim() || null;
  const advertiserDisplayName = companyName || contactName;

  const email = (data.email || '').toLowerCase().trim();
  const phone = data.phone ? String(data.phone).trim() : null;
  const plainPassword = data.password || 'Adv@12345';

  if (!email) throw new AppError('VALIDATION_FAILED', 'Email address is required for advertiser account.');
  if (!phone) throw new AppError('VALIDATION_FAILED', 'Mobile phone number is required for advertiser account.');

  const result = await db.sequelize.transaction(async (t) => {
    // 1. Strictly enforce email and mobile uniqueness across the platform
    await assertUniqueCredentials({ email, phone, transaction: t });

    let role = await db.Role.findOne({ where: { code: 'ROLE-ADVERTISER' }, transaction: t });
    const avatarToSet = data.avatar_url || data.logo_url || data.avatarUrl || data.logoUrl || null;
    const passwordHash = await db.User.hashPassword(plainPassword);
    const enrollmentNo = await generateEnrollmentNo(db.sequelize, 'ROLE-ADVERTISER', t);

    const user = await db.User.create({
      code: newUserCode(),
      name: contactName,
      email,
      phone,
      password_hash: passwordHash,
      role_id: role ? role.id : null,
      department: data.designation || null,
      avatar_url: avatarToSet,
      status: 'active',
      enrollment_no: enrollmentNo,
    }, { transaction: t });

    // 2. Create Advertiser with Location & Designation Fields
    const advCode = `ADV-${Date.now().toString(36).toUpperCase()}`;
    const advertiser = await db.Advertiser.create({
      code: advCode,
      name: advertiserDisplayName,
      company_name: companyName,
      business_type: data.category || data.brand_vertical || data.business_type || data.businessType || 'Commercial Brand',
      contact_name: contactName,
      designation: data.designation || null,
      email: email || user.email,
      phone: phone || user.phone,
      gstin: data.gstin || data.gst_number || null,
      pan: data.pan || data.pan_number || null,
      address: data.address || data.billing_address || data.billingAddress || null,
      city: data.city || null,
      state: data.state || null,
      pincode: data.pincode || null,
      country: data.country || 'India',
      place_id: data.place_id || data.placeId || null,
      latitude: data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null,
      longitude: data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null,
      website: data.website || null,
      billing_email: data.billingEmail || data.billing_email || email || user.email,
      payment_terms: data.paymentTerms || data.payment_terms || 'Prepaid Wallet',
      wallet_balance: Number(data.initialWallet || data.wallet_balance || 0),
      verified: true,
      account_status: 'approved',
      status: data.status || 'active',
      user_id: user.id,
    }, { transaction: t });

    // 3. Assign Direct Advertiser Permissions in user_permissions
    if (db.UserPermission && db.Permission) {
      const ADVERTISER_PERMS = [
        'dashboard.view',
        'advertiser.dashboard.view',
        'campaigns.view', 'campaigns.create', 'campaigns.update', 'campaigns.delete', 'campaigns.submit', 'campaigns.pay',
        'campaigns.analytics.view',
        'finance.invoices.view', 'finance.payments.view',
        'billing.invoices.view', 'billing.subscriptions.view', 'billing.transactions.view',
        'reports.view', 'reports.export', 'reports.generate',
        'support.view', 'support.manage',
        'activity.view',
        'uploads.manage',
      ];
      const permissions = await db.Permission.findAll({
        where: { key: { [Op.in]: ADVERTISER_PERMS } },
        transaction: t,
      });
      if (permissions && permissions.length > 0) {
        await db.UserPermission.destroy({ where: { user_id: user.id }, transaction: t });
        for (const p of permissions) {
          await db.UserPermission.create({ user_id: user.id, permission_id: p.id }, { transaction: t });
        }
      }
    }

    // 4. Attach documents
    if (db.MediaAsset && Array.isArray(data.documents) && data.documents.length > 0) {
      for (const doc of data.documents) {
        await db.MediaAsset.create({
          owner_type: 'advertiser',
          owner_id: advertiser.id,
          purpose: doc.purpose || 'Identity / Business Proof',
          storage_key: doc.key || null,
          url: doc.url,
          mime: doc.fileType || doc.mime || null,
          size: doc.fileSize || doc.size || null,
          status: 'available',
          uploaded_by: req.user?.id || null,
        }, { transaction: t });
      }
    }

    advertiser.setDataValue('avatar_url', avatarToSet);
    advertiser.setDataValue('logo_url', avatarToSet);
    if (user) advertiser.setDataValue('user', user);

    return { advertiser, user, role, avatarToSet };
  });

  const { advertiser, user, role } = result;

  // 5. Asynchronous Background Notification Dispatch (Queued in NotificationLog, processed via Cron/Worker)
  if (user) {
    const appUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
    const loginUrl = `${appUrl}/login`;
    const superAdminEmail = req.user?.email || 'root@vmovexa.com';
    const superAdminId = req.user?.id || null;

    try {
      const notificationLogService = require('../../services/notificationLog.service');

      // A. Queue In-App notification for the new Advertiser
      await notificationLogService.enqueueNotification({
        userId: user.id,
        recipient: user.email || user.phone || 'Advertiser',
        channel: 'in_app',
        eventKey: 'user_welcome_credentials',
        title: 'Welcome to VMOVEXA! Advertiser Account Ready',
        body: `Welcome ${user.name}! Your Commercial Advertiser account has been provisioned. Enrollment ID: ${user.enrollment_no}. You can now create and launch transit display ad campaigns.`,
        metadata: {
          severity: 'info',
          data: { enrollmentNo: user.enrollment_no, email: user.email, advertiserId: advertiser.id },
        },
      });

      // B. Queue SMS with login credentials if phone number provided (DB template + fallback)
      if (user.phone) {
        const smsSvc = require('../../services/sms.service');
        const tplSms = smsSvc.renderTemplateByCode
          ? await smsSvc.renderTemplateByCode('user_welcome_credentials', {
              user_name: user.name,
              role_name: role?.name || 'Advertiser',
              user_email: user.email,
              temporary_password: plainPassword,
            })
          : null;
        await notificationLogService.enqueueNotification({
          userId: user.id,
          recipient: user.phone,
          channel: 'sms',
          eventKey: 'user_welcome_credentials',
          title: 'Advertiser Account Credentials SMS',
          body: tplSms || `[VMOVEXA] Welcome ${user.name}! Your Advertiser account is ready. Enrollment: ${user.enrollment_no}, Login: ${user.email}, Pass: ${plainPassword}. Login: ${loginUrl}`,
        });
      }

      // C. Send Branded HTML Email with login credentials & SuperAdmin notification
      if (user.email) {
        const emailService = require('../../services/email.service');
        await emailService.sendUserProvisioningEmails({
          user,
          role: role || { name: 'Commercial Advertiser', code: 'ROLE-ADVERTISER' },
          password: plainPassword,
          superAdminEmail,
        }).catch((emailErr) => {
          logger.notification?.warn(`Direct email dispatch warning for advertiser ${user.email}: ${emailErr.message}`);
        });
      }

      // D. Queue In-App & WebSocket Notification to SuperAdmin
      if (superAdminId) {
        await notificationLogService.enqueueNotification({
          userId: superAdminId,
          recipient: superAdminEmail,
          channel: 'in_app',
          eventKey: 'user_provisioned_superadmin',
          title: 'New Commercial Advertiser Onboarded',
          body: `Commercial Advertiser "${advertiser.name}" (${advertiser.code}) was onboarded successfully. Credentials dispatched via Email & SMS.`,
          metadata: {
            severity: 'info',
            data: { advertiserId: advertiser.id, code: advertiser.code, userId: user.id },
          },
        });
      }

      // Trigger background worker tick immediately
      setImmediate(() => {
        notificationLogService.processPendingNotifications().catch((err) => {
          logger.notification?.warn(`Background notification queue error: ${err.message}`);
        });
      });
    } catch (notifErr) {
      console.warn(`Advertiser onboarding notification queuing warning: ${notifErr.message}`);
    }
  }

  return apiResponse.created(res, advertiser, 'Commercial advertiser onboarded successfully.');
}
```

<a id="delete-api-v1-campaigns-advertisers-id"></a>
## DELETE /api/v1/campaigns/advertisers/:id

```javascript
async function deleteAdvertiser(req, res) {
  const advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  // Delete attached media assets
  if (db.MediaAsset) {
    await db.MediaAsset.destroy({
      where: { owner_type: 'advertiser', owner_id: advertiser.id },
      force: true,
    }).catch(() => {});
  }

  // Delete linked user completely from user table
  if (advertiser.user_id && db.User) {
    const user = await db.User.findByPk(advertiser.user_id);
    if (user) {
      try {
        await emailService.sendAccountDeletedEmail({ user });
      } catch (_) {}
      const tokenService = require('../auth/token.service');
      await tokenService.revokeAllForUser(user.id).catch(() => {});
      await user.destroy({ force: true }).catch(() => user.destroy());
    }
  }

  await advertiser.destroy({ force: true }).catch(() => advertiser.destroy());
  return apiResponse.success(res, { ok: true }, 'Commercial advertiser deleted successfully.');
}
```

<a id="get-api-v1-campaigns-advertisers-id"></a>
## GET /api/v1/campaigns/advertisers/:id

```javascript
async function getAdvertiser(req, res) {
  const include = [
    { model: db.Campaign, as: 'campaigns' },
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'department', 'created_at'] }] : []),
  ];
  let a = null;
  const advId = req.params.id;
  if (!isNaN(Number(advId))) {
    a = await db.Advertiser.findByPk(Number(advId), { include });
    if (!a) {
      a = await db.Advertiser.findOne({ where: { user_id: Number(advId) }, include });
    }
  } else {
    a = await db.Advertiser.findOne({
      where: { [Op.or]: [{ code: advId }, { email: advId }] },
      include,
    });
  }
  if (!a) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  if (db.MediaAsset) {
    const docs = await db.MediaAsset.findAll({
      where: {
        owner_type: 'advertiser',
        owner_id: a.id,
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    a.setDataValue('documents', docs);
  }
  a.setDataValue('brand_vertical', a.business_type);
  a.setDataValue('gst_number', a.gstin);
  a.setDataValue('pan_number', a.pan);
  a.setDataValue('billing_address', a.address);
  a.setDataValue('logo_url', a.user?.avatar_url || null);
  a.setDataValue('avatar_url', a.user?.avatar_url || null);
  return apiResponse.success(res, a);
}
```

<a id="patch-api-v1-campaigns-advertisers-id"></a>
## PATCH /api/v1/campaigns/advertisers/:id

```javascript
async function updateAdvertiser(req, res) {
  const advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const data = req.body || {};
  const patch = {};
  ['name', 'company_name', 'business_type', 'contact_name', 'designation', 'email', 'phone', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'country', 'place_id', 'website', 'billing_email', 'payment_terms', 'status', 'account_status'].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });
  if (data.companyName !== undefined) patch.company_name = data.companyName ? data.companyName.trim() : null;
  // Frontend sends `name` as the authorized officer name (maps to contact_name)
  if (data.name !== undefined) patch.contact_name = data.name;
  const newDisplayName = (patch.company_name !== undefined ? patch.company_name : advertiser.company_name)
    || (patch.contact_name !== undefined ? patch.contact_name : advertiser.contact_name)
    || advertiser.name;
  if (newDisplayName) patch.name = newDisplayName;
  if (data.category !== undefined || data.brand_vertical !== undefined) patch.business_type = data.category || data.brand_vertical;
  if (data.gst_number !== undefined) patch.gstin = data.gst_number;
  if (data.pan_number !== undefined) patch.pan = data.pan_number;
  if (data.billing_address !== undefined || data.billingAddress !== undefined) patch.address = data.billing_address || data.billingAddress;
  if (data.billingEmail !== undefined) patch.billing_email = data.billingEmail;
  if (data.paymentTerms !== undefined) patch.payment_terms = data.paymentTerms;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  if (data.latitude !== undefined) patch.latitude = data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null;
  if (data.longitude !== undefined) patch.longitude = data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null;
  if (data.walletBalance !== undefined || data.wallet_balance !== undefined) {
    patch.wallet_balance = Number(data.walletBalance ?? data.wallet_balance);
  }

  if (Object.keys(patch).length > 0) {
    await advertiser.update(patch);
  }

  // Update linked user if needed
  let newAvatar = data.avatar_url ?? data.logo_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (advertiser.user_id && db.User) {
    linkedUser = await db.User.findByPk(advertiser.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newAvatar !== undefined) userPatch.avatar_url = newAvatar || null;
      if (data.name) userPatch.name = data.name;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (data.designation !== undefined) userPatch.department = data.designation || null;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'user_updated',
          title: 'Account Details Updated',
          body: 'Your advertiser profile details have been updated by Super Admin.',
          severity: 'info',
        });
        await emailService.sendProfileUpdatedEmail({ user: linkedUser });
      } catch (_) {}
    }
  }

  // Handle new documents
  const newDocs = data.newDocuments || (Array.isArray(data.documents) ? data.documents.filter((d) => !d.id) : []);
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      await db.MediaAsset.create({
        owner_type: 'advertiser',
        owner_id: advertiser.id,
        purpose: doc.purpose || 'Business Document',
        storage_key: doc.key || null,
        url: doc.url,
        mime: doc.fileType || doc.mime || null,
        size: doc.fileSize || doc.size || null,
        status: 'available',
        uploaded_by: req.user?.id || null,
      });
    }
  }

  // Handle removed documents
  if (db.MediaAsset && Array.isArray(data.removedDocumentIds) && data.removedDocumentIds.length > 0) {
    await db.MediaAsset.destroy({
      where: {
        id: { [Op.in]: data.removedDocumentIds },
        owner_type: 'advertiser',
        owner_id: advertiser.id,
      },
    });
  }

  const currentAvatar = newAvatar || advertiser.user?.avatar_url || null;
  advertiser.setDataValue('avatar_url', currentAvatar);
  advertiser.setDataValue('logo_url', currentAvatar);
  return apiResponse.success(res, advertiser, 'Commercial advertiser updated successfully.');
}
```

<a id="put-api-v1-campaigns-advertisers-id"></a>
## PUT /api/v1/campaigns/advertisers/:id

```javascript
async function updateAdvertiser(req, res) {
  const advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const data = req.body || {};
  const patch = {};
  ['name', 'company_name', 'business_type', 'contact_name', 'designation', 'email', 'phone', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'country', 'place_id', 'website', 'billing_email', 'payment_terms', 'status', 'account_status'].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });
  if (data.companyName !== undefined) patch.company_name = data.companyName ? data.companyName.trim() : null;
  // Frontend sends `name` as the authorized officer name (maps to contact_name)
  if (data.name !== undefined) patch.contact_name = data.name;
  const newDisplayName = (patch.company_name !== undefined ? patch.company_name : advertiser.company_name)
    || (patch.contact_name !== undefined ? patch.contact_name : advertiser.contact_name)
    || advertiser.name;
  if (newDisplayName) patch.name = newDisplayName;
  if (data.category !== undefined || data.brand_vertical !== undefined) patch.business_type = data.category || data.brand_vertical;
  if (data.gst_number !== undefined) patch.gstin = data.gst_number;
  if (data.pan_number !== undefined) patch.pan = data.pan_number;
  if (data.billing_address !== undefined || data.billingAddress !== undefined) patch.address = data.billing_address || data.billingAddress;
  if (data.billingEmail !== undefined) patch.billing_email = data.billingEmail;
  if (data.paymentTerms !== undefined) patch.payment_terms = data.paymentTerms;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  if (data.latitude !== undefined) patch.latitude = data.latitude != null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : null;
  if (data.longitude !== undefined) patch.longitude = data.longitude != null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : null;
  if (data.walletBalance !== undefined || data.wallet_balance !== undefined) {
    patch.wallet_balance = Number(data.walletBalance ?? data.wallet_balance);
  }

  if (Object.keys(patch).length > 0) {
    await advertiser.update(patch);
  }

  // Update linked user if needed
  let newAvatar = data.avatar_url ?? data.logo_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (advertiser.user_id && db.User) {
    linkedUser = await db.User.findByPk(advertiser.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newAvatar !== undefined) userPatch.avatar_url = newAvatar || null;
      if (data.name) userPatch.name = data.name;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (data.designation !== undefined) userPatch.department = data.designation || null;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'user_updated',
          title: 'Account Details Updated',
          body: 'Your advertiser profile details have been updated by Super Admin.',
          severity: 'info',
        });
        await emailService.sendProfileUpdatedEmail({ user: linkedUser });
      } catch (_) {}
    }
  }

  // Handle new documents
  const newDocs = data.newDocuments || (Array.isArray(data.documents) ? data.documents.filter((d) => !d.id) : []);
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      await db.MediaAsset.create({
        owner_type: 'advertiser',
        owner_id: advertiser.id,
        purpose: doc.purpose || 'Business Document',
        storage_key: doc.key || null,
        url: doc.url,
        mime: doc.fileType || doc.mime || null,
        size: doc.fileSize || doc.size || null,
        status: 'available',
        uploaded_by: req.user?.id || null,
      });
    }
  }

  // Handle removed documents
  if (db.MediaAsset && Array.isArray(data.removedDocumentIds) && data.removedDocumentIds.length > 0) {
    await db.MediaAsset.destroy({
      where: {
        id: { [Op.in]: data.removedDocumentIds },
        owner_type: 'advertiser',
        owner_id: advertiser.id,
      },
    });
  }

  const currentAvatar = newAvatar || advertiser.user?.avatar_url || null;
  advertiser.setDataValue('avatar_url', currentAvatar);
  advertiser.setDataValue('logo_url', currentAvatar);
  return apiResponse.success(res, advertiser, 'Commercial advertiser updated successfully.');
}
```

<a id="patch-api-v1-campaigns-advertisers-id-status"></a>
## PATCH /api/v1/campaigns/advertisers/:id/status

```javascript
async function setAdvertiserStatus(req, res) {
  let advertiser = await db.Advertiser.findByPk(req.params.id);
  if (!advertiser) {
    // Fallback: look up by user_id if frontend passed user id
    advertiser = await db.Advertiser.findOne({ where: { user_id: req.params.id } });
  }
  if (!advertiser) throw new AppError('NOT_FOUND', 'Commercial advertiser not found.');

  const rawStatus = req.body.status;
  if (!rawStatus) throw new AppError('VALIDATION_FAILED', 'Status is required.');

  // Normalize status for database ENUM ('pending_approval', 'approved', 'active', 'rejected', 'suspended')
  const isDeactivating = rawStatus === 'suspended' || rawStatus === 'deactivated' || rawStatus === 'inactive';
  const targetAdvStatus = isDeactivating ? 'suspended' : 'active';
  const targetUserStatus = isDeactivating ? 'suspended' : 'active';

  await advertiser.update({ status: targetAdvStatus });
  if (advertiser.user_id && db.User) {
    const user = await db.User.findByPk(advertiser.user_id);
    if (user) {
      await user.update({ status: targetUserStatus });
      if (isDeactivating) {
        const tokenService = require('../auth/token.service');
        await tokenService.revokeAllForUser(user.id).catch(() => {});
      }

      // 3-Channel Notification Dispatch for Status Toggle
      try {
        const statusTitle = isDeactivating ? 'Account Deactivated' : 'Account Activated';
        const statusBody = isDeactivating 
          ? 'Your advertiser account has been deactivated by Super Admin.' 
          : 'Your advertiser account has been activated and restored by Super Admin.';

        await notificationService.send({
          userId: user.id,
          eventKey: 'user_status_changed',
          title: statusTitle,
          body: statusBody,
          severity: isDeactivating ? 'critical' : 'info',
          bypassQuietHours: isDeactivating,
        });

        await emailService.sendAccountStatusEmail({ user, status: isDeactivating ? 'deactivated' : 'active' });
      } catch (_) {}
    }
  }

  // Reload to return fresh user association data
  if (db.User) {
    await advertiser.reload({
      include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }],
    });
  }

  return apiResponse.success(res, advertiser, `Advertiser account ${isDeactivating ? 'deactivated' : 'activated'} successfully.`);
}
```

<a id="get-api-v1-campaigns-analytics"></a>
## GET /api/v1/campaigns/analytics

```javascript
async function campaignOverviewAnalytics(req, res) {
  return apiResponse.success(res, await campaignService.overviewAnalytics(req));
}
```

<a id="get-api-v1-campaigns-analytics-overview"></a>
## GET /api/v1/campaigns/analytics/overview

```javascript
async function campaignOverviewAnalytics(req, res) {
  return apiResponse.success(res, await campaignService.overviewAnalytics(req));
}
```

<a id="get-api-v1-campaigns-fleet-options"></a>
## GET /api/v1/campaigns/fleet-options

```javascript
async function getAvailableFleets(req, res) {
  return apiResponse.success(res, await campaignService.getAvailableFleets());
}
```

<a id="get-api-v1-campaigns-government"></a>
## GET /api/v1/campaigns/government

```javascript
async function listGovernment(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status && req.query.status !== 'All') {
    where.status = req.query.status;
  }
  if (req.query.search) {
    const s = `%${req.query.search}%`;
    where[Op.or] = [
      { name: { [Op.like]: s } },
      { agency_name: { [Op.like]: s } },
      { department: { [Op.like]: s } },
      { contact_name: { [Op.like]: s } },
      { email: { [Op.like]: s } },
      { phone: { [Op.like]: s } },
      { code: { [Op.like]: s } },
      { jurisdiction: { [Op.like]: s } },
      { authorized_city: { [Op.like]: s } },
      { city: { [Op.like]: s } },
      { state: { [Op.like]: s } },
      { pincode: { [Op.like]: s } },
      { address: { [Op.like]: s } },
    ];
  }
  const include = [
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }] : []),
    ...(db.EmergencyBroadcast ? [{ model: db.EmergencyBroadcast, as: 'broadcasts', attributes: ['id', 'title', 'severity', 'created_at'] }] : []),
  ];
  const [result, totalAll, totalActive, totalSuspended, totalPending, totalEmergency] = await Promise.all([
    db.GovernmentAgency.findAndCountAll({
      where,
      include,
      order: [['id', 'DESC']],
      limit,
      offset,
    }),
    db.GovernmentAgency.count(),
    db.GovernmentAgency.count({ where: { status: 'active' } }),
    db.GovernmentAgency.count({ where: { status: 'suspended' } }),
    db.GovernmentAgency.count({ where: { status: 'pending_approval' } }),
    db.GovernmentAgency.count({
      where: {
        [Op.or]: [
          { clearance_level: { [Op.like]: '%emergency%' } },
          { clearance_level: { [Op.like]: '%override%' } },
        ],
      },
    }),
  ]);
  const { rows, count } = result;
  rows.forEach((gov) => {
    gov.setDataValue('avatar_url', gov.user?.avatar_url || null);
    gov.setDataValue('logo_url', gov.user?.avatar_url || null);
    gov.setDataValue('emblem_url', gov.user?.avatar_url || null);
  });
  const meta = buildMeta(page, limit, count);
  meta.stats = {
    total: totalAll,
    active: totalActive,
    suspended: totalSuspended,
    pending: totalPending,
    emergency: totalEmergency,
  };
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-campaigns-government"></a>
## POST /api/v1/campaigns/government

```javascript
async function createGovernment(req, res) {
  const data = req.body || {};
  const agencyName = data.agencyName || data.agency_name || data.name;
  if (!agencyName) throw new AppError('VALIDATION_FAILED', 'Agency/Authority name is required.');

  const email = (data.email || '').toLowerCase().trim();
  const phone = data.phone ? String(data.phone).trim() : null;
  const contactName = data.name || data.contact_name || agencyName;
  const rawPassword = data.password || 'Gov@12345';

  if (!email) throw new AppError('VALIDATION_FAILED', 'Nodal officer email address is required.');
  if (!phone) throw new AppError('VALIDATION_FAILED', 'Nodal officer mobile phone number is required.');

  const address = data.address || data.officeAddress || data.office_address || null;
  const city = data.city || data.authorizedCity || data.authorized_city || null;
  const state = data.state || null;
  const pincode = data.pincode || null;
  const country = data.country || 'India';
  const placeId = data.placeId || data.place_id || null;
  const rawLat = data.latitude !== undefined ? data.latitude : data.lat;
  const rawLng = data.longitude !== undefined ? data.longitude : data.lng;
  const latitude = rawLat !== '' && rawLat != null && !isNaN(Number(rawLat)) ? Number(rawLat) : null;
  const longitude = rawLng !== '' && rawLng != null && !isNaN(Number(rawLng)) ? Number(rawLng) : null;
  const department = data.department || null;
  const clearanceLevel = data.clearanceLevel || data.clearance_level
    ? String(data.clearanceLevel || data.clearance_level).substring(0, 40)
    : null;

  let role = null;
  let createdAgency = null;
  let createdUser = null;

  await db.sequelize.transaction(async (t) => {
    // 1. Strictly enforce email and mobile uniqueness across the platform
    await assertUniqueCredentials({ email, phone, transaction: t });

    role = await db.Role.findOne({ where: { code: 'ROLE-GOVT-AGENCY' }, transaction: t });
    const emblemToSet = data.avatar_url || data.logo_url || data.emblem_url || data.avatarUrl || data.logoUrl || null;
    const passwordHash = await db.User.hashPassword(rawPassword);
    const enrollmentNo = await generateEnrollmentNo(db.sequelize, 'ROLE-GOVT-AGENCY', t);

    const user = await db.User.create({
      code: newUserCode(),
      name: contactName,
      email,
      phone,
      password_hash: passwordHash,
      role_id: role ? role.id : null,
      avatar_url: emblemToSet,
      status: 'active',
      enrollment_no: enrollmentNo,
      department,
      clearance: clearanceLevel,
      address,
      city,
      state,
      pincode,
      country,
      place_id: placeId,
      latitude,
      longitude,
    }, { transaction: t });

    // 2. Create Government Agency
    const govCode = `GOV-${Date.now().toString(36).toUpperCase()}`;
    const agency = await db.GovernmentAgency.create({
      code: govCode,
      name: agencyName,
      agency_name: agencyName,
      department,
      contact_name: contactName,
      email: email || user.email,
      phone: phone || user.phone,
      office_address: address,
      address,
      city,
      state,
      pincode,
      country,
      place_id: placeId,
      latitude,
      longitude,
      jurisdiction: data.jurisdiction || null,
      authorized_city: city,
      clearance_level: clearanceLevel,
      status: data.status || 'active',
      user_id: user.id,
    }, { transaction: t });

    // 3. Attach documents
    if (db.MediaAsset && Array.isArray(data.documents) && data.documents.length > 0) {
      for (const doc of data.documents) {
        const docUrl = doc.url || doc.filePath || doc.file_url || (typeof doc === 'string' ? doc : null);
        if (docUrl) {
          const rawPurpose = doc.category || doc.purpose || 'Official Authorization Letter';
          const safePurpose = String(rawPurpose).substring(0, 80);
          const storageKey = doc.storage_key || doc.key || doc.fileName || doc.name || null;
          await db.MediaAsset.create({
            owner_type: 'government',
            owner_id: agency.id,
            purpose: safePurpose,
            storage_key: storageKey,
            url: docUrl,
            mime: doc.type || doc.fileType || doc.mime || null,
            size: parseDocSize(doc.size || doc.fileSize),
            status: 'available',
            uploaded_by: req.user?.id || null,
          }, { transaction: t });
        }
      }
    }

    if (db.MediaAsset) {
      const docs = await db.MediaAsset.findAll({
        where: {
          owner_type: 'government',
          owner_id: agency.id,
          status: 'available',
        },
        order: [['id', 'DESC']],
      }, { transaction: t });
      const formattedDocs = docs.map((d) => {
        const plain = typeof d.toJSON === 'function' ? d.toJSON() : d;
        return {
          ...plain,
          file_name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
          name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
          category: plain.purpose || 'Department Authorization Letter',
        };
      });
      agency.setDataValue('documents', formattedDocs);
    }

    agency.setDataValue('avatar_url', emblemToSet);
    agency.setDataValue('logo_url', emblemToSet);
    agency.setDataValue('emblem_url', emblemToSet);
    if (user) agency.setDataValue('user', user);

    createdAgency = agency;
    createdUser = user;
  });

  // Post-transaction Audit Activity Log
  const ActivityLogger = require('../../utils/ActivityLogger');
  ActivityLogger.log({
    logName: 'GOVERNMENT',
    event: 'created',
    description: `Government agency "${createdAgency.name}" authorized (${createdAgency.code})`,
    subject: { type: 'GovernmentAgency', id: createdAgency.id },
    causer: req?.user ? { type: 'User', id: req.user.id } : null,
    severity: 'INFO',
    properties: {
      agencyId: createdAgency.id,
      code: createdAgency.code,
      name: createdAgency.name,
      email: createdAgency.email,
      phone: createdAgency.phone,
      department: createdAgency.department,
      clearanceLevel: createdAgency.clearance_level,
      city: createdAgency.city,
      address: createdAgency.address,
    },
  }).catch(() => {});

  // Post-transaction Multi-Channel Notification Dispatch (Non-blocking queue)
  setImmediate(async () => {
    try {
      const notificationLogService = require('../../services/notificationLog.service');
      const smsService = require('../../services/sms.service');
      const effectiveSuperAdminEmail = req?.user?.email || process.env.ROOT_ADMIN_EMAIL || 'root@vmovexa.com';

      // 1. In-app notification for the newly authorized agency user
      if (createdUser) {
        await notificationService.send({
          userId: createdUser.id,
          eventKey: 'government_agency_onboarded',
          title: 'Welcome to VMOVEXA Government Desk',
          body: `Government Agency "${createdAgency.name}" has been authorized (${createdAgency.code}) with ${createdAgency.clearance_level || 'Public Safety Clearance'}.`,
          severity: 'info',
          skipEmail: true,
          data: { agencyId: createdAgency.id, enrollmentNo: createdUser.enrollment_no, code: createdAgency.code },
        }).catch(() => {});
      }

      // 2. In-app notification for all active Super Admins
      const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
      if (superAdminRole) {
        const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
        for (const sa of superAdmins) {
          await notificationService.send({
            userId: sa.id,
            eventKey: 'government_authorized',
            title: `Government Agency Authorized: ${createdAgency.name}`,
            body: `${createdAgency.name} (${createdAgency.department || 'Public Safety'}) authorized by Super Admin.`,
            severity: 'info',
            skipEmail: true,
            data: { agencyId: createdAgency.id, enrollmentNo: createdUser?.enrollment_no, code: createdAgency.code },
          }).catch(() => {});
        }
      }

      // 3. Branded welcome & credentials email (Queued in NotificationLog for reliable background delivery)
      if (createdUser?.email) {
        await notificationLogService.enqueueNotification({
          userId: createdUser.id,
          recipient: createdUser.email,
          channel: 'email',
          eventKey: 'government_authorized',
          title: `Government Authority Credentials: ${createdAgency.name}`,
          body: `Public Safety Agency "${createdAgency.name}" authorized. Official access keys provisioned for ${createdUser.email}.`,
          metadata: {
            action: 'provisioning_email',
            payload: {
              user: createdUser,
              role: role || { name: 'Government Agency', code: 'ROLE-GOVT-AGENCY' },
              password: rawPassword,
              creator: req?.user,
              superAdminEmail: effectiveSuperAdminEmail,
            },
          },
        }).catch(() => {});

        // Safely trigger queue drain immediately
        notificationLogService.processPendingNotifications().catch(() => {});
      }

      // 4. SMS Notification (DB-managed template, respects ENABLE_LIVE_SMS vs Log-Only)
      if (createdUser?.phone && smsService?.sendSms) {
        const tplMsg = smsService.renderTemplateByCode
          ? await smsService.renderTemplateByCode('gov_agency_authorized', {
              agency_name: createdAgency.name,
              login_id: createdUser.email || createdUser.enrollment_no,
            })
          : null;
        await smsService.sendSms({
          to: createdUser.phone,
          message: tplMsg || `VMOVEXA Gov Portal: Your agency ${createdAgency.name} has been authorized. Login ID: ${createdUser.email || createdUser.enrollment_no}.`,
        }).catch(() => {});
      }
    } catch (_) {}
  });

  const plainAgency = typeof createdAgency.toJSON === 'function' ? createdAgency.toJSON() : { ...createdAgency };
  if (db.MediaAsset) {
    const docs = await db.MediaAsset.findAll({
      where: {
        owner_type: 'government',
        owner_id: createdAgency.id,
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    plainAgency.documents = docs.map((d) => {
      const p = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...p,
        file_name: p.storage_key || p.purpose || `Doc #${p.id}`,
        name: p.storage_key || p.purpose || `Doc #${p.id}`,
        category: p.purpose || 'Department Authorization Letter',
      };
    });
  } else {
    plainAgency.documents = [];
  }
  return apiResponse.created(res, plainAgency, 'Government agency authorized successfully.');
}
```

<a id="delete-api-v1-campaigns-government-id"></a>
## DELETE /api/v1/campaigns/government/:id

```javascript
async function deleteGovernment(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const agencyName = agency.name || agency.agency_name;
  const agencyCode = agency.code;

  if (db.MediaAsset) {
    const StorageService = require('../../services/StorageService');
    const docs = await db.MediaAsset.findAll({
      where: { owner_type: 'government', owner_id: agency.id },
    });
    for (const d of docs) {
      if (d.storage_key) await StorageService.removeDocument(d.storage_key).catch(() => {});
      await d.destroy();
    }
  }

  if (agency.user_id && db.User) {
    const user = await db.User.findByPk(agency.user_id);
    if (user) {
      try {
        await emailService.sendAccountDeletedEmail({ user }).catch(() => {});
      } catch (_) {}
      const tokenService = require('../auth/token.service');
      await tokenService.revokeAllForUser(user.id).catch(() => {});
      await user.destroy({ force: true }).catch(() => user.destroy());
    }
  }

  await agency.destroy({ force: true }).catch(() => agency.destroy());

  // Audit Activity Log & Super Admin notification
  const ActivityLogger = require('../../utils/ActivityLogger');
  ActivityLogger.log({
    logName: 'GOVERNMENT',
    event: 'deleted',
    description: `Government agency "${agencyName}" (${agencyCode}) permanently deleted by Super Admin`,
    subject: { type: 'GovernmentAgency', id: agency.id },
    causer: req?.user ? { type: 'User', id: req.user.id } : null,
    severity: 'WARNING',
    properties: { agencyId: agency.id, agencyCode, agencyName },
  }).catch(() => {});

  const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
  if (superAdminRole) {
    const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
    for (const sa of superAdmins) {
      if (sa.id !== req.user?.id) {
        await notificationService.send({
          userId: sa.id,
          eventKey: 'government_deleted',
          title: `Government Agency Deleted: ${agencyName}`,
          body: `Government Agency "${agencyName}" (${agencyCode}) was permanently removed by Super Admin.`,
          severity: 'warning',
          skipEmail: true,
        }).catch(() => {});
      }
    }
  }

  return apiResponse.success(res, { ok: true }, 'Government agency deleted successfully.');
}
```

<a id="get-api-v1-campaigns-government-id"></a>
## GET /api/v1/campaigns/government/:id

```javascript
async function getGovernment(req, res) {
  const include = [
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }] : []),
    ...(db.EmergencyBroadcast ? [{ model: db.EmergencyBroadcast, as: 'broadcasts' }] : []),
    ...(db.Campaign ? [{ model: db.Campaign, as: 'campaigns' }] : []),
  ];
  let g = null;
  const govId = req.params.id;
  if (!isNaN(Number(govId))) {
    g = await db.GovernmentAgency.findByPk(Number(govId), { include });
    if (!g) {
      g = await db.GovernmentAgency.findOne({ where: { user_id: Number(govId) }, include });
    }
  } else {
    g = await db.GovernmentAgency.findOne({
      where: { [Op.or]: [{ code: govId }, { email: govId }] },
      include,
    });
  }
  if (!g) throw new AppError('NOT_FOUND', 'Government agency not found.');

  let formattedDocs = [];
  if (db.MediaAsset) {
    const docs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [g.id, g.user_id].filter(Boolean) },
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    formattedDocs = docs.map((d) => {
      const plainDoc = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...plainDoc,
        file_name: plainDoc.storage_key || plainDoc.purpose || `Doc #${plainDoc.id}`,
        name: plainDoc.storage_key || plainDoc.purpose || `Doc #${plainDoc.id}`,
        category: plainDoc.purpose || 'Department Authorization Letter',
      };
    });
  }

  const plain = typeof g.toJSON === 'function' ? g.toJSON() : { ...g };
  plain.documents = formattedDocs;
  plain.logo_url = g.user?.avatar_url || null;
  plain.emblem_url = g.user?.avatar_url || null;
  plain.avatar_url = g.user?.avatar_url || null;
  return apiResponse.success(res, plain);
}
```

<a id="patch-api-v1-campaigns-government-id"></a>
## PATCH /api/v1/campaigns/government/:id

```javascript
async function updateGovernment(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const data = req.body || {};
  const patch = {};
  [
    'agency_name', 'department', 'contact_name', 'email', 'phone',
    'office_address', 'address', 'city', 'state', 'pincode', 'country',
    'place_id', 'latitude', 'longitude', 'jurisdiction', 'authorized_city', 'status'
  ].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });

  const effectiveAgencyName = data.agencyName || data.agency_name;
  if (effectiveAgencyName) {
    patch.agency_name = effectiveAgencyName;
    patch.name = effectiveAgencyName;
  }

  const effectiveContactName = data.contactName || data.contact_name || data.name;
  if (effectiveContactName) {
    patch.contact_name = effectiveContactName;
  }
  if (data.officeAddress !== undefined) patch.office_address = data.officeAddress;
  if (data.authorizedCity !== undefined) patch.authorized_city = data.authorizedCity;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  const updateLat = data.latitude !== undefined ? data.latitude : data.lat;
  if (updateLat !== undefined) {
    patch.latitude = updateLat !== '' && updateLat != null && !isNaN(Number(updateLat)) ? Number(updateLat) : null;
  }
  const updateLng = data.longitude !== undefined ? data.longitude : data.lng;
  if (updateLng !== undefined) {
    patch.longitude = updateLng !== '' && updateLng != null && !isNaN(Number(updateLng)) ? Number(updateLng) : null;
  }
  if (data.clearanceLevel !== undefined || data.clearance_level !== undefined) {
    patch.clearance_level = String(data.clearanceLevel ?? data.clearance_level).substring(0, 40);
  }

  if (Object.keys(patch).length > 0) {
    await agency.update(patch);
  }

  // Update linked user if needed
  let newEmblem = data.avatar_url ?? data.logo_url ?? data.emblem_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (agency.user_id && db.User) {
    linkedUser = await db.User.findByPk(agency.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newEmblem !== undefined) userPatch.avatar_url = newEmblem || null;
      if (effectiveContactName) userPatch.name = effectiveContactName;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (patch.address !== undefined) userPatch.address = patch.address;
      if (patch.city !== undefined) userPatch.city = patch.city;
      if (patch.state !== undefined) userPatch.state = patch.state;
      if (patch.pincode !== undefined) userPatch.pincode = patch.pincode;
      if (patch.country !== undefined) userPatch.country = patch.country;
      if (patch.place_id !== undefined) userPatch.place_id = patch.place_id;
      if (patch.latitude !== undefined) userPatch.latitude = patch.latitude;
      if (patch.longitude !== undefined) userPatch.longitude = patch.longitude;
      if (patch.department !== undefined) userPatch.department = patch.department;
      if (patch.clearance_level !== undefined) userPatch.clearance = patch.clearance_level;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'government_agency_updated',
          title: 'Government Agency Profile Updated',
          body: 'Your government agency profile details have been updated by Super Admin.',
          severity: 'info',
          skipEmail: true,
          data: { agencyId: agency.id },
        });

        // In-app alert to active Super Admins
        const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
        if (superAdminRole) {
          const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
          for (const sa of superAdmins) {
            if (sa.id !== req.user?.id) {
              await notificationService.send({
                userId: sa.id,
                eventKey: 'government_agency_updated',
                title: `Government Profile Updated: ${agency.name}`,
                body: `${agency.name} details have been updated.`,
                severity: 'info',
                skipEmail: true,
              }).catch(() => {});
            }
          }
        }

        await emailService.sendProfileUpdatedEmail({ user: linkedUser }).catch(() => {});
      } catch (_) {}
    }
  }

  // 1. Handle removed documents FIRST (so new documents created below are not marked as removed)
  let toRemoveIds = data.removedDocumentIds || [];
  if (Array.isArray(data.documents) && toRemoveIds.length === 0) {
    const retainedIds = data.documents.map((d) => Number(d.id)).filter((id) => Boolean(id) && !isNaN(id));
    const currentDbDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
      attributes: ['id'],
    });
    toRemoveIds = currentDbDocs.map((d) => d.id).filter((id) => !retainedIds.includes(id));
  }

  if (db.MediaAsset && Array.isArray(toRemoveIds) && toRemoveIds.length > 0) {
    const StorageService = require('../../services/StorageService');
    const toRemove = await db.MediaAsset.findAll({
      where: {
        id: { [Op.in]: toRemoveIds },
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
    });
    for (const asset of toRemove) {
      if (asset.storage_key) {
        await StorageService.remove(asset.storage_key).catch(() => {});
        await StorageService.removeDocument(asset.storage_key).catch(() => {});
      }
      await asset.destroy().catch(() => {});
    }
  }

  // 2. Handle new documents AFTER removals
  let newDocs = data.newDocuments;
  if (!newDocs && Array.isArray(data.documents)) {
    newDocs = data.documents.filter((d) => !d.id || d.isPendingUpload);
  }
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      const docUrl = doc.url || doc.filePath || doc.file_url || (typeof doc === 'string' ? doc : null);
      if (docUrl) {
        const rawPurpose = doc.category || doc.purpose || 'Official Document';
        const safePurpose = String(rawPurpose).substring(0, 80);
        const storageKey = doc.storage_key || doc.key || doc.fileName || doc.name || null;
        await db.MediaAsset.create({
          owner_type: 'government',
          owner_id: agency.id,
          purpose: safePurpose,
          storage_key: storageKey,
          url: docUrl,
          mime: doc.type || doc.fileType || doc.mime || null,
          size: parseDocSize(doc.size || doc.fileSize),
          status: 'available',
          uploaded_by: req.user?.id || null,
        });
      }
    }
  }

  // Re-fetch all active documents and attach to returned agency
  let formattedDocs = [];
  if (db.MediaAsset) {
    const activeDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    formattedDocs = activeDocs.map((d) => {
      const plain = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...plain,
        file_name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        category: plain.purpose || 'Department Authorization Letter',
      };
    });
  }

  const currentEmblem = newEmblem || agency.user?.avatar_url || null;
  const plainAgency = typeof agency.toJSON === 'function' ? agency.toJSON() : { ...agency };
  plainAgency.documents = formattedDocs;
  plainAgency.avatar_url = currentEmblem;
  plainAgency.logo_url = currentEmblem;
  plainAgency.emblem_url = currentEmblem;
  return apiResponse.success(res, plainAgency, 'Government agency updated successfully.');
}
```

<a id="put-api-v1-campaigns-government-id"></a>
## PUT /api/v1/campaigns/government/:id

```javascript
async function updateGovernment(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const data = req.body || {};
  const patch = {};
  [
    'agency_name', 'department', 'contact_name', 'email', 'phone',
    'office_address', 'address', 'city', 'state', 'pincode', 'country',
    'place_id', 'latitude', 'longitude', 'jurisdiction', 'authorized_city', 'status'
  ].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });

  const effectiveAgencyName = data.agencyName || data.agency_name;
  if (effectiveAgencyName) {
    patch.agency_name = effectiveAgencyName;
    patch.name = effectiveAgencyName;
  }

  const effectiveContactName = data.contactName || data.contact_name || data.name;
  if (effectiveContactName) {
    patch.contact_name = effectiveContactName;
  }
  if (data.officeAddress !== undefined) patch.office_address = data.officeAddress;
  if (data.authorizedCity !== undefined) patch.authorized_city = data.authorizedCity;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  const updateLat = data.latitude !== undefined ? data.latitude : data.lat;
  if (updateLat !== undefined) {
    patch.latitude = updateLat !== '' && updateLat != null && !isNaN(Number(updateLat)) ? Number(updateLat) : null;
  }
  const updateLng = data.longitude !== undefined ? data.longitude : data.lng;
  if (updateLng !== undefined) {
    patch.longitude = updateLng !== '' && updateLng != null && !isNaN(Number(updateLng)) ? Number(updateLng) : null;
  }
  if (data.clearanceLevel !== undefined || data.clearance_level !== undefined) {
    patch.clearance_level = String(data.clearanceLevel ?? data.clearance_level).substring(0, 40);
  }

  if (Object.keys(patch).length > 0) {
    await agency.update(patch);
  }

  // Update linked user if needed
  let newEmblem = data.avatar_url ?? data.logo_url ?? data.emblem_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (agency.user_id && db.User) {
    linkedUser = await db.User.findByPk(agency.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newEmblem !== undefined) userPatch.avatar_url = newEmblem || null;
      if (effectiveContactName) userPatch.name = effectiveContactName;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (patch.address !== undefined) userPatch.address = patch.address;
      if (patch.city !== undefined) userPatch.city = patch.city;
      if (patch.state !== undefined) userPatch.state = patch.state;
      if (patch.pincode !== undefined) userPatch.pincode = patch.pincode;
      if (patch.country !== undefined) userPatch.country = patch.country;
      if (patch.place_id !== undefined) userPatch.place_id = patch.place_id;
      if (patch.latitude !== undefined) userPatch.latitude = patch.latitude;
      if (patch.longitude !== undefined) userPatch.longitude = patch.longitude;
      if (patch.department !== undefined) userPatch.department = patch.department;
      if (patch.clearance_level !== undefined) userPatch.clearance = patch.clearance_level;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'government_agency_updated',
          title: 'Government Agency Profile Updated',
          body: 'Your government agency profile details have been updated by Super Admin.',
          severity: 'info',
          skipEmail: true,
          data: { agencyId: agency.id },
        });

        // In-app alert to active Super Admins
        const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
        if (superAdminRole) {
          const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
          for (const sa of superAdmins) {
            if (sa.id !== req.user?.id) {
              await notificationService.send({
                userId: sa.id,
                eventKey: 'government_agency_updated',
                title: `Government Profile Updated: ${agency.name}`,
                body: `${agency.name} details have been updated.`,
                severity: 'info',
                skipEmail: true,
              }).catch(() => {});
            }
          }
        }

        await emailService.sendProfileUpdatedEmail({ user: linkedUser }).catch(() => {});
      } catch (_) {}
    }
  }

  // 1. Handle removed documents FIRST (so new documents created below are not marked as removed)
  let toRemoveIds = data.removedDocumentIds || [];
  if (Array.isArray(data.documents) && toRemoveIds.length === 0) {
    const retainedIds = data.documents.map((d) => Number(d.id)).filter((id) => Boolean(id) && !isNaN(id));
    const currentDbDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
      attributes: ['id'],
    });
    toRemoveIds = currentDbDocs.map((d) => d.id).filter((id) => !retainedIds.includes(id));
  }

  if (db.MediaAsset && Array.isArray(toRemoveIds) && toRemoveIds.length > 0) {
    const StorageService = require('../../services/StorageService');
    const toRemove = await db.MediaAsset.findAll({
      where: {
        id: { [Op.in]: toRemoveIds },
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
    });
    for (const asset of toRemove) {
      if (asset.storage_key) {
        await StorageService.remove(asset.storage_key).catch(() => {});
        await StorageService.removeDocument(asset.storage_key).catch(() => {});
      }
      await asset.destroy().catch(() => {});
    }
  }

  // 2. Handle new documents AFTER removals
  let newDocs = data.newDocuments;
  if (!newDocs && Array.isArray(data.documents)) {
    newDocs = data.documents.filter((d) => !d.id || d.isPendingUpload);
  }
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      const docUrl = doc.url || doc.filePath || doc.file_url || (typeof doc === 'string' ? doc : null);
      if (docUrl) {
        const rawPurpose = doc.category || doc.purpose || 'Official Document';
        const safePurpose = String(rawPurpose).substring(0, 80);
        const storageKey = doc.storage_key || doc.key || doc.fileName || doc.name || null;
        await db.MediaAsset.create({
          owner_type: 'government',
          owner_id: agency.id,
          purpose: safePurpose,
          storage_key: storageKey,
          url: docUrl,
          mime: doc.type || doc.fileType || doc.mime || null,
          size: parseDocSize(doc.size || doc.fileSize),
          status: 'available',
          uploaded_by: req.user?.id || null,
        });
      }
    }
  }

  // Re-fetch all active documents and attach to returned agency
  let formattedDocs = [];
  if (db.MediaAsset) {
    const activeDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    formattedDocs = activeDocs.map((d) => {
      const plain = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...plain,
        file_name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        category: plain.purpose || 'Department Authorization Letter',
      };
    });
  }

  const currentEmblem = newEmblem || agency.user?.avatar_url || null;
  const plainAgency = typeof agency.toJSON === 'function' ? agency.toJSON() : { ...agency };
  plainAgency.documents = formattedDocs;
  plainAgency.avatar_url = currentEmblem;
  plainAgency.logo_url = currentEmblem;
  plainAgency.emblem_url = currentEmblem;
  return apiResponse.success(res, plainAgency, 'Government agency updated successfully.');
}
```

<a id="patch-api-v1-campaigns-government-id-status"></a>
## PATCH /api/v1/campaigns/government/:id/status

```javascript
async function setGovernmentStatus(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const { status } = req.body || {};
  if (!status) throw new AppError('VALIDATION_FAILED', 'Status is required.');

  const prevStatus = agency.status;
  await agency.update({ status });
  if (agency.user_id && db.User) {
    const user = await db.User.findByPk(agency.user_id);
    if (user) {
      const userNextStatus = (status === 'approved' || status === 'active') ? 'active' : (status === 'inactive' ? 'inactive' : 'suspended');
      await user.update({ status: userNextStatus });
      if (userNextStatus === 'suspended' || userNextStatus === 'inactive') {
        const tokenService = require('../auth/token.service');
        await tokenService.revokeAllForUser(user.id).catch(() => {});
      }

      // Notification Dispatch for Status Toggle
      try {
        const isSuspended = status === 'suspended';
        const isDeactivated = status === 'inactive' || status === 'deactivated';
        const isActivated = status === 'active' || status === 'approved';
        const statusTitle = isSuspended 
          ? 'Account Suspended' 
          : (isDeactivated 
            ? 'Account Deactivated' 
            : (isActivated ? 'Account Activated' : `Account Status: ${status}`));
        const statusBody = isSuspended 
          ? 'Your government agency account has been suspended by Super Admin.' 
          : (isDeactivated 
            ? 'Your government agency account has been deactivated by Super Admin.' 
            : (isActivated ? 'Your government agency account has been activated and restored by Super Admin.' : `Your government agency account status was set to ${status}.`));

        // Send in-app notification with skipEmail: true to avoid duplicate raw email
        await notificationService.send({
          userId: user.id,
          eventKey: 'user_status_changed',
          title: statusTitle,
          body: statusBody,
          severity: (isSuspended || isDeactivated) ? 'critical' : 'info',
          bypassQuietHours: isSuspended || isDeactivated,
          skipEmail: true,
        }).catch(() => {});

        // Send formatted transactional status email
        await emailService.sendAccountStatusEmail({ user, status }).catch(() => {});

        // In-app alert to active Super Admins
        const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
        if (superAdminRole) {
          const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
          for (const sa of superAdmins) {
            if (sa.id !== req.user?.id) {
              await notificationService.send({
                userId: sa.id,
                eventKey: 'government_status_changed',
                title: `Agency Status: ${agency.name} (${status})`,
                body: `Government Agency "${agency.name}" status changed from ${prevStatus} to ${status}.`,
                severity: isSuspended ? 'warning' : 'info',
                skipEmail: true,
              }).catch(() => {});
            }
          }
        }
      } catch (_) {}
    }
  }

  // Audit activity log
  const ActivityLogger = require('../../utils/ActivityLogger');
  ActivityLogger.log({
    logName: 'GOVERNMENT',
    event: 'status_changed',
    description: `Government agency "${agency.name}" status changed to ${status}`,
    subject: { type: 'GovernmentAgency', id: agency.id },
    causer: req?.user ? { type: 'User', id: req.user.id } : null,
    severity: status === 'suspended' ? 'WARNING' : 'INFO',
    properties: { agencyId: agency.id, previousStatus: prevStatus, newStatus: status },
  }).catch(() => {});

  return apiResponse.success(res, agency, 'Government agency status updated.');
}
```

<a id="get-api-v1-campaigns-government-analytics"></a>
## GET /api/v1/campaigns/government/analytics

```javascript
async function govAgencyAnalytics(req, res) {
  return apiResponse.success(res, await campaignService.getGovAnalytics(req));
}
```

<a id="get-api-v1-campaigns-government-clearance-levels"></a>
## GET /api/v1/campaigns/government/clearance-levels

```javascript
async function listGovClearanceLevels(req, res) {
  const list = db.GovernmentClearanceLevel ? await db.GovernmentClearanceLevel.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['level_number', 'ASC'], ['name', 'ASC']],
  }) : [];
  return apiResponse.success(res, list);
}
```

<a id="get-api-v1-campaigns-government-department-categories"></a>
## GET /api/v1/campaigns/government/department-categories

```javascript
async function listGovDepartmentCategories(req, res) {
  const list = db.GovernmentDepartmentCategory ? await db.GovernmentDepartmentCategory.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  }) : [];
  return apiResponse.success(res, list);
}
```

<a id="get-api-v1-campaigns-government-jurisdictions"></a>
## GET /api/v1/campaigns/government/jurisdictions

```javascript
async function listGovJurisdictions(req, res) {
  const list = db.GovernmentJurisdiction ? await db.GovernmentJurisdiction.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  }) : [];
  return apiResponse.success(res, list);
}
```

<a id="get-api-v1-campaigns-government-meta-options"></a>
## GET /api/v1/campaigns/government/meta/options

```javascript
async function getGovernmentMetaOptions(req, res) {
  const [departments, jurisdictions, clearanceLevels] = await Promise.all([
    db.GovernmentDepartmentCategory ? db.GovernmentDepartmentCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    }) : [],
    db.GovernmentJurisdiction ? db.GovernmentJurisdiction.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    }) : [],
    db.GovernmentClearanceLevel ? db.GovernmentClearanceLevel.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['level_number', 'ASC'], ['name', 'ASC']],
    }) : [],
  ]);

  return apiResponse.success(res, {
    departments,
    jurisdictions,
    clearanceLevels,
  });
}
```

<a id="get-api-v1-campaigns-mqtt-status"></a>
## GET /api/v1/campaigns/mqtt-status

```javascript
async function getMqttStatus(req, res) {
  return apiResponse.success(res, await campaignService.getMqttStatus());
}
```

<a id="get-api-v1-campaigns-slots-availability"></a>
## GET /api/v1/campaigns/slots/availability

```javascript
async function getSlotAvailability(req, res) {
  const routeId = req.query.routeId || req.query.route_id;
  const startDate = req.query.startDate || req.query.start_date;
  const endDate = req.query.endDate || req.query.end_date;
  const excludeCampaignId = req.query.excludeCampaignId || req.query.exclude_campaign_id || req.query.campaignId || req.query.campaign_id;
  const parseIds = (value) => String(value || '').split(',').map(Number).filter(Number.isFinite);
  const activeDays = String(req.query.activeDays || req.query.active_days || '').split(',').filter(Boolean);
  const data = await slotService.getAvailability({
    routeId,
    vehicleIds: parseIds(req.query.vehicleIds || req.query.vehicle_ids),
    screenIds: parseIds(req.query.screenIds || req.query.screen_ids),
    activeDays,
    startDate,
    endDate,
    startTime: req.query.startTime || req.query.start_time,
    endTime: req.query.endTime || req.query.end_time,
    excludeCampaignId,
  });
  return apiResponse.success(res, data);
}
```

<a id="get-api-v1-campaigns-tracking-live"></a>
## GET /api/v1/campaigns/tracking/live

```javascript
async function getLiveTracking(req, res) {
  return apiResponse.success(res, await campaignService.getLiveTracking(req.query));
}
```

<a id="get-api-v1-campaigns-tracking-routes"></a>
## GET /api/v1/campaigns/tracking/routes

```javascript
async function getTrackingRoutes(req, res) {
  return apiResponse.success(res, await campaignService.getTrackingRoutes());
}
```

<a id="get-api-v1-content"></a>
## GET /api/v1/content

```javascript
async function listContent(req, res) {
  return apiResponse.success(res, await contentService.listContent(req.query));
}
```

<a id="post-api-v1-content"></a>
## POST /api/v1/content

```javascript
async function createContentPage(req, res) {
  const uid = req.user ? req.user.id : null;
  return apiResponse.created(res, await contentService.createContentPage(req.body, uid), 'Content page created.');
}
```

<a id="delete-api-v1-content-id"></a>
## DELETE /api/v1/content/:id

```javascript
async function deleteContentPage(req, res) {
  return apiResponse.success(res, await contentService.deleteContentPage(req.params.id), 'Content page deleted.');
}
```

<a id="patch-api-v1-content-id"></a>
## PATCH /api/v1/content/:id

```javascript
async function updateContentPage(req, res) {
  const uid = req.user ? req.user.id : null;
  return apiResponse.success(res, await contentService.updateContentPage(req.params.id, req.body, uid), 'Content page updated.');
}
```

<a id="post-api-v1-content-id-publish"></a>
## POST /api/v1/content/:id/publish

```javascript
async function publishContentPage(req, res) {
  const uid = req.user ? req.user.id : null;
  return apiResponse.success(res, await contentService.publishContentPage(req.params.id, uid), 'Content page published.');
}
```

<a id="get-api-v1-content-type"></a>
## GET /api/v1/content/:type

```javascript
async function resolveContent(req, res) {
  const roleCode = req.query.role || req.query.role_code || req.user?.role?.code || null;
  return apiResponse.success(res, await contentService.resolveContent(req.params.type, roleCode));
}
```

<a id="get-api-v1-content-faqs"></a>
## GET /api/v1/content/faqs

```javascript
async function listFaqs(req, res) {
  return apiResponse.success(res, await contentService.listFaqs({ roleCode: req.query.role || null }));
}
```

<a id="post-api-v1-content-faqs"></a>
## POST /api/v1/content/faqs

```javascript
async function createFaq(req, res) {
  return apiResponse.created(res, await contentService.createFaq(req.body), 'FAQ created.');
}
```

<a id="delete-api-v1-content-faqs-id"></a>
## DELETE /api/v1/content/faqs/:id

```javascript
async function deleteFaq(req, res) {
  return apiResponse.success(res, await contentService.deleteFaq(req.params.id), 'FAQ deleted.');
}
```

<a id="patch-api-v1-content-faqs-id"></a>
## PATCH /api/v1/content/faqs/:id

```javascript
async function updateFaq(req, res) {
  return apiResponse.success(res, await contentService.updateFaq(req.params.id, req.body), 'FAQ updated.');
}
```

<a id="get-api-v1-dashboard-admin-kpis"></a>
## GET /api/v1/dashboard/admin/kpis

```javascript
async function adminKpis(req, res) {
  const orgId = req.isPlatformScope ? req.query.organizationId : req.tenantId;
  if (!orgId) throw new AppError('VALIDATION_FAILED', 'organizationId required.');
  return apiResponse.success(res, await service.adminKpis(orgId));
}
```

<a id="get-api-v1-dashboard-live-summary"></a>
## GET /api/v1/dashboard/live-summary

```javascript
async function liveSummary(req, res) {
  return apiResponse.success(res, await service.liveSummary());
}
```

<a id="get-api-v1-dashboard-superadmin-kpis"></a>
## GET /api/v1/dashboard/superadmin/kpis

```javascript
async function superAdminKpis(req, res) {
  return apiResponse.success(res, await service.superAdminKpis());
}
```

<a id="get-api-v1-displays"></a>
## GET /api/v1/displays

```javascript
async function listDisplays(req, res) {
  return apiResponse.success(res, await s.listDisplays(req.query, req));
}
```

<a id="post-api-v1-displays"></a>
## POST /api/v1/displays

```javascript
async function registerDisplay(req, res) {
  return apiResponse.created(res, await s.registerDisplay(req.body, req), 'Display registered.');
}
```

<a id="get-api-v1-displays-id-config"></a>
## GET /api/v1/displays/:id/config

```javascript
async function getDisplayConfig(req, res) {
  return apiResponse.success(res, await s.getDisplayConfig(req.params.id));
}
```

<a id="patch-api-v1-displays-id-config"></a>
## PATCH /api/v1/displays/:id/config

```javascript
async function updateDisplayConfig(req, res) {
  return apiResponse.success(res, await s.updateDisplayConfig(req.params.id, req.body, req), 'Config updated.');
}
```

<a id="patch-api-v1-drivers-id-approve"></a>
## PATCH /api/v1/drivers/:id/approve

```javascript
async function approveDriver(req, res) {
  return apiResponse.success(res, await s.drivers.approve(req.params.id, req), 'Driver approved.');
}
```

<a id="patch-api-v1-drivers-id-assign-bus"></a>
## PATCH /api/v1/drivers/:id/assign-bus

```javascript
async function assignBus(req, res) {
  return apiResponse.success(res, await s.drivers.assignBus(req.params.id, req.body.vehicleId, req), 'Bus assigned.');
}
```

<a id="get-api-v1-drivers-id-documents"></a>
## GET /api/v1/drivers/:id/documents

```javascript
async function driverDocuments(req, res) {
  return apiResponse.success(res, await s.drivers.documents(req.params.id, req));
}
```

<a id="patch-api-v1-drivers-id-reject"></a>
## PATCH /api/v1/drivers/:id/reject

```javascript
async function rejectDriver(req, res) {
  return apiResponse.success(res, await s.drivers.reject(req.params.id, req.body.reason, req), 'Driver rejected.');
}
```

<a id="patch-api-v1-drivers-id-status"></a>
## PATCH /api/v1/drivers/:id/status

```javascript
async function setDriverStatus(req, res) {
  return apiResponse.success(res, await s.drivers.setStatus(req.params.id, req.body.status, req), 'Status updated.');
}
```

<a id="patch-api-v1-drivers-id-verify-documents"></a>
## PATCH /api/v1/drivers/:id/verify-documents

```javascript
async function verifyDriverDocuments(req, res) {
  return apiResponse.success(res, await s.drivers.verifyDocuments(req.params.id, req.body.verified ?? true, req), 'Driver document verification updated.');
}
```

<a id="get-api-v1-edge-devices"></a>
## GET /api/v1/edge-devices

```javascript
async function listEdgeDevices(req, res) {
  const { rows, meta } = await s.listEdgeDevices(req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-edge-devices"></a>
## POST /api/v1/edge-devices

```javascript
async function registerEdgeDevice(req, res) {
  return apiResponse.created(res, await s.registerEdgeDevice(req.body, req), 'Edge device registered.');
}
```

<a id="delete-api-v1-edge-devices-id"></a>
## DELETE /api/v1/edge-devices/:id

```javascript
async function deleteEdgeDevice(req, res) {
  return apiResponse.success(res, await s.deleteEdgeDevice(req.params.id, req), 'Edge device deleted.');
}
```

<a id="get-api-v1-edge-devices-id"></a>
## GET /api/v1/edge-devices/:id

```javascript
async function getEdgeDevice(req, res) {
  return apiResponse.success(res, await s.getEdgeDevice(req.params.id, req));
}
```

<a id="patch-api-v1-edge-devices-id"></a>
## PATCH /api/v1/edge-devices/:id

```javascript
async function updateEdgeDevice(req, res) {
  return apiResponse.success(res, await s.updateEdgeDevice(req.params.id, req.body, req), 'Updated.');
}
```

<a id="post-api-v1-edge-devices-id-assign"></a>
## POST /api/v1/edge-devices/:id/assign

```javascript
async function assignEdgeDevice(req, res) {
  const vehicleId = req.body.vehicleId !== undefined ? req.body.vehicleId : req.body.vehicle_id;
  return apiResponse.success(res, await s.assignEdgeDevice(req.params.id, vehicleId, req), 'Edge device assigned.');
}
```

<a id="get-api-v1-edge-devices-id-config"></a>
## GET /api/v1/edge-devices/:id/config

```javascript
async function getEdgeConfig(req, res) {
  return apiResponse.success(res, await s.getEdgeConfig(req.params.id));
}
```

<a id="post-api-v1-edge-devices-id-config"></a>
## POST /api/v1/edge-devices/:id/config

```javascript
async function pushConfig(req, res) {
  return apiResponse.success(res, await s.pushConfig(req.params.id, req.body.config), 'Config pushed.');
}
```

<a id="get-api-v1-edge-devices-id-connectivity-tests"></a>
## GET /api/v1/edge-devices/:id/connectivity-tests

```javascript
async function listConnectivityTests(req, res) {
  const { rows, meta } = await s.listConnectivityTests(req.params.id, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-edge-devices-id-connectivity-tests"></a>
## POST /api/v1/edge-devices/:id/connectivity-tests

```javascript
async function recordConnectivityTest(req, res) {
  return apiResponse.created(res, await s.recordConnectivityTest(req.params.id, req.body, req), 'Test recorded.');
}
```

<a id="post-api-v1-edge-devices-id-factory-reset"></a>
## POST /api/v1/edge-devices/:id/factory-reset

```javascript
async function factoryReset(req, res) {
  return apiResponse.success(res, await s.factoryReset(req.params.id), 'Factory reset dispatched.');
}
```

<a id="post-api-v1-edge-devices-id-reboot"></a>
## POST /api/v1/edge-devices/:id/reboot

```javascript
async function reboot(req, res) {
  return apiResponse.success(res, await s.reboot(req.params.id), 'Reboot sent.');
}
```

<a id="get-api-v1-edge-devices-id-telemetry"></a>
## GET /api/v1/edge-devices/:id/telemetry

```javascript
async function edgeTelemetry(req, res) {
  const { rows, meta } = await s.edgeTelemetry(req.params.id, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="patch-api-v1-edge-devices-id-toggle"></a>
## PATCH /api/v1/edge-devices/:id/toggle

```javascript
async function toggleActiveStatus(req, res) {
  const activeState = req.body.isActive !== undefined ? req.body.isActive : req.body.is_active;
  return apiResponse.success(res, await s.toggleEdgeDeviceActive(req.params.id, activeState, req), 'Status updated.');
}
```

<a id="get-api-v1-edge-devices-handshake-boxid"></a>
## GET /api/v1/edge-devices/handshake/:boxId

```javascript
async function verifyLiveHandshake(req, res) {
  return apiResponse.success(res, await s.verifyLiveHandshake(req.params.boxId, req.tenantId));
}
```

<a id="get-api-v1-edge-devices-package-download"></a>
## GET /api/v1/edge-devices/package/download

```javascript
async function downloadCorePackage(req, res) {
  return await s.downloadCorePackage(res);
}
```

<a id="get-api-v1-edge-devices-setup-script"></a>
## GET /api/v1/edge-devices/setup-script

```javascript
async function getSetupScript(req, res) {
  const script = await s.getSetupScript(req);
  res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
  return res.send(script);
}
```

<a id="get-api-v1-emergency-broadcasts"></a>
## GET /api/v1/emergency-broadcasts

```javascript
async function listEmergency(req, res) {
  const { rows, meta } = await emergencyService.list(req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-emergency-broadcasts"></a>
## POST /api/v1/emergency-broadcasts

```javascript
async function createEmergency(req, res) {
  return apiResponse.created(res, await emergencyService.create(req.body, req), 'Emergency submitted for Super Admin approval.');
}
```

<a id="delete-api-v1-emergency-broadcasts-id"></a>
## DELETE /api/v1/emergency-broadcasts/:id

```javascript
async function deleteEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.deleteBroadcast(req.params.id, req), 'Emergency broadcast deleted successfully.');
}
```

<a id="get-api-v1-emergency-broadcasts-id"></a>
## GET /api/v1/emergency-broadcasts/:id

```javascript
async function getEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.get(req.params.id));
}
```

<a id="patch-api-v1-emergency-broadcasts-id"></a>
## PATCH /api/v1/emergency-broadcasts/:id

```javascript
async function updateEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.update(req.params.id, req.body, req), 'Emergency broadcast updated.');
}
```

<a id="put-api-v1-emergency-broadcasts-id"></a>
## PUT /api/v1/emergency-broadcasts/:id

```javascript
async function updateEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.update(req.params.id, req.body, req), 'Emergency broadcast updated.');
}
```

<a id="post-api-v1-emergency-broadcasts-id-approve"></a>
## POST /api/v1/emergency-broadcasts/:id/approve

```javascript
async function approveEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.approve(req.params.id, req), 'Emergency approved and broadcast live.');
}
```

<a id="post-api-v1-emergency-broadcasts-id-reject"></a>
## POST /api/v1/emergency-broadcasts/:id/reject

```javascript
async function rejectEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.reject(req.params.id, req.body?.reason, req), 'Emergency broadcast rejected.');
}
```

<a id="post-api-v1-emergency-broadcasts-id-revoke"></a>
## POST /api/v1/emergency-broadcasts/:id/revoke

```javascript
async function revokeEmergency(req, res) {
  return apiResponse.success(res, await emergencyService.revoke(req.params.id), 'Broadcast revoked.');
}
```

<a id="get-api-v1-exports"></a>
## GET /api/v1/exports

```javascript
async function list(req, res) {
  return apiResponse.success(res, await service.list(req));
}
```

<a id="post-api-v1-exports"></a>
## POST /api/v1/exports

```javascript
async function request(req, res) {
  return apiResponse.created(res, await service.request(req.body, req), 'Export requested.');
}
```

<a id="get-api-v1-finance-campaign-payments"></a>
## GET /api/v1/finance/campaign-payments

```javascript
async function listCampaignPayments(req, res) {
  const { rows, meta } = await service.listCampaignPayments(req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-finance-campaign-payments-id-manual-pay"></a>
## POST /api/v1/finance/campaign-payments/:id/manual-pay

```javascript
async function recordManualCampaignPayment(req, res) {
  return apiResponse.created(res, await service.recordManualCampaignPayment(req.params.id, req.body, req), 'Manual payment recorded.');
}
```

<a id="post-api-v1-finance-campaign-payments-id-share-link"></a>
## POST /api/v1/finance/campaign-payments/:id/share-link

```javascript
async function shareCampaignPaymentLink(req, res) {
  return apiResponse.success(res, await service.shareCampaignPaymentLink(req.params.id, req.body, req), 'Payment link dispatched.');
}
```

<a id="get-api-v1-finance-gst-gstr1-json"></a>
## GET /api/v1/finance/gst/gstr1-json

```javascript
async function getGstr1Json(req, res) {
  return apiResponse.success(res, await service.getGstr1Json(req.query));
}
```

<a id="get-api-v1-finance-gst-summary"></a>
## GET /api/v1/finance/gst/summary

```javascript
async function gstSummary(req, res) {
  return apiResponse.success(res, await service.gstSummary(req.query));
}
```

<a id="get-api-v1-finance-invoices"></a>
## GET /api/v1/finance/invoices

```javascript
async function listInvoices(req, res) {
  const { rows, meta } = await service.listInvoices(req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-finance-invoices"></a>
## POST /api/v1/finance/invoices

```javascript
async function generateInvoice(req, res) {
  return apiResponse.created(res, await service.generateInvoice(req.body, req), 'Invoice generated.');
}
```

<a id="get-api-v1-finance-invoices-id"></a>
## GET /api/v1/finance/invoices/:id

```javascript
async function getInvoice(req, res) {
  return apiResponse.success(res, await service.getInvoice(req.params.id));
}
```

<a id="post-api-v1-finance-invoices-id-mark-paid"></a>
## POST /api/v1/finance/invoices/:id/mark-paid

```javascript
async function markInvoicePaid(req, res) {
  return apiResponse.success(res, await service.markInvoicePaid(req.params.id, req.body, req), 'Invoice marked as paid.');
}
```

<a id="get-api-v1-finance-kpis"></a>
## GET /api/v1/finance/kpis

```javascript
async function kpis(req, res) {
  return apiResponse.success(res, await service.kpis());
}
```

<a id="get-api-v1-finance-payments"></a>
## GET /api/v1/finance/payments

```javascript
async function listPayments(req, res) {
  const { rows, meta } = await service.listPayments(req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-finance-payments-id"></a>
## GET /api/v1/finance/payments/:id

```javascript
async function getPayment(req, res) {
  return apiResponse.success(res, await service.getPayment(req.params.id));
}
```

<a id="post-api-v1-finance-payments-id-send-reminder"></a>
## POST /api/v1/finance/payments/:id/send-reminder

```javascript
async function sendPaymentReminder(req, res) {
  return apiResponse.success(res, await service.sendPaymentReminder(req.params.id, req.body, req), 'Reminder sent.');
}
```

<a id="post-api-v1-finance-reconciliation-auto-match"></a>
## POST /api/v1/finance/reconciliation/auto-match

```javascript
async function autoMatchReconciliation(req, res) {
  return apiResponse.success(res, await service.autoMatchReconciliation());
}
```

<a id="post-api-v1-finance-reconciliation-finalize"></a>
## POST /api/v1/finance/reconciliation/finalize

```javascript
async function finalizeReconciliation(req, res) {
  return apiResponse.success(res, await service.finalizeReconciliation(req.body, req), 'Reconciliation finalized.');
}
```

<a id="get-api-v1-finance-reconciliation-summary"></a>
## GET /api/v1/finance/reconciliation/summary

```javascript
async function reconciliationSummary(req, res) {
  return apiResponse.success(res, await service.reconciliationSummary());
}
```

<a id="get-api-v1-finance-reconciliation-transactions"></a>
## GET /api/v1/finance/reconciliation/transactions

```javascript
async function reconciliationTransactions(req, res) {
  return apiResponse.success(res, await service.reconciliationTransactions());
}
```

<a id="get-api-v1-finance-settings"></a>
## GET /api/v1/finance/settings

```javascript
async function getFinanceSettings(req, res) {
  return apiResponse.success(res, await service.getFinanceSettings());
}
```

<a id="put-api-v1-finance-settings"></a>
## PUT /api/v1/finance/settings

```javascript
async function updateFinanceSettings(req, res) {
  return apiResponse.success(res, await service.updateFinanceSettings(req.body, req), 'Finance settings updated.');
}
```

<a id="get-api-v1-finance-subscriptions"></a>
## GET /api/v1/finance/subscriptions

```javascript
async function listSubscriptions(req, res) {
  const { rows, meta } = await service.listSubscriptions(req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-finance-subscriptions-id"></a>
## GET /api/v1/finance/subscriptions/:id

```javascript
async function getSubscription(req, res) {
  return apiResponse.success(res, await service.getSubscription(req.params.id));
}
```

<a id="patch-api-v1-fleets-id-approve"></a>
## PATCH /api/v1/fleets/:id/approve

```javascript
async function approveFleet(req, res) {
  return apiResponse.success(res, await s.fleets.approve(req.params.id, req), 'Fleet approved.');
}
```

<a id="post-api-v1-fleets-id-assign-vehicle"></a>
## POST /api/v1/fleets/:id/assign-vehicle

```javascript
async function assignVehicleToFleet(req, res) {
  const vehicleId = req.params.vehicleId || req.body.vehicleId || req.body.vehicle_id;
  await s.vehicles.update(Number(vehicleId), { fleet_id: req.params.id }, req);
  if (s.syncFleetCounts) await s.syncFleetCounts(req.params.id).catch(() => {});
  return apiResponse.success(res, { ok: true }, 'Vehicle assigned to fleet.');
}
```

<a id="patch-api-v1-fleets-id-reject"></a>
## PATCH /api/v1/fleets/:id/reject

```javascript
async function rejectFleet(req, res) {
  return apiResponse.success(res, await s.fleets.reject(req.params.id, req.body.reason, req), 'Fleet rejected.');
}
```

<a id="post-api-v1-fleets-id-unassign-vehicle"></a>
## POST /api/v1/fleets/:id/unassign-vehicle

```javascript
async function unassignVehicleFromFleet(req, res) {
  const vehicleId = req.params.vehicleId || req.body.vehicleId || req.body.vehicle_id;
  await s.vehicles.update(Number(vehicleId), { fleet_id: null }, req);
  if (s.syncFleetCounts) await s.syncFleetCounts(req.params.id).catch(() => {});
  return apiResponse.success(res, { ok: true }, 'Vehicle unassigned from fleet.');
}
```

<a id="get-api-v1-fleets-quotas"></a>
## GET /api/v1/fleets/quotas

```javascript
async function getFleetQuotas(req, res) {
  const { getFleetQuotaSummary } = require('./fleetQuota.helper');
  const organizationId = (req && !req.isPlatformScope)
    ? req.tenantId
    : (req.query.organizationId || req.query.organization_id || req.tenantId || 1);
  const excludeId = req.query.excludeFleetId || req.query.excludeUserId || req.query.excludeId;
  const summary = await getFleetQuotaSummary({
    organizationId,
    excludeFleetId: excludeId,
    excludeUserId: excludeId,
  });
  return apiResponse.success(res, summary);
}
```

<a id="get-api-v1-government"></a>
## GET /api/v1/government

```javascript
async function listGovernment(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status && req.query.status !== 'All') {
    where.status = req.query.status;
  }
  if (req.query.search) {
    const s = `%${req.query.search}%`;
    where[Op.or] = [
      { name: { [Op.like]: s } },
      { agency_name: { [Op.like]: s } },
      { department: { [Op.like]: s } },
      { contact_name: { [Op.like]: s } },
      { email: { [Op.like]: s } },
      { phone: { [Op.like]: s } },
      { code: { [Op.like]: s } },
      { jurisdiction: { [Op.like]: s } },
      { authorized_city: { [Op.like]: s } },
      { city: { [Op.like]: s } },
      { state: { [Op.like]: s } },
      { pincode: { [Op.like]: s } },
      { address: { [Op.like]: s } },
    ];
  }
  const include = [
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }] : []),
    ...(db.EmergencyBroadcast ? [{ model: db.EmergencyBroadcast, as: 'broadcasts', attributes: ['id', 'title', 'severity', 'created_at'] }] : []),
  ];
  const [result, totalAll, totalActive, totalSuspended, totalPending, totalEmergency] = await Promise.all([
    db.GovernmentAgency.findAndCountAll({
      where,
      include,
      order: [['id', 'DESC']],
      limit,
      offset,
    }),
    db.GovernmentAgency.count(),
    db.GovernmentAgency.count({ where: { status: 'active' } }),
    db.GovernmentAgency.count({ where: { status: 'suspended' } }),
    db.GovernmentAgency.count({ where: { status: 'pending_approval' } }),
    db.GovernmentAgency.count({
      where: {
        [Op.or]: [
          { clearance_level: { [Op.like]: '%emergency%' } },
          { clearance_level: { [Op.like]: '%override%' } },
        ],
      },
    }),
  ]);
  const { rows, count } = result;
  rows.forEach((gov) => {
    gov.setDataValue('avatar_url', gov.user?.avatar_url || null);
    gov.setDataValue('logo_url', gov.user?.avatar_url || null);
    gov.setDataValue('emblem_url', gov.user?.avatar_url || null);
  });
  const meta = buildMeta(page, limit, count);
  meta.stats = {
    total: totalAll,
    active: totalActive,
    suspended: totalSuspended,
    pending: totalPending,
    emergency: totalEmergency,
  };
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-government"></a>
## POST /api/v1/government

```javascript
async function createGovernment(req, res) {
  const data = req.body || {};
  const agencyName = data.agencyName || data.agency_name || data.name;
  if (!agencyName) throw new AppError('VALIDATION_FAILED', 'Agency/Authority name is required.');

  const email = (data.email || '').toLowerCase().trim();
  const phone = data.phone ? String(data.phone).trim() : null;
  const contactName = data.name || data.contact_name || agencyName;
  const rawPassword = data.password || 'Gov@12345';

  if (!email) throw new AppError('VALIDATION_FAILED', 'Nodal officer email address is required.');
  if (!phone) throw new AppError('VALIDATION_FAILED', 'Nodal officer mobile phone number is required.');

  const address = data.address || data.officeAddress || data.office_address || null;
  const city = data.city || data.authorizedCity || data.authorized_city || null;
  const state = data.state || null;
  const pincode = data.pincode || null;
  const country = data.country || 'India';
  const placeId = data.placeId || data.place_id || null;
  const rawLat = data.latitude !== undefined ? data.latitude : data.lat;
  const rawLng = data.longitude !== undefined ? data.longitude : data.lng;
  const latitude = rawLat !== '' && rawLat != null && !isNaN(Number(rawLat)) ? Number(rawLat) : null;
  const longitude = rawLng !== '' && rawLng != null && !isNaN(Number(rawLng)) ? Number(rawLng) : null;
  const department = data.department || null;
  const clearanceLevel = data.clearanceLevel || data.clearance_level
    ? String(data.clearanceLevel || data.clearance_level).substring(0, 40)
    : null;

  let role = null;
  let createdAgency = null;
  let createdUser = null;

  await db.sequelize.transaction(async (t) => {
    // 1. Strictly enforce email and mobile uniqueness across the platform
    await assertUniqueCredentials({ email, phone, transaction: t });

    role = await db.Role.findOne({ where: { code: 'ROLE-GOVT-AGENCY' }, transaction: t });
    const emblemToSet = data.avatar_url || data.logo_url || data.emblem_url || data.avatarUrl || data.logoUrl || null;
    const passwordHash = await db.User.hashPassword(rawPassword);
    const enrollmentNo = await generateEnrollmentNo(db.sequelize, 'ROLE-GOVT-AGENCY', t);

    const user = await db.User.create({
      code: newUserCode(),
      name: contactName,
      email,
      phone,
      password_hash: passwordHash,
      role_id: role ? role.id : null,
      avatar_url: emblemToSet,
      status: 'active',
      enrollment_no: enrollmentNo,
      department,
      clearance: clearanceLevel,
      address,
      city,
      state,
      pincode,
      country,
      place_id: placeId,
      latitude,
      longitude,
    }, { transaction: t });

    // 2. Create Government Agency
    const govCode = `GOV-${Date.now().toString(36).toUpperCase()}`;
    const agency = await db.GovernmentAgency.create({
      code: govCode,
      name: agencyName,
      agency_name: agencyName,
      department,
      contact_name: contactName,
      email: email || user.email,
      phone: phone || user.phone,
      office_address: address,
      address,
      city,
      state,
      pincode,
      country,
      place_id: placeId,
      latitude,
      longitude,
      jurisdiction: data.jurisdiction || null,
      authorized_city: city,
      clearance_level: clearanceLevel,
      status: data.status || 'active',
      user_id: user.id,
    }, { transaction: t });

    // 3. Attach documents
    if (db.MediaAsset && Array.isArray(data.documents) && data.documents.length > 0) {
      for (const doc of data.documents) {
        const docUrl = doc.url || doc.filePath || doc.file_url || (typeof doc === 'string' ? doc : null);
        if (docUrl) {
          const rawPurpose = doc.category || doc.purpose || 'Official Authorization Letter';
          const safePurpose = String(rawPurpose).substring(0, 80);
          const storageKey = doc.storage_key || doc.key || doc.fileName || doc.name || null;
          await db.MediaAsset.create({
            owner_type: 'government',
            owner_id: agency.id,
            purpose: safePurpose,
            storage_key: storageKey,
            url: docUrl,
            mime: doc.type || doc.fileType || doc.mime || null,
            size: parseDocSize(doc.size || doc.fileSize),
            status: 'available',
            uploaded_by: req.user?.id || null,
          }, { transaction: t });
        }
      }
    }

    if (db.MediaAsset) {
      const docs = await db.MediaAsset.findAll({
        where: {
          owner_type: 'government',
          owner_id: agency.id,
          status: 'available',
        },
        order: [['id', 'DESC']],
      }, { transaction: t });
      const formattedDocs = docs.map((d) => {
        const plain = typeof d.toJSON === 'function' ? d.toJSON() : d;
        return {
          ...plain,
          file_name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
          name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
          category: plain.purpose || 'Department Authorization Letter',
        };
      });
      agency.setDataValue('documents', formattedDocs);
    }

    agency.setDataValue('avatar_url', emblemToSet);
    agency.setDataValue('logo_url', emblemToSet);
    agency.setDataValue('emblem_url', emblemToSet);
    if (user) agency.setDataValue('user', user);

    createdAgency = agency;
    createdUser = user;
  });

  // Post-transaction Audit Activity Log
  const ActivityLogger = require('../../utils/ActivityLogger');
  ActivityLogger.log({
    logName: 'GOVERNMENT',
    event: 'created',
    description: `Government agency "${createdAgency.name}" authorized (${createdAgency.code})`,
    subject: { type: 'GovernmentAgency', id: createdAgency.id },
    causer: req?.user ? { type: 'User', id: req.user.id } : null,
    severity: 'INFO',
    properties: {
      agencyId: createdAgency.id,
      code: createdAgency.code,
      name: createdAgency.name,
      email: createdAgency.email,
      phone: createdAgency.phone,
      department: createdAgency.department,
      clearanceLevel: createdAgency.clearance_level,
      city: createdAgency.city,
      address: createdAgency.address,
    },
  }).catch(() => {});

  // Post-transaction Multi-Channel Notification Dispatch (Non-blocking queue)
  setImmediate(async () => {
    try {
      const notificationLogService = require('../../services/notificationLog.service');
      const smsService = require('../../services/sms.service');
      const effectiveSuperAdminEmail = req?.user?.email || process.env.ROOT_ADMIN_EMAIL || 'root@vmovexa.com';

      // 1. In-app notification for the newly authorized agency user
      if (createdUser) {
        await notificationService.send({
          userId: createdUser.id,
          eventKey: 'government_agency_onboarded',
          title: 'Welcome to VMOVEXA Government Desk',
          body: `Government Agency "${createdAgency.name}" has been authorized (${createdAgency.code}) with ${createdAgency.clearance_level || 'Public Safety Clearance'}.`,
          severity: 'info',
          skipEmail: true,
          data: { agencyId: createdAgency.id, enrollmentNo: createdUser.enrollment_no, code: createdAgency.code },
        }).catch(() => {});
      }

      // 2. In-app notification for all active Super Admins
      const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
      if (superAdminRole) {
        const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
        for (const sa of superAdmins) {
          await notificationService.send({
            userId: sa.id,
            eventKey: 'government_authorized',
            title: `Government Agency Authorized: ${createdAgency.name}`,
            body: `${createdAgency.name} (${createdAgency.department || 'Public Safety'}) authorized by Super Admin.`,
            severity: 'info',
            skipEmail: true,
            data: { agencyId: createdAgency.id, enrollmentNo: createdUser?.enrollment_no, code: createdAgency.code },
          }).catch(() => {});
        }
      }

      // 3. Branded welcome & credentials email (Queued in NotificationLog for reliable background delivery)
      if (createdUser?.email) {
        await notificationLogService.enqueueNotification({
          userId: createdUser.id,
          recipient: createdUser.email,
          channel: 'email',
          eventKey: 'government_authorized',
          title: `Government Authority Credentials: ${createdAgency.name}`,
          body: `Public Safety Agency "${createdAgency.name}" authorized. Official access keys provisioned for ${createdUser.email}.`,
          metadata: {
            action: 'provisioning_email',
            payload: {
              user: createdUser,
              role: role || { name: 'Government Agency', code: 'ROLE-GOVT-AGENCY' },
              password: rawPassword,
              creator: req?.user,
              superAdminEmail: effectiveSuperAdminEmail,
            },
          },
        }).catch(() => {});

        // Safely trigger queue drain immediately
        notificationLogService.processPendingNotifications().catch(() => {});
      }

      // 4. SMS Notification (DB-managed template, respects ENABLE_LIVE_SMS vs Log-Only)
      if (createdUser?.phone && smsService?.sendSms) {
        const tplMsg = smsService.renderTemplateByCode
          ? await smsService.renderTemplateByCode('gov_agency_authorized', {
              agency_name: createdAgency.name,
              login_id: createdUser.email || createdUser.enrollment_no,
            })
          : null;
        await smsService.sendSms({
          to: createdUser.phone,
          message: tplMsg || `VMOVEXA Gov Portal: Your agency ${createdAgency.name} has been authorized. Login ID: ${createdUser.email || createdUser.enrollment_no}.`,
        }).catch(() => {});
      }
    } catch (_) {}
  });

  const plainAgency = typeof createdAgency.toJSON === 'function' ? createdAgency.toJSON() : { ...createdAgency };
  if (db.MediaAsset) {
    const docs = await db.MediaAsset.findAll({
      where: {
        owner_type: 'government',
        owner_id: createdAgency.id,
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    plainAgency.documents = docs.map((d) => {
      const p = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...p,
        file_name: p.storage_key || p.purpose || `Doc #${p.id}`,
        name: p.storage_key || p.purpose || `Doc #${p.id}`,
        category: p.purpose || 'Department Authorization Letter',
      };
    });
  } else {
    plainAgency.documents = [];
  }
  return apiResponse.created(res, plainAgency, 'Government agency authorized successfully.');
}
```

<a id="delete-api-v1-government-id"></a>
## DELETE /api/v1/government/:id

```javascript
async function deleteGovernment(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const agencyName = agency.name || agency.agency_name;
  const agencyCode = agency.code;

  if (db.MediaAsset) {
    const StorageService = require('../../services/StorageService');
    const docs = await db.MediaAsset.findAll({
      where: { owner_type: 'government', owner_id: agency.id },
    });
    for (const d of docs) {
      if (d.storage_key) await StorageService.removeDocument(d.storage_key).catch(() => {});
      await d.destroy();
    }
  }

  if (agency.user_id && db.User) {
    const user = await db.User.findByPk(agency.user_id);
    if (user) {
      try {
        await emailService.sendAccountDeletedEmail({ user }).catch(() => {});
      } catch (_) {}
      const tokenService = require('../auth/token.service');
      await tokenService.revokeAllForUser(user.id).catch(() => {});
      await user.destroy({ force: true }).catch(() => user.destroy());
    }
  }

  await agency.destroy({ force: true }).catch(() => agency.destroy());

  // Audit Activity Log & Super Admin notification
  const ActivityLogger = require('../../utils/ActivityLogger');
  ActivityLogger.log({
    logName: 'GOVERNMENT',
    event: 'deleted',
    description: `Government agency "${agencyName}" (${agencyCode}) permanently deleted by Super Admin`,
    subject: { type: 'GovernmentAgency', id: agency.id },
    causer: req?.user ? { type: 'User', id: req.user.id } : null,
    severity: 'WARNING',
    properties: { agencyId: agency.id, agencyCode, agencyName },
  }).catch(() => {});

  const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
  if (superAdminRole) {
    const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
    for (const sa of superAdmins) {
      if (sa.id !== req.user?.id) {
        await notificationService.send({
          userId: sa.id,
          eventKey: 'government_deleted',
          title: `Government Agency Deleted: ${agencyName}`,
          body: `Government Agency "${agencyName}" (${agencyCode}) was permanently removed by Super Admin.`,
          severity: 'warning',
          skipEmail: true,
        }).catch(() => {});
      }
    }
  }

  return apiResponse.success(res, { ok: true }, 'Government agency deleted successfully.');
}
```

<a id="get-api-v1-government-id"></a>
## GET /api/v1/government/:id

```javascript
async function getGovernment(req, res) {
  const include = [
    ...(db.User ? [{ model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'enrollment_no', 'status', 'avatar_url', 'created_at'] }] : []),
    ...(db.EmergencyBroadcast ? [{ model: db.EmergencyBroadcast, as: 'broadcasts' }] : []),
    ...(db.Campaign ? [{ model: db.Campaign, as: 'campaigns' }] : []),
  ];
  let g = null;
  const govId = req.params.id;
  if (!isNaN(Number(govId))) {
    g = await db.GovernmentAgency.findByPk(Number(govId), { include });
    if (!g) {
      g = await db.GovernmentAgency.findOne({ where: { user_id: Number(govId) }, include });
    }
  } else {
    g = await db.GovernmentAgency.findOne({
      where: { [Op.or]: [{ code: govId }, { email: govId }] },
      include,
    });
  }
  if (!g) throw new AppError('NOT_FOUND', 'Government agency not found.');

  let formattedDocs = [];
  if (db.MediaAsset) {
    const docs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [g.id, g.user_id].filter(Boolean) },
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    formattedDocs = docs.map((d) => {
      const plainDoc = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...plainDoc,
        file_name: plainDoc.storage_key || plainDoc.purpose || `Doc #${plainDoc.id}`,
        name: plainDoc.storage_key || plainDoc.purpose || `Doc #${plainDoc.id}`,
        category: plainDoc.purpose || 'Department Authorization Letter',
      };
    });
  }

  const plain = typeof g.toJSON === 'function' ? g.toJSON() : { ...g };
  plain.documents = formattedDocs;
  plain.logo_url = g.user?.avatar_url || null;
  plain.emblem_url = g.user?.avatar_url || null;
  plain.avatar_url = g.user?.avatar_url || null;
  return apiResponse.success(res, plain);
}
```

<a id="patch-api-v1-government-id"></a>
## PATCH /api/v1/government/:id

```javascript
async function updateGovernment(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const data = req.body || {};
  const patch = {};
  [
    'agency_name', 'department', 'contact_name', 'email', 'phone',
    'office_address', 'address', 'city', 'state', 'pincode', 'country',
    'place_id', 'latitude', 'longitude', 'jurisdiction', 'authorized_city', 'status'
  ].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });

  const effectiveAgencyName = data.agencyName || data.agency_name;
  if (effectiveAgencyName) {
    patch.agency_name = effectiveAgencyName;
    patch.name = effectiveAgencyName;
  }

  const effectiveContactName = data.contactName || data.contact_name || data.name;
  if (effectiveContactName) {
    patch.contact_name = effectiveContactName;
  }
  if (data.officeAddress !== undefined) patch.office_address = data.officeAddress;
  if (data.authorizedCity !== undefined) patch.authorized_city = data.authorizedCity;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  const updateLat = data.latitude !== undefined ? data.latitude : data.lat;
  if (updateLat !== undefined) {
    patch.latitude = updateLat !== '' && updateLat != null && !isNaN(Number(updateLat)) ? Number(updateLat) : null;
  }
  const updateLng = data.longitude !== undefined ? data.longitude : data.lng;
  if (updateLng !== undefined) {
    patch.longitude = updateLng !== '' && updateLng != null && !isNaN(Number(updateLng)) ? Number(updateLng) : null;
  }
  if (data.clearanceLevel !== undefined || data.clearance_level !== undefined) {
    patch.clearance_level = String(data.clearanceLevel ?? data.clearance_level).substring(0, 40);
  }

  if (Object.keys(patch).length > 0) {
    await agency.update(patch);
  }

  // Update linked user if needed
  let newEmblem = data.avatar_url ?? data.logo_url ?? data.emblem_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (agency.user_id && db.User) {
    linkedUser = await db.User.findByPk(agency.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newEmblem !== undefined) userPatch.avatar_url = newEmblem || null;
      if (effectiveContactName) userPatch.name = effectiveContactName;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (patch.address !== undefined) userPatch.address = patch.address;
      if (patch.city !== undefined) userPatch.city = patch.city;
      if (patch.state !== undefined) userPatch.state = patch.state;
      if (patch.pincode !== undefined) userPatch.pincode = patch.pincode;
      if (patch.country !== undefined) userPatch.country = patch.country;
      if (patch.place_id !== undefined) userPatch.place_id = patch.place_id;
      if (patch.latitude !== undefined) userPatch.latitude = patch.latitude;
      if (patch.longitude !== undefined) userPatch.longitude = patch.longitude;
      if (patch.department !== undefined) userPatch.department = patch.department;
      if (patch.clearance_level !== undefined) userPatch.clearance = patch.clearance_level;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'government_agency_updated',
          title: 'Government Agency Profile Updated',
          body: 'Your government agency profile details have been updated by Super Admin.',
          severity: 'info',
          skipEmail: true,
          data: { agencyId: agency.id },
        });

        // In-app alert to active Super Admins
        const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
        if (superAdminRole) {
          const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
          for (const sa of superAdmins) {
            if (sa.id !== req.user?.id) {
              await notificationService.send({
                userId: sa.id,
                eventKey: 'government_agency_updated',
                title: `Government Profile Updated: ${agency.name}`,
                body: `${agency.name} details have been updated.`,
                severity: 'info',
                skipEmail: true,
              }).catch(() => {});
            }
          }
        }

        await emailService.sendProfileUpdatedEmail({ user: linkedUser }).catch(() => {});
      } catch (_) {}
    }
  }

  // 1. Handle removed documents FIRST (so new documents created below are not marked as removed)
  let toRemoveIds = data.removedDocumentIds || [];
  if (Array.isArray(data.documents) && toRemoveIds.length === 0) {
    const retainedIds = data.documents.map((d) => Number(d.id)).filter((id) => Boolean(id) && !isNaN(id));
    const currentDbDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
      attributes: ['id'],
    });
    toRemoveIds = currentDbDocs.map((d) => d.id).filter((id) => !retainedIds.includes(id));
  }

  if (db.MediaAsset && Array.isArray(toRemoveIds) && toRemoveIds.length > 0) {
    const StorageService = require('../../services/StorageService');
    const toRemove = await db.MediaAsset.findAll({
      where: {
        id: { [Op.in]: toRemoveIds },
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
    });
    for (const asset of toRemove) {
      if (asset.storage_key) {
        await StorageService.remove(asset.storage_key).catch(() => {});
        await StorageService.removeDocument(asset.storage_key).catch(() => {});
      }
      await asset.destroy().catch(() => {});
    }
  }

  // 2. Handle new documents AFTER removals
  let newDocs = data.newDocuments;
  if (!newDocs && Array.isArray(data.documents)) {
    newDocs = data.documents.filter((d) => !d.id || d.isPendingUpload);
  }
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      const docUrl = doc.url || doc.filePath || doc.file_url || (typeof doc === 'string' ? doc : null);
      if (docUrl) {
        const rawPurpose = doc.category || doc.purpose || 'Official Document';
        const safePurpose = String(rawPurpose).substring(0, 80);
        const storageKey = doc.storage_key || doc.key || doc.fileName || doc.name || null;
        await db.MediaAsset.create({
          owner_type: 'government',
          owner_id: agency.id,
          purpose: safePurpose,
          storage_key: storageKey,
          url: docUrl,
          mime: doc.type || doc.fileType || doc.mime || null,
          size: parseDocSize(doc.size || doc.fileSize),
          status: 'available',
          uploaded_by: req.user?.id || null,
        });
      }
    }
  }

  // Re-fetch all active documents and attach to returned agency
  let formattedDocs = [];
  if (db.MediaAsset) {
    const activeDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    formattedDocs = activeDocs.map((d) => {
      const plain = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...plain,
        file_name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        category: plain.purpose || 'Department Authorization Letter',
      };
    });
  }

  const currentEmblem = newEmblem || agency.user?.avatar_url || null;
  const plainAgency = typeof agency.toJSON === 'function' ? agency.toJSON() : { ...agency };
  plainAgency.documents = formattedDocs;
  plainAgency.avatar_url = currentEmblem;
  plainAgency.logo_url = currentEmblem;
  plainAgency.emblem_url = currentEmblem;
  return apiResponse.success(res, plainAgency, 'Government agency updated successfully.');
}
```

<a id="put-api-v1-government-id"></a>
## PUT /api/v1/government/:id

```javascript
async function updateGovernment(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const data = req.body || {};
  const patch = {};
  [
    'agency_name', 'department', 'contact_name', 'email', 'phone',
    'office_address', 'address', 'city', 'state', 'pincode', 'country',
    'place_id', 'latitude', 'longitude', 'jurisdiction', 'authorized_city', 'status'
  ].forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });

  const effectiveAgencyName = data.agencyName || data.agency_name;
  if (effectiveAgencyName) {
    patch.agency_name = effectiveAgencyName;
    patch.name = effectiveAgencyName;
  }

  const effectiveContactName = data.contactName || data.contact_name || data.name;
  if (effectiveContactName) {
    patch.contact_name = effectiveContactName;
  }
  if (data.officeAddress !== undefined) patch.office_address = data.officeAddress;
  if (data.authorizedCity !== undefined) patch.authorized_city = data.authorizedCity;
  if (data.placeId !== undefined) patch.place_id = data.placeId;
  const updateLat = data.latitude !== undefined ? data.latitude : data.lat;
  if (updateLat !== undefined) {
    patch.latitude = updateLat !== '' && updateLat != null && !isNaN(Number(updateLat)) ? Number(updateLat) : null;
  }
  const updateLng = data.longitude !== undefined ? data.longitude : data.lng;
  if (updateLng !== undefined) {
    patch.longitude = updateLng !== '' && updateLng != null && !isNaN(Number(updateLng)) ? Number(updateLng) : null;
  }
  if (data.clearanceLevel !== undefined || data.clearance_level !== undefined) {
    patch.clearance_level = String(data.clearanceLevel ?? data.clearance_level).substring(0, 40);
  }

  if (Object.keys(patch).length > 0) {
    await agency.update(patch);
  }

  // Update linked user if needed
  let newEmblem = data.avatar_url ?? data.logo_url ?? data.emblem_url ?? data.avatarUrl ?? data.logoUrl;
  let linkedUser = null;
  if (agency.user_id && db.User) {
    linkedUser = await db.User.findByPk(agency.user_id);
    if (linkedUser) {
      const userPatch = {};
      if (newEmblem !== undefined) userPatch.avatar_url = newEmblem || null;
      if (effectiveContactName) userPatch.name = effectiveContactName;
      if (data.phone) userPatch.phone = data.phone;
      if (data.email) userPatch.email = data.email;
      if (patch.address !== undefined) userPatch.address = patch.address;
      if (patch.city !== undefined) userPatch.city = patch.city;
      if (patch.state !== undefined) userPatch.state = patch.state;
      if (patch.pincode !== undefined) userPatch.pincode = patch.pincode;
      if (patch.country !== undefined) userPatch.country = patch.country;
      if (patch.place_id !== undefined) userPatch.place_id = patch.place_id;
      if (patch.latitude !== undefined) userPatch.latitude = patch.latitude;
      if (patch.longitude !== undefined) userPatch.longitude = patch.longitude;
      if (patch.department !== undefined) userPatch.department = patch.department;
      if (patch.clearance_level !== undefined) userPatch.clearance = patch.clearance_level;
      if (data.password && data.password.trim()) {
        userPatch.password_hash = await db.User.hashPassword(data.password.trim());
      }
      if (Object.keys(userPatch).length > 0) {
        await linkedUser.update(userPatch);
      }

      // Notification dispatch for profile update
      try {
        await notificationService.send({
          userId: linkedUser.id,
          eventKey: 'government_agency_updated',
          title: 'Government Agency Profile Updated',
          body: 'Your government agency profile details have been updated by Super Admin.',
          severity: 'info',
          skipEmail: true,
          data: { agencyId: agency.id },
        });

        // In-app alert to active Super Admins
        const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
        if (superAdminRole) {
          const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
          for (const sa of superAdmins) {
            if (sa.id !== req.user?.id) {
              await notificationService.send({
                userId: sa.id,
                eventKey: 'government_agency_updated',
                title: `Government Profile Updated: ${agency.name}`,
                body: `${agency.name} details have been updated.`,
                severity: 'info',
                skipEmail: true,
              }).catch(() => {});
            }
          }
        }

        await emailService.sendProfileUpdatedEmail({ user: linkedUser }).catch(() => {});
      } catch (_) {}
    }
  }

  // 1. Handle removed documents FIRST (so new documents created below are not marked as removed)
  let toRemoveIds = data.removedDocumentIds || [];
  if (Array.isArray(data.documents) && toRemoveIds.length === 0) {
    const retainedIds = data.documents.map((d) => Number(d.id)).filter((id) => Boolean(id) && !isNaN(id));
    const currentDbDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
      attributes: ['id'],
    });
    toRemoveIds = currentDbDocs.map((d) => d.id).filter((id) => !retainedIds.includes(id));
  }

  if (db.MediaAsset && Array.isArray(toRemoveIds) && toRemoveIds.length > 0) {
    const StorageService = require('../../services/StorageService');
    const toRemove = await db.MediaAsset.findAll({
      where: {
        id: { [Op.in]: toRemoveIds },
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
      },
    });
    for (const asset of toRemove) {
      if (asset.storage_key) {
        await StorageService.remove(asset.storage_key).catch(() => {});
        await StorageService.removeDocument(asset.storage_key).catch(() => {});
      }
      await asset.destroy().catch(() => {});
    }
  }

  // 2. Handle new documents AFTER removals
  let newDocs = data.newDocuments;
  if (!newDocs && Array.isArray(data.documents)) {
    newDocs = data.documents.filter((d) => !d.id || d.isPendingUpload);
  }
  if (db.MediaAsset && Array.isArray(newDocs) && newDocs.length > 0) {
    for (const doc of newDocs) {
      const docUrl = doc.url || doc.filePath || doc.file_url || (typeof doc === 'string' ? doc : null);
      if (docUrl) {
        const rawPurpose = doc.category || doc.purpose || 'Official Document';
        const safePurpose = String(rawPurpose).substring(0, 80);
        const storageKey = doc.storage_key || doc.key || doc.fileName || doc.name || null;
        await db.MediaAsset.create({
          owner_type: 'government',
          owner_id: agency.id,
          purpose: safePurpose,
          storage_key: storageKey,
          url: docUrl,
          mime: doc.type || doc.fileType || doc.mime || null,
          size: parseDocSize(doc.size || doc.fileSize),
          status: 'available',
          uploaded_by: req.user?.id || null,
        });
      }
    }
  }

  // Re-fetch all active documents and attach to returned agency
  let formattedDocs = [];
  if (db.MediaAsset) {
    const activeDocs = await db.MediaAsset.findAll({
      where: {
        owner_type: { [Op.in]: ['government', 'government_agency', 'user'] },
        owner_id: { [Op.in]: [agency.id, agency.user_id].filter(Boolean) },
        status: 'available',
      },
      order: [['id', 'DESC']],
    });
    formattedDocs = activeDocs.map((d) => {
      const plain = typeof d.toJSON === 'function' ? d.toJSON() : d;
      return {
        ...plain,
        file_name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        name: plain.storage_key || plain.purpose || `Doc #${plain.id}`,
        category: plain.purpose || 'Department Authorization Letter',
      };
    });
  }

  const currentEmblem = newEmblem || agency.user?.avatar_url || null;
  const plainAgency = typeof agency.toJSON === 'function' ? agency.toJSON() : { ...agency };
  plainAgency.documents = formattedDocs;
  plainAgency.avatar_url = currentEmblem;
  plainAgency.logo_url = currentEmblem;
  plainAgency.emblem_url = currentEmblem;
  return apiResponse.success(res, plainAgency, 'Government agency updated successfully.');
}
```

<a id="patch-api-v1-government-id-status"></a>
## PATCH /api/v1/government/:id/status

```javascript
async function setGovernmentStatus(req, res) {
  const agency = await db.GovernmentAgency.findByPk(req.params.id);
  if (!agency) throw new AppError('NOT_FOUND', 'Government agency not found.');

  const { status } = req.body || {};
  if (!status) throw new AppError('VALIDATION_FAILED', 'Status is required.');

  const prevStatus = agency.status;
  await agency.update({ status });
  if (agency.user_id && db.User) {
    const user = await db.User.findByPk(agency.user_id);
    if (user) {
      const userNextStatus = (status === 'approved' || status === 'active') ? 'active' : (status === 'inactive' ? 'inactive' : 'suspended');
      await user.update({ status: userNextStatus });
      if (userNextStatus === 'suspended' || userNextStatus === 'inactive') {
        const tokenService = require('../auth/token.service');
        await tokenService.revokeAllForUser(user.id).catch(() => {});
      }

      // Notification Dispatch for Status Toggle
      try {
        const isSuspended = status === 'suspended';
        const isDeactivated = status === 'inactive' || status === 'deactivated';
        const isActivated = status === 'active' || status === 'approved';
        const statusTitle = isSuspended 
          ? 'Account Suspended' 
          : (isDeactivated 
            ? 'Account Deactivated' 
            : (isActivated ? 'Account Activated' : `Account Status: ${status}`));
        const statusBody = isSuspended 
          ? 'Your government agency account has been suspended by Super Admin.' 
          : (isDeactivated 
            ? 'Your government agency account has been deactivated by Super Admin.' 
            : (isActivated ? 'Your government agency account has been activated and restored by Super Admin.' : `Your government agency account status was set to ${status}.`));

        // Send in-app notification with skipEmail: true to avoid duplicate raw email
        await notificationService.send({
          userId: user.id,
          eventKey: 'user_status_changed',
          title: statusTitle,
          body: statusBody,
          severity: (isSuspended || isDeactivated) ? 'critical' : 'info',
          bypassQuietHours: isSuspended || isDeactivated,
          skipEmail: true,
        }).catch(() => {});

        // Send formatted transactional status email
        await emailService.sendAccountStatusEmail({ user, status }).catch(() => {});

        // In-app alert to active Super Admins
        const superAdminRole = await db.Role.findOne({ where: { code: 'ROLE-SUPER-ADMIN' } }).catch(() => null);
        if (superAdminRole) {
          const superAdmins = await db.User.findAll({ where: { role_id: superAdminRole.id, status: 'active' } }).catch(() => []);
          for (const sa of superAdmins) {
            if (sa.id !== req.user?.id) {
              await notificationService.send({
                userId: sa.id,
                eventKey: 'government_status_changed',
                title: `Agency Status: ${agency.name} (${status})`,
                body: `Government Agency "${agency.name}" status changed from ${prevStatus} to ${status}.`,
                severity: isSuspended ? 'warning' : 'info',
                skipEmail: true,
              }).catch(() => {});
            }
          }
        }
      } catch (_) {}
    }
  }

  // Audit activity log
  const ActivityLogger = require('../../utils/ActivityLogger');
  ActivityLogger.log({
    logName: 'GOVERNMENT',
    event: 'status_changed',
    description: `Government agency "${agency.name}" status changed to ${status}`,
    subject: { type: 'GovernmentAgency', id: agency.id },
    causer: req?.user ? { type: 'User', id: req.user.id } : null,
    severity: status === 'suspended' ? 'WARNING' : 'INFO',
    properties: { agencyId: agency.id, previousStatus: prevStatus, newStatus: status },
  }).catch(() => {});

  return apiResponse.success(res, agency, 'Government agency status updated.');
}
```

<a id="get-api-v1-government-analytics"></a>
## GET /api/v1/government/analytics

```javascript
async function govAgencyAnalytics(req, res) {
  return apiResponse.success(res, await campaignService.getGovAnalytics(req));
}
```

<a id="get-api-v1-government-clearance-levels"></a>
## GET /api/v1/government/clearance-levels

```javascript
async function listGovClearanceLevels(req, res) {
  const list = db.GovernmentClearanceLevel ? await db.GovernmentClearanceLevel.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['level_number', 'ASC'], ['name', 'ASC']],
  }) : [];
  return apiResponse.success(res, list);
}
```

<a id="get-api-v1-government-department-categories"></a>
## GET /api/v1/government/department-categories

```javascript
async function listGovDepartmentCategories(req, res) {
  const list = db.GovernmentDepartmentCategory ? await db.GovernmentDepartmentCategory.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  }) : [];
  return apiResponse.success(res, list);
}
```

<a id="get-api-v1-government-jurisdictions"></a>
## GET /api/v1/government/jurisdictions

```javascript
async function listGovJurisdictions(req, res) {
  const list = db.GovernmentJurisdiction ? await db.GovernmentJurisdiction.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  }) : [];
  return apiResponse.success(res, list);
}
```

<a id="get-api-v1-government-meta-options"></a>
## GET /api/v1/government/meta/options

```javascript
async function getGovernmentMetaOptions(req, res) {
  const [departments, jurisdictions, clearanceLevels] = await Promise.all([
    db.GovernmentDepartmentCategory ? db.GovernmentDepartmentCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    }) : [],
    db.GovernmentJurisdiction ? db.GovernmentJurisdiction.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    }) : [],
    db.GovernmentClearanceLevel ? db.GovernmentClearanceLevel.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['level_number', 'ASC'], ['name', 'ASC']],
    }) : [],
  ]);

  return apiResponse.success(res, {
    departments,
    jurisdictions,
    clearanceLevels,
  });
}
```

<a id="get-api-v1-gps-devices"></a>
## GET /api/v1/gps-devices

```javascript
async function listGpsDevices(req, res) {
  return apiResponse.success(res, await s.listGpsDevices(req.query, req));
}
```

<a id="post-api-v1-gps-devices"></a>
## POST /api/v1/gps-devices

```javascript
async function registerGpsDevice(req, res) {
  return apiResponse.created(res, await s.registerGpsDevice(req.body, req), 'GPS device registered.');
}
```

<a id="delete-api-v1-gps-devices-id"></a>
## DELETE /api/v1/gps-devices/:id

```javascript
async function deleteGpsDevice(req, res) {
  return apiResponse.success(res, await s.deleteGpsDevice(req.params.id, req), 'GPS device deleted.');
}
```

<a id="get-api-v1-gps-devices-id"></a>
## GET /api/v1/gps-devices/:id

```javascript
async function getGpsDevice(req, res) {
  return apiResponse.success(res, await s.getGpsDevice(req.params.id, req));
}
```

<a id="patch-api-v1-gps-devices-id"></a>
## PATCH /api/v1/gps-devices/:id

```javascript
async function updateGpsDevice(req, res) {
  return apiResponse.success(res, await s.updateGpsDevice(req.params.id, req.body, req), 'GPS device updated.');
}
```

<a id="post-api-v1-gps-devices-id-approve"></a>
## POST /api/v1/gps-devices/:id/approve

```javascript
async function approveGpsDevice(req, res) {
  return apiResponse.success(res, await s.approveGpsDevice(req.params.id, req), 'GPS device approved.');
}
```

<a id="post-api-v1-gps-devices-id-assign"></a>
## POST /api/v1/gps-devices/:id/assign

```javascript
async function assignGpsDevice(req, res) {
  const vehicleId = req.body.vehicleId !== undefined ? req.body.vehicleId : req.body.vehicle_id;
  return apiResponse.success(res, await s.assignGpsDevice(req.params.id, vehicleId, req), 'GPS assigned.');
}
```

<a id="post-api-v1-gps-devices-id-reject"></a>
## POST /api/v1/gps-devices/:id/reject

```javascript
async function rejectGpsDevice(req, res) {
  return apiResponse.success(res, await s.rejectGpsDevice(req.params.id, req.body.reason, req), 'GPS device rejected.');
}
```

<a id="post-api-v1-i18n"></a>
## POST /api/v1/i18n

```javascript
async function upsertTranslation(req, res) {
  return apiResponse.created(res, await contentService.upsertTranslation(req.body), 'Translation saved.');
}
```

<a id="get-api-v1-i18n-lang"></a>
## GET /api/v1/i18n/:lang

```javascript
async function i18nBundle(req, res) {
  return apiResponse.success(res, await contentService.i18nBundle(req.params.lang));
}
```

<a id="post-api-v1-i18n-auto-translate"></a>
## POST /api/v1/i18n/auto-translate

```javascript
async function autoTranslateLanguage(req, res) {
  const result = await contentService.autoTranslateLanguage(req.body);
  return apiResponse.success(res, result, 'Auto-translation completed successfully.');
}
```

<a id="post-api-v1-i18n-bulk"></a>
## POST /api/v1/i18n/bulk

```javascript
async function bulkUpsertTranslations(req, res) {
  return apiResponse.success(res, await contentService.bulkUpsertTranslations(req.body), 'Bulk translations saved.');
}
```

<a id="get-api-v1-i18n-keys"></a>
## GET /api/v1/i18n/keys

```javascript
async function listTranslationKeys(req, res) {
  const { namespace, search, page, limit } = req.query;
  return apiResponse.success(res, await contentService.listTranslationKeys({ namespace, search, page, limit }));
}
```

<a id="post-api-v1-i18n-keys"></a>
## POST /api/v1/i18n/keys

```javascript
async function createTranslationKey(req, res) {
  return apiResponse.created(res, await contentService.createTranslationKey(req.body), 'Translation key created successfully.');
}
```

<a id="delete-api-v1-i18n-keys-id"></a>
## DELETE /api/v1/i18n/keys/:id

```javascript
async function deleteTranslationKey(req, res) {
  return apiResponse.success(res, await contentService.deleteTranslationKey(req.params.id), 'Translation key deleted successfully.');
}
```

<a id="put-api-v1-i18n-keys-id"></a>
## PUT /api/v1/i18n/keys/:id

```javascript
async function updateTranslationKey(req, res) {
  return apiResponse.success(res, await contentService.updateTranslationKey(req.params.id, req.body), 'Translation key updated successfully.');
}
```

<a id="get-api-v1-i18n-languages"></a>
## GET /api/v1/i18n/languages

```javascript
async function listLanguages(req, res) {
  return apiResponse.success(res, await contentService.listLanguages());
}
```

<a id="post-api-v1-i18n-languages"></a>
## POST /api/v1/i18n/languages

```javascript
async function createLanguage(req, res) {
  return apiResponse.created(res, await contentService.createLanguage(req.body), 'Language created successfully.');
}
```

<a id="delete-api-v1-i18n-languages-id"></a>
## DELETE /api/v1/i18n/languages/:id

```javascript
async function deleteLanguage(req, res) {
  return apiResponse.success(res, await contentService.deleteLanguage(req.params.id), 'Language deleted successfully.');
}
```

<a id="put-api-v1-i18n-languages-id"></a>
## PUT /api/v1/i18n/languages/:id

```javascript
async function updateLanguage(req, res) {
  return apiResponse.success(res, await contentService.updateLanguage(req.params.id, req.body), 'Language updated successfully.');
}
```

<a id="post-api-v1-i18n-translate-single"></a>
## POST /api/v1/i18n/translate-single

```javascript
async function translateSingleKey(req, res) {
  const result = await contentService.translateSingleKey(req.body);
  return apiResponse.success(res, result, 'Single translation completed.');
}
```

<a id="patch-api-v1-incidents-id-resolution"></a>
## PATCH /api/v1/incidents/:id/resolution

```javascript
async function updateIncidentResolution(req, res) {
  return apiResponse.success(res, await s.incidents.updateResolution(req.params.id, req.body, req), 'Incident resolution updated.');
}
```

<a id="patch-api-v1-incidents-id-status"></a>
## PATCH /api/v1/incidents/:id/status

```javascript
async function setIncidentStatus(req, res) {
  return apiResponse.success(res, await s.incidents.setStatus(req.params.id, req.body.status, req), 'Status updated.');
}
```

<a id="get-api-v1-invitations"></a>
## GET /api/v1/invitations

```javascript
async (req, res) => {
  const orgId = req.isPlatformScope ? (req.query.organizationId || null) : req.tenantId;
  const rows = await service.listInvitations({ status: req.query.status || 'pending', organizationId: orgId });
  return apiResponse.success(res, rows);
}
```

<a id="post-api-v1-invitations"></a>
## POST /api/v1/invitations

```javascript
async (req, res) => {
  const data = { ...req.body };
  if (!req.isPlatformScope) data.organizationId = req.tenantId;
  const result = await service.createInvitation(data, req.user);
  return apiResponse.created(res, result, 'Invitation sent.');
}
```

<a id="delete-api-v1-invitations-id"></a>
## DELETE /api/v1/invitations/:id

```javascript
async (req, res) => {
  return apiResponse.success(res, await service.revokeInvitation(req.params.id), 'Invitation revoked.');
}
```

<a id="post-api-v1-invitations-id-resend"></a>
## POST /api/v1/invitations/:id/resend

```javascript
async (req, res) => {
  return apiResponse.success(res, await service.resendInvitation(req.params.id), 'Invitation resent.');
}
```

<a id="get-api-v1-me-driver-active-route"></a>
## GET /api/v1/me/driver/active-route

```javascript
async function activeRoute(req, res) {
  return apiResponse.success(res, await service.myActiveRoute(req));
}
```

<a id="get-api-v1-me-driver-documents"></a>
## GET /api/v1/me/driver/documents

```javascript
async function documents(req, res) {
  return apiResponse.success(res, await service.myDocuments(req));
}
```

<a id="post-api-v1-me-driver-documents"></a>
## POST /api/v1/me/driver/documents

```javascript
async function upsertDocument(req, res) {
  return apiResponse.created(res, await service.upsertDocument(req, req.body), 'Document saved.');
}
```

<a id="delete-api-v1-me-driver-documents-id"></a>
## DELETE /api/v1/me/driver/documents/:id

```javascript
async function deleteDocument(req, res) {
  return apiResponse.success(res, await service.deleteDocument(req, req.params.id), 'Document removed successfully.');
}
```

<a id="patch-api-v1-me-driver-duty-status"></a>
## PATCH /api/v1/me/driver/duty-status

```javascript
async function setDutyStatus(req, res) {
  return apiResponse.success(res, await service.setDutyStatus(req, req.body.status), 'Duty status updated.');
}
```

<a id="get-api-v1-me-driver-incidents"></a>
## GET /api/v1/me/driver/incidents

```javascript
async function incidents(req, res) {
  return apiResponse.success(res, await service.myIncidents(req));
}
```

<a id="post-api-v1-me-driver-incidents"></a>
## POST /api/v1/me/driver/incidents

```javascript
async function reportIncident(req, res) {
  return apiResponse.created(res, await service.reportIncident(req, req.body), 'Incident reported.');
}
```

<a id="get-api-v1-me-driver-incidents-id"></a>
## GET /api/v1/me/driver/incidents/:id

```javascript
async function getIncidentById(req, res) {
  return apiResponse.success(res, await service.getIncidentById(req, req.params.id));
}
```

<a id="get-api-v1-me-driver-profile"></a>
## GET /api/v1/me/driver/profile

```javascript
async function profile(req, res) {
  return apiResponse.success(res, await service.myProfile(req));
}
```

<a id="get-api-v1-me-driver-schedule"></a>
## GET /api/v1/me/driver/schedule

```javascript
async function schedule(req, res) {
  return apiResponse.success(res, await service.mySchedule(req));
}
```

<a id="post-api-v1-me-driver-trip-end"></a>
## POST /api/v1/me/driver/trip/end

```javascript
async function endTrip(req, res) {
  return apiResponse.success(res, await service.endTrip(req, req.body), 'Trip completed successfully!');
}
```

<a id="post-api-v1-me-driver-trip-start"></a>
## POST /api/v1/me/driver/trip/start

```javascript
async function startTrip(req, res) {
  return apiResponse.success(res, await service.startTrip(req, req.body), 'Trip started successfully!');
}
```

<a id="get-api-v1-me-driver-trips"></a>
## GET /api/v1/me/driver/trips

```javascript
async function trips(req, res) {
  const { rows, meta } = await service.myTrips(req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-me-support-tickets"></a>
## GET /api/v1/me/support/tickets

```javascript
async function mine(req, res) {
  const { rows, meta } = await svc.myTickets(req, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-me-technician-stats"></a>
## GET /api/v1/me/technician/stats

```javascript
async function stats(req, res) {
  return apiResponse.success(res, await service.technicianStats(req));
}
```

<a id="get-api-v1-me-technician-work-orders"></a>
## GET /api/v1/me/technician/work-orders

```javascript
async function mine(req, res) {
  const { rows, meta } = await service.myWorkOrders(req, req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-me-technician-work-orders-id"></a>
## GET /api/v1/me/technician/work-orders/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await service.getById(req.params.id, req));
}
```

<a id="patch-api-v1-me-technician-work-orders-id-status"></a>
## PATCH /api/v1/me/technician/work-orders/:id/status

```javascript
async function setStatus(req, res) {
  return apiResponse.success(res, await service.setStatus(req.params.id, req.body.status, req.body, req), 'Status updated.');
}
```

<a id="delete-api-v1-notifications"></a>
## DELETE /api/v1/notifications

```javascript
async function clearAll(req, res) {
  await db.Notification.destroy({ where: { user_id: req.user.id } });
  return apiResponse.success(res, { ok: true }, 'All notifications cleared.');
}
```

<a id="get-api-v1-notifications"></a>
## GET /api/v1/notifications

```javascript
async function list(req, res) {
  const rows = await db.Notification.findAll({ where: { user_id: req.user.id }, order: [['id', 'DESC']], limit: 50 });
  return apiResponse.success(res, rows);
}
```

<a id="delete-api-v1-notifications-id"></a>
## DELETE /api/v1/notifications/:id

```javascript
async function remove(req, res) {
  await db.Notification.destroy({ where: { id: req.params.id, user_id: req.user.id } });
  return apiResponse.success(res, { ok: true }, 'Notification removed.');
}
```

<a id="post-api-v1-notifications-id-read"></a>
## POST /api/v1/notifications/:id/read

```javascript
async function markRead(req, res) {
  await db.Notification.update({ read_at: new Date() }, { where: { id: req.params.id, user_id: req.user.id } });
  return apiResponse.success(res, { ok: true }, 'Notification marked as read.');
}
```

<a id="get-api-v1-notifications-delivery-logs"></a>
## GET /api/v1/notifications/delivery-logs

```javascript
async function getDeliveryLogs(req, res) {
  const notificationLogService = require('../../services/notificationLog.service');
  const result = await notificationLogService.getLogs(req.query);
  return apiResponse.success(res, result);
}
```

<a id="post-api-v1-notifications-delivery-logs-id-retry"></a>
## POST /api/v1/notifications/delivery-logs/:id/retry

```javascript
async function retryDeliveryLog(req, res) {
  const notificationLogService = require('../../services/notificationLog.service');
  const result = await notificationLogService.retryNotification(req.params.id);
  return apiResponse.success(res, result, 'Notification retry dispatched.');
}
```

<a id="get-api-v1-notifications-delivery-logs-stats"></a>
## GET /api/v1/notifications/delivery-logs/stats

```javascript
async function getDeliveryLogStats(req, res) {
  const notificationLogService = require('../../services/notificationLog.service');
  const stats = await notificationLogService.getStats();
  return apiResponse.success(res, stats);
}
```

<a id="post-api-v1-notifications-read-all"></a>
## POST /api/v1/notifications/read-all

```javascript
async function markAllRead(req, res) {
  await db.Notification.update({ read_at: new Date() }, { where: { user_id: req.user.id, read_at: null } });
  return apiResponse.success(res, { ok: true }, 'All notifications marked as read.');
}
```

<a id="get-api-v1-notifications-settings"></a>
## GET /api/v1/notifications/settings

```javascript
async function getSettings(req, res) {
  return apiResponse.success(res, await service.getSettings(req.user.id));
}
```

<a id="patch-api-v1-notifications-settings"></a>
## PATCH /api/v1/notifications/settings

```javascript
async function updateSettings(req, res) {
  return apiResponse.success(res, await service.updateSettings(req.user.id, req.body), 'Settings updated.');
}
```

<a id="patch-api-v1-notifications-settings-preferences-eventtypeid"></a>
## PATCH /api/v1/notifications/settings/preferences/:eventTypeId

```javascript
async function togglePreference(req, res) {
  return apiResponse.success(res, await service.togglePreference(req.user.id, req.params.eventTypeId, req.body.enabled), 'Preference updated.');
}
```

<a id="get-api-v1-notifications-sms"></a>
## GET /api/v1/notifications/sms

```javascript
async function getSms(req, res) {
  const rows = await db.PlatformSetting.findAll({ where: { group: 'sms_whatsapp' } });
  const map = {};
  if (rows) rows.forEach((r) => { map[r.key] = r.value; });

  return apiResponse.success(res, {
    twilio_account_sid: map.twilio_account_sid || 'AC_TWILIO_ACCOUNT_SID_SAMPLE',
    twilio_auth_token: map.twilio_auth_token ? (map.twilio_auth_token.length > 8 ? `${map.twilio_auth_token.slice(0, 4)}••••${map.twilio_auth_token.slice(-4)}` : '••••••••') : '',
    twilio_from_number: map.twilio_from_number || '+18005550199',
    sender_id: map.dlt_sender_id || 'VMVEXA',
    dlt_entity_id: map.dlt_entity_id || '1101552340000021',
    critical_only: map.critical_only === 'true' || map.critical_only === true,
    whatsapp_fallback: map.whatsapp_fallback === 'true' || map.whatsapp_fallback === true,
    live_sms_enabled: map.live_sms_enabled === 'true' || map.live_sms_enabled === true || false,
    mode: (map.live_sms_enabled === 'true' || map.live_sms_enabled === true || process.env.ENABLE_LIVE_SMS === 'true') ? 'live' : 'log_only',
    configured: Boolean(map.twilio_account_sid && map.twilio_auth_token),
  });
}
```

<a id="put-api-v1-notifications-sms"></a>
## PUT /api/v1/notifications/sms

```javascript
async function updateSms(req, res) {
  const items = [
    { key: 'twilio_from_number', value: String(req.body.twilio_from_number || '') },
    { key: 'dlt_sender_id', value: String(req.body.sender_id || 'VMVEXA') },
    { key: 'dlt_entity_id', value: String(req.body.dlt_entity_id || '') },
    { key: 'critical_only', value: String(Boolean(req.body.critical_only)), data_type: 'boolean' },
    { key: 'whatsapp_fallback', value: String(Boolean(req.body.whatsapp_fallback)), data_type: 'boolean' },
    { key: 'live_sms_enabled', value: String(Boolean(req.body.live_sms_enabled)), data_type: 'boolean' },
  ];

  if (req.body.twilio_account_sid && !req.body.twilio_account_sid.includes('••••')) {
    items.push({ key: 'twilio_account_sid', value: String(req.body.twilio_account_sid), is_secret: true });
  }
  if (req.body.twilio_auth_token && !req.body.twilio_auth_token.includes('••••')) {
    items.push({ key: 'twilio_auth_token', value: String(req.body.twilio_auth_token), is_secret: true });
  }

  for (const item of items) {
    const existing = await db.PlatformSetting.findOne({ where: { group: 'sms_whatsapp', key: item.key } });
    if (existing) {
      await existing.update({ value: item.value, updated_by: req.user.id });
    } else {
      await db.PlatformSetting.create({
        group: 'sms_whatsapp',
        key: item.key,
        value: item.value,
        is_secret: item.is_secret || false,
        data_type: item.data_type || 'string',
        label: item.key.replace(/_/g, ' ').toUpperCase(),
        updated_by: req.user.id,
      });
    }
  }

  try {
    const smsService = require('../../services/sms.service');
    if (smsService.clearSmsConfigCache) smsService.clearSmsConfigCache();
  } catch (_) {}

  return getSms(req, res);
}
```

<a id="get-api-v1-notifications-smtp"></a>
## GET /api/v1/notifications/smtp

```javascript
async function getSmtp(req, res) {
  const emailService = require('../../services/email.service');
  const cfg = await emailService.getSmtpConfig();
  return apiResponse.success(res, {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    pass: cfg.pass ? '••••••••' : '',
    from: cfg.from,
    secure: cfg.secure,
    smtp_host: cfg.host,
    smtp_port: cfg.port,
    smtp_user: cfg.user,
    smtp_pass: cfg.pass ? '••••••••' : '',
    smtp_from: cfg.from,
    smtp_secure: cfg.secure,
    configured: Boolean(cfg.host && cfg.user),
  });
}
```

<a id="put-api-v1-notifications-smtp"></a>
## PUT /api/v1/notifications/smtp

```javascript
async function updateSmtp(req, res) {
  const emailService = require('../../services/email.service');
  const cfg = await emailService.saveSmtpConfig(req.body, req.user.id);
  return apiResponse.success(res, {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    pass: cfg.pass ? '••••••••' : '',
    from: cfg.from,
    secure: cfg.secure,
    smtp_host: cfg.host,
    smtp_port: cfg.port,
    smtp_user: cfg.user,
    smtp_pass: cfg.pass ? '••••••••' : '',
    smtp_from: cfg.from,
    smtp_secure: cfg.secure,
    configured: Boolean(cfg.host && cfg.user),
  }, 'SMTP configuration saved successfully.');
}
```

<a id="post-api-v1-notifications-test-email"></a>
## POST /api/v1/notifications/test-email

```javascript
async function testEmail(req, res) {
  const emailService = require('../../services/email.service');
  const recipient = req.body.to || req.user.email || 'superadmin@gmail.com';
  
  // If credentials are provided in body, test those directly; otherwise test configured
  const testCfg = {
    host: req.body.host,
    port: req.body.port,
    user: req.body.user,
    pass: req.body.pass,
    secure: req.body.secure,
  };

  if (!testCfg.host || !testCfg.user || !testCfg.pass || testCfg.pass.includes('••••')) {
    const saved = await emailService.getSmtpConfig();
    testCfg.host = testCfg.host || saved.host;
    testCfg.port = testCfg.port || saved.port;
    testCfg.user = testCfg.user || saved.user;
    testCfg.pass = (req.body.pass && !req.body.pass.includes('••••')) ? req.body.pass : saved.pass;
    testCfg.secure = testCfg.secure !== undefined ? testCfg.secure : saved.secure;
  }

  const verifyRes = await emailService.verifySmtpConnection(testCfg);
  const result = await emailService.sendMail({
    to: recipient,
    subject: '[VMOVEXA] Test Transactional Email',
    html: `<h2>VMOVEXA SMTP Connection Successful</h2><p>Your SMTP mail configuration on VMOVEXA ONE is verified and fully operational.</p><p>Timestamp: ${new Date().toISOString()}</p>`,
    text: 'VMOVEXA SMTP connection successful.',
  });

  return apiResponse.success(res, { ...verifyRes, mailResult: result }, `Test email dispatched to ${recipient}`);
}
```

<a id="post-api-v1-notifications-test-push"></a>
## POST /api/v1/notifications/test-push

```javascript
async function testPush(req, res) {
  const firebase = require('../../config/firebase');
  const result = await service.send({
    userId: req.user.id,
    eventKey: null,
    title: 'VMOVEXA Live Test Alert',
    body: 'This is a test notification verifying Firebase FCM & In-App delivery.',
  });
  return apiResponse.success(res, {
    ...result,
    fcmConfigured: firebase.isConfigured(),
    projectId: firebase.getProjectId(),
  }, 'Test push alert sent successfully.');
}
```

<a id="post-api-v1-notifications-test-sms"></a>
## POST /api/v1/notifications/test-sms

```javascript
async function testSms(req, res) {
  const { recipient, message } = req.body || {};
  if (!recipient) {
    return apiResponse.error(res, 'Recipient phone number is required (e.g. 8827079303 or +918827079303)', 400);
  }

  const smsService = require('../../services/sms.service');
  if (smsService.clearSmsConfigCache) smsService.clearSmsConfigCache();
  const sampleMsg = message || 'Hello from VMOVEXA! This is a test SMS confirming your Twilio gateway configuration.';
  const result = await smsService.sendSms({ to: recipient, message: sampleMsg });

  if (!result.sent) {
    return apiResponse.error(res, result.error || result.reason || 'Failed to dispatch SMS via Twilio', 400, result);
  }

  return apiResponse.success(res, result, `Test SMS dispatched successfully to ${result.to || recipient}`);
}
```

<a id="post-api-v1-notifications-test-whatsapp"></a>
## POST /api/v1/notifications/test-whatsapp

```javascript
async function testWhatsapp(req, res) {
  const { recipient, message } = req.body || {};
  if (!recipient) {
    return apiResponse.error(res, 'Recipient phone number is required (e.g. +919876543210)', 400);
  }

  const whatsappService = require('../../services/whatsapp.service');
  const sampleMsg = message || 'Hello from VMOVEXA! This is a test WhatsApp notification confirming your gateway configuration.';

  const result = await whatsappService.sendWhatsApp({
    to: recipient,
    message: sampleMsg,
    eventKey: 'test_whatsapp',
    userId: req.user?.id || null,
  });

  return apiResponse.success(
    res,
    { recipient, message: sampleMsg, status: result.sent ? 'delivered' : 'failed', ...result },
    `Test WhatsApp message processed for ${recipient}`
  );
}
```

<a id="get-api-v1-notifications-whatsapp"></a>
## GET /api/v1/notifications/whatsapp

```javascript
async function getWhatsapp(req, res) {
  const rows = await db.PlatformSetting.findAll({ where: { group: 'sms_whatsapp' } });
  const map = {};
  if (rows) rows.forEach((r) => { map[r.key] = r.value; });

  return apiResponse.success(res, {
    provider: map.whatsapp_provider || 'twilio',
    whatsapp_from_number: map.whatsapp_from_number || 'whatsapp:+14155238886',
    whatsapp_business_id: map.whatsapp_business_id || '',
    whatsapp_phone_number_id: map.whatsapp_phone_number_id || '',
    whatsapp_api_token: map.whatsapp_api_token ? (map.whatsapp_api_token.length > 8 ? `${map.whatsapp_api_token.slice(0, 4)}••••${map.whatsapp_api_token.slice(-4)}` : '••••••••') : '',
    whatsapp_webhook_secret: map.whatsapp_webhook_secret ? '••••••••' : '',
    default_language: map.whatsapp_default_language || 'en',
    whatsapp_fallback_sms: map.whatsapp_fallback_sms === 'true' || map.whatsapp_fallback_sms === true,
    critical_only: map.critical_only === 'true' || map.critical_only === true,
    enabled: map.whatsapp_enabled === 'true' || map.whatsapp_enabled === true || Boolean(map.whatsapp_from_number),
    configured: Boolean((map.whatsapp_from_number && map.twilio_account_sid) || map.whatsapp_api_token),
  });
}
```

<a id="put-api-v1-notifications-whatsapp"></a>
## PUT /api/v1/notifications/whatsapp

```javascript
async function updateWhatsapp(req, res) {
  const items = [
    { key: 'whatsapp_provider', value: String(req.body.provider || 'twilio') },
    { key: 'whatsapp_from_number', value: String(req.body.whatsapp_from_number || '') },
    { key: 'whatsapp_business_id', value: String(req.body.whatsapp_business_id || '') },
    { key: 'whatsapp_phone_number_id', value: String(req.body.whatsapp_phone_number_id || '') },
    { key: 'whatsapp_default_language', value: String(req.body.default_language || 'en') },
    { key: 'whatsapp_fallback_sms', value: String(Boolean(req.body.whatsapp_fallback_sms)), data_type: 'boolean' },
    { key: 'whatsapp_enabled', value: String(Boolean(req.body.enabled)), data_type: 'boolean' },
    { key: 'critical_only', value: String(Boolean(req.body.critical_only)), data_type: 'boolean' },
  ];

  if (req.body.whatsapp_api_token && !req.body.whatsapp_api_token.includes('••••')) {
    items.push({ key: 'whatsapp_api_token', value: String(req.body.whatsapp_api_token), is_secret: true });
  }
  if (req.body.whatsapp_webhook_secret && !req.body.whatsapp_webhook_secret.includes('••••')) {
    items.push({ key: 'whatsapp_webhook_secret', value: String(req.body.whatsapp_webhook_secret), is_secret: true });
  }

  for (const item of items) {
    const existing = await db.PlatformSetting.findOne({ where: { group: 'sms_whatsapp', key: item.key } });
    if (existing) {
      await existing.update({ value: item.value, updated_by: req.user.id });
    } else {
      await db.PlatformSetting.create({
        group: 'sms_whatsapp',
        key: item.key,
        value: item.value,
        is_secret: item.is_secret || false,
        data_type: item.data_type || 'string',
        label: item.key.replace(/_/g, ' ').toUpperCase(),
        updated_by: req.user.id,
      });
    }
  }

  return getWhatsapp(req, res);
}
```

<a id="get-api-v1-organizations"></a>
## GET /api/v1/organizations

```javascript
async function list(req, res) {
  const { rows, meta } = await orgService.list(req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-organizations"></a>
## POST /api/v1/organizations

```javascript
async function onboard(req, res) {
  const result = await orgService.onboard(req.body, req.user);
  return apiResponse.created(res, {
    organization: result.org,
    adminUser: result.adminUser,
    credentials: result.credentials,
    subscription: result.subscription,
    invoice: result.invoice,
    payment: result.payment,
    paymentMode: result.paymentMode,
    clonedRoles: result.clonedRoles,
  }, 'Tenant onboarded successfully.');
}
```

<a id="get-api-v1-organizations-id"></a>
## GET /api/v1/organizations/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await orgService.getById(req.params.id));
}
```

<a id="patch-api-v1-organizations-id"></a>
## PATCH /api/v1/organizations/:id

```javascript
async function update(req, res) {
  return apiResponse.success(res, await orgService.update(req.params.id, req.body), 'Organization updated.');
}
```

<a id="post-api-v1-organizations-id-approve"></a>
## POST /api/v1/organizations/:id/approve

```javascript
async function approve(req, res) {
  const result = await orgService.approveTenant(req.params.id, req.body, req.user?.id);
  return apiResponse.success(res, result, 'Tenant approved successfully.');
}
```

<a id="get-api-v1-organizations-id-features"></a>
## GET /api/v1/organizations/:id/features

```javascript
async function getFeatures(req, res) {
  return apiResponse.success(res, await orgService.getFeatures(req.params.id));
}
```

<a id="patch-api-v1-organizations-id-features"></a>
## PATCH /api/v1/organizations/:id/features

```javascript
async function setFeatures(req, res) {
  return apiResponse.success(res, await orgService.setFeatures(req.params.id, req.body.features), 'Features updated.');
}
```

<a id="post-api-v1-organizations-id-reject"></a>
## POST /api/v1/organizations/:id/reject

```javascript
async function reject(req, res) {
  const result = await orgService.rejectTenant(req.params.id, req.body, req.user?.id);
  return apiResponse.success(res, result, 'Tenant rejected.');
}
```

<a id="post-api-v1-organizations-id-reset-admin-password"></a>
## POST /api/v1/organizations/:id/reset-admin-password

```javascript
async function resetAdminPassword(req, res) {
  const result = await orgService.resetAdminPassword(req.params.id, req.body, req.user);
  return apiResponse.success(res, result, 'Administrator password reset successfully.');
}
```

<a id="patch-api-v1-organizations-id-status"></a>
## PATCH /api/v1/organizations/:id/status

```javascript
async function setStatus(req, res) {
  return apiResponse.success(res, await orgService.setStatus(req.params.id, req.body.status), 'Status updated.');
}
```

<a id="get-api-v1-permissions"></a>
## GET /api/v1/permissions

```javascript
async function listPermissions(req, res) {
  return apiResponse.success(res, await service.listPermissions());
}
```

<a id="get-api-v1-permissions-modules"></a>
## GET /api/v1/permissions/modules

```javascript
async function permissionModules(req, res) {
  return apiResponse.success(res, await service.permissionModules());
}
```

<a id="post-api-v1-push-register"></a>
## POST /api/v1/push/register

```javascript
async function registerToken(req, res) {
  return apiResponse.created(res, await service.registerDeviceToken(req.user.id, req.body), 'Device registered.');
}
```

<a id="post-api-v1-push-test"></a>
## POST /api/v1/push/test

```javascript
async function testPush(req, res) {
  const firebase = require('../../config/firebase');
  const result = await service.send({
    userId: req.user.id,
    eventKey: null,
    title: 'VMOVEXA Live Test Alert',
    body: 'This is a test notification verifying Firebase FCM & In-App delivery.',
  });
  return apiResponse.success(res, {
    ...result,
    fcmConfigured: firebase.isConfigured(),
    projectId: firebase.getProjectId(),
  }, 'Test push alert sent successfully.');
}
```

<a id="get-api-v1-qr-code"></a>
## GET /api/v1/qr/:code

```javascript
async function trackQrScan(req, res) {
  const code = req.params.code || req.query.code;
  const data = await campaignService.trackQrScan(code, req);
  if (req.query.json === 'true' || req.query.json === '1') {
    return apiResponse.success(res, data);
  }
  const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  let targetUrl = data.redirectUrl;
  // Internal/default redirect (or none) → send the customer to the review landing page.
  const isInternalDefault = !targetUrl || /^\/?advertiser\/campaigns\//i.test(targetUrl) || /vmovexa\.com\/promo$/i.test(targetUrl) || targetUrl.startsWith('/');
  if (isInternalDefault) {
    return res.redirect(302, `${frontendBase}/qr/${encodeURIComponent(code)}`);
  }
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }
  return res.redirect(302, targetUrl);
}
```

<a id="post-api-v1-qr-code-review"></a>
## POST /api/v1/qr/:code/review

```javascript
async function submitQrReview(req, res) {
  const code = req.params.code;
  const meta = { ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress };
  const data = await reviewService.submitReview(code, req.body, meta);
  return apiResponse.success(res, data, 'Review submitted.');
}
```

<a id="get-api-v1-qr-scan-code"></a>
## GET /api/v1/qr/scan/:code

```javascript
async function trackQrScan(req, res) {
  const code = req.params.code || req.query.code;
  const data = await campaignService.trackQrScan(code, req);
  if (req.query.json === 'true' || req.query.json === '1') {
    return apiResponse.success(res, data);
  }
  const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  let targetUrl = data.redirectUrl;
  // Internal/default redirect (or none) → send the customer to the review landing page.
  const isInternalDefault = !targetUrl || /^\/?advertiser\/campaigns\//i.test(targetUrl) || /vmovexa\.com\/promo$/i.test(targetUrl) || targetUrl.startsWith('/');
  if (isInternalDefault) {
    return res.redirect(302, `${frontendBase}/qr/${encodeURIComponent(code)}`);
  }
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }
  return res.redirect(302, targetUrl);
}
```

<a id="get-api-v1-qr-scan-code-landing"></a>
## GET /api/v1/qr/scan/:code/landing

```javascript
async function getQrScanLanding(req, res) {
  const code = req.params.code || req.query.code;
  const meta = {
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
  };
  const data = await reviewService.resolveScanLanding(code, meta);
  return apiResponse.success(res, data);
}
```

<a id="get-api-v1-reports"></a>
## GET /api/v1/reports

```javascript
async function list(req, res) {
  const { rows, meta } = await reportService.list(req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="delete-api-v1-reports-id"></a>
## DELETE /api/v1/reports/:id

```javascript
async function remove(req, res) {
  return apiResponse.success(res, await reportService.remove(req.params.id), 'Report deleted successfully.');
}
```

<a id="get-api-v1-reports-id"></a>
## GET /api/v1/reports/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await reportService.getById(req.params.id));
}
```

<a id="post-api-v1-reports-generate"></a>
## POST /api/v1/reports/generate

```javascript
async function generate(req, res) {
  const type = req.body.reportType || req.body.type || 'campaign_performance';
  const format = req.body.format || req.body.params?.format || 'csv';
  const params = { ...(req.body.params || {}), format };
  return apiResponse.created(res, await reportService.generate(type, params, req), 'Report generated successfully.');
}
```

<a id="get-api-v1-roles"></a>
## GET /api/v1/roles

```javascript
async function listRoles(req, res) {
  return apiResponse.success(res, await service.listRoles(req));
}
```

<a id="post-api-v1-roles"></a>
## POST /api/v1/roles

```javascript
async function createRole(req, res) {
  return apiResponse.created(res, await service.createRole(req.body, req), 'Role created.');
}
```

<a id="delete-api-v1-roles-id"></a>
## DELETE /api/v1/roles/:id

```javascript
async function deleteRole(req, res) {
  return apiResponse.success(res, await service.deleteRole(req.params.id, req), 'Role deleted.');
}
```

<a id="get-api-v1-roles-id"></a>
## GET /api/v1/roles/:id

```javascript
async function getRole(req, res) {
  return apiResponse.success(res, await service.getRole(req.params.id, req));
}
```

<a id="patch-api-v1-roles-id"></a>
## PATCH /api/v1/roles/:id

```javascript
async function updateRole(req, res) {
  return apiResponse.success(res, await service.updateRole(req.params.id, req.body, req), 'Role updated.');
}
```

<a id="patch-api-v1-roles-id-permissions"></a>
## PATCH /api/v1/roles/:id/permissions

```javascript
async function setRolePermissions(req, res) {
  return apiResponse.success(res, await service.setRolePermissions(req.params.id, req.body.permissionIds, req), 'Permissions updated.');
}
```

<a id="post-api-v1-routes-id-approve"></a>
## POST /api/v1/routes/:id/approve

```javascript
async function approveRoute(req, res) {
  return apiResponse.success(res, await s.routes.approve(req.params.id, req), 'Route approved.');
}
```

<a id="post-api-v1-routes-id-assign-vehicle"></a>
## POST /api/v1/routes/:id/assign-vehicle

```javascript
async function assignVehicleToRoute(req, res) {
  return apiResponse.success(res, await s.routes.assignVehicle(req.params.id, req.body, req), 'Vehicle assigned to route.');
}
```

<a id="post-api-v1-routes-id-reject"></a>
## POST /api/v1/routes/:id/reject

```javascript
async function rejectRoute(req, res) {
  return apiResponse.success(res, await s.routes.reject(req.params.id, req.body.reason, req), 'Route rejected.');
}
```

<a id="get-api-v1-routes-id-vehicles"></a>
## GET /api/v1/routes/:id/vehicles

```javascript
async function getRouteVehicles(req, res) {
  return apiResponse.success(res, await s.routes.getVehicles(req.params.id, req));
}
```

<a id="delete-api-v1-routes-assignments-id"></a>
## DELETE /api/v1/routes/assignments/:id

```javascript
async function unassignVehicleFromRoute(req, res) {
  return apiResponse.success(res, await s.routes.unassignVehicle(req.params.id, req), 'Vehicle unassigned.');
}
```

<a id="post-api-v1-routes-assignments-id-approve"></a>
## POST /api/v1/routes/assignments/:id/approve

```javascript
async function approveVehicleAssignment(req, res) {
  return apiResponse.success(res, await s.routes.approveAssignment(req.params.id, req), 'Vehicle assignment approved.');
}
```

<a id="post-api-v1-routes-assignments-id-reject"></a>
## POST /api/v1/routes/assignments/:id/reject

```javascript
async function rejectVehicleAssignment(req, res) {
  return apiResponse.success(res, await s.routes.rejectAssignment(req.params.id, req.body.reason, req), 'Vehicle assignment rejected.');
}
```

<a id="get-api-v1-support-tickets"></a>
## GET /api/v1/support/tickets

```javascript
async function listAll(req, res) {
  const { rows, meta } = await svc.listAll(req.query);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-support-tickets"></a>
## POST /api/v1/support/tickets

```javascript
async function create(req, res) {
  return apiResponse.created(res, await svc.createTicket(req, req.body), 'Ticket raised.');
}
```

<a id="get-api-v1-support-tickets-id"></a>
## GET /api/v1/support/tickets/:id

```javascript
async function getOne(req, res) {
  return apiResponse.success(res, await svc.getTicket(req.params.id, req));
}
```

<a id="post-api-v1-support-tickets-id-messages"></a>
## POST /api/v1/support/tickets/:id/messages

```javascript
async function addMessage(req, res) {
  return apiResponse.created(res, await svc.addMessage(req.params.id, req, req.body), 'Reply sent.');
}
```

<a id="patch-api-v1-support-tickets-id-status"></a>
## PATCH /api/v1/support/tickets/:id/status

```javascript
async function setStatus(req, res) {
  return apiResponse.success(res, await svc.setStatus(req.params.id, req.body.status, req), 'Status updated.');
}
```

<a id="post-api-v1-system-cron-trigger"></a>
## POST /api/v1/system/cron/trigger

```javascript
async function triggerCron(req, res) {
  const { jobKey } = req.body;
  const result = await service.triggerCronJob(jobKey);
  return apiResponse.success(res, result, `Cron job '${jobKey}' executed successfully.`);
}
```

<a id="get-api-v1-system-devices"></a>
## GET /api/v1/system/devices

```javascript
async function devices(req, res) {
  return apiResponse.success(res, await service.deviceHealth(req));
}
```

<a id="delete-api-v1-system-disk-logs"></a>
## DELETE /api/v1/system/disk-logs

```javascript
async function deleteDiskLogs(req, res) {
  const { channel, filename, filenames, folderAll, purgeAll } = req.body || {};
  const result = service.deleteDiskLogs({
    channel,
    filename,
    filenames,
    folderAll: folderAll === true || folderAll === 'true',
    purgeAll: purgeAll === true || purgeAll === 'true',
  });
  return apiResponse.success(res, result, result.message);
}
```

<a id="get-api-v1-system-disk-logs"></a>
## GET /api/v1/system/disk-logs

```javascript
async function getDiskLogs(req, res) {
  const data = service.listDiskLogFiles();
  return apiResponse.success(res, data, 'Disk log files retrieved successfully.');
}
```

<a id="get-api-v1-system-disk-logs-read"></a>
## GET /api/v1/system/disk-logs/read

```javascript
async function readDiskLog(req, res) {
  const { channel, filename, lines } = req.query;
  const data = service.readDiskLogFile({ channel, filename, lines });
  return apiResponse.success(res, data, `Log file '${filename}' loaded successfully.`);
}
```

<a id="get-api-v1-system-health"></a>
## GET /api/v1/system/health

```javascript
async function health(req, res) {
  return apiResponse.success(res, await service.healthSnapshot(req));
}
```

<a id="delete-api-v1-system-live-logs"></a>
## DELETE /api/v1/system/live-logs

```javascript
async function deleteLiveLogs(req, res) {
  const { ids, all } = req.body || {};
  const result = service.deleteLiveLogs({ ids, all: all === true || all === 'true' });
  return apiResponse.success(res, result, result.message);
}
```

<a id="get-api-v1-system-live-logs"></a>
## GET /api/v1/system/live-logs

```javascript
async function liveLogs(req, res) {
  return apiResponse.success(res, service.getLiveLogStream(req.query));
}
```

<a id="get-api-v1-system-server-status"></a>
## GET /api/v1/system/server-status

```javascript
async function serverMetrics(req, res) {
  return apiResponse.success(res, service.serverMetrics());
}
```

<a id="patch-api-v1-trips-id-end"></a>
## PATCH /api/v1/trips/:id/end

```javascript
async function endTrip(req, res) {
  return apiResponse.success(res, await s.trips.end(req.params.id, req), 'Trip ended.');
}
```

<a id="post-api-v1-uploads"></a>
## POST /api/v1/uploads

```javascript
async (req, res) => {
  if (!req.file) throw new AppError('VALIDATION_FAILED', 'No file provided (field "file").');
  const purpose = (req.body && req.body.purpose) ? String(req.body.purpose).replace(/[^\w-]/g, '') : 'support';
  const stored = await StorageService.put(purpose, req.file.originalname || 'file', req.file.buffer);
  return apiResponse.created(res, {
    url: stored.url,
    key: stored.key,
    fileName: req.file.originalname || 'file',
    fileType: req.file.mimetype || null,
    fileSize: stored.size,
    checksum: stored.checksum,
  }, 'File uploaded.');
}
```

<a id="post-api-v1-uploads-document"></a>
## POST /api/v1/uploads/document

```javascript
async (req, res) => {
  if (!req.file) throw new AppError('VALIDATION_FAILED', 'No file provided (field "file").');
  const entityType = (req.body && req.body.entityType) ? String(req.body.entityType).replace(/[^\w-]/g, '') : 'general';
  const entityId = (req.body && req.body.entityId) ? req.body.entityId : null;
  const purpose = (req.body && req.body.purpose) ? String(req.body.purpose) : 'Document';

  const stored = await StorageService.putDocument(entityType, entityId, req.file.originalname || 'document', req.file.buffer);

  let asset = null;
  if (db.MediaAsset && entityId) {
    asset = await db.MediaAsset.create({
      owner_type: entityType,
      owner_id: entityId,
      purpose,
      storage_key: stored.key,
      url: stored.url,
      mime: req.file.mimetype || null,
      size: stored.size,
      checksum: stored.checksum,
      status: 'available',
      uploaded_by: req.user?.id || null,
    });
  }

  return apiResponse.created(res, {
    id: asset?.id || null,
    url: stored.url,
    key: stored.key,
    fileName: req.file.originalname || 'document',
    fileType: req.file.mimetype || null,
    fileSize: stored.size,
    purpose,
    entityType,
  }, 'Document uploaded successfully.');
}
```

<a id="delete-api-v1-uploads-document-id"></a>
## DELETE /api/v1/uploads/document/:id

```javascript
async (req, res) => {
  if (db.MediaAsset) {
    const asset = await db.MediaAsset.findByPk(req.params.id);
    if (asset) {
      if (asset.storage_key) {
        await StorageService.removeDocument(asset.storage_key);
      }
      await asset.destroy();
      return apiResponse.success(res, { id: asset.id }, 'Document deleted.');
    }
  }
  return apiResponse.success(res, { ok: true }, 'Document removed.');
}
```

<a id="post-api-v1-uploads-video"></a>
## POST /api/v1/uploads/video

```javascript
async (req, res) => {
  if (!req.file) throw new AppError('VALIDATION_FAILED', 'No video file provided (field "video").');
  const stored = await StorageService.put('videos', req.file.originalname || 'video.mp4', req.file.buffer);
  return apiResponse.created(res, {
    url: stored.url,
    key: stored.key,
    fileName: req.file.originalname || 'video',
    fileType: req.file.mimetype || null,
    fileSize: stored.size,
    checksum: stored.checksum,
  }, 'Video uploaded successfully.');
}
```

<a id="get-api-v1-users"></a>
## GET /api/v1/users

```javascript
async function list(req, res) {
  const { rows, meta } = await service.list(req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-users"></a>
## POST /api/v1/users

```javascript
async function create(req, res) {
  const user = await service.create(req.body, req);
  return apiResponse.created(res, user, 'User created.');
}
```

<a id="delete-api-v1-users-id"></a>
## DELETE /api/v1/users/:id

```javascript
async function remove(req, res) {
  return apiResponse.success(res, await service.remove(req.params.id, req), 'User deleted.');
}
```

<a id="get-api-v1-users-id"></a>
## GET /api/v1/users/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await service.getById(req.params.id, req));
}
```

<a id="patch-api-v1-users-id"></a>
## PATCH /api/v1/users/:id

```javascript
async function update(req, res) {
  return apiResponse.success(res, await service.update(req.params.id, req.body, req), 'User updated.');
}
```

<a id="get-api-v1-users-id-activity"></a>
## GET /api/v1/users/:id/activity

```javascript
async function activity(req, res) {
  const { rows, meta } = await service.activity(req.params.id, req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="get-api-v1-users-id-permissions"></a>
## GET /api/v1/users/:id/permissions

```javascript
async function getUserPermissions(req, res) {
  return apiResponse.success(res, await service.getUserPermissions(req.params.id, req));
}
```

<a id="put-api-v1-users-id-permissions"></a>
## PUT /api/v1/users/:id/permissions

```javascript
async function updateUserPermissions(req, res) {
  const data = await service.updateUserPermissions(req.params.id, req.body.permissions || req.body.permissionKeys || [], req);
  return apiResponse.success(res, data, 'User direct permissions updated successfully.');
}
```

<a id="patch-api-v1-users-id-status"></a>
## PATCH /api/v1/users/:id/status

```javascript
async function setStatus(req, res) {
  return apiResponse.success(res, await service.setStatus(req.params.id, req.body.status, req), 'Status updated.');
}
```

<a id="get-api-v1-users-check-availability"></a>
## GET /api/v1/users/check-availability

```javascript
async function checkAvailability(req, res) {
  const { email, phone, excludeUserId } = req.query;
  const result = await service.checkAvailability({ email, phone, excludeUserId });
  return apiResponse.success(res, result);
}
```

<a id="get-api-v1-users-quotas-fleet-operators"></a>
## GET /api/v1/users/quotas/fleet-operators

```javascript
async function getFleetOperatorQuotas(req, res) {
  const { getFleetQuotaSummary } = require('../fleet/fleetQuota.helper');
  const organizationId = (req && !req.isPlatformScope)
    ? req.tenantId
    : (req.query.organizationId || req.query.organization_id || req.tenantId || 1);
  const excludeId = req.query.excludeFleetId || req.query.excludeUserId || req.query.excludeId;
  const summary = await getFleetQuotaSummary({
    organizationId,
    excludeFleetId: excludeId,
    excludeUserId: excludeId,
  });
  return apiResponse.success(res, summary);
}
```

<a id="post-api-v1-vehicle-slots-check-conflict"></a>
## POST /api/v1/vehicle-slots/check-conflict

```javascript
async function checkSlotConflict(req, res) {
  return apiResponse.success(res, await s.vehicleSlots.checkConflict(req.body, req));
}
```

<a id="get-api-v1-vehicle-slots-timetable-grid"></a>
## GET /api/v1/vehicle-slots/timetable/grid

```javascript
async function getSlotsTimetable(req, res) {
  return apiResponse.success(res, await s.vehicleSlots.getTimetableGrid(req.query, req));
}
```

<a id="patch-api-v1-vehicles-id-approve"></a>
## PATCH /api/v1/vehicles/:id/approve

```javascript
async function approveVehicle(req, res) {
  return apiResponse.success(res, await s.vehicles.approve(req.params.id, req), 'Vehicle approved.');
}
```

<a id="patch-api-v1-vehicles-id-assign-driver"></a>
## PATCH /api/v1/vehicles/:id/assign-driver

```javascript
async function assignDriver(req, res) {
  return apiResponse.success(res, await s.vehicles.assignDriver(req.params.id, req.body.driverId, req), 'Driver assigned.');
}
```

<a id="patch-api-v1-vehicles-id-assign-gps"></a>
## PATCH /api/v1/vehicles/:id/assign-gps

```javascript
async function assignGps(req, res) {
  return apiResponse.success(res, await s.vehicles.assignGps(req.params.id, req.body.gpsDeviceId, req), 'GPS assigned.');
}
```

<a id="get-api-v1-vehicles-id-documents"></a>
## GET /api/v1/vehicles/:id/documents

```javascript
async function vehicleDocuments(req, res) {
  return apiResponse.success(res, await s.vehicles.documents(req.params.id, req));
}
```

<a id="patch-api-v1-vehicles-id-documents-docid-approve"></a>
## PATCH /api/v1/vehicles/:id/documents/:docId/approve

```javascript
async function approveVehicleDocument(req, res) {
  return apiResponse.success(res, await s.vehicles.approveDocument(req.params.id, req.params.docId, req), 'Document approved.');
}
```

<a id="patch-api-v1-vehicles-id-documents-docid-reject"></a>
## PATCH /api/v1/vehicles/:id/documents/:docId/reject

```javascript
async function rejectVehicleDocument(req, res) {
  return apiResponse.success(res, await s.vehicles.rejectDocument(req.params.id, req.params.docId, req.body.reason, req), 'Document rejected.');
}
```

<a id="patch-api-v1-vehicles-id-reject"></a>
## PATCH /api/v1/vehicles/:id/reject

```javascript
async function rejectVehicle(req, res) {
  return apiResponse.success(res, await s.vehicles.reject(req.params.id, req.body.reason, req), 'Vehicle rejected.');
}
```

<a id="get-api-v1-vehicles-id-telemetry"></a>
## GET /api/v1/vehicles/:id/telemetry

```javascript
async function vehicleTelemetry(req, res) {
  return apiResponse.success(res, await s.vehicles.telemetry(req.params.id, req));
}
```

<a id="post-api-v1-webhooks-gateway"></a>
## POST /api/v1/webhooks/:gateway

```javascript
async function handle(req, res) {
  const provider = req.params.gateway;
  const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : (req.body || '');
  const signature = req.headers['stripe-signature'] || req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'] || '';
  let parsed = {};
  try { parsed = JSON.parse(rawBody || '{}'); } catch { parsed = {}; }

  logger.notification.info(`webhook received: ${provider}/${parsed.event || 'unknown'}`);
  const result = await paymentService.handleWebhook(provider, rawBody, signature, parsed);
  return apiResponse.success(res, result, 'Webhook processed.');
}
```

<a id="get-api-v1-work-orders"></a>
## GET /api/v1/work-orders

```javascript
async function list(req, res) {
  const { rows, meta } = await service.list(req.query, req);
  return apiResponse.paginated(res, rows, meta);
}
```

<a id="post-api-v1-work-orders"></a>
## POST /api/v1/work-orders

```javascript
async function create(req, res) {
  return apiResponse.created(res, await service.create(req.body, req), 'Work order filed.');
}
```

<a id="get-api-v1-work-orders-id"></a>
## GET /api/v1/work-orders/:id

```javascript
async function getById(req, res) {
  return apiResponse.success(res, await service.getById(req.params.id, req));
}
```

<a id="patch-api-v1-work-orders-id"></a>
## PATCH /api/v1/work-orders/:id

```javascript
async function update(req, res) {
  return apiResponse.success(res, await service.update(req.params.id, req.body, req), 'Work order updated.');
}
```

<a id="patch-api-v1-work-orders-id-approve"></a>
## PATCH /api/v1/work-orders/:id/approve

```javascript
async function approve(req, res) {
  return apiResponse.success(res, await service.approve(req.params.id, req), 'Approved.');
}
```

<a id="patch-api-v1-work-orders-id-assign"></a>
## PATCH /api/v1/work-orders/:id/assign

```javascript
async function assign(req, res) {
  return apiResponse.success(res, await service.assign(req.params.id, req.body, req), 'Technician dispatched.');
}
```

<a id="post-api-v1-work-orders-id-rate"></a>
## POST /api/v1/work-orders/:id/rate

```javascript
async function rate(req, res) {
  return apiResponse.success(res, await service.rate(req.params.id, req.body, req), 'Technician rated successfully.');
}
```

<a id="patch-api-v1-work-orders-id-reject"></a>
## PATCH /api/v1/work-orders/:id/reject

```javascript
async function reject(req, res) {
  return apiResponse.success(res, await service.reject(req.params.id, req.body.reason, req), 'Rejected.');
}
```

<a id="patch-api-v1-work-orders-id-status"></a>
## PATCH /api/v1/work-orders/:id/status

```javascript
async function setStatus(req, res) {
  return apiResponse.success(res, await service.setStatus(req.params.id, req.body.status, req.body, req), 'Status updated.');
}
```
