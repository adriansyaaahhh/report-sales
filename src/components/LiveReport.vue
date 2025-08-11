<template>
  <div class="report-container">
    <h2>Live Report Penyerahan Unit</h2>

    <div class="filter-container">
      <label>Filter Bulan:</label>
      <select v-model="filterBulan" @change="applyFilter">
        <option value="">Semua</option>
        <option v-for="bulan in availableBulanList" :key="bulan" :value="bulan">{{ bulan }}</option>
      </select>
      <small style="margin-left: 10px; color: #666;">
        ({{ filteredData.length }} dari {{ allData.length }} data)
      </small>
      
      <!-- Updated Expert Refresh Button -->
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

    <div class="table-container">
      <table class="report-table">
        <thead>
          <tr>
            <th>Tanggal Penyerahan</th>
            <th>Sales</th>
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
          <tr v-for="row in filteredData" :key="row.id">
            <td>{{ row.tanggal_penyerahan || "-" }}</td>
            <td>{{ row.sales || "-" }}</td>
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

    <!-- Debug info (bisa dihapus setelah filter berfungsi) -->
    <div v-if="showDebug" style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px; font-size: 12px;">
      <strong>Debug Info:</strong><br>
      Filter Bulan: "{{ filterBulan }}"<br>
      Available Months: {{ availableBulanList.join(', ') }}<br>
      Total Data: {{ allData.length }}<br>
      Filtered Data: {{ filteredData.length }}<br>
      Bulan BP yang ada di data: {{ uniqueBulanBP.join(', ') }}
    </div>
  </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  name: "Report",
  data() {
    return {
      allData: [],
      filteredData: [],
      filterBulan: "",
      showDebug: false,
      subscription: null, // untuk real-time subscription
      isRefreshing: false, // Added for loading state
      bulanList: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ]
    };
  },
  computed: {
    // Mendapatkan bulan yang benar-benar ada di data berdasarkan kolom bulan_bp
    uniqueBulanBP() {
      const months = [...new Set(this.allData
        .map(row => row.bulan_bp)
        .filter(bulan => bulan && bulan.trim() !== "")
      )];
      
      // Urutkan berdasarkan urutan bulan di bulanList
      return months.sort((a, b) => {
        const indexA = this.bulanList.indexOf(a);
        const indexB = this.bulanList.indexOf(b);
        return indexA - indexB;
      });
    },
    
    availableBulanList() {
      // Tampilkan semua 12 bulan
      return this.bulanList;
    }
  },
  async mounted() {
    await this.loadData();
    this.setupRealTimeSubscription();
  },
  
  beforeUnmount() {
    // Cleanup subscription
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
          return;
        }

        this.allData = data || [];
        this.applyFilter(); // Apply current filter after loading
      } catch (err) {
        console.error("❌ Unexpected error:", err);
      }
    },

    setupRealTimeSubscription() {
      // Setup real-time subscription untuk mendengarkan perubahan data
      this.subscription = supabase
        .channel('penyerahan_unit_changes')
        .on('postgres_changes', 
          { 
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public', 
            table: 'penyerahan_unit' 
          }, 
          (payload) => {
            console.log('📡 Real-time update received:', payload);
            
            if (payload.eventType === 'INSERT') {
              // Tambah data baru
              this.allData.unshift(payload.new);
              this.applyFilter();
            } else if (payload.eventType === 'UPDATE') {
              // Update data yang ada
              const index = this.allData.findIndex(item => item.id === payload.new.id);
              if (index !== -1) {
                this.allData[index] = payload.new;
                this.applyFilter();
              }
            } else if (payload.eventType === 'DELETE') {
              // Hapus data
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

      // Filter berdasarkan kolom bulan_bp, bukan tanggal_penyerahan
      this.filteredData = this.allData.filter(row => {
        return row.bulan_bp && row.bulan_bp.trim() === this.filterBulan;
      });
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
      } finally {
        // Add small delay for better UX
        setTimeout(() => {
          this.isRefreshing = false;
        }, 500);
      }
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

.filter-container {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
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

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
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

/* Updated Expert Refresh Button Styles */
.refresh-btn {
  display: inline-flex;
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

.refresh-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .report-table {
    font-size: 0.85rem;
    min-width: 900px;
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
  
  .refresh-btn {
    width: 36px;
    height: 36px;
    margin-left: 0;
    margin-top: 5px;
  }
  
  .refresh-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>