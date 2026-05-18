import { NextResponse } from 'next/server';
import { getCategories, createCategory, deleteCategory } from '@/lib/productService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('API Error in GET /api/categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const category = await createCategory(name);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();
    await deleteCategory(name);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('API Error in DELETE /api/categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 400 });
  }
}
