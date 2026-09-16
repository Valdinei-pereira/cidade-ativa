const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");

require("dotenv").config();

const supabase = require("./supabase");
const { Resend } = require("resend");

const app = express();

const PORT = process.env.PORT || 3001;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "sistema-problemas-chave-super-secreta";

// =====================================================
// CONFIGURAÇÃO DE E-MAIL - RESEND
// =====================================================

const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(cors());

app.use(express.json());

// =====================================================
// PASTA DE UPLOADS
// =====================================================

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// =====================================================
// MULTER - UPLOAD DE FOTOS
// =====================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },

  filename: function (req, file, cb) {
    const extensao = path.extname(file.originalname);

    const nomeArquivo =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extensao;

    cb(null, nomeArquivo);
  },
});

const upload = multer({
  storage,

  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Somente arquivos de imagem são permitidos."
        )
      );
    }
  },
});

// =====================================================
// TESTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    mensagem: "API Cidade Ativa funcionando.",
  });
});

app.get("/api/teste", (req, res) => {
  res.json({
    mensagem: "Backend conectado com sucesso.",
  });
});

// =====================================================
// GERAR PROTOCOLO
// =====================================================

async function gerarProtocolo() {
  let protocolo;
  let existe = true;

  while (existe) {
    const numero = Math.floor(
      100000 + Math.random() * 900000
    );

    protocolo = `PB-${new Date().getFullYear()}-${numero}`;

    const { data, error } = await supabase
      .from("solicitacoes")
      .select("id")
      .eq("protocolo", protocolo)
      .maybeSingle();

    if (error) {
      throw error;
    }

    existe = !!data;
  }

  return protocolo;
}

// =====================================================
// LOGIN ADMIN
// =====================================================

app.post("/api/admin/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    const usuarioCorreto =
      process.env.ADMIN_USUARIO || "admin";

    const senhaCorreta =
      process.env.ADMIN_SENHA || "admin123";

    if (
      usuario !== usuarioCorreto ||
      senha !== senhaCorreta
    ) {
      return res.status(401).json({
        mensagem: "Usuário ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        tipo: "admin",
        usuario,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      mensagem: "Login realizado com sucesso.",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao realizar login.",
    });
  }
});

// =====================================================
// AUTENTICAÇÃO ADMIN
// =====================================================

function autenticarAdmin(req, res, next) {
  try {
    const autorizacao = req.headers.authorization;

    if (!autorizacao) {
      return res.status(401).json({
        mensagem: "Acesso não autorizado.",
      });
    }

    const partes = autorizacao.split(" ");

    if (
      partes.length !== 2 ||
      partes[0] !== "Bearer"
    ) {
      return res.status(401).json({
        mensagem: "Token inválido.",
      });
    }

    const token = partes[1];

    const usuario = jwt.verify(
      token,
      JWT_SECRET
    );

    if (usuario.tipo !== "admin") {
      return res.status(403).json({
        mensagem:
          "Acesso permitido somente para administradores.",
      });
    }

    req.admin = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      mensagem:
        "Sessão administrativa inválida ou expirada.",
    });
  }
}

// =====================================================
// CRIAR SOLICITAÇÃO
// =====================================================

app.post(
  "/api/solicitacoes",
  upload.array("fotos", 5),
  async (req, res) => {
    try {
      const {
        categoria,
        descricao,
        rua,
        numero,
        bairro,
        cidade,
        latitude,
        longitude,
        nome,
        telefone,
        email,
      } = req.body;

      // =====================================================
      // VALIDAÇÕES
      // =====================================================

      if (!categoria) {
        return res.status(400).json({
          mensagem: "Informe a categoria.",
        });
      }

      if (!descricao) {
        return res.status(400).json({
          mensagem: "Informe a descrição.",
        });
      }

      if (!rua) {
        return res.status(400).json({
          mensagem: "Informe a rua.",
        });
      }

      if (!bairro) {
        return res.status(400).json({
          mensagem: "Informe o bairro.",
        });
      }

      if (!cidade) {
        return res.status(400).json({
          mensagem: "Informe a cidade.",
        });
      }

      if (!nome) {
        return res.status(400).json({
          mensagem: "Informe o nome.",
        });
      }

      if (!telefone) {
        return res.status(400).json({
          mensagem: "Informe o telefone.",
        });
      }

      if (!email) {
        return res.status(400).json({
          mensagem: "Informe o e-mail.",
        });
      }

      // =====================================================
      // GERAR PROTOCOLO
      // =====================================================

      const protocolo = await gerarProtocolo();

      // =====================================================
      // FOTOS
      // =====================================================

      const fotos = (req.files || []).map(
        (arquivo) =>
          `/uploads/${arquivo.filename}`
      );

      // =====================================================
      // INSERIR NO SUPABASE
      // =====================================================

      const { error: erroInsercao } =
        await supabase
          .from("solicitacoes")
          .insert({
            protocolo,
            categoria,
            descricao,
            fotos: JSON.stringify(fotos),
            rua,
            numero: numero || "",
            bairro,
            cidade,
            latitude:
              latitude !== undefined &&
              latitude !== ""
                ? Number(latitude)
                : null,
            longitude:
              longitude !== undefined &&
              longitude !== ""
                ? Number(longitude)
                : null,
            nome,
            telefone,
            email,
            status: "RECEBIDO",
          });

      if (erroInsercao) {
        throw erroInsercao;
      }

      // =====================================================
      // ENVIAR E-MAIL PARA O ADMINISTRADOR
      // =====================================================

      try {
        const resultadoEmail =
          await resend.emails.send({
            from:
              "Cidade Ativa <onboarding@resend.dev>",

            to: [
              process.env.EMAIL_DESTINO,
            ],

            subject:
              `Nova solicitação - ${protocolo}`,

            html: `
              <div style="
                font-family: Arial, sans-serif;
                max-width: 700px;
                margin: auto;
                padding: 20px;
              ">

                <h2 style="color: #008f6b;">
                  Nova solicitação recebida
                </h2>

                <p>
                  Uma nova solicitação foi registrada
                  no sistema Cidade Ativa.
                </p>

                <hr>

                <h3>📋 Solicitação</h3>

                <p>
                  <strong>Protocolo:</strong>
                  ${protocolo}
                </p>

                <p>
                  <strong>Categoria:</strong>
                  ${categoria}
                </p>

                <p>
                  <strong>Descrição:</strong><br>
                  ${descricao}
                </p>

                <h3>📍 Localização</h3>

                <p>
                  <strong>Endereço:</strong>
                  ${rua}, ${numero || "S/N"}
                </p>

                <p>
                  <strong>Bairro:</strong>
                  ${bairro}
                </p>

                <p>
                  <strong>Cidade:</strong>
                  ${cidade}
                </p>

                <h3>👤 Dados do morador</h3>

                <p>
                  <strong>Nome:</strong>
                  ${nome}
                </p>

                <p>
                  <strong>Telefone:</strong>
                  ${telefone}
                </p>

                <p>
                  <strong>E-mail:</strong>
                  ${email}
                </p>

                <hr>

                <p>
                  <strong>Status:</strong>
                  Recebido
                </p>

                <p style="color: #666;">
                  Este e-mail foi enviado automaticamente
                  pelo sistema Cidade Ativa.
                </p>

              </div>
            `,
          });

        if (resultadoEmail.error) {
          console.error(
            "Erro ao enviar e-mail:",
            resultadoEmail.error
          );
        } else {
          console.log(
            `E-mail enviado para nova solicitação ${protocolo}`
          );
        }

        console.log(
          "Resposta do Resend:",
          resultadoEmail
        );
      } catch (emailError) {
        console.error(
          "Erro ao enviar e-mail:",
          emailError
        );
      }

      // =====================================================
      // RESPOSTA
      // =====================================================

      return res.status(201).json({
        mensagem:
          "Solicitação registrada com sucesso.",
        protocolo,
        fotos,
        status: "RECEBIDO",
      });

    } catch (error) {
      console.error(
        "Erro ao registrar solicitação:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro ao registrar solicitação.",
      });
    }
  }
);

// =====================================================
// CONSULTA PÚBLICA POR PROTOCOLO
// =====================================================

app.get(
  "/api/solicitacoes/:protocolo",
  async (req, res) => {
    try {
      const { protocolo } = req.params;

      const {
        data: solicitacao,
        error,
      } = await supabase
        .from("solicitacoes")
        .select(`
          id,
          protocolo,
          categoria,
          descricao,
          fotos,
          rua,
          numero,
          bairro,
          cidade,
          latitude,
          longitude,
          status,
          criado_em,
          atualizado_em
        `)
        .eq("protocolo", protocolo)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!solicitacao) {
        return res.status(404).json({
          mensagem:
            "Protocolo não encontrado.",
        });
      }

      return res.json({
        ...solicitacao,

        fotos: solicitacao.fotos
          ? JSON.parse(solicitacao.fotos)
          : [],
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        mensagem:
          "Erro ao consultar protocolo.",
      });
    }
  }
);

// =====================================================
// ADMIN - LISTAR SOLICITAÇÕES
// =====================================================

app.get(
  "/api/admin/solicitacoes",
  autenticarAdmin,
  async (req, res) => {
    try {
      const {
        data: solicitacoes,
        error,
      } = await supabase
        .from("solicitacoes")
        .select("*")
        .order("id", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const resultado =
        solicitacoes.map((item) => ({
          ...item,

          fotos: item.fotos
            ? JSON.parse(item.fotos)
            : [],
        }));

      return res.json({
        solicitacoes: resultado,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        mensagem:
          "Erro ao carregar solicitações.",
      });
    }
  }
);

// =====================================================
// ADMIN - ALTERAR STATUS
// =====================================================

app.put(
  "/api/admin/solicitacoes/:protocolo/status",
  autenticarAdmin,
  async (req, res) => {
    try {
      const { protocolo } = req.params;
      const { status } = req.body;

      const statusPermitidos = [
        "RECEBIDO",
        "EM_ANALISE",
        "EM_ATENDIMENTO",
        "RESOLVIDO",
        "RECUSADO",
      ];

      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({
          mensagem: "Status inválido.",
        });
      }

      const {
        data: solicitacao,
        error,
      } = await supabase
        .from("solicitacoes")
        .update({
          status,
          atualizado_em:
            new Date().toISOString(),
        })
        .eq("protocolo", protocolo)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!solicitacao) {
        return res.status(404).json({
          mensagem:
            "Solicitação não encontrada.",
        });
      }

      return res.json({
        mensagem:
          "Status atualizado com sucesso.",

        solicitacao: {
          ...solicitacao,

          fotos: solicitacao.fotos
            ? JSON.parse(solicitacao.fotos)
            : [],
        },
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        mensagem:
          "Erro ao atualizar status.",
      });
    }
  }
);

// =====================================================
// ERROS DO MULTER
// =====================================================

app.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      return res.status(400).json({
        mensagem:
          "Erro no envio das fotos: " +
          error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        mensagem:
          error.message ||
          "Erro no servidor.",
      });
    }

    next();
  }
);

// =====================================================
// SERVIDOR
// =====================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Servidor rodando na porta ${PORT}`
  );

  console.log(
    "Banco de dados: Supabase"
  );
});