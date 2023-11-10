const express = require("express");
const router = express.Router();

const {
  getAllContacts,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  downloadPdf,
  shareContact,
} = require("../controllers/contactsController");
const validateToken = require("../middleware/tokenHandler");

router.use(validateToken);

router.route("/all").get(getAllContacts);

router.route("/").get(getContacts);

router.route("/:id").get(getContact);

router.route("/").post(createContact);

router.route("/:id").put(updateContact);

router.route("/:id").delete(deleteContact);

router.route("/download-pdf").post(downloadPdf);

router.route("/share").post(shareContact);

module.exports = router;
