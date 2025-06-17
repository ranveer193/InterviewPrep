const express = require('express');
const router = express.Router();
const {getAll,getAllApproved,submitExperience,approveExperience} = require('../controllers/Experience');

router.get('/all', getAll); 
router.get('/', getAllApproved);
router.post('/',submitExperience);
router.patch('/:id/:action', approveExperience); 

module.exports = router;