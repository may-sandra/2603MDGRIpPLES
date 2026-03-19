declare module 'leaflet' {
  namespace L {
    interface LatLngBoundsLiteral {
      [0]: LatLngLiteral
      [1]: LatLngLiteral
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    interface PointTuple {
      [0]: number
      [1]: number
    }

    interface Point {
      x: number
      y: number
      copy(): Point
    }

    interface Icon<T extends IconOptions = IconOptions> {
      options: T
      createIcon(oldIcon?: HTMLElement): HTMLElement
      createShadow(oldIcon?: HTMLElement): HTMLElement
    }

    interface IconOptions {
      iconUrl?: string
      iconRetinaUrl?: string
      iconSize?: PointTuple | Point
      iconAnchor?: PointTuple | Point
      popupAnchor?: PointTuple | Point
      tooltipAnchor?: PointTuple | Point
      shadowUrl?: string
      shadowRetinaUrl?: string
      shadowSize?: PointTuple | Point
      shadowAnchor?: PointTuple | Point
      className?: string
    }
  }
}

export {}
