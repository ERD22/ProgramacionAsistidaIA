const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS - permite cualquier origen ya que frontend y backend están en el mismo servidor
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Ruta catch-all para SPA - sirve index.html para cualquier ruta que no sea API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/index.html'));
});

// Conexión a Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Conectado a Supabase');

//mi endpoint de prueba
app.get('/api/saludo', (req,res) => {
  res.json('Hola mundo');
});

// POST - Registrar nuevo usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son requeridos' });
    }
    
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    
    // Encriptar password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        { email, password_hash, nombre, apellido }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente',
      usuario: { id: data[0].id, email: data[0].email, nombre: data[0].nombre }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// POST - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son requeridos' });
    }
    
    // Buscar usuario por email
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Verificar password
    const passwordValido = await bcrypt.compare(password, data.password_hash);
    
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    res.json({ 
      mensaje: 'Login exitoso',
      usuario: { id: data.id, email: data.email, nombre: data.nombre }
    });
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ mensaje: 'Error al hacer login' });
  }
});

// GET - Obtener todos los eventos
app.get('/api/eventos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener eventos' });
  }
});

// GET - Obtener evento por ID
app.get('/api/eventos/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener evento' });
  }
});

// POST - Crear nuevo evento
app.post('/api/eventos', async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora } = req.body;
    
    if (!titulo || !fecha) {
      return res.status(400).json({ mensaje: 'Título y fecha son requeridos' });
    }
    
    const { data, error } = await supabase
      .from('eventos')
      .insert([
        { titulo, descripcion: descripcion || '', fecha, hora: hora || '' }
      ])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear evento' });
  }
});

// PUT - Actualizar evento
app.put('/api/eventos/:id', async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora } = req.body;
    
    const { data, error } = await supabase
      .from('eventos')
      .update({ titulo, descripcion, fecha, hora })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar evento' });
  }
});

// DELETE - Eliminar evento
app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ mensaje: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar evento' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
