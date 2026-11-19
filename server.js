const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configuración de PostgreSQL
// En producción (Render) usa DATABASE_URL, en desarrollo usa SQLite-like config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/helpdesk',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Conexión a PostgreSQL
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar con PostgreSQL:', err.message);
  } else {
    console.log('Conectado a PostgreSQL');
    release();
    inicializarBD();
  }
});

// Inicializar tabla de tickets
async function inicializarBD() {
  const sql = `
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      solicitante_nombre TEXT NOT NULL,
      solicitante_correo TEXT NOT NULL,
      solicitante_departamento TEXT NOT NULL,
      categoria TEXT NOT NULL,
      impacto TEXT NOT NULL,
      urgencia TEXT NOT NULL,
      prioridad_calculada TEXT NOT NULL,
      asunto TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      pasos_reproducir TEXT,
      adjunto TEXT,
      estado TEXT NOT NULL DEFAULT 'Abierto',
      fecha_creacion TEXT NOT NULL,
      fecha_actualizacion TEXT NOT NULL
    )
  `;
  
  try {
    await pool.query(sql);
    console.log('Tabla de tickets inicializada correctamente');
  } catch (err) {
    console.error('Error al crear la tabla:', err.message);
  }
}

// API ENDPOINTS

// GET: Obtener todos los tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const sql = 'SELECT * FROM tickets ORDER BY fecha_creacion DESC';
    const result = await pool.query(sql);
    
    // Transformar los datos al formato esperado por el frontend
    const tickets = result.rows.map(row => ({
      id: row.id,
      tipo: row.tipo,
      solicitante: {
        nombre: row.solicitante_nombre,
        correo: row.solicitante_correo,
        departamento: row.solicitante_departamento
      },
      clasificacion: {
        categoria: row.categoria
      },
      prioridad: {
        impacto: row.impacto,
        urgencia: row.urgencia,
        calculada: row.prioridad_calculada
      },
      detalle: {
        asunto: row.asunto,
        descripcion: row.descripcion,
        pasosReproducir: row.pasos_reproducir,
        adjunto: row.adjunto
      },
      estado: row.estado,
      fechaCreacion: row.fecha_creacion,
      fechaActualizacion: row.fecha_actualizacion
    }));
    
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Obtener un ticket por ID
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const sql = 'SELECT * FROM tickets WHERE id = $1';
    const result = await pool.query(sql, [req.params.id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ticket no encontrado' });
      return;
    }
    
    const row = result.rows[0];
    const ticket = {
      id: row.id,
      tipo: row.tipo,
      solicitante: {
        nombre: row.solicitante_nombre,
        correo: row.solicitante_correo,
        departamento: row.solicitante_departamento
      },
      clasificacion: {
        categoria: row.categoria
      },
      prioridad: {
        impacto: row.impacto,
        urgencia: row.urgencia,
        calculada: row.prioridad_calculada
      },
      detalle: {
        asunto: row.asunto,
        descripcion: row.descripcion,
        pasosReproducir: row.pasos_reproducir,
        adjunto: row.adjunto
      },
      estado: row.estado,
      fechaCreacion: row.fecha_creacion,
      fechaActualizacion: row.fecha_actualizacion
    };
    
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Crear un nuevo ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const ticket = req.body;
    
    const sql = `
      INSERT INTO tickets (
        id, tipo, solicitante_nombre, solicitante_correo, solicitante_departamento,
        categoria, impacto, urgencia, prioridad_calculada, asunto, descripcion,
        pasos_reproducir, adjunto, estado, fecha_creacion, fecha_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;
    
    const params = [
      ticket.id,
      ticket.tipo,
      ticket.solicitante.nombre,
      ticket.solicitante.correo,
      ticket.solicitante.departamento,
      ticket.clasificacion.categoria,
      ticket.prioridad.impacto,
      ticket.prioridad.urgencia,
      ticket.prioridad.calculada,
      ticket.detalle.asunto,
      ticket.detalle.descripcion,
      ticket.detalle.pasosReproducir || null,
      ticket.detalle.adjunto || null,
      ticket.estado,
      ticket.fechaCreacion,
      ticket.fechaActualizacion
    ];
    
    await pool.query(sql, params);
    
    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket: ticket
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Actualizar un ticket (cambiar estado)
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const fechaActualizacion = new Date().toISOString();
    
    const sql = `
      UPDATE tickets 
      SET estado = $1, fecha_actualizacion = $2
      WHERE id = $3
    `;
    
    const result = await pool.query(sql, [estado, fechaActualizacion, req.params.id]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Ticket no encontrado' });
      return;
    }
    
    res.json({
      message: 'Ticket actualizado exitosamente',
      estado: estado,
      fechaActualizacion: fechaActualizacion
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Eliminar un ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const sql = 'DELETE FROM tickets WHERE id = $1';
    const result = await pool.query(sql, [req.params.id]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Ticket no encontrado' });
      return;
    }
    
    res.json({ message: 'Ticket eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Obtener contadores para secuencias de IDs
app.get('/api/contadores', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(CASE WHEN tipo = 'Incidente' THEN 1 END) as contador_incidentes,
        COUNT(CASE WHEN tipo = 'Requerimiento' THEN 1 END) as contador_requerimientos
      FROM tickets
    `;
    
    const result = await pool.query(sql);
    const row = result.rows[0];
    
    res.json({
      contadorIncidentes: parseInt(row.contador_incidentes) || 0,
      contadorRequerimientos: parseInt(row.contador_requerimientos) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir el archivo index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Servidor Help Desk ITIL iniciado`);
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
