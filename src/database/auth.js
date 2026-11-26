import {pool} from './mariadb.js'

export const getAuthUser = async (username) => {
    let conn

    try {
        conn = await pool.getConnection()

        const rows = await conn.query(
            'SELECT username, password FROM auth WHERE username = ? LIMIT 1',
             [username]
        )
        conn.release()
        
        return rows.length > 0 ? rows[0] : null
    } catch (error) {
        if (conn) {
            conn.release()
        }
        throw error
    }
}