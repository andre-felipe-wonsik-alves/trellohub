// GitHub Services Test Suite
class GitHubTestSuite {
  constructor() {
    this.token = null;
    this.user = null;
    this.repositories = [];
    this.init();
  }

  init() {
    console.log("🚀 Iniciando teste dos serviços GitHub...");
    this.setupEventListeners();
    this.createTestUI();
  }

  setupEventListeners() {
    // Listener para códigos de autorização
    window.addEventListener("github-auth-code", (event) => {
      console.log("📨 Código de autorização recebido:", event.detail.code);
      this.handleAuthorizationCode(event.detail.code);
    });
  }

  createTestUI() {
    // Cria uma interface simples para testes
    const testContainer = document.createElement("div");
    testContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 15px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-height: 80vh;
        overflow-y: auto;
      `;

    testContainer.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">GitHub Services Test</h3>
        <button id="start-oauth">🔐 Iniciar OAuth</button>
        <button id="test-token" disabled>✅ Testar Token</button>
        <button id="get-repos" disabled>📂 Buscar Repositórios</button>
        <button id="get-repo-data" disabled>📊 Dados do Repositório</button>
        <button id="revoke-token" disabled>🚫 Revogar Token</button>
        <button id="run-full-test">🧪 Teste Completo</button>
        <hr style="margin: 10px 0;">
        <div id="test-status">Pronto para testar</div>
      `;

    document.body.appendChild(testContainer);

    // Event listeners dos botões
    document.getElementById("start-oauth").onclick = () => {
      this.startOAuthFlow();
    };
    document.getElementById("test-token").onclick = () => {
      this.testToken();
    };
    document.getElementById("get-repos").onclick = () => {
      this.getUserRepositories();
    };
    document.getElementById("get-repo-data").onclick = () => {
      this.getRepositoryData();
    };
    document.getElementById("revoke-token").onclick = () => {
      this.revokeToken();
    };
    document.getElementById("run-full-test").onclick = () => {
      this.runFullTest();
    };
  }

  updateStatus(message) {
    const statusDiv = document.getElementById("test-status");
    if (statusDiv) {
      statusDiv.innerHTML = message;
    }
    console.log(message);
  }

  enableButtons() {
    document.getElementById("test-token").disabled = false;
    document.getElementById("get-repos").disabled = false;
    document.getElementById("get-repo-data").disabled = false;
    document.getElementById("revoke-token").disabled = false;
  }

  disableButtons() {
    document.getElementById("test-token").disabled = true;
    document.getElementById("get-repos").disabled = true;
    document.getElementById("get-repo-data").disabled = true;
    document.getElementById("revoke-token").disabled = true;
  }

  // Teste 1: Iniciar fluxo OAuth
  async startOAuthFlow() {
    try {
      console.log("🔐 Iniciando fluxo OAuth...");
      this.updateStatus("Iniciando OAuth...");

      const oauthUrl = await window.electronAPI.getOAuthUrl();
      console.log("🌐 URL OAuth:", oauthUrl);

      // Abre a URL no navegador externo
      await window.electronAPI.openExternal(oauthUrl);

      this.updateStatus("Aguardando autorização...");
      console.log("⏳ Aguardando código de autorização...");
    } catch (error) {
      console.error("❌ Erro no OAuth:", error);
      this.updateStatus(`Erro OAuth: ${error.message}`);
    }
  }

  // Teste 2: Trocar código por token
  async handleAuthorizationCode(code) {
    try {
      console.log("🔄 Trocando código por token...");
      this.updateStatus("Trocando código por token...");

      const authToken = await window.electronAPI.exchangeCodeForToken(code);
      console.log("🎫 Token recebido:", authToken);

      this.token = authToken.access_token;
      this.updateStatus("Token obtido com sucesso!");
      this.enableButtons();

      // Automaticamente busca dados do usuário
      await this.getAuthenticatedUser();
    } catch (error) {
      console.error("❌ Erro ao trocar código:", error);
      this.updateStatus(`Erro ao obter token: ${error.message}`);
    }
  }

  // Teste 3: Buscar usuário autenticado
  async getAuthenticatedUser() {
    if (!this.token) {
      console.log("⚠️ Token não disponível");
      return;
    }

    try {
      console.log("👤 Buscando usuário autenticado...");
      this.updateStatus("Buscando dados do usuário...");

      const user = await window.electronAPI.getAuthenticatedUser(this.token);
      console.log("👤 Usuário:", user);

      this.user = user;
      this.updateStatus(`Usuário: ${user.login} (${user.name})`);
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error);
      this.updateStatus(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  // Teste 4: Validar token
  async testToken() {
    if (!this.token) {
      console.log("⚠️ Token não disponível");
      return;
    }

    try {
      console.log("✅ Testando validade do token...");
      this.updateStatus("Validando token...");

      const isValid = await window.electronAPI.isTokenValid(this.token);
      console.log("✅ Token válido:", isValid);

      this.updateStatus(`Token ${isValid ? "válido" : "inválido"}`);
    } catch (error) {
      console.error("❌ Erro ao validar token:", error);
      this.updateStatus(`Erro ao validar token: ${error.message}`);
    }
  }

  // Teste 5: Buscar repositórios do usuário
  async getUserRepositories() {
    if (!this.token) {
      console.log("⚠️ Token não disponível");
      return;
    }

    try {
      console.log("📂 Buscando repositórios do usuário...");
      this.updateStatus("Buscando repositórios...");

      const repositories = await window.electronAPI.getUserRepositories(
        this.token
      );
      console.log("📂 Repositórios encontrados:", repositories);

      this.repositories = repositories;
      this.updateStatus(`${repositories.length} repositórios encontrados`);

      // Mostra os primeiros 5 repositórios
      if (repositories.length > 0) {
        console.log("📋 Primeiros repositórios:");
        repositories.slice(0, 5).forEach((repo, index) => {
          console.log(`  ${index + 1}. ${repo.name} (${repo.full_name})`);
        });
      }
    } catch (error) {
      console.error("❌ Erro ao buscar repositórios:", error);
      this.updateStatus(`Erro ao buscar repositórios: ${error.message}`);
    }
  }

  // Teste 6: Buscar dados de um repositório específico
  async getRepositoryData() {
    if (!this.token || !this.repositories.length) {
      console.log("⚠️ Token ou repositórios não disponíveis");
      return;
    }

    try {
      // Usa o primeiro repositório como exemplo
      const repo = this.repositories[0];
      const [owner, repoName] = repo.full_name.split("/");

      console.log(`📊 Buscando dados do repositório: ${repo.full_name}`);
      this.updateStatus(`Buscando dados de ${repo.name}...`);

      const repoData = await window.electronAPI.getRepositoryData(
        this.token,
        owner,
        repoName
      );
      console.log("📊 Dados do repositório:", repoData);

      this.updateStatus(`Dados de ${repo.name} carregados`);
    } catch (error) {
      console.error("❌ Erro ao buscar dados do repositório:", error);
      this.updateStatus(`Erro ao buscar dados: ${error.message}`);
    }
  }

  // Teste 7: Revogar token
  async revokeToken() {
    if (!this.token) {
      console.log("⚠️ Token não disponível");
      return;
    }

    try {
      console.log("🚫 Revogando token...");
      this.updateStatus("Revogando token...");

      await window.electronAPI.revokeToken(this.token);
      console.log("🚫 Token revogado com sucesso");

      this.token = null;
      this.user = null;
      this.repositories = [];
      this.disableButtons();
      this.updateStatus("Token revogado");
    } catch (error) {
      console.error("❌ Erro ao revogar token:", error);
      this.updateStatus(`Erro ao revogar: ${error.message}`);
    }
  }

  // Teste completo (automatizado)
  async runFullTest() {
    console.log("🧪 Iniciando teste completo...");
    this.updateStatus("Teste completo iniciado");

    // Se já tiver token, testa diretamente
    if (this.token) {
      await this.testTokenFlow();
    } else {
      // Inicia o fluxo OAuth
      await this.startOAuthFlow();
      console.log("⏳ Aguarde a autorização para continuar o teste...");
    }
  }

  async testTokenFlow() {
    const tests = [
      { name: "Validar Token", fn: () => this.testToken() },
      { name: "Buscar Usuário", fn: () => this.getAuthenticatedUser() },
      { name: "Buscar Repositórios", fn: () => this.getUserRepositories() },
      { name: "Dados do Repositório", fn: () => this.getRepositoryData() },
    ];

    for (const test of tests) {
      console.log(`🧪 Executando: ${test.name}`);
      await test.fn();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Pausa entre testes
    }

    console.log("✅ Teste completo finalizado!");
    this.updateStatus("Teste completo finalizado");
  }
}

// Inicializa os testes quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  console.log("📱 Renderer carregado, iniciando testes...");
  new GitHubTestSuite();
});

// Logs adicionais para debug
console.log("📡 Verificando APIs disponíveis...");
console.log("electronAPI disponível:", !!window.electronAPI);
if (window.electronAPI) {
  console.log("Métodos disponíveis:", Object.keys(window.electronAPI));
}
