import {

  useRef,

  useState,

} from "react";

import "./App.css";

import Mapa from "./Mapa";

import Admin from "./Admin";

import AdminLogin from "./AdminLogin";
import "leaflet/dist/leaflet.css";



/* =====================================================

   TIPOS

===================================================== */

interface Categoria {

  nome: string;

  icone: string;

}

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

/* =====================================================

   CATEGORIAS

===================================================== */

const categorias: Categoria[] = [

  {

    nome: "Buraco na rua",

    icone: "🕳️",

  },

  {

    nome: "Iluminação pública",

    icone: "💡",

  },

  {

    nome: "Lixo / entulho",

    icone: "🗑️",

  },

  {

    nome: "Poda de árvore",

    icone: "🌳",

  },

  {

    nome: "Vazamento",

    icone: "🚰",

  },

  {

    nome: "Calçada / acessibilidade",

    icone: "🚧",

  },

  {

    nome: "Transporte público",

    icone: "🚌",

  },

  {

    nome: "Escola",

    icone: "🏫",

  },

  {

    nome: "Saúde",

    icone: "🏥",

  },

  {

    nome: "Trânsito / sinalização",

    icone: "🚦",

  },

  {

    nome: "Obras",

    icone: "🏗️",

  },

  {

    nome: "Outros",

    icone: "📌",

  },

];

/* =====================================================

   STATUS

===================================================== */

const statusTexto = (

  status: string

) => {

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

/* =====================================================

   APP

===================================================== */

function App() {

  /* ===================================================

     NAVEGAÇÃO

  =================================================== */

  const [pagina, setPagina] =

  useState<

    "inicio" |

    "consulta" |

    "admin-login" |

    "admin"

  >(

    window.location.pathname === "/admin"

      ? "admin-login"

      : "inicio"

  );

  /* ===================================================

     ETAPA DO FORMULÁRIO

  =================================================== */

  const [etapa, setEtapa] =

    useState(1);

  /* ===================================================

     CATEGORIA

  =================================================== */

  const [

    categoriaSelecionada,

    setCategoriaSelecionada,

  ] = useState("");

  /* ===================================================

     FOTOS

  =================================================== */

  const [fotos, setFotos] =

    useState<string[]>([]);

  const [

    arquivosFotos,

    setArquivosFotos,

  ] = useState<File[]>([]);

  const inputGaleriaRef =

    useRef<HTMLInputElement>(null);

  const inputCameraRef =

    useRef<HTMLInputElement>(null);

  /* ===================================================

     DESCRIÇÃO

  =================================================== */

  const [descricao, setDescricao] =

    useState("");

  /* ===================================================

     LOCALIZAÇÃO

  =================================================== */

  const [rua, setRua] =

    useState("");

  const [numero, setNumero] =

    useState("");

  const [bairro, setBairro] =

    useState("");

  const [cidade, setCidade] =

    useState("");

  const [latitude, setLatitude] =

    useState<number | null>(null);

  const [longitude, setLongitude] =

    useState<number | null>(null);

  const [

    usandoLocalizacao,

    setUsandoLocalizacao,

  ] = useState(false);

  const [

    buscandoEndereco,

    setBuscandoEndereco,

  ] = useState(false);

  const [

    erroLocalizacao,

    setErroLocalizacao,

  ] = useState("");

  const [

    enderecoEncontrado,

    setEnderecoEncontrado,

  ] = useState("");

  /* ===================================================

     IDENTIFICAÇÃO

  =================================================== */

  const [nome, setNome] =

    useState("");

  const [telefone, setTelefone] =

    useState("");

  const [email, setEmail] =

    useState("");

  /* ===================================================

     ENVIO

  =================================================== */

  const [enviando, setEnviando] =

    useState(false);

  const [protocolo, setProtocolo] =

    useState("");

  const [enviado, setEnviado] =

    useState(false);

  /* ===================================================

     CONSULTA

  =================================================== */

  const [

    protocoloConsulta,

    setProtocoloConsulta,

  ] = useState("");

  const [

    consulta,

    setConsulta,

  ] =

    useState<Solicitacao | null>(

      null

    );

  const [

    consultando,

    setConsultando,

  ] = useState(false);

  const [

    erroConsulta,

    setErroConsulta,

  ] = useState("");

  /* ===================================================

     ADMIN

  =================================================== */

  /* ===================================================

     CATEGORIA ATUAL

  =================================================== */

  const categoriaAtual =

    categorias.find(

      (item) =>

        item.nome ===

        categoriaSelecionada

    );

  /* ===================================================

     ADICIONAR FOTOS

  =================================================== */

  const adicionarFotos = (

    arquivos: FileList | null

  ) => {

    if (!arquivos) {

      return;

    }

    const arquivosArray =

      Array.from(arquivos);

    const restantes =

      5 - fotos.length;

    if (restantes <= 0) {

      alert(

        "Você pode enviar no máximo 5 fotos."

      );

      return;

    }

    const selecionados =

      arquivosArray.slice(

        0,

        restantes

      );

    const novosArquivos = [

      ...arquivosFotos,

      ...selecionados,

    ];

    setArquivosFotos(

      novosArquivos

    );

    const novasFotos =

      selecionados.map(

        (arquivo) =>

          URL.createObjectURL(

            arquivo

          )

      );

    setFotos([

      ...fotos,

      ...novasFotos,

    ]);

  };

  /* ===================================================

     REMOVER FOTO

  =================================================== */

  const removerFoto = (

    index: number

  ) => {

    const novasFotos =

      fotos.filter(

        (_, i) => i !== index

      );

    const novosArquivos =

      arquivosFotos.filter(

        (_, i) => i !== index

      );

    setFotos(novasFotos);

    setArquivosFotos(

      novosArquivos

    );

  };

  /* ===================================================

     BUSCAR ENDEREÇO PELO GPS

  =================================================== */

  const buscarEndereco =

    async (

      lat: number,

      lon: number

    ) => {

      try {

        setBuscandoEndereco(true);

        const response =

          await fetch(

            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR`

          );

        if (!response.ok) {

          throw new Error(

            "Não foi possível buscar o endereço."

          );

        }

        const data =

          await response.json();

        const address =

          data.address || {};

        const novaRua =

          address.road ||

          address.pedestrian ||

          address.footway ||

          address.path ||

          "";

        const novoNumero =

          address.house_number ||

          "";

        const novoBairro =

          address.suburb ||

          address.neighbourhood ||

          address.quarter ||

          "";

        const novaCidade =

          address.city ||

          address.town ||

          address.village ||

          address.municipality ||

          "";

        setRua(novaRua);

        setNumero(novoNumero);

        setBairro(novoBairro);

        setCidade(novaCidade);

        setEnderecoEncontrado(

          data.display_name ||

            `${novaRua}, ${novoNumero}`

        );

      } catch (error) {

        console.error(

          "Erro ao buscar endereço:",

          error

        );

        setErroLocalizacao(

          "Localização encontrada, mas não foi possível preencher o endereço automaticamente. Você pode preencher os campos manualmente."

        );

      } finally {

        setBuscandoEndereco(false);

      }

    };

  /* ===================================================

     USAR MINHA LOCALIZAÇÃO

  =================================================== */

  const usarLocalizacao =

    () => {

      if (

        !navigator.geolocation

      ) {

        setErroLocalizacao(

          "Seu navegador não suporta localização."

        );

        return;

      }

      setUsandoLocalizacao(

        true

      );

      setErroLocalizacao("");

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const lat =

            position.coords

              .latitude;

          const lon =

            position.coords

              .longitude;

          setLatitude(lat);

          setLongitude(lon);

          await buscarEndereco(

            lat,

            lon

          );

          setUsandoLocalizacao(

            false

          );

        },

        (error) => {

          console.error(

            error

          );

          setUsandoLocalizacao(

            false

          );

          setErroLocalizacao(

            "Não foi possível obter sua localização. Verifique se o navegador tem permissão para acessar sua localização."

          );

        },

        {

          enableHighAccuracy: true,

          timeout: 15000,

          maximumAge: 0,

        }

      );

    };

  /* ===================================================

     SELECIONAR PONTO NO MAPA

  =================================================== */

  const selecionarLocalizacao =

    async (

      lat: number,

      lon: number

    ) => {

      setLatitude(lat);

      setLongitude(lon);

      setErroLocalizacao("");

      await buscarEndereco(

        lat,

        lon

      );

    };

  /* ===================================================

     VALIDAR ETAPA 1

  =================================================== */

  const continuarCategoria =

    () => {

      if (

        !categoriaSelecionada

      ) {

        alert(

          "Selecione uma categoria."

        );

        return;

      }

      setEtapa(2);

      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });

    };

  /* ===================================================

     VALIDAR ETAPA 2

  =================================================== */

  const continuarFotos =

    () => {

      if (fotos.length === 0) {

        const continuar =

          window.confirm(

            "Você não adicionou nenhuma foto. Deseja continuar mesmo assim?"

          );

        if (!continuar) {

          return;

        }

      }

      setEtapa(3);

      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });

    };

  /* ===================================================

     VALIDAR ETAPA 3

  =================================================== */

  const continuarDescricao =

    () => {

      if (

        !descricao.trim()

      ) {

        alert(

          "Descreva o problema antes de continuar."

        );

        return;

      }

      setEtapa(4);

      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });

    };

  /* ===================================================

     VALIDAR ETAPA 4

  =================================================== */

  const continuarLocalizacao =

    () => {

      if (!rua.trim()) {

        alert(

          "Informe a rua."

        );

        return;

      }

      if (!bairro.trim()) {

        alert(

          "Informe o bairro."

        );

        return;

      }

      if (!cidade.trim()) {

        alert(

          "Informe a cidade."

        );

        return;

      }

      setEtapa(5);

      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });

    };

  /* ===================================================

     VALIDAR ETAPA 5

  =================================================== */

  const continuarIdentificacao =

    () => {

      if (!nome.trim()) {

        alert(

          "Informe seu nome."

        );

        return;

      }

      if (

        !telefone.trim()

      ) {

        alert(

          "Informe seu telefone."

        );

        return;

      }

      if (!email.trim()) {

        alert(

          "Informe seu e-mail."

        );

        return;

      }

      setEtapa(6);

      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });

    };

  /* ===================================================

     VOLTAR

  =================================================== */

  const voltarEtapa =

    () => {

      if (etapa > 1) {

        setEtapa(

          etapa - 1

        );

        window.scrollTo({

          top: 0,

          behavior: "smooth",

        });

      }

    };

  /* ===================================================

     ENVIAR SOLICITAÇÃO

  =================================================== */

const enviarSolicitacao = async () => {

  try {

    setEnviando(true);

    const formData = new FormData();

    formData.append("categoria", categoriaSelecionada);

    formData.append("descricao", descricao.trim());

    formData.append("rua", rua.trim());

    formData.append("numero", numero.trim());

    formData.append("bairro", bairro.trim());

    formData.append("cidade", cidade.trim());

    if (latitude !== null) {

      formData.append("latitude", String(latitude));

    }

    if (longitude !== null) {

      formData.append("longitude", String(longitude));

    }

    formData.append("nome", nome.trim());

    formData.append("telefone", telefone.trim());

    formData.append("email", email.trim());

    // Adiciona as fotos reais

    arquivosFotos.forEach((arquivo) => {

      formData.append("fotos", arquivo);

    });

const response = await fetch(
  "https://cidade-ativa-u2ef.onrender.com/api/solicitacoes",

      {

        method: "POST",

        body: formData,

      }

    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(

        data.mensagem ||

          "Erro ao registrar solicitação."

      );

    }

    console.log(

      "Solicitação registrada:",

      data

    );

    setProtocolo(data.protocolo);

    setEnviado(true);

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  } catch (error) {

    console.error(

      "Erro ao enviar solicitação:",

      error

    );

    alert(

      error instanceof Error

        ? error.message

        : "Não foi possível registrar a solicitação. Verifique se o servidor está funcionando."

    );

  } finally {

    setEnviando(false);

  }

};



  /* ===================================================

     NOVA SOLICITAÇÃO

  =================================================== */

  const novaSolicitacao =

    () => {

      setEtapa(1);

      setCategoriaSelecionada(

        ""

      );

      fotos.forEach((foto) => {

        if (

          foto.startsWith(

            "blob:"

          )

        ) {

          URL.revokeObjectURL(

            foto

          );

        }

      });

      setFotos([]);

      setArquivosFotos([]);

      setDescricao("");

      setRua("");

      setNumero("");

      setBairro("");

      setCidade("");

      setLatitude(null);

      setLongitude(null);

      setUsandoLocalizacao(

        false

      );

      setBuscandoEndereco(

        false

      );

      setErroLocalizacao("");

      setEnderecoEncontrado("");

      setNome("");

      setTelefone("");

      setEmail("");

      setProtocolo("");

      setEnviado(false);

      setPagina("inicio");

      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });

    };

  /* ===================================================

     CONSULTAR PROTOCOLO

  =================================================== */

  const consultarProtocolo =

    async () => {

      const protocoloLimpo =

        protocoloConsulta.trim();

      if (

        !protocoloLimpo

      ) {

        setErroConsulta(

          "Digite um protocolo."

        );

        return;

      }

      try {

        setConsultando(true);

        setErroConsulta("");

        setConsulta(null);

const response =
  await fetch(
    `https://cidade-ativa-u2ef.onrender.com/api/solicitacoes/${encodeURIComponent(
      protocoloLimpo
    )}`
  );

        const data =

          await response.json();

        if (!response.ok) {

          throw new Error(

            data.mensagem ||

              "Protocolo não encontrado."

          );

        }

        setConsulta(data.solicitacao ?? data);

      } catch (error) {

        console.error(

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

  /* ===================================================

     ENTER NA CONSULTA

  =================================================== */

  const pressionarEnter =

    (

      event: React.KeyboardEvent<HTMLInputElement>

    ) => {

      if (

        event.key ===

        "Enter"

      ) {

        consultarProtocolo();

      }

    };

  /* ===================================================

     TELA DE SUCESSO

  =================================================== */

  if (enviado) {

    return (

      <div className="app">

        {/* HEADER */}

        <header className="header">

          <div className="logo">

            <div className="logo-icone">

              🏛️

            </div>

            <div>

            <strong>
              NEYghborhood
            </strong>

              <span>

                Participação cidadã

              </span>

            </div>

          </div>

          <button

            className="botao-consultar"

            onClick={

              novaSolicitacao

            }

          >

            ← Registrar problema

          </button>

        </header>

        {/* SUCESSO */}

        <main className="container">

          <div className="sucesso">

            <div className="sucesso-icone">

              ✓

            </div>

            <h1>

              Solicitação registrada!

            </h1>

            <p>

              Seu problema foi registrado

              com sucesso e será encaminhado

              para acompanhamento.

            </p>

            <div className="protocolo">

              <span>

                Seu protocolo

              </span>

              <strong>

                {protocolo}

              </strong>

            </div>

            <div className="status-sucesso">

              <span className="status-ponto">

                ●

              </span>

              RECEBIDO

            </div>

            <p className="texto-menor">

              Guarde esse número para

              acompanhar sua solicitação.

            </p>

            <div className="acoes-sucesso">

              <button

                className="botao-principal"

             onClick={() => {
              setProtocoloConsulta(protocolo);
              setConsulta(null);
              setErroConsulta("");
              setEnviado(false);
              setPagina("consulta");
            }}

              >

                🔎 Consultar protocolo

              </button>

              <button

                className="botao-voltar"

                onClick={

                  novaSolicitacao

                }

              >

                Registrar outro problema

              </button>

            </div>

          </div>

        </main>

      <footer className="footer">
        <p>
          NEYghborhood • Participação cidadã
        </p>
        <small>
          Desenvolvido por Bruna Villanova
        </small>
      </footer>

      </div>

    );

  }

  /* ===================================================

   LOGIN ADMINISTRATIVO

\=================================================== */

if (pagina === "admin-login") {

  return (

    <AdminLogin

      onLogin={() => {

        setPagina("admin");

        window.history.pushState(

          {},

          "",

          "/admin"

        );

      }}

    />

  );

}

/* ===================================================

   ADMIN

\=================================================== */

if (pagina === "admin") {

  const token =

    sessionStorage.getItem("adminToken");

  if (!token) {

    return (

      <AdminLogin

        onLogin={() => {

          setPagina("admin");

          window.history.pushState(

            {},

            "",

            "/admin"

          );

        }}

      />

    );

  }

  return (

    <div>

      <Admin />

      <button

        onClick={() => {

          sessionStorage.removeItem(

            "adminToken"

          );

          setPagina("inicio");

          window.history.pushState(

            {},

            "",

            "/"

          );

        }}

        style={{

          position: "fixed",

          bottom: "20px",

          left: "20px",

          zIndex: 5000,

          border: "none",

          borderRadius: "10px",

          padding: "11px 17px",

          background: "#ffffff",

          color: "#087f5b",

          cursor: "pointer",

          fontWeight: 700,

          boxShadow:

            "0 4px 18px rgba(0,0,0,0.18)",

        }}

      >

        🚪 Sair

      </button>

    </div>

  );

}

  /* ===================================================

     CONSULTA

  =================================================== */

  if (

    pagina === "consulta"

  ) {

    return (

      <div className="app">

        {/* HEADER */}

        <header className="header">

          <div className="logo">

            <div className="logo-icone">

              🏛️

            </div>

            <div>

              <strong>

               NEYghborhood

              </strong>

              <span>

                Participação cidadã

              </span>

            </div>

          </div>

          <button

            className="botao-consultar"

            onClick={() => {

              setPagina(

                "inicio"

              );

              setConsulta(

                null

              );

              setErroConsulta(

                ""

              );

            }}

          >

            ← Registrar problema

          </button>

        </header>

        {/* CONSULTA */}

        <main className="consulta-container">

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

                value={

                  protocoloConsulta

                }

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

                onClick={

                  consultarProtocolo

                }

                disabled={

                  consultando

                }

              >

                {consultando

                  ? "Consultando..."

                  : "Consultar"}

              </button>

            </div>

            {erroConsulta && (

              <div className="consulta-erro">

                ⚠️{" "}

                {erroConsulta}

              </div>

            )}

          </div>

          {/* RESULTADO */}

          {consulta && (

            <>

              {/* PROTOCOLO */}

              <div className="protocolo-destaque">

                <div>

                  <span>

                    Protocolo

                  </span>

                  <strong>

                    {

                      consulta.protocolo

                    }

                  </strong>

                </div>

                <div

                  className={`status-badge ${

                    consulta.status ===

                    "RECEBIDO"

                      ? "status-recebido"

                      : consulta.status ===

                        "EM_ANALISE"

                      ? "status-analise"

                      : consulta.status ===

                        "EM_ATENDIMENTO"

                      ? "status-atendimento"

                      : consulta.status ===

                        "RESOLVIDO"

                      ? "status-resolvido"

                      : "status-recusado"

                  }`}

                >

                  {statusTexto(

                    consulta.status

                  )}

                </div>

              </div>

              {/* ANDAMENTO */}

              <div className="consulta-card">

                <h2>

                  📋 Andamento da solicitação

                </h2>                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0",
                    marginTop: "24px",
                    overflowX: "auto",
                    padding: "0 8px 12px",
                    boxSizing: "border-box",
                  }}
                >
                  {[
                    {
                      nome: "Recebido",
                      concluida: [
                        "RECEBIDO",
                        "EM_ANALISE",
                        "EM_ATENDIMENTO",
                        "RESOLVIDO",
                      ].includes(consulta.status),
                    },
                    {
                      nome: "Em análise",
                      concluida: [
                        "EM_ANALISE",
                        "EM_ATENDIMENTO",
                        "RESOLVIDO",
                      ].includes(consulta.status),
                    },
                    {
                      nome: "Atendimento",
                      concluida: [
                        "EM_ATENDIMENTO",
                        "RESOLVIDO",
                      ].includes(consulta.status),
                    },
                    {
                      nome: "Resolvido",
                      concluida: consulta.status === "RESOLVIDO",
                    },
                  ].map((item, index, lista) => (
                    <div
                      key={item.nome}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        flex: "1 1 0",
                        minWidth: "130px",
                      }}
                    >
                      <div
                        style={{
                          width: "130px",
                          minWidth: "130px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          fontSize: "13px",
                          fontWeight: item.concluida ? 700 : 500,
                          color: item.concluida ? "#2563eb" : "#9ca3af",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: item.concluida ? "#2563eb" : "#e5e7eb",
                            color: item.concluida ? "#ffffff" : "#6b7280",
                            fontSize: "14px",
                            fontWeight: 700,
                            flexShrink: 0,
                            boxSizing: "border-box",
                          }}
                        >
                          {item.concluida ? "✓" : index + 1}
                        </div>
                        <span style={{ marginTop: "9px", whiteSpace: "nowrap" }}>
                          {item.nome}
                        </span>
                      </div>
                      {index < lista.length - 1 && (
                        <div
                          style={{
                            flex: "1 1 auto",
                            height: "3px",
                            marginTop: "18px",
                            background: lista[index + 1].concluida
                              ? "#2563eb"
                              : "#e5e7eb",
                            borderRadius: "99px",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="consulta-grid">

                {/* LOCAL */}

                <div className="consulta-card">

                  <h2>

                    📍 Local do problema

                  </h2>

                  <div className="info-item">

                    <span>

                      Endereço

                    </span>

                    <strong>

                      {consulta.rua}

                      {consulta.numero

                        ? `, ${consulta.numero}`

                        : ""}

                    </strong>

                  </div>

                  <div className="info-item">

                    <span>

                      Bairro

                    </span>

                    <strong>

                      {

                        consulta.bairro

                      }

                    </strong>

                  </div>

                  <div className="info-item">

                    <span>

                      Cidade

                    </span>

                    <strong>

                      {

                        consulta.cidade

                      }

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

                      {

                        consulta.categoria

                      }

                    </strong>

                  </div>

                  <div className="info-item descricao-item">

                    <span>

                      Descrição

                    </span>

                    <p>

                      {

                        consulta.descricao

                      }

                    </p>

                  </div>

                  <div className="info-item">

                    <span>

                      Registrado em

                    </span>

                    <strong>

                      {new Date(

                        consulta.criado_em.replace(

                          " ",

                          "T"

                        ) +

                          "Z"

                      ).toLocaleString(

                        "pt-BR"

                      )}

                    </strong>

                  </div>

                </div>

              </div>

              {/* FOTOS */}

              {consulta.fotos &&

                consulta.fotos.length >

                  0 && (

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

                             : `https://cidade-ativa-u2ef.onrender.com${foto}`;

                          return (

                            <a

                              key={

                                index

                              }

                              href={

                                fotoUrl

                              }

                              target="_blank"

                              rel="noreferrer"

                            >

                              <img

                                src={

                                  fotoUrl

                                }

                                alt={`Foto da solicitação ${

                                  index +

                                  1

                                }`}

                              />

                            </a>

                          );

                        }

                      )}

                    </div>

                  </div>

                )}

              {/* ÚLTIMA ATUALIZAÇÃO */}

              <div className="ultima-atualizacao">

                <span>

                  Última atualização

                </span>

                <strong>

                  {new Date(

                    consulta.atualizado_em.replace(

                      " ",

                      "T"

                    ) +

                      "Z"

                  ).toLocaleString(

                    "pt-BR"

                  )}

                </strong>

              </div>

            </>

          )}

        </main>

          <footer className="footer">
            <p>
             NEYghborhood • Participação cidadã
            </p>

            <small>
              Desenvolvido por Bruna Villanova
            </small>
          </footer>

      </div>

    );

  }

  /* ===================================================

     PÁGINA PRINCIPAL

  =================================================== */

  return (

    <div className="app">

      {/* =================================================

          HEADER

      ================================================= */}

      <header className="header">

        <div className="logo">

          <div className="logo-icone">

            🏛️

          </div>

          <div>

            <strong>
              NEYghborhood

            </strong>

            <span>

              Participação cidadã

            </span>

          </div>

        </div>

        <div

          style={{

            display: "flex",

            gap: "10px",

            alignItems: "center",

          }}

        >

          <button

            className="botao-consultar"

            onClick={() => {

              setConsulta(

                null

              );

              setErroConsulta(

                ""

              );

              setPagina(

                "consulta"

              );

            }}

          >

            🔎 Consultar protocolo

          </button>

          <button

            className="botao-consultar"

            onClick={() => setPagina("admin-login")}

          >

            🏛️ Administração

          </button>

        </div>

      </header>

      {/* =================================================

          CONTEÚDO

      ================================================= */}

      <main className="container">

        {/* INTRO */}

        <section className="intro">

          <h1>

            Registre um problema

          </h1>

          <p>

            Ajude a melhorar nossa cidade.

            Informe um problema encontrado

            no bairro e nós encaminharemos

            para acompanhamento.

          </p>

        </section>

        {/* =================================================

            ETAPAS

        ================================================= */}

        <div className="etapas">

          {[

            "Categoria",

            "Fotos",

            "Descrição",

            "Localização",

            "Identificação",

            "Confirmar",

          ].map(

            (

              nomeEtapa,

              index

            ) => {

              const numero =

                index + 1;

              return (

                <div

                  key={

                    numero

                  }

                  className={`etapa ${

                    etapa >=

                    numero

                      ? "ativa"

                      : ""

                  }`}

                >

                  <div className="etapa-numero">

                    {numero}

                  </div>

                  <span>

                    {

                      nomeEtapa

                    }

                  </span>

                </div>

              );

            }

          )}

        </div>

        {/* =================================================

            CARD

        ================================================= */}

        <section className="card">

          {/* =================================================

              ETAPA 1

          ================================================= */}

          {etapa === 1 && (

            <>

              <div className="titulo-etapa">

                <div className="titulo-icone">

                  📌

                </div>

                <div>

                  <h2>

                    Qual é o problema?

                  </h2>

                  <p>

                    Escolha uma categoria.

                  </p>

                </div>

              </div>

              <div className="categorias">

                {categorias.map(

                  (

                    categoria

                  ) => (

                    <button

                      key={

                        categoria.nome

                      }

                      type="button"

                      className={`categoria ${

                        categoriaSelecionada ===

                        categoria.nome

                          ? "selecionada"

                          : ""

                      }`}

                      onClick={() =>

                        setCategoriaSelecionada(

                          categoria.nome

                        )

                      }

                    >

                      <span className="categoria-icone">

                        {

                          categoria.icone

                        }

                      </span>

                      <span>

                        {

                          categoria.nome

                        }

                      </span>

                    </button>

                  )

                )}

              </div>

              <div className="rodape-formulario">

                <div />

                <div />

                <button

                  className="botao-principal"

                  onClick={

                    continuarCategoria

                  }

                >

                  Continuar →

                </button>

              </div>

            </>

          )}

          {/* =================================================

              ETAPA 2

          ================================================= */}

          {etapa === 2 && (

            <>

              <div className="titulo-etapa">

                <div className="titulo-icone">

                  📸

                </div>

                <div>

                  <h2>

                    Adicione fotos

                  </h2>

                  <p>

                    Fotos ajudam a identificar

                    melhor o problema.

                  </p>

                </div>

              </div>

              <div className="botoes-foto">

                <button

                  type="button"

                  className="botao-foto"

                  onClick={() =>

                    inputCameraRef.current?.click()

                  }

                  disabled={

                    fotos.length >= 5

                  }

                >

                  📷

                  <strong>

                    Tirar foto

                  </strong>

                  <span>

                    Usar câmera

                  </span>

                </button>

                <button

                  type="button"

                  className="botao-foto"

                  onClick={() =>

                    inputGaleriaRef.current?.click()

                  }

                  disabled={

                    fotos.length >= 5

                  }

                >

                  🖼️

                  <strong>

                    Anexar foto

                  </strong>

                  <span>

                    Escolher da galeria

                  </span>

                </button>

              </div>

              <input

                ref={

                  inputGaleriaRef

                }

                type="file"

                accept="image/*"

                multiple

                hidden

                onChange={(event) => {

                  adicionarFotos(

                    event.target.files

                  );

                  event.target.value =

                    "";

                }}

              />

              <input

                ref={

                  inputCameraRef

                }

                type="file"

                accept="image/*"

                capture="environment"

                hidden

                onChange={(event) => {

                  adicionarFotos(

                    event.target.files

                  );

                  event.target.value =

                    "";

                }}

              />

              {fotos.length >

                0 && (

                <div className="fotos">

                  {fotos.map(

                    (

                      foto,

                      index

                    ) => (

                      <div

                        className="foto-preview"

                        key={

                          `${foto}-${index}`

                        }

                      >

                        <img

                          src={

                            foto

                          }

                          alt={`Foto ${

                            index +

                            1

                          }`}

                        />

                        <button

                          type="button"

                          onClick={() =>

                            removerFoto(

                              index

                            )

                          }

                        >

                          ×

                        </button>

                      </div>

                    )

                  )}

                </div>

              )}

              <p className="ajuda">

                {fotos.length}/5 fotos

                adicionadas

              </p>

              <div className="rodape-formulario">

                <button

                  className="botao-voltar"

                  onClick={

                    voltarEtapa

                  }

                >

                  ← Voltar

                </button>

                <div />

                <button

                  className="botao-principal"

                  onClick={

                    continuarFotos

                  }

                >

                  Continuar →

                </button>

              </div>

            </>

          )}

          {/* =================================================

              ETAPA 3

          ================================================= */}

          {etapa === 3 && (

            <>

              <div className="titulo-etapa">

                <div className="titulo-icone">

                  📝

                </div>

                <div>

                  <h2>

                    Descreva o problema

                  </h2>

                  <p>

                    Explique o que está acontecendo.

                  </p>

                </div>

              </div>

              <textarea

                className="descricao"

                placeholder="Ex.: Existe um buraco grande no meio da rua que está dificultando a passagem dos veículos..."

                maxLength={500}

                value={descricao}

                onChange={(event) =>

                  setDescricao(

                    event.target.value

                  )

                }

              />

              <div className="contador">

                {descricao.length}/500

              </div>

              <div className="rodape-formulario">

                <button

                  className="botao-voltar"

                  onClick={

                    voltarEtapa

                  }

                >

                  ← Voltar

                </button>

                <div />

                <button

                  className="botao-principal"

                  onClick={

                    continuarDescricao

                  }

                >

                  Continuar →

                </button>

              </div>

            </>

          )}

          {/* =================================================

              ETAPA 4

          ================================================= */}

          {etapa === 4 && (

            <>

              <div className="titulo-etapa">

                <div className="titulo-icone">

                  📍

                </div>

                <div>

                  <h2>

                    Onde está o problema?

                  </h2>

                  <p>

                    Use sua localização ou

                    informe o endereço.

                  </p>

                </div>

              </div>

              <button

                className="botao-localizacao"

                onClick={

                  usarLocalizacao

                }

                disabled={

                  usandoLocalizacao ||

                  buscandoEndereco

                }

              >

                {usandoLocalizacao

                  ? "📍 Obtendo localização..."

                  : buscandoEndereco

                  ? "🔎 Buscando endereço..."

                  : "📍 Usar minha localização"}

              </button>

              {erroLocalizacao && (

                <div className="erro-localizacao">

                  ⚠️{" "}

                  {

                    erroLocalizacao

                  }

                </div>

              )}

              {enderecoEncontrado && (

                <div className="sucesso-localizacao">

                  ✓ Endereço encontrado

                  <br />

                  <span>

                    {

                      enderecoEncontrado

                    }

                  </span>

                </div>

              )}

              <div className="campos">

                <div className="endereco-grid">

                  <div className="campo">

                    <label>

                      Rua *

                    </label>

                    <input

                      type="text"

                      placeholder="Nome da rua"

                      value={

                        rua

                      }

                      onChange={(

                        event

                      ) =>

                        setRua(

                          event.target

                            .value

                        )

                      }

                    />

                  </div>

                  <div className="campo">

                    <label>

                      Número /

                      referência

                    </label>

                    <input

                      type="text"

                      placeholder="Número"

                      value={

                        numero

                      }

                      onChange={(

                        event

                      ) =>

                        setNumero(

                          event.target

                            .value

                        )

                      }

                    />

                  </div>

                </div>

                <div className="endereco-grid">

                  <div className="campo">

                    <label>

                      Bairro *

                    </label>

                    <input

                      type="text"

                      placeholder="Bairro"

                      value={

                        bairro

                      }

                      onChange={(

                        event

                      ) =>

                        setBairro(

                          event.target

                            .value

                        )

                      }

                    />

                  </div>

                  <div className="campo">

                    <label>

                      Cidade *

                    </label>

                    <input

                      type="text"

                      placeholder="Cidade"

                      value={

                        cidade

                      }

                      onChange={(

                        event

                      ) =>

                        setCidade(

                          event.target

                            .value

                        )

                      }

                    />

                  </div>

                </div>

              </div>

              <div className="mapa-container">

                <Mapa

                  latitude={

                    latitude

                  }

                  longitude={

                    longitude

                  }

                  onSelecionar={

                    selecionarLocalizacao

                  }

                />

              </div>

              {latitude !==

                null &&

                longitude !==

                  null && (

                  <div className="coordenadas">

                    📍 Latitude:{" "}

                    {

                      latitude

                    }

                    {" • "}

                    Longitude:{" "}

                    {

                      longitude

                    }

                  </div>

                )}

              <div className="rodape-formulario">

                <button

                  className="botao-voltar"

                  onClick={

                    voltarEtapa

                  }

                >

                  ← Voltar

                </button>

                <div />

                <button

                  className="botao-principal"

                  onClick={

                    continuarLocalizacao

                  }

                >

                  Continuar →

                </button>

              </div>

            </>

          )}

          {/* =================================================

              ETAPA 5

          ================================================= */}

          {etapa === 5 && (

            <>

              <div className="titulo-etapa">

                <div className="titulo-icone">

                  👤

                </div>

                <div>

                  <h2>

                    Seus dados

                  </h2>

                  <p>

                    Precisamos dessas informações

                    para acompanhar sua solicitação.

                  </p>

                </div>

              </div>

              <div className="privacidade">

                🔒 Seus dados pessoais não

                serão exibidos publicamente.

              </div>

              <div className="campos">

                <div className="campo">

                  <label>

                    Nome completo *

                  </label>

                  <input

                    type="text"

                    placeholder="Digite seu nome"

                    value={

                      nome

                    }

                    onChange={(

                      event

                    ) =>

                      setNome(

                        event.target

                          .value

                      )

                    }

                  />

                </div>

                <div className="campo">

                  <label>

                    Telefone *

                  </label>

                  <input

                    type="tel"

                    placeholder="(11) 99999-9999"

                    value={

                      telefone

                    }

                    onChange={(

                      event

                    ) =>

                      setTelefone(

                        event.target

                          .value

                      )

                    }

                  />

                </div>

                <div className="campo">

                  <label>

                    E-mail *

                  </label>

                  <input

                    type="email"

                    placeholder="seuemail@email.com"

                    value={

                      email

                    }

                    onChange={(

                      event

                    ) =>

                      setEmail(

                        event.target

                          .value

                      )

                    }

                  />

                </div>

              </div>

              <div className="rodape-formulario">

                <button

                  className="botao-voltar"

                  onClick={

                    voltarEtapa

                  }

                >

                  ← Voltar

                </button>

                <div />

                <button

                  className="botao-principal"

                  onClick={

                    continuarIdentificacao

                  }

                >

                  Revisar →

                </button>

              </div>

            </>

          )}

          {/* =================================================

              ETAPA 6

          ================================================= */}

          {etapa === 6 && (

            <>

              <div className="titulo-etapa">

                <div className="titulo-icone">

                  ✅

                </div>

                <div>

                  <h2>

                    Confira sua solicitação

                  </h2>

                  <p>

                    Verifique os dados antes

                    de enviar.

                  </p>

                </div>

              </div>

              {/* CATEGORIA */}

              <div className="revisao-bloco">

                <h3>

                  Categoria

                </h3>

                <div className="revisao-categoria">

                  <span>

                    {

                      categoriaAtual?.icone

                    }

                  </span>

                  <strong>

                    {

                      categoriaSelecionada

                    }

                  </strong>

                </div>

              </div>

              {/* DESCRIÇÃO */}

              <div className="revisao-bloco">

                <h3>

                  Descrição

                </h3>

                <p>

                  {

                    descricao

                  }

                </p>

              </div>

              {/* FOTOS */}

              {fotos.length >

                0 && (

                <div className="revisao-bloco">

                  <h3>

                    Fotos

                  </h3>

                  <div className="fotos-revisao">

                    {fotos.map(

                      (

                        foto,

                        index

                      ) => (

                        <img

                          key={

                            `${foto}-${index}`

                          }

                          src={

                            foto

                          }

                          alt={`Foto ${

                            index +

                            1

                          }`}

                        />

                      )

                    )}

                  </div>

                </div>

              )}

              {/* ENDEREÇO */}

              <div className="revisao-bloco">

                <h3>

                  Localização

                </h3>

                <p>

                  {rua}

                  {numero

                    ? `, ${numero}`

                    : ""}

                  <br />

                  {bairro}

                  <br />

                  {cidade}

                </p>

              </div>

              {/* DADOS */}

              <div className="revisao-bloco">

                <h3>

                  Identificação

                </h3>

                <p>

                  <strong>

                    {nome}

                  </strong>

                  <br />

                  {telefone}

                  <br />

                  {email}

                </p>

              </div>

              <div className="aviso-envio">

                📋 Ao enviar, sua solicitação

                será registrada e receberá um

                número de protocolo para

                acompanhamento.

              </div>

              <div className="rodape-formulario">

                <button

                  className="botao-voltar"

                  onClick={

                    voltarEtapa

                  }

                  disabled={

                    enviando

                  }

                >

                  ← Voltar

                </button>

                <div />

                <button

                  className="botao-principal"

                  onClick={

                    enviarSolicitacao

                  }

                  disabled={

                    enviando

                  }

                >

                  {enviando

                    ? "Enviando..."

                    : "✓ Enviar solicitação"}

                </button>

              </div>

            </>

          )}

        </section>

      </main>

      {/* =================================================

          FOOTER

      ================================================= */}
    <footer className="footer">
      <p>
       NEYghborhood • Participação cidadã
      </p>
      <small>
        Desenvolvido por Bruna Villanova
      </small>
    </footer>

    </div>

  );

}

export default App;