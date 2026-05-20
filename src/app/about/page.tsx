import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-red-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">เกี่ยวกับเรา</span>
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
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium bg-red-50 text-red-600 border-l-2 border-red-600"
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
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h1 className="text-lg font-bold text-gray-800">เกี่ยวกับเรา</h1>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed space-y-4">
              <p className="font-semibold text-gray-800">ไอคอนโฮม — จุดหมายปลายทางของวัสดุก่อสร้างและเครื่องใช้ไฟฟ้า</p>

              <p>
                ไอคอนโฮม ก่อตั้งขึ้นด้วยแนวคิดที่ต้องการให้ผู้บริโภคในจังหวัดร้อยเอ็ดและพื้นที่ใกล้เคียง
                สามารถเข้าถึงสินค้าวัสดุก่อสร้างและเครื่องใช้ไฟฟ้าคุณภาพสูงในราคาที่เป็นธรรม
                โดยไม่ต้องเดินทางไกลเพื่อหาซื้อสินค้าเหล่านี้จากเมืองใหญ่
              </p>

              <p>
                เราจำหน่ายสินค้าหลากหลายประเภท ได้แก่ วัสดุก่อสร้าง เช่น อิฐบล็อก เหล็กเส้น ปูนซีเมนต์ กระเบื้องปูพื้น/ผนัง
                สุขภัณฑ์ ไม้ฝา รวมถึงเครื่องใช้ไฟฟ้าในบ้านยี่ห้อชั้นนำ เช่น LG, Samsung, Mitsubishi, Daikin, Hitachi
                และ Panasonic
              </p>

              <p>
                ด้วยประสบการณ์มากกว่า 10 ปีในธุรกิจค้าปลีกวัสดุก่อสร้าง ทีมงานของเราพร้อมให้คำแนะนำอย่างมืออาชีพ
                เพื่อช่วยให้ลูกค้าเลือกสินค้าที่เหมาะสมกับความต้องการและงบประมาณ
              </p>

              <p>
                เราเปิดให้บริการทุกวัน ตั้งแต่เวลา 08:00 - 18:00 น. มี 2 สาขาเพื่อให้บริการลูกค้า:
                สาขาเสลภูมิ ที่เลขที่ 46 หมู่ 5 ตำบลขวัญเมือง อำเภอเสลภูมิ จังหวัดร้อยเอ็ด โทร 080-329-3258
                และสาขาเลิงนกทา โทร 063-412-8250
              </p>

              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-sm mt-4">
                <p className="font-semibold text-red-700 mb-1">วิสัยทัศน์ของเรา</p>
                <p className="text-gray-700">
                  เป็นร้านวัสดุก่อสร้างและเครื่องใช้ไฟฟ้าชั้นนำของภาคอีสาน ที่ลูกค้าไว้วางใจ
                  ด้วยคุณภาพสินค้า ราคายุติธรรม และบริการที่เป็นเลิศ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
