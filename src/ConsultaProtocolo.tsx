import { useState } from "react";
import "./ConsultaProtocolo.css";

interface ConsultaProtocoloProps {
  voltar: () => void;
}

interface Solicitacao {
  protocolo: string;
  categoria: string;
  descricao: string;
  fotos?: string[];
  rua: string;
  numero?: string;
  bairro: string;
  cidade: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  criado_em: string;
}

function ConsultaProtocolo({
  voltar,
}: ConsultaProtocoloProps) {
  const [protocoloConsulta, setProtocoloConsulta] =
    useState("");

  const [consulta, setConsulta] =
    useState<Solicitacao | null>(null);

  const [erroConsulta, setErroConsulta] =
    useState("");

  const [consultando, setConsultando] =
    useState(false);

  const statusTexto = (status: string) => {
    switch (status) {
      case "RECEBIDO":
        return "Recebido";

      case "EM_ANALISE":
        return "Em análise";

      case "EM_ATENDIMENTO":
        return "Em atendimento";

      case "RESOLVIDO":
        return "Resolvido";

      case "RECUSADO":
        return "Recusado";

      default:
        return status;
    }
  };

  const consultarProtocolo = async () => {
    const protocoloLimpo =
      protocoloConsulta.trim();

    if (!protocoloLimpo) {
      setErroConsulta(
        "Digite um protocolo."
      );
      return;
    }

    try {
      setConsultando(true);
      setErroConsulta("");
      setConsulta(null);

      const response = await fetch(
        `http://localhost:3001/api/solicitacoes/${encodeURIComponent(
          protocoloLimpo
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensagem ||
            "Protocolo não encontrado."
        );
      }

      // O backend retorna a solicitação diretamente
      setConsulta(data);

    } catch (error) {
      console.error(
        "Erro ao consultar protocolo:",
        error
      );

      setErroConsulta(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o protocolo."
      );
    } finally {
      setConsultando(false);
    }
  };

  const pressionarEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      consultarProtocolo();
    }
  };

  const formatarData = (data: string) => {
    if (!data) return "";

    try {
      return new Date(
        data.replace(" ", "T") + "Z"
      ).toLocaleString("pt-BR");
    } catch {
      return data;
    }
  };

  return (
    <div className="consulta-pagina">

      {/* CABEÇALHO */}
      <header className="consulta-topo">
        <button
          className="consulta-voltar"
          onClick={voltar}
        >
          ← Registrar problema
        </button>
      </header>

      {/* CONTEÚDO */}
      <main className="consulta-container">

        {/* TÍTULO */}
        <div className="consulta-header">

          <div className="consulta-icone">
            🔎
          </div>

          <div>
            <h1>
              Consultar protocolo
            </h1>

            <p>
              Acompanhe o andamento da
              sua solicitação.
            </p>
          </div>

        </div>

        {/* BUSCA */}
        <div className="consulta-card busca-card">

          <h2>
            Informe seu protocolo
          </h2>

          <label>
            Número do protocolo
          </label>

          <div className="consulta-busca">

            <input
              type="text"
              placeholder="Ex.: PB-2026-000001"
              value={protocoloConsulta}
              onChange={(event) =>
                setProtocoloConsulta(
                  event.target.value
                )
              }
              onKeyDown={
                pressionarEnter
              }
            />

            <button
              className="botao-consultar"
              onClick={
                consultarProtocolo
              }
              disabled={consultando}
            >
              {consultando
                ? "Consultando..."
                : "Consultar"}
            </button>

          </div>

          {erroConsulta && (
            <div className="consulta-erro">
              ⚠️ {erroConsulta}
            </div>
          )}

        </div>

        {/* RESULTADO */}
        {consulta && (
          <div className="consulta-resultado">

            {/* PROTOCOLO E STATUS */}
<div
  className="protocolo-destaque"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  }}
>
  <div>
    <span
      style={{
        display: "block",
        color: "#6b7280",
        fontSize: "14px",
        marginBottom: "6px",
      }}
    >
      Protocolo
    </span>

    <strong
      style={{
        display: "block",
        fontSize: "25px",
        color: "#111827",
      }}
    >
      {consulta.protocolo}
    </strong>
  </div>

  <div
    className={`status-badge ${
      consulta.status === "RECEBIDO"
        ? "status-recebido"
        : consulta.status === "EM_ANALISE"
        ? "status-analise"
        : consulta.status === "EM_ATENDIMENTO"
        ? "status-atendimento"
        : consulta.status === "RESOLVIDO"
        ? "status-resolvido"
        : "status-recusado"
    }`}
  >
    {statusTexto(consulta.status)}
  </div>
</div>

            {/* ANDAMENTO */}
            <div className="consulta-card">

              <h2>
                📋 Andamento da solicitação
              </h2>

              <div className="linha-status">

                {/* RECEBIDO */}
                <div className="status-etapa-wrapper">

                  <div
                    className={`etapa-status ${
                      [
                        "RECEBIDO",
                        "EM_ANALISE",
                        "EM_ATENDIMENTO",
                        "RESOLVIDO",
                      ].includes(
                        consulta.status
                      )
                        ? "ativa"
                        : ""
                    }`}
                  >
                    <div className="bolinha">
                      ✓
                    </div>

                    <span>
                      Recebido
                    </span>
                  </div>

                </div>

                <div
                  className={`linha ${
                    [
                      "EM_ANALISE",
                      "EM_ATENDIMENTO",
                      "RESOLVIDO",
                    ].includes(
                      consulta.status
                    )
                      ? "linha-ativa"
                      : ""
                  }`}
                />

                {/* ANÁLISE */}
                <div className="status-etapa-wrapper">

                  <div
                    className={`etapa-status ${
                      [
                        "EM_ANALISE",
                        "EM_ATENDIMENTO",
                        "RESOLVIDO",
                      ].includes(
                        consulta.status
                      )
                        ? "ativa"
                        : ""
                    }`}
                  >
                    <div className="bolinha">
                      2
                    </div>

                    <span>
                      Em análise
                    </span>
                  </div>

                </div>

                <div
                  className={`linha ${
                    [
                      "EM_ATENDIMENTO",
                      "RESOLVIDO",
                    ].includes(
                      consulta.status
                    )
                      ? "linha-ativa"
                      : ""
                  }`}
                />

                {/* ATENDIMENTO */}
                <div className="status-etapa-wrapper">

                  <div
                    className={`etapa-status ${
                      [
                        "EM_ATENDIMENTO",
                        "RESOLVIDO",
                      ].includes(
                        consulta.status
                      )
                        ? "ativa"
                        : ""
                    }`}
                  >
                    <div className="bolinha">
                      3
                    </div>

                    <span>
                      Atendimento
                    </span>
                  </div>

                </div>

                <div
                  className={`linha ${
                    consulta.status ===
                    "RESOLVIDO"
                      ? "linha-ativa"
                      : ""
                  }`}
                />

                {/* RESOLVIDO */}
                <div className="status-etapa-wrapper">

                  <div
                    className={`etapa-status ${
                      consulta.status ===
                      "RESOLVIDO"
                        ? "ativa"
                        : ""
                    }`}
                  >
                    <div className="bolinha">
                      4
                    </div>

                    <span>
                      Resolvido
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* INFORMAÇÕES */}
            <div className="consulta-grid">

              {/* LOCAL */}
              <div className="consulta-card">

                <h2>
                  📍 Local do problema
                </h2>

<div
  className="info-item"
  style={{
    padding: "14px 0",
    borderBottom: "1px solid #f0f0f0",
  }}
>
  <span
    style={{
      display: "block",
      color: "#6b7280",
      fontSize: "13px",
      marginBottom: "7px",
    }}
  >
    Endereço
  </span>

  <strong
    style={{
      display: "block",
      color: "#222",
      fontSize: "15px",
    }}
  >
    {consulta.rua}
    {consulta.numero ? `, ${consulta.numero}` : ""}
  </strong>
</div>

                <div className="info-item">
                  <span>
                    Bairro
                  </span>

                  <strong>
                    {consulta.bairro}
                  </strong>
                </div>

                <div className="info-item">
                  <span>
                    Cidade
                  </span>

                  <strong>
                    {consulta.cidade}
                  </strong>
                </div>

              </div>

              {/* SOLICITAÇÃO */}
              <div className="consulta-card">

                <h2>
                  📋 Solicitação
                </h2>

                <div className="info-item">
                  <span>
                    Categoria
                  </span>

                  <strong>
                    {consulta.categoria}
                  </strong>
                </div>

                <div className="info-item descricao-item">
                  <span>
                    Descrição
                  </span>

                  <p>
                    {consulta.descricao}
                  </p>
                </div>

                <div className="info-item">
                  <span>
                    Registrado em
                  </span>

                  <strong>
                    {formatarData(
                      consulta.criado_em
                    )}
                  </strong>
                </div>

              </div>

            </div>

            {/* FOTOS */}
            {consulta.fotos &&
              consulta.fotos.length > 0 && (
                <div className="consulta-card">

                  <h2>
                    📸 Fotos enviadas
                  </h2>

                  <div className="fotos-consulta">

                    {consulta.fotos.map(
                      (
                        foto,
                        index
                      ) => {

                        const fotoUrl =
                          foto.startsWith(
                            "http"
                          )
                            ? foto
                            : `http://localhost:3001${foto}`;

                        return (
                          <a
                            key={index}
                            href={fotoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={fotoUrl}
                              alt={`Foto ${index + 1}`}
                            />
                          </a>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            {/* COORDENADAS */}
            {consulta.latitude !== null &&
              consulta.latitude !== undefined &&
              consulta.longitude !== null &&
              consulta.longitude !== undefined && (
                <div className="consulta-coordenadas">

                  📍 Coordenadas:
                  {" "}
                  {consulta.latitude.toFixed(6)}
                  {" "}
                  /
                  {" "}
                  {consulta.longitude.toFixed(6)}

                </div>
              )}

          </div>
        )}

      </main>

      {/* RODAPÉ */}
      <footer className="consulta-footer">
        Cidade Ativa • Participação cidadã
      </footer>

    </div>
  );
}

export default ConsultaProtocolo;