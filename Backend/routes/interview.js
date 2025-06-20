const express = require('express');
const router = express.Router();
const {getExperience,upvoteExperience,getAll,getAllApproved,submitExperience,approveExperience} = require('../controllers/Experience');
const verifyUser = require('../middleware/verifyUser');
const verifyAdmin = require('../middleware/verifyAdmin');
const requireAuth = require('../middleware/requireAuth');

router.get('/all', verifyAdmin,getAll); 
router.get('/', getAllApproved);
router.post('/',verifyUser,submitExperience);
router.patch('/:id/upvote',verifyUser,requireAuth,upvoteExperience);
router.patch('/:id/:action',verifyAdmin, approveExperience); 
router.get('/:id', getExperience);

module.exports = router;