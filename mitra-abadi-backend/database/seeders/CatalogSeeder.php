<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Inventory;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoriesData = [
            [
                'name' => 'Kain Katun',
                'description' => 'Berbagai macam kain katun kualitas premium yang adem dan menyerap keringat.',
                'products' => [
                    [
                        'name' => 'Katun Toyobo Premium',
                        'description' => 'Katun jepang original, serat rapat, tidak menerawang dan sangat adem.',
                        'sku_code' => 'SKU-KTN-001',
                        'price_min' => 38000,
                        'price_max' => 45000,
                        'gsm' => 130,
                        'width_cm' => 150,
                        'meter_per_roll' => 40,
                        'yard_per_roll' => 43.7,
                        'variants' => [
                            ['color_name' => 'Maroon', 'color_hex' => '#800000', 'pattern' => 'Solid'],
                        ]
                    ],
                    [
                        'name' => 'Katun Madinah',
                        'description' => 'Kain katun jatuh dengan tekstur serat yang unik, sangat cocok untuk gamis.',
                        'sku_code' => 'SKU-KTN-002',
                        'price_min' => 32000,
                        'price_max' => 40000,
                        'gsm' => 145,
                        'width_cm' => 150,
                        'meter_per_roll' => 50,
                        'yard_per_roll' => 54.6,
                        'variants' => [
                            ['color_name' => 'Dusty Pink', 'color_hex' => '#DCAE96', 'pattern' => 'Heather'],
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Kain Rayon',
                'description' => 'Kain rayon yang jatuh, super lembut, dan cocok untuk daster atau pakaian santai.',
                'products' => [
                    [
                        'name' => 'Rayon Twill',
                        'description' => 'Rayon dengan anyaman serat twill (miring) sehingga lebih tebal dan awet.',
                        'sku_code' => 'SKU-RYN-001',
                        'price_min' => 28000,
                        'price_max' => 35000,
                        'gsm' => 150,
                        'width_cm' => 150,
                        'meter_per_roll' => 60,
                        'yard_per_roll' => 65.6,
                        'variants' => [
                            ['color_name' => 'Black', 'color_hex' => '#000000', 'pattern' => 'Solid'],
                        ]
                    ],
                    [
                        'name' => 'Rayon Viscose Motif',
                        'description' => 'Rayon viscose motif floral elegan, kualitas export.',
                        'sku_code' => 'SKU-RYN-002',
                        'price_min' => 35000,
                        'price_max' => 42000,
                        'gsm' => 120,
                        'width_cm' => 150,
                        'meter_per_roll' => 50,
                        'yard_per_roll' => 54.6,
                        'variants' => [
                            ['color_name' => 'Floral Blue', 'color_hex' => '#4682B4', 'pattern' => 'Floral'],
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Kain Linen',
                'description' => 'Kain linen alami dengan tekstur khas yang memberi kesan mewah dan kasual.',
                'products' => [
                    [
                        'name' => 'Linen Rami',
                        'description' => 'Linen dengan serat rami, kuat, tahan lama dan semakin lembut jika sering dicuci.',
                        'sku_code' => 'SKU-LNN-001',
                        'price_min' => 45000,
                        'price_max' => 55000,
                        'gsm' => 160,
                        'width_cm' => 145,
                        'meter_per_roll' => 45,
                        'yard_per_roll' => 49.2,
                        'variants' => [
                            ['color_name' => 'Broken White', 'color_hex' => '#F2F0E6', 'pattern' => 'Solid'],
                        ]
                    ]
                ]
            ]
        ];

        foreach ($categoriesData as $catData) {
            // Create Category
            $category = Category::create([
                'name' => $catData['name'],
                'slug' => Str::slug($catData['name']),
                'description' => $catData['description'],
            ]);

            foreach ($catData['products'] as $prodData) {
                // Create Product
                $product = Product::create([
                    'category_id' => $category->id,
                    'name' => $prodData['name'],
                    'price_min' => $prodData['price_min'] ?? 0,
                    'price_max' => $prodData['price_max'] ?? 0,
                    'slug' => Str::slug($prodData['name']),
                    'description' => $prodData['description'],
                    'sku_code' => $prodData['sku_code'],
                    'gsm' => $prodData['gsm'],
                    'width_cm' => $prodData['width_cm'],
                    'meter_per_roll' => $prodData['meter_per_roll'],
                    'yard_per_roll' => $prodData['yard_per_roll'],
                    'is_active' => true,
                ]);

                foreach ($prodData['variants'] as $varData) {
                    // Create Product Variant
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'color_name' => $varData['color_name'],
                        'color_hex' => $varData['color_hex'],
                        'pattern' => $varData['pattern'],
                    ]);

                    // Create Inventory for this variant
                    Inventory::create([
                        'product_variant_id' => $variant->id,
                        'stock_roll' => rand(5, 50),
                        'stock_meter' => rand(0, 100) + (rand(0, 99) / 100),
                        'stock_yard' => rand(0, 100) + (rand(0, 99) / 100),
                        'low_stock_threshold' => 10,
                    ]);
                }
            }
        }
    }
}
