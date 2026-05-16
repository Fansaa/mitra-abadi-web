<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    private const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

    // Berapa pesan terakhir yang disertakan sebagai riwayat percakapan
    private const MAX_HISTORY = 10;

    /**
     * Memulai sesi chat baru atau melanjutkan sesi yang ada.
     */
    public function startSession(Request $request)
    {
        $sessionToken = $request->session_token;

        if ($sessionToken) {
            $chatSession = ChatSession::where('session_token', $sessionToken)->first();
        }

        if (!isset($chatSession) || !$chatSession) {
            $chatSession = ChatSession::create([
                'session_token' => Str::uuid()->toString(),
                'user_id'       => $request->user()?->id,
                'ip_address'    => $request->ip(),
            ]);
        }

        $messages = $chatSession->messages()->orderBy('created_at')->get();

        return response()->json([
            'session_token' => $chatSession->session_token,
            'messages'      => $messages,
        ]);
    }

    /**
     * Menerima pesan user dan mengembalikan respons dari Gemini.
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'session_token' => 'required|string',
            'message'       => 'required|string|max:1000',
        ]);

        $chatSession = ChatSession::where('session_token', $validated['session_token'])->firstOrFail();

        // Simpan pesan user
        $chatSession->messages()->create([
            'role'    => 'user',
            'message' => $validated['message'],
        ]);

        // Generate respons dari Gemini
        $response = $this->callGemini($chatSession, $validated['message']);

        // Simpan respons assistant
        $chatSession->messages()->create([
            'role'    => 'assistant',
            'message' => $response,
        ]);

        return response()->json([
            'response' => $response,
        ]);
    }

    /**
     * Memanggil Gemini API dengan system prompt dan riwayat percakapan.
     */
    private function callGemini(ChatSession $session, string $userMessage): string
    {
        $apiKey = config('services.gemini.api_key');

        if (!$apiKey) {
            Log::warning('GEMINI_API_KEY belum dikonfigurasi.');
            return $this->fallbackResponse($userMessage);
        }

        $systemPrompt = $this->buildSystemPrompt();

        // Ambil riwayat percakapan sebelumnya (kecuali pesan user terbaru)
        $history = $session->messages()
            ->orderBy('created_at')
            ->latest()
            ->skip(1)
            ->limit(self::MAX_HISTORY)
            ->get()
            ->sortBy('created_at')
            ->values();

        // Bangun contents untuk Gemini (format user/model bergantian)
        $contents = $this->buildContents($history, $userMessage);

        try {
            $response = Http::timeout(20)->post(self::GEMINI_API_URL . '?key=' . $apiKey, [
                'systemInstruction' => [
                    'parts' => [['text' => $systemPrompt]],
                ],
                'contents'         => $contents,
                'generationConfig' => [
                    'temperature'     => 0.7,
                    'maxOutputTokens' => 600,
                ],
            ]);

            if ($response->successful()) {
                $text = $response->json('candidates.0.content.parts.0.text');
                if ($text) {
                    return trim($text);
                }
            }

            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

        } catch (\Exception $e) {
            Log::error('Gemini exception: ' . $e->getMessage());
        }

        return $this->fallbackResponse($userMessage);
    }

    /**
     * Membangun system prompt berisi identitas chatbot + knowledge base produk dari DB.
     */
    private function buildSystemPrompt(): string
    {
        $products = Product::with(['category', 'variants.inventory'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $katalog = '';
        foreach ($products as $i => $product) {
            $totalStock = $product->variants->sum(fn($v) => $v->inventory?->stock_roll ?? 0);
            $statusStok = $totalStock > 30 ? 'Tersedia' : ($totalStock > 0 ? 'Stok Terbatas' : 'Habis');

            $harga = '-';
            if ($product->price_min && $product->price_max) {
                $harga = 'Rp ' . number_format($product->price_min, 0, ',', '.') . ' – Rp ' . number_format($product->price_max, 0, ',', '.') . ' per yard';
            } elseif ($product->price_min) {
                $harga = 'Rp ' . number_format($product->price_min, 0, ',', '.') . ' per yard';
            }

            $warna = $product->variants->map(function ($v) {
                return $v->color_name ?: $v->color_hex;
            })->filter()->implode(', ');

            $katalog .= ($i + 1) . ". {$product->name}\n";
            $katalog .= "   - Kategori   : " . ($product->category?->name ?? '-') . "\n";
            $katalog .= "   - Range Harga: {$harga}\n";
            $katalog .= "   - Komposisi  : " . ($product->composition ?? '-') . "\n";
            $katalog .= "   - Yard/Roll  : " . ($product->yard_per_roll ? $product->yard_per_roll . ' yard' : '-') . "\n";
            if ($warna) {
                $katalog .= "   - Warna      : {$warna}\n";
            }
            $katalog .= "   - Stok       : {$statusStok} ({$totalStock} roll)\n";
            if ($product->description) {
                $katalog .= "   - Deskripsi  : {$product->description}\n";
            }
            $katalog .= "\n";
        }

        $whatsappNumber = env('WHATSAPP_ADMIN_NUMBER', '628123456789');

        return <<<PROMPT
Kamu adalah Asisten Virtual Mitra Abadi, asisten AI untuk toko distribusi bahan tekstil "Mitra Abadi".

IDENTITAS:
- Nama: Asisten Mitra Abadi
- Bahasa: Bahasa Indonesia (WAJIB, selalu)
- Tone: Ramah, profesional, ringkas
- Tujuan: Membantu pembeli mendapat info produk tekstil, spesifikasi kain, ketersediaan stok, dan cara pemesanan

KATALOG PRODUK SAAT INI:
{$katalog}
CARA PEMESANAN:
- Pembeli memilih produk dari halaman katalog
- Hubungi admin via WhatsApp untuk konfirmasi dan pemesanan
- WhatsApp Admin: {$whatsappNumber}

ATURAN MENJAWAB:
1. Jawab hanya berdasarkan data katalog di atas. Jangan mengarang spesifikasi.
2. Jika produk tidak ada di katalog, katakan jujur tidak tersedia.
3. Untuk negosiasi harga atau konfirmasi stok real-time, arahkan ke WhatsApp Admin.
4. JANGAN sebut dirimu AI atau model bahasa. Kamu adalah "Asisten Mitra Abadi".
5. Jawab dalam Bahasa Indonesia yang ramah dan natural.
6. Respons singkat 2-4 kalimat, kecuali diminta perincian lengkap.
7. Gunakan bullet point untuk daftar produk atau spesifikasi jika perlu.
PROMPT;
    }

    /**
     * Membangun array contents untuk Gemini (format user/model bergantian).
     */
    private function buildContents($history, string $currentMessage): array
    {
        $contents = [];

        foreach ($history as $msg) {
            $role       = $msg->role === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role'  => $role,
                'parts' => [['text' => $msg->message]],
            ];
        }

        // Pastikan dimulai dengan 'user'
        while (!empty($contents) && $contents[0]['role'] !== 'user') {
            array_shift($contents);
        }

        // Hapus consecutive same-role
        $filtered = [];
        $lastRole  = null;
        foreach ($contents as $c) {
            if ($c['role'] !== $lastRole) {
                $filtered[] = $c;
                $lastRole   = $c['role'];
            }
        }

        // Jika pesan terakhir sudah 'user', pop dulu
        if (!empty($filtered) && end($filtered)['role'] === 'user') {
            array_pop($filtered);
        }

        $filtered[] = [
            'role'  => 'user',
            'parts' => [['text' => $currentMessage]],
        ];

        return $filtered;
    }

    /**
     * Respons fallback jika Gemini tidak tersedia.
     */
    private function fallbackResponse(string $message): string
    {
        $msg = strtolower($message);

        if (str_contains($msg, 'harga') || str_contains($msg, 'price')) {
            return 'Untuk informasi harga terbaru, silakan lihat katalog produk kami atau hubungi admin via WhatsApp.';
        }
        if (str_contains($msg, 'stok') || str_contains($msg, 'tersedia')) {
            return 'Ketersediaan stok dapat dilihat di halaman katalog. Untuk info stok real-time, silakan hubungi admin via WhatsApp.';
        }
        if (str_contains($msg, 'pesan') || str_contains($msg, 'order') || str_contains($msg, 'beli')) {
            return 'Untuk memesan, pilih produk di katalog lalu hubungi admin via WhatsApp. Kami siap membantu!';
        }

        return 'Terima kasih atas pertanyaan Anda. Untuk bantuan lebih lanjut, silakan hubungi admin Mitra Abadi melalui WhatsApp.';
    }
}
