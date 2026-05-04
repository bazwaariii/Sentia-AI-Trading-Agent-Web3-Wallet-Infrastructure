"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ChaosSwarmBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, 0.0012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      4000
    );
    camera.position.set(0, 0, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030303, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- LIGHTING ---
    scene.add(new THREE.AmbientLight(0x222222));

    const goldLight = new THREE.DirectionalLight(0xd4af37, 2.5);
    goldLight.position.set(300, 400, 200);
    scene.add(goldLight);

    const fillLight = new THREE.DirectionalLight(0x0044ff, 1.2);
    fillLight.position.set(-300, -200, -200);
    scene.add(fillLight);

    const mouseLight = new THREE.PointLight(0xd4af37, 150000, 1000);
    scene.add(mouseLight);

    // --- INSTANCED CUBES ---
    const count = 5000;
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();

    interface CubeData {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
    }

    const objectData: CubeData[] = [];
    const colorGold = new THREE.Color(0xd4af37);
    const colorDarkMetal = new THREE.Color(0x1a1a1a);

    const boundX = 1500;
    const boundY = 1000;
    const boundZ = 1200;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * boundX * 2;
      const y = (Math.random() - 0.5) * boundY * 2;
      const z = (Math.random() - 0.5) * boundZ * 2;

      const isGold = Math.random() < 0.3;
      instancedMesh.setColorAt(i, isGold ? colorGold : colorDarkMetal);

      objectData.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        vz: (Math.random() - 0.5) * 3,
        rotSpeedX: (Math.random() - 0.5) * 0.05,
        rotSpeedY: (Math.random() - 0.5) * 0.05,
        rotSpeedZ: (Math.random() - 0.5) * 0.05,
      });
    }
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }

    // --- MOUSE INTERACTION ---
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // --- ANIMATION LOOP ---
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Smooth mouse tracking
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Parallax camera
      camera.position.x += (mouse.x * 150 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 150 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Mouse light follows cursor
      const mouseWorldX = mouse.x * 1000;
      const mouseWorldY = mouse.y * 800;
      mouseLight.position.set(mouseWorldX, mouseWorldY, 100);

      // Physics for all cubes
      for (let i = 0; i < count; i++) {
        const d = objectData[i];

        d.x += d.vx;
        d.y += d.vy;
        d.z += d.vz;

        // Bounce off bounds
        if (Math.abs(d.x) > boundX) d.vx *= -1;
        if (Math.abs(d.y) > boundY) d.vy *= -1;
        if (Math.abs(d.z) > boundZ) d.vz *= -1;

        dummy.position.set(d.x, d.y, d.z);

        // Cursor repulsion
        const dx = d.x - mouseWorldX;
        const dy = d.y - mouseWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy + d.z * d.z * 0.1);

        if (dist < 200) {
          const force = (200 - dist) / 200;
          d.x += (dx / dist) * force * 5;
          d.y += (dy / dist) * force * 5;
          d.z -= force * 2;
          dummy.scale.setScalar(1 + force * 1.5);
        } else {
          dummy.scale.setScalar(1);
        }

        // Rotation
        dummy.rotation.x = time * d.rotSpeedX * 30 + i;
        dummy.rotation.y = time * d.rotSpeedY * 30 + i;
        dummy.rotation.z = time * d.rotSpeedZ * 30 + i;

        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
