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
        <button @click="validateAllData" class="validate-btn" title="Validasi Semua Data">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          Validasi Data
        </button>
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
              <th>Sales</th>
              <th>Tanggal Penyerahan</th>
              <th>Bulan BP</th>
              <th>Nama Customer</th>
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
              <td>{{ row.sales || "-" }}</td>
              <td>{{ row.tanggal_penyerahan || "-" }}</td>
              <td>{{ row.bulan_bp || "-" }}</td>
              <td>{{ row.nama_customer || "-" }}</td>
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
          .filter(bulan => bulan && bulan.trim() !== "")
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
        this.subscription.unsubscribe();
      }
    },
    methods: {
      async loadData() {
        try {
          const { data, error } = await supabase
            .from("penyerahan_unit")
            .select("*")
            .order("tanggal_penyerahan", { ascending: false });

          if (error) {
            console.error("❌ Error loading data:", error);
            this.showNotification('error', 'Error Loading Data', 'Gagal memuat data dari database');
            return;
          }

          this.allData = data || [];
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
            { 
              event: '*',
              schema: 'public', 
              table: 'penyerahan_unit' 
            }, 
            (payload) => {
              console.log('📡 Real-time update received:', payload);
              
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
          .subscribe((status) => {
            console.log('📡 Subscription status:', status);
          });
      },

      applyFilter() {
        if (!this.filterBulan) {
          this.filteredData = [...this.allData];
          return;
        }

        this.filteredData = this.allData.filter(row => {
          return row.bulan_bp && row.bulan_bp.trim() === this.filterBulan;
        });
      },

      // Excel Download Function
      async downloadExcel() {
        if (this.filteredData.length === 0) {
          this.showNotification('warning', 'Tidak Ada Data', 'Tidak ada data untuk didownload');
          return;
        }

        this.isDownloading = true;
        try {
          // Prepare data for Excel
          const excelData = this.filteredData.map((row, index) => ({
            'No': index + 1,
            'Status': this.getValidationStatus(row).text,
            'Sales': row.sales || '-',
            'Tanggal Penyerahan': row.tanggal_penyerahan || '-',
            'Bulan BP': row.bulan_bp || '-',
            'Nama Customer': row.nama_customer || '-',
            'Penerima Unit': row.penerima_unit || '-',
            'Alasan (Jika Bukan Pemilik)': row.alasan_bukan_pemilik || '-',
            'Status Foto DEC': this.getFotoStatus(row.foto_dec_url),
            'Jumlah Foto': this.parseUrls(row.foto_dec_url).length,
            'Status Doc Pendukung': this.getDocStatus(row.doc_perwakilan_url),
            'Jumlah Dokumen': this.parseUrls(row.doc_perwakilan_url).length,
            'Link Foto DEC': this.parseUrls(row.foto_dec_url).join('; ') || '-',
            'Link Doc Pendukung': this.parseUrls(row.doc_perwakilan_url).join('; ') || '-'
          }));

          // Create workbook and worksheet
          const ws = XLSX.utils.json_to_sheet(excelData);
          const wb = XLSX.utils.book_new();
          
          // Set column widths
          const colWidths = [
            { wch: 5 },   // No
            { wch: 15 },  // Status
            { wch: 20 },  // Sales
            { wch: 15 },  // Tanggal Penyerahan
            { wch: 12 },  // Bulan BP
            { wch: 25 },  // Nama Customer
            { wch: 25 },  // Penerima Unit
            { wch: 30 },  // Alasan
            { wch: 15 },  // Status Foto DEC
            { wch: 12 },  // Jumlah Foto
            { wch: 18 },  // Status Doc Pendukung
            { wch: 15 },  // Jumlah Dokumen
            { wch: 50 },  // Link Foto DEC
            { wch: 50 }   // Link Doc Pendukung
          ];
          ws['!cols'] = colWidths;

          // Add worksheet to workbook
          const sheetName = this.filterBulan ? `Data ${this.filterBulan}` : 'Data Semua';
          XLSX.utils.book_append_sheet(wb, ws, sheetName);

          // Generate filename
          const currentDate = new Date().toISOString().split('T')[0];
          const filterText = this.filterBulan ? `_${this.filterBulan}` : '_Semua';
          const filename = `Live_Report_Penyerahan_Unit${filterText}_${currentDate}.xlsx`;

          // Download the file
          XLSX.writeFile(wb, filename);

          // Show success notification
          const downloadText = this.filterBulan ? 
            `Data bulan ${this.filterBulan} (${this.filteredData.length} data)` : 
            `Semua data (${this.filteredData.length} data)`;
          
          this.showNotification('success', 'Download Berhasil', 
            `${downloadText} berhasil didownload sebagai ${filename}`);

        } catch (error) {
          console.error('Error downloading Excel:', error);
          this.showNotification('error', 'Download Gagal', 'Terjadi kesalahan saat mendownload file Excel');
        } finally {
          setTimeout(() => {
            this.isDownloading = false;
          }, 1000);
        }
      },

      getDownloadTooltip() {
        if (this.filteredData.length === 0) {
          return 'Tidak ada data untuk didownload';
        }
        const filterText = this.filterBulan ? `bulan ${this.filterBulan}` : 'semua data';
        return `Download ${this.filteredData.length} data ${filterText} ke Excel`;
      },

      parseUrls(urlData) {
        if (!urlData) return [];
        try {
          if (typeof urlData === "string" && urlData.startsWith("[") && urlData.endsWith("]")) {
            return JSON.parse(urlData);
          }
          if (typeof urlData === "string") {
            return [urlData];
          }
          if (Array.isArray(urlData)) {
            return urlData;
          }
          return [];
        } catch (e) {
          console.warn("Error parsing URLs:", e);
          return [urlData];
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
        console.log('🔄 Manual refresh triggered...');
        this.isRefreshing = true;
        try {
          await this.loadData();
          this.showNotification('success', 'Data Diperbarui', 'Data berhasil dimuat ulang');
        } finally {
          setTimeout(() => {
            this.isRefreshing = false;
          }, 500);
        }
      },

      // Validation Methods
      isDataComplete(row) {
        const hasRequiredFields = row.nama_customer && row.penerima_unit;
        const hasFoto = this.parseUrls(row.foto_dec_url).length > 0;
        const hasDoc = row.penerima_unit === row.nama_customer || this.parseUrls(row.doc_perwakilan_url).length > 0;
        
        return hasRequiredFields && hasFoto && hasDoc;
      },

      getValidationStatus(row) {
        if (this.isDataComplete(row)) {
          return {
            text: '✅ Lengkap',
            class: 'status-complete',
            btnText: 'Submit',
            btnClass: 'btn-submit'
          };
        } else {
          const issues = this.getValidationIssues(row);
          return {
            text: '⚠️ Tidak Lengkap',
            class: 'status-incomplete',
            btnText: 'Tidak Bisa Submit',
            btnClass: 'btn-disabled'
          };
        }
      },

      getValidationIssues(row) {
        const issues = [];
        
        if (!row.nama_customer) issues.push('Nama customer kosong');
        if (!row.penerima_unit) issues.push('Penerima unit kosong');
        if (this.parseUrls(row.foto_dec_url).length === 0) issues.push('Foto DEC belum diupload');
        if (row.penerima_unit !== row.nama_customer && this.parseUrls(row.doc_perwakilan_url).length === 0) {
          issues.push('Dokumen perwakilan diperlukan (penerima bukan pemilik)');
        }
        
        return issues;
      },

      getRowClass(row) {
        return this.isDataComplete(row) ? 'row-complete' : 'row-incomplete';
      },

      getSubmitTooltip(row) {
        if (this.isDataComplete(row)) {
          return 'Data lengkap, siap untuk disubmit';
        } else {
          const issues = this.getValidationIssues(row);
          return `Tidak bisa submit: ${issues.join(', ')}`;
        }
      },

      attemptSubmission(row) {
        if (!this.isDataComplete(row)) {
          const issues = this.getValidationIssues(row);
          this.showNotification('error', 'Data Tidak Lengkap', 
            `Customer ${row.nama_customer || 'Unknown'}: ${issues.join(', ')}`);
          return;
        }
        
        // Simulate successful submission
        this.showNotification('success', 'Berhasil Submit', 
          `Data untuk ${row.nama_customer} berhasil disubmit`);
      },

      validateAllData() {
        const incompleteData = this.filteredData.filter(row => !this.isDataComplete(row));
        
        if (incompleteData.length === 0) {
          this.showNotification('success', 'Validasi Berhasil', 'Semua data sudah lengkap dan siap submit');
        } else {
          this.showNotification('warning', `${incompleteData.length} Data Belum Lengkap`, 
            'Beberapa data masih memerlukan foto atau dokumen tambahan');
          
          // Show detailed issues for first few incomplete items
          incompleteData.slice(0, 3).forEach(row => {
            const issues = this.getValidationIssues(row);
            this.showNotification('error', `${row.nama_customer || 'Unknown'}`, 
              issues.join(', '));
          });
        }
      },

      // Notification System
      showNotification(type, title, message) {
        const notification = {
          id: ++this.notificationId,
          type,
          title,
          message,
          timestamp: Date.now()
        };
        
        this.notifications.unshift(notification);
        
        // Auto remove after 5 seconds for success, 8 seconds for others
        const timeout = type === 'success' ? 5000 : 8000;
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, timeout);
        
        // Keep max 5 notifications
        if (this.notifications.length > 5) {
          this.notifications = this.notifications.slice(0, 5);
        }
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

  .notification-error {
    border-left-color: #ef4444;
  }

  .notification-warning {
    border-left-color: #f59e0b;
  }

  .notification-success {
    border-left-color: #10b981;
  }

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

  .notification-error .notification-icon {
    color: #ef4444;
  }

  .notification-warning .notification-icon {
    color: #f59e0b;
  }

  .notification-success .notification-icon {
    color: #10b981;
  }

  .notification-text {
    flex-grow: 1;
  }

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

  .notification-close:hover {
    color: #4b5563;
  }

  .notification-close svg {
    width: 16px;
    height: 16px;
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Filter Container */
  .filter-container {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-container label {
    font-weight: bold;
  }

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

  /* Buttons */
  .refresh-btn {
    display: inline-flex;
      align-self: center;
  margin-top: 0px; /* naik 2px */
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
  top: 2px !important; /* geser ke atas */
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

  .refresh-btn:hover::before {
    left: 100%;
  }

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

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Table Styles */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .report-table {
    width: 80%;
    border-collapse: collapse;
    min-width: 1200px;
  }

  .report-table th,
  .report-table td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
    white-space: nowrap;
  }

  .report-table th {
    background-color: #c8102e;
    color: white;
    font-weight: bold;
  }

  .report-table tbody tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  .report-table tbody tr:hover {
    background-color: #e9ecef;
  }

  .row-complete {
    background-color: #f0f9f0 !important;
  }

  .row-incomplete {
    background-color: #fff5f5 !important;
  }

  /* Status Badges */
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

  /* Action Buttons */
  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-submit {
    background-color: #10b981;
    color: white;
  }

  .btn-submit:hover {
    background-color: #059669;
    transform: translateY(-1px);
  }

  .btn-disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .btn-disabled:hover {
    background-color: #f3f4f6;
    transform: none;
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
    font-size: 0.875rem;
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

  .stat-item:hover {
    transform: translateY(-2px);
  }

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

  .stat-item.complete .stat-number {
    color: #10b981;
  }

  .stat-item.incomplete .stat-number {
    color: #ef4444;
  }

  .stat-item.total .stat-number {
    color: #007bff;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .report-table {
      font-size: 0.85rem;
      min-width: 1100px;
    }
    
    .report-container {
      padding: 0.5rem;
    }
    
    .filter-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }
    
    .filter-container select {
      min-width: 150px;
    }
    
    .download-link {
      font-size: 0.75rem;
      padding: 0.125rem;
    }
    
    .refresh-btn svg {
      width: 16px;
      height: 16px;
    }

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
    
    .notification {
      padding: 12px;
    }
    
    .notification-title {
      font-size: 13px;
    }
    
    .notification-message {
      font-size: 12px;
    }
    
    .summary-stats {
      gap: 1rem;
      justify-content: center;
    }
    
    .stat-item {
      min-width: 80px;
      padding: 0.75rem;
    }
    
    .stat-number {
      font-size: 1.5rem;
    }
    
    .stat-label {
      font-size: 0.75rem;
    }
      .refresh-btn {
    top: -2px; /* lebih kecil gesernya supaya pas */
    margin-top: -45px;
  }
  }

  @media (max-width: 480px) {
    .filter-container {
      gap: 8px;
    }
      .refresh-btn {
    top: 0; /* rata tengah di layar kecil banget */
  }
    .validate-btn span:not(.icon) {
      display: none;
    }
    
    .validate-btn {
      min-width: 40px;
      padding: 0.5rem;
    }
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

  .download-btn svg {
    width: 18px;
    height: 18px;
  }

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

  /* Spinner animation */
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

  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }

  @keyframes dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }

  .right-buttons {
    margin-left: auto;
      margin-top: -4px; /* naikkan 4px */
      flex-shrink: 0; /* cegah mengecil berlebihan */   
        display: flex;
    align-items: flex-start; /* dorong ke atas */
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap; /* cegah pindah baris */
    gap: 8px;
  }
  .left-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap; /* biar tombol kiri tetap rapi */
        padding: 2px px !important; /* kecilkan tinggi & lebar */
    font-size: 12px !important;   /* kecilkan teks */
  }
  </style>