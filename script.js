// ===== OBJETO ESTUDANTE (edite os dados aqui) =====
function dataRelativa(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

class Reuniao {
  constructor(id, titulo, data, horario, responsavel) {
    this.id = id;
    this.titulo = titulo;
    this.data = data;               // 'AAAA-MM-DD'
    this.horario = horario;         // 'HH:MM'
    this.responsavel = responsavel;
    this.presencaConfirmada = false;
  }
  dataFormatada() {
    const [a, m, d] = this.data.split('-');
    return `${d}/${m}`;
  }
  consultarInformacoes() {
    return `${this.titulo} - ${this.dataFormatada()} às ${this.horario}, com ${this.responsavel}.`;
  }
  // dias de calendário entre hoje e a reunião (0 = hoje, 1 = amanhã)
  diasAte() {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.round((new Date(`${this.data}T00:00:00`) - hoje) / 86400000);
  }
  // notifica de 1 dia antes até o dia da reunião, enquanto ela não começou
  deveNotificar() {
    const d = this.diasAte();
    return !this.presencaConfirmada && d >= 0 && d <= 1
      && new Date(`${this.data}T${this.horario}:00`) > new Date();
  }
}

class Estudante {
  constructor({ matricula, nome, email, acessibilidade, pendencia, reunioes }) {
    this.matricula = matricula;
    this.nome = nome;
    this.email = email;
    this.acessibilidade = acessibilidade;
    this.pendencia = pendencia;
    this.reunioes = reunioes;
  }
  consultarReunioes() {
    return [...this.reunioes].sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
  }
  filtrarReunioes(data, responsavel) {
    return this.consultarReunioes().filter(r =>
      (!data || r.data === data) && (!responsavel || r.responsavel === responsavel));
  }
  confirmarPresenca(reuniao) {
    reuniao.presencaConfirmada = true;
  }
  reunioesParaNotificar() {
    return this.consultarReunioes().filter(r => r.deveNotificar());
  }
}

const estudante = new Estudante({
  matricula: 123456,
  nome: 'Diego',
  email: 'diego.pereira@ges.inatel.br',
  acessibilidade: true,
  pendencia: false,
  reunioes: [
    new Reuniao(1, 'Atendimento de dúvidas de Cálculo', dataRelativa(0), '21:30', 'Monitor Lucas'),
    new Reuniao(2, 'Planejamento de projeto de IHM', dataRelativa(1), '13:30', 'Prof. Marcos'),
    new Reuniao(3, 'Aconselhamento acadêmico', dataRelativa(3), '17:30', 'Profa. Helena'),
    new Reuniao(4, 'Atendimento de dúvidas de Circuitos', dataRelativa(7), '08:00', 'Monitora Ana'),
    new Reuniao(5, 'Orientações da Iniciação Científica', dataRelativa(4), '19:30', 'Prof. Marcos')
  ]
});

function openMenu() {
  const menu = document.getElementById("menu_aba");
  menu.inert = false;
  menu.classList.add("aberto");
  document.getElementById("menu_overlay").style.display = "block";
  document.getElementById("menu").setAttribute("aria-expanded", "true");
  atualizarRolagem();
  menu.querySelector('.menu_bot').focus({ preventScroll: true });
}

function closeMenu() {
  const menu = document.getElementById("menu_aba");
  const estavaAberto = menu.classList.contains("aberto");
  menu.classList.remove("aberto");
  menu.inert = true;
  document.getElementById("menu_overlay").style.display = "none";
  document.getElementById("menu").setAttribute("aria-expanded", "false");
  atualizarRolagem();
  if (estavaAberto) document.getElementById("menu").focus({ preventScroll: true });
}

function atualizarRolagem() {
  const aberto = document.getElementById('menu_aba').classList.contains('aberto')
    || document.getElementById('reunioes').classList.contains('ativa');
  document.body.style.overflow = aberto ? 'hidden' : '';
}

document.addEventListener('keydown', event => {
  const menu = document.getElementById('menu_aba');
  if (!menu.classList.contains('aberto')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu();
  } else if (event.key === 'Tab') {
    const opcoes = [...menu.querySelectorAll('.menu_bot')];
    const atual = opcoes.indexOf(document.activeElement);
    event.preventDefault();
    const proximo = atual < 0 ? (event.shiftKey ? opcoes.length - 1 : 0)
      : (atual + (event.shiftKey ? -1 : 1) + opcoes.length) % opcoes.length;
    opcoes[proximo].focus();
  }
});

function aplicarTema(tema) {
  const ativo = ['inatel', 'lim', 'dark'].includes(tema) ? tema : 'inatel';
  document.documentElement.dataset.tema = ativo;
  document.querySelectorAll('[data-tema-opcao]').forEach(opcao => {
    opcao.setAttribute('aria-pressed', String(opcao.dataset.temaOpcao === ativo));
  });
}

function temaLim() { aplicarTema('lim'); }
function temaInatel() { aplicarTema('inatel'); }
function temaDark() { aplicarTema('dark'); }

aplicarTema(document.documentElement.dataset.tema);

const eventos = [
    {
        id: 1,
        title: 'Semana do Software 2025',
        date: '12/05',
        time: '10:00',
        location: 'Salão de Eventos',
        type: 'tech',
        description: 'Uma semana inteira dedicada à tecnologia e inovação, com palestras, workshops e hackathons.',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800&h=400'
    },
    {
        id: 2,
        title: 'Workshop de IoT',
        date: '12/01',
        time: '08:00',
        location: 'Laboratório CS&I',
        type: 'tech',
        description: 'Workshop prático sobre Internet das Coisas e suas aplicações na indústria 4.0.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&h=400'
    },
    {
        id: 3,
        title: 'Festa dos Alunos 2025',
        date: '18/05',
        time: '19:00',
        location: 'Área Esportiva',
        type: 'cultural',
        description: 'Venha comemorar a melhor Festa dos Alunos de todos os tempos!',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800&h=400'
    },
    {
        id: 4,
        title: 'Feira de Oportunidades',
        date: '04/05',
        time: '10:00',
        location: 'Salão de Eventos',
        type: 'academic',
        description: 'Venha conhecer empresas e projetos com destaque na área da engenharia.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=400'
    }
];

const carousel = document.querySelector('.carousel');

function createCards() {
    eventos.forEach(event => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${event.image}" alt="${event.title}">
            <div class="info">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><span class="material-symbols-outlined icon">event</span> ${event.date} às ${event.time} <span class="material-symbols-outlined icon">pin_drop</span> ${event.location}</p>
            </div>
        `;
        carousel.appendChild(card);
    });
}

let index = 0;
function nextCard() {
    index = (index + 1) % eventos.length;
    updateCarousel();
}

function prevCard() {
    index = (index - 1 + eventos.length) % eventos.length;
    updateCarousel();
}

function updateCarousel() {
    carousel.style.transform = `translateX(-${index * 100}%)`;
}

document.getElementById('nextBtn').addEventListener('click', nextCard);
document.getElementById('prevBtn').addEventListener('click', prevCard);

setInterval(nextCard, 5000);

let startX;
carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});
carousel.addEventListener('touchend', (e) => {
    let endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextCard();
    if (endX - startX > 50) prevCard();
});

createCards();

// Componente Aulas
class AulasComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); 
    this.aulas = [
      { id: 1, disciplina: 'S05 - Interface Homem-máquina', data: 'ter', horario: '10:00', local: 'P1-S17', prova_alert: false, prova: '12/05', frequencia: '10/25', nota: '10' },
      { id: 2, disciplina: 'E01 - Circuitos Elétricos em Corrente Contínua', data: 'ter', horario: '10:00', local: 'P1-S17', prova_alert: true, prova: '12/05', frequencia: '10/25', nota: '5' },
      { id: 3, disciplina: 'M02 - Álgebra e Geometria Analítica', data: 'ter', horario: '10:00', local: 'P1-S17', prova_alert: true, prova: '12/05', frequencia: '10/25', nota: '7' }
    ];
    this.hoje = "ter"; 
  }

  connectedCallback() {
    this.render(); 
  }

  render() {
    const aulasDia = this.aulas.filter(a => a.data === this.hoje); 
    this.shadowRoot.innerHTML = `
      <style>
      .comp-aula {
        position: relative;
        background-color: var(--cor-superficie);
        padding: 15px;
        margin: 20px;
        border-radius: 10px;
        box-shadow: var(--sombra-card);
      }
      .titulo_aula {
        font-family: "Arimo", sans-serif;
        font-weight: bold;
        font-size: 15px;
        color: var(--cor-text);
        padding: 0 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      p {
        font-family: "Arimo", sans-serif;
        font-size: 11px;
        color: var(--cor-text);
        line-height: 1.5;
        padding: 0 5px;
      }
      .lables { display: flex; }
      .lable-prova { background-color: var(--prova); padding: 7px 15px; margin-bottom: 10px; border-radius: 500px; text-align: center; }
      .lable-frequencia { background-color: var(--frequencia); padding: 7px 15px; margin-right: 10px; border-radius: 500px; }
      .lable-nota { background-color: var(--nota); padding: 7px 15px; margin-right: 10px; border-radius: 500px; }
      .lable-nota-vermelho { background-color: var(--cor-erro); padding: 7px 15px; margin-right: 10px; border-radius: 500px; }
      .lable-nota-laranja { background-color: var(--cor-aviso); padding: 7px 15px; margin-right: 10px; border-radius: 500px; }
      .lable-nota-verde { background-color: var(--cor-sucesso); padding: 7px 15px; margin-right: 10px; border-radius: 500px; }
      .p_lable { font-family: "Arimo", sans-serif; font-size: 11px; color: var(--cor-on-click); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .p_lable.lable-nota-vermelho { color: var(--cor-on-erro); }
      .p_lable.lable-nota-verde { color: var(--cor-on-sucesso); }
      .p_lable.lable-nota-laranja { color: var(--cor-on-aviso); }
      </style>
      <div>
        ${aulasDia.map(a => {
          let provaDisplay = a.prova_alert ? '' : 'display: none;';
          return `
            <div class="comp-aula">
              <div class="lable-prova p_lable" style="${provaDisplay}">PROVA: <b>${a.prova}</b></div>
              <div class="titulo_aula">${a.disciplina}</div>
              <p class="p">Local e Horário: <b>${a.local} - ${a.horario}</b></p>
              <div class="lables">
                <div class="lable-frequencia p_lable">FALTAS: <b>${a.frequencia}</b></div>
                <div class="lable-nota p_lable">CR: <b>${a.nota}</b></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}
customElements.define('aulas-component', AulasComponent);

// RESERVA ARMÁRIO

const armarios = [
  { id: 1, formato: "padrao", status: true, acessivel: false },
  { id: 2, formato: "padrao", status: true, acessivel: false },
  { id: 3, formato: "padrao", status: true, acessivel: false },
  { id: 4, formato: "padrao", status: false, acessivel: true },
  { id: 5, formato: "padrao", status: false, acessivel: true },
  { id: 6, formato: "duplo", status: true, acessivel: true },
  { id: 7, formato: "duplo", status: false, acessivel: true },
  { id: 8, formato: "duplo", status: false, acessivel: true },  
];

let tipoSelecionado = null;

document.querySelectorAll('.tipo').forEach(div => {
  div.addEventListener('click', () => {
    document.querySelectorAll('.tipo').forEach(d => d.classList.remove('selected'));
    div.classList.add('selected');
    tipoSelecionado = div.dataset.value;
  });
});

function reservarArmario() {
  const resultado = document.getElementById("resultado");
  const armarioNumero = document.getElementById("armarioNumero");

  if (!tipoSelecionado) {
    resultado.innerText = "Por favor, selecione um tipo de armário antes de reservar.";
    armarioNumero.style.display = "none";
    return;
  }

  let armariosDisponiveis = armarios.filter(a => 
    a.formato === tipoSelecionado && a.status === true && estudante.acessibilidade === a.acessivel
  );

  if (armariosDisponiveis.length === 0) {
    resultado.innerText = `Olá, ${estudante.nome}! Nenhum armário disponível para o tipo selecionado.`;
    armarioNumero.style.display = "none";
    return;
  }

  let armarioSorteado = armariosDisponiveis[Math.floor(Math.random() * armariosDisponiveis.length)];
  let armarioEmprestado = armarios.find(armario => armario.id === armarioSorteado.id);
  armarioEmprestado.status = false;

  let dataReserva = new Date();
  armarioEmprestado.dataReserva = dataReserva.toLocaleString("pt-BR");

  let dataEntrega = new Date(dataReserva.getTime() + 24 * 60 * 60 * 1000);
  armarioEmprestado.dataEntrega = dataEntrega.toLocaleString("pt-BR");

  estudante.pendencia = true;

  armarioNumero.innerText = `Armário Nº ${armarioEmprestado.id}`;
  armarioNumero.style.display = "block";

  resultado.innerText = 
    `Data da reserva: ${armarioEmprestado.dataReserva}\n` +
    `Data de entrega: ${armarioEmprestado.dataEntrega}`;
}

// ===== REUNIÕES MARCADAS =====
let reuniaoSelecionada = null;

// Tarefa 1: acessar a seção de reuniões
function abrirReunioes() {
  document.getElementById('reunioes').classList.add('ativa');
  atualizarRolagem();
  renderReunioes();
}
function fecharReunioes() {
  document.getElementById('reunioes').classList.remove('ativa');
  atualizarRolagem();
  atualizarNotificacao();
}

// Tarefa 2 e 2.1: consultar e filtrar
function renderReunioes() {
  const data = document.getElementById('filtroData').value;
  const resp = document.getElementById('filtroResp').value;
  const lista = document.getElementById('listaReunioes');
  const itens = estudante.filtrarReunioes(data, resp);

  if (itens.length === 0) {
    lista.innerHTML = '<p class="reu_vazio">Nenhuma reunião encontrada. Limpe os filtros para ver todas.</p>';
    return;
  }
  lista.innerHTML = itens.map(r => {
    const sel = r === reuniaoSelecionada;
    return `
      <div class="reu_card ${sel ? 'aberta' : ''} ${r.presencaConfirmada ? 'confirmada' : ''}" data-id="${r.id}">
        <div class="reu_resumo">
          <div class="reu_data"><b>${r.dataFormatada()}</b><span>${r.horario}</span></div>
          <div class="reu_txt">
            <div class="reu_titulo">${r.titulo}</div>
            <p>${r.responsavel}</p>
          </div>
          ${r.presencaConfirmada ? '<span class="material-symbols-outlined icoG">check_circle</span>' : ''}
        </div>
        ${sel ? `
          <div class="reu_detalhe">
            <p>${r.consultarInformacoes()}</p>
            ${r.presencaConfirmada
              ? '<div class="reu_ok">Presença confirmada</div>'
              : `<div class="reu_btn" onclick="confirmar(${r.id}, event)">Confirmar presença</div>`}
          </div>` : ''}
      </div>`;
  }).join('');
}

// Tarefa 2.2 e 3: selecionar a reunião e analisar as informações
document.getElementById('listaReunioes').addEventListener('click', e => {
  const card = e.target.closest('.reu_card');
  if (!card || e.target.closest('.reu_btn')) return;
  const r = estudante.reunioes.find(x => x.id === Number(card.dataset.id));
  reuniaoSelecionada = (reuniaoSelecionada === r) ? null : r;
  renderReunioes();
});

// Tarefa 4: confirmar presença
function confirmar(id, e) {
  e.stopPropagation();
  const r = estudante.reunioes.find(x => x.id === id);
  estudante.confirmarPresenca(r);
  renderReunioes();
  const t = document.getElementById('toast');
  t.innerText = `Presença confirmada: ${r.titulo}, ${r.dataFormatada()} às ${r.horario}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function limparFiltros() {
  document.getElementById('filtroData').value = '';
  document.getElementById('filtroResp').value = '';
  renderReunioes();
}

// Notificação na tela inicial: reuniões de hoje e de amanhã
function atualizarNotificacao() {
  document.getElementById('mns_reunioes').innerHTML = estudante.reunioesParaNotificar().map(r => `
    <div class="mns_box" onclick="abrirReunioes()" style="cursor:pointer">
      <div class="icon"><span class="material-symbols-outlined icoP">groups</span></div>
      <div class="mns font">Reunião ${r.diasAte() === 0 ? 'hoje' : 'amanhã'} às ${r.horario}: ${r.titulo}, com ${r.responsavel}...</div>
    </div>`).join('');
}

(function iniciarReunioes() {
  document.getElementById('user_name').innerText = `Olá ${estudante.nome}!`;
  const sel = document.getElementById('filtroResp');
  [...new Set(estudante.reunioes.map(r => r.responsavel))].forEach(n => {
    const o = document.createElement('option');
    o.value = n; o.textContent = n;
    sel.appendChild(o);
  });
  document.getElementById('filtroData').addEventListener('change', renderReunioes);
  sel.addEventListener('change', renderReunioes);
  atualizarNotificacao();
  setInterval(atualizarNotificacao, 60000);
})();
