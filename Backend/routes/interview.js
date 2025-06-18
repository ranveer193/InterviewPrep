const express = require('express');
const router = express.Router();
const {getExperience,upvoteExperience,getAll,getAllApproved,submitExperience,approveExperience} = require('../controllers/Experience');

router.get('/all', getAll); 
router.get('/', getAllApproved);
router.post('/',submitExperience);
router.patch('/:id/upvote', upvoteExperience);
router.patch('/:id/:action', approveExperience); 
router.get('/:id', getExperience);

module.exports = router;