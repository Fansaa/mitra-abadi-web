<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Packing List {{ $order->order_code }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            color: #1a1a1a;
            background: #ffffff;
            padding: 40px;
        }

        /* ── HEADER ── */
        .header {
            border-bottom: 3px solid #c0392b;
            padding-bottom: 18px;
            margin-bottom: 24px;
        }

        .header-top {
            display: table;
            width: 100%;
        }

        .logo-cell {
            display: table-cell;
            vertical-align: middle;
            width: 64px;
        }

        .logo-cell img {
            width: 60px;
            height: 60px;
        }

        .company-cell {
            display: table-cell;
            vertical-align: middle;
            padding-left: 12px;
        }

        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #c0392b;
            letter-spacing: 1px;
        }

        .company-tagline {
            font-size: 10px;
            color: #555;
            margin-top: 2px;
        }

        .company-address {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
            line-height: 1.5;
        }

        .doc-title-cell {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
        }

        .doc-title {
            font-size: 26px;
            font-weight: bold;
            color: #c0392b;
            letter-spacing: 3px;
        }

        .doc-subtitle {
            font-size: 10px;
            color: #888;
            margin-top: 4px;
        }

        /* ── META ── */
        .meta-section {
            display: table;
            width: 100%;
            margin-bottom: 24px;
        }

        .meta-left {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }

        .meta-right {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }

        .section-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 8px;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-table td {
            padding: 3px 0;
            font-size: 11px;
        }

        .meta-table td:first-child {
            color: #666;
            width: 130px;
        }

        .meta-table td:last-child {
            color: #1a1a1a;
            font-weight: 500;
        }

        .customer-box {
            background: #fdf2f2;
            border: 1px solid #f5c6c6;
            border-radius: 6px;
            padding: 14px 16px;
        }

        .customer-name {
            font-size: 13px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 4px;
        }

        .customer-detail {
            font-size: 10px;
            color: #555;
            line-height: 1.6;
        }

        /* ── ITEMS TABLE ── */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th, .items-table td {
            border: 1px solid #1a1a1a;
            text-align: center;
            vertical-align: middle;
            font-size: 9px;
        }

        .items-table thead th {
            background: #c0392b;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 5px 4px;
        }

        .items-table thead th.col-main {
            text-align: left;
            padding: 5px 8px;
        }

        .items-table tbody td {
            height: 20px;
            padding: 3px 6px;
            color: #1a1a1a;
        }

        .items-table tbody td.td-main {
            text-align: left;
            font-size: 10px;
            font-weight: 500;
        }

        .total-row td {
            background: #f5f5f5 !important;
            font-weight: bold;
            font-size: 10px;
            padding: 6px 8px !important;
            height: 24px;
        }

        /* ── NOTES ── */
        .notes-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            padding: 12px 16px;
            margin-bottom: 20px;
        }

        .notes-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #92400e;
            margin-bottom: 4px;
        }

        .notes-text {
            font-size: 11px;
            color: #78350f;
            line-height: 1.5;
        }

        /* ── CHECKLIST ── */
        .checklist-section {
            margin-bottom: 24px;
        }

        .checklist-title {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 10px;
        }

        .checklist-item {
            font-size: 11px;
            color: #1a1a1a;
            margin-bottom: 8px;
            line-height: 1.5;
        }

        /* ── SIGNATURE ── */
        .signature-section {
            display: table;
            width: 100%;
            margin-top: 24px;
            margin-bottom: 8px;
        }

        .signature-block {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 0 20px;
        }

        .signature-label {
            font-size: 10px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 60px;
        }

        .signature-line {
            border-top: 1px solid #333;
            padding-top: 6px;
            font-size: 10px;
            color: #555;
        }

        /* ── FOOTER ── */
        .footer {
            border-top: 1px solid #f0d8d8;
            padding-top: 14px;
            text-align: center;
            font-size: 9px;
            color: #aaa;
            margin-top: 16px;
        }
    </style>
</head>

<body>

    {{-- HEADER --}}
    <div class="header">
        <div class="header-top">
            <div class="logo-cell">
                @php
                    $logoPath = public_path('images/logo.png');
                    $logoData = file_exists($logoPath)
                        ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
                        : '';
                @endphp
                @if($logoData)
                    <img src="{{ $logoData }}" alt="Logo Mitra Abadi">
                @endif
            </div>
            <div class="company-cell">
                <div class="company-name">MITRA ABADI</div>
                <div class="company-tagline">Distributor Bahan Tekstil Terpercaya</div>
                <div class="company-address">
                    Taman Kopo Indah 2, Blok D4 No. 46<br>
                    Telp: 0812-1425-57670
                </div>
            </div>
            <div class="doc-title-cell">
                <div class="doc-title">PACKING LIST</div>
                <div class="doc-subtitle">Daftar Barang Pengiriman</div>
            </div>
        </div>
    </div>

    {{-- META SECTION --}}
    <div class="meta-section">
        <div class="meta-left">
            <div class="section-label">Informasi Pesanan</div>
            <table class="meta-table">
                <tr>
                    <td>Nomor Pesanan</td>
                    <td>: <strong>{{ $order->order_code }}</strong></td>
                </tr>
                <tr>
                    <td>Tanggal</td>
                    <td>: {{ \Carbon\Carbon::parse($order->created_at)->format('d/m/Y') }}</td>
                </tr>
            </table>
        </div>
        <div class="meta-right">
            <div class="section-label">Data Pelanggan</div>
            <div class="customer-box">
                <div class="customer-name">{{ $order->customer_name }}</div>
                <div class="customer-detail">
                    @if($order->customer_phone)
                        Telp: {{ $order->customer_phone }}<br>
                    @endif
                    @if($order->customer_address)
                        {{ $order->customer_address }}
                    @endif
                </div>
            </div>
        </div>
    </div>

    {{-- ITEMS TABLE --}}
    <div class="section-label">Daftar Barang</div>
    <table class="items-table">
        <thead>
            <tr>
                <th rowspan="2" class="col-main" style="width: 130px;">Nama Produk</th>
                <th rowspan="2" class="col-main" style="width: 80px;">Warna</th>
                <th colspan="10" style="text-align: center;">RINCIAN</th>
                <th colspan="2" style="text-align: center;">TOTAL</th>
            </tr>
            <tr>
                <th style="width: 22px;">1</th>
                <th style="width: 22px;">2</th>
                <th style="width: 22px;">3</th>
                <th style="width: 22px;">4</th>
                <th style="width: 22px;">5</th>
                <th style="width: 22px;">6</th>
                <th style="width: 22px;">7</th>
                <th style="width: 22px;">8</th>
                <th style="width: 22px;">9</th>
                <th style="width: 22px;">10</th>
                <th style="width: 34px;">PCS</th>
                <th style="width: 34px;">YARDS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order->items as $item)
                @php
                    $variant     = $item->productVariant;
                    $product     = $variant?->product;
                    $productName = $product?->name ?? '-';
                    $colorName   = $item->warna ?? $variant?->color_name ?? '-';
                @endphp
                <tr>
                    <td class="td-main">{{ $productName }}</td>
                    <td class="td-main">{{ $colorName }}</td>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td></td><td></td>
                </tr>
            @empty
                <tr>
                    <td colspan="14" style="text-align: center; padding: 16px; color: #888;">
                        Tidak ada item pesanan.
                    </td>
                </tr>
            @endforelse
            <tr class="total-row">
                <td colspan="12" style="text-align: right; padding-right: 10px; font-weight: bold;">TOTAL</td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    {{-- NOTES --}}
    @if($order->notes)
        <div class="notes-box">
            <div class="notes-label">Catatan</div>
            <div class="notes-text">{{ $order->notes }}</div>
        </div>
    @endif

    {{-- CHECKLIST --}}
    <div class="checklist-section">
        <div class="checklist-title">Pemeriksaan Barang</div>
        <div class="checklist-item">&#9633; Barang telah diperiksa oleh gudang</div>
        <div class="checklist-item">&#9633; Barang siap dikirim</div>
    </div>

    {{-- SIGNATURE --}}
    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-label">Disiapkan Oleh</div>
            <div class="signature-line">( _________________________ )</div>
        </div>
        <div class="signature-block">
            <div class="signature-label">Diperiksa Oleh</div>
            <div class="signature-line">( _________________________ )</div>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        Dokumen ini dibuat secara otomatis oleh sistem Mitra Abadi.
    </div>

</body>

</html>
