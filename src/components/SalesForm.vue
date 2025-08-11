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
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          {{ isSubmitting ? 'Mengirim...' : 'Submit' }}
        </button>
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

    <!-- Toast Notification System -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="[
          'toast',
          `toast-${toast.type}`,
          { 'toast-show': toast.show }
        ]"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error'">❌</span>
          <span v-else-if="toast.type === 'warning'">⚠️</span>
          <span v-else-if="toast.type === 'info'">ℹ️</span>
          <span v-else-if="toast.type === 'loading'" class="loading-icon">⏳</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        <button 
          v-if="!toast.autoHide" 
          @click="removeToast(toast.id)" 
          class="toast-close"
        >
          ×
        </button>
        <div 
          v-if="toast.autoHide && toast.progress !== undefined" 
          class="toast-progress"
          :style="{ width: toast.progress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="showLoadingOverlay" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>{{ loadingText }}</h3>
        <p>{{ loadingSubtext }}</p>
        <div class="loading-progress">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
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

    // Loading states
    const isSubmitting = ref(false)
    const showLoadingOverlay = ref(false)
    const loadingText = ref('')
    const loadingSubtext = ref('')
    const uploadProgress = ref(0)

    // Toast notifications
    const toasts = ref([])
    let toastIdCounter = 0

    // Detect iOS device
    onMounted(() => {
      isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    })

    // Toast notification functions
    function showToast(type, title, message = '', options = {}) {
      const toast = {
        id: ++toastIdCounter,
        type,
        title,
        message,
        show: false,
        autoHide: options.autoHide !== false,
        duration: options.duration || 4000,
        progress: options.autoHide !== false ? 100 : undefined
      }

      toasts.value.push(toast)

      // Trigger animation
      setTimeout(() => {
        toast.show = true
      }, 10)

      // Auto hide with progress
      if (toast.autoHide) {
        const interval = setInterval(() => {
          toast.progress -= (100 / (toast.duration / 100))
          if (toast.progress <= 0) {
            clearInterval(interval)
            removeToast(toast.id)
          }
        }, 100)
      }

      return toast.id
    }

    function removeToast(id) {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value[index].show = false
        setTimeout(() => {
          toasts.value.splice(index, 1)
        }, 300)
      }
    }

    function clearAllToasts() {
      toasts.value.forEach(toast => {
        toast.show = false
      })
      setTimeout(() => {
        toasts.value.splice(0)
      }, 300)
    }

    // Specific toast types
    function showSuccessToast(title, message = '') {
      return showToast('success', title, message, { duration: 3000 })
    }

    function showErrorToast(title, message = '') {
      return showToast('error', title, message, { duration: 5000 })
    }

    function showWarningToast(title, message = '') {
      return showToast('warning', title, message, { duration: 4000 })
    }

    function showInfoToast(title, message = '') {
      return showToast('info', title, message, { duration: 4000 })
    }

    function showLoadingToast(title, message = '') {
      return showToast('loading', title, message, { autoHide: false })
    }

    // Loading overlay functions
    function showLoading(text, subtext = '', progress = 0) {
      loadingText.value = text
      loadingSubtext.value = subtext
      uploadProgress.value = progress
      showLoadingOverlay.value = true
    }

    function updateLoading(text, subtext = '', progress) {
      loadingText.value = text
      loadingSubtext.value = subtext
      if (progress !== undefined) {
        uploadProgress.value = progress
      }
    }

    function hideLoading() {
      showLoadingOverlay.value = false
      uploadProgress.value = 0
    }

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
      if (files.length > 0) {
        files.forEach(file => {
          fotoFiles.value.push(createFileObject(file))
        })
        showSuccessToast(
          'Foto berhasil ditambahkan!', 
          `${files.length} foto DEC telah dipilih`
        )
      }
      showFotoOptions.value = false
      
      // Reset input untuk bisa pilih file yang sama lagi
      e.target.value = ''
    }

    function onDocChange(e) {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        files.forEach(file => {
          docFiles.value.push(createFileObject(file))
        })
        showSuccessToast(
          'Dokumen berhasil ditambahkan!', 
          `${files.length} dokumen telah dipilih`
        )
      }
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
      showInfoToast('Foto dihapus', 'Foto DEC berhasil dihapus dari daftar')
    }

    // Remove dokumen
    function removeDoc(index) {
      const doc = docFiles.value[index]
      if (doc.url) {
        URL.revokeObjectURL(doc.url)
      }
      docFiles.value.splice(index, 1)
      showInfoToast('Dokumen dihapus', 'Dokumen berhasil dihapus dari daftar')
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

    async function uploadToStorage(file, folder, onProgress) {
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
        
        // Clear existing toasts
        clearAllToasts()
        
        // Validasi foto DEC harus ada
        if (fotoFiles.value.length === 0) {
          showErrorToast(
            'Foto DEC wajib diupload!', 
            'Silakan tambahkan minimal 1 foto DEC sebelum submit'
          )
          return
        }
        
        // Set loading state
        isSubmitting.value = true
        
        // Show loading overlay
        showLoading(
          'Memproses data...', 
          'Sedang memvalidasi koneksi ke server', 
          10
        )
        
        // Test koneksi Supabase
        console.log('🔌 Test koneksi ke Supabase...')
        const { data: testData, error: testError } = await supabase
          .from('penyerahan_unit')
          .select('count', { count: 'exact', head: true })
        
        if (testError) {
          console.error('❌ Koneksi ke Supabase gagal:', testError)
          hideLoading()
          isSubmitting.value = false
          showErrorToast(
            'Koneksi ke server gagal!', 
            `Error: ${testError.message}`
          )
          return
        } else {
          console.log('✅ Koneksi ke Supabase berhasil. Total data:', testData)
          updateLoading(
            'Koneksi berhasil!', 
            'Mulai mengupload file...', 
            20
          )
        }
        
        const totalFiles = fotoFiles.value.length + docFiles.value.length
        let uploadedFiles = 0
        
        // Upload semua foto DEC
        let fotoURLs = []
        if (fotoFiles.value.length > 0) {
          console.log(`📸 Upload ${fotoFiles.value.length} foto DEC...`)
          
          for (let i = 0; i < fotoFiles.value.length; i++) {
            updateLoading(
              `Upload foto DEC ${i + 1}/${fotoFiles.value.length}...`, 
              `File: ${fotoFiles.value[i].file.name}`, 
              20 + (uploadedFiles / totalFiles) * 60
            )
            
            const url = await uploadToStorage(fotoFiles.value[i].file, 'dec')
            fotoURLs.push(url)
            uploadedFiles++
            console.log(`✅ Foto DEC ${i+1} berhasil:`, url)
          }
        }

        // Upload semua dokumen
        let docURLs = []
        if (docFiles.value.length > 0) {
          console.log(`📄 Upload ${docFiles.value.length} dokumen...`)
          
          for (let i = 0; i < docFiles.value.length; i++) {
            updateLoading(
              `Upload dokumen ${i + 1}/${docFiles.value.length}...`, 
              `File: ${docFiles.value[i].file.name}`, 
              20 + (uploadedFiles / totalFiles) * 60
            )
            
            const url = await uploadToStorage(docFiles.value[i].file, 'dokumen')
            docURLs.push(url)
            uploadedFiles++
            console.log(`✅ Dokumen ${i+1} berhasil:`, url)
          }
        }

        updateLoading(
          'Upload selesai!', 
          'Menyimpan data ke database...', 
          85
        )

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

        updateLoading(
          'Menyelesaikan proses...', 
          'Hampir selesai...', 
          95
        )

        // Simulate final processing
        await new Promise(resolve => setTimeout(resolve, 500))

        if (error) {
          console.error('❌ Error detail dari Supabase:', error)
          hideLoading()
          isSubmitting.value = false
          showErrorToast(
            'Gagal menyimpan data!', 
            `Database error: ${error.message}`
          )
        } else {
          console.log('✅ Data berhasil dikirim ke Supabase:', inserted)
          updateLoading(
            'Berhasil!', 
            'Data telah tersimpan', 
            100
          )
          
          // Wait a moment then hide loading
          setTimeout(() => {
            hideLoading()
            isSubmitting.value = false
            
            showSuccessToast(
              '🎉 Data berhasil dikirim!', 
              `Form penyerahan unit telah berhasil disimpan dengan ${fotoFiles.value.length} foto DEC dan ${docFiles.value.length} dokumen`
            )
            
            resetForm()
          }, 1000)
        }
      } catch (err) {
        console.error('❌ Error saat submit:', err)
        hideLoading()
        isSubmitting.value = false
        showErrorToast(
          'Terjadi kesalahan sistem!', 
          `Error: ${err.message || 'Unknown error'}`
        )
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

      showInfoToast('Form direset', 'Form telah dikosongkan dan siap untuk data baru')
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
      selectDocFromCamera, selectDocFromGallery,
      // Loading and notification states
      isSubmitting, showLoadingOverlay, loadingText, loadingSubtext, uploadProgress,
      toasts, removeToast
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
  position: relative;
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
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;
}

.btn-submit:hover:not(:disabled) {
  background: #ff0000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(183, 0, 0, 0.3);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* Toast Notification System */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  width: calc(100vw - 40px);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-show {
  transform: translateX(0);
  opacity: 1;
}

.toast-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-left: 4px solid #28a745;
  color: #155724;
}

.toast-error {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-left: 4px solid #dc3545;
  color: #721c24;
}

.toast-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-left: 4px solid #ffc107;
  color: #856404;
}

.toast-info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  border-left: 4px solid #17a2b8;
  color: #0c5460;
}

.toast-loading {
  background: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
  border-left: 4px solid #6c757d;
  color: #383d41;
}

.toast-icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.loading-icon {
  animation: spin 2s linear infinite;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0.9;
  word-wrap: break-word;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.6;
  transition: width 0.1s linear;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 350px;
  width: 90%;
  position: relative;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #b70000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.loading-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 700;
}

.loading-content p {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
}

.loading-progress {
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  height: 8px;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #b70000, #ff0000);
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 0.85rem;
  color: #666;
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

  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }

  .toast {
    padding: 0.85rem;
  }

  .toast-title {
    font-size: 0.9rem;
  }

  .toast-message {
    font-size: 0.8rem;
  }

  .loading-content {
    padding: 2rem;
    max-width: 300px;
  }

  .loading-content h3 {
    font-size: 1.1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
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

  .toast {
    padding: 0.75rem;
  }

  .loading-content {
    padding: 1.5rem;
    max-width: 280px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast-container {
    filter: brightness(0.9);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toast,
  .loading-spinner,
  .spinner,
  .progress-bar::after {
    animation: none !important;
  }
  
  .btn-submit:hover:not(:disabled) {
    transform: none;
  }
}
</style>