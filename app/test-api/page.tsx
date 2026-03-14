"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function TestAPIPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  // Test queries
  const { data: products, isLoading: loadingProducts } =
    trpc.product.getAll.useQuery({});

  const { data: categories, isLoading: loadingCategories } =
    trpc.product.getCategories.useQuery();

  const addResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  const runTests = () => {
    setTestResults([]);

    // Test 1: Products loaded
    if (products?.products && products.products.length > 0) {
      addResult(`✅ Products loaded: ${products.products.length} items`);
      addResult(
        `   First product: ${products.products[0].name} - Rp ${products.products[0].price.toLocaleString()}`
      );
    } else {
      addResult("❌ No products found");
    }

    // Test 2: Categories loaded
    if (categories && categories.length > 0) {
      addResult(`✅ Categories loaded: ${categories.length} items`);
      addResult(`   Categories: ${categories.map((c) => c.name).join(", ")}`);
    } else {
      addResult("❌ No categories found");
    }

    // Test 3: Images parsed correctly
    if (products?.products && products.products[0].images) {
      const images = products.products[0].images;
      if (Array.isArray(images) && images.length > 0) {
        addResult(`✅ Images parsed correctly as array`);
        addResult(`   Sample image: ${images[0]}`);
      } else {
        addResult("❌ Images not parsed correctly");
      }
    }

    addResult("\n📊 Backend API Test Complete!");
  };

  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Backend API Test</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <div className="text-3xl font-bold">
                {products?.products.length || 0}
              </div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="border p-4 rounded">
              <div className="text-3xl font-bold">
                {categories?.length || 0}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        <button
          onClick={runTests}
          className="bg-black text-white px-6 py-3 rounded-lg mb-6 hover:bg-gray-800"
        >
          Run Full Tests
        </button>

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Test Results:</h3>
            <pre className="font-mono text-sm whitespace-pre-wrap">
              {testResults.join("\n")}
            </pre>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Sample Products</h2>
          <div className="space-y-4">
            {products?.products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="border p-4 rounded flex items-start gap-4"
              >
                {product.images && product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">
                      Rp {Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {product.category?.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories?.map((category) => (
              <div
                key={category.id}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
