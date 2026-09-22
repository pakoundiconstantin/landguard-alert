import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Layer } from "leaflet";
import { STATUTS_PARCELLE } from "@/lib/domaine";

export interface ParcelleCarto {
  id: string;
  code_parcelle: string;
  reference_cadastrale: string;
  commune: string;
  prefecture: string;
  proprietaire: string | null;
  statut: string;
  latitude: number;
  longitude: number;
  geometrie: unknown;
}

interface Props {
  parcelles: ParcelleCarto[];
  parcelleActive?: string | null;
  onSelection?: (id: string) => void;
  hauteur?: string;
}

/** Carte interactive Leaflet (fond OpenStreetMap) — rendue uniquement côté navigateur. */
export function CarteParcelles({ parcelles, parcelleActive, onSelection, hauteur = "70vh" }: Props) {
  const conteneur = useRef<HTMLDivElement | null>(null);
  const carte = useRef<LeafletMap | null>(null);
  const couches = useRef<Layer[]>([]);
  const selection = useRef(onSelection);
  selection.current = onSelection;

  useEffect(() => {
    let annule = false;

    void (async () => {
      const L = await import("leaflet");
      if (annule || !conteneur.current) return;

      if (!carte.current) {
        carte.current = L.map(conteneur.current, { zoomControl: true }).setView([6.35, 1.3], 9);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(carte.current);
      }

      const map = carte.current;
      couches.current.forEach((c) => map.removeLayer(c));
      couches.current = [];

      const limites: [number, number][] = [];

      parcelles.forEach((p) => {
        const couleur = STATUTS_PARCELLE[p.statut]?.couleur ?? "#2f6f52";
        const geo = p.geometrie as { type?: string; coordinates?: number[][][] } | null;
        const popup = `
          <div style="font-family:inherit;min-width:190px">
            <strong>${p.code_parcelle}</strong><br/>
            <span style="color:#555">${p.reference_cadastrale}</span><br/>
            <span style="color:#555">${p.commune} — ${p.prefecture}</span><br/>
            <span style="color:#555">${p.proprietaire ?? "Propriétaire non renseigné"}</span><br/>
            <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;background:${couleur};color:#fff;font-size:11px">
              ${STATUTS_PARCELLE[p.statut]?.label ?? p.statut}
            </span>
          </div>`;

        let couche: Layer;
        if (geo?.coordinates?.[0]) {
          const points = geo.coordinates[0].map(
            ([lng, lat]) => [lat, lng] as [number, number],
          );
          points.forEach((pt) => limites.push(pt));
          couche = L.polygon(points, {
            color: couleur,
            weight: p.id === parcelleActive ? 4 : 2,
            fillColor: couleur,
            fillOpacity: p.id === parcelleActive ? 0.55 : 0.3,
          });
        } else {
          limites.push([p.latitude, p.longitude]);
          couche = L.circleMarker([p.latitude, p.longitude], {
            radius: 8,
            color: couleur,
            fillColor: couleur,
            fillOpacity: 0.6,
          });
        }

        couche.bindPopup(popup);
        couche.on("click", () => selection.current?.(p.id));
        couche.addTo(map);
        couches.current.push(couche);
      });

      if (limites.length > 0) {
        const active = parcelles.find((p) => p.id === parcelleActive);
        if (active) map.setView([active.latitude, active.longitude], 15);
        else map.fitBounds(L.latLngBounds(limites).pad(0.2));
      }

      setTimeout(() => map.invalidateSize(), 120);
    })();

    return () => {
      annule = true;
    };
  }, [parcelles, parcelleActive]);

  useEffect(() => {
    return () => {
      carte.current?.remove();
      carte.current = null;
    };
  }, []);

  return (
    <div
      ref={conteneur}
      style={{ height: hauteur }}
      className="w-full overflow-hidden rounded-lg border border-border"
    />
  );
}
