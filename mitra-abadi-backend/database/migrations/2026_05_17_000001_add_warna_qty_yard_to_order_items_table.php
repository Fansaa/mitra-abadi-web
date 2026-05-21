<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('warna')->nullable()->after('product_variant_id');
            $table->decimal('qty_yard', 10, 2)->default(0)->after('qty_roll');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['warna', 'qty_yard']);
        });
    }
};
