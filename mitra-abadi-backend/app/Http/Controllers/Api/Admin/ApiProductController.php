<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApiProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'variants.inventory'])
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->latest()
            ->get();

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'category_id'     => 'required|exists:categories,id',
            'price_min'       => 'required|numeric|min:0',
            'price_max'       => 'required|numeric|min:0|gte:price_min',
            'description'     => 'nullable|string',
            'composition'     => 'nullable|string|max:255',
            'yard_per_roll'   => 'required|numeric|min:0.01',
            'variants'                       => 'nullable|array',
            'variants.*.color_name'          => 'required_with:variants|string|max:255',
            'variants.*.color_hex'           => 'nullable|string|max:7',
            'variants.*.image'               => 'nullable|image|max:10240',
            'variants.*.stock_roll'          => 'nullable|integer|min:0',
            'variants.*.low_stock_threshold' => 'nullable|integer|min:0',
        ]);

        $product = DB::transaction(function () use ($request) {
            do {
                $slug = Str::slug($request->name) . '-' . Str::random(5);
            } while (Product::where('slug', $slug)->exists());

            $product = Product::create([
                'category_id'  => $request->category_id,
                'name'         => $request->name,
                'price_min'    => $request->price_min,
                'price_max'    => $request->price_max,
                'slug'         => $slug,
                'description'  => $request->description,
                'composition'  => $request->composition,
                'yard_per_roll' => $request->yard_per_roll,
                'is_active'    => true,
            ]);

            foreach ($request->variants ?? [] as $vData) {
                $imagePath = null;
                if (!empty($vData['image'])) {
                    $imagePath = $vData['image']->store('products/variants', 'public');
                }

                $variant = $product->variants()->create([
                    'color_name' => $vData['color_name'],
                    'color_hex'  => $vData['color_hex'] ?? null,
                    'image_path' => $imagePath,
                ]);

                $variant->inventory()->create([
                    'stock_roll'          => $vData['stock_roll'] ?? 0,
                    'stock_meter'         => 0,
                    'stock_yard'          => 0,
                    'low_stock_threshold' => $vData['low_stock_threshold'] ?? 10,
                ]);
            }

            return $product;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $product->load(['category', 'variants.inventory']),
        ], 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'variants.inventory'])->findOrFail($id);

        return response()->json(['status' => 'success', 'data' => $product]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name'         => 'required|string|max:255',
            'category_id'  => 'required|exists:categories,id',
            'price_min'    => 'required|numeric|min:0',
            'price_max'    => 'required|numeric|min:0|gte:price_min',
            'description'  => 'nullable|string',
            'composition'  => 'nullable|string|max:255',
            'yard_per_roll' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($request, $product) {
            $slug = $product->slug;
            if ($request->name !== $product->name) {
                do {
                    $slug = Str::slug($request->name) . '-' . Str::random(5);
                } while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists());
            }

            $product->update([
                'category_id'  => $request->category_id,
                'name'         => $request->name,
                'price_min'    => $request->price_min,
                'price_max'    => $request->price_max,
                'slug'         => $slug,
                'description'  => $request->description,
                'composition'  => $request->composition,
                'yard_per_roll' => $request->yard_per_roll,
            ]);

            foreach ($request->variants ?? [] as $vData) {
                if (empty($vData['id'])) continue;
                $variant = $product->variants()->find($vData['id']);
                if (!$variant) continue;

                $updates = [];

                if (!empty($vData['image'])) {
                    $newPath = $vData['image']->store('products/variants', 'public');
                    $oldPath = $variant->image_path;
                    $updates['image_path'] = $newPath;
                    if ($oldPath) Storage::disk('public')->delete($oldPath);
                }

                if (isset($vData['color_name'])) {
                    $updates['color_name'] = $vData['color_name'];
                    $updates['color_hex']  = $vData['color_hex'] ?? $variant->color_hex;
                }

                if ($updates) $variant->update($updates);
            }
        });

        return response()->json([
            'status' => 'success',
            'data'   => $product->fresh(['category', 'variants.inventory']),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::with('variants')->findOrFail($id);

        foreach ($product->variants as $variant) {
            if ($variant->image_path) {
                Storage::disk('public')->delete($variant->image_path);
            }
        }

        $product->delete();

        return response()->json(['status' => 'success', 'message' => 'Produk dihapus.']);
    }
}
