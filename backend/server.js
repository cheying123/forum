// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.js');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_super_secret_key_for_jwt'; // 强烈建议换成一个更复杂的密钥

app.use(cors());
app.use(express.json());

// 中间件：验证 Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// --- 用户认证 API ---

// 注册
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const stmt = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`);
        const info = stmt.run(username, hashedPassword);
        res.status(201).json({ message: '注册成功', userId: info.lastInsertRowid });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: '用户名已存在' });
        }
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const stmt = db.prepare(`SELECT * FROM users WHERE username = ?`);
        const user = stmt.get(username);

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin === 1 }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin === 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// --- 留言 API ---

// 获取所有留言
app.get('/api/messages', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT m.id, m.content, m.createdAt, u.username, m.userId
            FROM messages m
            JOIN users u ON m.userId = u.id
            ORDER BY m.createdAt DESC
        `);
        const messages = stmt.all();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: '获取留言失败' });
    }
});

// 发布新留言 (需要登录)
app.post('/api/messages', authenticateToken, (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: "留言内容不能为空" });
    }
    
    try {
        const insertStmt = db.prepare(`INSERT INTO messages (content, userId) VALUES (?, ?)`);
        const info = insertStmt.run(content, userId);

        const selectStmt = db.prepare(`
            SELECT m.id, m.content, m.createdAt, u.username, m.userId
            FROM messages m JOIN users u ON m.userId = u.id
            WHERE m.id = ?
        `);
        const newMessage = selectStmt.get(info.lastInsertRowid);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: '发布留言失败' });
    }
});

// 修改留言 (需要登录，且是本人)
app.put('/api/messages/:id', authenticateToken, (req, res) => {
    const { content } = req.body;
    const messageId = req.params.id;
    const userId = req.user.id;

    try {
        const checkStmt = db.prepare(`SELECT userId FROM messages WHERE id = ?`);
        const message = checkStmt.get(messageId);

        if (!message) {
            return res.status(404).json({ message: '留言不存在' });
        }
        if (message.userId !== userId) {
            return res.status(403).json({ message: '无权修改此留言' });
        }

        const updateStmt = db.prepare(`UPDATE messages SET content = ? WHERE id = ?`);
        updateStmt.run(content, messageId);
        res.json({ message: '修改成功' });
    } catch (error) {
        res.status(500).json({ message: '修改失败' });
    }
});

// 删除留言 (本人或管理员)
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;
    const { id: userId, isAdmin } = req.user;

    try {
        const checkStmt = db.prepare(`SELECT userId FROM messages WHERE id = ?`);
        const message = checkStmt.get(messageId);

        if (!message) {
            return res.status(404).json({ message: '留言不存在' });
        }
        if (!isAdmin && message.userId !== userId) {
            return res.status(403).json({ message: '无权删除此留言' });
        }

        const deleteStmt = db.prepare(`DELETE FROM messages WHERE id = ?`);
        deleteStmt.run(messageId);
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在： http://localhost:${PORT}`);
});