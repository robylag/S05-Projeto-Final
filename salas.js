// Protótipo local: salas e ocupações ilustrativas, sem vínculo com um sistema institucional.
const salasEstudo = [1, 2, 3, 4].map((id) => new Sala(id));
const chaveReservasLegada = 'inatel.salas.reservas.v1';
const chaveReservas = `inatel.salas.reservas.v2.${estudante.matricula}`;
const minuto = 60000;
let armazenamentoDisponivel = true;
let consultaAtual = null;
let modoAgora = true;
let salaSelecionada = null;
let origemSalas;
const avisosEmitidos = new Set();
let timerAviso;
const campo = (id) => document.getElementById(id);
const iconeSala = (nome) =>
  `<span class="material-symbols-outlined" aria-hidden="true">${nome}</span>`;
const horaSala = (valor) =>
  new Date(valor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const diaSala = (valor) => new Date(valor).toLocaleDateString('pt-BR');
const dataLocalSala = (valor) => {
  const d = new Date(valor);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function reservaValida(r) {
  return (
    r &&
    (typeof r.id === 'string' || (Number.isSafeInteger(r.id) && r.id > 0)) &&
    salasEstudo.some((s) => s.id === r.sala) &&
    (r.matricula === undefined || r.matricula === estudante.matricula) &&
    Number.isFinite(r.inicio) &&
    Number.isFinite(r.fim) &&
    r.fim > r.inicio &&
    dataLocalSala(r.inicio) === dataLocalSala(r.fim)
  );
}
function carregarReservas() {
  if (!armazenamentoDisponivel) return estudante.reservas;
  try {
    const salvo = localStorage.getItem(chaveReservas);
    const dados = JSON.parse(salvo ?? localStorage.getItem(chaveReservasLegada) ?? '[]');
    if (Array.isArray(dados)) {
      const validos = dados.filter(reservaValida);
      let proximoId = Math.max(0, ...validos.map((r) => (Number.isSafeInteger(r.id) ? r.id : 0)));
      const usados = new Set();
      estudante.reservas = validos.map((r) => {
        const id = Number.isSafeInteger(r.id) && !usados.has(r.id) ? r.id : ++proximoId;
        usados.add(id);
        return new Reserva(
          id,
          salasEstudo.find((s) => s.id === r.sala),
          r.inicio,
          r.fim,
          estudante
        );
      });
      if (salvo === null) salvarReservas();
    }
  } catch {
    /* Mantém a sessão caso o armazenamento esteja indisponível. */
  }
  return estudante.reservas;
}
function salvarReservas() {
  try {
    localStorage.setItem(chaveReservas, JSON.stringify(estudante.reservas));
    return true;
  } catch {
    armazenamentoDisponivel = false;
    return false;
  }
}
// A agenda de demonstração é estável durante esta sessão. Não são horários oficiais.
const ocupacoesDemo = [0, 1].flatMap((dias) => {
  const data = dataRelativa(dias);
  return [
    [1, '10:00', '11:00'],
    [2, '09:00', '12:00'],
    [2, '14:00', '16:00'],
    [3, '10:30', '11:30'],
  ].map(([sala, inicio, fim]) => ({
    sala,
    inicio: +new Date(`${data}T${inicio}`),
    fim: +new Date(`${data}T${fim}`),
  }));
});
function sobrepoe(a, b) {
  return a.inicio < b.fim && a.fim > b.inicio;
}
function agendaSala(id) {
  return [...ocupacoesDemo, ...estudante.reservas]
    .filter((r) => r.sala === id)
    .sort((a, b) => a.inicio - b.inicio);
}
function proximoPeriodo(id, periodo) {
  const inicio = salasEstudo
    .find((s) => s.id === id)
    .consultarProximoHorarioLivre(periodo.inicio, periodo.fim);
  return inicio ? { inicio: +inicio, fim: +inicio + periodo.fim - periodo.inicio } : null;
}
function lerPeriodo() {
  const data = campo('salaData').value;
  const inicio = +new Date(`${data}T${campo('salaInicio').value}`);
  const fim = +new Date(`${data}T${campo('salaFim').value}`);
  if (!Number.isFinite(inicio) || !Number.isFinite(fim))
    throw Error('Preencha a data, o início e o término.');
  if (inicio < Date.now()) throw Error('Escolha um horário de início no futuro.');
  if (fim <= inicio) throw Error('O término deve ser depois do início, no mesmo dia.');
  return validarPeriodoSala(inicio, fim);
}
function abrirSalas() {
  origemSalas = document.activeElement;
  campo('dashboard').hidden = true;
  campo('head').hidden = true;
  campo('salas').hidden = false;
  campo('salasTitulo').focus({ preventScroll: true });
  window.scrollTo(0, 0);
  carregarReservas();
  atualizarReservas();
  renderSalas();
}
function fecharSalas() {
  campo('salas').hidden = true;
  campo('dashboard').hidden = false;
  campo('head').hidden = false;
  if (origemSalas && origemSalas.isConnected && !origemSalas.closest('[inert]'))
    origemSalas.focus({ preventScroll: true });
  else campo('menu').focus({ preventScroll: true });
}
function consultarSalas(event) {
  if (event) event.preventDefault();
  modoAgora = false;
  campo('erroSalas').textContent = '';
  try {
    consultaAtual = lerPeriodo();
    carregarReservas();
    renderSalas();
  } catch (e) {
    consultaAtual = null;
    campo('erroSalas').textContent = e.message;
    campo('listaSalas').replaceChildren();
    campo('contagemSalas').textContent = '';
    campo('periodoSalas').textContent = 'Ajuste o período para consultar novamente.';
  }
}
function renderSalas() {
  if (modoAgora) {
    renderSalasAgora();
    return;
  }
  if (!consultaAtual) return;
  const p = consultaAtual;
  const disponiveis = estudante.filtrarSalas(
    dataLocalSala(p.inicio),
    horaSala(p.inicio),
    horaSala(p.fim)
  );
  let livres = 0;
  campo('periodoSalas').textContent =
    `${diaSala(p.inicio)} · ${horaSala(p.inicio)} às ${horaSala(p.fim)}`;
  campo('listaSalas').innerHTML = estudante
    .consultarSalas()
    .map((sala) => {
      const conflitos = agendaSala(sala.id).filter((r) => sobrepoe(r, p));
      const livre = disponiveis.includes(sala);
      if (livre) livres++;
      const proximo = livre ? null : proximoPeriodo(sala.id, p);
      return `<article class="sala-item ${livre ? 'disponivel' : 'ocupada'} ${sala.id === salaSelecionada ? 'selecionada' : ''}">
      <div class="sala-identidade">${iconeSala('meeting_room')}<h3>${sala.nome}</h3><span class="estado-sala">${livre ? 'Disponível' : 'Indisponível'}</span></div>
      <p>${livre ? 'Livre durante todo o período selecionado.' : conflitos.map((r) => `Reservada das ${horaSala(r.inicio)} às ${horaSala(r.fim)}.`).join('<br>')}</p>
      ${
        livre
          ? `<button class="acao-primaria" data-reservar="${sala.id}">Reservar ${sala.nome}</button>`
          : `<p class="liberacao">${proximo ? `Próximo período livre: ${horaSala(proximo.inicio)} às ${horaSala(proximo.fim)}.` : 'Não há outro período com essa duração hoje.'}</p>
        ${proximo ? `<button class="acao-secundaria" data-sugerir="${sala.id}">Consultar às ${horaSala(proximo.inicio)}</button>` : ''}`
      }
    </article>`;
    })
    .join('');
  campo('contagemSalas').textContent = `${livres} de ${salasEstudo.length} livres`;
}
function renderSalasAgora() {
  const agora = Date.now();
  let livres = 0;
  campo('periodoSalas').textContent =
    `Hoje, ${diaSala(agora)} · disponibilidade agora, às ${horaSala(agora)}. Escolha um período para reservar.`;
  const html = estudante
    .consultarSalas()
    .map((sala) => {
      const agenda = agendaSala(sala.id);
      const ocupacao = agenda.find((r) => r.inicio <= agora && r.fim > agora);
      const livre = !sala.ocupado;
      if (livre) livres++;
      let liberacao = ocupacao?.fim;
      if (ocupacao) {
        for (const r of agenda) if (r.inicio <= liberacao && r.fim > liberacao) liberacao = r.fim;
      }
      const proxima = agenda.find(
        (r) => r.inicio > agora && dataLocalSala(r.inicio) === dataLocalSala(agora)
      );
      return `<article class="sala-item ${livre ? 'disponivel' : 'ocupada'} ${sala.id === salaSelecionada ? 'selecionada' : ''}">
      <div class="sala-identidade">${iconeSala('meeting_room')}<h3>${sala.nome}</h3><span class="estado-sala">${livre ? 'Disponível agora' : 'Ocupada agora'}</span></div>
      <p>${livre ? (proxima ? `Livre agora. Próxima reserva às ${horaSala(proxima.inicio)}.` : 'Livre agora, sem outras reservas para hoje.') : `Ocupada até ${horaSala(liberacao)}.`}</p>
      <button class="acao-secundaria" data-definir-periodo="${sala.id}">Escolher horário</button>
    </article>`;
    })
    .join('');
  if (campo('listaSalas').innerHTML !== html) campo('listaSalas').innerHTML = html;
  campo('contagemSalas').textContent = `${livres} de ${salasEstudo.length} livres`;
}
function verSalasAgora() {
  modoAgora = true;
  consultaAtual = null;
  campo('erroSalas').textContent = '';
  carregarReservas();
  salaSelecionada = null;
  campo('salaEscolhida').hidden = true;
  preencherPeriodoSugerido();
  renderSalasAgora();
}
function efetivarReserva(id) {
  campo('erroSalas').textContent = '';
  if (!consultaAtual || !salasEstudo.some((s) => s.id === id)) return;
  carregarReservas();
  const periodo = consultaAtual;
  const sala = salasEstudo.find((s) => s.id === id);
  let reserva;
  try {
    reserva = estudante.reservarSala(sala, periodo.inicio, periodo.fim);
  } catch (e) {
    campo('erroSalas').textContent = e.message;
    campo('erroSalas').scrollIntoView({ block: 'center' });
    renderSalas();
    return;
  }
  const persistiu = salvarReservas();
  campo('resumoConfirmacao').textContent = reserva.consultarInformacoes();
  campo('persistenciaReserva').textContent = persistiu
    ? 'Sua reserva está em Minhas reservas.'
    : 'Reserva válida nesta sessão. O navegador não permitiu salvá-la para depois.';
  campo('reservaConfirmada').showModal();
  atualizarRolagem();
  atualizarReservas(false);
  renderSalas();
}
function estadoAviso(r, agora = Date.now()) {
  if (r.deveNotificarInicio(agora)) return 'inicio';
  if (r.deveNotificarTermino(agora)) return 'fim';
  return null;
}
function textoAviso(r, tipo, agora) {
  const nome = salasEstudo.find((s) => s.id === r.sala).nome;
  const minutos = Math.ceil(((tipo === 'inicio' ? r.inicio : r.fim) - agora) / minuto);
  return tipo === 'inicio'
    ? `${nome}: sua reserva começa em ${minutos} min, às ${horaSala(r.inicio)}.`
    : `${nome}: restam ${minutos} min. Libere a sala até ${horaSala(r.fim)}.`;
}
function atualizarReservas(emitir = true) {
  const agora = Date.now();
  const ativas = estudante.reservas
    .filter((r) => r.fim > agora)
    .sort((a, b) => a.inicio - b.inicio);
  const avisos = [];
  const novos = [];
  campo('minhasReservas').innerHTML = ativas.length
    ? ativas
        .map((r) => {
          const tipo = estadoAviso(r, agora);
          const texto = tipo ? textoAviso(r, tipo, agora) : '';
          if (tipo) {
            avisos.push(
              `<button class="aviso-reserva" onclick="abrirSalas()">${iconeSala(tipo === 'fim' ? 'timer' : 'notifications_active')}<span>${texto}</span></button>`
            );
            const chave = `${r.id}:${tipo}`;
            if (emitir && !avisosEmitidos.has(chave)) {
              novos.push(texto);
              avisosEmitidos.add(chave);
            }
          }
          return `<article class="minha-reserva">${iconeSala('event_available')}<div><h3>${salasEstudo.find((s) => s.id === r.sala).nome}</h3><p>${diaSala(r.inicio)} · ${horaSala(r.inicio)} às ${horaSala(r.fim)}</p><strong>${agora >= r.inicio ? 'Em andamento' : 'Reserva confirmada'}</strong>${texto ? `<p class="lembrete">${texto}</p>` : ''}</div></article>`;
        })
        .join('')
    : '<p class="estado-vazio">Você ainda não tem reservas futuras ou em andamento.</p>';
  const html = avisos.join('');
  if (campo('avisosReservas').innerHTML !== html) campo('avisosReservas').innerHTML = html;
  if (novos.length) {
    campo('avisoReservaToast').textContent = novos.join(' ');
    campo('avisoReservaToast').hidden = false;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => {
      campo('avisoReservaToast').hidden = true;
    }, 9000);
  }
  campo('salaData').min = dataLocalSala(agora);
}
campo('consultaSalas').addEventListener('submit', consultarSalas);
campo('consultaSalas').addEventListener('input', () => {
  modoAgora = false;
  consultaAtual = null;
  campo('listaSalas').replaceChildren();
  campo('contagemSalas').textContent = '';
  campo('erroSalas').textContent = '';
  campo('periodoSalas').textContent = 'Consulte o novo período para atualizar a disponibilidade.';
});
campo('listaSalas').addEventListener('click', (event) => {
  const botao = event.target.closest('button');
  if (!botao) return;
  if (botao.dataset.definirPeriodo) {
    abrirHorarios(Number(botao.dataset.definirPeriodo));
  }
  if (botao.dataset.reservar) reservarSala(Number(botao.dataset.reservar));
  if (botao.dataset.sugerir && consultaAtual) {
    const novo = proximoPeriodo(Number(botao.dataset.sugerir), consultaAtual);
    if (!novo) return;
    campo('salaInicio').value = horaSala(novo.inicio);
    campo('salaFim').value = horaSala(novo.fim);
    consultarSalas();
  }
});
campo('reservaConfirmada').addEventListener('close', () => {
  atualizarRolagem();
  campo('minhasReservasTitulo').tabIndex = -1;
  campo('minhasReservasTitulo').focus();
  atualizarReservas();
});
window.addEventListener('storage', (event) => {
  if (event.key === chaveReservas || event.key === null) {
    carregarReservas();
    atualizarReservas();
    renderSalas();
  }
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    carregarReservas();
    atualizarReservas();
    renderSalas();
  }
});
carregarReservas();
function preencherPeriodoSugerido(id = null) {
  let inicio = Math.ceil((Date.now() + 1000) / minuto) * minuto;
  let fim = inicio + 60 * minuto;
  if (dataLocalSala(inicio) !== dataLocalSala(fim)) {
    fim = +new Date(`${dataLocalSala(inicio)}T23:59`);
    if (fim <= inicio) {
      const amanha = new Date(inicio);
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(0, 0, 0, 0);
      inicio = +amanha;
      fim = inicio + 60 * minuto;
    }
  }
  if (id) {
    const proximo = proximoPeriodo(id, { inicio, fim });
    if (proximo) {
      inicio = proximo.inicio;
      fim = proximo.fim;
    }
  }
  campo('salaData').value = dataLocalSala(inicio);
  campo('salaInicio').value = horaSala(inicio);
  campo('salaFim').value = horaSala(fim);
}
preencherPeriodoSugerido();
atualizarReservas();
setInterval(() => {
  atualizarReservas();
  if (modoAgora && !campo('salas').hidden) renderSalasAgora();
}, 15000);

let salaHorarios = null;
function abrirHorarios(id) {
  salaHorarios = salasEstudo.find((s) => s.id === id);
  campo('tituloHorarios').textContent = 'Horários da ' + salaHorarios.nome;
  campo('dataHorarios').min = dataLocalSala(Date.now());
  campo('dataHorarios').value = modoAgora ? dataLocalSala(Date.now()) : campo('salaData').value;
  listarHorarios();
  campo('modalHorarios').showModal();
  atualizarRolagem();
}
function listarHorarios() {
  carregarReservas();
  const data = campo('dataHorarios').value;
  const duracao = Number(campo('duracaoHorarios').value) * minuto;
  let botoes = '';
  for (let m = 0; m < 1440; m += 30) {
    const inicio = +new Date(
      data +
        'T' +
        String(Math.floor(m / 60)).padStart(2, '0') +
        ':' +
        String(m % 60).padStart(2, '0')
    );
    const fim = inicio + duracao;
    if (
      inicio <= Date.now() ||
      dataLocalSala(fim) !== data ||
      !salaHorarios.verificarDisponibilidade(inicio, fim) ||
      estudante.reservas.some((r) => sobrepoe(r, { inicio, fim }))
    )
      continue;
    botoes +=
      '<button class="acao-secundaria" data-slot="' +
      inicio +
      '" data-fim="' +
      fim +
      '">' +
      horaSala(inicio) +
      ' às ' +
      horaSala(fim) +
      '</button>';
  }
  campo('listaHorarios').innerHTML =
    botoes || '<p>Nenhum horário disponível para essa data e duração. Escolha outro período.</p>';
}
campo('dataHorarios').addEventListener('change', listarHorarios);
campo('modalHorarios').addEventListener('close', atualizarRolagem);
campo('duracaoHorarios').addEventListener('change', listarHorarios);
campo('listaHorarios').addEventListener('click', (e) => {
  const b = e.target.closest('[data-slot]');
  if (!b) return;
  consultaAtual = { inicio: Number(b.dataset.slot), fim: Number(b.dataset.fim) };
  modoAgora = false;
  salaSelecionada = salaHorarios.id;
  campo('salaData').value = dataLocalSala(consultaAtual.inicio);
  campo('salaInicio').value = horaSala(consultaAtual.inicio);
  campo('salaFim').value = horaSala(consultaAtual.fim);
  campo('modalHorarios').close();
  reservarSala(salaHorarios.id);
});

let reservaPendente = null;
function reservarSala(id) {
  const sala = salasEstudo.find((s) => s.id === id);
  if (!sala || !consultaAtual) return;
  reservaPendente = { id, ...consultaAtual };
  campo('resumoRevisao').textContent =
    sala.nome +
    ' · ' +
    diaSala(consultaAtual.inicio) +
    ' · ' +
    horaSala(consultaAtual.inicio) +
    ' às ' +
    horaSala(consultaAtual.fim);
  campo('revisarReserva').showModal();
  atualizarRolagem();
}
campo('cancelarReserva').addEventListener('click', () => campo('revisarReserva').close());
campo('revisarReserva').addEventListener('close', () => {
  reservaPendente = null;
  atualizarRolagem();
});
campo('confirmarReserva').addEventListener('click', () => {
  const pendente = reservaPendente;
  if (!pendente) return;
  reservaPendente = null;
  consultaAtual = { inicio: pendente.inicio, fim: pendente.fim };
  campo('revisarReserva').close();
  efetivarReserva(pendente.id);
});
