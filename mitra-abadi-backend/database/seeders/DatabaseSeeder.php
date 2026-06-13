<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        \App\Models\User::firstOrCreate(
            ['email' => 'admin@mitraabadi.com'],
            [
                'name'     => 'Admin Mitra Abadi',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        $this->call([
            CatalogSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
