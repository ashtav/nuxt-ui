# Nuxt UI Layer

Custom, universal Nuxt 3 / Nuxt 4 UI Layer yang menyediakan kumpulan komponen **Form**, **UI**, **Icons (Hugeicons)**, **Theme Tokens**, dan **Composables** siap pakai untuk berbagai project.

---

## 🚀 Cara Penggunaan

Layer ini dapat dikonsumsi oleh project Nuxt mana pun dengan 2 cara mudah:

### Opsi 1: Local Development (Path Relatif)

Jika project berada di satu komputer atau struktur folder sejajar:

```ts
// nuxt.config.ts di project Anda
export default defineNuxtConfig({
  extends: [
    '../nuxt-ui' // atau path absolut: 'D:/Development/Labs/nuxt-ui'
  ]
})
```

---

### Opsi 2: Private Git Repository (Rekomendasi untuk Multi-Project)

1. Push folder `nuxt-ui` ini ke repository Git privat Anda (misal `github.com/username/nuxt-ui`).
2. Buat tag versi:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Di project yang ingin menggunakan, pasang via `package.json`:
   ```json
   "dependencies": {
     "nuxt-ui": "git+https://github.com/username/nuxt-ui.git#v1.0.0"
   }
   ```
   Lalu jalankan `npm install` atau `yarn install`.
4. Tambahkan di `nuxt.config.ts`:
   ```ts
   export default defineNuxtConfig({
     extends: ['nuxt-ui']
   })
   ```

---

## 📦 Komponen yang Tersedia

Semua komponen langsung aktif via **Nuxt Auto-Import** tanpa perlu import manual!

### 1. Form Components (`Form*`)
- `<FormInput>` - Input teks dengan prefix/suffix slots, loading spinner, dynamic padding, character counter, error states, dll.
- `<FormSearch>` - Input pencarian dengan tombol clear otomatis dan dynamic event handler.
- `<FormSelect>` - Dropdown select yang rapi dengan custom styling dan support options slot.
- `<FormTextarea>` & `<FormRichTextarea>` - Textarea standar dan rich text editor.
- `<FormPhoneInput>` - Input nomor telepon internasional dengan flag selector (`libphonenumber-js`).
- `<FormDatePicker>` & `<FormDateRange>` - Pemilih tanggal dan rentang tanggal kalender.
- `<FormDayScrollPicker>` - Pemilih hari/tanggal dengan horizontal scroll.
- `<FormCheckbox>`, `<FormCheckboxPill>`, `<FormCheckboxSingle>`
- `<FormRadio>`, `<FormRadioPill>`
- `<FormSwitch>`, `<FormSlider>`, `<FormNumber>`, `<FormPassword>`, `<FormFile>`, `<FormAudio>`
- `<FormChipInput>`, `<FormChips>`, `<FormCombobox>`, `<FormExportOptions>`

### 2. Interface Components (`Ui*`)
- `<UiModal>` - Modal dialog & slide-over drawer dengan arsitektur Cupertino depth layer (`#stack`), backdrop blur, transisi independen, dan header actions.
- `<UiButton>` - Tombol serbaguna dengan built-in loading spinner, tooltip wrapper, prefix/suffix icons, dan multi-variant (`primary`, `secondary`, `danger`, `ghost`).
- `<UiTooltip>` - Tooltip berbasis Floating UI dengan auto-flip & positioning cerdas.
- `<UiDropdownMenu>` - Menu dropdown responsif dengan keyboard navigation (`useKeys`).
- `<UiConfirmDialog>` & `<UiLoadingOverlay>` - Modal konfirmasi dan loading global yang dikendalikan via composable `ui.confirm(...)` dan `ui.loading(...)`.
- `<UiActiveFilters>` & `<UiSearchFilterPanel>` - Filter badge aktif dan panel filter dashboard.
- `<UiPageContainer>` & `<UiPageHeader>` - Kontainer halaman dan header dashboard standar.
- `<UiAvatar>`, `<UiToaster>`, `<UiStackView>`, `<UiResponsiveTabs>`, `<UiTopLoadingBar>`
- `<UiChartAreaChart>` & `<UiChartBarChart>` - Grafik area dan bar chart responsif (Unovis).

### 3. Core & Utility Components
- `<Icon>` - Komponen ikon berbasis Hugeicons (`hgi hgi-stroke`) dengan kamus alias cerdas.
- `<Label>` - Komponen label standar berpasangan teks + ikon.

---

## 🎨 Theme Tokens & Tailwind CSS

Layer ini otomatis mendaftarkan token tema CSS Variables untuk mode Terang (*Light*) dan Gelap (*Dark*):

| Tailwind Class | Variabel CSS | Deskripsi |
| :--- | :--- | :--- |
| `bg-theme-app` | `--bg-app` | Latar belakang halaman aplikasi |
| `bg-theme-card` | `--bg-card` | Latar belakang Card, Sidebar, Modal |
| `bg-theme-hover` | `--bg-hover` | Efek hover item atau baris tabel |
| `bg-theme-input` | `--bg-input` | Latar belakang input form |
| `border-theme-border` | `--border-default` | Garis batas standar container & divider |
| `border-theme-input` | `--border-input` | Garis batas input form |
| `bg-theme-range-bg` | `--date-range-bg` | Latar penyorot kalender date range |

Anda juga dapat mengimpor preset Tailwind secara manual jika diperlukan:
```js
// tailwind.config.js
import uiPreset from 'nuxt-ui/tailwind.preset.js'

export default {
  presets: [uiPreset],
  // ...
}
```

---

## 🛠️ Composables & Utilities Bawaan

Layer ini juga otomatis menyediakan fungsi-fungsi helper yang sering digunakan:

- **`ui` / `useUi()`**:
  ```ts
  const confirmed = await ui.confirm({
    title: 'Hapus Data?',
    message: 'Data yang dihapus tidak dapat dipulihkan.'
  })
  if (confirmed) {
    ui.loading('Menyimpan perubahan...')
    // lakukan proses
    ui.closeLoading()
  }
  ```
- **`useKeys()`**: Keyboard shortcut listener dengan modifier `ctrl`, `alt`, `shift`.
- **`useTheme()`**: Manajemen tema dark/light mode dengan auto-detect sistem dan localStorage.
- **Formatters**: `formatIDR()`, `thousandFormat()`, `formatDate()`, `ucfirst()`, `ucwords()`, `debounce()`, `getInitials()`, `getAvatarColor()`.
