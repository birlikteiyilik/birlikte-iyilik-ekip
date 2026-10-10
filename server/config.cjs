'use strict';
// Public identifiers only. Firebase verifies identity; Vercel stores workspace data.
module.exports = Object.freeze({
  projectId: 'birlikte-iyilik-ekip',
  siteUrl: 'https://ekip.birlikteiyilik.com',
  fileLimit: 10 * 1024 * 1024,
  attachmentBudget: 750 * 1024 * 1024,
  backupBudget: 100 * 1024 * 1024,
  snapshotCount: 30,
  backupDays: 7,
  mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip']
});
