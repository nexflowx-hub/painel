// Type declarations for third-party modules without @types packages

declare module 'react-simple-maps' {
  import { type ComponentType, type ReactNode } from 'react';

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      center?: [number, number];
      scale?: number;
      rotation?: [number, number, number];
    };
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeographyProps {
    geography: GeoJSON.Feature;
    key?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  interface GeographiesProps {
    geography: string;
    children: (args: { geographies: GeoJSON.Feature[] }) => ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Geographies: ComponentType<GeographiesProps>;
}

declare module 'd3-geo' {
  import { type GeoProjection } from 'd3-geo';
  export function geoMercator(): GeoProjection;
}
