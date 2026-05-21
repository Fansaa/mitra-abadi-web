<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_code }}</title>
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
            font-size: 30px;
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
            width: 110px;
        }

        .meta-table td:last-child {
            color: #1a1a1a;
            font-weight: 500;
        }

        .billed-to-box {
            background: #fdf2f2;
            border: 1px solid #f5c6c6;
            border-radius: 6px;
            padding: 14px 16px;
        }

        .billed-to-name {
            font-size: 13px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 4px;
        }

        .billed-to-detail {
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

        .items-table thead tr {
            background: #c0392b;
            color: #ffffff;
        }

        .items-table thead th {
            padding: 10px 12px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .items-table thead th.text-right {
            text-align: right;
        }

        .items-table thead th.text-center {
            text-align: center;
        }

        .items-table tbody tr {
            border-bottom: 1px solid #f0d8d8;
        }

        .items-table tbody tr:nth-child(even) {
            background: #fdf5f5;
        }

        .items-table tbody td {
            padding: 10px 12px;
            font-size: 11px;
            color: #1a1a1a;
            vertical-align: middle;
        }

        .items-table tbody td.text-right {
            text-align: right;
        }

        .items-table tbody td.text-center {
            text-align: center;
        }

        .color-swatch {
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 3px;
            border: 1px solid #ccc;
            vertical-align: middle;
            margin-right: 5px;
        }

        .color-hex {
            font-size: 10px;
            color: #444;
            vertical-align: middle;
        }

        .total-row td {
            background: #c0392b !important;
            color: #ffffff !important;
            font-weight: bold;
            font-size: 12px;
            padding: 12px !important;
        }

        .total-row td.text-right {
            text-align: right;
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

        /* ── SIGNATURE ── */
        .signature-section {
            display: table;
            width: 100%;
            margin-top: 28px;
            margin-bottom: 8px;
        }

        .signature-spacer {
            display: table-cell;
        }

        .signature-block {
            display: table-cell;
            width: 160px;
            text-align: center;
        }

        .signature-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 4px;
        }

        .signature-img {
            width: 140px;
            height: 70px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }

        .signature-line {
            border-top: 1px solid #333;
            margin: 4px auto 0;
            width: 140px;
        }

        .signature-name {
            font-size: 11px;
            font-weight: bold;
            color: #1a1a1a;
            margin-top: 4px;
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
                <div class="doc-title">INVOICE</div>
                <div class="doc-subtitle">Dokumen Tagihan Resmi</div>
            </div>
        </div>
    </div>

    {{-- META SECTION --}}
    <div class="meta-section">
        <div class="meta-left">
            <div class="section-label">Informasi Invoice</div>
            <table class="meta-table">
                <tr>
                    <td>No. Invoice</td>
                    <td>: <strong>{{ $order->order_code }}</strong></td>
                </tr>
                <tr>
                    <td>Tanggal</td>
                    <td>: {{ \Carbon\Carbon::parse($order->created_at)->format('d/m/Y') }}</td>
                </tr>
            </table>
        </div>
        <div class="meta-right">
            <div class="section-label">Ditagihkan Kepada</div>
            <div class="billed-to-box">
                <div class="billed-to-name">{{ $order->customer_name }}</div>
                <div class="billed-to-detail">
                    @if($order->customer_phone)
                        Telp: {{ $order->customer_phone }}<br>
                    @endif
                    @if($order->customer_email)
                        Email: {{ $order->customer_email }}<br>
                    @endif
                    @if($order->customer_address)
                        {{ $order->customer_address }}
                    @endif
                </div>
            </div>
        </div>
    </div>

    {{-- ITEMS TABLE --}}
    <div class="section-label">Rincian Pesanan</div>
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 32px;">No</th>
                <th>Nama Produk</th>
                <th>Warna</th>
                <th class="text-center">Qty (Yard)</th>
                <th class="text-right">Total Harga</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order->items as $index => $item)
                @php
                    $variant     = $item->productVariant;
                    $product     = $variant?->product;
                    $productName = $product?->name ?? '-';
                    $colorHex    = $variant?->color_hex ?? null;
                    $warnaText   = $item->warna ?? ($variant?->color_name ?? null);
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $productName }}</td>
                    <td>
                        @if($warnaText)
                            {{ $warnaText }}
                        @elseif($colorHex)
                            <span class="color-swatch" style="background-color: {{ $colorHex }};"></span>
                            <span class="color-hex">{{ $colorHex }}</span>
                        @else
                            -
                        @endif
                    </td>
                    <td class="text-center">{{ number_format($item->qty_yard ?? 0, 2, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($item->subtotal ?? 0, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #888;">
                        Tidak ada item pesanan.
                    </td>
                </tr>
            @endforelse
            <tr class="total-row">
                <td colspan="4" style="text-align: right; padding-right: 16px;">TOTAL</td>
                <td class="text-right">Rp {{ number_format($order->total_amount ?? 0, 0, ',', '.') }}</td>
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

    {{-- SIGNATURE --}}
    @php
        $ttdPath = public_path('images/ttd.png');
        $ttdData = file_exists($ttdPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($ttdPath))
            : null;
    @endphp
    <div class="signature-section">
        <div class="signature-spacer"></div>
        <div class="signature-block">
            <div class="signature-label">Hormat Kami,</div>
            @if($ttdData)
                <img src="{{ $ttdData }}" class="signature-img" alt="Tanda Tangan">
            @else
                <div style="height: 70px;"></div>
            @endif
            <div class="signature-line"></div>
            <div class="signature-name">Andy</div>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        Dokumen ini dibuat secara otomatis oleh sistem Mitra Abadi.
    </div>

</body>

</html>
