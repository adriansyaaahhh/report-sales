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
        <!-- iOS: Native picker | Android: Custom modal -->
        <div class="file-upload-container">
          <button 
            type="button" 
            @click="handleFotoUploadClick" 
            class="btn-choose-file"
          >
            📸 Tambah Foto DEC
          </button>
          
          <!-- Input file tersembunyi untuk iOS -->
          <input 
            ref="fotoInput"
            type="file" 
            @change="onFotoChange" 
            accept="image/*" 
            multiple
            style="display: none;"
          />
          
          <!-- Input file tersembunyi untuk Android - Gallery -->
          <input 
            ref="fotoGalleryInput"
            type="file" 
            @change="onFotoChange" 
            accept="image/*" 
            multiple
            style="display: none;"
          />
          
          <!-- Input file tersembunyi untuk Android - Camera -->
          <input 
            ref="fotoCameraInput"
            type="file" 
            @change="onFotoChange" 
            accept="image/*" 
            capture="environment"
            style="display: none;"
          />
        </div>

        <!-- Preview Foto DEC -->
        <div v-if="fotoFiles.length > 0" class="preview-container">
          <h4>Foto DEC ({{ fotoFiles.length }})</h4>
          <div class="preview-grid">
            <div 
              v-for="(foto, index) in fotoFiles" 
              :key="`foto-${index}`" 
              class="preview-item"
            >
              <img :src="foto.url" :alt="`Foto DEC ${index + 1}`" />
              <button 
                type="button" 
                @click="removeFoto(index)" 
                class="remove-btn"
                title="Hapus foto"
              >
                ×
              </button>
              <p class="file-name">{{ foto.file.name }}</p>
            </div>
          </div>
        </div>
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
        <div class="file-upload-container">
          <button 
            type="button" 
            @click="handleDocUploadClick" 
            class="btn-choose-file"
          >
            📄 Tambah Dokumen
          </button>
          
          <!-- Input file tersembunyi untuk iOS -->
          <input 
            ref="docInput"
            type="file" 
            @change="onDocChange" 
            accept="application/pdf,image/*" 
            multiple
            style="display: none;"
          />
          
          <!-- Input file tersembunyi untuk Android - Gallery -->
          <input 
            ref="docGalleryInput"
            type="file" 
            @change="onDocChange" 
            accept="application/pdf,image/*" 
            multiple
            style="display: none;"
          />
          
          <!-- Input file tersembunyi untuk Android - Camera -->
          <input 
            ref="docCameraInput"
            type="file" 
            @change="onDocChange" 
            accept="image/*" 
            capture="environment"
            style="display: none;"
          />
        </div>

        <!-- Preview Dokumen -->
        <div v-if="docFiles.length > 0" class="preview-container">
          <h4>Dokumen ({{ docFiles.length }})</h4>
          <div class="preview-grid">
            <div 
              v-for="(doc, index) in docFiles" 
              :key="`doc-${index}`" 
              class="preview-item"
            >
              <div class="doc-preview">
                <img 
                  v-if="doc.isImage" 
                  :src="doc.url" 
                  :alt="`Dokumen ${index + 1}`" 
                />
                <div v-else class="pdf-icon">
                  📄
                </div>
              </div>
              <button 
                type="button" 
                @click="removeDoc(index)" 
                class="remove-btn"
                title="Hapus dokumen"
              >
                ×
              </button>
              <p class="file-name">{{ doc.file.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="submit" class="btn-submit">Submit</button>
      </div>
    </form>

    <!-- Modal pilihan untuk Android - Foto DEC -->
    <div v-if="showFotoOptions" class="modal-overlay" @click="showFotoOptions = false">
      <div class="modal-content" @click.stop>
        <h3>Pilih Sumber Foto DEC</h3>
        <div class="option-buttons">
          <button @click="selectFotoFromCamera" class="option-btn camera-btn">
            <span class="icon">📷</span>
            Ambil Foto
          </button>
          <button @click="selectFotoFromGallery" class="option-btn gallery-btn">
            <span class="icon">🖼️</span>
            Pilih dari Gallery
          </button>
        </div>
        <button @click="showFotoOptions = false" class="btn-cancel">Batal</button>
      </div>
    </div>

    <!-- Modal pilihan untuk Android - Dokumen -->
    <div v-if="showDocOptions" class="modal-overlay" @click="showDocOptions = false">
      <div class="modal-content" @click.stop>
        <h3>Pilih Sumber Dokumen</h3>
        <div class="option-buttons">
          <button @click="selectDocFromCamera" class="option-btn camera-btn">
            <span class="icon">📷</span>
            Ambil Foto
          </button>
          <button @click="selectDocFromGallery" class="option-btn gallery-btn">
            <span class="icon">📁</span>
            Pilih File
          </button>
        </div>
        <button @click="showDocOptions = false" class="btn-cancel">Batal</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
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
    
    // Multiple files
    const fotoFiles = ref([])
    const docFiles = ref([])

    // Device detection
    const isIOS = ref(false)
    
    // Refs untuk modal dan input elements
    const showFotoOptions = ref(false)
    const showDocOptions = ref(false)
    const fotoInput = ref(null)
    const fotoGalleryInput = ref(null)
    const fotoCameraInput = ref(null)
    const docInput = ref(null)
    const docGalleryInput = ref(null)
    const docCameraInput = ref(null)

    // Detect iOS device
    onMounted(() => {
      isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    })

    // Create object URL untuk preview
    function createFileObject(file) {
      const isImage = file.type.startsWith('image/')
      return {
        file: file,
        url: isImage ? URL.createObjectURL(file) : null,
        isImage: isImage
      }
    }

    // Handle foto upload click
    function handleFotoUploadClick() {
      if (isIOS.value) {
        // iOS: gunakan native picker
        fotoInput.value.click()
      } else {
        // Android: gunakan modal
        showFotoOptions.value = true
      }
    }

    // Handle dokumen upload click
    function handleDocUploadClick() {
      if (isIOS.value) {
        // iOS: gunakan native picker
        docInput.value.click()
      } else {
        // Android: gunakan modal
        showDocOptions.value = true
      }
    }

    function onFotoChange(e) {
      const files = Array.from(e.target.files)
      files.forEach(file => {
        fotoFiles.value.push(createFileObject(file))
      })
      showFotoOptions.value = false
      
      // Reset input untuk bisa pilih file yang sama lagi
      e.target.value = ''
    }

    function onDocChange(e) {
      const files = Array.from(e.target.files)
      files.forEach(file => {
        docFiles.value.push(createFileObject(file))
      })
      showDocOptions.value = false
      
      // Reset input untuk bisa pilih file yang sama lagi
      e.target.value = ''
    }

    // Remove foto
    function removeFoto(index) {
      const foto = fotoFiles.value[index]
      if (foto.url) {
        URL.revokeObjectURL(foto.url)
      }
      fotoFiles.value.splice(index, 1)
    }

    // Remove dokumen
    function removeDoc(index) {
      const doc = docFiles.value[index]
      if (doc.url) {
        URL.revokeObjectURL(doc.url)
      }
      docFiles.value.splice(index, 1)
    }

    // Functions untuk Android modal
    function selectFotoFromCamera() {
      fotoCameraInput.value.click()
    }

    function selectFotoFromGallery() {
      fotoGalleryInput.value.click()
    }

    function selectDocFromCamera() {
      docCameraInput.value.click()
    }

    function selectDocFromGallery() {
      docGalleryInput.value.click()
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
        
        // Validasi foto DEC harus ada
        if (fotoFiles.value.length === 0) {
          alert('Foto DEC wajib diupload!')
          return
        }
        
        // Test koneksi Supabase
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
          fotoCount: fotoFiles.value.length,
          docCount: docFiles.value.length
        })

        // Upload semua foto DEC
        let fotoURLs = []
        if (fotoFiles.value.length > 0) {
          console.log(`📸 Upload ${fotoFiles.value.length} foto DEC...`)
          for (let i = 0; i < fotoFiles.value.length; i++) {
            const url = await uploadToStorage(fotoFiles.value[i].file, 'dec')
            fotoURLs.push(url)
            console.log(`✅ Foto DEC ${i+1} berhasil:`, url)
          }
        }

        // Upload semua dokumen
        let docURLs = []
        if (docFiles.value.length > 0) {
          console.log(`📄 Upload ${docFiles.value.length} dokumen...`)
          for (let i = 0; i < docFiles.value.length; i++) {
            const url = await uploadToStorage(docFiles.value[i].file, 'dokumen')
            docURLs.push(url)
            console.log(`✅ Dokumen ${i+1} berhasil:`, url)
          }
        }

        const dataToInsert = {
          tanggal_penyerahan: tanggal.value,
          bulan_bp: bulan.value,
          sales: sales.value,
          nama_customer: nama_customer.value,
          penerima_unit: penerima.value,
          alasan_bukan_pemilik: alasan_bukan_pemilik.value,
          foto_dec_url: JSON.stringify(fotoURLs), // Multiple URLs as JSON string
          doc_perwakilan_url: JSON.stringify(docURLs), // Multiple URLs as JSON string
          created_at: new Date().toISOString()
        }
        
        console.log('💾 Data yang akan disimpan:', dataToInsert)

        const { error, data: inserted } = await supabase
          .from('penyerahan_unit')
          .insert([dataToInsert])
          .select()

        console.log('📊 Response dari Supabase:', { error, inserted })

        if (error) {
          console.error('❌ Error detail dari Supabase:', error)
          alert(`Gagal insert ke database: ${error.message}`)
        } else {
          console.log('✅ Data berhasil dikirim ke Supabase:', inserted)
          alert('✅ Data berhasil dikirim!')
          resetForm()
        }
      } catch (err) {
        console.error('❌ Error saat submit:', err)
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
      
      // Clear preview dan revoke URLs
      fotoFiles.value.forEach(foto => {
        if (foto.url) URL.revokeObjectURL(foto.url)
      })
      docFiles.value.forEach(doc => {
        if (doc.url) URL.revokeObjectURL(doc.url)
      })
      
      fotoFiles.value = []
      docFiles.value = []
      showFotoOptions.value = false
      showDocOptions.value = false

      // Reset semua file inputs
      const inputs = [fotoInput, fotoGalleryInput, fotoCameraInput, docInput, docGalleryInput, docCameraInput]
      inputs.forEach(input => {
        if (input.value) input.value.value = ''
      })
    }

    return {
      bulanList, salesList,
      tanggal, bulan, sales, nama_customer, penerima, alasan_bukan_pemilik,
      fotoFiles, docFiles, isIOS,
      showFotoOptions, showDocOptions,
      fotoInput, fotoGalleryInput, fotoCameraInput, docInput, docGalleryInput, docCameraInput,
      handleFotoUploadClick, handleDocUploadClick,
      onFotoChange, onDocChange, onSubmit,
      removeFoto, removeDoc,
      selectFotoFromCamera, selectFotoFromGallery,
      selectDocFromCamera, selectDocFromGallery
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
select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

/* File upload container */
.file-upload-container {
  width: 100%;
  margin-bottom: 1rem;
}

.btn-choose-file {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px dashed #b70000;
  background: #fff5f5;
  font-size: 1rem;
  color: #b70000;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

.btn-choose-file:hover {
  border-color: #ff0000;
  background: #ffe6e6;
}

/* Preview container */
.preview-container {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.preview-container h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.preview-item {
  position: relative;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.preview-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preview-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.doc-preview {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.doc-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdf-icon {
  font-size: 2rem;
  color: #dc3545;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #dc3545;
  transform: scale(1.1);
}

.file-name {
  padding: 0.5rem;
  margin: 0;
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  word-break: break-all;
  background: white;
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.option-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: #b70000;
  background: #fff5f5;
}

.camera-btn:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.gallery-btn:hover {
  border-color: #28a745;
  background: #f0fff4;
}

.option-btn .icon {
  font-size: 1.2rem;
}

.btn-cancel {
  width: 100%;
  padding: 0.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-cancel:hover {
  background: #5a6268;
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

/* Radio button styling */
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

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }

  .preview-item img,
  .doc-preview {
    height: 80px;
  }

  input[type="text"], 
  input[type="date"], 
  select,
  .btn-choose-file {
    font-size: 0.9rem;
  }

  .main-label, label {
    font-size: 0.9rem;
  }

  .radio-container {
    gap: 0.6rem;
  }

  .radio-item {
    padding: 0.7rem 0.9rem;
  }

  .radio-label {
    font-size: 0.9rem;
  }

  .modal-content {
    max-width: 280px;
    padding: 1.25rem;
  }

  .option-btn {
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
  }
}

/* Untuk layar sangat kecil */
@media (max-width: 400px) {
  .form-card {
    margin: 0.25rem;
    padding: 0.75rem;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }

  .radio-item {
    padding: 0.6rem 0.8rem;
  }

  .radio-label {
    font-size: 0.85rem;
  }

  .modal-content {
    max-width: 260px;
    padding: 1rem;
  }
}
</style>