// backend/database.js
const Database = require('better-sqlite3');
const db = new Database('forum.db');

// 启用外键约束，这对于数据一致性很重要
db.exec('PRAGMA foreign_keys = ON;');

// 创建用户表
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0
    )
`);

// 创建留言表
// ON DELETE CASCADE 表示如果用户被删除，他的所有留言也会被自动删除
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
`);

// 创建一个默认管理员账号
// 使用 try...catch 是为了防止因为管理员已存在而导致程序崩溃
try {
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('admin123', 8); // 初始密码 admin123
    const stmt = db.prepare(`INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)`);
    stmt.run('admin', adminPassword, 1);
    console.log('管理员已创建或已存在.');
} catch (error) {
    // 如果错误不是 "UNIQUE constraint failed" (即用户名已存在), 就打印出来
    if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
        console.error('Failed to create admin user:', error);
    }
}

console.log('已连接至 forum 数据库');

module.exports = db;