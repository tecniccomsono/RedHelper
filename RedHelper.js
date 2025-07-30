(() => {
  // se já existir, só foca e retorna
  if(document.querySelector('#iaTerm')) {
    document.querySelector('#iaTerm').style.display = 'block';
    return;
  }

  // cria estilo do terminal
  const style = document.createElement('style');
  style.textContent = `
    #iaTerm {
      position: fixed;
      top: 50px;
      left: 50px;
      width: 600px;
      height: 400px;
      background: rgba(54, 10, 10, 0.85);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      color: #ff6b6b;
      font-family: monospace;
      font-size: 14px;
      border: 2px solid #8b0000;
      border-radius: 12px;
      box-shadow: 0 0 25px rgba(139, 0, 0, 0.6), inset 0 0 20px rgba(139, 0, 0, 0.1);
      resize: both;
      overflow: hidden;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      user-select: text;
    }
    #iaTermHeader {
      background: rgba(139, 0, 0, 0.3);
      padding: 8px 12px;
      cursor: move;
      font-weight: bold;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #8b0000;
      border-radius: 10px 10px 0 0;
    }
    #iaTermHeaderTitle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff4444;
    }
    #iaTermMadeBy {
      font-size: 10px;
      color: #cc3333;
      font-style: italic;
      opacity: 0.8;
    }
    #iaTermClose {
      cursor: pointer;
      font-weight: bold;
      color: #ff4444;
      font-size: 18px;
      user-select: none;
      transition: color 0.3s;
    }
    #iaTermClose:hover {
      color: #ff6666;
    }
    #iaTermContent {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      white-space: pre-wrap;
      background: rgba(20, 5, 5, 0.4);
      border-bottom: 1px solid #8b0000;
      color: #ffaaaa;
    }
    #iaTermFooter {
      padding: 10px;
      display: flex;
      justify-content: center;
      border-top: 1px solid #8b0000;
      background: rgba(139, 0, 0, 0.2);
      border-radius: 0 0 10px 10px;
    }
    #iaTermBtn {
      background: rgba(139, 0, 0, 0.2);
      border: 2px solid #8b0000;
      color: #ff4444;
      font-weight: bold;
      padding: 8px 20px;
      cursor: pointer;
      border-radius: 8px;
      user-select: none;
      transition: all 0.3s;
      backdrop-filter: blur(5px);
    }
    #iaTermBtn:disabled {
      border-color: #444;
      color: #666;
      cursor: not-allowed;
      background: rgba(60, 60, 60, 0.3);
    }
    #iaTermBtn:not(:disabled):hover {
      background: rgba(139, 0, 0, 0.5);
      color: #ff6666;
      box-shadow: 0 0 10px rgba(139, 0, 0, 0.4);
    }
    #cooldownBar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b0000, #ff4444);
      border-radius: 0 0 10px 10px;
      width: 100%;
      transform-origin: left center;
      transform: scaleX(0);
      transition: transform linear;
      box-shadow: 0 0 8px rgba(139, 0, 0, 0.5);
    }
  `;
  document.head.appendChild(style);

  // cria estrutura do terminal
  const term = document.createElement('div');
  term.id = 'iaTerm';

  term.innerHTML = `
    <div id="iaTermHeader">
      <div id="iaTermHeaderTitle">
        RedHelper
        <span id="iaTermMadeBy">Made by RedRose</span>
      </div>
      <span id="iaTermClose" title="Fechar">×</span>
    </div>
    <div id="iaTermContent">Pronto para te ajudar em tudo! Só clicar abaixo!</div>
    <div id="iaTermFooter">
      <button id="iaTermBtn">Garantir Resposta</button>
    </div>
    <div id="cooldownBar"></div>
  `;
  document.body.appendChild(term);

  const content = term.querySelector('#iaTermContent');
  const btn = term.querySelector('#iaTermBtn');
  const cooldownBar = term.querySelector('#cooldownBar');
  const closeBtn = term.querySelector('#iaTermClose');

  // arrastar terminal
  let isDragging = false, dragOffsetX, dragOffsetY;

  term.querySelector('#iaTermHeader').addEventListener('mousedown', e => {
    isDragging = true;
    dragOffsetX = e.clientX - term.offsetLeft;
    dragOffsetY = e.clientY - term.offsetTop;
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;

    // limitar a tela
    x = Math.max(0, Math.min(window.innerWidth - term.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - term.offsetHeight, y));

    term.style.left = x + 'px';
    term.style.top = y + 'px';
  });

  // cooldown e animação barra
  let cooldown = false;
  function startCooldown() {
    cooldown = true;
    btn.disabled = true;
    cooldownBar.style.transition = 'none';
    cooldownBar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      cooldownBar.style.transition = 'transform 60s linear';
      cooldownBar.style.transform = 'scaleX(0)';
    }, 50);

    setTimeout(() => {
      cooldown = false;
      btn.disabled = false;
      cooldownBar.style.transform = 'scaleX(0)';
    }, 60_000);
  }

  // tua API key e função
  const apiKey = "AIzaSyBnj9ALfFUZ9IxqOo33eeGtJljClo6t3UE";

  async function enviarParaGemini(perguntas) {
    const prompt = perguntas
      .map((q, i) => `${i + 1}. ${q.titulo}: ${q.conteudo.join(" ")}`)
      .join("\n\n");

    const data = {
      contents: [
        {
          parts: [
            {
              text: `Você é uma IA que vai responder questões de tarefa. Responda de forma clara e numerada:

${prompt}`
            }
          ]
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "sem resposta da IA, fudeu";
        text = text.replace(/^Ok, aqui estão as respostas para as suas questões, organizadas e com as lacunas preenchidas:\s*/i, '');

        content.textContent = text;
        startCooldown();
      } else {
        content.textContent = `Erro na API: ${response.status}`;
        btn.disabled = false;
      }
    } catch (error) {
      content.textContent = `Erro na requisição: ${error.message}`;
      btn.disabled = false;
    }
  }

  // pega e separa as questões do container
  function pegarQuestoes() {
    const container = document.querySelector("#root > div.MuiBox-root.css-z0hhne > div.MuiBox-root.css-wkga9e > div > div.simplebar-wrapper > div.simplebar-mask > div > div > div > div.css-gsuwte");
    if (!container) {
      content.textContent = "Nada encontrado";
      return null;
    }

    const elementos = Array.from(container.querySelectorAll("*"));
    const textos = elementos.map(el => el.textContent.trim()).filter(txt => txt.length > 0);

    const questoes = [];
    let atual = null;

    for (const txt of textos) {
      if (/^q(uest(ã|a)o)?\s*\d+/i.test(txt)) {
        if (atual) questoes.push(atual);
        atual = { titulo: txt, conteudo: [] };
      } else if (atual) {
        atual.conteudo.push(txt);
      }
    }
    if (atual) questoes.push(atual);
    return questoes;
  }

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    content.textContent = 'Carregando resposta...';
    btn.disabled = true;
    const perguntas = pegarQuestoes();
    if (!perguntas) {
      content.textContent = 'Erro 223: Perguntas não encontradas!';
      btn.disabled = false;
      return;
    }
    enviarParaGemini(perguntas);
  });

})();
