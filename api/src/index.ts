import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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

const DB_PATH = path.join(__dirname, 'data/db.json');

// Helper functions for JSON database
function getDbItems(): any[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create directories if missing
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return [];
  }
}

function saveDbItems(items: any[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// 1. GET ALL ITEMS (With Search & Filter)
app.get('/api/items', (req: Request, res: Response): void => {
  try {
    const items = getDbItems();
    const { search, offerType } = req.query;

    let filteredItems = [...items];

    if (search && typeof search === 'string') {
      const query = search.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    if (offerType && typeof offerType === 'string') {
      filteredItems = filteredItems.filter(
        (item) => item.offerType === offerType
      );
    }

    res.json({
      success: true,
      data: filteredItems,
    });
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar las promociones',
    });
  }
});

// 2. GET SINGLE ITEM DETAILS
app.get('/api/items/:id', (req: Request, res: Response): void => {
  try {
    const items = getDbItems();
    const item = items.find((i) => i.id === req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Promoción no encontrada',
      });
      return;
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error in GET /api/items/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recuperar los detalles de la promoción',
    });
  }
});

// 3. POST /api/items (Create)
app.post('/api/items', upload.array('multimedia', 10), (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[] | undefined;

  try {
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: {
          multimedia: 'Al menos una imagen o video es obligatorio',
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
    const newItem = {
      id: crypto.randomUUID(),
      ...validatedData,
      multimedia: uploadedFiles,
    };

    const items = getDbItems();
    items.unshift(newItem); // Add to the top
    saveDbItems(items);

    res.status(201).json({
      success: true,
      message: 'Item creado exitosamente',
      data: newItem,
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
      message: 'Error interno del servidor al crear el item',
    });
  }
});

// 4. PUT /api/items/:id (Update)
app.put('/api/items/:id', upload.array('multimedia', 10), (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[] | undefined;
  const items = getDbItems();
  const itemIndex = items.findIndex((i) => i.id === req.params.id);

  if (itemIndex === -1) {
    // Clean up uploaded files since the item doesn't exist
    if (files) {
      files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {}
      });
    }
    res.status(404).json({
      success: false,
      message: 'Promoción no encontrada',
    });
    return;
  }

  const existingItem = items[itemIndex];

  try {
    // Parse which existing files are being retained
    let retainedFiles: any[] = [];
    if (req.body.existingMultimedia) {
      try {
        retainedFiles = JSON.parse(req.body.existingMultimedia);
      } catch (e) {
        console.error('Error parsing existingMultimedia:', e);
      }
    }

    // Identify files that were deleted by comparing names
    const retainedFilenames = new Set(retainedFiles.map((f) => f.filename));
    existingItem.multimedia.forEach((file: any) => {
      if (!retainedFilenames.has(file.filename)) {
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log('Deleted replaced file:', file.filename);
          } catch (err) {
            console.error('Error unlinking replaced file:', err);
          }
        }
      }
    });

    // Parse newly uploaded files
    const newUploadedFiles = files
      ? files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
        }))
      : [];

    const finalMultimedia = [...retainedFiles, ...newUploadedFiles];

    if (finalMultimedia.length === 0) {
      // Clean up uploads before returning error
      newUploadedFiles.forEach((file) => {
        try {
          fs.unlinkSync(path.join(UPLOAD_DIR, file.filename));
        } catch (err) {}
      });

      res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: {
          multimedia: 'Al menos una imagen o video es obligatorio',
        },
      });
      return;
    }

    // Validate textual data fields
    const validationResult = itemSchema.safeParse(req.body);

    if (!validationResult.success) {
      // Clean up newly uploaded files on validation failure
      newUploadedFiles.forEach((file) => {
        try {
          fs.unlinkSync(path.join(UPLOAD_DIR, file.filename));
        } catch (err) {}
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

    const validatedData = validationResult.data;
    const updatedItem = {
      id: existingItem.id,
      ...validatedData,
      multimedia: finalMultimedia,
    };

    items[itemIndex] = updatedItem;
    saveDbItems(items);

    res.json({
      success: true,
      message: 'Item actualizado exitosamente',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error in PUT /api/items/:id:', error);
    if (files) {
      files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {}
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la promoción',
    });
  }
});

// 5. DELETE /api/items/:id (Delete)
app.delete('/api/items/:id', (req: Request, res: Response): void => {
  try {
    const items = getDbItems();
    const itemIndex = items.findIndex((i) => i.id === req.params.id);

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Promoción no encontrada',
      });
      return;
    }

    const itemToDelete = items[itemIndex];

    // Cascade delete associated uploaded files from disk
    itemToDelete.multimedia.forEach((file: any) => {
      const filePath = path.join(UPLOAD_DIR, file.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('Deleted unlinked file from disk:', file.filename);
        } catch (err) {
          console.error('Error unlinking deleted file:', err);
        }
      }
    });

    items.splice(itemIndex, 1);
    saveDbItems(items);

    res.json({
      success: true,
      message: 'Promoción eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in DELETE /api/items/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la promoción',
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
