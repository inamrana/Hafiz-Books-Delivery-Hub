import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/productService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('API Error in GET /api/products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await createProduct(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/products:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 400 });
  }
}
