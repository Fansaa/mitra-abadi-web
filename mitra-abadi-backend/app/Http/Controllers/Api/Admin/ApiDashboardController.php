<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;

class ApiDashboardController extends Controller
{
    public function index()
    {
        $totalProducts = Product::count();
        $totalOrders   = Order::count();
        $totalRevenue  = Order::sum('total_amount');

        $recentOrders = Order::with('items.productVariant.product')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id'            => $order->id,
                'customer_name' => $order->customer_name,
                'product_name'  => $order->items->first()?->productVariant?->product?->name ?? '-',
                'qty_yard'      => $order->items->sum('qty_yard'),
                'total_amount'  => $order->total_amount,
                'status'        => $order->status,
                'created_at'    => $order->created_at,
            ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_products' => $totalProducts,
                'total_orders'   => $totalOrders,
                'total_revenue'  => $totalRevenue,
                'recent_orders'  => $recentOrders,
            ],
        ]);
    }
}
