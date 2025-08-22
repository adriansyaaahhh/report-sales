
// ==============================
// liverport.vue (FIXED & hardened)
// ==============================
<template>
  <div class="report-container">
    <h2>Live Report Penyerahan Unit</h2>

    <!-- Notification System -->
    <div v-if="notifications.length > 0" class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <svg v-if="notification.type === 'error'" class="notification-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <svg v-else-if="notification.type === 'warning'" class="notification-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <svg v-else-if="notification.type === 'success'" class="notification-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <div class="notification-text">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="filter-container">
      <label>Filter Bulan:</label>
      <select v-model="filterBulan" @change="applyFilter">
        <option value="">Semua</option>
        <option v-for="bulan in availableBulanList" :key="bulan" :value="bulan">{{ bulan }}</option>
      </select>
      <small style="margin-left: 10px; color: #666;">
        ({{ filteredData.length }} dari {{ allData.length }} data)
      </small>
      
      <!-- Download Excel Button -->
      <div class="toolbar">
        <div class="left-buttons">
          <button
            class="download-btn"
            :disabled="isDownloading"
            @click="downloadExcel"
            :title="getDownloadTooltip()"
          >
            <template v-if="isDownloading">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"/>
              </svg>
              Mengunduh...
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download Excel
            </template>
          </button>

          <!-- Validation Check Button -->
        </div>
      </div>

      <!-- Expert Refresh Button -->
      <div class="right-buttons">
        <button @click="refreshData" class="refresh-btn" :disabled="isRefreshing" title="Refresh Data">
          <svg v-if="!isRefreshing" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="report-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Jenis Penyerahan</th>
            <th>Sales</th>
            <th>Tanggal Penyerahan</th>
            <th>Bulan BP</th>
            <th>Nama Customer</th>
            <th>Nomor HP</th>
            <th>Sisa Pembayaran</th>
            <th>PO/Kontrak</th>
            <th>Penerima Unit</th>
            <th>Alasan (Jika Bukan Pemilik)</th>
            <th>Foto DEC</th>
            <th>Link</th>
            <th>Doc Pendukung</th>
            <th>Link Doc</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredData" :key="row.id" :class="getRowClass(row)">
            <td>
              <span :class="['status-badge', getValidationStatus(row).class]">
                {{ getValidationStatus(row).text }}
              </span>
            </td>
            <td>
              <span :class="['jenis-badge', row.jenis_penyerahan === 'PENYERAHAN DI SHOWROOM' ? 'showroom' : 'outside']">
                {{ row.jenis_penyerahan === 'PENYERAHAN DI SHOWROOM' ? 'SHOWROOM' : 'LUAR SHOWROOM' }}
              </span>
            </td>
            <td>{{ row.sales || "-" }}</td>
            <td>{{ formatDate(row.tanggal_penyerahan) || "-" }}</td>
            <td>{{ row.bulan_bp || "-" }}</td>
            <td>{{ row.nama_customer || "-" }}</td>
            <td>{{ formatPhoneNumber(row.nomor_hp) }}</td>
            <td>{{ formatCurrency(row.sisa_pembayaran) }}</td>
            <td>
              <span v-if="row.po_kontrak" :class="['po-badge', String(row.po_kontrak).toLowerCase()]">
                {{ row.po_kontrak }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ row.penerima_unit || "-" }}</td>
            <td>{{ row.alasan_bukan_pemilik || "-" }}</td>
            <td>{{ getFotoStatus(row.foto_dec_url) }}</td>
            <td>
              <div v-if="parseUrls(row.foto_dec_url).length > 0" class="links-container">
                <a 
                  v-for="(url, index) in parseUrls(row.foto_dec_url)" 
                  :key="'foto-' + index"
                  :href="url" 
                  target="_blank" 
                  class="download-link"
                >
                  📥 Foto {{ index + 1 }}
                </a>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ getDocStatus(row.doc_perwakilan_url) }}</td>
            <td>
              <div v-if="parseUrls(row.doc_perwakilan_url).length > 0" class="links-container">
                <a 
                  v-for="(url, index) in parseUrls(row.doc_perwakilan_url)" 
                  :key="'doc-' + index"
                  :href="url" 
                  target="_blank" 
                  class="download-link"
                >
                  📄 Doc {{ index + 1 }}
                </a>
              </div>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Validation Summary -->
    <div class="validation-summary" v-if="validationSummary.total > 0">
      <h3>📊 Ringkasan Validasi Data</h3>
      <div class="summary-stats">
        <div class="stat-item complete">
          <span class="stat-number">{{ validationSummary.complete }}</span>
          <span class="stat-label">Lengkap</span>
        </div>
        <div class="stat-item incomplete">
          <span class="stat-number">{{ validationSummary.incomplete }}</span>
          <span class="stat-label">Belum Lengkap</span>
        </div>
        <div class="stat-item total">
          <span class="stat-number">{{ validationSummary.total }}</span>
          <span class="stat-label">Total Data</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { supabase } from "../supabase";

export default {
  name: "Report",
  data() {
    return {
      allData: [],
      filteredData: [],
      filterBulan: "",
      showDebug: false,
      subscription: null,
      isRefreshing: false,
      isDownloading: false,
      notifications: [],
      notificationId: 0,
      bulanList: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ]
    };
  },
  computed: {
    uniqueBulanBP() {
      const months = [...new Set(this.allData
        .map(row => row.bulan_bp)
        .filter(bulan => bulan && String(bulan).trim() !== "")
      )];
      return months.sort((a, b) => {
        const indexA = this.bulanList.indexOf(a);
        const indexB = this.bulanList.indexOf(b);
        return indexA - indexB;
      });
    },
    availableBulanList() {
      return this.bulanList;
    },
    validationSummary() {
      const total = this.filteredData.length;
      const complete = this.filteredData.filter(row => this.isDataComplete(row)).length;
      const incomplete = total - complete;
      return { total, complete, incomplete };
    }
  },
  async mounted() {
    await this.loadData();
    this.setupRealTimeSubscription();
  },
  beforeUnmount() {
    if (this.subscription) {
      try { this.subscription.unsubscribe(); } catch (e) { /* noop */ }
    }
  },
  methods: {
    async loadData() {
      try {
        const { data, error } = await supabase
          .from("penyerahan_unit_")
          .select("*")
          .order("tanggal_penyerahan", { ascending: false });

        if (error) {
          console.error("❌ Error loading data:", error);
          this.showNotification('error', 'Error Loading Data', 'Gagal memuat data dari database');
          return;
        }

        this.allData = Array.isArray(data) ? data : [];
        this.applyFilter();
      } catch (err) {
        console.error("❌ Unexpected error:", err);
        this.showNotification('error', 'Unexpected Error', 'Terjadi kesalahan yang tidak terduga');
      }
    },

    setupRealTimeSubscription() {
      this.subscription = supabase
        .channel('penyerahan_unit_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'penyerahan_unit_' }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              this.allData.unshift(payload.new);
              this.applyFilter();
              this.showNotification('success', 'Data Baru', 'Data penyerahan unit baru telah ditambahkan');
            } else if (payload.eventType === 'UPDATE') {
              const index = this.allData.findIndex(item => item.id === payload.new.id);
              if (index !== -1) {
                this.allData[index] = payload.new;
                this.applyFilter();
              }
            } else if (payload.eventType === 'DELETE') {
              this.allData = this.allData.filter(item => item.id !== payload.old.id);
              this.applyFilter();
            }
          }
        )
        .subscribe(() => {});
    },

    applyFilter() {
      if (!this.filterBulan) {
        this.filteredData = [...this.allData];
        return;
      }
      const target = String(this.filterBulan).trim();
      this.filteredData = this.allData.filter(row => {
        const val = row.bulan_bp ? String(row.bulan_bp).trim() : '';
        return val === target;
      });
    },

    // Formatting functions for new fields (robust to type variations)
    formatDate(dateString) {
      if (!dateString) return "-";
      try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return String(dateString);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch (e) {
        return String(dateString);
      }
    },

    formatPhoneNumber(phone) {
      if (phone === null || phone === undefined || phone === '') return "-";
      const str = String(phone);
      const cleaned = str.replace(/\D/g, '');
      if (cleaned.startsWith('62')) {
        const p1 = cleaned.slice(0, 2);
        const p2 = cleaned.slice(2, 5);
        const p3 = cleaned.slice(5, 9);
        const p4 = cleaned.slice(9);
        return `+${p1} ${p2}${p3 ? '-' + p3 : ''}${p4 ? '-' + p4 : ''}`;
      } else if (cleaned.startsWith('08')) {
        const p1 = cleaned.slice(0, 4);
        const p2 = cleaned.slice(4, 8);
        const p3 = cleaned.slice(8);
        return [p1, p2, p3].filter(Boolean).join('-');
      }
      return str;
    },

    formatCurrency(amount) {
      const n = Number(amount);
      if (!isFinite(n) || n === 0) return "-";
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(n);
    },

    // Enhanced Excel Download with new fields
    async downloadExcel() {
      if (this.filteredData.length === 0) {
        this.showNotification('warning', 'Tidak Ada Data', 'Tidak ada data untuk didownload');
        return;
      }

      this.isDownloading = true;
      try {
        const headers = [
          'No','Status','Jenis Penyerahan','Sales','Tanggal Penyerahan','Bulan BP','Nama Customer','Nomor HP','Sisa Pembayaran','PO Kontrak','Penerima Unit','Alasan (Jika Bukan Pemilik)','Status Foto DEC','Jumlah Foto','Status Doc Pendukung','Jumlah Dokumen','Link Foto DEC','Link Doc Pendukung'
        ];

        const rows = this.filteredData.map((row, index) => {
          const fotoUrls = this.parseUrls(row.foto_dec_url);
          const docUrls = this.parseUrls(row.doc_perwakilan_url);

          return [
            index + 1,
            this.getValidationStatus(row).text,
            row.jenis_penyerahan === 'PENYERAHAN DI SHOWROOM' ? 'SHOWROOM' : 'LUAR SHOWROOM',
            row.sales || '-',
            this.formatDate(row.tanggal_penyerahan),
            row.bulan_bp || '-',
            row.nama_customer || '-',
            String(row.nomor_hp || '-'),
            this.formatCurrency(row.sisa_pembayaran),
            row.po_kontrak || '-',
            row.penerima_unit || '-',
            row.alasan_bukan_pemilik || '-',
            this.getFotoStatus(row.foto_dec_url),
            fotoUrls.length,
            this.getDocStatus(row.doc_perwakilan_url),
            docUrls.length,
            fotoUrls.length > 0 ? `Buka Foto (${fotoUrls.length})` : '-',
            docUrls.length > 0 ? `Buka Dok (${docUrls.length})` : '-'
          ];
        });

        const wsMain = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        const linkFotoCol = headers.indexOf('Link Foto DEC');
        const linkDocCol = headers.indexOf('Link Doc Pendukung');

        this.filteredData.forEach((row, i) => {
          const r = i + 1;
          const fotoUrls = this.parseUrls(row.foto_dec_url);
          const docUrls = this.parseUrls(row.doc_perwakilan_url);

          if (fotoUrls.length > 0) {
            const ref = XLSX.utils.encode_cell({ r, c: linkFotoCol });
            if (fotoUrls.length === 1) {
              wsMain[ref] = { t: 's', v: `Buka Foto`, l: { Target: fotoUrls[0], Tooltip: 'Klik untuk membuka foto' } };
            } else {
              const linkText = fotoUrls.map((_, idx) => `Foto${idx + 1}`).join(' | ');
              const allUrls = fotoUrls.join('\n');
              wsMain[ref] = { t: 's', v: linkText, l: { Target: fotoUrls[0], Tooltip: `Link Foto:\n${allUrls}` } };
            }
          }

          if (docUrls.length > 0) {
            const ref = XLSX.utils.encode_cell({ r, c: linkDocCol });
            if (docUrls.length === 1) {
              wsMain[ref] = { t: 's', v: `Buka Doc`, l: { Target: docUrls[0], Tooltip: 'Klik untuk membuka dokumen' } };
            } else {
              const linkText = docUrls.map((_, idx) => `Doc${idx + 1}`).join(' | ');
              const allUrls = docUrls.join('\n');
              wsMain[ref] = { t: 's', v: linkText, l: { Target: docUrls[0], Tooltip: `Link Dokumen:\n${allUrls}` } };
            }
          }
        });

        wsMain['!cols'] = [
          { wch: 5 },{ wch: 15 },{ wch: 16 },{ wch: 20 },{ wch: 18 },{ wch: 12 },{ wch: 25 },{ wch: 16 },{ wch: 18 },{ wch: 12 },{ wch: 25 },{ wch: 30 },{ wch: 16 },{ wch: 12 },{ wch: 20 },{ wch: 15 },{ wch: 28 },{ wch: 28 }
        ];

        const linkHeader = ['No', 'Nama Customer', 'Jenis', 'Ke-', 'URL'];
        const linkRows = [];
        this.filteredData.forEach((row, i) => {
          const no = i + 1;
          const name = row.nama_customer || '-';
          const fotos = this.parseUrls(row.foto_dec_url);
          const docs = this.parseUrls(row.doc_perwakilan_url);

          fotos.forEach((u, idx) => linkRows.push([no, name, 'Foto', idx + 1, u]));
          docs.forEach((u, idx) => linkRows.push([no, name, 'Doc', idx + 1, u]));
        });

        const wsLinks = XLSX.utils.aoa_to_sheet([linkHeader, ...linkRows]);
        const urlCol = linkHeader.indexOf('URL');
        linkRows.forEach((_, i) => {
          const r = i + 1;
          const ref = XLSX.utils.encode_cell({ r, c: urlCol });
          const val = wsLinks[ref]?.v || linkRows[i][urlCol];
          if (val) wsLinks[ref] = { t: 's', v: 'Buka Link', l: { Target: val, Tooltip: 'Klik untuk membuka link' } };
        });
        wsLinks['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 8 }, { wch: 6 }, { wch: 50 }];

        const wb = XLSX.utils.book_new();
        const sheetName = this.filterBulan ? `Data ${this.filterBulan}` : 'Data Semua';
        XLSX.utils.book_append_sheet(wb, wsMain, sheetName);
        XLSX.utils.book_append_sheet(wb, wsLinks, 'Semua Link');

        const currentDate = new Date().toISOString().split('T')[0];
        const filterText = this.filterBulan ? `_${this.filterBulan}` : '_Semua';
        const filename = `Live_Report_Penyerahan_Unit${filterText}_${currentDate}.xlsx`;

        XLSX.writeFile(wb, filename);

        const downloadText = this.filterBulan ? 
          `Data bulan ${this.filterBulan} (${this.filteredData.length} data)` : 
          `Semua data (${this.filteredData.length} data)`;
        this.showNotification('success', 'Download Berhasil', `${downloadText} berhasil didownload sebagai ${filename}`);
      } catch (error) {
        console.error('Error downloading Excel:', error);
        this.showNotification('error', 'Download Gagal', 'Terjadi kesalahan saat mendownload file Excel');
      } finally {
        setTimeout(() => { this.isDownloading = false; }, 600);
      }
    },

    getDownloadTooltip() {
      if (this.filteredData.length === 0) return 'Tidak ada data untuk didownload';
      const filterText = this.filterBulan ? `bulan ${this.filterBulan}` : 'semua data';
      return `Download ${this.filteredData.length} data ${filterText} ke Excel`;
    },

    parseUrls(urlData) {
      if (!urlData) return [];
      try {
        if (typeof urlData === "string" && urlData.trim().startsWith("[") && urlData.trim().endsWith("]")) {
          return JSON.parse(urlData);
        }
        if (typeof urlData === "string") return [urlData];
        if (Array.isArray(urlData)) return urlData;
        return [];
      } catch (e) {
        console.warn("Error parsing URLs:", e);
        return [];
      }
    },

    getFotoStatus(fotoUrl) {
      const urls = this.parseUrls(fotoUrl);
      if (urls.length === 0) return "❌ Belum";
      if (urls.length === 1) return "✅ 1 Foto";
      return `✅ ${urls.length} Foto`;
    },

    getDocStatus(docUrl) {
      const urls = this.parseUrls(docUrl);
      if (urls.length === 0) return "❌ Belum";
      if (urls.length === 1) return "✅ 1 Doc";
      return `✅ ${urls.length} Doc`;
    },

    async refreshData() {
      this.isRefreshing = true;
      try {
        await this.loadData();
        this.showNotification('success', 'Data Diperbarui', 'Data berhasil dimuat ulang');
      } finally {
        setTimeout(() => { this.isRefreshing = false; }, 400);
      }
    },

    // Enhanced validation methods considering new fields
    isDataComplete(row) {
      const hasRequiredFields = row.sales && row.tanggal_penyerahan && row.bulan_bp && row.nama_customer;
      const hasFoto = this.parseUrls(row.foto_dec_url).length > 0;
      if (row.jenis_penyerahan === 'PENYERAHAN DI LUAR SHOWROOM') {
        const hasPenerima = row.penerima_unit;
        const hasDoc = row.penerima_unit === row.nama_customer || this.parseUrls(row.doc_perwakilan_url).length > 0;
        return hasRequiredFields && hasFoto && hasPenerima && hasDoc;
      }
      return hasRequiredFields && hasFoto;
    },

    getValidationStatus(row) {
      if (this.isDataComplete(row)) {
        return { text: '✅ Lengkap', class: 'status-complete' };
      } else {
        return { text: '⚠️ Tidak Lengkap', class: 'status-incomplete' };
      }
    },

    getValidationIssues(row) {
      const issues = [];
      if (!row.sales) issues.push('Sales belum dipilih');
      if (!row.tanggal_penyerahan) issues.push('Tanggal penyerahan belum diisi');
      if (!row.bulan_bp) issues.push('Bulan BP belum dipilih');
      if (!row.nama_customer) issues.push('Nama customer kosong');
      if (this.parseUrls(row.foto_dec_url).length === 0) issues.push('Foto DEC belum diupload');
      if (row.jenis_penyerahan === 'PENYERAHAN DI LUAR SHOWROOM') {
        if (!row.penerima_unit) issues.push('Penerima unit belum dipilih');
        if (row.penerima_unit !== row.nama_customer && this.parseUrls(row.doc_perwakilan_url).length === 0) {
          issues.push('Dokumen perwakilan diperlukan (penerima bukan pemilik)');
        }
      }
      return issues;
    },

    getRowClass(row) {
      return this.isDataComplete(row) ? 'row-complete' : 'row-incomplete';
    },

    getSubmitTooltip(row) {
      if (this.isDataComplete(row)) return 'Data lengkap, siap untuk disubmit';
      const issues = this.getValidationIssues(row);
      return `Tidak bisa submit: ${issues.join(', ')}`;
    },

    attemptSubmission(row) {
      if (!this.isDataComplete(row)) {
        const issues = this.getValidationIssues(row);
        this.showNotification('error', 'Data Tidak Lengkap', `Customer ${row.nama_customer || 'Unknown'}: ${issues.join(', ')}`);
        return;
      }
      this.showNotification('success', 'Berhasil Submit', `Data untuk ${row.nama_customer} berhasil disubmit`);
    },

    // Notification System
    showNotification(type, title, message) {
      const notification = { id: ++this.notificationId, type, title, message, timestamp: Date.now() };
      this.notifications.unshift(notification);
      const timeout = type === 'success' ? 5000 : 8000;
      setTimeout(() => { this.removeNotification(notification.id); }, timeout);
      if (this.notifications.length > 5) this.notifications = this.notifications.slice(0, 5);
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    }
  },
  watch: {
    filterBulan() {
      this.applyFilter();
    }
  }
};
</script>


<style scoped>
/* Base Styles */
.report-container {
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Notification System Styles */
.notifications-container { 
  position: fixed; 
  top: 20px; 
  right: 20px; 
  z-index: 1000; 
  max-width: 400px; 
}

.notification { 
  background: white; 
  border-radius: 8px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
  margin-bottom: 12px; 
  padding: 16px; 
  display: flex; 
  align-items: flex-start; 
  justify-content: space-between; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  border-left: 4px solid; 
  animation: slideInRight 0.3s ease; 
}

.notification:hover { 
  transform: translateX(-5px); 
  box-shadow: 0 6px 20px rgba(0,0,0,0.2); 
}

.notification-error { border-left-color: #ef4444; }
.notification-warning { border-left-color: #f59e0b; }
.notification-success { border-left-color: #10b981; }

.notification-content { 
  display: flex; 
  align-items: flex-start; 
  flex-grow: 1; 
}

.notification-icon { 
  width: 20px; 
  height: 20px; 
  margin-right: 12px; 
  flex-shrink: 0; 
}

.notification-error .notification-icon { color: #ef4444; }
.notification-warning .notification-icon { color: #f59e0b; }
.notification-success .notification-icon { color: #10b981; }

.notification-text { flex-grow: 1; }

.notification-title { 
  font-weight: 600; 
  font-size: 14px; 
  margin-bottom: 4px; 
}

.notification-message { 
  font-size: 13px; 
  color: #6b7280; 
  line-height: 1.4; 
}

.notification-close { 
  background: none; 
  border: none; 
  padding: 4px; 
  cursor: pointer; 
  color: #9ca3af; 
  transition: color 0.2s; 
}

.notification-close:hover { color: #4b5563; }
.notification-close svg { width: 16px; height: 16px; }

@keyframes slideInRight { 
  from { transform: translateX(100%); opacity: 0; } 
  to { transform: translateX(0); opacity: 1; } 
}

/* Filter Container */
.filter-container { 
  margin-bottom: 1rem; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  flex-wrap: wrap; 
}

.filter-container label { font-weight: bold; }

.filter-container select { 
  padding: 0.5rem; 
  border: 1px solid #ccc; 
  border-radius: 5px; 
  min-width: 200px; 
  font-size: 14px; 
}

.filter-container select:focus { 
  outline: none; 
  border-color: #007bff; 
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); 
}

/* Toolbar and Buttons */
.toolbar { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  flex-wrap: nowrap; 
  gap: 8px; 
}

.left-buttons { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  flex-wrap: wrap; 
  padding: 2px !important; 
  font-size: 12px !important; 
}

.right-buttons { 
  margin-left: auto; 
  margin-top: -4px; 
  flex-shrink: 0; 
  display: flex; 
  align-items: flex-start; 
}

.download-btn { 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  padding: 0.6rem 1rem; 
  background: linear-gradient(135deg, #22c55e, #16a34a); 
  color: white; 
  font-weight: 600; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 14px; 
  transition: all 0.3s ease; 
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3); 
}

.download-btn svg { width: 18px; height: 18px; }

.download-btn:hover:not(:disabled) { 
  background: linear-gradient(135deg, #16a34a, #15803d); 
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.4); 
  transform: translateY(-2px); 
}

.download-btn:active:not(:disabled) { 
  transform: translateY(0); 
  box-shadow: 0 3px 8px rgba(22, 163, 74, 0.3); 
}

.download-btn:disabled { 
  background: #9ca3af; 
  cursor: not-allowed; 
  box-shadow: none; 
}

.validate-btn { 
  display: inline-flex; 
  align-items: center; 
  gap: 8px; 
  padding: 0.5rem 1rem; 
  background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
  color: white; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 14px; 
  transition: all 0.3s ease; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
}

.validate-btn:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); 
}

.refresh-btn { 
  display: inline-flex; 
  align-self: center; 
  margin-top: 0px; 
  align-items: center; 
  justify-content: center; 
  width: 40px; 
  height: 40px; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: white; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  margin-left: 10px; 
  transition: all 0.3s ease; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  position: relative; 
  top: 2px !important; 
  overflow: hidden; 
}

.refresh-btn::before { 
  content: ''; 
  position: absolute; 
  top: 0; 
  left: -100%; 
  width: 100%; 
  height: 100%; 
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); 
  transition: left 0.6s ease; 
}

.refresh-btn:hover::before { left: 100%; }

.refresh-btn:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); 
}

.refresh-btn:active { 
  transform: translateY(0); 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
}

.refresh-btn:disabled { 
  cursor: not-allowed; 
  opacity: 0.7; 
  transform: none; 
}

.spinner { 
  animation: rotate 1s linear infinite; 
  height: 18px; 
  width: 18px; 
}

.path { 
  stroke: white; 
  stroke-linecap: round; 
  animation: dash 1.5s ease-in-out infinite; 
}

.spinning { animation: spin 1s linear infinite; }

@keyframes rotate { 100% { transform: rotate(360deg); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes dash { 
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } 
}

/* Table Styles */
.table-container { 
  overflow-x: auto; 
  -webkit-overflow-scrolling: touch; 
}

.report-table { 
  width: 100%; 
  border-collapse: collapse; 
  min-width: 1600px; /* Increased for new columns */
}

.report-table th, .report-table td { 
  border: 1px solid #ddd; 
  padding: 0.5rem; 
  text-align: left; 
  white-space: nowrap; 
  font-size: 0.9rem;
}

.report-table th { 
  background-color: #c8102e; 
  color: white; 
  font-weight: bold; 
  font-size: 0.85rem;
}

.report-table tbody tr:nth-child(even) { 
  background-color: #f8f9fa; 
}

.report-table tbody tr:hover { 
  background-color: #e9ecef; 
}

.row-complete { background-color: #f0f9f0 !important; }
.row-incomplete { background-color: #fff5f5 !important; }

/* Status and Info Badges */
.status-badge { 
  padding: 4px 8px; 
  border-radius: 4px; 
  font-size: 12px; 
  font-weight: 600; 
}

.status-complete { 
  background-color: #dcfce7; 
  color: #166534; 
}

.status-incomplete { 
  background-color: #fee2e2; 
  color: #991b1b; 
}

.jenis-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.jenis-badge.showroom {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 1px solid #b8dabc;
}

.jenis-badge.outside {
  background: linear-gradient(135deg, #cce7ff 0%, #b3d9ff 100%);
  color: #004085;
  border: 1px solid #9ec5fe;
}

.po-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.po-badge.yes {
  background-color: #dcfce7;
  color: #166534;
}

.po-badge.no {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Links */
.links-container { 
  display: flex; 
  flex-direction: column; 
  gap: 0.25rem; 
}

.download-link { 
  cursor: pointer; 
  color: #007bff; 
  text-decoration: none; 
  font-size: 0.8rem; 
  padding: 0.125rem 0.25rem; 
  border-radius: 3px; 
  background: #f8f9fa; 
  border: 1px solid #dee2e6; 
  display: inline-block; 
  text-align: center; 
  white-space: nowrap; 
  transition: all 0.2s ease; 
}

.download-link:hover { 
  text-decoration: underline; 
  background: #e9ecef; 
  transform: translateY(-1px); 
}

/* Validation Summary */
.validation-summary { 
  margin-top: 2rem; 
  padding: 1rem; 
  background: #f8f9fa; 
  border-radius: 8px; 
  border-left: 4px solid #007bff; 
}

.validation-summary h3 { 
  margin: 0 0 1rem 0; 
  color: #495057; 
  font-size: 1.1rem; 
}

.summary-stats { 
  display: flex; 
  gap: 2rem; 
  flex-wrap: wrap; 
}

.stat-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  padding: 1rem; 
  background: white; 
  border-radius: 8px; 
  min-width: 100px; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  transition: transform 0.2s ease; 
}

.stat-item:hover { transform: translateY(-2px); }

.stat-number { 
  font-size: 2rem; 
  font-weight: bold; 
  line-height: 1; 
  margin-bottom: 0.5rem; 
}

.stat-label { 
  font-size: 0.875rem; 
  color: #6c757d; 
  font-weight: 500; 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
}

.stat-item.complete .stat-number { color: #10b981; }
.stat-item.incomplete .stat-number { color: #ef4444; }
.stat-item.total .stat-number { color: #007bff; }

/* Responsive Design */
@media (max-width: 768px) {
  .report-table { 
    font-size: 0.8rem; 
    min-width: 1500px; 
  }
  
  .report-table th, .report-table td { 
    padding: 0.4rem; 
    font-size: 0.75rem;
  }
  
  .report-container { padding: 0.5rem; }
  
  .filter-container { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 5px; 
  }
  
  .filter-container select { min-width: 150px; }
  
  .download-link { 
    font-size: 0.7rem; 
    padding: 0.1rem; 
  }
  
  .refresh-btn svg { width: 16px; height: 16px; }
  
  .validate-btn { 
    font-size: 12px; 
    padding: 0.4rem 0.8rem; 
    margin-top: 5px; 
  }
  
  .notifications-container { 
    top: 10px; 
    right: 10px; 
    left: 10px; 
    max-width: none; 
  }
  
  .notification { padding: 12px; }
  .notification-title { font-size: 13px; }
  .notification-message { font-size: 12px; }
  
  .summary-stats { 
    gap: 1rem; 
    justify-content: center; 
  }
  
  .stat-item { 
    min-width: 80px; 
    padding: 0.75rem; 
  }
  
  .stat-number { font-size: 1.5rem; }
  .stat-label { font-size: 0.75rem; }
  
  .refresh-btn { top: -2px; margin-top: -45px; }
  
  .jenis-badge { 
    font-size: 0.7rem; 
    padding: 0.2rem 0.4rem; 
  }
  
  .po-badge { 
    font-size: 10px; 
    padding: 1px 4px; 
  }
}

@media (max-width: 480px) {
  .filter-container { gap: 8px; }
  .refresh-btn { top: 0; }
  
  .validate-btn span:not(.icon) { display: none; }
  .validate-btn { 
    min-width: 40px; 
    padding: 0.5rem; 
  }
  
  .report-table { min-width: 1400px; }
  .report-table th, .report-table td { 
    padding: 0.3rem; 
    font-size: 0.7rem;
  }
}
</style>