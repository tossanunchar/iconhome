import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Column 1 — แบรนด์ + คำอธิบาย */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">ไอคอนโฮม</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              จำหน่ายวัสดุก่อสร้าง : สุขภัณฑ์ กระเบื้องปูพื้น/ผนัง
              ไม้ฝา เครื่องใช้ไฟฟ้า เหล็กเส้น สรีไท พัดลมไม้
            </p>
            <p className="text-sm text-gray-400 mt-2">เปิดบริการทุกวัน 08:00 - 18:00 น.</p>

            {/* Social icons */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {/* Facebook สาขาเสลภูมิ */}
              <a
                href="https://www.facebook.com/iconhome2022"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook สาขาเสลภูมิ"
                className="hover:text-blue-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* Facebook สาขาเลิงนกทา */}
              <a
                href="https://www.facebook.com/ICONHOME2019"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook สาขาเลิงนกทา"
                className="hover:text-blue-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* TikTok @iconhomegroup */}
              <a
                href="https://www.tiktok.com/@iconhomegroup"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok @iconhomegroup"
                className="hover:text-pink-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>
              {/* TikTok @iconhomeselaphum */}
              <a
                href="https://www.tiktok.com/@iconhomeselaphum"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok @iconhomeselaphum"
                className="hover:text-pink-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>
              {/* TikTok @reviewbarnbyiconhome */}
              <a
                href="https://www.tiktok.com/@reviewbarnbyiconhome"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok @reviewbarnbyiconhome"
                className="hover:text-pink-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — ลิงก์ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">เกี่ยวกับเรา</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-red-400 transition-colors">ติดต่อเรา</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-400 transition-colors">เกี่ยวกับเรา</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-400 transition-colors">ข้อกำหนดและเงื่อนไข</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — ติดต่อ 2 สาขา */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">ติดต่อเรา</h3>
            <div className="text-sm space-y-4 text-gray-400">

              {/* สาขาเสลภูมิ */}
              <div>
                <p className="text-white font-semibold text-xs uppercase tracking-wide mb-1.5">
                  สาขาเสลภูมิ
                </p>
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  เลขที่ 46 หมู่ 5 ต.ขวัญเมือง อ.เสลภูมิ ร้อยเอ็ด 45120
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:0803293258" className="hover:text-red-400 transition-colors">080-329-3258</a>
                </p>
              </div>

              {/* สาขาเลิงนกทา */}
              <div>
                <p className="text-white font-semibold text-xs uppercase tracking-wide mb-1.5">
                  สาขาเลิงนกทา
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:0634128250" className="hover:text-red-400 transition-colors">063-412-8250</a>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © 2026 ไอคอนโฮม. All rights reserved.
      </div>
    </footer>
  );
}
