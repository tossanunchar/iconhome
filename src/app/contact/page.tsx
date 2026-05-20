import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-red-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">ติดต่อเรา</span>
      </nav>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-t-sm border-b border-gray-200">
              เกี่ยวกับเรา
            </div>
            <ul className="divide-y divide-gray-100">
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium bg-red-50 text-red-600 border-l-2 border-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  ติดต่อเรา
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  เกี่ยวกับเรา
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Map */}
          <div className="bg-white border border-gray-200 rounded-sm mb-4 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.2!2d103.98!3d15.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDM5JzAwLjAiTiAxMDPCsDU4JzQ4LjAiRQ!5e0!3m2!1sth!2sth!4v1234567890"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch 1 */}
            <div className="bg-white border border-gray-200 rounded-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                สาขาเสลภูมิ
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  เลขที่ 46 หมู่ 5 ตำบลขวัญเมือง อำเภอเสลภูมิ ร้อยเอ็ด 45120
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:0803293258" className="hover:text-red-600 transition-colors">080-329-3258</a>
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  08:00 - 18:00 น.
                </p>
              </div>
            </div>

            {/* Branch 2 */}
            <div className="bg-white border border-gray-200 rounded-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                สาขาเลิงนกทา
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:0634128250" className="hover:text-red-600 transition-colors">063-412-8250</a>
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  08:00 - 18:00 น.
                </p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 mt-4">
            <h2 className="font-bold text-gray-800 mb-4">ส่งข้อความถึงเรา</h2>
            <form className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" placeholder="ชื่อของคุณ" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                  <input type="tel" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" placeholder="0XX-XXX-XXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
                <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ข้อความ</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors resize-none" placeholder="ระบุข้อความหรือสอบถามสินค้า..." />
              </div>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded transition-colors text-sm">
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
