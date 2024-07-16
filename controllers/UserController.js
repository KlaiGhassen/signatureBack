import User from "../models/UserModel.js";
import "dotenv/config";
import PDFDocument from "pdfkit";
import fs from "fs";
import { extractFilename } from "./SignatureController.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export async function teachersListPdf(req, res) {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const users = await User.find({ role: "ENSEIGNANT" });
    // Create a new PDFDocument
    const doc = new PDFDocument();

    // Pipe the PDF to a writable stream
    const stream = fs.createWriteStream(
      join(__dirname, "../public/files/listUsers.pdf")
    );
    doc.pipe(stream);

    // Add a table header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("teachers informations", { align: "center" });

    // Set up the table layout
    const tableTop = 100; // Y-coordinate to start the table
    const tableLeft = 100; // X-coordinate to start the table
    const cellPadding = 10; // Padding for each cell
    const columnWidth = 80; // Width of each column
    const rowHeight = 30; // Height of each row

    // Draw table headers
    doc.font("Helvetica-Bold").fontSize(10);
    doc.rect(tableLeft, tableTop, columnWidth * 2, rowHeight).stroke(); // Full Name
    doc.text("Email", tableLeft + cellPadding, tableTop + cellPadding);
    doc
      .rect(tableLeft + columnWidth * 2, tableTop, columnWidth, rowHeight)
      .stroke(); // Email
    doc.text(
      "Full Name",
      tableLeft + columnWidth * 2 + cellPadding,
      tableTop + cellPadding
    );
    doc
      .rect(tableLeft + columnWidth * 3, tableTop, columnWidth, rowHeight)
      .stroke(); // Status
    doc.text(
      "Status",
      tableLeft + columnWidth * 3 + cellPadding,
      tableTop + cellPadding
    );
    doc
      .rect(tableLeft + columnWidth * 4, tableTop, columnWidth, rowHeight)
      .stroke();
    doc.text(
      "Signature",
      tableLeft + columnWidth * 4 + cellPadding,
      tableTop + cellPadding
    );

    // Draw table data
    doc.font("Helvetica").fontSize(10);

    users.forEach((user, index) => {
      const yPos = tableTop + rowHeight * (index + 1);
      const fullName = `${user.firstName} ${user.lastName}`;
      doc.rect(tableLeft, yPos, columnWidth * 2, rowHeight).stroke(); // Full Name
      doc.text(user.email, tableLeft + cellPadding, yPos + cellPadding);
      doc
        .rect(tableLeft + columnWidth * 2, yPos, columnWidth, rowHeight)
        .stroke(); // Email
      doc.text(
        fullName,
        tableLeft + columnWidth * 2 + cellPadding,
        yPos + cellPadding
      );
      doc
        .rect(tableLeft + columnWidth * 3, yPos, columnWidth, rowHeight)
        .stroke(); // Status
      doc.text(
        user.status,
        tableLeft + columnWidth * 3 + cellPadding,
        yPos + cellPadding
      );
      if (user.signatureImage) {
        doc
          .rect(tableLeft + columnWidth * 4, yPos, columnWidth, rowHeight)
          .stroke();
        doc.image(
          join(
            __dirname,
            "../public/images/" + extractFilename(user.signatureImage)
          ),
          tableLeft + columnWidth * 4,
          yPos,
          {
            width: 76,
            height: 24,
          }
        );
      }

      // Add images if needed
      // if (fs.existsSync(user.signatureImage)) {
      //   doc.image(user.signatureImage, tableLeft + columnWidth * 4, yPos, {
      //     width: 50,
      //     height: 50,
      //   });
      // }
    });

    // Finalize PDF
    doc.end();

    stream.on("finish", () => {
      res.status(200).json({ pdfLink: `${process.env.PDF_LINK}listUsers.pdf` });
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getLastUpdatedUsers(req, res) {
  try {
    const lastUpdatedUsers = await User.find({ role: "ENSEIGNANT" })
      .sort({ updatedAt: -1 })
      .limit(5); // Limiting to 10 users for example
    const formattedUsers = lastUpdatedUsers.map((user) => {
      const updatedAt = new Date(user.updatedAt);
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(updatedAt);

      return {
        ...user.toObject(),
        updatedAt: formattedDate,
      };
    });
    res.status(200).send(formattedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// get all users
export async function getAllUsers(req, res, next) {
  try {
    const sort = req.query.sort || ""; // Default to empty string if sort parameter is not provided
    const search = req.query.search || ""; // Default to empty string if search parameter is not provided
    console.log("hello");
    let query = { role: "ENSEIGNANT" };

    // Add search condition if search parameter is provided
    if (
      search !== "" &&
      search !== "null" &&
      search !== undefined &&
      search !== null
    ) {
      query = {
        ...query,
        // Define the field you want to search on and the search term
        // Here I'm assuming you want to search on the "name" field
        email: { $regex: search, $options: "i" }, // Case-insensitive search
      };
    }

    // Apply sorting if sort parameter is provided
    if (
      sort !== "" &&
      sort !== null &&
      sort !== undefined &&
      sort !== "null" &&
      sort !== "ALL"
    ) {
      query = {
        ...query,
        // Define the field you want to search on and the search term
        // Here I'm assuming you want to search on the "name" field
        status: { $regex: sort, $options: "i" }, // Case-insensitive search
      };
    }
    const users = await User.find(query);

    const formattedUsers = users.map((user) => {
      const updatedAt = new Date(user.updatedAt);
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(updatedAt);

      return {
        ...user.toObject(),
        updatedAt: formattedDate,
      };
    });
    console.log(formattedUsers);
    res.status(200).send(formattedUsers);
  } catch (error) {
    console.log(error);
  }
}

export async function addUser(req, res, next) {
  const user = await User.create(req.body);
  res.status(200).send(user);
  try {
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}

export async function getNumberOfConnectedUser(req, res, next) {
  try {
    const users = await User.countDocuments({
      role: "ENSEIGNANT",
      status: "LOGIN",
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}
export async function getNumberOfSignedUser(req, res, next) {
  try {
    const users = await User.countDocuments({
      role: "ENSEIGNANT",
      status: "DONE",
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}
export async function getAllUsersCount(req, res, next) {
  try {
    const users = await User.countDocuments({
      role: "ENSEIGNANT",
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}

export async function getDashboardData(req, res, next) {
  try {
    const getAllUsersCount = await User.countDocuments({
      role: "ENSEIGNANT",
    });

    const getAllSignedUsers = await User.countDocuments({
      role: "ENSEIGNANT",
      status: "DONE",
    });
    const getAllLogedInUsers = await User.countDocuments({
      role: "ENSEIGNANT",
      status: "LOGIN",
      status: "DONE",
    });
    let data = {
      allUsersCount: getAllUsersCount,
      allSignedUsers: getAllSignedUsers,
      allSignedUsersPercentage: (getAllSignedUsers / getAllUsersCount) * 100,
      allLogedInUsers: getAllLogedInUsers,
      allLogedInUsersPercentage: (getAllLogedInUsers / getAllUsersCount) * 100,
      signedTeachers: getAllSignedUsers / getAllUsersCount,
      connectedTeachers: getAllLogedInUsers / getAllUsersCount,
    };
    console.log(data);
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}
