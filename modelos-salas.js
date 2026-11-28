// Entidades do diagrama da documentação. Datas são armazenadas como timestamps.
function validarPeriodoSala(inicio, termino) {
  const periodo = { inicio: +inicio, fim: +termino };
  if (!Number.isFinite(periodo.inicio) || !Number.isFinite(periodo.fim)) {
    throw Error('Preencha a data, o início e o término.');
  }
  if (
    periodo.fim <= periodo.inicio ||
    dataLocalSala(periodo.inicio) !== dataLocalSala(periodo.fim)
  ) {
    throw Error('O término deve ser depois do início, no mesmo dia.');
  }
  return periodo;
}

class Sala {
  constructor(id) {
    this.id = id;
    this.nome = `Sala ${String(id).padStart(2, '0')}`;
  }
  // Estado atual derivado da agenda; não substitui a consulta de um período.
  get ocupado() {
    const agora = Date.now();
    return agendaSala(this.id).some((r) => r.inicio <= agora && agora < r.fim);
  }
  verificarDisponibilidade(inicio, termino) {
    const periodo = validarPeriodoSala(inicio, termino);
    return !agendaSala(this.id).some((r) => sobrepoe(r, periodo));
  }
  consultarProximoHorarioLivre(inicio, termino) {
    const periodo = validarPeriodoSala(inicio, termino);
    const duracao = periodo.fim - periodo.inicio;
    let proximo = periodo.inicio;
    for (const r of agendaSala(this.id)) {
      if (sobrepoe({ inicio: proximo, fim: proximo + duracao }, r)) proximo = r.fim;
    }
    return dataLocalSala(proximo + duracao) === dataLocalSala(periodo.inicio)
      ? new Date(proximo)
      : null;
  }
}

class Reserva {
  constructor(id, sala, inicio, termino, estudante) {
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !(sala instanceof Sala) ||
      !(estudante instanceof Estudante)
    ) {
      throw Error('A reserva deve possuir identificador, sala e estudante válidos.');
    }
    const periodo = validarPeriodoSala(inicio, termino);
    this.id = id;
    this.inicio = periodo.inicio;
    this.fim = periodo.fim;
    this.salaAssociada = sala;
    this.estudante = estudante;
  }
  get sala() {
    return this.salaAssociada.id;
  }
  consultarInformacoes() {
    return `${this.salaAssociada.nome} · ${diaSala(this.inicio)} · ${horaSala(this.inicio)} às ${horaSala(this.fim)}.`;
  }
  deveNotificarInicio(agora = Date.now()) {
    return +agora < this.inicio && this.inicio - agora <= 60 * 60000;
  }
  deveNotificarTermino(agora = Date.now()) {
    return +agora >= this.inicio && +agora < this.fim && this.fim - agora <= 10 * 60000;
  }
  // As referências de objetos são reconstruídas ao ler o armazenamento.
  toJSON() {
    return {
      id: this.id,
      sala: this.sala,
      inicio: this.inicio,
      fim: this.fim,
      matricula: this.estudante.matricula,
    };
  }
}
