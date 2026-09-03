const Database = require("better-sqlite3");

const db = new Database("sistema-problemas.db");

/*
========================================
ATIVAR FOREIGN KEYS
========================================
*/

db.pragma("foreign_keys = ON");

/*
========================================
CRIAR TABELA DE SOLICITAÇÕES
========================================
*/

db.exec(`
  CREATE TABLE IF NOT EXISTS solicitacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    protocolo TEXT NOT NULL UNIQUE,

    categoria TEXT NOT NULL,

    descricao TEXT NOT NULL,

    fotos TEXT,

    rua TEXT NOT NULL,

    numero TEXT,

    bairro TEXT NOT NULL,

    cidade TEXT NOT NULL,

    latitude REAL,

    longitude REAL,

    nome TEXT NOT NULL,

    telefone TEXT NOT NULL,

    email TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'RECEBIDO',

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("Banco de dados conectado.");

module.exports = db;