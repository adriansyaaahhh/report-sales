<template>
  <div class="report-container">
    <h2>Live Report Penyerahan Unit</h2>

    <div class="filter-container">
      <label>Filter Bulan:</label>
      <select v-model="filterBulan" @change="applyFilter">
        <option value="">Semua</option>
        <option v-for="bulan in bulanList" :key="bulan" :value="bulan">{{ bulan }}</option>
      </select>
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
      // Daftar lengkap semua 12 bulan
      bulanList: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ]
    };
  },
  async mounted() {
    const { data, error } = await supabase
      .from("penyerahan_unit")
      .select("*")
      .order("tanggal_penyerahan", { ascending: false });

    if (!error) {
      this.allData = data;
      this.filteredData = data;
      console.log('✅ Data loaded:', data.length, 'records');
    } else {
      console.error('❌ Error load data:', error);
    }
  },
  methods: {
    applyFilter() {
      this.filteredData = this.filterBulan
        ? this.allData.filter(row => row.bulan_bp === this.filterBulan)
        : this.allData;
      console.log('🔍 Filter applied:', this.filterBulan, '- Results:', this.filteredData.length);
    },

    // Parse URLs (untuk multiple files yang disimpan sebagai JSON)
    parseUrls(urlData) {
      if (!urlData) return [];
      
      try {
        // Jika sudah array JSON string
        if (urlData.startsWith('[') && urlData.endsWith(']')) {
          return JSON.parse(urlData);
        }
        // Jika single URL string
        return [urlData];
      } catch (e) {
        // Jika parse gagal, anggap single URL
        return [urlData];
      }
    },

    // Get status foto
    getFotoStatus(fotoUrl) {
      const urls = this.parseUrls(fotoUrl);
      if (urls.length === 0) return "❌ Belum";
      if (urls.length === 1) return "✅ 1 Foto";
      return `✅ ${urls.length} Foto`;
    },

    // Get status dokumen
    getDocStatus(docUrl) {
      const urls = this.parseUrls(docUrl);
      if (urls.length === 0) return "❌ Belum";
      if (urls.length === 1) return "✅ 1 Doc";
      return `✅ ${urls.length} Doc`;
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
}

.filter-container select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  min-width: 200px;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px; /* lebih lebar karena ada kolom tambahan */
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
}

.download-link:hover {
  text-decoration: underline;
  background: #e9ecef;
}

@media (max-width: 768px) {
  .report-table {
    font-size: 0.85rem;
    min-width: 900px;
  }
  .report-container {
    padding: 0.5rem;
  }
  
  .filter-container select {
    min-width: 150px;
  }
  
  .download-link {
    font-size: 0.75rem;
    padding: 0.125rem;
  }
}
</style>