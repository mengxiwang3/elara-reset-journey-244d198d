# Solicitud: datos de `day_feedback` (solo lectura)

*Request for someone with production D1 access. I have not run these queries: there is no database access from this environment. Nothing here writes data.*

**Para qué:** sirve de contexto real junto a la ronda con participantes. Muestra cómo responden hoy las usuarias de la app a «¿Te sirvió la sesión de hoy?», por área y día. **No** mide el prototipo de siete sesiones, que no escribe en la base de datos.

**Fuente:** tabla `day_feedback` (migración `0056_day_feedback.sql`), base D1 `elara-db` (binding `DB`). `answer` ∈ `yes` · `little` · `no`. `reasons` es una lista JSON de `point` · `generic` · `long` · `wording` · `language` · `other`, y solo existe si la respuesta es `little` o `no`. `created_at` está en ms.

**Cómo correrlo:** `wrangler d1 execute elara-db --remote --file=consulta.sql`, o desde el panel de admin: `GET /api/admin/day-feedback?format=csv` ya exporta la tabla.

**Antes de correrlo, rellena:**
- `:desde` y `:hasta`: fechas en ms. Ejemplo: los últimos 30 días.
- La lista de cuentas internas o de prueba que hay que excluir (`user_id NOT IN (...)`). Yo no la conozco.

### 1. Respuestas por área y día, con denominador

```sql
SELECT area, day,
       COUNT(*)                                   AS n_total,
       SUM(answer = 'yes')                        AS n_yes,
       SUM(answer = 'little')                     AS n_little,
       SUM(answer = 'no')                         AS n_no,
       COUNT(DISTINCT user_id)                    AS n_personas
FROM day_feedback
WHERE created_at BETWEEN :desde AND :hasta
  -- AND user_id NOT IN ('...cuentas internas...')
GROUP BY area, day
ORDER BY area, day;
```

### 2. Motivos cuando la respuesta es «un poco» o «no»

```sql
SELECT f.area, f.day, f.answer, j.value AS reason, COUNT(*) AS n
FROM day_feedback f, json_each(f.reasons) j
WHERE f.answer IN ('little','no')
  AND f.created_at BETWEEN :desde AND :hasta
GROUP BY f.area, f.day, f.answer, j.value
ORDER BY f.area, f.day, n DESC;
-- Denominador: n_little + n_no de la consulta 1 para esa área y día.
```

### 3. Por plataforma y build (para separar efectos de versión)

```sql
SELECT platform, build, answer, COUNT(*) AS n
FROM day_feedback
WHERE created_at BETWEEN :desde AND :hasta
GROUP BY platform, build, answer
ORDER BY platform, build, answer;
```

### 4. Segunda respuesta al mismo día (un día repetido)

```sql
SELECT area, day, COUNT(*) AS n_filas, COUNT(DISTINCT user_id) AS n_personas
FROM day_feedback
WHERE created_at BETWEEN :desde AND :hasta
GROUP BY area, day
HAVING COUNT(*) > COUNT(DISTINCT user_id);
```

### 5. Notas escritas (`note`): solo si hay permiso

`note` contiene sus propias palabras. **No exportes `note` junto con `user_id`.** Si el equipo decide leerlas, sácalas sin identificador y solo dentro del periodo:

```sql
SELECT area, day, answer, note
FROM day_feedback
WHERE note IS NOT NULL AND TRIM(note) <> ''
  AND created_at BETWEEN :desde AND :hasta
ORDER BY area, day;
```

**Al informar:** usa «n de N» por área y día. No calcules significancia con números pequeños y no compares días con menos de 5 respuestas.
