import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Unit } from '../types';
import { Sun, Moon, Layers, Compass, Eye, ShieldCheck } from 'lucide-react';

interface ThreeDBuildingProps {
  units: Unit[];
  onSelectUnit?: (unit: Unit) => void;
}

export const ThreeDBuilding: React.FC<ThreeDBuildingProps> = ({ units, onSelectUnit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFloor, setActiveFloor] = useState<number>(12);
  const [lightingMode, setLightingMode] = useState<'dusk' | 'night' | 'day'>('dusk');
  const [webglError, setWebglError] = useState(false);

  // Filter units for current selected floor
  const floorUnits = units.filter((u) => u.floor === activeFloor);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let towerGroup: THREE.Group;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(lightingMode === 'night' ? 0x06090c : lightingMode === 'dusk' ? 0x0b1017 : 0x182230);
      scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.015);

      const width = container.clientWidth;
      const height = container.clientHeight || 450;

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.set(28, 22, 38);
      camera.lookAt(0, 10, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      // Clear container and append canvas
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(
        lightingMode === 'night' ? 0x24334a : lightingMode === 'dusk' ? 0x6e523f : 0xbed4e6,
        1.2
      );
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(
        lightingMode === 'night' ? 0x88bbff : lightingMode === 'dusk' ? 0xf5b573 : 0xffffff,
        lightingMode === 'night' ? 1.5 : 2.5
      );
      dirLight.position.set(30, 45, 20);
      scene.add(dirLight);

      const accentGoldLight = new THREE.PointLight(0xd4af37, 2, 60);
      accentGoldLight.position.set(0, 12, 10);
      scene.add(accentGoldLight);

      // Base Ground / Water Pool
      const groundGeo = new THREE.PlaneGeometry(120, 120);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x0b1118,
        roughness: 0.2,
        metalness: 0.8,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.1;
      scene.add(ground);

      // Reflective Pool
      const poolGeo = new THREE.CircleGeometry(16, 32);
      const poolMat = new THREE.MeshStandardMaterial({
        color: 0x071e22,
        roughness: 0.05,
        metalness: 0.9,
      });
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.y = 0.05;
      scene.add(pool);

      towerGroup = new THREE.Group();
      scene.add(towerGroup);

      // Podium
      const podiumGeo = new THREE.BoxGeometry(14, 2, 14);
      const podiumMat = new THREE.MeshStandardMaterial({
        color: 0x1b232c,
        roughness: 0.6,
        metalness: 0.4,
      });
      const podium = new THREE.Mesh(podiumGeo, podiumMat);
      podium.position.y = 1;
      towerGroup.add(podium);

      // Build 48-storey tower with segmented floors
      const floorCount = 48;
      const floorHeight = 0.45;
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x1f3448,
        roughness: 0.1,
        transmission: 0.6,
        thickness: 1.2,
        metalness: 0.8,
      });

      const bronzeSlabMat = new THREE.MeshStandardMaterial({
        color: 0x8c7355,
        roughness: 0.4,
        metalness: 0.7,
      });

      const highlightGoldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        emissive: 0x5e4811,
        roughness: 0.2,
        metalness: 0.9,
      });

      for (let f = 1; f <= floorCount; f++) {
        const isHighlight = f === activeFloor;
        const currentMat = isHighlight ? highlightGoldMat : bronzeSlabMat;

        // Setbacks on high floors
        const scale = f > 36 ? 0.7 : f > 20 ? 0.85 : 1.0;
        const width = 8 * scale;
        const depth = 8 * scale;

        // Floor slab
        const slabGeo = new THREE.BoxGeometry(width, 0.08, depth);
        const slab = new THREE.Mesh(slabGeo, currentMat);
        slab.position.y = 2 + f * floorHeight;
        towerGroup.add(slab);

        // Glass curtain perimeter
        if (f % 2 === 0) {
          const glassGeo = new THREE.BoxGeometry(width * 0.96, floorHeight * 0.9, depth * 0.96);
          const glass = new THREE.Mesh(glassGeo, glassMat);
          glass.position.y = 2 + f * floorHeight - floorHeight / 2;
          towerGroup.add(glass);
        }
      }

      // Crown Architecture / Sky Terraces
      const crownGeo = new THREE.CylinderGeometry(1.5, 4.5, 3, 8);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.85,
      });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 2 + floorCount * floorHeight + 1.5;
      towerGroup.add(crown);

      // Helipad
      const heliGeo = new THREE.CylinderGeometry(2, 2, 0.2, 16);
      const heliMat = new THREE.MeshStandardMaterial({ color: 0x222a35 });
      const helipad = new THREE.Mesh(heliGeo, heliMat);
      helipad.position.y = 2 + floorCount * floorHeight + 3.1;
      towerGroup.add(helipad);

      // Simple mouse drag rotation
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;

        towerGroup.rotation.y += deltaX * 0.008;
        camera.position.y = Math.max(5, Math.min(35, camera.position.y - deltaY * 0.05));
        camera.lookAt(0, 10, 0);

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.multiplyScalar(e.deltaY > 0 ? 1.05 : 0.95);
        camera.lookAt(0, 10, 0);
      };

      const domElem = renderer.domElement;
      domElem.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      domElem.addEventListener('wheel', onWheel, { passive: false });

      // Render Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isDragging) {
          towerGroup.rotation.y += 0.0015; // Slow luxury architectural rotation
        }
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight || 450;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        domElem.removeEventListener('mousedown', onMouseDown);
        domElem.removeEventListener('wheel', onWheel);
        renderer.dispose();
      };
    } catch (err) {
      console.error('WebGL 3D visualizer initialization error:', err);
      setWebglError(true);
    }
  }, [activeFloor, lightingMode]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-[#070B0E] border border-[#1E293B]">
      {/* 3D Canvas or Fallback */}
      {webglError ? (
        <div className="h-[450px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0F1722] to-[#080C11]">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="font-cinzel text-lg text-[#F3F4F6] font-semibold mb-1">
            OCTA Luminar Sky Residences · Architectural Model
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-md">
            Interactive 3D WebGL renderer operating in optimized architectural rendering mode.
          </p>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-[450px] cursor-grab active:cursor-grabbing" />
      )}

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#0B0F12]/85 backdrop-blur-md border border-[#2A3749] px-3 py-1.5 rounded pointer-events-auto">
          <div className="text-[10px] uppercase font-cinzel tracking-wider text-[#D4AF37]">
            OCTA Luminar Sky Residences
          </div>
          <div className="text-xs text-[#E2E8F0] font-medium flex items-center gap-2">
            <span>48 Storeys · Downtown Dubai</span>
            <span className="text-[#64748B]">·</span>
            <span className="text-emerald-400 font-mono text-[11px]">Real-Time Model</span>
          </div>
        </div>

        {/* Lighting Mode Selector */}
        <div className="flex items-center gap-1 bg-[#0B0F12]/85 backdrop-blur-md border border-[#2A3749] p-1 rounded pointer-events-auto text-xs">
          <button
            onClick={() => setLightingMode('dusk')}
            className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              lightingMode === 'dusk' ? 'bg-[#D4AF37] text-[#0B0F12] font-semibold' : 'text-[#94A3B8] hover:text-[#F3F4F6]'
            }`}
          >
            Dusk
          </button>
          <button
            onClick={() => setLightingMode('night')}
            className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              lightingMode === 'night' ? 'bg-[#D4AF37] text-[#0B0F12] font-semibold' : 'text-[#94A3B8] hover:text-[#F3F4F6]'
            }`}
          >
            <Moon className="w-3 h-3" />
            Night
          </button>
          <button
            onClick={() => setLightingMode('day')}
            className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              lightingMode === 'day' ? 'bg-[#D4AF37] text-[#0B0F12] font-semibold' : 'text-[#94A3B8] hover:text-[#F3F4F6]'
            }`}
          >
            <Sun className="w-3 h-3" />
            Day
          </button>
        </div>
      </div>

      {/* Floor Slicing Bar & Inspection */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
        {/* Floor Selection Pills */}
        <div className="flex items-center gap-1.5 bg-[#0B0F12]/90 backdrop-blur-md border border-[#2A3749] p-1.5 rounded pointer-events-auto overflow-x-auto text-xs">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider px-2 font-mono flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#D4AF37]" /> Floor:
          </span>
          {[8, 12, 14, 24, 36, 48].map((floorNum) => (
            <button
              key={floorNum}
              onClick={() => setActiveFloor(floorNum)}
              className={`px-2.5 py-1 rounded transition-colors font-mono cursor-pointer ${
                activeFloor === floorNum
                  ? 'bg-[#D4AF37] text-[#0B0F12] font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]'
              }`}
            >
              L{floorNum}
            </button>
          ))}
        </div>

        {/* Units on Highlighted Floor Floating Widget */}
        {floorUnits.length > 0 && (
          <div className="bg-[#0B0F12]/95 backdrop-blur-md border border-[#D4AF37]/40 p-2.5 rounded pointer-events-auto flex items-center gap-3">
            <div>
              <div className="text-[10px] text-[#94A3B8] uppercase font-mono">
                Level {activeFloor} Units ({floorUnits.length})
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {floorUnits.map((u) => {
                  const color =
                    u.status === 'Available'
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                      : u.status === 'Reserved'
                      ? 'border-amber-500 text-amber-400 bg-amber-950/40'
                      : 'border-[#475569] text-[#94A3B8] bg-[#1E293B]/40';

                  return (
                    <button
                      key={u.id}
                      onClick={() => onSelectUnit && onSelectUnit(u)}
                      className={`px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer transition-all hover:scale-105 ${color}`}
                    >
                      {u.unitNumber} ({u.status})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
