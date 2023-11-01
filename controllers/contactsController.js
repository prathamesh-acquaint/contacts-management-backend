const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactsModel");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");

// @desc Get all contacts
// @route GET /api/contacts/all
// @access public
const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).json(contacts);
});

// @desc Get all contacts
// @route GET /api/contacts
// @access private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_id: req.user.id });
  res.status(200).json(contacts);
});

// @desc Get contact
// @route GET /api/contacts/:id
// @access private
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("No contacts found");
  }
  res.status(200).json(contact);
});

// @desc Create contact
// @route POST /api/contacts/
// @access private
const createContact = asyncHandler(async (req, res) => {
  console.log("The req body is : ", req.body);
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const contact = await Contact.create({
    name,
    email,
    phone,
    user_id: req.user.id,
  });
  res.status(201).json(contact);
});

// @desc Update contact
// @route PUT /api/contacts/:id
// @access private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("No contacts found");
  }

  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  res.status(200).json(updatedContact);
});

// @desc Delete contact
// @route DELETE /api/contacts/:id
// @access private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("No contacts found");
  }
  await Contact.deleteOne({ _id: req.params.id });
  res.status(200).json(contact);
});

// @desc Delete contact
// @route DELETE /api/contacts/:id
// @access private
const downloadPdf = asyncHandler(async (req, res) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a new page
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Get contact data from the request (assuming it's an array of contact objects)
    const contacts = req.body.contacts;

    // Create a text content for the PDF
    const content = `Contacts:\n\n${contacts
      .map((contact) => contact.name)
      .join("\n")}`;
    console.log(content);
    // Add the text content to the PDF
    page.drawText(content, {
      x: 50,
      y: height - 50,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Send the PDF as a downloadable file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.pdf");
    res.send(pdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating the PDF.");
  }
});

module.exports = {
  getAllContacts,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  downloadPdf,
};
