const { Router } = require('express');
const controller = require('./controller');

const router = Router();

// Test endpoints
router.get('/', controller.testApi);
router.get('/test-db-connection', controller.testDbConnection);

// Job posting routes
router.post('/jobs', controller.createJobPosting);

module.exports = router;
