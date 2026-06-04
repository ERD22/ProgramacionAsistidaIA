# Documentación del Data Warehouse - Inscripciones Académicas

## Descripción General

Este documento describe la arquitectura del Data Warehouse para el sistema de inscripciones académicas, implementando un esquema estrella (star schema) para optimizar consultas analíticas.

## Diagrama de Arquitectura

```mermaid
graph TB
    %% Estilos Generales
    classDef fuentes fill:#1f618d,stroke:#114b70,stroke-width:2px,color:#fff;
    classDef proceso fill:#115e59,stroke:#0f4c48,stroke-width:2px,color:#fff;
    classDef hechos fill:#1f618d,stroke:#114b70,stroke-width:2px,color:#fff;
    classDef dimensiones fill:#1a5276,stroke:#114b70,stroke-width:1px,color:#fff;
    classDef contenedor stroke:#e67e22,stroke-width:3px,stroke-dasharray: 0,fill:none;

    %% 1. Capa de Fuentes de Origen (Mismo Nivel)
    subgraph Fuentes ["Fuentes de Origen"]
        F1["<h3>Fuente 1: Control Escolar</h3><hr>• Estudiante<br>• Programa<br>• Periodo académico<br>• Estatus académico"]
        F2["<h3>Fuente 2: Finanzas</h3><hr>• Pagos de inscripción<br>• Colegiaturas<br>• Becas<br>• Fechas de pago"]
        F3["<h3>Fuente 3: Recursos Humanos</h3><hr>• Docente<br>• Asignatura<br>• Asignación Docente"]
    end
    class F1,F2,F3 fuentes;

    %% 2. Proceso de Transformación
    ETL["(↻ ETL ↻)"]
    class ETL proceso;

    %% Conexiones de Fuentes al ETL
    F1 --> ETL
    F2 --> ETL
    F3 --> ETL

    %% 3. Capa de Data Warehouse (Contenedor Naranja)
    subgraph DW ["Datawarehouse"]
        %% Tabla de Hechos (Centro)
        Fact["<h2>Hechos_Inscripciones</h2><hr><b>Métricas:</b><br>• total_inscritos<br>• ingreso_total<br>• monto_becas"]
        class Fact hechos;

        %% Dimensiones Alrededor
        D_Tiempo["<h3>Dim_Tiempo</h3><hr>• id_tiempo (PK)<br>• anio, semestre, periodo<br>• fecha_inicio, fecha_fin"]
        D_Programa["<h3>Dim_Programa</h3><hr>• id_programa (PK)<br>• nombre_programa, nivel<br>• area, facultad, duracion"]
        D_Estudiante["<h3>Dim_Estudiante</h3><hr>• id_estudiante (PK)<br>• rango_edad, genero<br>• estatus_academico"]
        D_Ubicacion["<h3>Dim_Ubicacion</h3><hr>• id_ubicacion (PK)<br>• municipio, estado<br>• region, pais"]
        D_Finanzas["<h3>Dim_Finanzas</h3><hr>• id_finanzas (PK)<br>• tipo_pago, concepto, monto<br>• fecha_pago, aplica_beca"]

        class D_Tiempo,D_Programa,D_Estudiante,D_Ubicacion,D_Finanzas dimensiones;

        %% Relaciones del Esquema Estrella (Desde el centro a la periferia según tu bosquejo)
        Fact --> D_Tiempo
        Fact --> D_Programa
        Fact --> D_Estudiante
        Fact --> D_Ubicacion
        Fact --> D_Finanzas
    end
    class DW contenedor;

    %% Conexión del ETL al Data Warehouse
    ETL --> Fact
```

## Arquitectura del Sistema

### 1. Fuentes de Origen

El sistema integra datos de tres fuentes principales:

#### Fuente 1: Control Escolar
- **Estudiante**: Información demográfica y académica
- **Programa**: Detalles de los programas educativos
- **Periodo académico**: Calendarios y fechas importantes
- **Estatus académico**: Estado actual del estudiante

#### Fuente 2: Finanzas
- **Pagos de inscripción**: Registro de pagos iniciales
- **Colegiaturas**: Pagos periódicos
- **Becas**: Información de apoyos financieros
- **Fechas de pago**: Cronograma de pagos

#### Fuente 3: Recursos Humanos
- **Docente**: Información del personal docente
- **Asignatura**: Detalles de las materias
- **Asignación Docente**: Relación docente-asignatura

### 2. Proceso ETL (Extract, Transform, Load)

El proceso ETL:
1. **Extrae** datos de las tres fuentes de origen
2. **Transforma** los datos para limpiar, estandarizar y enriquecer
3. **Carga** los datos transformados en el Data Warehouse

### 3. Data Warehouse - Esquema Estrella

#### Tabla de Hechos: Hechos_Inscripciones

Tabla central que contiene las métricas cuantitativas:

| Campo | Descripción | Tipo |
|-------|-------------|------|
| total_inscritos | Número total de estudiantes inscritos | Numérico |
| ingreso_total | Suma de ingresos por inscripciones | Monetario |
| monto_becas | Total de becas otorgadas | Monetario |

#### Dimensiones

##### Dim_Tiempo
Permite análisis temporales de las inscripciones.

| Campo | Descripción |
|-------|-------------|
| id_tiempo (PK) | Identificador único |
| anio | Año académico |
| semestre | Semestre (1 o 2) |
| periodo | Periodo específico |
| fecha_inicio | Fecha de inicio del periodo |
| fecha_fin | Fecha de fin del periodo |

##### Dim_Programa
Información sobre los programas educativos.

| Campo | Descripción |
|-------|-------------|
| id_programa (PK) | Identificador único |
| nombre_programa | Nombre del programa |
| nivel | Nivel educativo (licenciatura, maestría, etc.) |
| area | Área de conocimiento |
| facultad | Facultad o escuela |
| duracion | Duración en semestres |

##### Dim_Estudiante
Datos demográficos y académicos de los estudiantes.

| Campo | Descripción |
|-------|-------------|
| id_estudiante (PK) | Identificador único |
| rango_edad | Rango de edad del estudiante |
| genero | Género |
| estatus_academico | Estado académico actual |

##### Dim_Ubicacion
Información geográfica de los estudiantes.

| Campo | Descripción |
|-------|-------------|
| id_ubicacion (PK) | Identificador único |
| municipio | Municipio de residencia |
| estado | Estado/provincia |
| region | Región geográfica |
| pais | País |

##### Dim_Finanzas
Detalles financieros de las inscripciones.

| Campo | Descripción |
|-------|-------------|
| id_finanzas (PK) | Identificador único |
| tipo_pago | Método de pago |
| concepto | Concepto del pago |
| monto | Monto del pago |
| fecha_pago | Fecha del pago |
| aplica_beca | Indicador de aplicación de beca |

## Ventajas del Esquema Estrella

1. **Simplicidad**: Fácil de entender y navegar
2. **Rendimiento**: Consultas más rápidas al minimizar joins
3. **Mantenimiento**: Más sencillo de mantener que esquemas copo de nieve
4. **Escalabilidad**: Facilidad para agregar nuevas dimensiones

## Consultas de Ejemplo

### Total de inscritos por programa
```sql
SELECT p.nombre_programa, SUM(h.total_inscritos) as total
FROM Hechos_Inscripciones h
JOIN Dim_Programa p ON h.id_programa = p.id_programa
GROUP BY p.nombre_programa;
```

### Ingresos por semestre
```sql
SELECT t.anio, t.semestre, SUM(h.ingreso_total) as ingresos
FROM Hechos_Inscripciones h
JOIN Dim_Tiempo t ON h.id_tiempo = t.id_tiempo
GROUP BY t.anio, t.semestre;
```

### Becas por región
```sql
SELECT u.region, SUM(h.monto_becas) as total_becas
FROM Hechos_Inscripciones h
JOIN Dim_Ubicacion u ON h.id_ubicacion = u.id_ubicacion
GROUP BY u.region;
```

## Consideraciones de Implementación

- **Actualización**: El proceso ETL debe ejecutarse periódicamente (diario/semanal)
- **Calidad de datos**: Implementar validaciones durante la transformación
- **Índices**: Crear índices en las claves foráneas para optimizar consultas
- **Particionamiento**: Considerar particionar la tabla de hechos por tiempo
