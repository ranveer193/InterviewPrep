const express = require('express');
const router = express.Router();
const {upvoteExperience,getAll,getAllApproved,submitExperience,approveExperience} = require('../controllers/Experience');

router.get('/all', getAll); 
router.get('/', getAllApproved);
router.post('/',submitExperience);
router.patch('/:id/upvote', upvoteExperience);
router.patch('/:id/:action', approveExperience); 

module.exports = router;