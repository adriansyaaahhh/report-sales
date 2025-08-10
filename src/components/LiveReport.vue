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

    <table class="report-table">
      <thead>
        <tr>
          <th>Sales</th>
          <th>Bulan BP</th>
          <th>Nama Customer</th>
          <th>Foto DEC</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in filteredData" :key="row.id">
          <td>{{ row.sales || "-" }}</td>
          <td>{{ row.bulan_bp || "-" }}</td>
          <td>{{ row.nama_customer || "-" }}</td>
          <td>{{ row.foto_dec_url ? "✅ Sudah" : "❌ Belum" }}</td>
          <td>
            <a v-if="row.foto_dec_url" :href="row.foto_dec_url" target="_blank">📥 Unduh</a>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { createClient } from "@supabase/supabase-js";

const client = createClient(
  "https://nslsiisupracuzuzteut.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbHNpaXN1cHJhY3V6dXp0ZXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDMxODYsImV4cCI6MjA2OTk3OTE4Nn0.oifO2_BmGmW2sjfyqAFVDeoQ5L-IosIqQSKqBmYORFA"
);

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
    const { data, error } = await client
      .from("penyerahan_unit")
      .select("*")
      .order("tanggal_penyerahan", { ascending: false });

    if (!error) {
      this.allData = data;
      this.filteredData = data;
      this.bulanList = [...new Set(data.map(row => row.bulan_bp))];
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
