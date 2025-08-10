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
            <td>{{ row.foto_dec_url ? "✅ Sudah" : "❌ Belum" }}</td>
            <td>
              <a v-if="row.foto_dec_url" :href="row.foto_dec_url" target="_blank" class="download-link">📥 Unduh</a>
              <span v-else>-</span>
            </td>
            <td>{{ row.doc_perwakilan_url ? "✅ Sudah" : "❌ Belum" }}</td>
            <td>
              <a v-if="row.doc_perwakilan_url" :href="row.doc_perwakilan_url" target="_blank" class="download-link">📥 Unduh</a>
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
      bulanList: []
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
      this.bulanList = [...new Set(data.map(row => row.bulan_bp))];
    } else {
      console.error('❌ Error load data:', error);
    }
  },
  methods: {
    applyFilter() {
      this.filteredData = this.filterBulan
        ? this.allData.filter(row => row.bulan_bp === this.filterBulan)
        : this.allData;
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

.download-link {
  cursor: pointer;
  color: #007bff;
  text-decoration: none;
}

.download-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .report-table {
    font-size: 0.85rem;
    min-width: 900px;
  }
  .report-container {
    padding: 0.5rem;
  }
}
</style>