  <template>
    <div id="app" class="app-container">
      <header class="app-header">
        <img src="/logo.png" alt="Toyota" class="logo" />
        <div class="header-text">
          <h1>PT Agung toyota</h1>
          <p class="subtitle">Live Report Penyerahan Unit</p>
        </div>

        <nav class="nav-buttons">
          <button :class="{ active: view === 'form' }" @click="view = 'form'">📝 Form Penyerahan</button>
          <button :class="{ active: view === 'report' }" @click="view = 'report'">📊 Live Report</button>
        </nav>
      </header>

      <main class="main-content">
        <section v-show="view === 'form'">
          <FormPenyerahan />
        </section>

        <section v-show="view === 'report'">
          <ReportPenyerahan />
        </section>
      </main>

      <footer class="app-footer">
        <small>© PT Agung Toyota </small>
      </footer>
    </div>
  </template>

  <script>
  import FormPenyerahan from './components/SalesForm.vue'
  import ReportPenyerahan from './components/LiveReport.vue'

  export default {
    name: 'App',
    components: { FormPenyerahan, ReportPenyerahan },
    data() {
      return { view: 'form' }
    }
  }
  </script>

<style scoped>
  .app-container { 
    min-height: 100vh; 
    background: #f6f6f6; 
    font-family: "Segoe UI", Roboto, Arial, sans-serif; 
  }
  .app-header { 
    display:flex; 
    align-items:center; 
    gap:1rem; 
    justify-content:space-between; 
    padding:1rem 1.25rem; 
    background:#b70000; 
    color:white; 
    position: relative; /* ini penting untuk centering absolute */
  }
  .logo { height:56px; }
  .header-text { 
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }
  .header-text h1 { margin:0; font-size:1.2rem; font-weight:700; }
  .subtitle { margin:0; font-size:.9rem; opacity:.9; }
  .nav-buttons { display:flex; gap:.5rem; }
  .nav-buttons button { 
    background:white; 
    color:#b70000; 
    border:none; 
    padding:.5rem .8rem; 
    border-radius:8px; 
    cursor:pointer; 
    font-weight:700 
  }
  .nav-buttons button.active { background:#ff0000; color:white }
  .main-content { 
    max-width:1000px; 
    margin:1.25rem auto; 
    padding:0 1rem 2rem 1rem; 
    display:flex; 
    flex-direction:column; 
    gap:1rem; 
  }
  .app-footer { text-align:center; padding:1rem; color:#777; margin-top:1rem; }

  /* Tambahan untuk mobile-friendly */
  @media (max-width: 600px) {
    .header-text h1 {
      font-size: 1rem;
    }
    .subtitle {
      font-size: 0.8rem;
    }
    .nav-buttons {
      flex-wrap: wrap;
      gap: 0.3rem;
    }
  }
</style>
