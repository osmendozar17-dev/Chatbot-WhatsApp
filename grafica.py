import matplotlib.pyplot as plt
import pandas as pd

# Días de la semana
dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

# Datos simulados por día
data = {
    "Tasa_confusion_%":       [8.5, 8.2, 7.9, 8.7, 8.1, 7.4, 7.0],
    "Tasa_automatizacion_%":  [85, 86, 87, 88, 89, 90, 91],
    "Tiempo_resp_seg":        [1.1, 1.0, 0.9, 0.9, 0.8, 0.8, 0.9],
    "Disponibilidad_%":       [99.1, 99.3, 99.5, 99.4, 99.6, 99.4, 99.5],
    "Tiempo_resol_seg":       [16, 15, 14, 13, 14, 13, 12],
    "Conversion_asistida_%":  [24, 25, 26, 28, 29, 30, 32],
}

# Crear DataFrame
df = pd.DataFrame(data, index=dias)

# (Opcional) ver los datos en tabla
print(df)

# Función para crear y guardar gráficos de línea por métrica
def crear_grafico(columna, titulo, eje_y, nombre_archivo):
    plt.figure()
    plt.plot(dias, df[columna], marker="o")
    plt.title(titulo)
    plt.xlabel("Día")
    plt.ylabel(eje_y)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(nombre_archivo)
    plt.close()

# Crear cada gráfico
crear_grafico(
    "Tasa_confusion_%",
    "Tasa de Confusión o Error por Día",
    "Porcentaje (%)",
    "tasa_confusion_por_dia.png"
)

crear_grafico(
    "Tasa_automatizacion_%",
    "Tasa de Automatización por Día",
    "Porcentaje (%)",
    "tasa_automatizacion_por_dia.png"
)

crear_grafico(
    "Tiempo_resp_seg",
    "Tiempo Promedio de Respuesta por Día",
    "Segundos (s)",
    "tiempo_respuesta_por_dia.png"
)

crear_grafico(
    "Disponibilidad_%",
    "Disponibilidad del Chatbot por Día",
    "Porcentaje (%)",
    "disponibilidad_por_dia.png"
)

crear_grafico(
    "Tiempo_resol_seg",
    "Tiempo Promedio de Resolución por Día",
    "Segundos (s)",
    "tiempo_resolucion_por_dia.png"
)

crear_grafico(
    "Conversion_asistida_%",
    "Conversión Comercial Asistida por Día",
    "Porcentaje (%)",
    "conversion_asistida_por_dia.png"
)