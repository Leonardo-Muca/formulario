import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { itemSchema } from './schemas/itemSchema';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.post('/api/items', upload.array('multimedia', 10), (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[] | undefined;

  try {
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: {
          multimedia: {
            message: 'Al menos una imagen o video es obligatorio',
          },
        },
      });
      return;
    }

    const validationResult = itemSchema.safeParse(req.body);

    if (!validationResult.success) {
      // Cleanup files on validation failure
      files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Error deleting temp file: ${file.path}`, err);
        }
      });

      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        fieldErrors[fieldName] = err.message;
      });

      res.status(400).json({
        success: false,
        message: 'Validación de datos fallida',
        errors: fieldErrors,
      });
      return;
    }

    const uploadedFiles = files.map((file) => {
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
      };
    });

    const validatedData = validationResult.data;

    res.status(201).json({
      success: true,
      message: 'Item creado exitosamente',
      data: {
        ...validatedData,
        multimedia: uploadedFiles,
      },
    });
  } catch (error) {
    console.error('Request processing error:', error);

    if (files) {
      files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          // ignore
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el formulario',
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
