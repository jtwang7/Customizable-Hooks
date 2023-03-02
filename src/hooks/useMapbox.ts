import { Mapbox, Scene } from "@antv/l7";
import mapboxgl, { Map, MapboxOptions } from "mapbox-gl";
import { useEffect, useRef } from "react";

/**
 * mapbox 地图自适应缩放
 * @param coordinates 需要缩放的坐标数据集
 * @param mapInstance mapbox 实例
 * @param options 配置项
 */
const mapboxFitBounds =
  (mapInstance: mapboxgl.Map | null) =>
  (
    coordinates: [number, number][],
    options: mapboxgl.FitBoundsOptions = {
      padding: 50,
    }
  ) => {
    if (mapInstance) {
      // Create a 'LngLatBounds' with both corners at the first coordinate.
      const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
      // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
      for (const coord of coordinates) {
        bounds.extend(coord);
      }
      mapInstance.fitBounds(bounds, options);
    }
  };

/**
 * 实例挂载 antv/l7 + mapbox
 * @param containerId 挂载对象 id
 * @param token mapbox token
 * @param config mapbox 配置项
 * @returns
 */
export const useMapbox = (
  containerId: string,
  token: string,
  config: Omit<MapboxOptions, "container"> = {
    style: "mapbox://styles/mapbox/dark-v10",
    center: [114.085947, 22.7],
    zoom: 10,
    pitch: 45,
  }
) => {
  // mapbox 地图实例
  const mapbox = useRef<Map | null>(null);
  // L7 实例
  const scene = useRef<Scene | null>(null);
  useEffect(() => {
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: containerId, ...config });
    mapbox.current = map;
    map.on("load", () => {
      // 移除 mapbox label 标签
      const layers = map.getStyle().layers;
      if (layers) {
        for (let i = 0; i < layers.length; i++) {
          if (/-label$/.test(layers[i].id)) {
            map.removeLayer(layers[i].id);
          }
        }
      }
    });
    // mapbox接入antvL7
    scene.current = new Scene({
      id: containerId,
      map: new Mapbox({
        mapInstance: map,
      }),
      logoVisible: false,
    });

    return () => {
      // 组件销毁的同时，删除实例
      mapbox.current?.remove();
      scene.current?.destroy();
    };
  }, []);

  return {
    mapbox,
    scene,
    fitBounds: mapboxFitBounds(mapbox.current),
  };
};
