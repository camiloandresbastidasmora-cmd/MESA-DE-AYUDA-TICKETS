const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Directorio para la base de datos (persistente en Render)
const dataDir = process.env.RENDER ? '/data' : __dirname;
const dbPath = path.join(dataDir, 'helpdesk.db');

// Asegurar que el directorio existe
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Conexión a SQLite (se crea automáticamente si no existe)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite en:', dbPath);
        inicializarBD();
    }
});

// Inicializar tabla de tickets
function inicializarBD() {
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
    
    db.run(sql, (err) => {
        if (err) {
            console.error('Error al crear la tabla:', err.message);
        } else {
            console.log('Tabla de tickets inicializada correctamente');
        }
    });
}

// API ENDPOINTS

// GET: Obtener todos los tickets
app.get('/api/tickets', (req, res) => {
    const sql = 'SELECT * FROM tickets ORDER BY fecha_creacion DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Transformar los datos al formato esperado por el frontend
        const tickets = rows.map(row => ({
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
    });
});

// GET: Obtener un ticket por ID
app.get('/api/tickets/:id', (req, res) => {
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Ticket no encontrado' });
            return;
        }
        
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
    });
});

// POST: Crear un nuevo ticket
app.post('/api/tickets', (req, res) => {
    const ticket = req.body;
    
    const sql = `
        INSERT INTO tickets (
            id, tipo, solicitante_nombre, solicitante_correo, solicitante_departamento,
            categoria, impacto, urgencia, prioridad_calculada, asunto, descripcion,
            pasos_reproducir, adjunto, estado, fecha_creacion, fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.status(201).json({
            message: 'Ticket creado exitosamente',
            ticket: ticket
        });
    });
});

// PUT: Actualizar un ticket (cambiar estado)
app.put('/api/tickets/:id', (req, res) => {
    const { estado } = req.body;
    const fechaActualizacion = new Date().toISOString();
    
    const sql = `
        UPDATE tickets 
        SET estado = ?, fecha_actualizacion = ?
        WHERE id = ?
    `;
    
    db.run(sql, [estado, fechaActualizacion, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Ticket no encontrado' });
            return;
        }
        
        res.json({
            message: 'Ticket actualizado exitosamente',
            estado: estado,
            fechaActualizacion: fechaActualizacion
        });
    });
});

// DELETE: Eliminar un ticket
app.delete('/api/tickets/:id', (req, res) => {
    const sql = 'DELETE FROM tickets WHERE id = ?';
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Ticket no encontrado' });
            return;
        }
        
        res.json({ message: 'Ticket eliminado exitosamente' });
    });
});

// GET: Obtener contadores para secuencias de IDs
app.get('/api/contadores', (req, res) => {
    const sql = `
        SELECT 
            COUNT(CASE WHEN tipo = 'Incidente' THEN 1 END) as contador_incidentes,
            COUNT(CASE WHEN tipo = 'Requerimiento' THEN 1 END) as contador_requerimientos
        FROM tickets
    `;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({
            contadorIncidentes: row.contador_incidentes || 0,
            contadorRequerimientos: row.contador_requerimientos || 0
        });
    });
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
