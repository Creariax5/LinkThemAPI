const { Router } = require('express');
const jobController = require('./jobs/controller');
const testController = require('./tests/controller');

const router = Router();

// Test endpoints
router.get('/', testController.testApi);
router.get('/test-db-connection', testController.testDbConnection);

// Job routes
router.post('/jobs', jobController.createJobPosting);
router.get('/jobs', jobController.getJobListings);

module.exports = router;
