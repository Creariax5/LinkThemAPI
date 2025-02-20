const { Router } = require('express');
const controller = require('./controller');

const router = Router();

// Job posting routes
router.post('/jobs', controller.createJobPosting);

module.exports = router;