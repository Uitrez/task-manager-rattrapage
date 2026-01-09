const express = require("express");
const { authRequired } = require("../middleware/auth");
const { addMember, removeMember } = require("../controllers/memberController");
const router = express.Router();

router.use(authRequired);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;
