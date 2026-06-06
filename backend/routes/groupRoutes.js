const express = require('express');
const router = express.Router(); 
const { protect } = require('../middleware/authMiddleware');

const {
  getGroups,
  createGroup,
  addSharedExpense, 
  addMembersAfterFact,
  editGroupMetadata,
  removeGroupMatrix,
  getSettlementSummary,
  joinGroupViaLink
} = require('../controllers/groupController');

router.use(protect);

router.route('/')
  .get(getGroups)
  .post(createGroup);

router.route('/:id')
  .put(editGroupMetadata)
  .delete(removeGroupMatrix);

router.route('/:id/members').post(addMembersAfterFact);
router.route('/:id/expense').post(addSharedExpense);
router.route('/:id/settle').get(getSettlementSummary);
router.route('/join/:token').post(joinGroupViaLink);

module.exports = router;