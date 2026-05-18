import dbConnect from './db';
import Product from './models/Product';
import Category from './models/Category';
import { promises as fs } from 'fs';
import path from 'path';

const LOCAL_DB_DIR = path.join(process.cwd(), 'data');
const LOCAL_PRODUCTS_PATH = path.join(LOCAL_DB_DIR, 'products.json');
const LOCAL_CATEGORIES_PATH = path.join(LOCAL_DB_DIR, 'categories.json');

const DEFAULT_CATEGORIES = ['Books', 'Stationery', 'Uniforms', 'Bags', 'Accessories', 'Uncategorized'];

async function ensureLocalDb() {
  try {
    await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
    
    // Ensure products.json
    try {
      await fs.access(LOCAL_PRODUCTS_PATH);
    } catch {
      await fs.writeFile(LOCAL_PRODUCTS_PATH, JSON.stringify([]));
    }

    // Ensure categories.json
    try {
      await fs.access(LOCAL_CATEGORIES_PATH);
    } catch {
      await fs.writeFile(LOCAL_CATEGORIES_PATH, JSON.stringify(DEFAULT_CATEGORIES));
    }
  } catch (error) {
    console.error('Error creating local DB file:', error);
  }
}

const generateId = () => Math.random().toString(36).substring(2, 9);

/* ================= PRODUCT SERVICES ================= */

export async function getProducts() {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      return await Product.find({}).sort({ createdAt: -1 });
    }
  } catch (error) {
    console.warn('MongoDB products fetch failed, using fallback:', error);
  }

  await ensureLocalDb();
  const fileData = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf-8');
  return JSON.parse(fileData);
}

export async function createProduct(data: any) {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      return await Product.create(data);
    }
  } catch (error) {
    console.warn('MongoDB product create failed, using fallback:', error);
  }

  await ensureLocalDb();
  const fileData = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf-8');
  const products = JSON.parse(fileData);
  
  const newProduct = {
    _id: generateId(),
    ...data,
    isAvailable: true,
    createdAt: new Date().toISOString()
  };
  
  products.unshift(newProduct);
  await fs.writeFile(LOCAL_PRODUCTS_PATH, JSON.stringify(products, null, 2));
  return newProduct;
}

export async function updateProduct(id: string, updateData: any) {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) return updated;
    }
  } catch (error) {
    console.warn('MongoDB product update failed, using fallback:', error);
  }

  await ensureLocalDb();
  const fileData = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf-8');
  const products = JSON.parse(fileData);
  
  const index = products.findIndex((p: any) => p._id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updateData };
    await fs.writeFile(LOCAL_PRODUCTS_PATH, JSON.stringify(products, null, 2));
    return products[index];
  }
  return null;
}

export async function deleteProduct(id: string) {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      const result = await Product.deleteOne({ _id: id });
      if (result.deletedCount > 0) return true;
    }
  } catch (error) {
    console.warn('MongoDB product delete failed, using fallback:', error);
  }

  await ensureLocalDb();
  const fileData = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf-8');
  const products = JSON.parse(fileData);
  
  const filtered = products.filter((p: any) => p._id !== id);
  if (filtered.length !== products.length) {
    await fs.writeFile(LOCAL_PRODUCTS_PATH, JSON.stringify(filtered, null, 2));
    return true;
  }
  return false;
}

/* ================= CATEGORY SERVICES ================= */

export async function getCategories() {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      const dbCats = await Category.find({});
      if (dbCats.length > 0) {
        return dbCats.map((c: any) => c.name);
      }
    }
  } catch (error) {
    console.warn('MongoDB categories fetch failed, using fallback:', error);
  }

  await ensureLocalDb();
  const fileData = await fs.readFile(LOCAL_CATEGORIES_PATH, 'utf-8');
  return JSON.parse(fileData);
}

export async function createCategory(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Category name cannot be empty');

  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      const exists = await Category.findOne({ name: trimmedName });
      if (exists) return exists.name;
      const created = await Category.create({ name: trimmedName });
      return created.name;
    }
  } catch (error) {
    console.warn('MongoDB category create failed, using fallback:', error);
  }

  await ensureLocalDb();
  const fileData = await fs.readFile(LOCAL_CATEGORIES_PATH, 'utf-8');
  const categories: string[] = JSON.parse(fileData);
  
  if (!categories.includes(trimmedName)) {
    categories.push(trimmedName);
    // Keep 'Uncategorized' at the end if it exists
    const index = categories.indexOf('Uncategorized');
    if (index > -1 && index !== categories.length - 1) {
      categories.splice(index, 1);
      categories.push('Uncategorized');
    }
    await fs.writeFile(LOCAL_CATEGORIES_PATH, JSON.stringify(categories, null, 2));
  }
  return trimmedName;
}

export async function deleteCategory(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Category name cannot be empty');
  if (trimmedName === 'Uncategorized') throw new Error('Cannot delete default Uncategorized category');

  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
      await dbConnect();
      // Delete from Category collection
      await Category.deleteOne({ name: trimmedName });
      // Reassign products to Uncategorized
      await Product.updateMany({ category: trimmedName }, { category: 'Uncategorized' });
      return;
    }
  } catch (error) {
    console.warn('MongoDB category delete failed, using fallback:', error);
  }

  await ensureLocalDb();
  
  // Reassign local products
  const productsFileData = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf-8');
  const products = JSON.parse(productsFileData);
  const updatedProducts = products.map((p: any) => {
    if (p.category === trimmedName) {
      return { ...p, category: 'Uncategorized' };
    }
    return p;
  });
  await fs.writeFile(LOCAL_PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2));

  // Delete local category
  const categoriesFileData = await fs.readFile(LOCAL_CATEGORIES_PATH, 'utf-8');
  const categories: string[] = JSON.parse(categoriesFileData);
  const filteredCategories = categories.filter((c) => c !== trimmedName);
  await fs.writeFile(LOCAL_CATEGORIES_PATH, JSON.stringify(filteredCategories, null, 2));
}
