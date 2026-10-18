// Initial Data for SmartStok - Khmer Product Inventory & POS System

export const INITIAL_CATEGORIES = [
  { id: 'all', nameKh: 'ទាំងអស់', nameEn: 'All Items', icon: 'LayoutGrid' },
  { id: 'beverages', nameKh: 'ភេសជ្ជៈ', nameEn: 'Beverages', icon: 'Coffee', color: '#06b6d4' },
  { id: 'food', nameKh: 'គ្រឿងទេស & អាហារ', nameEn: 'Food & Grocery', icon: 'Utensils', color: '#f59e0b' },
  { id: 'electronics', nameKh: 'គ្រឿងអេឡិចត្រូនិច', nameEn: 'Electronics', icon: 'Smartphone', color: '#8b5cf6' },
  { id: 'essentials', nameKh: 'សម្ភារៈប្រើប្រាស់', nameEn: 'Daily Essentials', icon: 'Sparkles', color: '#ec4899' },
  { id: 'snacks', nameKh: 'នំ & អាហារសម្រន់', nameEn: 'Snacks & Bakery', icon: 'Cookie', color: '#10b981' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-1001',
    barcode: '88501234001',
    nameKh: 'ភេសជ្ជៈប៉ូវកម្លាំង Sting (កំប៉ុង)',
    nameEn: 'Sting Energy Drink Can',
    category: 'beverages',
    costPrice: 1800,
    sellingPrice: 2500,
    stockQty: 48,
    minStock: 15,
    unit: 'កំប៉ុង',
    supplier: 'ភ្នំពេញ ឌីទ្រីប៊្យូសិន',
    emoji: '⚡',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1002',
    barcode: '88501234002',
    nameKh: 'ស្រាបៀរ កម្ពុជា Cambodia Beer',
    nameEn: 'Cambodia Beer Can 330ml',
    category: 'beverages',
    costPrice: 2200,
    sellingPrice: 3000,
    stockQty: 8, // Low stock on purpose
    minStock: 24,
    unit: 'កំប៉ុង',
    supplier: 'Khmer Beverages Co.',
    emoji: '🍺',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1003',
    barcode: '88501234003',
    nameKh: 'ទឹកបរិសុទ្ធ វីតាល់ Vital 500ml',
    nameEn: 'Vital Premium Water 500ml',
    category: 'beverages',
    costPrice: 800,
    sellingPrice: 1500,
    stockQty: 85,
    minStock: 20,
    unit: 'ដប',
    supplier: 'វីតាល់ ត្រេឌីង',
    emoji: '💧',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1004',
    barcode: '88501234004',
    nameKh: 'កាហ្វេកំប៉ុង Nescafe Espresso',
    nameEn: 'Nescafe Espresso Roast Can',
    category: 'beverages',
    costPrice: 2500,
    sellingPrice: 3500,
    stockQty: 32,
    minStock: 12,
    unit: 'កំប៉ុង',
    supplier: 'Nestle Cambodia',
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1005',
    barcode: '88501234005',
    nameKh: 'មីម៉ាម៉ា Mama រសជាតិតុងយាំកុ้ง',
    nameEn: 'Mama Instant Noodles Tom Yum',
    category: 'food',
    costPrice: 1000,
    sellingPrice: 1500,
    stockQty: 120,
    minStock: 30,
    unit: 'កញ្ចប់',
    supplier: 'ថៃ សេង ត្រេឌីង',
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1006',
    barcode: '88501234006',
    nameKh: 'អង្ករផ្កាម្លិះ Malis Jasmine 5kg',
    nameEn: 'Malis Premium Jasmine Rice 5kg',
    category: 'food',
    costPrice: 20000,
    sellingPrice: 25000,
    stockQty: 15,
    minStock: 5,
    unit: 'បាវ',
    supplier: 'រោងម៉ាស៊ីនកិនស្រូវ បាត់ដំបង',
    emoji: '🌾',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1007',
    barcode: '88501234007',
    nameKh: 'ទឹកត្រីងាវ មាស Golden Cock',
    nameEn: 'Premium Fish Sauce 650ml',
    category: 'food',
    costPrice: 4500,
    sellingPrice: 6500,
    stockQty: 24,
    minStock: 10,
    unit: 'ដប',
    supplier: 'កំពត ត្រេឌីង',
    emoji: '🍾',
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1008',
    barcode: '88501234008',
    nameKh: 'ខ្សែសាកទូរស័ព្ទ Fast Charge Type-C',
    nameEn: 'Baseus 65W Fast Charge Cable',
    category: 'electronics',
    costPrice: 8000,
    sellingPrice: 14000,
    stockQty: 18,
    minStock: 6,
    unit: 'ខ្សែ',
    supplier: 'Smart Tech Electronic',
    emoji: '🔌',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1009',
    barcode: '88501234009',
    nameKh: 'កាសប៊្លូធូស Wireless Earbuds TWS',
    nameEn: 'TWS Bluetooth Earbuds 5.3',
    category: 'electronics',
    costPrice: 22000,
    sellingPrice: 40000,
    stockQty: 4, // Low stock on purpose
    minStock: 8,
    unit: 'ប្រអប់',
    supplier: 'Smart Tech Electronic',
    emoji: '🎧',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1010',
    barcode: '88501234010',
    nameKh: 'Power Bank 10,000mAh PD Fast',
    nameEn: 'Remax Power Bank 10,000mAh',
    category: 'electronics',
    costPrice: 28000,
    sellingPrice: 45000,
    stockQty: 0, // Out of stock on purpose
    minStock: 5,
    unit: 'គ្រឿង',
    supplier: 'Smart Tech Electronic',
    emoji: '🔋',
    image: 'https://images.unsplash.com/photo-1609592807664-8845ef281b37?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1011',
    barcode: '88501234011',
    nameKh: 'ថ្នាំដុសធ្មេញ Colgate Total 150g',
    nameEn: 'Colgate Total 12 Clean Mint',
    category: 'essentials',
    costPrice: 5000,
    sellingPrice: 7500,
    stockQty: 35,
    minStock: 10,
    unit: 'ប្រអប់',
    supplier: 'ឌីខេអេសអេច (DKSH)',
    emoji: '🪥',
    image: 'https://images.unsplash.com/photo-1559591937-e160a0a996f0?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PRD-1012',
    barcode: '88501234012',
    nameKh: 'នំដំឡូងបារាំង Lay\'s Classic 50g',
    nameEn: 'Lay\'s Potato Chips Classic 50g',
    category: 'snacks',
    costPrice: 2500,
    sellingPrice: 4000,
    stockQty: 42,
    minStock: 15,
    unit: 'កញ្ចប់',
    supplier: 'ភ្នំពេញ ឌីទ្រីប៊្យូសិន',
    emoji: '🥔',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SALES = [
  {
    id: 'INV-20261017-001',
    date: new Date(Date.now() - 3600000 * 3).toISOString(),
    items: [
      { id: 'PRD-1001', nameKh: 'ភេសជ្ជៈប៉ូវកម្លាំង Sting (កំប៉ុង)', nameEn: 'Sting Energy Drink', price: 2500, qty: 3, total: 7500 },
      { id: 'PRD-1005', nameKh: 'មីម៉ាម៉ា Mama រសជាតិតុងយាំកុ้ง', nameEn: 'Mama Instant Noodles', price: 1500, qty: 5, total: 7500 }
    ],
    subtotal: 15000,
    discount: 0,
    tax: 0,
    total: 15000,
    totalRiel: 15000,
    paymentMethod: 'KHQR',
    cashier: 'សុខា (Sokha)',
    customer: 'អតិថិជនទូទៅ (Walk-in)',
    status: 'COMPLETED'
  },
  {
    id: 'INV-20261017-002',
    date: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    items: [
      { id: 'PRD-1008', nameKh: 'ខ្សែសាកទូរស័ព្ទ Fast Charge Type-C', nameEn: 'Baseus 65W Cable', price: 14000, qty: 1, total: 14000 },
      { id: 'PRD-1004', nameKh: 'កាហ្វេកំប៉ុង Nescafe Espresso', nameEn: 'Nescafe Espresso Can', price: 3500, qty: 2, total: 7000 }
    ],
    subtotal: 21000,
    discount: 1000,
    tax: 0,
    total: 20000,
    totalRiel: 20000,
    paymentMethod: 'CASH',
    cashReceived: 50000,
    cashChange: 30000,
    cashChangeRiel: 30000,
    cashier: 'សុខា (Sokha)',
    customer: 'ចាន់ដា (Chanda)',
    status: 'COMPLETED'
  }
];

export const INITIAL_SETTINGS = {
  storeNameKh: 'ហាង សិរីពិដោរ',
  storeNameEn: 'Serey Pidor Mart',
  phone: '012 345 678 / 098 765 432',
  address: 'ផ្ទះលេខ 128E, ផ្លូវ 271, សង្កាត់បឹងទំពុន, រាជធានីភ្នំពេញ',
  currency: 'KHR',
  currencySymbol: '៛',
  taxPercent: 0,
  khqrMerchantName: 'PIDOR SHOP',
  khqrBakongId: 'pidorshop@acleda',
  receiptFooterKh: 'សូមអរគុណសម្រាប់ការគាំទ្រ! សូមអញ្ជើញមកម្តងទៀត!',
  receiptFooterEn: 'Thank you for shopping with us! Please come again!'
};


