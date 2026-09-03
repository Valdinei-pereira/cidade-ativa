import { useEffect, useMemo, useState } from "react";
import "./Admin.css";

interface Solicitacao {
  id: number;
  protocolo: string;
  categoria: string;
  descricao: string;
  fotos: string[];
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  latitude: number | null;
  longitude: number | null;
  nome: string;
  telefone: string;
  email: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
}

const STATUS = [
  {
    valor: "RECEBIDO",
    nome: "Recebido",
  },
  {
    valor: "EM_ANALISE",
    nome: "Em análise",
  },
  {
    valor: "EM_ATENDIMENTO",
    nome: "Em atendimento",
  },
  {
    valor: "RESOLVIDO",
    nome: "Resolvido",
  },
  {
    valor: "RECUSADO",
    nome: "Recusado",
  },
];

function statusTexto(status: string) {
  const encontrado = STATUS.find(
    (item) => item.valor === status
  );

  return encontrado?.nome || status;
}

function statusClasse(status: string) {
  switch (status) {
    case "RECEBIDO":
      return "admin-status-recebido";

    case "EM_ANALISE":
      return "admin-status-analise";

    case "EM_ATENDIMENTO":
      return "admin-status-atendimento";

    case "RESOLVIDO":
      return "admin-status-resolvido";

    case "RECUSADO":
      return "admin-status-recusado";

    default:
      return "";
  }
}

function formatarData(data: string) {
  if (!data) {
    return "-";
  }

  const dataFormatada = new Date(
    data.replace(" ", "T") + "Z"
  );

  if (isNaN(dataFormatada.getTime())) {
    return data;
  }

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Admin() {
  const [solicitacoes, setSolicitacoes] = useState<
    Solicitacao[]
  >([]);

  const [selecionada, setSelecionada] =
    useState<Solicitacao | null>(null);

  const [busca, setBusca] = useState("");

  const [filtroStatus, setFiltroStatus] =
    useState("TODOS");

  const [filtroCategoria, setFiltroCategoria] =
    useState("TODAS");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState("");

  // =====================================================
  // TOKEN DO ADMINISTRADOR
  // =====================================================

  const token =
    sessionStorage.getItem("adminToken");

  // =====================================================
  // CARREGAR SOLICITAÇÕES
  // =====================================================

  const carregarSolicitacoes = async () => {
    try {
      setCarregando(true);
      setErro("");

      if (!token) {
        setErro(
          "Sessão administrativa não encontrada."
        );

        return;
      }

      const response = await fetch(
        "https://cidade-ativa.onrender.com/api/admin/solicitacoes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");

        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.mensagem ||
            "Erro ao carregar solicitações."
        );
      }

      setSolicitacoes(
  Array.isArray(data)
    ? data
    : data.solicitacoes || []
);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as solicitações."
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  // =====================================================
  // CATEGORIAS
  // =====================================================

  const categorias = useMemo(() => {
    return Array.from(
      new Set(
        solicitacoes.map(
          (item) => item.categoria
        )
      )
    ).sort();
  }, [solicitacoes]);

  // =====================================================
  // FILTROS
  // =====================================================

  const solicitacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return solicitacoes.filter(
      (solicitacao) => {
        const correspondeBusca =
          !termo ||
          solicitacao.protocolo
            .toLowerCase()
            .includes(termo) ||
          solicitacao.categoria
            .toLowerCase()
            .includes(termo) ||
          solicitacao.bairro
            .toLowerCase()
            .includes(termo) ||
          solicitacao.rua
            .toLowerCase()
            .includes(termo);

        const correspondeStatus =
          filtroStatus === "TODOS" ||
          solicitacao.status === filtroStatus;

        const correspondeCategoria =
          filtroCategoria === "TODAS" ||
          solicitacao.categoria ===
            filtroCategoria;

        return (
          correspondeBusca &&
          correspondeStatus &&
          correspondeCategoria
        );
      }
    );
  }, [
    solicitacoes,
    busca,
    filtroStatus,
    filtroCategoria,
  ]);

  // =====================================================
  // CONTADORES
  // =====================================================

  const total = solicitacoes.length;

  const recebidos = solicitacoes.filter(
    (item) =>
      item.status === "RECEBIDO"
  ).length;

  const emAnalise = solicitacoes.filter(
    (item) =>
      item.status === "EM_ANALISE"
  ).length;

  const emAtendimento = solicitacoes.filter(
    (item) =>
      item.status === "EM_ATENDIMENTO"
  ).length;

  const resolvidos = solicitacoes.filter(
    (item) =>
      item.status === "RESOLVIDO"
  ).length;

  // =====================================================
  // ALTERAR STATUS
  // =====================================================

  const alterarStatus = async (
    protocolo: string,
    novoStatus: string
  ) => {
    try {
      setSalvando(true);

      const tokenAtual =
        sessionStorage.getItem("adminToken");

      if (!tokenAtual) {
        throw new Error(
          "Sessão administrativa não encontrada."
        );
      }

      const response = await fetch(
      `https://cidade-ativa.onrender.com/api/admin/solicitacoes/${encodeURIComponent(
        protocolo
      )}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${tokenAtual}`,
          },

          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem(
          "adminToken"
        );

        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.mensagem ||
            "Erro ao atualizar status."
        );
      }

      // Atualiza a lista buscando os dados
      // novamente do banco.
      await carregarSolicitacoes();

      const atualizada =
        solicitacoes.find(
          (item) =>
            item.protocolo === protocolo
        );

      if (atualizada) {
        setSelecionada({
          ...atualizada,
          status: novoStatus,
        });
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status."
      );
    } finally {
      setSalvando(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const sair = () => {
    sessionStorage.removeItem(
      "adminToken"
    );

    window.location.reload();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin">

      {/* HEADER */}

      <header className="admin-header">

        <div className="admin-logo">

          <div className="admin-logo-icone">
            🏛️
          </div>

          <div>
            <strong>
              Cidade Ativa
            </strong>

            <span>
              Painel administrativo
            </span>
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >

          <button
            className="admin-atualizar"
            onClick={
              carregarSolicitacoes
            }
            disabled={carregando}
          >
            ↻ Atualizar
          </button>

          <button
            className="admin-atualizar"
            onClick={sair}
          >
            🚪 Sair
          </button>

        </div>

      </header>

      {/* CONTEÚDO */}

      <main className="admin-container">

        <section className="admin-titulo">

          <h1>
            Solicitações
          </h1>

          <p>
            Gerencie e acompanhe os
            problemas registrados pelos
            moradores.
          </p>

        </section>

        {/* ESTATÍSTICAS */}

        <section className="admin-stats">

          <div className="admin-stat">

            <div className="admin-stat-icone">
              📋
            </div>

            <div>
              <span>Total</span>
              <strong>{total}</strong>
            </div>

          </div>

          <div className="admin-stat">

            <div className="admin-stat-icone">
              📥
            </div>

            <div>
              <span>Recebidos</span>

              <strong>
                {recebidos}
              </strong>
            </div>

          </div>

          <div className="admin-stat">

            <div className="admin-stat-icone">
              🔎
            </div>

            <div>
              <span>Em análise</span>

              <strong>
                {emAnalise}
              </strong>
            </div>

          </div>

          <div className="admin-stat">

            <div className="admin-stat-icone">
              🔧
            </div>

            <div>
              <span>Atendimento</span>

              <strong>
                {emAtendimento}
              </strong>
            </div>

          </div>

          <div className="admin-stat">

            <div className="admin-stat-icone">
              ✅
            </div>

            <div>
              <span>Resolvidos</span>

              <strong>
                {resolvidos}
              </strong>
            </div>

          </div>

        </section>

        {/* FILTROS */}

        <section className="admin-filtros">

          <div className="admin-busca">

            <span>🔎</span>

            <input
              type="text"
              placeholder="Buscar protocolo, rua, bairro ou categoria..."
              value={busca}
              onChange={(e) =>
                setBusca(
                  e.target.value
                )
              }
            />

          </div>

          <select
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(
                e.target.value
              )
            }
          >

            <option value="TODOS">
              Todos os status
            </option>

            {STATUS.map((item) => (
              <option
                key={item.valor}
                value={item.valor}
              >
                {item.nome}
              </option>
            ))}

          </select>

          <select
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(
                e.target.value
              )
            }
          >

            <option value="TODAS">
              Todas as categorias
            </option>

            {categorias.map(
              (categoria) => (
                <option
                  key={categoria}
                  value={categoria}
                >
                  {categoria}
                </option>
              )
            )}

          </select>

        </section>

        {/* ERRO */}

        {erro && (
          <div className="admin-erro">
            ⚠️ {erro}
          </div>
        )}

        {/* TABELA */}

        <section className="admin-tabela-card">

          <div className="admin-tabela-topo">

            <strong>
              {solicitacoesFiltradas.length}{" "}
              solicitação
              {solicitacoesFiltradas.length !==
              1
                ? "ões"
                : ""}
            </strong>

          </div>

          {carregando ? (

            <div className="admin-vazio">

              <div className="admin-loading">
                ⏳
              </div>

              <p>
                Carregando solicitações...
              </p>

            </div>

          ) : solicitacoesFiltradas.length ===
            0 ? (

            <div className="admin-vazio">

              <div>🔍</div>

              <strong>
                Nenhuma solicitação encontrada
              </strong>

              <p>
                Tente alterar os filtros.
              </p>

            </div>

          ) : (

            <div className="admin-tabela-scroll">

              <table className="admin-tabela">

                <thead>

                  <tr>

                    <th>
                      Protocolo
                    </th>

                    <th>
                      Categoria
                    </th>

                    <th>
                      Local
                    </th>

                    <th>
                      Data
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Ação
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {solicitacoesFiltradas.map(
                    (solicitacao) => (

                      <tr
                        key={
                          solicitacao.id
                        }
                      >

                        <td>

                          <strong className="admin-protocolo">
                            {
                              solicitacao.protocolo
                            }
                          </strong>

                        </td>

                        <td>
                          {
                            solicitacao.categoria
                          }
                        </td>

                        <td>

                          <div className="admin-local">

                            <strong>

                              {
                                solicitacao.rua
                              }

                              {solicitacao.numero
                                ? `, ${solicitacao.numero}`
                                : ""}

                            </strong>

                            <span>
                              {
                                solicitacao.bairro
                              }
                            </span>

                          </div>

                        </td>

                        <td>
                          {formatarData(
                            solicitacao.criado_em
                          )}
                        </td>

                        <td>

                          <span
                            className={`admin-status ${statusClasse(
                              solicitacao.status
                            )}`}
                          >
                            {statusTexto(
                              solicitacao.status
                            )}
                          </span>

                        </td>

                        <td>

                          <button
                            className="admin-ver"
                            onClick={() =>
                              setSelecionada(
                                solicitacao
                              )
                            }
                          >
                            Ver detalhes
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* MODAL */}

      {selecionada && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setSelecionada(null)
          }
        >

          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CABEÇALHO */}

            <div className="admin-modal-header">

              <div>

                <span>
                  Protocolo
                </span>

                <h2>
                  {
                    selecionada.protocolo
                  }
                </h2>

              </div>

              <button
                className="admin-fechar"
                onClick={() =>
                  setSelecionada(null)
                }
              >
                ×
              </button>

            </div>

            {/* STATUS */}

            <div className="admin-detalhe-status">

              <div>

                <span>
                  Status atual
                </span>

                <strong
                  className={`admin-status ${statusClasse(
                    selecionada.status
                  )}`}
                >
                  {statusTexto(
                    selecionada.status
                  )}
                </strong>

              </div>

              <div className="admin-alterar-status">

                <label>
                  Alterar status
                </label>

                <select
                  value={
                    selecionada.status
                  }
                  disabled={salvando}
                  onChange={(e) =>
                    alterarStatus(
                      selecionada.protocolo,
                      e.target.value
                    )
                  }
                >

                  {STATUS.map((item) => (

                    <option
                      key={item.valor}
                      value={item.valor}
                    >
                      {item.nome}
                    </option>

                  ))}

                </select>

              </div>

            </div>

            {/* DETALHES */}

            <div className="admin-detalhes-grid">

              <div className="admin-detalhe-card">

                <h3>
                  📋 Solicitação
                </h3>

                <div className="admin-info">

                  <span>
                    Categoria
                  </span>

                  <strong>
                    {
                      selecionada.categoria
                    }
                  </strong>

                </div>

                <div className="admin-info">

                  <span>
                    Descrição
                  </span>

                  <p>
                    {
                      selecionada.descricao
                    }
                  </p>

                </div>

                <div className="admin-info">

                  <span>
                    Registrado em
                  </span>

                  <strong>
                    {formatarData(
                      selecionada.criado_em
                    )}
                  </strong>

                </div>

              </div>

              <div className="admin-detalhe-card">

                <h3>
                  📍 Localização
                </h3>

                <div className="admin-info">

                  <span>
                    Endereço
                  </span>

                  <strong>

                    {
                      selecionada.rua
                    }

                    {selecionada.numero
                      ? `, ${selecionada.numero}`
                      : ""}

                  </strong>

                </div>

                <div className="admin-info">

                  <span>
                    Bairro
                  </span>

                  <strong>
                    {
                      selecionada.bairro
                    }
                  </strong>

                </div>

                <div className="admin-info">

                  <span>
                    Cidade
                  </span>

                  <strong>
                    {
                      selecionada.cidade
                    }
                  </strong>

                </div>

              </div>

            </div>

            {/* MORADOR */}

            <div className="admin-detalhe-card">

              <h3>
                👤 Dados do morador
              </h3>

              <div className="admin-morador-grid">

                <div className="admin-info">

                  <span>
                    Nome
                  </span>

                  <strong>
                    {
                      selecionada.nome
                    }
                  </strong>

                </div>

                <div className="admin-info">

                  <span>
                    Telefone
                  </span>

                  <strong>
                    {
                      selecionada.telefone
                    }
                  </strong>

                </div>

                <div className="admin-info">

                  <span>
                    E-mail
                  </span>

                  <strong>
                    {
                      selecionada.email
                    }
                  </strong>

                </div>

              </div>

            </div>

            {/* FOTOS */}

            {selecionada.fotos &&
              selecionada.fotos.length >
                0 && (

                <div className="admin-detalhe-card">

                  <h3>
                    📸 Fotos enviadas
                  </h3>

                  <div className="admin-fotos">

                    {selecionada.fotos.map(
                      (foto, index) => {

                        const fotoUrl =
                          foto.startsWith(
                            "http"
                          )
                            ? foto
                            : `https://cidade-ativa.onrender.com${foto}`;

                        return (

                          <a
                            key={index}
                            href={fotoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >

                            <img
                              src={fotoUrl}
                              alt={`Foto ${
                                index + 1
                              }`}
                            />

                          </a>

                        );
                      }
                    )}

                  </div>

                </div>

              )}

            {/* COORDENADAS */}

            {selecionada.latitude !==
              null &&
              selecionada.longitude !==
                null && (

                <div className="admin-coordenadas">

                  📍 Coordenadas:{" "}
                  {
                    selecionada.latitude
                  }
                  {" , "}
                  {
                    selecionada.longitude
                  }

                </div>

              )}

            {/* RODAPÉ */}

            <div className="admin-modal-footer">

              <span>
                Última atualização:{" "}
                {formatarData(
                  selecionada.atualizado_em
                )}
              </span>

              <button
                onClick={() =>
                  setSelecionada(null)
                }
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}