<template>
  <div class="card form-card">
    <h2>📝 Form Penyerahan Unit</h2>
    <form @submit.prevent="onSubmit" id="formPenyerahan">
      <div class="mb-3">
        <label>Tanggal Penyerahan *</label>
        <input type="date" v-model="tanggal" required />
      </div>

      <div class="mb-3">
        <label>Bulan BP</label>
        <select v-model="bulan" required>
          <option value="">Pilih Bulan</option>
          <option v-for="b in bulanList" :key="b">{{ b }}</option>
        </select>
      </div>

      <div class="mb-3">
        <label>Sales *</label>
        <select v-model="sales" required>
          <option value="">Pilih Sales</option>
          <option v-for="s in salesList" :key="s">{{ s }}</option>
        </select>
      </div>

      <div class="mb-3">
        <label>Nama Customer</label>
        <input type="text" v-model="nama_customer" />
      </div>

      <div class="mb-3">
        <label>Upload Foto DEC *</label>
        <input type="file" @change="onFotoChange" accept="image/*" />
      </div>

      <div class="mb-3">
        <label>Penerima Unit *</label><br/>
        <label><input type="radio" value="Pemilik" v-model="penerima" required /> Pemilik</label>
        <label><input type="radio" value="Perwakilan" v-model="penerima" required /> Perwakilan</label>
      </div>

      <div class="mb-3">
        <label>Alasan jika bukan pemilik</label>
        <input type="text" v-model="alasan_bukan_pemilik" />
      </div>

      <div class="mb-3">
        <label>Doc Pendukung Perwakilan</label>
        <input type="file" @change="onDocChange" accept="application/pdf,image/*" />
      </div>

      <div class="actions">
        <button type="submit" class="btn-submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'FormPenyerahan',
  setup() {
    const bulanList = [
      "Januari","Februari","Maret","April","Mei","Juni",
      "Juli","Agustus","September","Oktober","November","Desember"
    ]

    const salesList = [
      "ADE YULIA",
      "ADRIANTO",
      "AULIA NOPRI",
      "AZIS",
      "DENI SAHPUTRA",
      "FAHRIZAN HUTASUHUT",
      "JIMMY PRATAMA",
      "MHD REZKI",
      "MUHAMMAD FAJAR",
      "MUHAMMAD NUR",
      "RANDI SAPUTRA",
      "RISKI ERISMA IHSAN",
      "RITA ATRIA",
      "RONAL EKA PUTRA",
      "SYAFITRI ALHAPI"
    ]

    const tanggal = ref('')
    const bulan = ref('')
    const sales = ref('')
    const nama_customer = ref('')
    const penerima = ref('')
    const alasan_bukan_pemilik = ref('')
    const fotoFile = ref(null)
    const docFile = ref(null)

    function onFotoChange(e) {
      fotoFile.value = e.target.files[0] || null
    }
    function onDocChange(e) {
      docFile.value = e.target.files[0] || null
    }

    async function uploadToStorage(file, folder) {
      const fileName = `${folder}/${Date.now()}_${file.name}`
      const { error } = await supabase
        .storage
        .from('foto-penyerahan')
        .upload(fileName, file)

      if (error) throw error

      const { data } = supabase.storage.from('foto-penyerahan').getPublicUrl(fileName)
      return data.publicUrl
    }

    async function onSubmit() {
      try {
        let fotoURL = null
        if (fotoFile.value) {
          fotoURL = await uploadToStorage(fotoFile.value, 'dec')
        }

        let docURL = null
        if (docFile.value) {
          docURL = await uploadToStorage(docFile.value, 'dokumen')
        }

        const { error, data: inserted } = await supabase
          .from('penyerahan_unit')
          .insert([{
            tanggal_penyerahan: tanggal.value,
            bulan_bp: bulan.value,
            sales: sales.value,
            nama_customer: nama_customer.value,
            penerima_unit: penerima.value,
            alasan_bukan_pemilik: alasan_bukan_pemilik.value,
            foto_dec_url: fotoURL,
            doc_perwakilan_url: docURL
          }])
          .select()

        if (error) {
          console.error('❌ Gagal insert ke database:', error)
          alert('Gagal mengirim data. Cek console.')
        } else {
          console.log('✅ Data berhasil dikirim:', inserted)
          alert('✅ Data berhasil dikirim!')
          resetForm()
        }
      } catch (err) {
        console.error('❌ Error saat submit:', err)
        alert('Gagal upload atau kirim data. Cek console.')
      }
    }

    function resetForm() {
      tanggal.value = ''
      bulan.value = ''
      sales.value = ''
      nama_customer.value = ''
      penerima.value = ''
      alasan_bukan_pemilik.value = ''
      fotoFile.value = null
      docFile.value = null

      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach(i => i.value = '')
    }

    return {
      bulanList,
      salesList,
      tanggal, bulan, sales, nama_customer, penerima, alasan_bukan_pemilik,
      onFotoChange, onDocChange, onSubmit
    }
  }
}
</script>

<style scoped>
.form-card { background: white; padding: 1.25rem; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.mb-3 { margin-bottom: 1rem; }
input[type="text"], input[type="date"], select { width:100%; padding: 0.5rem; border-radius:6px; border:1px solid #ddd; }
.actions { margin-top: 1rem; text-align: right; }
.btn-submit {
  background: #b70000; color: #fff; padding: 0.6rem 1rem; border-radius:8px; border:none; cursor:pointer;
}
.btn-submit:hover { background: #ff0000; }
label { font-weight: 600; display:block; margin-bottom: .25rem; color: #333; }
</style>
