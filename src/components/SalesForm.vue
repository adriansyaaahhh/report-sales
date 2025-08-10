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
        <label class="main-label">Penerima Unit *</label>
        <div class="radio-container">
          <div class="radio-item">
            <label for="pemilik" class="radio-label">Pemilik</label>
            <input type="radio" id="pemilik" value="Pemilik" v-model="penerima" required />
          </div>
          <div class="radio-item">
            <label for="perwakilan" class="radio-label">Perwakilan</label>
            <input type="radio" id="perwakilan" value="Perwakilan" v-model="penerima" required />
          </div>
        </div>
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
      "ADE YULIA","ADRIANTO","AULIA NOPRI","AZIS","DENI SAHPUTRA",
      "FAHRIZAN HUTASUHUT","JIMMY PRATAMA","MHD REZKI","MUHAMMAD FAJAR",
      "MUHAMMAD NUR","RANDI SAPUTRA","RISKI ERISMA IHSAN","RITA ATRIA",
      "RONAL EKA PUTRA","SYAFITRI ALHAPI"
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
      try {
        console.log(`📤 Upload ${file.name} ke folder ${folder}...`)
        const fileName = `${folder}/${Date.now()}_${file.name}`
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('foto-penyerahan')
          .upload(fileName, file)

        if (uploadError) {
          console.error('❌ Upload error:', uploadError)
          throw uploadError
        }

        console.log('✅ Upload berhasil:', uploadData)

        const { data: urlData } = supabase.storage
          .from('foto-penyerahan')
          .getPublicUrl(fileName)
        
        console.log('🔗 Public URL:', urlData.publicUrl)
        return urlData.publicUrl
      } catch (error) {
        console.error('❌ Error di uploadToStorage:', error)
        throw error
      }
    }

    async function onSubmit() {
      try {
        console.log('🚀 Mulai submit...')
        
        // Test koneksi Supabase terlebih dahulu
        console.log('🔌 Test koneksi ke Supabase...')
        const { data: testData, error: testError } = await supabase
          .from('penyerahan_unit')
          .select('count', { count: 'exact', head: true })
        
        if (testError) {
          console.error('❌ Koneksi ke Supabase gagal:', testError)
          alert(`Koneksi gagal: ${testError.message}`)
          return
        } else {
          console.log('✅ Koneksi ke Supabase berhasil. Total data:', testData)
        }
        
        console.log('📝 Data form:', {
          tanggal: tanggal.value,
          bulan: bulan.value,
          sales: sales.value,
          nama_customer: nama_customer.value,
          penerima: penerima.value,
          alasan: alasan_bukan_pemilik.value,
          foto: fotoFile.value?.name,
          doc: docFile.value?.name
        })

        let fotoURL = null
        if (fotoFile.value) {
          console.log('📸 Upload foto DEC...')
          fotoURL = await uploadToStorage(fotoFile.value, 'dec')
          console.log('✅ Foto DEC berhasil:', fotoURL)
        }

        let docURL = null
        if (docFile.value) {
          console.log('📄 Upload dokumen...')
          docURL = await uploadToStorage(docFile.value, 'dokumen')
          console.log('✅ Dokumen berhasil:', docURL)
        }

        const dataToInsert = {
          tanggal_penyerahan: tanggal.value,
          bulan_bp: bulan.value,
          sales: sales.value,
          nama_customer: nama_customer.value,
          penerima_unit: penerima.value,
          alasan_bukan_pemilik: alasan_bukan_pemilik.value,
          foto_dec_url: fotoURL,
          doc_perwakilan_url: docURL,
          created_at: new Date().toISOString() // Tambah timestamp
        }
        
        console.log('💾 Data yang akan disimpan:', dataToInsert)

        const { error, data: inserted } = await supabase
          .from('penyerahan_unit')
          .insert([dataToInsert])
          .select()

        console.log('📊 Response dari Supabase:', { error, inserted })

        if (error) {
          console.error('❌ Error detail dari Supabase:', error)
          console.error('❌ Error message:', error.message)
          console.error('❌ Error details:', error.details)
          console.error('❌ Error hint:', error.hint)
          console.error('❌ Error code:', error.code)
          alert(`Gagal insert ke database: ${error.message}`)
        } else {
          console.log('✅ Data berhasil dikirim ke Supabase:', inserted)
          
          // Double check - coba query data yang baru dimasukkan
          if (inserted && inserted.length > 0) {
            const newId = inserted[0].id
            console.log('🔍 Verifikasi data dengan ID:', newId)
            
            const { data: verification, error: verifyError } = await supabase
              .from('penyerahan_unit')
              .select('*')
              .eq('id', newId)
              
            if (verifyError) {
              console.error('❌ Error saat verifikasi:', verifyError)
            } else {
              console.log('✅ Data berhasil diverifikasi di database:', verification)
            }
          }
          
          alert('✅ Data berhasil dikirim!')
          resetForm()
        }
      } catch (err) {
        console.error('❌ Error saat submit:', err)
        console.error('❌ Error stack:', err.stack)
        alert(`Error: ${err.message}`)
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
.form-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  max-width: 600px;
  margin: auto;
}

.mb-3 {
  margin-bottom: 1rem;
}

input[type="text"], 
input[type="date"], 
select, 
input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.actions {
  margin-top: 1rem;
  text-align: right;
}

.btn-submit {
  background: #b70000;
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.btn-submit:hover {
  background: #ff0000;
}

.main-label {
  font-weight: 600;
  display: block;
  margin-bottom: .5rem;
  color: #333;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: .25rem;
  color: #333;
}

/* Radio button styling yang lebih sederhana */
.radio-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s ease;
  cursor: pointer;
}

.radio-item:hover {
  border-color: #b70000;
  background: #fff5f5;
}

.radio-item input[type="radio"] {
  width: auto;
  margin: 0;
  cursor: pointer;
  transform: scale(1.2);
}

.radio-item:has(input[type="radio"]:checked) {
  border-color: #b70000;
  background: #fff5f5;
}

.radio-label {
  font-weight: 500;
  margin: 0;
  cursor: pointer;
  color: #333;
  font-size: 1rem;
  flex: 1;
}

.radio-item input[type="radio"]:checked ~ .radio-label,
.radio-item:has(input[type="radio"]:checked) .radio-label {
  color: #b70000;
  font-weight: 600;
}

/* Responsif untuk mobile */
@media (max-width: 600px) {
  .form-card {
    padding: 1rem;
    margin: 0.5rem;
  }

  input[type="text"], 
  input[type="date"], 
  select, 
  input[type="file"] {
    font-size: 0.9rem;
  }

  .main-label, label {
    font-size: 0.9rem;
  }

  /* Radio button tetap rapi di mobile */
  .radio-container {
    gap: 0.6rem;
  }

  .radio-item {
    padding: 0.7rem 0.9rem;
  }

  .radio-label {
    font-size: 0.9rem;
  }
}

/* Untuk layar sangat kecil */
@media (max-width: 400px) {
  .form-card {
    margin: 0.25rem;
    padding: 0.75rem;
  }

  .radio-item {
    padding: 0.6rem 0.8rem;
  }

  .radio-label {
    font-size: 0.85rem;
  }
}
</style>