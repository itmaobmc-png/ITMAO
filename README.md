# 🛍️ SmartStok - ប្រព័ន្ធគ្រប់គ្រងស្តុក និងលក់ទំនិញ (Inventory & POS System)

ប្រព័ន្ធគ្រប់គ្រងស្តុកទំនិញ និងគិតលុយលក់ (Point of Sale) ទំនើប ស្រស់ស្អាត រួចរាល់សម្រាប់ Upload ទៅកាន់ **Vercel** ដោយផ្ទាល់!

---

## 🌟 លក្ខណៈពិសេសចម្បង (Key Features)

1. **📊 ផ្ទាំងព័ត៌មានទូទៅ (Dashboard & KPIs)**:
   - បង្ហាញចំណូលសរុប (USD និងប្រាក់រៀល ៛)
   - តាមដានចំនួនប្រតិបត្តិការលក់ និងទុនស្តុកសរុប (Asset Value)
   - បញ្ជីរោទិ៍ទំនិញជិតអស់ពីស្តុក (Low Stock Alert) ជាមួយប៊ូតុង "បំពេញស្តុកភ្លាមៗ"
   - ចំណាត់ថ្នាក់ទំនិញលក់ដាច់បំផុត (Top Selling Products)

2. **🛒 ប្រព័ន្ធគិតលុយលក់ (POS / Cashier)**:
   - ស្វែងរកទំនិញរហ័សតាមរយៈឈ្មោះ (ខ្មែរ/អង់គ្លេស), SKU, ឬ Barcode
   - ច្រោះតាមប្រភេទមុខទំនិញ (ភេសជ្ជៈ, អាហារ, គ្រឿងអេឡិចត្រូនិច, សម្ភារៈប្រើប្រាស់...)
   - កន្ត្រកទំនិញឆ្លាតវៃ (គណនាប្រាក់សរុបរង, បញ្ចុះតម្លៃ Discount, ប្តូរអត្រាប្រាក់រៀលស្វ័យប្រវត្តិ)
   - គាំទ្រការទូទាត់ទាំង **លុយសុទ្ធ (Cash)** (គិតលុយអាប់ស្វ័យប្រវត្តិ) និង **ស្កេន KHQR (Bakong)**

3. **🧾 វិក្កយបត្រស្ដង់ដារ POS (Printable 80mm Receipt)**:
   - បោះពុម្ពវិក្កយបត្រទំហំ 80mm ស្អាតកម្រិតវិជ្ជាជីវៈ
   - មានបង្ហាញឈ្មោះហាង, លេខទូរស័ព្ទ, អាសយដ្ឋាន, បញ្ជីទំនិញ, និង QR Code

4. **📦 គ្រប់គ្រងស្តុកទំនិញ (Inventory Management)**:
   - បន្ថែម, កែសម្រួល, និងលុបទំនិញ (CRUD)
   - មុខងារនាំចូលស្តុកបន្ថែម (Stock In / Restock)
   - មើល និងបោះពុម្ពស្លាកបាកូដ (Barcode Sticker)
   - គណនាប្រាក់ចំណេញ និងភាគរយចំណេញ (Margin %)

5. **📑 ប្រវត្តិការលក់ និងចលនាស្តុក (Sales & Movement History)**:
   - កត់ត្រារាល់ប្រតិបត្តិការលក់ និងការនាំចូលស្តុក
   - អាចបើកមើល ឬបោះពុម្ពវិក្កយបត្រឡើងវិញបានគ្រប់ពេល

6. **⚙️ ការកំណត់ & បម្រុងទុកទិន្នន័យ (Settings & Backup)**:
   - កែប្រែព័ត៌មានហាង និងអត្រាប្តូរប្រាក់ (Exchange Rate 1$ = 4,100៛)
   - ទាញយកទិន្នន័យទាំងអស់ជាឯកសារ JSON (Export Backup)
   - បញ្ចូលទិន្នន័យចាស់មកវិញ (Import Restore)

7. **🎨 រចនាបថទំនើប (Design & UX)**:
   - គាំទ្រទាំង Dark Mode និង Light Mode
   - គាំទ្រ 2 ភាសា (ភាសាខ្មែរ 🇰🇭 & English 🇺🇸)
   - សំឡេង Beep ពេលស្កេនទំនិញ និងចលនា Confetti ពេលគិតលុយជោគជ័យ

---

## 🚀 របៀប Upload ទៅកាន់ Vercel (Deployment Guide)

គម្រោងនេះមានឯកសារ `vercel.json` រួចជាស្រេចសម្រាប់ការ Deploy ទៅ Vercel ដោយមិនមានបញ្ហា Route 404។

### វិធីទី ១៖ តាមរយៈ GitHub (ណែនាំបំផុត)

1. បង្កើត Repository ថ្មីនៅលើ [GitHub](https://github.com/new) (ឧទាហរណ៍៖ `smart-stok`)
2. បើក Terminal ក្នុងថត `Smart Stok` ហើយរត់ពាក្យបញ្ជាខាងក្រោម៖
   ```bash
   git init
   git add .
   git commit -m "Initial SmartStok release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/smart-stok.git
   git push -u origin main
   ```
3. ចូលទៅកាន់គេហទំព័រ [vercel.com](https://vercel.com/) រួចចុច **"Add New Project"**
4. ជ្រើសរើស Repository `smart-stok` របស់អ្នក រួចចុច **"Deploy"**
5. រង់ចាំប្រហែល 30 វិនាទី គេហទំព័ររបស់អ្នកនឹងដំណើរការជាផ្លូវការ!

### វិធីទី ២៖ តាមរយៈ Vercel CLI (រហ័សទាន់ចិត្ត)

1. តម្លើង Vercel CLI (ប្រសិនបើមិនទាន់មាន)៖
   ```bash
   npm install -g vercel
   ```
2. រត់ពាក្យបញ្ជា៖
   ```bash
   vercel --prod
   ```
3. ឆ្លើយតបសំណួរមួយចំនួន (ចុច Enter ទទួលយក default) នោះ Vercel នឹង Deploy ដោយស្វ័យប្រវត្តិ។

---

## 💻 របៀបបើកដំណើរការលើកុំព្យូទ័រផ្ទាល់ខ្លួន (Local Run)

```bash
# 1. តម្លើង dependencies (ប្រសិនបើទើប Clone ថ្មី)
npm install

# 2. បើកដំណើរការ Development Server
npm run dev

# 3. បង្កើត Production Build សម្រាប់តេស្ត
npm run build
```

ដំណើរការនៅលើ Localhost: `http://localhost:5173/`
