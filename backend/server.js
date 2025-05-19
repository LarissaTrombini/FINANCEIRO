const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const PORT = 3000

// Middleware para ler JSON
app.use(bodyParser.json())

const db = new sqlite3.Database('./meubanco.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar no banco', err.message)
  } else {
    console.log('Conectado ao banco SQLite.')
  }
})

// Cria tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT
)`)

// GET todos usuários
app.get('/usuarios', (req, res) => {
  db.all(`SELECT * FROM usuarios`, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message)
      return
    }
    res.json(rows)
  })
})

// GET usuário por id
app.get('/usuarios/:id', (req, res) => {
  const id = req.params.id
  db.get(`SELECT * FROM usuarios WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).send(err.message)
      return
    }
    if (!row) {
      res.status(404).send('Usuário não encontrado')
      return
    }
    res.json(row)
  })
})

// POST criar novo usuário
app.post('/usuarios', (req, res) => {
  const nome = req.body.nome
  if (!nome) {
    res.status(400).send('O campo nome é obrigatório')
    return
  }
  db.run(`INSERT INTO usuarios (nome) VALUES (?)`, [nome], function(err) {
    if (err) {
      res.status(500).send(err.message)
      return
    }
    res.status(201).json({ id: this.lastID, nome })
  })
})

// PUT atualizar usuário
app.put('/usuarios/:id', (req, res) => {
  const id = req.params.id
  const nome = req.body.nome
  if (!nome) {
    res.status(400).send('O campo nome é obrigatório')
    return
  }
  db.run(`UPDATE usuarios SET nome = ? WHERE id = ?`, [nome, id], function(err) {
    if (err) {
      res.status(500).send(err.message)
      return
    }
    if (this.changes === 0) {
      res.status(404).send('Usuário não encontrado')
      return
    }
    res.json({ id, nome })
  })
})

// DELETE usuário
app.delete('/usuarios/:id', (req, res) => {
  const id = req.params.id
  db.run(`DELETE FROM usuarios WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).send(err.message)
      return
    }
    if (this.changes === 0) {
      res.status(404).send('Usuário não encontrado')
      return
    }
    res.sendStatus(204) // sucesso sem conteúdo
  })
})

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
const cors = require('cors')
app.use(cors())