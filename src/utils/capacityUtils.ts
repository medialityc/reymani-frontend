/**
 * Tipos de capacidad y sus valores correspondientes
 */
export enum CapacityValue {
  Alta = 1,
  Media = 2,
  Baja = 3
}

/**
 * Opciones de capacidad para mostrar en select
 */
export const capacityOptions = [
  { value: CapacityValue.Alta, label: 'Alta' },
  { value: CapacityValue.Media, label: 'Media' },
  { value: CapacityValue.Baja, label: 'Baja' }
]

/**
 * Convierte un valor numérico de capacidad a su etiqueta correspondiente
 * @param value Valor numérico de capacidad
 * @returns Etiqueta de la capacidad
 */
export const getCapacityLabel = (value: number): string => {
  switch (value) {
    case CapacityValue.Alta:
      return 'Alta'
    case CapacityValue.Media:
      return 'Media'
    case CapacityValue.Baja:
      return 'Baja'
    default:
      return 'N/A'
  }
}
