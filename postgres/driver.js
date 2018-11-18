// Manages the current running account in PG and provides access to helper functions

const {
  Pool
} = require('pg')

const DB_CONN_STR = 'THE_PG_STRING'

const dbPool = new Pool({
  connectionString: DB_CONN_STR,
  connectionTimeoutMillis: 20000,
  max: 150,
  ssl: true
})

const testConn = async (conStr, client) => {
  console.log(`${new Date()} - TESTING - Testing ${conStr}`)
  await client.connect()
  const {
    rows
  } = await client.query('SELECT NOW()')
  console.log(`${new Date()} - INFO - Response from ${conStr}`, rows)
  await client.end()
}

const buildInsertArray = (arFields, arKeys, arVals, key, val) => {
  // For inserting records
  arFields.push(key)
  arVals.push(val)
  arKeys.push(`$${arVals.length}`)
}

const buildSetArray = (arFields, arVals, key, val) => {
  // For updating records
  arVals.push(val)
  arFields.push(`${key} = $${arVals.length}`)
}

const queryTemplate = async (params) => {
  try {
    const q = {
      text: `SELECT * FROM THE_TABLE ${params ? `WHERE theparam = ${params.something}` : ''}`
    }
    const res = await dbPool.query(q)
    const things = res.rows ? res.rows : []
    return {
      success: true,
      things
    }
  } catch (ex) {
    const error = `${new Date()} - ERROR - Your error message`
    console.error(ex)
    return {
      success: false,
      error 
    }
  }
}

const insertTemplate = async (params) => {
  try {
    const keys = []
    const insert = []
    const values = []

    const { priority, userId, another, username } = params

    // Sample validation
    if (typeof priority === 'number') {
      buildInsertArray(keys, insert, values, 'priority', priority)
    } else {
      // Default
      buildInsertArray(keys, insert, values, 'priority', 0)
    }

    if (!userId) {
      throw new Error('Missing user ID')
    } else {
      buildInsertArray(keys, insert, values, 'user_id', userId)
    }
    
    if (typeof username !== 'string') {
      throw new Error('Missing username')
    } else {
      buildInsertArray(keys, insert, values, 'username', username)
    }

    if (!another || typeof another !== Number) {
      throw new Error('Missing another param')
    } else {
      buildInsertArray(keys, insert, values, 'another', another)
    }

    // Default value without checking, best to keep defaults out of DB
    buildInsertArray(keys, insert, values, 'is_active', true)

    const text = `
      INSERT INTO THE_TABLE
      (${keys.join(', ')})
      VALUES 
      (${insert.join(', ')})
      RETURNING *;
    `

    const q = {
      text,
      values
    }
    const res = await dbPool.query(q)

    return {
      success: true,
      thing: res.rows[0]
    }
  } catch (ex) {
    console.error(`${new Date()} - ERROR - Failed to insert thing`, username, ex)
    return {
      success: false,
      error: ex.message || ex
    }
  }
}

const updateTemplate = async (params) => {
  // Update existing row(s)
  try {
    const keys = []
    const values = []

    const { attributes, name, id } = params

    if (!attributes || typeof attributes !== 'object' || attributes.length === 0) {
      throw new Error('Invalid attributes')
    } else {
      buildSetArray(keys, values, 'attributes', attributes)
    }

    if (!name || typeof name !== 'string' || name.length < 1) {
      throw new Error('Missing name')
    } else {
      buildSetArray(keys, values, 'name', name)
    }

    if (!id || isNaN(Number.parseInt(id, 10))) {
      // Notice how this is required for the ID-based update below
      throw new Error('Missing ID')
    }

    const text = `
      UPDATE THE_TABLE
      SET 
      ${keys.join(', ')}
      WHERE id = ${id}
      returning *;
    `
      
    const q = {
      text,
      values
    }

    const res = await dbPool.query(q)
    const thing = res.rows && res.rows[0]

    return {
      success: true,
      thing
    }
  } catch (ex) {
    console.error(`${new Date()} - ERROR - Failed to add thing`, id, ex)
    return {
      success: false,
      error: ex.message || ex
    }
  }
}

module.exports = {
  theDrivers
}
