// --- EDITE SUA BIBLIOTECA DE JOGOS AQUI DIRETAMENTE NO CÓDIGO ---
const MY_GAMES = [
  {
    id: 1,
    title: "Super Mario World",
    description: "Super Mario World, originalmente chamado no Japão de Super Mario Bros. 4, é um jogo eletrônico de plataforma desenvolvido pela Nintendo Entertainment Analysis & Development e publicado pela Nintendo, em 1990, para o console Super Nintendo Entertainment System",
    romUrl: "roms/Super Mario World (USA).sfc",              
    coverUrl: "assets/Super-Mario-World (1).jpg",         
    videoUrl: "assets/gameplay2.mp4"      
  },
  {
    id: 2,
    title: "Megaman 7",
    description: "Mega Man 7, conhecido no Japão como Rockman 7: Shukumei no Taiketsu!, é um jogo eletrônico de ação-plataforma desenvolvido e publicado pela Capcom. Foi lançado inicialmente em março de 1995 para Super Nintendo Entertainment System, e é o sétimo jogo da série Mega Man",
    romUrl: "roms/Mega Man 7 (USA).sfc",
    coverUrl: "assets/Mega_Man_7_capa.jpg",
    videoUrl: "assets/gameplay1.mp4"
  },
  {
    id: 3,
    title: "Donkey Kong Country 2",
    description: "Donkey Kong Country 2: Diddy's Kong Quest é um jogo eletrônico de plataforma desenvolvido pela Rare e publicado pela Nintendo em novembro de 1995 para o Super Nintendo Entertainment System. É o segundo jogo da série Donkey Kong Country.",
    romUrl: "roms/Donkey Kong Country 2 - Diddy's Kong Quest (U) (V1.1) [!].smc",
    coverUrl: "assets/Donkey_Kong_Country_2_capa.png",
    videoUrl: "assets/gameplay3.mp4"
  }
];

const EMULATOR_DATA = "https://cdn.emulatorjs.org/stable/data/";

const gamesGrid = document.querySelector("#gamesGrid");
const modal = document.querySelector("#emulatorModal");
const playerMount = document.querySelector("#playerMount");
const bgMusic = document.querySelector("#bgMusic");
let toastTimer = null;
let musicStarted = false;

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3400);
}

// Iniciar música de fundo após a primeira interação do usuário na página
function setupBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0.3; // Volume agradável de fundo (30%)

  const startMusic = () => {
    if (!musicStarted) {
      bgMusic.play().then(() => {
        musicStarted = true;
      }).catch(e => console.log("Aguardando interação para tocar música:", e));
    }
  };

  window.addEventListener("click", startMusic, { once: true });
  window.addEventListener("keydown", startMusic, { once: true });
}

function renderLibrary() {
  gamesGrid.replaceChildren();
  
  MY_GAMES.forEach((game, index) => {
    const card = document.createElement("article");
    card.className = "game-card";

    card.innerHTML = `
      <div>
        <div class="slot-topline">
          <span class="slot-number">SLOT ${String(index + 1).padStart(2, "0")}</span>
          <span class="slot-state"><i class="fa-solid fa-circle-check"></i> PRONTO</span>
        </div>

        <div class="game-media-container" data-id="${game.id}">
          <img class="game-cover" src="${game.coverUrl}" alt="Capa de ${game.title}" onerror="this.src='https://via.placeholder.com/300x160?text=Sem+Capa'">
          <video class="game-video" src="${game.videoUrl}" muted loop playsinline preload="auto"></video>
        </div>

        <h3 class="game-title">${game.title}</h3>
        <p class="game-subtitle">${game.description}</p>
      </div>

      <div class="game-actions">
        <button class="game-action play-btn" type="button" data-id="${game.id}">
          <i class="fa-solid fa-play"></i> JOGAR
        </button>
      </div>
    `;

    gamesGrid.appendChild(card);
  });

  document.querySelector("#libraryCount").innerHTML = `<i class="fa-solid fa-layer-group"></i> ${MY_GAMES.length} JOGOS`;

  // Adicionar eventos aos botões de jogar
  document.querySelectorAll(".play-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const gameId = Number(e.currentTarget.getAttribute("data-id"));
      const gameToPlay = MY_GAMES.find(g => g.id === gameId);
      if (gameToPlay) launchGame(gameToPlay);
    });
  });

  // Ativar miniplayer de vídeo ao passar o mouse
  document.querySelectorAll(".game-media-container").forEach(container => {
    const video = container.querySelector(".game-video");
    
    container.addEventListener("mouseenter", () => {
      if (video) {
        video.play().catch(error => {
          console.log("Reprodução automática bloqueada pelo navegador:", error);
        });
      }
    });

    container.addEventListener("mouseleave", () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  });
}

function createEmulatorDocument(romUrl) {
  const safeGameUrl = JSON.stringify(romUrl);
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body,#game{width:100%;height:100%;margin:0;padding:0;background:#000;overflow:hidden}
  body{font-family:Arial,sans-serif}
  #load-error{display:none;position:fixed;inset:0;place-items:center;padding:24px;text-align:center;background:#100f24;color:#fff;font:16px Arial,sans-serif}
</style>
</head>
<body>
  <div id="game"></div>
  <div id="load-error">Não foi possível carregar os arquivos do emulador ou a ROM. Verifique se o arquivo existe no repositório.</div>
  <script>
    window.EJS_player = "#game";
    window.EJS_core = "snes9x";
    window.EJS_gameUrl = ${safeGameUrl};
    window.EJS_pathtodata = ${JSON.stringify(EMULATOR_DATA)};
    window.EJS_mouse = false;
    window.EJS_multitap = false;
    var emulatorLoader = document.createElement("script");
    emulatorLoader.src = ${JSON.stringify(EMULATOR_DATA + "loader.js")};
    emulatorLoader.onerror = function() {
      document.getElementById("load-error").style.display = "grid";
    };
    document.body.appendChild(emulatorLoader);
  <\/script>
</body>
</html>`;
}

function launchGame(game) {
  // Pausa a música de fundo ao iniciar o jogo
  if (bgMusic) {
    bgMusic.pause();
  }

  document.querySelector("#emulatorTitle").textContent = game.title.toLocaleUpperCase("pt-BR");
  document.querySelector("#emulatorFileName").textContent = game.romUrl;
  modal.classList.remove("hidden");

  const frame = document.createElement("iframe");
  frame.title = `Emulador SNES — ${game.title}`;
  frame.allow = "autoplay; fullscreen; gamepad";
  frame.referrerPolicy = "no-referrer";
  frame.srcdoc = createEmulatorDocument(game.romUrl);
  playerMount.replaceChildren(frame);
  document.querySelector("#closeEmulatorBtn").focus();
}

function closeEmulator() {
  modal.classList.add("hidden");
  playerMount.replaceChildren();

  // Retoma a música de fundo ao fechar o emulador (se já havia iniciado)
  if (bgMusic && musicStarted) {
    bgMusic.play().catch(e => console.log("Erro ao retomar música:", e));
  }
}

document.querySelector("#closeEmulatorBtn").addEventListener("click", closeEmulator);
modal.addEventListener("click", event => {
  if (event.target === modal) closeEmulator();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) closeEmulator();
});

// Tema Claro/Escuro
function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme !== "light");
  document.querySelector("#themeIcon").className = `fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`;
  document.querySelector("#themeText").textContent = theme === "light" ? "TEMA ESCURO" : "TEMA CLARO";
  try { localStorage.setItem("devcourse-theme", theme); } catch (_) {}
}

document.querySelector("#themeToggle").addEventListener("click", () => {
  applyTheme(document.documentElement.classList.contains("light") ? "dark" : "light");
});

function initialize() {
  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("devcourse-theme") || "dark"; } catch (_) {}
  applyTheme(savedTheme);
  setupBackgroundMusic();
  renderLibrary();
}

initialize();