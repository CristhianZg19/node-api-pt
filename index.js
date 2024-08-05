const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Importa el paquete jsonwebtoken

const app = express();

// Configuración de CORS
app.use(cors());
app.use(bodyParser.json());

// Clave secreta para firmar el JWT
const JWT_SECRET = 'clave_secreta_matrix';

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        next();
    });
};

/**
 * Ruta para autenticar y generar un token JWT
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validacion de las credenciales del usuario
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ id: username }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ error: 'Invalid credentials' });
});

/**
 * Calcula las estadísticas de una matriz.
 * @param {number[][]} matrix - La matriz de entrada.
 * @returns {Object} Un objeto con las estadísticas calculadas.
 */
const calculateStatistics = (matrix) => {
    const values = matrix.flat();
    const max = Math.max(...values);
    const min = Math.min(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const isDiagonal = matrix.every((row, i) => row.every((val, j) => i === j || val === 0));
    return { max, min, sum, avg, isDiagonal };
};

// Ruta protegida para calcular estadísticas
app.post('/calculate-statistics', verifyToken, (req, res) => {
    const { matrix } = req.body;
    if (!matrix) {
        return res.status(400).json({ error: 'Matrix is required' });
    }
    const stats = calculateStatistics(matrix);
    res.json(stats);
});

// Inicia el servidor
app.listen(3001, () => {
    console.log('Node API running on port 3001');
});
