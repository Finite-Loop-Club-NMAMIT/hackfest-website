import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';

export const ZeusBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cloudsRef = useRef<THREE.Mesh[]>([]);
    const flashesRef = useRef<THREE.PointLight[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(new THREE.Color(0x11111f), 1);
        containerRef.current.appendChild(renderer.domElement);
        
        camera.position.z = 5;

        // Basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        scene.fog = new THREE.FogExp2(0x11111f, 0.002);

        const handleResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Create clouds
        const loader = new THREE.TextureLoader();
        loader.load(
            '/cloudTexture.jpg',
            (texture) => {
                const cloudGeo = new THREE.SphereGeometry(370, 400);
                const cloudMaterial = new THREE.MeshLambertMaterial({
                    map: texture,
                    transparent: true,
                    depthWrite: false,
                });

                for (let p = 0; p < 20; p++) {
                    const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
                    cloud.position.set(
                        Math.random() * 800 - 400,
                        500,
                        Math.random() * 500 - 500
                    );
                    cloud.rotation.x = 1.2;
                    cloud.rotation.y = -1;
                    cloud.rotation.z = -70;
                    cloud.material.opacity = 0.6;
                    cloudsRef.current.push(cloud);
                    scene.add(cloud);
                }
            },
            undefined,
            (error) => {
                console.error('Error loading cloud texture:', error);
            }
        );

        // Animation loop
        const animate = () => {
            if (!scene || !camera || !renderer) return;

            // Animate clouds
            cloudsRef.current.forEach(cloud => {
                cloud.rotation.z += 0.001;
            });

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer && containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
                renderer.dispose();
            }
            cloudsRef.current = [];
            flashesRef.current = [];
        };
    }, []);

    return <div ref={containerRef} className="h-screen w-screen" />;
};