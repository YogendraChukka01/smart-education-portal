import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface StorageService {
  saveFile(file: Express.Multer.File, subfolder?: string): Promise<{ fileUrl: string; filename: string; size: number }>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getFilePath(fileUrl: string): string | null;
}

export class LocalStorageService implements StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(config.uploadDir);
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public async saveFile(
    file: Express.Multer.File,
    subfolder = 'documents'
  ): Promise<{ fileUrl: string; filename: string; size: number }> {
    const targetDir = path.join(this.baseDir, subfolder);
    this.ensureDirectoryExists(targetDir);

    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueFilename = `${Date.now()}_${sanitizedBase}${ext}`;
    const destination = path.join(targetDir, uniqueFilename);

    if (file.buffer) {
      await fs.promises.writeFile(destination, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      await fs.promises.copyFile(file.path, destination);
      try {
        await fs.promises.unlink(file.path);
      } catch {
        // Ignore temp cleanup error
      }
    } else {
      throw new Error('No file buffer or path provided to saveFile');
    }

    const fileUrl = `/uploads/${subfolder}/${uniqueFilename}`;
    return {
      fileUrl,
      filename: uniqueFilename,
      size: file.size,
    };
  }

  public async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const fullPath = path.join(this.baseDir, relativePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }

  public getFilePath(fileUrl: string): string | null {
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const fullPath = path.join(this.baseDir, relativePath);
    return fs.existsSync(fullPath) ? fullPath : null;
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();
