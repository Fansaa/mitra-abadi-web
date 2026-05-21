<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiOrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items.productVariant.product')
            ->latest()
            ->get()
            ->map(function ($order) {
                $orderData = $order->toArray();
                $orderData['items'] = $order->items->map(fn($item) => [
                    'id'               => $item->id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name'     => $item->productVariant?->product?->name ?? '-',
                    'color_name'       => $item->productVariant?->color_name ?? null,
                    'color_hex'        => $item->productVariant?->color_hex ?? null,
                    'warna'            => $item->warna,
                    'qty_roll'         => $item->qty_roll,
                    'qty_yard'         => $item->qty_yard,
                    'qty_meter'        => $item->qty_meter,
                    'price_per_meter'  => $item->price_per_meter,
                    'subtotal'         => $item->subtotal,
                ])->toArray();
                return $orderData;
            });

        return response()->json(['status' => 'success', 'data' => $orders]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name'              => 'required|string|max:255',
            'customer_phone'             => 'nullable|string|max:20',
            'customer_email'             => 'nullable|email|max:255',
            'customer_address'           => 'nullable|string',
            'notes'                      => 'nullable|string',
            'items'                      => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.warna'              => 'nullable|string|max:255',
            'items.*.qty_yard'           => 'nullable|numeric|min:0',
            'items.*.qty_roll'           => 'nullable|numeric|min:0',
            'items.*.total_price'        => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $itemsData   = [];

            foreach ($request->items as $item) {
                $variant  = ProductVariant::with(['product', 'inventory'])->findOrFail($item['product_variant_id']);
                $qtyRoll  = $item['qty_roll'] ?? 0;
                $subtotal = $item['total_price'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_variant_id' => $item['product_variant_id'],
                    'warna'              => $item['warna'] ?? null,
                    'qty_roll'           => $qtyRoll,
                    'qty_yard'           => $item['qty_yard'] ?? 0,
                    'qty_meter'          => 0,
                    'price_per_meter'    => 0,
                    'subtotal'           => $subtotal,
                ];
            }

            $order = Order::create([
                'order_code'       => 'ORD-' . strtoupper(Str::random(8)),
                'admin_id'         => $request->user()->id,
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'customer_email'   => $request->customer_email,
                'customer_address' => $request->customer_address,
                'notes'            => $request->notes,
                'status'           => 'draft',
                'total_amount'     => $totalAmount,
            ]);

            $order->items()->createMany($itemsData);

            return $order;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $order->load('items.productVariant.product'),
        ], 201);
    }

    public function show($id)
    {
        $order = Order::with('items.productVariant.product')->findOrFail($id);
        $orderData = $order->toArray();
        $orderData['items'] = $order->items->map(fn($item) => [
            'id'               => $item->id,
            'product_variant_id' => $item->product_variant_id,
            'product_name'     => $item->productVariant?->product?->name ?? '-',
            'color_name'       => $item->productVariant?->color_name ?? '-',
            'color_hex'        => $item->productVariant?->color_hex ?? null,
            'warna'            => $item->warna,
            'qty_roll'         => $item->qty_roll,
            'qty_yard'         => $item->qty_yard,
            'qty_meter'        => $item->qty_meter,
            'price_per_meter'  => $item->price_per_meter,
            'subtotal'         => $item->subtotal,
        ])->toArray();

        return response()->json(['status' => 'success', 'data' => $orderData]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::with('items.productVariant.product')->findOrFail($id);

        $request->validate([
            'customer_name'       => 'required|string|max:255',
            'customer_phone'      => 'nullable|string|max:20',
            'customer_email'      => 'nullable|email|max:255',
            'customer_address'    => 'nullable|string',
            'notes'               => 'nullable|string',
            'items'               => 'nullable|array',
            'items.*.id'          => 'required|integer|exists:order_items,id',
            'items.*.warna'       => 'nullable|string|max:255',
            'items.*.qty_yard'    => 'nullable|numeric|min:0',
            'items.*.qty_roll'    => 'nullable|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $order) {
            $order->update([
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'customer_email'   => $request->customer_email,
                'customer_address' => $request->customer_address,
                'notes'            => $request->notes,
            ]);

            if ($request->filled('items')) {
                $totalAmount = 0;
                foreach ($request->items as $itemData) {
                    $item     = $order->items()->findOrFail($itemData['id']);
                    $subtotal = $itemData['total_price'];

                    $item->update([
                        'warna'           => $itemData['warna'] ?? $item->warna,
                        'qty_roll'        => $itemData['qty_roll'] ?? $item->qty_roll,
                        'qty_yard'        => $itemData['qty_yard'] ?? $item->qty_yard,
                        'subtotal'        => $subtotal,
                    ]);
                    $totalAmount += $subtotal;
                }
                $order->update(['total_amount' => $totalAmount]);
            }
        });

        return response()->json(['status' => 'success', 'data' => $order->fresh()]);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['status' => 'success', 'message' => 'Pesanan berhasil dihapus.']);
    }

    public function export(Request $request)
    {
        $fromMonth = (int) ($request->query('from_month', date('n')));
        $fromYear  = (int) ($request->query('from_year',  date('Y')));
        $toMonth   = (int) ($request->query('to_month',   $fromMonth));
        $toYear    = (int) ($request->query('to_year',    $fromYear));

        $startDate = sprintf('%04d-%02d-01 00:00:00', $fromYear, $fromMonth);
        $lastDay   = date('t', mktime(0, 0, 0, $toMonth, 1, $toYear));
        $endDate   = sprintf('%04d-%02d-%02d 23:59:59', $toYear, $toMonth, $lastDay);

        $orders = Order::with('items.productVariant.product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->get();

        $rows = [];
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $rows[] = [
                    'No. Order'      => $order->order_code,
                    'Tanggal'        => $order->created_at->format('d/m/Y'),
                    'Nama Pelanggan' => $order->customer_name,
                    'Telepon'        => $order->customer_phone ?? '-',
                    'Email'          => $order->customer_email ?? '-',
                    'Alamat'         => $order->customer_address ?? '-',
                    'Produk'         => $item->productVariant?->product?->name ?? '-',
                    'Warna'          => $item->productVariant?->color_name ?? $item->productVariant?->color_hex ?? '-',
                    'Qty (Roll)'     => $item->qty_roll,
                    'Harga Total'    => $item->subtotal,
                    'Catatan'        => $order->notes ?? '-',
                ];
            }
            if ($order->items->isEmpty()) {
                $rows[] = [
                    'No. Order'      => $order->order_code,
                    'Tanggal'        => $order->created_at->format('d/m/Y'),
                    'Nama Pelanggan' => $order->customer_name,
                    'Telepon'        => $order->customer_phone ?? '-',
                    'Email'          => $order->customer_email ?? '-',
                    'Alamat'         => $order->customer_address ?? '-',
                    'Produk'         => '-',
                    'Warna'          => '-',
                    'Qty (Roll)'     => 0,
                    'Harga Total'    => $order->total_amount,
                    'Catatan'        => $order->notes ?? '-',
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'month'  => $fromMonth,
            'year'   => $fromYear,
            'total'  => $orders->count(),
            'data'   => $rows,
        ]);
    }
}
