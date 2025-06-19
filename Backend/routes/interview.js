const express = require('express');
const router = express.Router();
const {toggleUpvote,getExperience,upvoteExperience,getAll,getAllApproved,submitExperience,approveExperience} = require('../controllers/Experience');
const verifyUser = require('../middleware/verifyUser');
const verifyAdmin = require('../middleware/verifyAdmin');

router.get('/all', getAll); 
router.get('/', getAllApproved);
router.post('/',verifyUser,submitExperience);
router.patch('/:id/upvote',upvoteExperience);
router.patch('/:id/:action',verifyAdmin, approveExperience); 
router.get('/:id', getExperience);

module.exports = router;