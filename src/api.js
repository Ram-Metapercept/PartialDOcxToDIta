const express = require('express');
const fileUpload = require('express-fileupload');
const convertDocxToDita = require("./index")
const app = express();
require("dotenv").config({ path: "./.env" });
const PORT = process.env.PORT || 8000;
const path = require("path");
const fs = require('fs');
const shell = require("shelljs");
const cors = require('cors');
const { getInputFileName, getLogData} = require('./utils/StateManagement');
const AdmZip = require('adm-zip');
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const fileHistory = require("./models/fileHistoryModel");
const bcrypt = require('bcrypt');
const connectDB = require("./database/db");
const authenticateToken = require("./middleware/authentication.js");
const jwt_secret = process.env.JWT_SECRET;
const useragent = require("useragent");
const geoip = require("geoip-lite");
const ip = require("ip")
const JSZip = require('jszip');
const { DOMParser } = require('xmldom');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);
let inputDocxFile = path.join(__dirname, `./inputs/`);
const outputFile = path.join(__dirname, "../output");
const downloadFile = path.join(__dirname, "../downloads");
const ditaTagModel =require("./models/tag/ditaTagModel.js")
app.use(fileUpload());
app.use(cors())
app.use(express.json());

app.post('/api/upload', async (req, res) => {
  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send({ error: 'No files were uploaded.' });
    }

    const docxFile = req.files.file;

    if (docxFile.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return res.status(400).send({ error: 'Invalid file type. Please upload a DOCX file.' });
    }

    const uniqueFilename = `${docxFile.name}`;
    const filePath = path.join(__dirname, `inputs/${uniqueFilename}`);

    await docxFile.mv(filePath);

    await cleanInputDirectory(filePath);

    res.status(200).send({ message: `File "${uniqueFilename}" uploaded successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An unexpected error occurred.' });
  }
});


app.get('/api/convertDocxToDita', async (req, res) => {
  const obj = {
    downloadLink: "",
    outputId: "",
  }

  try {
    fs.readdir(inputDocxFile, async (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return res.status(500).send('Error reading input folder.');
      }

      for (const file of files) {
        const filePath = path.join(inputDocxFile, file);
        const { downloadLink, outputId } = await convertDocxToDita(filePath);
        obj.downloadLink = downloadLink;
        obj.outputId = outputId;
      }

      res.status(200).json({
        message: 'Files converted successfully.',
        downloadLink: obj.downloadLink,
        status: 200,
      });
 
    });
  } catch (error) {
    console.error("Error converting DOCX to DITA:", error.message);
    res.status(500).send("Internal server error.");
  }
});


const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

app.get('/api/download/:downloadId', async (req, res) => {
  try {
    const downloadId = req.params.downloadId;
    if (!downloadId) return res.status(400).send('Invalid download ID');

    const DownloadDir = path.join(outputFile, downloadId);
    const stats = await statAsync(DownloadDir).catch(() => null);
    if (!stats || !stats.isDirectory()) return res.status(404).send('Directory not found');

    const files = await readdirAsync(DownloadDir);
    if (files.length === 0) return res.status(404).send('No files to download');

    const fileName = getInputFileName();
    const outputZipPath = path.join(downloadFile, fileName);
    const zip = new AdmZip();
    
    zip.addLocalFolder(DownloadDir);
    zip.writeZip(outputZipPath);

    res.download(outputZipPath, fileName, async (err) => {
      if (err) return res.status(500).send('Download error');
      await unlinkAsync(outputZipPath).catch(console.error);
      await cleanupUploadedZip(DownloadDir).catch(console.error);
      await cleanupUploadedZip(outputFile).catch(console.error);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send('Unexpected error');
  }
});

app.post("/api/insertDitaTag", async (req, res) => {
  const tags = req.body;

  try {
    for (let tag of tags) {
      const { key, value } = tag;

      let existingTag = await ditaTagModel.findOne({ key });

      if (existingTag) {
        existingTag.value = value;
        await existingTag.save();
      } else {
        await ditaTagModel.create({ key, value });
      }
    }

    res
      .status(200)
      .json({ message: "Tags processed successfully", status: 200 });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error });
  }
});



app.get("/api/insertDitaTag", async (req, res) => {
  try {
    let tags = await ditaTagModel.find();
    if (!tags || tags.length === 0) {
      return res.status(404).json({ message: "No tags found", status: 404 });
    }
    res.status(200).json({ message: "Tags fetched successfully", status: 200, data: tags });

  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Internal server error", status: 500, error: error.message });
  }
});


app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: "User registered", status: 201 });
  } catch (error) {
    res.status(400).json({ message: "User registration failed", status: 400 });
  }
});


app.post("/api/fileHistory", authenticateToken, async (req, res) => {
  const fileName = path.join(__dirname, './inputs/');
  fs.readdir(fileName, async (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return res.status(500).json({ message: "Error reading folder", status: 500 });
    }

    const userId = req.user.userId;
    const info = await User.findById(userId);

    if (!info) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    const ipAddress = ip.address();
    const agent = useragent.parse(req.headers["user-agent"]);
    const geo = geoip.lookup(ipAddress);

    try {
      for (const file of files) {
        let data = {
          fileName: file,
          userId: userId,
          email: info.email,
          os: agent.os.toString(),
          ip: ipAddress,
          location: geo ? { country: geo.country, city: geo.city } : {},
          browser: agent.toAgent()
        };

        const fileHistoryRecord = await fileHistory.create(data);

        if (fileHistoryRecord) {
          res.status(201).json({ message: "File history recorded successfully 🎉", status: 201 });
        } else {
          console.error('File history record creation failed');
        }
      }


    } catch (error) {
      console.error('Error creating file history record:', error);
      res.status(500).json({ message: "Internal server error", status: 500 });
    }
  });
});


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user){
      return res.status(401).json({ message: "Login failed: User not found", status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Login failed: Incorrect password", status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, jwt_secret, { expiresIn: "2h" });

    return res.status(200).json({ message: "Login successful 🎉", status: 200, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error", status: 500 });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDB();
});
async function cleanupUploadedZip(FolderDir) {
  try {
    if (fs.existsSync(FolderDir)) {
      shell.rm("-rf", FolderDir);
      console.log("Successfully cleaned up uploaded zip file:", FolderDir);
    } else {
      console.log("Directory does not exist:", FolderDir);
    }
  } catch (error) {
    console.error("Error cleaning up uploaded zip file:", error);
  }
}

async function cleanInputDirectory(filePath) {
  const directory = path.dirname(filePath);
  try {
    const files = await fs.promises.readdir(directory);
    for (const file of files) {
      if (file !== path.basename(filePath)) {
        const fullPath = path.join(directory, file);
        await fs.promises.unlink(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error cleaning input directory: ${err.message}`);
  }
}

async function checkDocxStartsWithHeading(filePath) {
  const content = fs.readFileSync(filePath, 'binary');
  const zip = await JSZip.loadAsync(content);
  const docXml = await zip.file('word/document.xml').async('string');

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, 'application/xml');

  const namespaces = {
    w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
  };

  const paragraphs = xmlDoc.getElementsByTagNameNS(namespaces.w, 'p');

  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0];
    const pStyle = firstParagraph.getElementsByTagNameNS(namespaces.w, 'pStyle')[0];

    if (pStyle) {
      const styleVal = pStyle.getAttribute('w:val');
      if (styleVal) {
        
        const styleValLower = styleVal.toLowerCase();
        return true;
      }
    }
  }
  return false;
}




app.post('/api/checkPreflight', async (req, res) => {

  const filePath = path.join(__dirname, './inputs/');

  try {
    const files = await fs.promises.readdir(filePath);

    if (files.length === 0) {
      return res.status(400).json({ message: "No files found in the folder", status: 400 });
    }
    for (const file of files) {
      const fullPath = path.join(filePath, file);
      try {
        const result = await checkDocxStartsWithHeading(fullPath);
        if (result) {        
          return res.status(200).json({ message: "ok", status: 200, result: result });
        } else {
          return res.status(400).json({ message: "Please check the input source file formatting, styles and file first topic should have title style and file should not contain any TOC", status: 400 });
        }
      } catch (err) {
        return res.status(500).json({ message: err.message, status: 500 });
      }
    }

  } catch (err) {
    return res.status(500).json({ message: "Error reading folder", status: 500 });
  }
});

