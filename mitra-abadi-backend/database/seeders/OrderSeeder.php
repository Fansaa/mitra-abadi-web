<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Dapatkan semua varian produk beserta produknya
        $variants = ProductVariant::with('product')->get();
        if ($variants->isEmpty()) {
            $this->command->warn('Varian produk kosong. Silakan jalankan CatalogSeeder terlebih dahulu.');
            return;
        }

        // 2. Dapatkan admin untuk pencatatan
        $admin = User::where('role', 'admin')->first();
        $adminId = $admin ? $admin->id : null;

        // 3. Data Pelanggan Fiktif yang Realistis (Fashion & Konveksi di Indonesia)
        $customers = [
            [
                'name' => 'Butik Sinar Abadi',
                'phone' => '082198765432',
                'email' => 'contact@sinarabadi.co.id',
                'address' => 'Pusat Grosir Tanah Abang Blok A No. 45, Jakarta Pusat'
            ],
            [
                'name' => 'Konveksi Maju Jaya',
                'phone' => '087811223344',
                'email' => 'majujaya.garment@gmail.com',
                'address' => 'Kawasan Industri Cibaduyut No. 8, Bandung'
            ],
            [
                'name' => 'Hijab Syar\'i Rahma',
                'phone' => '081399887766',
                'email' => 'cs@rahmasyari.com',
                'address' => 'Ruko Margonda Raya No. 102, Depok'
            ],
            [
                'name' => 'Batik Kencana Wungu',
                'phone' => '081234567890',
                'email' => 'info@kencanawungu.com',
                'address' => 'Jl. Pekalongan No. 12, Pekalongan'
            ],
            [
                'name' => 'Butik Amanda Bandung',
                'phone' => '081122334455',
                'email' => 'order@amandaboutique.com',
                'address' => 'Jl. Ir. H. Juanda (Dago) No. 85, Bandung'
            ],
            [
                'name' => 'Tailor & Gown Asri',
                'phone' => '081288990011',
                'email' => 'asri.tailor@yahoo.com',
                'address' => 'Jl. Jend. Sudirman No. 240, Yogyakarta'
            ],
            [
                'name' => 'Valencia Couture',
                'phone' => '089988776655',
                'email' => 'valencia@couture.id',
                'address' => 'Kuningan City Mall Lt. UG, Jakarta Selatan'
            ],
            [
                'name' => 'Sinar Fashion Pekalongan',
                'phone' => '085244556677',
                'email' => 'sinarfashion.pkl@gmail.com',
                'address' => 'Jl. Dr. Cipto No. 40, Pekalongan'
            ]
        ];

        $statuses = ['selesai', 'proses', 'konfirmasi', 'draft', 'batal'];

        // 4. Generate 20 Order Acak
        for ($i = 1; $i <= 22; $i++) {
            // Pilih pelanggan secara acak
            $cust = $customers[array_rand($customers)];

            // Tentukan status dengan bobot tertentu (lebih banyak 'selesai' agar ada estimasi pendapatan)
            $randStatusNum = rand(1, 100);
            if ($randStatusNum <= 65) {
                $status = 'selesai'; // Selesai (lunas)
            } elseif ($randStatusNum <= 80) {
                $status = 'proses';
            } elseif ($randStatusNum <= 92) {
                $status = 'konfirmasi';
            } elseif ($randStatusNum <= 97) {
                $status = 'draft';
            } else {
                $status = 'batal';
            }

            // Generate tanggal pemesanan acak dalam 30 hari ke belakang
            $createdAt = now()->subDays(rand(0, 29))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            // Create Order
            $order = Order::create([
                'order_code' => 'ORD-' . strtoupper(Str::random(3)) . '-' . date('Ymd') . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'admin_id' => $adminId,
                'customer_name' => $cust['name'],
                'customer_phone' => $cust['phone'],
                'customer_email' => $cust['email'],
                'customer_address' => $cust['address'],
                'status' => $status,
                'notes' => rand(1, 10) > 7 ? 'Harap dipacking double dengan plastik anti-air.' : null,
                'total_amount' => 0, // di-update setelah kalkulasi detail item
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);

            $totalAmount = 0;
            $itemCount = rand(1, 3); // 1 sampai 3 item per order
            $selectedVariants = $variants->random($itemCount);

            foreach ($selectedVariants as $variant) {
                $product = $variant->product;

                // Tentukan jumlah roll secara acak (1 s/d 8 roll)
                $qtyRoll = rand(1, 8);

                // Default rolls meters/yards jika database bernilai nol
                $meterPerRoll = $product->meter_per_roll > 0 ? $product->meter_per_roll : 50;
                $yardPerRoll = $product->yard_per_roll > 0 ? $product->yard_per_roll : 54.6;

                // Kalkulasi total meter dan yard
                $qtyMeter = $qtyRoll * $meterPerRoll;
                $qtyYard = $qtyRoll * $yardPerRoll;

                // Tentukan harga per meter secara acak di antara price_min & price_max
                $priceMin = $product->price_min > 0 ? (int)$product->price_min : 30000;
                $priceMax = $product->price_max > 0 ? (int)$product->price_max : 45000;
                $pricePerMeter = rand($priceMin, $priceMax);

                $subtotal = $qtyMeter * $pricePerMeter;

                // Buat Order Item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $variant->id,
                    'warna' => $variant->color_name,
                    'qty_roll' => $qtyRoll,
                    'qty_yard' => $qtyYard,
                    'qty_meter' => $qtyMeter,
                    'price_per_meter' => $pricePerMeter,
                    'subtotal' => $subtotal,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt
                ]);

                $totalAmount += $subtotal;
            }

            // Update total_amount pesanan
            $order->update(['total_amount' => $totalAmount]);
        }
    }
}
